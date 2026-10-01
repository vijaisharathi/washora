import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AssignmentAction,
  AssignmentStatus,
  AssignmentType,
  BookingAssignment,
  BookingStatus,
} from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { AssignmentEligibilityService } from './assignment-eligibility.service';
import { AssignmentRepository } from './assignment.repository';
import {
  AssignmentHistoryResponseDto,
  AssignmentListItemResponseDto,
  AssignmentResponseDto,
  CandidateDeliveryPartnerResponseDto,
  CandidateProviderResponseDto,
  DeliveryPartnerAssignmentDetailDto,
  DeliveryPartnerAssignmentListItemDto,
  ProviderAssignmentDetailDto,
  ProviderAssignmentListItemDto,
} from './dto/assignment-response.dto';
import {
  DeliveryPartnerAssignmentQueryDto,
  OperationsAssignmentQueryDto,
  ProviderAssignmentQueryDto,
} from './dto/assignment-query.dto';
import {
  CreateDeliveryAssignmentDto,
  CreateProviderAssignmentDto,
} from './dto/create-assignment.dto';
import { ReassignAssignmentDto } from './dto/reassign-assignment.dto';
import {
  AssignmentAuditEventType,
  AssignmentErrorCode,
} from './types/assignment.types';

@Injectable()
export class AssignmentService {
  // In-memory idempotency cache: `${orgId}:${idempotencyKey}` -> cached response (TTL: 5 mins)
  private readonly idempotencyCache = new Map<
    string,
    { timestamp: number; data: AssignmentResponseDto }
  >();

  constructor(
    private readonly assignmentRepository: AssignmentRepository,
    private readonly eligibilityService: AssignmentEligibilityService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Operations: Create a Provider Assignment with strict server-side eligibility checks.
   */
  async createProviderAssignment(
    bookingIdentifier: string,
    dto: CreateProviderAssignmentDto,
    organizationId: string,
    actorUserId?: string,
    idempotencyKey?: string,
  ): Promise<AssignmentResponseDto> {
    // 1. Idempotency Check
    if (idempotencyKey) {
      const cacheKey = `${organizationId}:${idempotencyKey}`;
      const cached = this.idempotencyCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < 300000) {
        return cached.data;
      }
    }

    // 2. Load Booking
    const booking = await this.prisma.booking.findFirst({
      where: {
        organizationId,
        OR: [{ id: bookingIdentifier }, { bookingNumber: bookingIdentifier }],
      },
      include: {
        items: true,
        address: true,
        schedule: true,
      },
    });

    if (!booking) {
      throw new NotFoundException({
        code: AssignmentErrorCode.BOOKING_NOT_FOUND,
        message: 'Booking not found in organization',
      });
    }

    // 3. Resolve Provider
    const provider = await this.prisma.provider.findFirst({
      where: {
        organizationId,
        OR: [{ id: dto.providerId }, { publicId: dto.providerId }],
      },
    });

    if (!provider) {
      throw new NotFoundException({
        code: AssignmentErrorCode.PROVIDER_NOT_FOUND,
        message: `Provider '${dto.providerId}' not found in organization`,
      });
    }

    // 4. Server-Side Eligibility Validation
    const eligibility =
      await this.eligibilityService.validateProviderEligibility(
        provider.id,
        booking,
        organizationId,
      );

    if (!eligibility.isEligible) {
      throw new BadRequestException({
        code: eligibility.errorCode || AssignmentErrorCode.PROVIDER_NOT_ELIGIBLE,
        message: eligibility.reason || 'Provider is not eligible for this booking',
        details: eligibility.details,
      });
    }

    // 5. Atomic Creation
    const assignment =
      await this.assignmentRepository.createAssignmentWithTransaction({
        organizationId,
        bookingId: booking.id,
        providerId: provider.id,
        type: AssignmentType.PROVIDER,
        notes: dto.notes,
        actorUserId,
      });

    // 6. Audit Trail Logging
    await this.assignmentRepository.logAuditEvent(
      organizationId,
      AssignmentAuditEventType.ASSIGNMENT_CREATED,
      assignment.id,
      actorUserId,
      {
        publicId: assignment.publicId,
        bookingId: booking.id,
        providerId: provider.id,
        type: AssignmentType.PROVIDER,
      },
    );

    const fullAssignment = await this.assignmentRepository.findAssignmentById(
      assignment.id,
      organizationId,
    );

    const result = this.serializeAssignment(fullAssignment!);

    if (idempotencyKey) {
      this.idempotencyCache.set(`${organizationId}:${idempotencyKey}`, {
        timestamp: Date.now(),
        data: result,
      });
    }

    return result;
  }

  /**
   * Operations: Create a Delivery Partner Assignment with server-side eligibility checks.
   */
  async createDeliveryAssignment(
    bookingIdentifier: string,
    dto: CreateDeliveryAssignmentDto,
    organizationId: string,
    actorUserId?: string,
    idempotencyKey?: string,
  ): Promise<AssignmentResponseDto> {
    if (idempotencyKey) {
      const cacheKey = `${organizationId}:${idempotencyKey}`;
      const cached = this.idempotencyCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < 300000) {
        return cached.data;
      }
    }

    const booking = await this.prisma.booking.findFirst({
      where: {
        organizationId,
        OR: [{ id: bookingIdentifier }, { bookingNumber: bookingIdentifier }],
      },
      include: {
        address: true,
        schedule: true,
      },
    });

    if (!booking) {
      throw new NotFoundException({
        code: AssignmentErrorCode.BOOKING_NOT_FOUND,
        message: 'Booking not found in organization',
      });
    }

    const partner = await this.prisma.deliveryPartner.findFirst({
      where: {
        organizationId,
        OR: [
          { id: dto.deliveryPartnerId },
          { publicId: dto.deliveryPartnerId },
        ],
      },
    });

    if (!partner) {
      throw new NotFoundException({
        code: AssignmentErrorCode.DELIVERY_PARTNER_NOT_FOUND,
        message: `Delivery Partner '${dto.deliveryPartnerId}' not found in organization`,
      });
    }

    const eligibility =
      await this.eligibilityService.validateDeliveryPartnerEligibility(
        partner.id,
        booking,
        organizationId,
      );

    if (!eligibility.isEligible) {
      throw new BadRequestException({
        code:
          eligibility.errorCode ||
          AssignmentErrorCode.DELIVERY_PARTNER_NOT_ELIGIBLE,
        message:
          eligibility.reason ||
          'Delivery partner is not eligible for this booking',
        details: eligibility.details,
      });
    }

    const assignmentType = dto.type || AssignmentType.DELIVERY_PARTNER;

    const assignment =
      await this.assignmentRepository.createAssignmentWithTransaction({
        organizationId,
        bookingId: booking.id,
        deliveryPartnerId: partner.id,
        type: assignmentType,
        notes: dto.notes,
        actorUserId,
      });

    await this.assignmentRepository.logAuditEvent(
      organizationId,
      AssignmentAuditEventType.ASSIGNMENT_CREATED,
      assignment.id,
      actorUserId,
      {
        publicId: assignment.publicId,
        bookingId: booking.id,
        deliveryPartnerId: partner.id,
        type: assignmentType,
      },
    );

    const fullAssignment = await this.assignmentRepository.findAssignmentById(
      assignment.id,
      organizationId,
    );

    const result = this.serializeAssignment(fullAssignment!);

    if (idempotencyKey) {
      this.idempotencyCache.set(`${organizationId}:${idempotencyKey}`, {
        timestamp: Date.now(),
        data: result,
      });
    }

    return result;
  }

  /**
   * Operations: Reassign an existing assignment to a new provider or delivery partner.
   */
  async reassignAssignment(
    assignmentIdentifier: string,
    dto: ReassignAssignmentDto,
    organizationId: string,
    actorUserId?: string,
  ): Promise<AssignmentResponseDto> {
    const current = await this.assignmentRepository.findAssignmentById(
      assignmentIdentifier,
      organizationId,
    );

    if (!current) {
      throw new NotFoundException({
        code: AssignmentErrorCode.ASSIGNMENT_NOT_FOUND,
        message: 'Assignment not found in organization',
      });
    }

    if (
      current.status === AssignmentStatus.CANCELLED ||
      current.status === AssignmentStatus.COMPLETED ||
      current.status === AssignmentStatus.REJECTED
    ) {
      throw new BadRequestException({
        code: AssignmentErrorCode.REASSIGNMENT_NOT_ALLOWED,
        message: `Cannot reassign assignment in terminal status '${current.status}'`,
      });
    }

    let newProviderId: string | undefined;
    let newDeliveryPartnerId: string | undefined;

    if (current.type === AssignmentType.PROVIDER) {
      if (!dto.providerId) {
        throw new BadRequestException({
          code: AssignmentErrorCode.ASSIGNMENT_INVALID,
          message: 'Provider assignment requires new providerId for reassignment',
        });
      }

      const provider = await this.prisma.provider.findFirst({
        where: {
          organizationId,
          OR: [{ id: dto.providerId }, { publicId: dto.providerId }],
        },
      });

      if (!provider) {
        throw new NotFoundException({
          code: AssignmentErrorCode.PROVIDER_NOT_FOUND,
          message: `Candidate provider '${dto.providerId}' not found`,
        });
      }

      const eligibility =
        await this.eligibilityService.validateProviderEligibility(
          provider.id,
          current.booking,
          organizationId,
        );

      if (!eligibility.isEligible) {
        throw new BadRequestException({
          code:
            eligibility.errorCode || AssignmentErrorCode.PROVIDER_NOT_ELIGIBLE,
          message: eligibility.reason || 'Candidate provider is not eligible',
          details: eligibility.details,
        });
      }

      newProviderId = provider.id;
    } else {
      if (!dto.deliveryPartnerId) {
        throw new BadRequestException({
          code: AssignmentErrorCode.ASSIGNMENT_INVALID,
          message:
            'Delivery assignment requires new deliveryPartnerId for reassignment',
        });
      }

      const partner = await this.prisma.deliveryPartner.findFirst({
        where: {
          organizationId,
          OR: [
            { id: dto.deliveryPartnerId },
            { publicId: dto.deliveryPartnerId },
          ],
        },
      });

      if (!partner) {
        throw new NotFoundException({
          code: AssignmentErrorCode.DELIVERY_PARTNER_NOT_FOUND,
          message: `Candidate delivery partner '${dto.deliveryPartnerId}' not found`,
        });
      }

      const eligibility =
        await this.eligibilityService.validateDeliveryPartnerEligibility(
          partner.id,
          current.booking,
          organizationId,
        );

      if (!eligibility.isEligible) {
        throw new BadRequestException({
          code:
            eligibility.errorCode ||
            AssignmentErrorCode.DELIVERY_PARTNER_NOT_ELIGIBLE,
          message:
            eligibility.reason || 'Candidate delivery partner is not eligible',
          details: eligibility.details,
        });
      }

      newDeliveryPartnerId = partner.id;
    }

    const newAssignment =
      await this.assignmentRepository.reassignWithTransaction({
        organizationId,
        assignmentId: current.id,
        newProviderId,
        newDeliveryPartnerId,
        reason: dto.reason,
        notes: dto.notes,
        actorUserId,
      });

    await this.assignmentRepository.logAuditEvent(
      organizationId,
      AssignmentAuditEventType.ASSIGNMENT_REASSIGNED,
      newAssignment.id,
      actorUserId,
      {
        previousAssignmentId: current.id,
        newAssignmentPublicId: newAssignment.publicId,
        reason: dto.reason,
      },
    );

    const fullNew = await this.assignmentRepository.findAssignmentById(
      newAssignment.id,
      organizationId,
    );

    return this.serializeAssignment(fullNew!);
  }

  /**
   * Operations: Cancel an active assignment.
   */
  async cancelAssignment(
    assignmentIdentifier: string,
    reason: string,
    organizationId: string,
    actorUserId?: string,
  ): Promise<AssignmentResponseDto> {
    const assignment = await this.assignmentRepository.findAssignmentById(
      assignmentIdentifier,
      organizationId,
    );

    if (!assignment) {
      throw new NotFoundException({
        code: AssignmentErrorCode.ASSIGNMENT_NOT_FOUND,
        message: 'Assignment not found',
      });
    }

    if (
      assignment.status === AssignmentStatus.CANCELLED ||
      assignment.status === AssignmentStatus.COMPLETED ||
      assignment.status === AssignmentStatus.REJECTED
    ) {
      throw new BadRequestException({
        code: AssignmentErrorCode.ASSIGNMENT_NOT_CANCELLABLE,
        message: `Assignment in status '${assignment.status}' cannot be cancelled`,
      });
    }

    await this.assignmentRepository.updateAssignmentStatus({
      assignmentId: assignment.id,
      organizationId,
      targetStatus: AssignmentStatus.CANCELLED,
      action: AssignmentAction.CANCELLED,
      actorUserId,
      reason,
      allowedFromStatuses: [
        AssignmentStatus.PENDING,
        AssignmentStatus.ASSIGNED,
        AssignmentStatus.ACCEPTED,
        AssignmentStatus.IN_TRANSIT,
        AssignmentStatus.ARRIVED,
      ],
    });

    await this.assignmentRepository.logAuditEvent(
      organizationId,
      AssignmentAuditEventType.ASSIGNMENT_CANCELLED,
      assignment.id,
      actorUserId,
      { reason },
    );

    const updated = await this.assignmentRepository.findAssignmentById(
      assignment.id,
      organizationId,
    );

    return this.serializeAssignment(updated!);
  }

  /**
   * Operations: Update assignment notes.
   */
  async updateAssignmentNotes(
    assignmentIdentifier: string,
    notes: string | undefined,
    organizationId: string,
  ): Promise<AssignmentResponseDto> {
    const assignment = await this.assignmentRepository.findAssignmentById(
      assignmentIdentifier,
      organizationId,
    );

    if (!assignment) {
      throw new NotFoundException({
        code: AssignmentErrorCode.ASSIGNMENT_NOT_FOUND,
        message: 'Assignment not found',
      });
    }

    await this.assignmentRepository.updateAssignmentDetails(
      assignment.id,
      organizationId,
      notes,
    );

    const updated = await this.assignmentRepository.findAssignmentById(
      assignment.id,
      organizationId,
    );

    return this.serializeAssignment(updated!);
  }

  /**
   * Operations: List assignments.
   */
  async listOperationsAssignments(
    organizationId: string,
    options: OperationsAssignmentQueryDto,
  ) {
    const { items, total, page, limit } =
      await this.assignmentRepository.findOperationsAssignments(
        organizationId,
        options,
      );

    const data: AssignmentListItemResponseDto[] = items.map((item) => ({
      id: item.id,
      publicId: item.publicId,
      bookingId: item.bookingId,
      bookingNumber: item.booking?.bookingNumber || '',
      providerId: item.provider?.publicId || null,
      providerName: item.provider?.businessName || item.provider?.fullName || null,
      deliveryPartnerId: item.deliveryPartner?.publicId || null,
      deliveryPartnerName: item.deliveryPartner?.fullName || null,
      type: item.type,
      status: item.status,
      assignedAt: item.assignedAt,
      acceptedAt: item.acceptedAt,
      completedAt: item.completedAt,
      cancelledAt: item.cancelledAt,
    }));

    return {
      data,
      pagination: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit) || 1,
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Operations: Get single assignment detail.
   */
  async getAssignmentDetail(
    assignmentIdentifier: string,
    organizationId: string,
  ): Promise<AssignmentResponseDto> {
    const assignment = await this.assignmentRepository.findAssignmentById(
      assignmentIdentifier,
      organizationId,
    );

    if (!assignment) {
      throw new NotFoundException({
        code: AssignmentErrorCode.ASSIGNMENT_NOT_FOUND,
        message: 'Assignment not found in organization',
      });
    }

    return this.serializeAssignment(assignment);
  }

  /**
   * Operations: Get assignment history.
   */
  async getAssignmentHistory(
    assignmentIdentifier: string,
    organizationId: string,
  ): Promise<AssignmentHistoryResponseDto[]> {
    const assignment = await this.assignmentRepository.findAssignmentById(
      assignmentIdentifier,
      organizationId,
    );

    if (!assignment) {
      throw new NotFoundException({
        code: AssignmentErrorCode.ASSIGNMENT_NOT_FOUND,
        message: 'Assignment not found',
      });
    }

    const history = await this.assignmentRepository.findAssignmentHistory(
      assignment.id,
      organizationId,
    );

    return history.map((h) => ({
      id: h.id,
      assignmentId: assignment.publicId,
      action: h.action,
      actorUserId: h.actorUserId,
      details: h.details,
      createdAt: h.createdAt,
    }));
  }

  /**
   * Operations: Discover eligible providers for a booking.
   */
  async getEligibleProviders(
    bookingIdentifier: string,
    organizationId: string,
  ): Promise<CandidateProviderResponseDto[]> {
    const booking = await this.prisma.booking.findFirst({
      where: {
        organizationId,
        OR: [{ id: bookingIdentifier }, { bookingNumber: bookingIdentifier }],
      },
      include: {
        items: true,
        address: true,
        schedule: true,
      },
    });

    if (!booking) {
      throw new NotFoundException({
        code: AssignmentErrorCode.BOOKING_NOT_FOUND,
        message: 'Booking not found',
      });
    }

    return this.eligibilityService.findEligibleProviders(
      booking,
      organizationId,
    );
  }

  /**
   * Operations: Discover eligible delivery partners for a booking.
   */
  async getEligibleDeliveryPartners(
    bookingIdentifier: string,
    organizationId: string,
  ): Promise<CandidateDeliveryPartnerResponseDto[]> {
    const booking = await this.prisma.booking.findFirst({
      where: {
        organizationId,
        OR: [{ id: bookingIdentifier }, { bookingNumber: bookingIdentifier }],
      },
      include: {
        address: true,
        schedule: true,
      },
    });

    if (!booking) {
      throw new NotFoundException({
        code: AssignmentErrorCode.BOOKING_NOT_FOUND,
        message: 'Booking not found',
      });
    }

    return this.eligibilityService.findEligibleDeliveryPartners(
      booking,
      organizationId,
    );
  }

  // ----------------------------------------------------------------------
  // PROVIDER SELF-SERVICE METHODS
  // ----------------------------------------------------------------------

  /**
   * Provider: List assigned assignments with filters and pagination.
   */
  async listProviderAssignments(
    providerId: string,
    organizationId: string,
    options: ProviderAssignmentQueryDto,
  ) {
    const { items, total, page, limit } =
      await this.assignmentRepository.findProviderAssignments(
        providerId,
        organizationId,
        options,
      );

    const data: ProviderAssignmentListItemDto[] = items.map((item) => ({
      id: item.id,
      publicId: item.publicId,
      bookingId: item.bookingId,
      bookingNumber: item.booking?.bookingNumber || '',
      status: item.status,
      scheduledAt: item.booking?.scheduledAt || item.assignedAt,
      assignedAt: item.assignedAt,
      acceptedAt: item.acceptedAt,
      itemsCount: item.booking?.items?.length || 0,
    }));

    return {
      data,
      pagination: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit) || 1,
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Provider: Get single assignment detail with customer privacy redaction.
   */
  async getProviderAssignmentDetail(
    assignmentIdentifier: string,
    providerId: string,
    organizationId: string,
  ): Promise<ProviderAssignmentDetailDto> {
    const assignment = await this.assignmentRepository.findAssignmentById(
      assignmentIdentifier,
      organizationId,
    );

    if (!assignment) {
      throw new NotFoundException({
        code: AssignmentErrorCode.ASSIGNMENT_NOT_FOUND,
        message: 'Assignment not found',
      });
    }

    if (assignment.providerId !== providerId) {
      throw new ForbiddenException({
        code: AssignmentErrorCode.ASSIGNMENT_ACCESS_DENIED,
        message: 'You can only view assignments assigned to your provider profile',
      });
    }

    return {
      id: assignment.id,
      publicId: assignment.publicId,
      bookingId: assignment.bookingId,
      bookingNumber: assignment.booking?.bookingNumber || '',
      type: assignment.type,
      status: assignment.status,
      notes: assignment.notes,
      assignedAt: assignment.assignedAt,
      acceptedAt: assignment.acceptedAt,
      items: (assignment.booking?.items || []).map((item) => ({
        serviceName: item.serviceNameSnapshot,
        variantName: item.variantNameSnapshot,
        quantity: item.quantity,
      })),
      schedule: {
        pickupDate: assignment.booking?.schedule?.pickupDate
          ? assignment.booking.schedule.pickupDate.toISOString().split('T')[0]
          : '',
        pickupTimeSlot:
          assignment.booking?.schedule?.pickupTimeSlot || 'Standard',
        returnDate: assignment.booking?.schedule?.returnDate
          ? assignment.booking.schedule.returnDate.toISOString().split('T')[0]
          : null,
        returnTimeSlot: assignment.booking?.schedule?.returnTimeSlot || null,
        specialInstructions:
          assignment.booking?.schedule?.specialInstructions || null,
      },
      address: {
        recipientName: assignment.booking?.address?.recipientName || 'Customer',
        addressLine1: assignment.booking?.address?.addressLine1 || '',
        addressLine2: assignment.booking?.address?.addressLine2 || null,
        area: assignment.booking?.address?.area || '',
        city: assignment.booking?.address?.city || '',
        postalCode: assignment.booking?.address?.postalCode || '',
      },
      history: (assignment.history || []).map((h) => ({
        id: h.id,
        assignmentId: assignment.publicId,
        action: h.action,
        actorUserId: h.actorUserId,
        details: h.details,
        createdAt: h.createdAt,
      })),
    };
  }

  /**
   * Provider: Accept an offered assignment.
   */
  async acceptProviderAssignment(
    assignmentIdentifier: string,
    providerId: string,
    organizationId: string,
    actorUserId?: string,
  ): Promise<ProviderAssignmentDetailDto> {
    const assignment = await this.assignmentRepository.findAssignmentById(
      assignmentIdentifier,
      organizationId,
    );

    if (!assignment) {
      throw new NotFoundException({
        code: AssignmentErrorCode.ASSIGNMENT_NOT_FOUND,
        message: 'Assignment not found',
      });
    }

    if (assignment.providerId !== providerId) {
      throw new ForbiddenException({
        code: AssignmentErrorCode.ASSIGNMENT_ACCESS_DENIED,
        message: 'Only the assigned provider can accept this assignment',
      });
    }

    if (
      assignment.status !== AssignmentStatus.PENDING &&
      assignment.status !== AssignmentStatus.ASSIGNED
    ) {
      throw new BadRequestException({
        code: AssignmentErrorCode.ASSIGNMENT_NOT_ACCEPTABLE,
        message: `Assignment in status '${assignment.status}' cannot be accepted`,
      });
    }

    await this.assignmentRepository.updateAssignmentStatus({
      assignmentId: assignment.id,
      organizationId,
      targetStatus: AssignmentStatus.ACCEPTED,
      action: AssignmentAction.ACCEPTED,
      actorUserId,
      reason: 'Assignment accepted by provider',
      allowedFromStatuses: [
        AssignmentStatus.PENDING,
        AssignmentStatus.ASSIGNED,
      ],
    });

    await this.assignmentRepository.logAuditEvent(
      organizationId,
      AssignmentAuditEventType.ASSIGNMENT_ACCEPTED,
      assignment.id,
      actorUserId,
      { providerId },
    );

    return this.getProviderAssignmentDetail(
      assignment.id,
      providerId,
      organizationId,
    );
  }

  /**
   * Provider: Reject an offered assignment with mandatory reason.
   */
  async rejectProviderAssignment(
    assignmentIdentifier: string,
    providerId: string,
    organizationId: string,
    actorUserId: string | undefined,
    reason: string,
  ): Promise<ProviderAssignmentDetailDto> {
    const assignment = await this.assignmentRepository.findAssignmentById(
      assignmentIdentifier,
      organizationId,
    );

    if (!assignment) {
      throw new NotFoundException({
        code: AssignmentErrorCode.ASSIGNMENT_NOT_FOUND,
        message: 'Assignment not found',
      });
    }

    if (assignment.providerId !== providerId) {
      throw new ForbiddenException({
        code: AssignmentErrorCode.ASSIGNMENT_ACCESS_DENIED,
        message: 'Only the assigned provider can reject this assignment',
      });
    }

    if (
      assignment.status !== AssignmentStatus.PENDING &&
      assignment.status !== AssignmentStatus.ASSIGNED
    ) {
      throw new BadRequestException({
        code: AssignmentErrorCode.ASSIGNMENT_NOT_REJECTABLE,
        message: `Assignment in status '${assignment.status}' cannot be rejected`,
      });
    }

    await this.assignmentRepository.updateAssignmentStatus({
      assignmentId: assignment.id,
      organizationId,
      targetStatus: AssignmentStatus.REJECTED,
      action: AssignmentAction.REJECTED,
      actorUserId,
      reason,
      allowedFromStatuses: [
        AssignmentStatus.PENDING,
        AssignmentStatus.ASSIGNED,
      ],
    });

    await this.assignmentRepository.logAuditEvent(
      organizationId,
      AssignmentAuditEventType.ASSIGNMENT_REJECTED,
      assignment.id,
      actorUserId,
      { providerId, reason },
    );

    return this.getProviderAssignmentDetail(
      assignment.id,
      providerId,
      organizationId,
    );
  }

  /**
   * Provider: View history timeline.
   */
  async getProviderAssignmentHistory(
    assignmentIdentifier: string,
    providerId: string,
    organizationId: string,
  ): Promise<AssignmentHistoryResponseDto[]> {
    const assignment = await this.assignmentRepository.findAssignmentById(
      assignmentIdentifier,
      organizationId,
    );

    if (!assignment || assignment.providerId !== providerId) {
      throw new NotFoundException({
        code: AssignmentErrorCode.ASSIGNMENT_NOT_FOUND,
        message: 'Assignment not found',
      });
    }

    const history = await this.assignmentRepository.findAssignmentHistory(
      assignment.id,
      organizationId,
    );

    return history.map((h) => ({
      id: h.id,
      assignmentId: assignment.publicId,
      action: h.action,
      actorUserId: h.actorUserId,
      details: h.details,
      createdAt: h.createdAt,
    }));
  }

  // ----------------------------------------------------------------------
  // DELIVERY PARTNER SELF-SERVICE METHODS
  // ----------------------------------------------------------------------

  /**
   * Delivery Partner: List assigned deliveries with filters and pagination.
   */
  async listDeliveryPartnerAssignments(
    deliveryPartnerId: string,
    organizationId: string,
    options: DeliveryPartnerAssignmentQueryDto,
  ) {
    const { items, total, page, limit } =
      await this.assignmentRepository.findDeliveryPartnerAssignments(
        deliveryPartnerId,
        organizationId,
        options,
      );

    const data: DeliveryPartnerAssignmentListItemDto[] = items.map((item) => ({
      id: item.id,
      publicId: item.publicId,
      bookingId: item.bookingId,
      bookingNumber: item.booking?.bookingNumber || '',
      type: item.type,
      status: item.status,
      scheduledAt: item.booking?.scheduledAt || item.assignedAt,
      area: item.booking?.address?.area || '',
      city: item.booking?.address?.city || '',
      assignedAt: item.assignedAt,
      acceptedAt: item.acceptedAt,
    }));

    return {
      data,
      pagination: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit) || 1,
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Delivery Partner: Get single assignment detail with task navigation information.
   */
  async getDeliveryPartnerAssignmentDetail(
    assignmentIdentifier: string,
    deliveryPartnerId: string,
    organizationId: string,
  ): Promise<DeliveryPartnerAssignmentDetailDto> {
    const assignment = await this.assignmentRepository.findAssignmentById(
      assignmentIdentifier,
      organizationId,
    );

    if (!assignment) {
      throw new NotFoundException({
        code: AssignmentErrorCode.ASSIGNMENT_NOT_FOUND,
        message: 'Assignment not found',
      });
    }

    if (assignment.deliveryPartnerId !== deliveryPartnerId) {
      throw new ForbiddenException({
        code: AssignmentErrorCode.ASSIGNMENT_ACCESS_DENIED,
        message:
          'You can only view assignments assigned to your delivery partner profile',
      });
    }

    return {
      id: assignment.id,
      publicId: assignment.publicId,
      bookingId: assignment.bookingId,
      bookingNumber: assignment.booking?.bookingNumber || '',
      type: assignment.type,
      status: assignment.status,
      notes: assignment.notes,
      assignedAt: assignment.assignedAt,
      acceptedAt: assignment.acceptedAt,
      address: {
        recipientName: assignment.booking?.address?.recipientName || 'Customer',
        recipientPhone: assignment.booking?.address?.recipientPhone || '',
        addressLine1: assignment.booking?.address?.addressLine1 || '',
        addressLine2: assignment.booking?.address?.addressLine2 || null,
        area: assignment.booking?.address?.area || '',
        city: assignment.booking?.address?.city || '',
        postalCode: assignment.booking?.address?.postalCode || '',
        latitude: assignment.booking?.address?.latitude
          ? assignment.booking.address.latitude.toString()
          : null,
        longitude: assignment.booking?.address?.longitude
          ? assignment.booking.address.longitude.toString()
          : null,
      },
      schedule: {
        pickupDate: assignment.booking?.schedule?.pickupDate
          ? assignment.booking.schedule.pickupDate.toISOString().split('T')[0]
          : '',
        pickupTimeSlot:
          assignment.booking?.schedule?.pickupTimeSlot || 'Standard',
        specialInstructions:
          assignment.booking?.schedule?.specialInstructions || null,
      },
      totalPackageCount: assignment.booking?.items?.length || 1,
      history: (assignment.history || []).map((h) => ({
        id: h.id,
        assignmentId: assignment.publicId,
        action: h.action,
        actorUserId: h.actorUserId,
        details: h.details,
        createdAt: h.createdAt,
      })),
    };
  }

  /**
   * Delivery Partner: Accept an offered delivery assignment.
   */
  async acceptDeliveryPartnerAssignment(
    assignmentIdentifier: string,
    deliveryPartnerId: string,
    organizationId: string,
    actorUserId?: string,
  ): Promise<DeliveryPartnerAssignmentDetailDto> {
    const assignment = await this.assignmentRepository.findAssignmentById(
      assignmentIdentifier,
      organizationId,
    );

    if (!assignment) {
      throw new NotFoundException({
        code: AssignmentErrorCode.ASSIGNMENT_NOT_FOUND,
        message: 'Assignment not found',
      });
    }

    if (assignment.deliveryPartnerId !== deliveryPartnerId) {
      throw new ForbiddenException({
        code: AssignmentErrorCode.ASSIGNMENT_ACCESS_DENIED,
        message: 'Only the assigned delivery partner can accept this assignment',
      });
    }

    if (
      assignment.status !== AssignmentStatus.PENDING &&
      assignment.status !== AssignmentStatus.ASSIGNED
    ) {
      throw new BadRequestException({
        code: AssignmentErrorCode.ASSIGNMENT_NOT_ACCEPTABLE,
        message: `Assignment in status '${assignment.status}' cannot be accepted`,
      });
    }

    await this.assignmentRepository.updateAssignmentStatus({
      assignmentId: assignment.id,
      organizationId,
      targetStatus: AssignmentStatus.ACCEPTED,
      action: AssignmentAction.ACCEPTED,
      actorUserId,
      reason: 'Assignment accepted by delivery partner',
      allowedFromStatuses: [
        AssignmentStatus.PENDING,
        AssignmentStatus.ASSIGNED,
      ],
    });

    await this.assignmentRepository.logAuditEvent(
      organizationId,
      AssignmentAuditEventType.ASSIGNMENT_ACCEPTED,
      assignment.id,
      actorUserId,
      { deliveryPartnerId },
    );

    return this.getDeliveryPartnerAssignmentDetail(
      assignment.id,
      deliveryPartnerId,
      organizationId,
    );
  }

  /**
   * Delivery Partner: Reject an offered delivery assignment with reason.
   */
  async rejectDeliveryPartnerAssignment(
    assignmentIdentifier: string,
    deliveryPartnerId: string,
    organizationId: string,
    actorUserId: string | undefined,
    reason: string,
  ): Promise<DeliveryPartnerAssignmentDetailDto> {
    const assignment = await this.assignmentRepository.findAssignmentById(
      assignmentIdentifier,
      organizationId,
    );

    if (!assignment) {
      throw new NotFoundException({
        code: AssignmentErrorCode.ASSIGNMENT_NOT_FOUND,
        message: 'Assignment not found',
      });
    }

    if (assignment.deliveryPartnerId !== deliveryPartnerId) {
      throw new ForbiddenException({
        code: AssignmentErrorCode.ASSIGNMENT_ACCESS_DENIED,
        message: 'Only the assigned delivery partner can reject this assignment',
      });
    }

    if (
      assignment.status !== AssignmentStatus.PENDING &&
      assignment.status !== AssignmentStatus.ASSIGNED
    ) {
      throw new BadRequestException({
        code: AssignmentErrorCode.ASSIGNMENT_NOT_REJECTABLE,
        message: `Assignment in status '${assignment.status}' cannot be rejected`,
      });
    }

    await this.assignmentRepository.updateAssignmentStatus({
      assignmentId: assignment.id,
      organizationId,
      targetStatus: AssignmentStatus.REJECTED,
      action: AssignmentAction.REJECTED,
      actorUserId,
      reason,
      allowedFromStatuses: [
        AssignmentStatus.PENDING,
        AssignmentStatus.ASSIGNED,
      ],
    });

    await this.assignmentRepository.logAuditEvent(
      organizationId,
      AssignmentAuditEventType.ASSIGNMENT_REJECTED,
      assignment.id,
      actorUserId,
      { deliveryPartnerId, reason },
    );

    return this.getDeliveryPartnerAssignmentDetail(
      assignment.id,
      deliveryPartnerId,
      organizationId,
    );
  }

  /**
   * Delivery Partner: View history timeline.
   */
  async getDeliveryPartnerAssignmentHistory(
    assignmentIdentifier: string,
    deliveryPartnerId: string,
    organizationId: string,
  ): Promise<AssignmentHistoryResponseDto[]> {
    const assignment = await this.assignmentRepository.findAssignmentById(
      assignmentIdentifier,
      organizationId,
    );

    if (!assignment || assignment.deliveryPartnerId !== deliveryPartnerId) {
      throw new NotFoundException({
        code: AssignmentErrorCode.ASSIGNMENT_NOT_FOUND,
        message: 'Assignment not found',
      });
    }

    const history = await this.assignmentRepository.findAssignmentHistory(
      assignment.id,
      organizationId,
    );

    return history.map((h) => ({
      id: h.id,
      assignmentId: assignment.publicId,
      action: h.action,
      actorUserId: h.actorUserId,
      details: h.details,
      createdAt: h.createdAt,
    }));
  }

  /**
   * Helper: Serialize complete Prisma assignment model into AssignmentResponseDto.
   */
  private serializeAssignment(assignment: any): AssignmentResponseDto {
    return {
      id: assignment.id,
      publicId: assignment.publicId,
      bookingId: assignment.bookingId,
      organizationId: assignment.organizationId,
      providerId: assignment.providerId,
      deliveryPartnerId: assignment.deliveryPartnerId,
      type: assignment.type,
      status: assignment.status,
      notes: assignment.notes,
      assignedAt: assignment.assignedAt,
      acceptedAt: assignment.acceptedAt,
      completedAt: assignment.completedAt,
      cancelledAt: assignment.cancelledAt,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,
      booking: assignment.booking
        ? {
            id: assignment.booking.id,
            bookingNumber: assignment.booking.bookingNumber,
            status: assignment.booking.status,
            scheduledAt: assignment.booking.scheduledAt,
            totalAmount: assignment.booking.totalAmount.toString(),
            currency: assignment.booking.currency,
          }
        : null,
      provider: assignment.provider
        ? {
            id: assignment.provider.id,
            publicId: assignment.provider.publicId,
            businessName: assignment.provider.businessName,
            fullName: assignment.provider.fullName,
            phone: assignment.provider.phone,
          }
        : null,
      deliveryPartner: assignment.deliveryPartner
        ? {
            id: assignment.deliveryPartner.id,
            publicId: assignment.deliveryPartner.publicId,
            fullName: assignment.deliveryPartner.fullName,
            phone: assignment.deliveryPartner.phone,
            vehicleType: assignment.deliveryPartner.vehicleType,
          }
        : null,
      history: (assignment.history || []).map((h: any) => ({
        id: h.id,
        assignmentId: assignment.publicId,
        action: h.action,
        actorUserId: h.actorUserId,
        details: h.details,
        createdAt: h.createdAt,
      })),
    };
  }
}
