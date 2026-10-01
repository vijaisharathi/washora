import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DisputeOutcome,
  DisputeParticipantType,
  DisputeStatus,
  Prisma,
  RoleType,
  SupportPriority,
} from '@prisma/client';
import {
  AssignDisputeDto,
  CreateDisputeDto,
  CreateDisputeMessageDto,
  DisputeActivityResponseDto,
  DisputeListQueryDto,
  DisputeMessageResponseDto,
  DisputeResponseDto,
  EscalateDisputeDto,
  RejectDisputeDto,
  ResolveDisputeDto,
  UpdateSupportPriorityDto,
} from '../dto';
import { SupportRepository } from '../repositories/support.repository';
import {
  isValidDisputeTransition,
  SupportErrorCode,
} from '../types/support.types';
import { DisputeFinancialService } from './dispute-financial.service';

@Injectable()
export class DisputeService {
  constructor(
    private readonly supportRepo: SupportRepository,
    private readonly financialService: DisputeFinancialService,
  ) {}

  mapToResponseDto(dispute: any): DisputeResponseDto {
    return {
      id: dispute.id,
      publicId: dispute.publicId,
      organizationId: dispute.organizationId,
      ticketId: dispute.ticketId,
      ticketPublicId: dispute.ticket?.publicId ?? null,
      bookingId: dispute.bookingId,
      bookingNumber: dispute.booking?.bookingNumber ?? '',
      paymentId: dispute.paymentId,
      paymentPublicId: dispute.payment?.publicId ?? null,
      createdByUserId: dispute.createdByUserId,
      raisedByType: dispute.raisedByType,
      customerId: dispute.customerId,
      providerId: dispute.providerId,
      deliveryPartnerId: dispute.deliveryPartnerId,
      category: dispute.type,
      priority: dispute.priority,
      status: dispute.status,
      claimAmount: dispute.claimAmount ? dispute.claimAmount.toString() : null,
      resolvedAmount: dispute.resolvedAmount ? dispute.resolvedAmount.toString() : null,
      currency: dispute.currency,
      outcome: dispute.outcome,
      resolutionType: dispute.resolutionType,
      resolutionNote: dispute.resolutionNote,
      reason: dispute.reason,
      description: dispute.description,
      assignedToUserId: dispute.assignedToUserId,
      assigneeName: dispute.assignedToUser?.email ?? null,
      decisionReason: dispute.decisionReason,
      resolvedAt: dispute.resolvedAt,
      closedAt: dispute.closedAt,
      createdAt: dispute.createdAt,
      updatedAt: dispute.updatedAt,
      evidenceCount: dispute._count?.evidence ?? undefined,
      messagesCount: dispute._count?.messages ?? undefined,
    };
  }

  // ============================================================================
  // 1. DISPUTE CREATION
  // ============================================================================

  async createCustomerDispute(
    organizationId: string,
    userId: string,
    dto: CreateDisputeDto,
  ): Promise<DisputeResponseDto> {
    const user = await this.supportRepo.findUserById(userId);
    const customer = user?.customers.find((c) => c.organizationId === organizationId);
    if (!customer) {
      throw new ForbiddenException({
        code: SupportErrorCode.DISPUTE_ACCESS_DENIED,
        message: 'No customer profile found for the authenticated user in this organization.',
      });
    }

    const booking = await this.supportRepo.findBookingByIdentifier(
      organizationId,
      dto.bookingId,
    );
    if (!booking || booking.customerId !== customer.id) {
      throw new BadRequestException({
        code: SupportErrorCode.DISPUTE_NOT_ELIGIBLE,
        message: 'The referenced booking does not belong to your customer profile.',
      });
    }

    // Check duplicate active dispute for this booking
    const activeDispute = await this.supportRepo.findActiveDisputeForBooking(
      organizationId,
      booking.id,
      customer.id,
    );
    if (activeDispute) {
      throw new ConflictException({
        code: SupportErrorCode.DISPUTE_ALREADY_EXISTS,
        message: `An active dispute (${activeDispute.publicId}) already exists for this booking.`,
      });
    }

    let claimAmount: Prisma.Decimal | null = null;
    if (dto.amount) {
      claimAmount = new Prisma.Decimal(dto.amount);
      if (claimAmount.lte(0)) {
        throw new BadRequestException({
          code: SupportErrorCode.VALIDATION_ERROR,
          message: 'Claim amount must be greater than zero.',
        });
      }
      if (claimAmount.gt(booking.totalAmount)) {
        throw new BadRequestException({
          code: SupportErrorCode.VALIDATION_ERROR,
          message: `Claim amount cannot exceed booking total amount (${booking.totalAmount.toFixed(2)}).`,
        });
      }
    }

    const dispute = await this.supportRepo.createDisputeTx({
      organizationId,
      bookingId: booking.id,
      paymentId: booking.payment?.id ?? null,
      createdByUserId: userId,
      raisedByType: DisputeParticipantType.CUSTOMER,
      customerId: customer.id,
      type: dto.category,
      priority: SupportPriority.HIGH,
      claimAmount,
      currency: dto.currency || 'INR',
      reason: dto.reason,
      description: dto.description || dto.reason,
    });

    return this.mapToResponseDto(dispute);
  }

  async createProviderDispute(
    organizationId: string,
    userId: string,
    dto: CreateDisputeDto,
  ): Promise<DisputeResponseDto> {
    const user = await this.supportRepo.findUserById(userId);
    const provider = user?.providers.find((p) => p.organizationId === organizationId);
    if (!provider) {
      throw new ForbiddenException({
        code: SupportErrorCode.DISPUTE_ACCESS_DENIED,
        message: 'No provider profile found for the authenticated user in this organization.',
      });
    }

    const booking = await this.supportRepo.findBookingByIdentifier(
      organizationId,
      dto.bookingId,
    );
    const isAssigned =
      booking &&
      (booking.providerId === provider.id ||
        booking.assignments?.some((a) => a.providerId === provider.id));

    if (!booking || !isAssigned) {
      throw new BadRequestException({
        code: SupportErrorCode.DISPUTE_NOT_ELIGIBLE,
        message: 'The referenced booking is not associated with your provider profile.',
      });
    }

    const activeDispute = await this.supportRepo.findActiveDisputeForBooking(
      organizationId,
      booking.id,
      null,
      provider.id,
    );
    if (activeDispute) {
      throw new ConflictException({
        code: SupportErrorCode.DISPUTE_ALREADY_EXISTS,
        message: `An active dispute (${activeDispute.publicId}) already exists for this booking.`,
      });
    }

    const dispute = await this.supportRepo.createDisputeTx({
      organizationId,
      bookingId: booking.id,
      paymentId: booking.payment?.id ?? null,
      createdByUserId: userId,
      raisedByType: DisputeParticipantType.PROVIDER,
      providerId: provider.id,
      type: dto.category,
      priority: SupportPriority.HIGH,
      claimAmount: dto.amount ? new Prisma.Decimal(dto.amount) : null,
      currency: dto.currency || 'INR',
      reason: dto.reason,
      description: dto.description || dto.reason,
    });

    return this.mapToResponseDto(dispute);
  }

  async createDeliveryPartnerDispute(
    organizationId: string,
    userId: string,
    dto: CreateDisputeDto,
  ): Promise<DisputeResponseDto> {
    const user = await this.supportRepo.findUserById(userId);
    const delivery = user?.deliveryPartners.find(
      (d) => d.organizationId === organizationId,
    );
    if (!delivery) {
      throw new ForbiddenException({
        code: SupportErrorCode.DISPUTE_ACCESS_DENIED,
        message: 'No delivery partner profile found for the authenticated user.',
      });
    }

    const booking = await this.supportRepo.findBookingByIdentifier(
      organizationId,
      dto.bookingId,
    );
    const isAssigned =
      booking &&
      booking.assignments?.some((a) => a.deliveryPartnerId === delivery.id);

    if (!booking || !isAssigned) {
      throw new BadRequestException({
        code: SupportErrorCode.DISPUTE_NOT_ELIGIBLE,
        message: 'The referenced booking is not associated with your delivery partner assignments.',
      });
    }

    const activeDispute = await this.supportRepo.findActiveDisputeForBooking(
      organizationId,
      booking.id,
      null,
      null,
      delivery.id,
    );
    if (activeDispute) {
      throw new ConflictException({
        code: SupportErrorCode.DISPUTE_ALREADY_EXISTS,
        message: `An active dispute (${activeDispute.publicId}) already exists for this booking.`,
      });
    }

    const dispute = await this.supportRepo.createDisputeTx({
      organizationId,
      bookingId: booking.id,
      paymentId: booking.payment?.id ?? null,
      createdByUserId: userId,
      raisedByType: DisputeParticipantType.DELIVERY_PARTNER,
      deliveryPartnerId: delivery.id,
      type: dto.category,
      priority: SupportPriority.HIGH,
      claimAmount: dto.amount ? new Prisma.Decimal(dto.amount) : null,
      currency: dto.currency || 'INR',
      reason: dto.reason,
      description: dto.description || dto.reason,
    });

    return this.mapToResponseDto(dispute);
  }

  // ============================================================================
  // 2. RETRIEVAL & QUEUES
  // ============================================================================

  async getDispute(
    organizationId: string,
    disputeIdentifier: string,
    userId: string,
    userRoles: RoleType[],
  ): Promise<DisputeResponseDto> {
    const dispute = await this.supportRepo.findDisputeByIdentifier(
      organizationId,
      disputeIdentifier,
    );
    if (!dispute) {
      throw new NotFoundException({
        code: SupportErrorCode.DISPUTE_NOT_FOUND,
        message: `Dispute '${disputeIdentifier}' was not found.`,
      });
    }

    const isOperations =
      userRoles.includes(RoleType.ADMIN) ||
      userRoles.includes(RoleType.OPERATIONS) ||
      userRoles.includes(RoleType.SUPPORT_LEAD) ||
      userRoles.includes(RoleType.SUPPORT_AGENT);

    if (!isOperations) {
      const user = await this.supportRepo.findUserById(userId);
      const customer = user?.customers.find((c) => c.organizationId === organizationId);
      const provider = user?.providers.find((p) => p.organizationId === organizationId);
      const delivery = user?.deliveryPartners.find((d) => d.organizationId === organizationId);

      const isParticipant =
        dispute.createdByUserId === userId ||
        (customer && dispute.customerId === customer.id) ||
        (provider && dispute.providerId === provider.id) ||
        (delivery && dispute.deliveryPartnerId === delivery.id);

      if (!isParticipant) {
        throw new ForbiddenException({
          code: SupportErrorCode.DISPUTE_ACCESS_DENIED,
          message: 'You do not have permission to access this dispute.',
        });
      }
    }

    return this.mapToResponseDto(dispute);
  }

  async listCustomerDisputes(
    organizationId: string,
    userId: string,
    query: DisputeListQueryDto,
  ) {
    const user = await this.supportRepo.findUserById(userId);
    const customer = user?.customers.find((c) => c.organizationId === organizationId);
    if (!customer) {
      throw new ForbiddenException({
        code: SupportErrorCode.DISPUTE_ACCESS_DENIED,
        message: 'No customer profile found.',
      });
    }

    const result = await this.supportRepo.listDisputesPaged(organizationId, query, {
      customerId: customer.id,
    });

    return {
      ...result,
      items: result.items.map((d) => this.mapToResponseDto(d)),
    };
  }

  async listProviderDisputes(
    organizationId: string,
    userId: string,
    query: DisputeListQueryDto,
  ) {
    const user = await this.supportRepo.findUserById(userId);
    const provider = user?.providers.find((p) => p.organizationId === organizationId);
    if (!provider) {
      throw new ForbiddenException({
        code: SupportErrorCode.DISPUTE_ACCESS_DENIED,
        message: 'No provider profile found.',
      });
    }

    const result = await this.supportRepo.listDisputesPaged(organizationId, query, {
      providerId: provider.id,
    });

    return {
      ...result,
      items: result.items.map((d) => this.mapToResponseDto(d)),
    };
  }

  async listDeliveryPartnerDisputes(
    organizationId: string,
    userId: string,
    query: DisputeListQueryDto,
  ) {
    const user = await this.supportRepo.findUserById(userId);
    const delivery = user?.deliveryPartners.find((d) => d.organizationId === organizationId);
    if (!delivery) {
      throw new ForbiddenException({
        code: SupportErrorCode.DISPUTE_ACCESS_DENIED,
        message: 'No delivery partner profile found.',
      });
    }

    const result = await this.supportRepo.listDisputesPaged(organizationId, query, {
      deliveryPartnerId: delivery.id,
    });

    return {
      ...result,
      items: result.items.map((d) => this.mapToResponseDto(d)),
    };
  }

  async listOperationsQueue(
    organizationId: string,
    query: DisputeListQueryDto,
  ) {
    const result = await this.supportRepo.listDisputesPaged(organizationId, query);
    return {
      ...result,
      items: result.items.map((d) => this.mapToResponseDto(d)),
    };
  }

  // ============================================================================
  // 3. INVESTIGATION LIFECYCLE ACTIONS
  // ============================================================================

  async startReview(
    organizationId: string,
    disputeIdentifier: string,
    operatorUserId: string,
  ): Promise<DisputeResponseDto> {
    const dispute = await this.supportRepo.findDisputeByIdentifier(
      organizationId,
      disputeIdentifier,
    );
    if (!dispute) {
      throw new NotFoundException({
        code: SupportErrorCode.DISPUTE_NOT_FOUND,
        message: `Dispute '${disputeIdentifier}' was not found.`,
      });
    }

    if (!isValidDisputeTransition(dispute.status, DisputeStatus.UNDER_REVIEW)) {
      throw new BadRequestException({
        code: SupportErrorCode.DISPUTE_INVALID_STATE,
        message: `Cannot start review from current status '${dispute.status}'.`,
      });
    }

    const updated = await this.supportRepo.updateDisputeStatus(
      organizationId,
      dispute.id,
      DisputeStatus.UNDER_REVIEW,
      dispute.status,
      operatorUserId,
      'Operations staff commenced active investigation review.',
    );

    return this.mapToResponseDto(updated);
  }

  async requestCustomerResponse(
    organizationId: string,
    disputeIdentifier: string,
    operatorUserId: string,
  ): Promise<DisputeResponseDto> {
    const dispute = await this.supportRepo.findDisputeByIdentifier(
      organizationId,
      disputeIdentifier,
    );
    if (!dispute) {
      throw new NotFoundException({
        code: SupportErrorCode.DISPUTE_NOT_FOUND,
        message: `Dispute '${disputeIdentifier}' was not found.`,
      });
    }

    if (!isValidDisputeTransition(dispute.status, DisputeStatus.WAITING_FOR_CUSTOMER)) {
      throw new BadRequestException({
        code: SupportErrorCode.DISPUTE_INVALID_STATE,
        message: `Cannot request customer response from status '${dispute.status}'.`,
      });
    }

    const updated = await this.supportRepo.updateDisputeStatus(
      organizationId,
      dispute.id,
      DisputeStatus.WAITING_FOR_CUSTOMER,
      dispute.status,
      operatorUserId,
      'Response and additional clarification requested from customer.',
    );

    return this.mapToResponseDto(updated);
  }

  async requestProviderResponse(
    organizationId: string,
    disputeIdentifier: string,
    operatorUserId: string,
  ): Promise<DisputeResponseDto> {
    const dispute = await this.supportRepo.findDisputeByIdentifier(
      organizationId,
      disputeIdentifier,
    );
    if (!dispute) {
      throw new NotFoundException({
        code: SupportErrorCode.DISPUTE_NOT_FOUND,
        message: `Dispute '${disputeIdentifier}' was not found.`,
      });
    }

    if (!isValidDisputeTransition(dispute.status, DisputeStatus.WAITING_FOR_PROVIDER)) {
      throw new BadRequestException({
        code: SupportErrorCode.DISPUTE_INVALID_STATE,
        message: `Cannot request provider response from status '${dispute.status}'.`,
      });
    }

    const updated = await this.supportRepo.updateDisputeStatus(
      organizationId,
      dispute.id,
      DisputeStatus.WAITING_FOR_PROVIDER,
      dispute.status,
      operatorUserId,
      'Response and evidence requested from provider.',
    );

    return this.mapToResponseDto(updated);
  }

  async requestDeliveryResponse(
    organizationId: string,
    disputeIdentifier: string,
    operatorUserId: string,
  ): Promise<DisputeResponseDto> {
    const dispute = await this.supportRepo.findDisputeByIdentifier(
      organizationId,
      disputeIdentifier,
    );
    if (!dispute) {
      throw new NotFoundException({
        code: SupportErrorCode.DISPUTE_NOT_FOUND,
        message: `Dispute '${disputeIdentifier}' was not found.`,
      });
    }

    if (!isValidDisputeTransition(dispute.status, DisputeStatus.WAITING_FOR_DELIVERY_PARTNER)) {
      throw new BadRequestException({
        code: SupportErrorCode.DISPUTE_INVALID_STATE,
        message: `Cannot request delivery partner response from status '${dispute.status}'.`,
      });
    }

    const updated = await this.supportRepo.updateDisputeStatus(
      organizationId,
      dispute.id,
      DisputeStatus.WAITING_FOR_DELIVERY_PARTNER,
      dispute.status,
      operatorUserId,
      'Response and transit verification requested from delivery partner.',
    );

    return this.mapToResponseDto(updated);
  }

  // ============================================================================
  // 4. ASSIGNMENT & PRIORITY
  // ============================================================================

  async assignDispute(
    organizationId: string,
    disputeIdentifier: string,
    dto: AssignDisputeDto,
    operatorUserId: string,
  ): Promise<DisputeResponseDto> {
    const dispute = await this.supportRepo.findDisputeByIdentifier(
      organizationId,
      disputeIdentifier,
    );
    if (!dispute) {
      throw new NotFoundException({
        code: SupportErrorCode.DISPUTE_NOT_FOUND,
        message: `Dispute '${disputeIdentifier}' was not found.`,
      });
    }

    const targetUser = await this.supportRepo.findUserById(dto.assignedToUserId);
    const member = targetUser?.organizationMembers.find(
      (m) => m.organizationId === organizationId && m.status === 'ACTIVE',
    );

    if (!member) {
      throw new BadRequestException({
        code: SupportErrorCode.SUPPORT_ASSIGNEE_INVALID,
        message: 'Assigned user does not have an active membership in this organization.',
      });
    }

    const updated = await this.supportRepo.assignDispute(
      organizationId,
      dispute.id,
      dto.assignedToUserId,
      dispute.assignedToUserId,
      operatorUserId,
      dto.reason,
    );

    return this.mapToResponseDto(updated);
  }

  async unassignDispute(
    organizationId: string,
    disputeIdentifier: string,
    operatorUserId: string,
  ): Promise<DisputeResponseDto> {
    const dispute = await this.supportRepo.findDisputeByIdentifier(
      organizationId,
      disputeIdentifier,
    );
    if (!dispute) {
      throw new NotFoundException({
        code: SupportErrorCode.DISPUTE_NOT_FOUND,
        message: `Dispute '${disputeIdentifier}' was not found.`,
      });
    }

    const updated = await this.supportRepo.assignDispute(
      organizationId,
      dispute.id,
      null,
      dispute.assignedToUserId,
      operatorUserId,
    );

    return this.mapToResponseDto(updated);
  }

  async updatePriority(
    organizationId: string,
    disputeIdentifier: string,
    dto: UpdateSupportPriorityDto,
    operatorUserId: string,
  ): Promise<DisputeResponseDto> {
    const dispute = await this.supportRepo.findDisputeByIdentifier(
      organizationId,
      disputeIdentifier,
    );
    if (!dispute) {
      throw new NotFoundException({
        code: SupportErrorCode.DISPUTE_NOT_FOUND,
        message: `Dispute '${disputeIdentifier}' was not found.`,
      });
    }

    const updated = await this.supportRepo.updateDisputePriority(
      organizationId,
      dispute.id,
      dto.priority,
      dispute.priority,
      operatorUserId,
    );

    return this.mapToResponseDto(updated);
  }

  async escalateDispute(
    organizationId: string,
    disputeIdentifier: string,
    dto: EscalateDisputeDto,
    operatorUserId: string,
  ): Promise<DisputeResponseDto> {
    const dispute = await this.supportRepo.findDisputeByIdentifier(
      organizationId,
      disputeIdentifier,
    );
    if (!dispute) {
      throw new NotFoundException({
        code: SupportErrorCode.DISPUTE_NOT_FOUND,
        message: `Dispute '${disputeIdentifier}' was not found.`,
      });
    }

    if (!isValidDisputeTransition(dispute.status, DisputeStatus.ESCALATED)) {
      throw new BadRequestException({
        code: SupportErrorCode.DISPUTE_INVALID_STATE,
        message: `Cannot escalate dispute from current status '${dispute.status}'.`,
      });
    }

    const updated = await this.supportRepo.updateDisputeStatus(
      organizationId,
      dispute.id,
      DisputeStatus.ESCALATED,
      dispute.status,
      operatorUserId,
      dto.reason,
    );

    return this.mapToResponseDto(updated);
  }

  // ============================================================================
  // 5. RESOLUTION, REJECTION, CLOSURE & REOPENING
  // ============================================================================

  async resolveDispute(
    organizationId: string,
    disputeIdentifier: string,
    dto: ResolveDisputeDto,
    operatorUserId: string,
    idempotencyKey?: string,
  ): Promise<DisputeResponseDto> {
    const dispute = await this.supportRepo.findDisputeByIdentifier(
      organizationId,
      disputeIdentifier,
    );
    if (!dispute) {
      throw new NotFoundException({
        code: SupportErrorCode.DISPUTE_NOT_FOUND,
        message: `Dispute '${disputeIdentifier}' was not found.`,
      });
    }

    if (!isValidDisputeTransition(dispute.status, DisputeStatus.RESOLVED)) {
      throw new BadRequestException({
        code: SupportErrorCode.DISPUTE_INVALID_STATE,
        message: `Cannot resolve dispute from status '${dispute.status}'. Must be UNDER_REVIEW or ESCALATED.`,
      });
    }

    const resolved = await this.financialService.executeDisputeResolution(
      organizationId,
      dispute,
      dto,
      operatorUserId,
      idempotencyKey,
    );

    return this.mapToResponseDto(resolved);
  }

  async rejectDispute(
    organizationId: string,
    disputeIdentifier: string,
    dto: RejectDisputeDto,
    operatorUserId: string,
  ): Promise<DisputeResponseDto> {
    const dispute = await this.supportRepo.findDisputeByIdentifier(
      organizationId,
      disputeIdentifier,
    );
    if (!dispute) {
      throw new NotFoundException({
        code: SupportErrorCode.DISPUTE_NOT_FOUND,
        message: `Dispute '${disputeIdentifier}' was not found.`,
      });
    }

    if (!isValidDisputeTransition(dispute.status, DisputeStatus.REJECTED)) {
      throw new BadRequestException({
        code: SupportErrorCode.DISPUTE_INVALID_STATE,
        message: `Cannot reject dispute from status '${dispute.status}'.`,
      });
    }

    const updated = await this.supportRepo.rejectDispute(
      organizationId,
      dispute.id,
      dto.decisionReason,
      dispute.status,
      operatorUserId,
    );

    return this.mapToResponseDto(updated);
  }

  async closeDispute(
    organizationId: string,
    disputeIdentifier: string,
    operatorUserId: string,
  ): Promise<DisputeResponseDto> {
    const dispute = await this.supportRepo.findDisputeByIdentifier(
      organizationId,
      disputeIdentifier,
    );
    if (!dispute) {
      throw new NotFoundException({
        code: SupportErrorCode.DISPUTE_NOT_FOUND,
        message: `Dispute '${disputeIdentifier}' was not found.`,
      });
    }

    if (!isValidDisputeTransition(dispute.status, DisputeStatus.CLOSED)) {
      throw new BadRequestException({
        code: SupportErrorCode.DISPUTE_INVALID_STATE,
        message: `Only RESOLVED or REJECTED disputes can be closed (current status: '${dispute.status}').`,
      });
    }

    const updated = await this.supportRepo.updateDisputeStatus(
      organizationId,
      dispute.id,
      DisputeStatus.CLOSED,
      dispute.status,
      operatorUserId,
      'Dispute case permanently closed by operations.',
    );

    return this.mapToResponseDto(updated);
  }

  async reopenDispute(
    organizationId: string,
    disputeIdentifier: string,
    userId: string,
    userRoles: RoleType[],
  ): Promise<DisputeResponseDto> {
    const dispute = await this.supportRepo.findDisputeByIdentifier(
      organizationId,
      disputeIdentifier,
    );
    if (!dispute) {
      throw new NotFoundException({
        code: SupportErrorCode.DISPUTE_NOT_FOUND,
        message: `Dispute '${disputeIdentifier}' was not found.`,
      });
    }

    const isOperations =
      userRoles.includes(RoleType.ADMIN) ||
      userRoles.includes(RoleType.OPERATIONS) ||
      userRoles.includes(RoleType.SUPPORT_LEAD) ||
      userRoles.includes(RoleType.SUPPORT_AGENT);

    if (!isOperations) {
      const user = await this.supportRepo.findUserById(userId);
      const customer = user?.customers.find((c) => c.organizationId === organizationId);
      const provider = user?.providers.find((p) => p.organizationId === organizationId);
      const delivery = user?.deliveryPartners.find((d) => d.organizationId === organizationId);

      const isParticipant =
        dispute.createdByUserId === userId ||
        (customer && dispute.customerId === customer.id) ||
        (provider && dispute.providerId === provider.id) ||
        (delivery && dispute.deliveryPartnerId === delivery.id);

      if (!isParticipant) {
        throw new ForbiddenException({
          code: SupportErrorCode.DISPUTE_ACCESS_DENIED,
          message: 'You can only reopen disputes associated with your account.',
        });
      }
    }

    if (!isValidDisputeTransition(dispute.status, DisputeStatus.REOPENED)) {
      throw new BadRequestException({
        code: SupportErrorCode.DISPUTE_INVALID_STATE,
        message: `Dispute in status '${dispute.status}' cannot be reopened. Only RESOLVED or CLOSED disputes are eligible.`,
      });
    }

    const updated = await this.supportRepo.updateDisputeStatus(
      organizationId,
      dispute.id,
      DisputeStatus.REOPENED,
      dispute.status,
      userId,
      'Dispute reopened for further review.',
    );

    return this.mapToResponseDto(updated);
  }

  // ============================================================================
  // 6. MESSAGING & ACTIVITIES
  // ============================================================================

  async addDisputeMessage(
    organizationId: string,
    disputeIdentifier: string,
    dto: CreateDisputeMessageDto,
    senderUserId: string,
    userRoles: RoleType[],
  ): Promise<DisputeMessageResponseDto> {
    const dispute = await this.supportRepo.findDisputeByIdentifier(
      organizationId,
      disputeIdentifier,
    );
    if (!dispute) {
      throw new NotFoundException({
        code: SupportErrorCode.DISPUTE_NOT_FOUND,
        message: `Dispute '${disputeIdentifier}' was not found.`,
      });
    }

    const isOperations =
      userRoles.includes(RoleType.ADMIN) ||
      userRoles.includes(RoleType.OPERATIONS) ||
      userRoles.includes(RoleType.SUPPORT_LEAD) ||
      userRoles.includes(RoleType.SUPPORT_AGENT);

    if (!isOperations) {
      if (dto.isInternal) {
        throw new ForbiddenException({
          code: SupportErrorCode.SUPPORT_INTERNAL_MESSAGE_ACCESS_DENIED,
          message: 'Participants cannot post internal investigation messages.',
        });
      }

      const user = await this.supportRepo.findUserById(senderUserId);
      const customer = user?.customers.find((c) => c.organizationId === organizationId);
      const provider = user?.providers.find((p) => p.organizationId === organizationId);
      const delivery = user?.deliveryPartners.find((d) => d.organizationId === organizationId);

      const isParticipant =
        dispute.createdByUserId === senderUserId ||
        (customer && dispute.customerId === customer.id) ||
        (provider && dispute.providerId === provider.id) ||
        (delivery && dispute.deliveryPartnerId === delivery.id);

      if (!isParticipant) {
        throw new ForbiddenException({
          code: SupportErrorCode.DISPUTE_ACCESS_DENIED,
          message: 'You can only message disputes you are a participant of.',
        });
      }
    }

    const message = dto.message.trim();
    if (!message) {
      throw new BadRequestException({
        code: SupportErrorCode.VALIDATION_ERROR,
        message: 'Message cannot be empty or whitespace only.',
      });
    }

    const created = await this.supportRepo.createDisputeMessage({
      organizationId,
      disputeId: dispute.id,
      senderUserId,
      message,
      isInternal: isOperations ? !!dto.isInternal : false,
    });

    // If waiting for participant response and participant replies, auto-transition to UNDER_REVIEW
    if (
      !isOperations &&
      (dispute.status === DisputeStatus.WAITING_FOR_CUSTOMER ||
        dispute.status === DisputeStatus.WAITING_FOR_PROVIDER ||
        dispute.status === DisputeStatus.WAITING_FOR_DELIVERY_PARTNER)
    ) {
      await this.supportRepo.updateDisputeStatus(
        organizationId,
        dispute.id,
        DisputeStatus.UNDER_REVIEW,
        dispute.status,
        senderUserId,
        'Participant replied with additional information.',
      );
    }

    return {
      id: created.id,
      publicId: created.publicId,
      disputeId: created.disputeId,
      senderUserId: created.senderUserId,
      senderName: created.senderUser?.email ?? null,
      message: created.message,
      isInternal: created.isInternal,
      createdAt: created.createdAt,
    };
  }

  async listDisputeMessages(
    organizationId: string,
    disputeIdentifier: string,
    userId: string,
    userRoles: RoleType[],
  ): Promise<DisputeMessageResponseDto[]> {
    const dispute = await this.supportRepo.findDisputeByIdentifier(
      organizationId,
      disputeIdentifier,
    );
    if (!dispute) {
      throw new NotFoundException({
        code: SupportErrorCode.DISPUTE_NOT_FOUND,
        message: `Dispute '${disputeIdentifier}' was not found.`,
      });
    }

    const isOperations =
      userRoles.includes(RoleType.ADMIN) ||
      userRoles.includes(RoleType.OPERATIONS) ||
      userRoles.includes(RoleType.SUPPORT_LEAD) ||
      userRoles.includes(RoleType.SUPPORT_AGENT);

    if (!isOperations) {
      const user = await this.supportRepo.findUserById(userId);
      const customer = user?.customers.find((c) => c.organizationId === organizationId);
      const provider = user?.providers.find((p) => p.organizationId === organizationId);
      const delivery = user?.deliveryPartners.find((d) => d.organizationId === organizationId);

      const isParticipant =
        dispute.createdByUserId === userId ||
        (customer && dispute.customerId === customer.id) ||
        (provider && dispute.providerId === provider.id) ||
        (delivery && dispute.deliveryPartnerId === delivery.id);

      if (!isParticipant) {
        throw new ForbiddenException({
          code: SupportErrorCode.DISPUTE_ACCESS_DENIED,
          message: 'You do not have permission to view messages for this dispute.',
        });
      }
    }

    const messages = await this.supportRepo.listDisputeMessages(
      organizationId,
      dispute.id,
      isOperations,
    );

    return messages.map((m) => ({
      id: m.id,
      publicId: m.publicId,
      disputeId: m.disputeId,
      senderUserId: m.senderUserId,
      senderName: m.senderUser?.email ?? null,
      message: m.message,
      isInternal: m.isInternal,
      createdAt: m.createdAt,
    }));
  }

  async getDisputeActivities(
    organizationId: string,
    disputeIdentifier: string,
  ): Promise<DisputeActivityResponseDto[]> {
    const dispute = await this.supportRepo.findDisputeByIdentifier(
      organizationId,
      disputeIdentifier,
    );
    if (!dispute) {
      throw new NotFoundException({
        code: SupportErrorCode.DISPUTE_NOT_FOUND,
        message: `Dispute '${disputeIdentifier}' was not found.`,
      });
    }

    const activities = await this.supportRepo.getDisputeActivities(
      organizationId,
      dispute.id,
    );

    return activities.map((a) => ({
      id: a.id,
      disputeId: a.disputeId,
      actorUserId: a.actorUserId,
      actorName: a.actorUser?.email ?? null,
      action: a.action,
      previousValue: a.previousValue,
      newValue: a.newValue,
      details: a.details,
      metadata: (a.metadata as any) ?? null,
      createdAt: a.createdAt,
    }));
  }
}
