import { Injectable } from '@nestjs/common';
import { SupportMessageService } from '../../support/services/support-message.service';
import { SupportTicketService } from '../../support/services/support-ticket.service';
import {
  AssignSupportTicketDto,
  CreateDisputeFromTicketDto,
  CreateSupportNoteDto,
  EscalateSupportTicketDto,
  ResolveSupportTicketDto,
  SupportTicketListQueryDto,
  UpdateSupportPriorityDto,
} from '../../support/dto';
import { AdminAuditEvent } from '../types/admin.types';
import { AdminAuditService } from './admin-audit.service';

@Injectable()
export class AdminSupportService {
  constructor(
    private readonly ticketService: SupportTicketService,
    private readonly messageService: SupportMessageService,
    private readonly auditService: AdminAuditService,
  ) {}

  async listTickets(orgId: string, query: SupportTicketListQueryDto) {
    return this.ticketService.listOperationsQueue(orgId, query);
  }

  async getTicket(orgId: string, ticketId: string, actorUserId?: string) {
    return this.ticketService.getTicket(orgId, ticketId, actorUserId || 'admin-system', ['ADMIN' as any]);
  }

  async assignTicket(
    orgId: string,
    ticketId: string,
    dto: AssignSupportTicketDto,
    actorUserId: string,
    ipAddress?: string,
  ) {
    const result = await this.ticketService.assignTicket(
      orgId,
      ticketId,
      dto,
      actorUserId,
    );

    await this.auditService.record({
      organizationId: orgId,
      actorUserId,
      action: AdminAuditEvent.SUPPORT_TICKET_ASSIGNED,
      entityType: 'SupportTicket',
      entityId: ticketId,
      metadata: { assignedToUserId: dto.assignedToUserId },
      ipHash: ipAddress,
    });

    return result;
  }

  async escalateTicket(
    orgId: string,
    ticketId: string,
    dto: EscalateSupportTicketDto,
    actorUserId: string,
    ipAddress?: string,
  ) {
    const result = await this.ticketService.escalateTicket(
      orgId,
      ticketId,
      dto,
      actorUserId,
    );

    await this.auditService.record({
      organizationId: orgId,
      actorUserId,
      action: AdminAuditEvent.SUPPORT_TICKET_ESCALATED,
      entityType: 'SupportTicket',
      entityId: ticketId,
      metadata: { reason: dto.reason },
      ipHash: ipAddress,
    });

    return result;
  }

  async resolveTicket(
    orgId: string,
    ticketId: string,
    dto: ResolveSupportTicketDto,
    actorUserId: string,
    ipAddress?: string,
  ) {
    const result = await this.ticketService.resolveTicket(
      orgId,
      ticketId,
      dto,
      actorUserId,
    );

    await this.auditService.record({
      organizationId: orgId,
      actorUserId,
      action: AdminAuditEvent.SUPPORT_TICKET_RESOLVED,
      entityType: 'SupportTicket',
      entityId: ticketId,
      metadata: { resolution: dto.resolution },
      ipHash: ipAddress,
    });

    return result;
  }

  async closeTicket(
    orgId: string,
    ticketId: string,
    actorUserId: string,
    ipAddress?: string,
  ) {
    const result = await this.ticketService.closeTicket(
      orgId,
      ticketId,
      actorUserId,
    );

    await this.auditService.record({
      organizationId: orgId,
      actorUserId,
      action: AdminAuditEvent.SUPPORT_TICKET_CLOSED,
      entityType: 'SupportTicket',
      entityId: ticketId,
      metadata: {},
      ipHash: ipAddress,
    });

    return result;
  }

  async updatePriority(
    orgId: string,
    ticketId: string,
    dto: UpdateSupportPriorityDto,
    actorUserId: string,
    ipAddress?: string,
  ) {
    const result = await this.ticketService.updatePriority(
      orgId,
      ticketId,
      dto,
      actorUserId,
    );

    await this.auditService.record({
      organizationId: orgId,
      actorUserId,
      action: AdminAuditEvent.SUPPORT_PRIORITY_UPDATED,
      entityType: 'SupportTicket',
      entityId: ticketId,
      metadata: { priority: dto.priority },
      ipHash: ipAddress,
    });

    return result;
  }

  async addNote(
    orgId: string,
    ticketId: string,
    dto: CreateSupportNoteDto,
    actorUserId: string,
    ipAddress?: string,
  ) {
    const result = await this.messageService.addNote(
      orgId,
      ticketId,
      dto,
      actorUserId,
    );

    await this.auditService.record({
      organizationId: orgId,
      actorUserId,
      action: AdminAuditEvent.SUPPORT_NOTE_ADDED,
      entityType: 'SupportTicket',
      entityId: ticketId,
      metadata: { note: dto.note },
      ipHash: ipAddress,
    });

    return result;
  }

  async createDisputeFromTicket(
    orgId: string,
    ticketId: string,
    dto: CreateDisputeFromTicketDto,
    actorUserId: string,
    ipAddress?: string,
  ) {
    const result = await this.ticketService.createDisputeFromTicket(
      orgId,
      ticketId,
      dto,
      actorUserId,
    );

    await this.auditService.record({
      organizationId: orgId,
      actorUserId,
      action: AdminAuditEvent.DISPUTE_CREATED,
      entityType: 'Dispute',
      entityId: result.id,
      metadata: { ticketId, reason: dto.reason },
      ipHash: ipAddress,
    });

    return result;
  }
}
