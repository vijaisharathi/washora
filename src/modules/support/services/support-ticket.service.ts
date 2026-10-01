import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DisputeParticipantType,
  RoleType,
  SupportCategory,
  SupportPriority,
  SupportRequesterType,
  SupportStatus,
} from '@prisma/client';
import {
  AssignSupportTicketDto,
  CreateDisputeFromTicketDto,
  CreateSupportTicketDto,
  DisputeResponseDto,
  EscalateSupportTicketDto,
  ResolveSupportTicketDto,
  SupportActivityResponseDto,
  SupportTicketListQueryDto,
  SupportTicketResponseDto,
  UpdateSupportPriorityDto,
} from '../dto';
import { SupportRepository } from '../repositories/support.repository';
import {
  isValidSupportTransition,
  SupportErrorCode,
} from '../types/support.types';

@Injectable()
export class SupportTicketService {
  constructor(private readonly supportRepo: SupportRepository) {}

  mapToResponseDto(
    ticket: any,
    isOperations = false,
  ): SupportTicketResponseDto {
    return {
      id: ticket.id,
      publicId: ticket.publicId,
      organizationId: ticket.organizationId,
      requesterType: ticket.requesterType,
      createdByUserId: ticket.createdByUserId,
      customerId: ticket.customerId,
      providerId: ticket.providerId,
      deliveryPartnerId: ticket.deliveryPartnerId,
      bookingId: ticket.bookingId,
      bookingNumber: ticket.booking?.bookingNumber ?? null,
      paymentId: ticket.paymentId,
      paymentPublicId: ticket.payment?.publicId ?? null,
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      subject: ticket.subject,
      description: ticket.description,
      assignedToUserId: ticket.assignedToUserId,
      assigneeName: ticket.assignedToUser?.email ?? null,
      resolvedAt: ticket.resolvedAt,
      resolutionNote: ticket.resolutionNote,
      closedAt: ticket.closedAt,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      messagesCount: ticket._count?.messages ?? undefined,
      notesCount: isOperations ? ticket._count?.notes : undefined,
    };
  }

  // ============================================================================
  // 1. TICKET CREATION
  // ============================================================================

  async createCustomerTicket(
    organizationId: string,
    userId: string,
    dto: CreateSupportTicketDto,
  ): Promise<SupportTicketResponseDto> {
    const user = await this.supportRepo.findUserById(userId);
    const customer = user?.customers.find((c) => c.organizationId === organizationId);
    if (!customer) {
      throw new ForbiddenException({
        code: SupportErrorCode.SUPPORT_TICKET_ACCESS_DENIED,
        message: 'No customer profile found for the authenticated user in this organization.',
      });
    }

    let bookingId: string | null = null;
    let paymentId: string | null = null;

    if (dto.bookingId) {
      const booking = await this.supportRepo.findBookingByIdentifier(
        organizationId,
        dto.bookingId,
      );
      if (!booking || booking.customerId !== customer.id) {
        throw new BadRequestException({
          code: SupportErrorCode.SUPPORT_TICKET_ACCESS_DENIED,
          message: 'The referenced booking was not found or does not belong to your customer profile.',
        });
      }
      bookingId = booking.id;
      paymentId = booking.payment?.id ?? null;
    }

    if (dto.paymentId) {
      const payment = await this.supportRepo.findPaymentByIdentifier(
        organizationId,
        dto.paymentId,
      );
      if (!payment) {
        throw new BadRequestException({
          code: SupportErrorCode.SUPPORT_TICKET_ACCESS_DENIED,
          message: 'Referenced payment was not found in this organization.',
        });
      }
      paymentId = payment.id;
    }

    const ticket = await this.supportRepo.createTicketTx({
      organizationId,
      requesterType: SupportRequesterType.CUSTOMER,
      createdByUserId: userId,
      customerId: customer.id,
      bookingId,
      paymentId,
      category: dto.category,
      priority: dto.priority ?? SupportPriority.MEDIUM,
      subject: dto.subject,
      description: dto.description,
    });

    return this.mapToResponseDto(ticket);
  }

  async createProviderTicket(
    organizationId: string,
    userId: string,
    dto: CreateSupportTicketDto,
  ): Promise<SupportTicketResponseDto> {
    const user = await this.supportRepo.findUserById(userId);
    const provider = user?.providers.find((p) => p.organizationId === organizationId);
    if (!provider) {
      throw new ForbiddenException({
        code: SupportErrorCode.SUPPORT_TICKET_ACCESS_DENIED,
        message: 'No provider profile found for the authenticated user in this organization.',
      });
    }

    let bookingId: string | null = null;
    let paymentId: string | null = null;

    if (dto.bookingId) {
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
          code: SupportErrorCode.SUPPORT_TICKET_ACCESS_DENIED,
          message: 'The referenced booking is not legitimately associated with your provider account.',
        });
      }
      bookingId = booking.id;
      paymentId = booking.payment?.id ?? null;
    }

    const ticket = await this.supportRepo.createTicketTx({
      organizationId,
      requesterType: SupportRequesterType.PROVIDER,
      createdByUserId: userId,
      providerId: provider.id,
      bookingId,
      paymentId,
      category: dto.category,
      priority: dto.priority ?? SupportPriority.MEDIUM,
      subject: dto.subject,
      description: dto.description,
    });

    return this.mapToResponseDto(ticket);
  }

  async createDeliveryPartnerTicket(
    organizationId: string,
    userId: string,
    dto: CreateSupportTicketDto,
  ): Promise<SupportTicketResponseDto> {
    const user = await this.supportRepo.findUserById(userId);
    const deliveryPartner = user?.deliveryPartners.find(
      (d) => d.organizationId === organizationId,
    );
    if (!deliveryPartner) {
      throw new ForbiddenException({
        code: SupportErrorCode.SUPPORT_TICKET_ACCESS_DENIED,
        message: 'No delivery partner profile found for the authenticated user in this organization.',
      });
    }

    let bookingId: string | null = null;
    let paymentId: string | null = null;

    if (dto.bookingId) {
      const booking = await this.supportRepo.findBookingByIdentifier(
        organizationId,
        dto.bookingId,
      );
      const isAssigned =
        booking &&
        booking.assignments?.some((a) => a.deliveryPartnerId === deliveryPartner.id);

      if (!booking || !isAssigned) {
        throw new BadRequestException({
          code: SupportErrorCode.SUPPORT_TICKET_ACCESS_DENIED,
          message: 'The referenced booking is not associated with your delivery partner assignments.',
        });
      }
      bookingId = booking.id;
      paymentId = booking.payment?.id ?? null;
    }

    const ticket = await this.supportRepo.createTicketTx({
      organizationId,
      requesterType: SupportRequesterType.DELIVERY_PARTNER,
      createdByUserId: userId,
      deliveryPartnerId: deliveryPartner.id,
      bookingId,
      paymentId,
      category: dto.category,
      priority: dto.priority ?? SupportPriority.MEDIUM,
      subject: dto.subject,
      description: dto.description,
    });

    return this.mapToResponseDto(ticket);
  }

  // ============================================================================
  // 2. RETRIEVAL & QUEUES
  // ============================================================================

  async getTicket(
    organizationId: string,
    ticketIdentifier: string,
    userId: string,
    userRoles: RoleType[],
  ): Promise<SupportTicketResponseDto> {
    const ticket = await this.supportRepo.findTicketByIdentifier(
      organizationId,
      ticketIdentifier,
    );
    if (!ticket) {
      throw new NotFoundException({
        code: SupportErrorCode.SUPPORT_TICKET_NOT_FOUND,
        message: `Support ticket '${ticketIdentifier}' was not found.`,
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

      const isOwner =
        ticket.createdByUserId === userId ||
        (customer && ticket.customerId === customer.id) ||
        (provider && ticket.providerId === provider.id) ||
        (delivery && ticket.deliveryPartnerId === delivery.id);

      if (!isOwner) {
        throw new ForbiddenException({
          code: SupportErrorCode.SUPPORT_TICKET_ACCESS_DENIED,
          message: 'You do not have permission to access this support ticket.',
        });
      }
    }

    return this.mapToResponseDto(ticket, isOperations);
  }

  async listCustomerTickets(
    organizationId: string,
    userId: string,
    query: SupportTicketListQueryDto,
  ) {
    const user = await this.supportRepo.findUserById(userId);
    const customer = user?.customers.find((c) => c.organizationId === organizationId);
    if (!customer) {
      throw new ForbiddenException({
        code: SupportErrorCode.SUPPORT_TICKET_ACCESS_DENIED,
        message: 'No customer profile found.',
      });
    }

    const result = await this.supportRepo.listTicketsPaged(organizationId, query, {
      customerId: customer.id,
    });

    return {
      ...result,
      items: result.items.map((t) => this.mapToResponseDto(t, false)),
    };
  }

  async listProviderTickets(
    organizationId: string,
    userId: string,
    query: SupportTicketListQueryDto,
  ) {
    const user = await this.supportRepo.findUserById(userId);
    const provider = user?.providers.find((p) => p.organizationId === organizationId);
    if (!provider) {
      throw new ForbiddenException({
        code: SupportErrorCode.SUPPORT_TICKET_ACCESS_DENIED,
        message: 'No provider profile found.',
      });
    }

    const result = await this.supportRepo.listTicketsPaged(organizationId, query, {
      providerId: provider.id,
    });

    return {
      ...result,
      items: result.items.map((t) => this.mapToResponseDto(t, false)),
    };
  }

  async listDeliveryPartnerTickets(
    organizationId: string,
    userId: string,
    query: SupportTicketListQueryDto,
  ) {
    const user = await this.supportRepo.findUserById(userId);
    const delivery = user?.deliveryPartners.find((d) => d.organizationId === organizationId);
    if (!delivery) {
      throw new ForbiddenException({
        code: SupportErrorCode.SUPPORT_TICKET_ACCESS_DENIED,
        message: 'No delivery partner profile found.',
      });
    }

    const result = await this.supportRepo.listTicketsPaged(organizationId, query, {
      deliveryPartnerId: delivery.id,
    });

    return {
      ...result,
      items: result.items.map((t) => this.mapToResponseDto(t, false)),
    };
  }

  async listOperationsQueue(
    organizationId: string,
    query: SupportTicketListQueryDto,
  ) {
    const result = await this.supportRepo.listTicketsPaged(organizationId, query);
    return {
      ...result,
      items: result.items.map((t) => this.mapToResponseDto(t, true)),
    };
  }

  // ============================================================================
  // 3. TICKET LIFECYCLE & MUTATIONS
  // ============================================================================

  async assignTicket(
    organizationId: string,
    ticketIdentifier: string,
    dto: AssignSupportTicketDto,
    operatorUserId: string,
  ): Promise<SupportTicketResponseDto> {
    const ticket = await this.supportRepo.findTicketByIdentifier(
      organizationId,
      ticketIdentifier,
    );
    if (!ticket) {
      throw new NotFoundException({
        code: SupportErrorCode.SUPPORT_TICKET_NOT_FOUND,
        message: `Support ticket '${ticketIdentifier}' was not found.`,
      });
    }

    // Verify target user belongs to org and has operations/admin role
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

    const allowedRoles: RoleType[] = [
      RoleType.ADMIN,
      RoleType.OPERATIONS,
      RoleType.SUPPORT_LEAD,
      RoleType.SUPPORT_AGENT,
    ];

    if (!allowedRoles.includes(member.role.type as RoleType)) {
      throw new BadRequestException({
        code: SupportErrorCode.SUPPORT_ASSIGNEE_INVALID,
        message: 'Assigned user must hold an operations or administrative role.',
      });
    }

    const updated = await this.supportRepo.assignTicket(
      organizationId,
      ticket.id,
      dto.assignedToUserId,
      ticket.assignedToUserId,
      operatorUserId,
      dto.reason,
    );

    return this.mapToResponseDto(updated, true);
  }

  async unassignTicket(
    organizationId: string,
    ticketIdentifier: string,
    operatorUserId: string,
  ): Promise<SupportTicketResponseDto> {
    const ticket = await this.supportRepo.findTicketByIdentifier(
      organizationId,
      ticketIdentifier,
    );
    if (!ticket) {
      throw new NotFoundException({
        code: SupportErrorCode.SUPPORT_TICKET_NOT_FOUND,
        message: `Support ticket '${ticketIdentifier}' was not found.`,
      });
    }

    const updated = await this.supportRepo.assignTicket(
      organizationId,
      ticket.id,
      null,
      ticket.assignedToUserId,
      operatorUserId,
    );

    return this.mapToResponseDto(updated, true);
  }

  async updatePriority(
    organizationId: string,
    ticketIdentifier: string,
    dto: UpdateSupportPriorityDto,
    operatorUserId: string,
  ): Promise<SupportTicketResponseDto> {
    const ticket = await this.supportRepo.findTicketByIdentifier(
      organizationId,
      ticketIdentifier,
    );
    if (!ticket) {
      throw new NotFoundException({
        code: SupportErrorCode.SUPPORT_TICKET_NOT_FOUND,
        message: `Support ticket '${ticketIdentifier}' was not found.`,
      });
    }

    const updated = await this.supportRepo.updateTicketPriority(
      organizationId,
      ticket.id,
      dto.priority,
      ticket.priority,
      operatorUserId,
    );

    return this.mapToResponseDto(updated, true);
  }

  async escalateTicket(
    organizationId: string,
    ticketIdentifier: string,
    dto: EscalateSupportTicketDto,
    operatorUserId: string,
  ): Promise<SupportTicketResponseDto> {
    const ticket = await this.supportRepo.findTicketByIdentifier(
      organizationId,
      ticketIdentifier,
    );
    if (!ticket) {
      throw new NotFoundException({
        code: SupportErrorCode.SUPPORT_TICKET_NOT_FOUND,
        message: `Support ticket '${ticketIdentifier}' was not found.`,
      });
    }

    if (!isValidSupportTransition(ticket.status, SupportStatus.ESCALATED)) {
      throw new BadRequestException({
        code: SupportErrorCode.SUPPORT_TICKET_INVALID_STATE,
        message: `Cannot escalate ticket from current status '${ticket.status}'.`,
      });
    }

    const updated = await this.supportRepo.updateTicketStatus(
      organizationId,
      ticket.id,
      SupportStatus.ESCALATED,
      ticket.status,
      operatorUserId,
      { reason: dto.reason },
    );

    return this.mapToResponseDto(updated, true);
  }

  async resolveTicket(
    organizationId: string,
    ticketIdentifier: string,
    dto: ResolveSupportTicketDto,
    operatorUserId: string,
  ): Promise<SupportTicketResponseDto> {
    const ticket = await this.supportRepo.findTicketByIdentifier(
      organizationId,
      ticketIdentifier,
    );
    if (!ticket) {
      throw new NotFoundException({
        code: SupportErrorCode.SUPPORT_TICKET_NOT_FOUND,
        message: `Support ticket '${ticketIdentifier}' was not found.`,
      });
    }

    if (!isValidSupportTransition(ticket.status, SupportStatus.RESOLVED)) {
      throw new BadRequestException({
        code: SupportErrorCode.SUPPORT_TICKET_INVALID_STATE,
        message: `Cannot resolve ticket from current status '${ticket.status}'.`,
      });
    }

    const updated = await this.supportRepo.resolveTicket(
      organizationId,
      ticket.id,
      dto.resolution,
      ticket.status,
      operatorUserId,
    );

    return this.mapToResponseDto(updated, true);
  }

  async closeTicket(
    organizationId: string,
    ticketIdentifier: string,
    operatorUserId: string,
  ): Promise<SupportTicketResponseDto> {
    const ticket = await this.supportRepo.findTicketByIdentifier(
      organizationId,
      ticketIdentifier,
    );
    if (!ticket) {
      throw new NotFoundException({
        code: SupportErrorCode.SUPPORT_TICKET_NOT_FOUND,
        message: `Support ticket '${ticketIdentifier}' was not found.`,
      });
    }

    if (!isValidSupportTransition(ticket.status, SupportStatus.CLOSED)) {
      throw new BadRequestException({
        code: SupportErrorCode.SUPPORT_TICKET_INVALID_STATE,
        message: `Only RESOLVED tickets may be transitioned to CLOSED (current status: '${ticket.status}').`,
      });
    }

    const updated = await this.supportRepo.updateTicketStatus(
      organizationId,
      ticket.id,
      SupportStatus.CLOSED,
      ticket.status,
      operatorUserId,
    );

    return this.mapToResponseDto(updated, true);
  }

  async reopenTicket(
    organizationId: string,
    ticketIdentifier: string,
    userId: string,
    userRoles: RoleType[],
  ): Promise<SupportTicketResponseDto> {
    const ticket = await this.supportRepo.findTicketByIdentifier(
      organizationId,
      ticketIdentifier,
    );
    if (!ticket) {
      throw new NotFoundException({
        code: SupportErrorCode.SUPPORT_TICKET_NOT_FOUND,
        message: `Support ticket '${ticketIdentifier}' was not found.`,
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

      const isOwner =
        ticket.createdByUserId === userId ||
        (customer && ticket.customerId === customer.id) ||
        (provider && ticket.providerId === provider.id) ||
        (delivery && ticket.deliveryPartnerId === delivery.id);

      if (!isOwner) {
        throw new ForbiddenException({
          code: SupportErrorCode.SUPPORT_TICKET_ACCESS_DENIED,
          message: 'You can only reopen tickets that belong to your account.',
        });
      }
    }

    if (
      ticket.status !== SupportStatus.RESOLVED &&
      ticket.status !== SupportStatus.CLOSED
    ) {
      throw new BadRequestException({
        code: SupportErrorCode.SUPPORT_TICKET_NOT_REOPENABLE,
        message: `Ticket in status '${ticket.status}' cannot be reopened. Only RESOLVED or CLOSED tickets are eligible.`,
      });
    }

    const updated = await this.supportRepo.updateTicketStatus(
      organizationId,
      ticket.id,
      SupportStatus.REOPENED,
      ticket.status,
      userId,
    );

    return this.mapToResponseDto(updated, isOperations);
  }

  // ============================================================================
  // 4. CROSS-ESCALATION: SUPPORT TICKET -> DISPUTE
  // ============================================================================

  async createDisputeFromTicket(
    organizationId: string,
    ticketIdentifier: string,
    dto: CreateDisputeFromTicketDto,
    operatorUserId: string,
  ): Promise<DisputeResponseDto> {
    const ticket = await this.supportRepo.findTicketByIdentifier(
      organizationId,
      ticketIdentifier,
    );
    if (!ticket) {
      throw new NotFoundException({
        code: SupportErrorCode.SUPPORT_TICKET_NOT_FOUND,
        message: `Support ticket '${ticketIdentifier}' was not found.`,
      });
    }

    if (!ticket.bookingId) {
      throw new BadRequestException({
        code: SupportErrorCode.DISPUTE_NOT_ELIGIBLE,
        message: 'Cannot create a dispute from a ticket that is not linked to a booking.',
      });
    }

    // Determine participant
    let raisedByType: DisputeParticipantType = DisputeParticipantType.OPERATIONS;
    if (ticket.requesterType === SupportRequesterType.CUSTOMER) {
      raisedByType = DisputeParticipantType.CUSTOMER;
    } else if (ticket.requesterType === SupportRequesterType.PROVIDER) {
      raisedByType = DisputeParticipantType.PROVIDER;
    } else if (ticket.requesterType === SupportRequesterType.DELIVERY_PARTNER) {
      raisedByType = DisputeParticipantType.DELIVERY_PARTNER;
    }

    const dispute = await this.supportRepo.createDisputeTx({
      organizationId,
      bookingId: ticket.bookingId,
      ticketId: ticket.id,
      paymentId: ticket.paymentId,
      createdByUserId: operatorUserId,
      raisedByType,
      customerId: ticket.customerId,
      providerId: ticket.providerId,
      deliveryPartnerId: ticket.deliveryPartnerId,
      type: dto.type,
      priority: ticket.priority,
      claimAmount: dto.claimAmount ? (dto.claimAmount as any) : null,
      reason: dto.reason,
      description: dto.description || ticket.description,
    });

    return {
      id: dispute.id,
      publicId: dispute.publicId,
      organizationId: dispute.organizationId,
      ticketId: dispute.ticketId,
      ticketPublicId: ticket.publicId,
      bookingId: dispute.bookingId,
      bookingNumber: dispute.booking?.bookingNumber ?? ticket.booking?.bookingNumber ?? '',
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
      decisionReason: dispute.decisionReason,
      resolvedAt: dispute.resolvedAt,
      closedAt: dispute.closedAt,
      createdAt: dispute.createdAt,
      updatedAt: dispute.updatedAt,
    };
  }

  async getTicketActivities(
    organizationId: string,
    ticketIdentifier: string,
  ): Promise<SupportActivityResponseDto[]> {
    const ticket = await this.supportRepo.findTicketByIdentifier(
      organizationId,
      ticketIdentifier,
    );
    if (!ticket) {
      throw new NotFoundException({
        code: SupportErrorCode.SUPPORT_TICKET_NOT_FOUND,
        message: `Support ticket '${ticketIdentifier}' was not found.`,
      });
    }

    const activities = await this.supportRepo.getTicketActivities(
      organizationId,
      ticket.id,
    );

    return activities.map((a) => ({
      id: a.id,
      ticketId: a.ticketId,
      actorUserId: a.actorUserId,
      actorName: a.actorUser?.email ?? null,
      action: a.action,
      previousValue: a.previousValue,
      newValue: a.newValue,
      metadata: (a.metadata as any) ?? null,
      createdAt: a.createdAt,
    }));
  }
}
