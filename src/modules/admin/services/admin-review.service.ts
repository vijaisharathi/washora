import { Injectable } from '@nestjs/common';
import { OperationsReviewService } from '../../reviews/services/operations-review.service';
import { AdminAuditEvent } from '../types/admin.types';
import { AdminAuditService } from './admin-audit.service';

@Injectable()
export class AdminReviewService {
  constructor(
    private readonly operationsReviewService: OperationsReviewService,
    private readonly auditService: AdminAuditService,
  ) {}

  async listReviews(orgId: string, query: any) {
    return this.operationsReviewService.listReviews(orgId, query);
  }

  async getReview(orgId: string, reviewId: string) {
    return this.operationsReviewService.getReviewDetails(orgId, reviewId);
  }

  async publishReview(
    orgId: string,
    reviewId: string,
    reason?: string,
    actorUserId?: string,
    ipAddress?: string,
  ) {
    const result = await this.operationsReviewService.publishReview(
      orgId,
      actorUserId || 'SYSTEM',
      reviewId,
    );

    await this.auditService.record({
      organizationId: orgId,
      actorUserId,
      action: AdminAuditEvent.REVIEW_MODERATED,
      entityType: 'Review',
      entityId: reviewId,
      metadata: { action: 'PUBLISH', reason },
      ipHash: ipAddress,
    });

    return result;
  }

  async hideReview(
    orgId: string,
    reviewId: string,
    reason?: string,
    actorUserId?: string,
    ipAddress?: string,
  ) {
    const result = await this.operationsReviewService.hideReview(
      orgId,
      actorUserId || 'SYSTEM',
      reviewId,
      { reason: reason || 'Hidden by admin' },
    );

    await this.auditService.record({
      organizationId: orgId,
      actorUserId,
      action: AdminAuditEvent.REVIEW_MODERATED,
      entityType: 'Review',
      entityId: reviewId,
      metadata: { action: 'HIDE', reason },
      ipHash: ipAddress,
    });

    return result;
  }

  async rejectReview(
    orgId: string,
    reviewId: string,
    reason?: string,
    actorUserId?: string,
    ipAddress?: string,
  ) {
    const result = await this.operationsReviewService.rejectReview(
      orgId,
      actorUserId || 'SYSTEM',
      reviewId,
      { reason: reason || 'Rejected by admin' },
    );

    await this.auditService.record({
      organizationId: orgId,
      actorUserId,
      action: AdminAuditEvent.REVIEW_MODERATED,
      entityType: 'Review',
      entityId: reviewId,
      metadata: { action: 'REJECT', reason },
      ipHash: ipAddress,
    });

    return result;
  }

  async restoreReview(
    orgId: string,
    reviewId: string,
    reason?: string,
    actorUserId?: string,
    ipAddress?: string,
  ) {
    const result = await this.operationsReviewService.restoreReview(
      orgId,
      actorUserId || 'SYSTEM',
      reviewId,
    );

    await this.auditService.record({
      organizationId: orgId,
      actorUserId,
      action: AdminAuditEvent.REVIEW_MODERATED,
      entityType: 'Review',
      entityId: reviewId,
      metadata: { action: 'RESTORE', reason },
      ipHash: ipAddress,
    });

    return result;
  }

  async listReports(orgId: string, query: any) {
    return this.operationsReviewService.listReviewReports(orgId, query);
  }

  async resolveReport(
    orgId: string,
    reportId: string,
    resolution: any,
    actorUserId?: string,
    ipAddress?: string,
  ) {
    const result = await this.operationsReviewService.resolveReport(
      orgId,
      actorUserId || 'SYSTEM',
      reportId,
      resolution,
    );

    await this.auditService.record({
      organizationId: orgId,
      actorUserId,
      action: AdminAuditEvent.REVIEW_REPORT_RESOLVED,
      entityType: 'ReviewReport',
      entityId: reportId,
      metadata: { resolution },
      ipHash: ipAddress,
    });

    return result;
  }
}
