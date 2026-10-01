import { Injectable } from '@nestjs/common';
import {
  DisputeOutcome,
  DisputeParticipantType,
  DisputeStatus,
  DisputeType,
  Prisma,
  SupportCategory,
  SupportPriority,
  SupportRequesterType,
  SupportStatus,
} from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import {
  DisputeListQueryDto,
  SupportTicketListQueryDto,
} from '../dto';
import {
  DisputeResolutionType,
  SupportAuditAction,
} from '../types/support.types';

@Injectable()
export class SupportRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // 1. PUBLIC ID GENERATION
  // ============================================================================

  async generateTicketPublicId(organizationId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.supportTicket.count({
      where: { organizationId },
    });
    const seq = (count + 1).toString().padStart(6, '0');
    return `SUP-${year}-${seq}`;
  }

  async generateDisputePublicId(organizationId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.dispute.count({
      where: { organizationId },
    });
    const seq = (count + 1).toString().padStart(6, '0');
    return `DSP-${year}-${seq}`;
  }

  async generateMessagePublicId(organizationId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.supportMessage.count({
      where: { organizationId },
    });
    const seq = (count + 1).toString().padStart(6, '0');
    return `MSG-${year}-${seq}`;
  }

  async generateDisputeMessagePublicId(organizationId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.disputeMessage.count({
      where: { organizationId },
    });
    const seq = (count + 1).toString().padStart(6, '0');
    return `DMSG-${year}-${seq}`;
  }

  async generateEvidencePublicId(organizationId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.disputeEvidence.count({
      where: { organizationId },
    });
    const seq = (count + 1).toString().padStart(6, '0');
    return `EVD-${year}-${seq}`;
  }

  // ============================================================================
  // 2. SUPPORT TICKET DATA ACCESS
  // ============================================================================

  async createTicketTx(data: {
    organizationId: string;
    requesterType: SupportRequesterType;
    createdByUserId: string;
    customerId?: string | null;
    providerId?: string | null;
    deliveryPartnerId?: string | null;
    bookingId?: string | null;
    paymentId?: string | null;
    category: SupportCategory;
    priority?: SupportPriority;
    subject: string;
    description: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const publicId = await this.generateTicketPublicId(data.organizationId);

      const ticket = await tx.supportTicket.create({
        data: {
          publicId,
          organizationId: data.organizationId,
          requesterType: data.requesterType,
          createdByUserId: data.createdByUserId,
          customerId: data.customerId ?? null,
          providerId: data.providerId ?? null,
          deliveryPartnerId: data.deliveryPartnerId ?? null,
          bookingId: data.bookingId ?? null,
          paymentId: data.paymentId ?? null,
          category: data.category,
          priority: data.priority ?? SupportPriority.MEDIUM,
          status: SupportStatus.OPEN,
          subject: data.subject,
          description: data.description,
        },
        include: {
          customer: true,
          provider: true,
          deliveryPartner: true,
          booking: true,
          payment: true,
          createdByUser: true,
          assignedToUser: true,
        },
      });

      // Record initial activity
      await tx.supportTicketActivity.create({
        data: {
          ticketId: ticket.id,
          organizationId: data.organizationId,
          actorUserId: data.createdByUserId,
          action: 'TICKET_CREATED',
          newValue: SupportStatus.OPEN,
          metadata: {
            category: data.category,
            priority: ticket.priority,
            subject: data.subject,
          },
        },
      });

      // Audit event
      await tx.auditEvent.create({
        data: {
          organizationId: data.organizationId,
          actorUserId: data.createdByUserId,
          action: SupportAuditAction.SUPPORT_TICKET_CREATED,
          entityType: 'SupportTicket',
          entityId: ticket.id,
          metadataJson: {
            publicId: ticket.publicId,
            category: ticket.category,
            priority: ticket.priority,
            requesterType: ticket.requesterType,
          },
        },
      });

      return ticket;
    });
  }

  async findTicketByIdentifier(
    organizationId: string,
    identifier: string,
  ) {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        identifier,
      );

    return this.prisma.supportTicket.findFirst({
      where: {
        organizationId,
        OR: [
          { id: isUuid ? identifier : undefined },
          { publicId: identifier },
        ],
      },
      include: {
        customer: true,
        provider: true,
        deliveryPartner: true,
        booking: true,
        payment: true,
        createdByUser: true,
        assignedToUser: true,
        _count: {
          select: {
            messages: true,
            notes: true,
          },
        },
      },
    });
  }

  async listTicketsPaged(
    organizationId: string,
    query: SupportTicketListQueryDto,
    requesterFilter?: {
      customerId?: string;
      providerId?: string;
      deliveryPartnerId?: string;
      createdByUserId?: string;
    },
  ) {
    const where: Prisma.SupportTicketWhereInput = {
      organizationId,
    };

    if (requesterFilter) {
      if (requesterFilter.customerId) {
        where.customerId = requesterFilter.customerId;
      }
      if (requesterFilter.providerId) {
        where.providerId = requesterFilter.providerId;
      }
      if (requesterFilter.deliveryPartnerId) {
        where.deliveryPartnerId = requesterFilter.deliveryPartnerId;
      }
      if (requesterFilter.createdByUserId) {
        where.createdByUserId = requesterFilter.createdByUserId;
      }
    }

    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.category) where.category = query.category;
    if (query.assignedTo) where.assignedToUserId = query.assignedTo;
    if (query.createdBy) where.createdByUserId = query.createdBy;

    if (query.customer) {
      where.customer = {
        OR: [
          { id: query.customer },
          { publicId: query.customer },
        ],
      };
    }
    if (query.provider) {
      where.provider = {
        OR: [
          { id: query.provider },
          { publicId: query.provider },
        ],
      };
    }
    if (query.deliveryPartner) {
      where.deliveryPartner = {
        OR: [
          { id: query.deliveryPartner },
          { publicId: query.deliveryPartner },
        ],
      };
    }
    if (query.booking) {
      where.booking = {
        OR: [
          { id: query.booking },
          { bookingNumber: query.booking },
        ],
      };
    }

    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) where.createdAt.gte = new Date(query.from);
      if (query.to) where.createdAt.lte = new Date(query.to);
    }

    if (query.search) {
      const s = query.search.trim();
      where.OR = [
        { publicId: { contains: s, mode: 'insensitive' } },
        { subject: { contains: s, mode: 'insensitive' } },
      ];
    }

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    // Sorting: default URGENT/HIGH first, then oldest
    let orderBy: Prisma.SupportTicketOrderByWithRelationInput[] = [];
    if (query.sortBy === 'priority') {
      orderBy = [
        { priority: query.sortOrder ?? 'desc' },
        { createdAt: 'asc' },
      ];
    } else if (query.sortBy === 'createdAt') {
      orderBy = [{ createdAt: query.sortOrder ?? 'desc' }];
    } else if (query.sortBy === 'updatedAt') {
      orderBy = [{ updatedAt: query.sortOrder ?? 'desc' }];
    } else {
      orderBy = [{ createdAt: 'desc' }];
    }

    const [items, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: {
          customer: true,
          provider: true,
          deliveryPartner: true,
          booking: true,
          payment: true,
          createdByUser: true,
          assignedToUser: true,
          _count: {
            select: {
              messages: true,
              notes: true,
            },
          },
        },
      }),
      this.prisma.supportTicket.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async updateTicketStatus(
    organizationId: string,
    ticketId: string,
    newStatus: SupportStatus,
    previousStatus: SupportStatus,
    actorUserId: string,
    metadata?: Record<string, any>,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const updateData: Prisma.SupportTicketUpdateInput = {
        status: newStatus,
      };

      if (newStatus === SupportStatus.RESOLVED) {
        updateData.resolvedAt = new Date();
      } else if (newStatus === SupportStatus.CLOSED) {
        updateData.closedAt = new Date();
      } else if (newStatus === SupportStatus.REOPENED) {
        updateData.closedAt = null;
      }

      const updated = await tx.supportTicket.update({
        where: { id: ticketId },
        data: updateData,
        include: {
          customer: true,
          provider: true,
          deliveryPartner: true,
          booking: true,
          payment: true,
          assignedToUser: true,
          createdByUser: true,
        },
      });

      let activityAction = 'STATUS_CHANGED';
      if (newStatus === SupportStatus.ESCALATED) activityAction = 'ESCALATED';
      else if (newStatus === SupportStatus.RESOLVED) activityAction = 'RESOLVED';
      else if (newStatus === SupportStatus.CLOSED) activityAction = 'CLOSED';
      else if (newStatus === SupportStatus.REOPENED) activityAction = 'REOPENED';

      await tx.supportTicketActivity.create({
        data: {
          ticketId,
          organizationId,
          actorUserId,
          action: activityAction,
          previousValue: previousStatus,
          newValue: newStatus,
          metadata: metadata ?? undefined,
        },
      });

      let auditAction = SupportAuditAction.SUPPORT_PRIORITY_CHANGED;
      if (newStatus === SupportStatus.ESCALATED) auditAction = SupportAuditAction.SUPPORT_ESCALATED;
      else if (newStatus === SupportStatus.RESOLVED) auditAction = SupportAuditAction.SUPPORT_RESOLVED;
      else if (newStatus === SupportStatus.CLOSED) auditAction = SupportAuditAction.SUPPORT_CLOSED;
      else if (newStatus === SupportStatus.REOPENED) auditAction = SupportAuditAction.SUPPORT_REOPENED;

      await tx.auditEvent.create({
        data: {
          organizationId,
          actorUserId,
          action: auditAction,
          entityType: 'SupportTicket',
          entityId: ticketId,
          metadataJson: {
            previousStatus,
            newStatus,
            metadata,
          },
        },
      });

      return updated;
    });
  }

  async assignTicket(
    organizationId: string,
    ticketId: string,
    assigneeUserId: string | null,
    previousAssigneeId: string | null,
    actorUserId: string,
    reason?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.supportTicket.findUnique({
        where: { id: ticketId },
        select: { status: true },
      });

      const updated = await tx.supportTicket.update({
        where: { id: ticketId },
        data: {
          assignedToUserId: assigneeUserId,
          status:
            assigneeUserId && current?.status === SupportStatus.OPEN
              ? SupportStatus.IN_PROGRESS
              : undefined,
        },
        include: {
          customer: true,
          provider: true,
          deliveryPartner: true,
          booking: true,
          payment: true,
          assignedToUser: true,
          createdByUser: true,
        },
      });

      const action = assigneeUserId ? 'ASSIGNED' : 'UNASSIGNED';

      await tx.supportTicketActivity.create({
        data: {
          ticketId,
          organizationId,
          actorUserId,
          action,
          previousValue: previousAssigneeId ?? null,
          newValue: assigneeUserId ?? null,
          metadata: reason ? { reason } : undefined,
        },
      });

      await tx.auditEvent.create({
        data: {
          organizationId,
          actorUserId,
          action:
            assigneeUserId
              ? SupportAuditAction.SUPPORT_ASSIGNED
              : SupportAuditAction.SUPPORT_UNASSIGNED,
          entityType: 'SupportTicket',
          entityId: ticketId,
          metadataJson: {
            previousAssigneeId,
            newAssigneeId: assigneeUserId,
            reason,
          },
        },
      });

      return updated;
    });
  }

  async updateTicketPriority(
    organizationId: string,
    ticketId: string,
    newPriority: SupportPriority,
    previousPriority: SupportPriority,
    actorUserId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.supportTicket.update({
        where: { id: ticketId },
        data: { priority: newPriority },
        include: {
          customer: true,
          provider: true,
          deliveryPartner: true,
          booking: true,
          payment: true,
          assignedToUser: true,
          createdByUser: true,
        },
      });

      await tx.supportTicketActivity.create({
        data: {
          ticketId,
          organizationId,
          actorUserId,
          action: 'PRIORITY_CHANGED',
          previousValue: previousPriority,
          newValue: newPriority,
        },
      });

      await tx.auditEvent.create({
        data: {
          organizationId,
          actorUserId,
          action: SupportAuditAction.SUPPORT_PRIORITY_CHANGED,
          entityType: 'SupportTicket',
          entityId: ticketId,
          metadataJson: {
            previousPriority,
            newPriority,
          },
        },
      });

      return updated;
    });
  }

  async resolveTicket(
    organizationId: string,
    ticketId: string,
    resolutionNote: string,
    previousStatus: SupportStatus,
    actorUserId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.supportTicket.update({
        where: { id: ticketId },
        data: {
          status: SupportStatus.RESOLVED,
          resolvedAt: new Date(),
          resolutionNote,
        },
        include: {
          customer: true,
          provider: true,
          deliveryPartner: true,
          booking: true,
          payment: true,
          assignedToUser: true,
          createdByUser: true,
        },
      });

      await tx.supportTicketActivity.create({
        data: {
          ticketId,
          organizationId,
          actorUserId,
          action: 'RESOLVED',
          previousValue: previousStatus,
          newValue: SupportStatus.RESOLVED,
          metadata: { resolutionNote },
        },
      });

      await tx.auditEvent.create({
        data: {
          organizationId,
          actorUserId,
          action: SupportAuditAction.SUPPORT_RESOLVED,
          entityType: 'SupportTicket',
          entityId: ticketId,
          metadataJson: {
            previousStatus,
            resolutionNote,
          },
        },
      });

      return updated;
    });
  }

  async getTicketActivities(organizationId: string, ticketId: string) {
    return this.prisma.supportTicketActivity.findMany({
      where: { organizationId, ticketId },
      orderBy: { createdAt: 'desc' },
      include: {
        actorUser: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }

  // ============================================================================
  // 3. SUPPORT MESSAGES & NOTES
  // ============================================================================

  async createSupportMessage(data: {
    organizationId: string;
    ticketId: string;
    senderUserId: string;
    message: string;
    isInternal: boolean;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const publicId = await this.generateMessagePublicId(data.organizationId);

      const msg = await tx.supportMessage.create({
        data: {
          publicId,
          organizationId: data.organizationId,
          ticketId: data.ticketId,
          senderUserId: data.senderUserId,
          message: data.message,
          isInternal: data.isInternal,
        },
        include: {
          senderUser: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      await tx.supportTicketActivity.create({
        data: {
          ticketId: data.ticketId,
          organizationId: data.organizationId,
          actorUserId: data.senderUserId,
          action: 'MESSAGE_ADDED',
          newValue: msg.publicId,
          metadata: { isInternal: data.isInternal },
        },
      });

      await tx.auditEvent.create({
        data: {
          organizationId: data.organizationId,
          actorUserId: data.senderUserId,
          action: SupportAuditAction.SUPPORT_MESSAGE_CREATED,
          entityType: 'SupportMessage',
          entityId: msg.id,
          metadataJson: {
            ticketId: data.ticketId,
            publicId: msg.publicId,
            isInternal: data.isInternal,
          },
        },
      });

      return msg;
    });
  }

  async listSupportMessages(
    organizationId: string,
    ticketId: string,
    includeInternal: boolean,
  ) {
    const where: Prisma.SupportMessageWhereInput = {
      organizationId,
      ticketId,
    };

    if (!includeInternal) {
      where.isInternal = false;
    }

    return this.prisma.supportMessage.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: {
        senderUser: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }

  async createSupportNote(data: {
    organizationId: string;
    ticketId: string;
    authorUserId: string;
    message: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const note = await tx.supportNote.create({
        data: {
          organizationId: data.organizationId,
          ticketId: data.ticketId,
          authorUserId: data.authorUserId,
          message: data.message,
          isInternalOnly: true,
        },
        include: {
          authorUser: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      await tx.supportTicketActivity.create({
        data: {
          ticketId: data.ticketId,
          organizationId: data.organizationId,
          actorUserId: data.authorUserId,
          action: 'NOTE_ADDED',
          newValue: note.id,
        },
      });

      await tx.auditEvent.create({
        data: {
          organizationId: data.organizationId,
          actorUserId: data.authorUserId,
          action: SupportAuditAction.SUPPORT_NOTE_CREATED,
          entityType: 'SupportNote',
          entityId: note.id,
          metadataJson: {
            ticketId: data.ticketId,
          },
        },
      });

      return note;
    });
  }

  async listSupportNotes(organizationId: string, ticketId: string) {
    return this.prisma.supportNote.findMany({
      where: {
        organizationId,
        ticketId,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        authorUser: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }

  // ============================================================================
  // 4. DISPUTES DATA ACCESS
  // ============================================================================

  async findActiveDisputeForBooking(
    organizationId: string,
    bookingId: string,
    customerId?: string | null,
    providerId?: string | null,
    deliveryPartnerId?: string | null,
  ) {
    const activeStatuses: DisputeStatus[] = [
      DisputeStatus.OPEN,
      DisputeStatus.UNDER_REVIEW,
      DisputeStatus.WAITING_FOR_CUSTOMER,
      DisputeStatus.WAITING_FOR_PROVIDER,
      DisputeStatus.WAITING_FOR_DELIVERY_PARTNER,
      DisputeStatus.EVIDENCE_REQUESTED,
      DisputeStatus.DECISION_PENDING,
      DisputeStatus.ESCALATED,
      DisputeStatus.REOPENED,
    ];

    const where: Prisma.DisputeWhereInput = {
      organizationId,
      bookingId,
      status: { in: activeStatuses },
    };

    if (customerId) where.customerId = customerId;
    if (providerId) where.providerId = providerId;
    if (deliveryPartnerId) where.deliveryPartnerId = deliveryPartnerId;

    return this.prisma.dispute.findFirst({ where });
  }

  async createDisputeTx(data: {
    organizationId: string;
    bookingId: string;
    ticketId?: string | null;
    paymentId?: string | null;
    createdByUserId: string;
    raisedByType: DisputeParticipantType;
    customerId?: string | null;
    providerId?: string | null;
    deliveryPartnerId?: string | null;
    type: DisputeType;
    priority?: SupportPriority;
    claimAmount?: Prisma.Decimal | null;
    currency?: string;
    reason: string;
    description: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const publicId = await this.generateDisputePublicId(data.organizationId);

      const dispute = await tx.dispute.create({
        data: {
          publicId,
          organizationId: data.organizationId,
          bookingId: data.bookingId,
          ticketId: data.ticketId ?? null,
          paymentId: data.paymentId ?? null,
          createdByUserId: data.createdByUserId,
          raisedByType: data.raisedByType,
          customerId: data.customerId ?? null,
          providerId: data.providerId ?? null,
          deliveryPartnerId: data.deliveryPartnerId ?? null,
          type: data.type,
          priority: data.priority ?? SupportPriority.HIGH,
          status: DisputeStatus.OPEN,
          claimAmount: data.claimAmount ?? null,
          currency: data.currency ?? 'INR',
          reason: data.reason,
          description: data.description,
        },
        include: {
          booking: true,
          payment: true,
          customer: true,
          provider: true,
          deliveryPartner: true,
          ticket: true,
          createdByUser: true,
          assignedToUser: true,
        },
      });

      // If originating from ticket, record support ticket activity
      if (data.ticketId) {
        await tx.supportTicketActivity.create({
          data: {
            ticketId: data.ticketId,
            organizationId: data.organizationId,
            actorUserId: data.createdByUserId,
            action: 'DISPUTE_CREATED',
            newValue: dispute.publicId,
            metadata: { disputeId: dispute.id },
          },
        });

        await tx.auditEvent.create({
          data: {
            organizationId: data.organizationId,
            actorUserId: data.createdByUserId,
            action: SupportAuditAction.SUPPORT_DISPUTE_CREATED,
            entityType: 'SupportTicket',
            entityId: data.ticketId,
            metadataJson: {
              disputeId: dispute.id,
              disputePublicId: dispute.publicId,
            },
          },
        });
      }

      // Initial dispute activity
      await tx.disputeActivity.create({
        data: {
          disputeId: dispute.id,
          organizationId: data.organizationId,
          actorUserId: data.createdByUserId,
          action: 'DISPUTE_CREATED',
          newValue: DisputeStatus.OPEN,
          details: 'Dispute formally opened.',
          metadata: {
            type: data.type,
            claimAmount: data.claimAmount ? data.claimAmount.toString() : null,
            ticketId: data.ticketId,
          },
        },
      });

      // Audit event
      await tx.auditEvent.create({
        data: {
          organizationId: data.organizationId,
          actorUserId: data.createdByUserId,
          action: SupportAuditAction.DISPUTE_CREATED,
          entityType: 'Dispute',
          entityId: dispute.id,
          metadataJson: {
            publicId: dispute.publicId,
            bookingId: dispute.bookingId,
            type: dispute.type,
            claimAmount: dispute.claimAmount ? dispute.claimAmount.toString() : null,
          },
        },
      });

      return dispute;
    });
  }

  async findDisputeByIdentifier(
    organizationId: string,
    identifier: string,
  ) {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        identifier,
      );

    return this.prisma.dispute.findFirst({
      where: {
        organizationId,
        OR: [
          { id: isUuid ? identifier : undefined },
          { publicId: identifier },
        ],
      },
      include: {
        booking: true,
        payment: true,
        customer: true,
        provider: true,
        deliveryPartner: true,
        ticket: true,
        createdByUser: true,
        assignedToUser: true,
        _count: {
          select: {
            evidence: true,
            messages: true,
          },
        },
      },
    });
  }

  async listDisputesPaged(
    organizationId: string,
    query: DisputeListQueryDto,
    participantFilter?: {
      customerId?: string;
      providerId?: string;
      deliveryPartnerId?: string;
      createdByUserId?: string;
    },
  ) {
    const where: Prisma.DisputeWhereInput = {
      organizationId,
    };

    if (participantFilter) {
      if (participantFilter.customerId) {
        where.customerId = participantFilter.customerId;
      }
      if (participantFilter.providerId) {
        where.providerId = participantFilter.providerId;
      }
      if (participantFilter.deliveryPartnerId) {
        where.deliveryPartnerId = participantFilter.deliveryPartnerId;
      }
      if (participantFilter.createdByUserId) {
        where.createdByUserId = participantFilter.createdByUserId;
      }
    }

    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.category) where.type = query.category;
    if (query.assignedTo) where.assignedToUserId = query.assignedTo;

    if (query.customer) {
      where.customer = {
        OR: [
          { id: query.customer },
          { publicId: query.customer },
        ],
      };
    }
    if (query.provider) {
      where.provider = {
        OR: [
          { id: query.provider },
          { publicId: query.provider },
        ],
      };
    }
    if (query.deliveryPartner) {
      where.deliveryPartner = {
        OR: [
          { id: query.deliveryPartner },
          { publicId: query.deliveryPartner },
        ],
      };
    }
    if (query.booking) {
      where.booking = {
        OR: [
          { id: query.booking },
          { bookingNumber: query.booking },
        ],
      };
    }
    if (query.payment) {
      where.payment = {
        OR: [
          { id: query.payment },
          { publicId: query.payment },
        ],
      };
    }

    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) where.createdAt.gte = new Date(query.from);
      if (query.to) where.createdAt.lte = new Date(query.to);
    }

    if (query.search) {
      const s = query.search.trim();
      where.OR = [
        { publicId: { contains: s, mode: 'insensitive' } },
        { reason: { contains: s, mode: 'insensitive' } },
      ];
    }

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    let orderBy: Prisma.DisputeOrderByWithRelationInput[] = [];
    if (query.sortBy === 'priority') {
      orderBy = [
        { priority: query.sortOrder ?? 'desc' },
        { createdAt: 'asc' },
      ];
    } else if (query.sortBy === 'createdAt') {
      orderBy = [{ createdAt: query.sortOrder ?? 'desc' }];
    } else if (query.sortBy === 'updatedAt') {
      orderBy = [{ updatedAt: query.sortOrder ?? 'desc' }];
    } else {
      orderBy = [{ createdAt: 'desc' }];
    }

    const [items, total] = await Promise.all([
      this.prisma.dispute.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: {
          booking: true,
          payment: true,
          customer: true,
          provider: true,
          deliveryPartner: true,
          ticket: true,
          createdByUser: true,
          assignedToUser: true,
          _count: {
            select: {
              evidence: true,
              messages: true,
            },
          },
        },
      }),
      this.prisma.dispute.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async updateDisputeStatus(
    organizationId: string,
    disputeId: string,
    newStatus: DisputeStatus,
    previousStatus: DisputeStatus,
    actorUserId: string,
    details?: string,
    metadata?: Record<string, any>,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const updateData: Prisma.DisputeUpdateInput = {
        status: newStatus,
      };

      if (newStatus === DisputeStatus.RESOLVED) {
        updateData.resolvedAt = new Date();
      } else if (newStatus === DisputeStatus.CLOSED) {
        updateData.closedAt = new Date();
      } else if (newStatus === DisputeStatus.REOPENED) {
        updateData.closedAt = null;
      }

      const updated = await tx.dispute.update({
        where: { id: disputeId },
        data: updateData,
        include: {
          booking: true,
          payment: true,
          customer: true,
          provider: true,
          deliveryPartner: true,
          ticket: true,
          createdByUser: true,
          assignedToUser: true,
        },
      });

      let action = 'STATUS_CHANGED';
      if (newStatus === DisputeStatus.UNDER_REVIEW && previousStatus === DisputeStatus.OPEN) {
        action = 'INVESTIGATION_STARTED';
      } else if (
        newStatus === DisputeStatus.WAITING_FOR_CUSTOMER ||
        newStatus === DisputeStatus.WAITING_FOR_PROVIDER ||
        newStatus === DisputeStatus.WAITING_FOR_DELIVERY_PARTNER
      ) {
        action = 'RESPONSE_REQUESTED';
      } else if (newStatus === DisputeStatus.ESCALATED) {
        action = 'ESCALATED';
      } else if (newStatus === DisputeStatus.RESOLVED) {
        action = 'RESOLVED';
      } else if (newStatus === DisputeStatus.REJECTED) {
        action = 'REJECTED';
      } else if (newStatus === DisputeStatus.REOPENED) {
        action = 'REOPENED';
      }

      await tx.disputeActivity.create({
        data: {
          disputeId,
          organizationId,
          actorUserId,
          action,
          previousValue: previousStatus,
          newValue: newStatus,
          details: details ?? null,
          metadata: metadata ?? undefined,
        },
      });

      let auditAction = SupportAuditAction.DISPUTE_PRIORITY_CHANGED;
      if (action === 'INVESTIGATION_STARTED') auditAction = SupportAuditAction.DISPUTE_INVESTIGATION_STARTED;
      else if (newStatus === DisputeStatus.ESCALATED) auditAction = SupportAuditAction.DISPUTE_ESCALATED;
      else if (newStatus === DisputeStatus.RESOLVED) auditAction = SupportAuditAction.DISPUTE_RESOLVED;
      else if (newStatus === DisputeStatus.REJECTED) auditAction = SupportAuditAction.DISPUTE_REJECTED;
      else if (newStatus === DisputeStatus.REOPENED) auditAction = SupportAuditAction.DISPUTE_REOPENED;

      await tx.auditEvent.create({
        data: {
          organizationId,
          actorUserId,
          action: auditAction,
          entityType: 'Dispute',
          entityId: disputeId,
          metadataJson: {
            previousStatus,
            newStatus,
            details,
            metadata,
          },
        },
      });

      return updated;
    });
  }

  async assignDispute(
    organizationId: string,
    disputeId: string,
    assigneeUserId: string | null,
    previousAssigneeId: string | null,
    actorUserId: string,
    reason?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.dispute.findUnique({
        where: { id: disputeId },
        select: { status: true },
      });

      const updated = await tx.dispute.update({
        where: { id: disputeId },
        data: {
          assignedToUserId: assigneeUserId,
          status:
            assigneeUserId && current?.status === DisputeStatus.OPEN
              ? DisputeStatus.UNDER_REVIEW
              : undefined,
        },
        include: {
          booking: true,
          payment: true,
          customer: true,
          provider: true,
          deliveryPartner: true,
          ticket: true,
          createdByUser: true,
          assignedToUser: true,
        },
      });

      const action = assigneeUserId ? 'ASSIGNED' : 'UNASSIGNED';

      await tx.disputeActivity.create({
        data: {
          disputeId,
          organizationId,
          actorUserId,
          action,
          previousValue: previousAssigneeId ?? null,
          newValue: assigneeUserId ?? null,
          details: reason ? `Assigned with note: ${reason}` : undefined,
        },
      });

      await tx.auditEvent.create({
        data: {
          organizationId,
          actorUserId,
          action:
            assigneeUserId
              ? SupportAuditAction.DISPUTE_ASSIGNED
              : SupportAuditAction.DISPUTE_UNASSIGNED,
          entityType: 'Dispute',
          entityId: disputeId,
          metadataJson: {
            previousAssigneeId,
            newAssigneeId: assigneeUserId,
            reason,
          },
        },
      });

      return updated;
    });
  }

  async updateDisputePriority(
    organizationId: string,
    disputeId: string,
    newPriority: SupportPriority,
    previousPriority: SupportPriority,
    actorUserId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.dispute.update({
        where: { id: disputeId },
        data: { priority: newPriority },
        include: {
          booking: true,
          payment: true,
          customer: true,
          provider: true,
          deliveryPartner: true,
          ticket: true,
          createdByUser: true,
          assignedToUser: true,
        },
      });

      await tx.disputeActivity.create({
        data: {
          disputeId,
          organizationId,
          actorUserId,
          action: 'PRIORITY_CHANGED',
          previousValue: previousPriority,
          newValue: newPriority,
        },
      });

      await tx.auditEvent.create({
        data: {
          organizationId,
          actorUserId,
          action: SupportAuditAction.DISPUTE_PRIORITY_CHANGED,
          entityType: 'Dispute',
          entityId: disputeId,
          metadataJson: {
            previousPriority,
            newPriority,
          },
        },
      });

      return updated;
    });
  }

  async resolveDispute(
    organizationId: string,
    disputeId: string,
    data: {
      resolutionType: DisputeResolutionType;
      resolutionNote: string;
      resolvedAmount?: Prisma.Decimal | null;
      outcome?: DisputeOutcome | null;
    },
    previousStatus: DisputeStatus,
    actorUserId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.dispute.update({
        where: { id: disputeId },
        data: {
          status: DisputeStatus.RESOLVED,
          resolutionType: data.resolutionType,
          resolutionNote: data.resolutionNote,
          resolvedAmount: data.resolvedAmount ?? undefined,
          outcome: data.outcome ?? undefined,
          resolvedAt: new Date(),
        },
        include: {
          booking: true,
          payment: true,
          customer: true,
          provider: true,
          deliveryPartner: true,
          ticket: true,
          createdByUser: true,
          assignedToUser: true,
        },
      });

      await tx.disputeActivity.create({
        data: {
          disputeId,
          organizationId,
          actorUserId,
          action: 'RESOLVED',
          previousValue: previousStatus,
          newValue: DisputeStatus.RESOLVED,
          details: `Resolved as ${data.resolutionType}. Note: ${data.resolutionNote}`,
          metadata: {
            resolutionType: data.resolutionType,
            resolvedAmount: data.resolvedAmount ? data.resolvedAmount.toString() : null,
          },
        },
      });

      await tx.auditEvent.create({
        data: {
          organizationId,
          actorUserId,
          action: SupportAuditAction.DISPUTE_RESOLVED,
          entityType: 'Dispute',
          entityId: disputeId,
          metadataJson: {
            previousStatus,
            resolutionType: data.resolutionType,
            resolutionNote: data.resolutionNote,
            resolvedAmount: data.resolvedAmount ? data.resolvedAmount.toString() : null,
          },
        },
      });

      return updated;
    });
  }

  async rejectDispute(
    organizationId: string,
    disputeId: string,
    decisionReason: string,
    previousStatus: DisputeStatus,
    actorUserId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.dispute.update({
        where: { id: disputeId },
        data: {
          status: DisputeStatus.REJECTED,
          decisionReason,
          outcome: DisputeOutcome.DISMISSED,
        },
        include: {
          booking: true,
          payment: true,
          customer: true,
          provider: true,
          deliveryPartner: true,
          ticket: true,
          createdByUser: true,
          assignedToUser: true,
        },
      });

      await tx.disputeActivity.create({
        data: {
          disputeId,
          organizationId,
          actorUserId,
          action: 'REJECTED',
          previousValue: previousStatus,
          newValue: DisputeStatus.REJECTED,
          details: decisionReason,
        },
      });

      await tx.auditEvent.create({
        data: {
          organizationId,
          actorUserId,
          action: SupportAuditAction.DISPUTE_REJECTED,
          entityType: 'Dispute',
          entityId: disputeId,
          metadataJson: {
            previousStatus,
            decisionReason,
          },
        },
      });

      return updated;
    });
  }

  async getDisputeActivities(organizationId: string, disputeId: string) {
    return this.prisma.disputeActivity.findMany({
      where: { organizationId, disputeId },
      orderBy: { createdAt: 'desc' },
      include: {
        actorUser: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }

  // ============================================================================
  // 5. DISPUTE MESSAGES & EVIDENCE
  // ============================================================================

  async createDisputeMessage(data: {
    organizationId: string;
    disputeId: string;
    senderUserId: string;
    message: string;
    isInternal: boolean;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const publicId = await this.generateDisputeMessagePublicId(data.organizationId);

      const msg = await tx.disputeMessage.create({
        data: {
          publicId,
          organizationId: data.organizationId,
          disputeId: data.disputeId,
          senderUserId: data.senderUserId,
          message: data.message,
          isInternal: data.isInternal,
        },
        include: {
          senderUser: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      await tx.disputeActivity.create({
        data: {
          disputeId: data.disputeId,
          organizationId: data.organizationId,
          actorUserId: data.senderUserId,
          action: 'MESSAGE_ADDED',
          newValue: msg.publicId,
          details: data.isInternal ? 'Internal investigation note added.' : 'Participant message added.',
          metadata: { isInternal: data.isInternal },
        },
      });

      await tx.auditEvent.create({
        data: {
          organizationId: data.organizationId,
          actorUserId: data.senderUserId,
          action: SupportAuditAction.DISPUTE_MESSAGE_CREATED,
          entityType: 'DisputeMessage',
          entityId: msg.id,
          metadataJson: {
            disputeId: data.disputeId,
            publicId: msg.publicId,
            isInternal: data.isInternal,
          },
        },
      });

      return msg;
    });
  }

  async listDisputeMessages(
    organizationId: string,
    disputeId: string,
    includeInternal: boolean,
  ) {
    const where: Prisma.DisputeMessageWhereInput = {
      organizationId,
      disputeId,
    };

    if (!includeInternal) {
      where.isInternal = false;
    }

    return this.prisma.disputeMessage.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: {
        senderUser: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }

  async createEvidence(data: {
    organizationId: string;
    disputeId: string;
    submittedByUserId: string;
    title: string;
    description?: string;
    fileType: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
    fileUrl: string;
    storageKey?: string;
    uploadedByType: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const publicId = await this.generateEvidencePublicId(data.organizationId);

      const evidence = await tx.disputeEvidence.create({
        data: {
          publicId,
          organizationId: data.organizationId,
          disputeId: data.disputeId,
          submittedByUserId: data.submittedByUserId,
          title: data.title,
          description: data.description ?? null,
          fileType: data.fileType,
          fileName: data.fileName,
          mimeType: data.mimeType,
          fileSize: data.fileSize,
          fileUrl: data.fileUrl,
          storageKey: data.storageKey ?? null,
          uploadedByType: data.uploadedByType,
          status: 'SUBMITTED',
        },
        include: {
          submittedByUser: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      await tx.disputeActivity.create({
        data: {
          disputeId: data.disputeId,
          organizationId: data.organizationId,
          actorUserId: data.submittedByUserId,
          action: 'EVIDENCE_SUBMITTED',
          newValue: evidence.publicId,
          details: `Evidence "${data.title}" submitted.`,
          metadata: {
            fileType: data.fileType,
            fileName: data.fileName,
            fileSize: data.fileSize,
          },
        },
      });

      await tx.auditEvent.create({
        data: {
          organizationId: data.organizationId,
          actorUserId: data.submittedByUserId,
          action: SupportAuditAction.DISPUTE_EVIDENCE_SUBMITTED,
          entityType: 'DisputeEvidence',
          entityId: evidence.id,
          metadataJson: {
            disputeId: data.disputeId,
            publicId: evidence.publicId,
            fileType: data.fileType,
          },
        },
      });

      return evidence;
    });
  }

  async findEvidenceById(organizationId: string, evidenceId: string) {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        evidenceId,
      );

    return this.prisma.disputeEvidence.findFirst({
      where: {
        organizationId,
        OR: [
          { id: isUuid ? evidenceId : undefined },
          { publicId: evidenceId },
        ],
      },
      include: {
        submittedByUser: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }

  async listEvidence(organizationId: string, disputeId: string) {
    return this.prisma.disputeEvidence.findMany({
      where: { organizationId, disputeId },
      orderBy: { createdAt: 'desc' },
      include: {
        submittedByUser: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }

  async reviewEvidence(
    organizationId: string,
    evidenceId: string,
    status: 'ACCEPTED' | 'REJECTED',
    rejectionReason: string | null,
    actorUserId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.disputeEvidence.update({
        where: { id: evidenceId },
        data: {
          status,
          rejectionReason: status === 'REJECTED' ? rejectionReason : null,
        },
        include: {
          submittedByUser: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      const action = status === 'ACCEPTED' ? 'EVIDENCE_ACCEPTED' : 'EVIDENCE_REJECTED';

      await tx.disputeActivity.create({
        data: {
          disputeId: updated.disputeId,
          organizationId,
          actorUserId,
          action,
          previousValue: 'SUBMITTED',
          newValue: status,
          details:
            status === 'REJECTED'
              ? `Evidence rejected: ${rejectionReason}`
              : `Evidence accepted.`,
          metadata: {
            evidenceId: updated.id,
            evidencePublicId: updated.publicId,
            rejectionReason,
          },
        },
      });

      await tx.auditEvent.create({
        data: {
          organizationId,
          actorUserId,
          action:
            status === 'ACCEPTED'
              ? SupportAuditAction.DISPUTE_EVIDENCE_ACCEPTED
              : SupportAuditAction.DISPUTE_EVIDENCE_REJECTED,
          entityType: 'DisputeEvidence',
          entityId: updated.id,
          metadataJson: {
            disputeId: updated.disputeId,
            status,
            rejectionReason,
          },
        },
      });

      return updated;
    });
  }

  // ============================================================================
  // 6. HELPER CHECKS
  // ============================================================================

  async findUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        organizationMembers: {
          include: {
            role: true,
          },
        },
        customers: true,
        providers: true,
        deliveryPartners: true,
      },
    });
  }

  async findBookingByIdentifier(organizationId: string, identifier: string) {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        identifier,
      );

    return this.prisma.booking.findFirst({
      where: {
        organizationId,
        OR: [
          { id: isUuid ? identifier : undefined },
          { bookingNumber: identifier },
        ],
      },
      include: {
        customer: true,
        provider: true,
        assignments: {
          include: {
            provider: true,
            deliveryPartner: true,
          },
        },
        payment: true,
      },
    });
  }

  async findPaymentByIdentifier(organizationId: string, identifier: string) {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        identifier,
      );

    return this.prisma.payment.findFirst({
      where: {
        organizationId,
        OR: [
          { id: isUuid ? identifier : undefined },
          { publicId: identifier },
        ],
      },
    });
  }

  async recordAuditEvent(
    organizationId: string,
    actorUserId: string | null,
    action: string,
    entityType: string,
    entityId: string,
    metadataJson: Record<string, any>,
  ) {
    const sanitized = { ...metadataJson };
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.secret;
    delete sanitized.authorization;
    delete sanitized.apiKey;

    return this.prisma.auditEvent.create({
      data: {
        organizationId,
        actorUserId: actorUserId ?? undefined,
        action,
        entityType,
        entityId,
        metadataJson: sanitized,
      },
    });
  }
}
