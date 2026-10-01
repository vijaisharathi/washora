import { Injectable } from '@nestjs/common';
import { DisputeService } from '../../support/services/dispute.service';
import {
  AssignDisputeDto,
  DisputeListQueryDto,
  EscalateDisputeDto,
  RejectDisputeDto,
  ResolveDisputeDto,
  UpdateSupportPriorityDto,
} from '../../support/dto';
import { AdminAuditEvent } from '../types/admin.types';
import { AdminAuditService } from './admin-audit.service';

@Injectable()
export class AdminDisputeService {
  constructor(
    private readonly disputeService: DisputeService,
    private readonly auditService: AdminAuditService,
  ) {}

  async listDisputes(orgId: string, query: DisputeListQueryDto) {
    return this.disputeService.listOperationsQueue(orgId, query);
  }

  async getDispute(orgId: string, disputeId: string, actorUserId?: string) {
    return this.disputeService.getDispute(orgId, disputeId, actorUserId || 'admin-system', ['ADMIN' as any]);
  }

  async assignDispute(
    orgId: string,
    disputeId: string,
    dto: AssignDisputeDto,
    actorUserId: string,
    ipAddress?: string,
  ) {
    const result = await this.disputeService.assignDispute(
      orgId,
      disputeId,
      dto,
      actorUserId,
    );

    await this.auditService.record({
      organizationId: orgId,
      actorUserId,
      action: AdminAuditEvent.DISPUTE_ASSIGNED,
      entityType: 'Dispute',
      entityId: disputeId,
      metadata: { assignedToUserId: dto.assignedToUserId },
      ipHash: ipAddress,
    });

    return result;
  }

  async escalateDispute(
    orgId: string,
    disputeId: string,
    dto: EscalateDisputeDto,
    actorUserId: string,
    ipAddress?: string,
  ) {
    const result = await this.disputeService.escalateDispute(
      orgId,
      disputeId,
      dto,
      actorUserId,
    );

    await this.auditService.record({
      organizationId: orgId,
      actorUserId,
      action: AdminAuditEvent.DISPUTE_ESCALATED,
      entityType: 'Dispute',
      entityId: disputeId,
      metadata: { reason: dto.reason },
      ipHash: ipAddress,
    });

    return result;
  }

  async resolveDispute(
    orgId: string,
    disputeId: string,
    dto: ResolveDisputeDto,
    actorUserId: string,
    ipAddress?: string,
  ) {
    const result = await this.disputeService.resolveDispute(
      orgId,
      disputeId,
      dto,
      actorUserId,
    );

    await this.auditService.record({
      organizationId: orgId,
      actorUserId,
      action: AdminAuditEvent.DISPUTE_RESOLVED,
      entityType: 'Dispute',
      entityId: disputeId,
      metadata: {
        resolutionType: dto.resolutionType,
        resolutionNote: dto.resolutionNote,
        amount: dto.amount,
      },
      ipHash: ipAddress,
    });

    return result;
  }

  async rejectDispute(
    orgId: string,
    disputeId: string,
    dto: RejectDisputeDto,
    actorUserId: string,
    ipAddress?: string,
  ) {
    const result = await this.disputeService.rejectDispute(
      orgId,
      disputeId,
      dto,
      actorUserId,
    );

    await this.auditService.record({
      organizationId: orgId,
      actorUserId,
      action: AdminAuditEvent.DISPUTE_REJECTED,
      entityType: 'Dispute',
      entityId: disputeId,
      metadata: { decisionReason: dto.decisionReason },
      ipHash: ipAddress,
    });

    return result;
  }

  async updatePriority(
    orgId: string,
    disputeId: string,
    dto: UpdateSupportPriorityDto,
    actorUserId: string,
    ipAddress?: string,
  ) {
    const result = await this.disputeService.updatePriority(
      orgId,
      disputeId,
      dto,
      actorUserId,
    );

    await this.auditService.record({
      organizationId: orgId,
      actorUserId,
      action: AdminAuditEvent.DISPUTE_PRIORITY_UPDATED,
      entityType: 'Dispute',
      entityId: disputeId,
      metadata: { priority: dto.priority },
      ipHash: ipAddress,
    });

    return result;
  }
}
