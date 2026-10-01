import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AssignmentAction,
  AssignmentStatus,
  AssignmentType,
  BookingAssignment,
  BookingStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import {
  DeliveryPartnerAssignmentQueryDto,
  OperationsAssignmentQueryDto,
  ProviderAssignmentQueryDto,
} from './dto/assignment-query.dto';
import {
  AssignmentAuditEventType,
  AssignmentErrorCode,
} from './types/assignment.types';

export interface CreateAssignmentData {
  organizationId: string;
  bookingId: string;
  providerId?: string;
  deliveryPartnerId?: string;
  type: AssignmentType;
  notes?: string;
  actorUserId?: string;
}

export interface ReassignAssignmentData {
  organizationId: string;
  assignmentId: string;
  newProviderId?: string;
  newDeliveryPartnerId?: string;
  reason: string;
  notes?: string;
  actorUserId?: string;
}

@Injectable()
export class AssignmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates next sequential public assignment ID for organization: ASN-YYYY-NNNNNN
   */
  async generateNextPublicId(
    organizationId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<string> {
    const client = tx || this.prisma;
    const year = new Date().getFullYear();
    const prefix = `ASN-${year}-`;

    const latest = await client.bookingAssignment.findFirst({
      where: {
        organizationId,
        publicId: { startsWith: prefix },
      },
      orderBy: { publicId: 'desc' },
      select: { publicId: true },
    });

    let nextSeq = 1;
    if (latest?.publicId) {
      const parts = latest.publicId.split('-');
      const parsed = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(parsed)) {
        nextSeq = parsed + 1;
      }
    }

    return `${prefix}${String(nextSeq).padStart(6, '0')}`;
  }

  /**
   * Atomically creates a new assignment with history and updates booking state if required.
   */
  async createAssignmentWithTransaction(data: CreateAssignmentData) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Check if booking exists in organization
      const booking = await tx.booking.findFirst({
        where: { id: data.bookingId, organizationId: data.organizationId },
        include: { schedule: true },
      });

      if (!booking) {
        throw new NotFoundException({
          code: AssignmentErrorCode.BOOKING_NOT_FOUND,
          message: 'Booking not found in organization',
        });
      }

      if (
        booking.status === BookingStatus.CANCELLED ||
        booking.status === BookingStatus.COMPLETED
      ) {
        throw new BadRequestException({
          code: AssignmentErrorCode.BOOKING_NOT_ASSIGNABLE,
          message: `Booking in ${booking.status} state cannot receive assignments`,
        });
      }

      // 2. Prevent duplicate active assignment of the same type for this booking
      const existingActive = await tx.bookingAssignment.findFirst({
        where: {
          organizationId: data.organizationId,
          bookingId: data.bookingId,
          type: data.type,
          status: {
            in: [
              AssignmentStatus.PENDING,
              AssignmentStatus.ASSIGNED,
              AssignmentStatus.ACCEPTED,
              AssignmentStatus.IN_TRANSIT,
              AssignmentStatus.ARRIVED,
            ],
          },
        },
      });

      if (existingActive) {
        throw new ConflictException({
          code: AssignmentErrorCode.ASSIGNMENT_ALREADY_EXISTS,
          message: `Booking already has an active ${data.type} assignment (${existingActive.publicId})`,
        });
      }

      // 3. Generate public ID
      const publicId = await this.generateNextPublicId(
        data.organizationId,
        tx,
      );

      // 4. Create Assignment record
      const assignment = await tx.bookingAssignment.create({
        data: {
          publicId,
          bookingId: data.bookingId,
          organizationId: data.organizationId,
          providerId: data.providerId || null,
          deliveryPartnerId: data.deliveryPartnerId || null,
          type: data.type,
          status: AssignmentStatus.ASSIGNED,
          notes: data.notes || null,
          assignedAt: new Date(),
        },
      });

      // 5. Create initial AssignmentHistory record
      await tx.assignmentHistory.create({
        data: {
          assignmentId: assignment.id,
          organizationId: data.organizationId,
          action: AssignmentAction.OFFERED,
          actorUserId: data.actorUserId || null,
          details: data.notes || 'Assignment offered',
        },
      });

      // 6. Update booking status and provider link if applicable
      if (data.type === AssignmentType.PROVIDER && data.providerId) {
        const updatePayload: Prisma.BookingUpdateInput = {
          provider: { connect: { id: data.providerId } },
        };

        if (booking.status === BookingStatus.PENDING) {
          updatePayload.status = BookingStatus.CONFIRMED;

          // Add booking status history
          await tx.bookingStatusHistory.create({
            data: {
              bookingId: booking.id,
              organizationId: data.organizationId,
              fromStatus: BookingStatus.PENDING,
              toStatus: BookingStatus.CONFIRMED,
              changedByUserId: data.actorUserId,
              reason: `Provider assigned (${publicId})`,
            },
          });
        }

        await tx.booking.update({
          where: { id: booking.id },
          data: updatePayload,
        });
      }

      return assignment;
    });
  }

  /**
   * Atomically reassigns an existing assignment to a new provider or delivery partner.
   */
  async reassignWithTransaction(data: ReassignAssignmentData) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Fetch current assignment
      const current = await tx.bookingAssignment.findFirst({
        where: {
          id: data.assignmentId,
          organizationId: data.organizationId,
        },
        include: { booking: true },
      });

      if (!current) {
        throw new NotFoundException({
          code: AssignmentErrorCode.ASSIGNMENT_NOT_FOUND,
          message: 'Assignment not found',
        });
      }

      // 2. Validate current assignment can be reassigned
      if (
        current.status === AssignmentStatus.CANCELLED ||
        current.status === AssignmentStatus.COMPLETED ||
        current.status === AssignmentStatus.REJECTED
      ) {
        throw new BadRequestException({
          code: AssignmentErrorCode.REASSIGNMENT_NOT_ALLOWED,
          message: `Cannot reassign an assignment in terminal status '${current.status}'`,
        });
      }

      // 3. Cancel current assignment
      await tx.bookingAssignment.update({
        where: { id: current.id },
        data: {
          status: AssignmentStatus.CANCELLED,
          cancelledAt: new Date(),
        },
      });

      // 4. Create reassignment history for previous assignment
      await tx.assignmentHistory.create({
        data: {
          assignmentId: current.id,
          organizationId: data.organizationId,
          action: AssignmentAction.REASSIGNED,
          actorUserId: data.actorUserId || null,
          details: `Reassigned: ${data.reason}`,
        },
      });

      // 5. Generate new assignment public ID
      const newPublicId = await this.generateNextPublicId(
        data.organizationId,
        tx,
      );

      // 6. Create new assignment record
      const newAssignment = await tx.bookingAssignment.create({
        data: {
          publicId: newPublicId,
          bookingId: current.bookingId,
          organizationId: data.organizationId,
          providerId:
            current.type === AssignmentType.PROVIDER
              ? data.newProviderId
              : current.providerId,
          deliveryPartnerId:
            current.type !== AssignmentType.PROVIDER
              ? data.newDeliveryPartnerId
              : current.deliveryPartnerId,
          type: current.type,
          status: AssignmentStatus.ASSIGNED,
          notes:
            data.notes ||
            `Reassigned from ${current.publicId}. Reason: ${data.reason}`,
          assignedAt: new Date(),
        },
      });

      // 7. Create history entry for new assignment
      await tx.assignmentHistory.create({
        data: {
          assignmentId: newAssignment.id,
          organizationId: data.organizationId,
          action: AssignmentAction.CREATED,
          actorUserId: data.actorUserId || null,
          details: `Created via reassignment from ${current.publicId}`,
        },
      });

      // 8. If provider was reassigned, update booking providerId
      if (current.type === AssignmentType.PROVIDER && data.newProviderId) {
        await tx.booking.update({
          where: { id: current.bookingId },
          data: { providerId: data.newProviderId },
        });
      }

      return newAssignment;
    });
  }

  /**
   * Updates assignment status with state machine enforcement and creates history.
   */
  async updateAssignmentStatus(params: {
    assignmentId: string;
    organizationId: string;
    targetStatus: AssignmentStatus;
    action: AssignmentAction;
    actorUserId?: string;
    reason?: string;
    allowedFromStatuses: AssignmentStatus[];
  }) {
    return this.prisma.$transaction(async (tx) => {
      const assignment = await tx.bookingAssignment.findFirst({
        where: {
          id: params.assignmentId,
          organizationId: params.organizationId,
        },
      });

      if (!assignment) {
        throw new NotFoundException({
          code: AssignmentErrorCode.ASSIGNMENT_NOT_FOUND,
          message: 'Assignment not found',
        });
      }

      if (!params.allowedFromStatuses.includes(assignment.status)) {
        throw new BadRequestException({
          code: AssignmentErrorCode.ASSIGNMENT_STATUS_INVALID,
          message: `Cannot transition assignment from status '${assignment.status}' to '${params.targetStatus}'`,
        });
      }

      const updateData: Prisma.BookingAssignmentUpdateInput = {
        status: params.targetStatus,
      };

      if (params.targetStatus === AssignmentStatus.ACCEPTED) {
        updateData.acceptedAt = new Date();
      } else if (params.targetStatus === AssignmentStatus.CANCELLED) {
        updateData.cancelledAt = new Date();
      } else if (params.targetStatus === AssignmentStatus.COMPLETED) {
        updateData.completedAt = new Date();
      }

      const updated = await tx.bookingAssignment.update({
        where: { id: assignment.id },
        data: updateData,
      });

      await tx.assignmentHistory.create({
        data: {
          assignmentId: assignment.id,
          organizationId: params.organizationId,
          action: params.action,
          actorUserId: params.actorUserId || null,
          details: params.reason || `Status updated to ${params.targetStatus}`,
        },
      });

      return updated;
    });
  }

  /**
   * Updates assignment details (such as operational notes).
   */
  async updateAssignmentDetails(
    assignmentId: string,
    organizationId: string,
    notes?: string,
  ) {
    return this.prisma.bookingAssignment.update({
      where: { id: assignmentId },
      data: { notes },
    });
  }

  /**
   * Query Operations Assignments with pagination and multi-dimensional filters.
   */
  async findOperationsAssignments(
    organizationId: string,
    options: OperationsAssignmentQueryDto,
  ) {
    const where: Prisma.BookingAssignmentWhereInput = { organizationId };

    if (options.type) {
      where.type = options.type;
    }
    if (options.status) {
      where.status = options.status;
    }
    if (options.providerId) {
      where.provider = {
        OR: [{ id: options.providerId }, { publicId: options.providerId }],
      };
    }
    if (options.deliveryPartnerId) {
      where.deliveryPartner = {
        OR: [
          { id: options.deliveryPartnerId },
          { publicId: options.deliveryPartnerId },
        ],
      };
    }
    if (options.bookingId) {
      where.booking = {
        OR: [
          { id: options.bookingId },
          { bookingNumber: options.bookingId },
        ],
      };
    }
    if (options.dateFrom || options.dateTo) {
      where.assignedAt = {};
      if (options.dateFrom) {
        where.assignedAt.gte = new Date(options.dateFrom);
      }
      if (options.dateTo) {
        const toDate = new Date(options.dateTo);
        toDate.setUTCHours(23, 59, 59, 999);
        where.assignedAt.lte = toDate;
      }
    }

    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.bookingAssignment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { assignedAt: 'desc' },
        include: {
          booking: {
            select: {
              id: true,
              bookingNumber: true,
              status: true,
              scheduledAt: true,
              totalAmount: true,
              currency: true,
            },
          },
          provider: {
            select: {
              id: true,
              publicId: true,
              businessName: true,
              fullName: true,
              phone: true,
            },
          },
          deliveryPartner: {
            select: {
              id: true,
              publicId: true,
              fullName: true,
              phone: true,
              vehicleType: true,
            },
          },
        },
      }),
      this.prisma.bookingAssignment.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  /**
   * Find single assignment by UUID or public ID with complete relation graph.
   */
  async findAssignmentById(assignmentIdentifier: string, organizationId: string) {
    return this.prisma.bookingAssignment.findFirst({
      where: {
        organizationId,
        OR: [
          { id: assignmentIdentifier },
          { publicId: assignmentIdentifier },
        ],
      },
      include: {
        booking: {
          include: {
            items: true,
            schedule: true,
            address: true,
            service: true,
            customer: true,
          },
        },
        provider: true,
        deliveryPartner: true,
        history: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  /**
   * Provider-scoped list query with pagination and filters.
   */
  async findProviderAssignments(
    providerId: string,
    organizationId: string,
    options: ProviderAssignmentQueryDto,
  ) {
    const where: Prisma.BookingAssignmentWhereInput = {
      organizationId,
      providerId,
    };

    if (options.status) {
      where.status = options.status;
    }
    if (options.dateFrom || options.dateTo) {
      where.assignedAt = {};
      if (options.dateFrom) {
        where.assignedAt.gte = new Date(options.dateFrom);
      }
      if (options.dateTo) {
        const toDate = new Date(options.dateTo);
        toDate.setUTCHours(23, 59, 59, 999);
        where.assignedAt.lte = toDate;
      }
    }

    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.bookingAssignment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { assignedAt: 'desc' },
        include: {
          booking: {
            include: {
              items: true,
              schedule: true,
            },
          },
        },
      }),
      this.prisma.bookingAssignment.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  /**
   * Delivery-Partner-scoped list query with pagination and filters.
   */
  async findDeliveryPartnerAssignments(
    deliveryPartnerId: string,
    organizationId: string,
    options: DeliveryPartnerAssignmentQueryDto,
  ) {
    const where: Prisma.BookingAssignmentWhereInput = {
      organizationId,
      deliveryPartnerId,
    };

    if (options.status) {
      where.status = options.status;
    }
    if (options.dateFrom || options.dateTo) {
      where.assignedAt = {};
      if (options.dateFrom) {
        where.assignedAt.gte = new Date(options.dateFrom);
      }
      if (options.dateTo) {
        const toDate = new Date(options.dateTo);
        toDate.setUTCHours(23, 59, 59, 999);
        where.assignedAt.lte = toDate;
      }
    }

    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.bookingAssignment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { assignedAt: 'desc' },
        include: {
          booking: {
            include: {
              address: true,
              schedule: true,
            },
          },
        },
      }),
      this.prisma.bookingAssignment.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  /**
   * Fetch immutable history timeline for an assignment.
   */
  async findAssignmentHistory(assignmentId: string, organizationId: string) {
    return this.prisma.assignmentHistory.findMany({
      where: {
        assignmentId,
        organizationId,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Non-blocking Audit Trail Event Creation.
   */
  async logAuditEvent(
    organizationId: string,
    action: AssignmentAuditEventType,
    assignmentId: string,
    actorUserId?: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      await this.prisma.auditEvent.create({
        data: {
          organizationId,
          actorUserId,
          action,
          entityType: 'BookingAssignment',
          entityId: assignmentId,
          metadataJson: metadata ? (metadata as Prisma.InputJsonValue) : undefined,
        },
      });
    } catch {
      // Non-blocking logging failure
    }
  }
}
