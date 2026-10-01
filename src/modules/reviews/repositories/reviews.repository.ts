import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import {
  ReviewAuditEvent,
  ReviewModerationAction,
  ReviewModerationReason,
  ReviewReportReason,
  ReviewReportStatus,
  ReviewStatus,
} from '../types/reviews.types';

@Injectable()
export class ReviewsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate sequential public ID for Review: REV-YYYY-NNNNNN
   */
  async generateReviewPublicId(organizationId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.review.count({
      where: { organizationId },
    });
    const seq = String(count + 1).padStart(6, '0');
    return `REV-${year}-${seq}`;
  }

  /**
   * Generate sequential public ID for ReviewReport: RPT-YYYY-NNNNNN
   */
  async generateReportPublicId(organizationId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.reviewReport.count({
      where: { organizationId },
    });
    const seq = String(count + 1).padStart(6, '0');
    return `RPT-${year}-${seq}`;
  }

  /**
   * Find completed booking and verify customer ownership
   */
  async findBookingForReview(
    organizationId: string,
    bookingIdentifier: string,
  ) {
    return this.prisma.booking.findFirst({
      where: {
        organizationId,
        OR: [
          { id: bookingIdentifier.length === 36 ? bookingIdentifier : undefined },
          { bookingNumber: bookingIdentifier },
        ],
      },
      include: {
        customer: true,
        provider: true,
        service: true,
        review: true,
      },
    });
  }

  /**
   * Find customer by user ID
   */
  async findCustomerByUserId(userId: string, organizationId: string) {
    return this.prisma.customer.findFirst({
      where: { userId, organizationId },
    });
  }

  /**
   * Find provider by user ID
   */
  async findProviderByUserId(userId: string, organizationId: string) {
    return this.prisma.provider.findFirst({
      where: { userId, organizationId },
    });
  }

  /**
   * Find single review by ID or Public ID
   */
  async findReviewByIdOrPublicId(
    identifier: string,
    organizationId: string,
  ) {
    return this.prisma.review.findFirst({
      where: {
        organizationId,
        OR: [
          { id: identifier.length === 36 ? identifier : undefined },
          { publicId: identifier },
        ],
      },
      include: {
        customer: { select: { id: true, fullName: true, publicId: true } },
        provider: { select: { id: true, businessName: true, publicId: true } },
        service: { select: { id: true, name: true, publicId: true } },
        reviewResponse: true,
        moderationHist: { orderBy: { createdAt: 'asc' } },
      },
    });
  }

  /**
   * Find review by booking ID
   */
  async findReviewByBookingId(
    bookingId: string,
    organizationId: string,
  ) {
    return this.prisma.review.findFirst({
      where: {
        bookingId,
        organizationId,
      },
      include: {
        customer: { select: { id: true, fullName: true, publicId: true } },
        provider: { select: { id: true, businessName: true, publicId: true } },
        service: { select: { id: true, name: true, publicId: true } },
        reviewResponse: true,
      },
    });
  }

  /**
   * Atomic Review Creation ($transaction)
   */
  async atomicCreateReview(params: {
    organizationId: string;
    customerId: string;
    actorUserId: string;
    bookingId: string;
    providerId: string;
    serviceId: string;
    rating: number;
    title: string;
    comment: string;
  }) {
    const publicId = await this.generateReviewPublicId(params.organizationId);

    return this.prisma.$transaction(async (tx) => {
      // Create Review
      const review = await tx.review.create({
        data: {
          publicId,
          organizationId: params.organizationId,
          customerId: params.customerId,
          bookingId: params.bookingId,
          providerId: params.providerId,
          serviceId: params.serviceId,
          rating: params.rating,
          title: params.title,
          comment: params.comment,
          status: ReviewStatus.PENDING,
        },
        include: {
          customer: { select: { id: true, fullName: true, publicId: true } },
          provider: { select: { id: true, businessName: true, publicId: true } },
          service: { select: { id: true, name: true, publicId: true } },
        },
      });

      // Create initial Moderation History entry
      await tx.reviewModerationHistory.create({
        data: {
          reviewId: review.id,
          organizationId: params.organizationId,
          moderatorUserId: params.actorUserId,
          actorUserId: params.actorUserId,
          fromStatus: ReviewStatus.PENDING,
          toStatus: ReviewStatus.PENDING,
          action: ReviewModerationAction.SUBMITTED,
          reason: ReviewModerationReason.OTHER,
          notes: 'Initial customer review submission',
        },
      });

      // Audit Event
      await tx.auditEvent.create({
        data: {
          organizationId: params.organizationId,
          actorUserId: params.actorUserId,
          action: ReviewAuditEvent.REVIEW_CREATED,
          entityType: 'Review',
          entityId: review.publicId,
          metadataJson: {
            bookingId: params.bookingId,
            rating: params.rating,
            providerId: params.providerId,
            serviceId: params.serviceId,
          },
        },
      });

      return review;
    });
  }

  /**
   * Atomic Review Edit ($transaction)
   */
  async atomicEditReview(params: {
    reviewId: string;
    organizationId: string;
    actorUserId: string;
    rating?: number;
    title?: string;
    comment?: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.review.findFirst({
        where: { id: params.reviewId, organizationId: params.organizationId },
      });

      if (!existing) {
        throw new Error('REVIEW_NOT_FOUND');
      }

      if (
        existing.status !== ReviewStatus.PENDING &&
        existing.status !== ReviewStatus.PUBLISHED
      ) {
        throw new Error('REVIEW_NOT_EDITABLE');
      }

      const previousStatus = existing.status;
      const wasPublished = previousStatus === ReviewStatus.PUBLISHED;

      // When a published review is edited, it returns to PENDING
      const newStatus = ReviewStatus.PENDING;

      const updated = await tx.review.update({
        where: { id: params.reviewId },
        data: {
          rating: params.rating ?? existing.rating,
          title: params.title ?? existing.title,
          comment: params.comment ?? existing.comment,
          status: newStatus,
          updatedAt: new Date(),
        },
        include: {
          customer: { select: { id: true, fullName: true, publicId: true } },
          provider: { select: { id: true, businessName: true, publicId: true } },
          service: { select: { id: true, name: true, publicId: true } },
          reviewResponse: true,
        },
      });

      // Record Moderation History
      await tx.reviewModerationHistory.create({
        data: {
          reviewId: existing.id,
          organizationId: params.organizationId,
          moderatorUserId: params.actorUserId,
          actorUserId: params.actorUserId,
          fromStatus: previousStatus,
          toStatus: newStatus,
          action: ReviewModerationAction.EDITED,
          reason: ReviewModerationReason.OTHER,
          notes: wasPublished
            ? 'Customer edited published review; returned to moderation PENDING'
            : 'Customer edited pending review',
        },
      });

      // Audit Event
      await tx.auditEvent.create({
        data: {
          organizationId: params.organizationId,
          actorUserId: params.actorUserId,
          action: ReviewAuditEvent.REVIEW_EDITED,
          entityType: 'Review',
          entityId: existing.publicId,
          metadataJson: {
            previousStatus,
            newStatus,
            updatedRating: params.rating,
          },
        },
      });

      // Recalculate ratings if previously published
      if (wasPublished) {
        await this.syncAggregationsTx(tx, params.organizationId, existing.providerId, existing.serviceId);
      }

      return updated;
    });
  }

  /**
   * Atomic Review Withdrawal ($transaction)
   */
  async atomicWithdrawReview(params: {
    reviewId: string;
    organizationId: string;
    actorUserId: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.review.findFirst({
        where: { id: params.reviewId, organizationId: params.organizationId },
      });

      if (!existing) {
        throw new Error('REVIEW_NOT_FOUND');
      }

      if (
        existing.status !== ReviewStatus.PENDING &&
        existing.status !== ReviewStatus.PUBLISHED
      ) {
        throw new Error('REVIEW_NOT_WITHDRAWABLE');
      }

      const previousStatus = existing.status;
      const wasPublished = previousStatus === ReviewStatus.PUBLISHED;

      const updated = await tx.review.update({
        where: { id: params.reviewId },
        data: {
          status: ReviewStatus.WITHDRAWN,
          updatedAt: new Date(),
        },
      });

      await tx.reviewModerationHistory.create({
        data: {
          reviewId: existing.id,
          organizationId: params.organizationId,
          moderatorUserId: params.actorUserId,
          actorUserId: params.actorUserId,
          fromStatus: previousStatus,
          toStatus: ReviewStatus.WITHDRAWN,
          action: ReviewModerationAction.WITHDRAWN,
          reason: ReviewModerationReason.OTHER,
          notes: 'Customer withdrew review',
        },
      });

      await tx.auditEvent.create({
        data: {
          organizationId: params.organizationId,
          actorUserId: params.actorUserId,
          action: ReviewAuditEvent.REVIEW_WITHDRAWN,
          entityType: 'Review',
          entityId: existing.publicId,
          metadataJson: { previousStatus },
        },
      });

      if (wasPublished) {
        await this.syncAggregationsTx(tx, params.organizationId, existing.providerId, existing.serviceId);
      }

      return updated;
    });
  }

  /**
   * Atomic Review Moderation ($transaction)
   */
  async atomicModerateReview(params: {
    reviewId: string;
    organizationId: string;
    actorUserId: string;
    action: ReviewModerationAction;
    targetStatus: ReviewStatus;
    reason?: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.review.findFirst({
        where: { id: params.reviewId, organizationId: params.organizationId },
      });

      if (!existing) {
        throw new Error('REVIEW_NOT_FOUND');
      }

      const previousStatus = existing.status;

      // Validate transitions
      if (params.action === ReviewModerationAction.PUBLISHED) {
        if (
          previousStatus !== ReviewStatus.PENDING &&
          previousStatus !== ReviewStatus.HIDDEN &&
          previousStatus !== ReviewStatus.FLAGGED
        ) {
          throw new Error('REVIEW_INVALID_STATE');
        }
      } else if (params.action === ReviewModerationAction.HIDDEN) {
        if (
          previousStatus !== ReviewStatus.PUBLISHED &&
          previousStatus !== ReviewStatus.PENDING &&
          previousStatus !== ReviewStatus.FLAGGED
        ) {
          throw new Error('REVIEW_INVALID_STATE');
        }
        if (!params.reason || params.reason.trim().length < 3) {
          throw new Error('REVIEW_MODERATION_REASON_REQUIRED');
        }
      } else if (params.action === ReviewModerationAction.REJECTED) {
        if (
          previousStatus !== ReviewStatus.PENDING &&
          previousStatus !== ReviewStatus.HIDDEN &&
          previousStatus !== ReviewStatus.FLAGGED
        ) {
          throw new Error('REVIEW_INVALID_STATE');
        }
        if (!params.reason || params.reason.trim().length < 3) {
          throw new Error('REVIEW_MODERATION_REASON_REQUIRED');
        }
      } else if (params.action === ReviewModerationAction.RESTORED) {
        if (previousStatus !== ReviewStatus.HIDDEN && previousStatus !== ReviewStatus.FLAGGED) {
          throw new Error('REVIEW_INVALID_STATE');
        }
      }

      const now = new Date();
      const updated = await tx.review.update({
        where: { id: params.reviewId },
        data: {
          status: params.targetStatus,
          publishedAt: params.targetStatus === ReviewStatus.PUBLISHED ? now : existing.publishedAt,
          moderatedAt: now,
          moderatedBy: params.actorUserId,
          moderationReason: params.reason || null,
          updatedAt: now,
        },
        include: {
          customer: { select: { id: true, fullName: true, publicId: true } },
          provider: { select: { id: true, businessName: true, publicId: true } },
          service: { select: { id: true, name: true, publicId: true } },
          reviewResponse: true,
        },
      });

      await tx.reviewModerationHistory.create({
        data: {
          reviewId: existing.id,
          organizationId: params.organizationId,
          moderatorUserId: params.actorUserId,
          actorUserId: params.actorUserId,
          fromStatus: previousStatus,
          toStatus: params.targetStatus,
          action: params.action,
          reason: ReviewModerationReason.OTHER,
          notes: params.reason || `Moderation action: ${params.action}`,
        },
      });

      let auditAction: string = ReviewAuditEvent.REVIEW_PUBLISHED;
      if (params.action === ReviewModerationAction.HIDDEN) auditAction = ReviewAuditEvent.REVIEW_HIDDEN;
      if (params.action === ReviewModerationAction.REJECTED) auditAction = ReviewAuditEvent.REVIEW_REJECTED;
      if (params.action === ReviewModerationAction.RESTORED) auditAction = ReviewAuditEvent.REVIEW_RESTORED;

      await tx.auditEvent.create({
        data: {
          organizationId: params.organizationId,
          actorUserId: params.actorUserId,
          action: auditAction,
          entityType: 'Review',
          entityId: existing.publicId,
          metadataJson: {
            previousStatus,
            targetStatus: params.targetStatus,
            reason: params.reason,
          },
        },
      });

      // Synchronize provider and service rating aggregations
      await this.syncAggregationsTx(tx, params.organizationId, existing.providerId, existing.serviceId);

      return updated;
    });
  }

  /**
   * Helper: Transactional rating aggregation synchronization
   */
  async syncAggregationsTx(
    tx: Prisma.TransactionClient,
    organizationId: string,
    providerId: string,
    serviceId: string,
  ) {
    // Provider Published Aggregation
    const providerStats = await tx.review.aggregate({
      where: {
        organizationId,
        providerId,
        status: ReviewStatus.PUBLISHED,
      },
      _count: { id: true },
      _avg: { rating: true },
    });

    const pCount = providerStats._count.id || 0;
    const pAvg = providerStats._avg.rating || 0;
    const pRatingDecimal = new Prisma.Decimal(pAvg.toFixed(2));

    await tx.provider.update({
      where: { id: providerId },
      data: {
        rating: pRatingDecimal,
        totalReviews: pCount,
      },
    });

    // Service Published Aggregation
    const serviceStats = await tx.review.aggregate({
      where: {
        organizationId,
        serviceId,
        status: ReviewStatus.PUBLISHED,
      },
      _count: { id: true },
      _avg: { rating: true },
    });

    const sCount = serviceStats._count.id || 0;
    const sAvg = serviceStats._avg.rating || 0;
    const sRatingDecimal = new Prisma.Decimal(sAvg.toFixed(2));

    await tx.service.update({
      where: { id: serviceId },
      data: {
        rating: sRatingDecimal,
        totalReviews: sCount,
      },
    });
  }

  /**
   * Compute Rating Summary (Average + Distribution) for Service or Provider
   */
  async computeRatingSummary(
    organizationId: string,
    filter: { serviceId?: string; providerId?: string },
  ) {
    const whereClause: Prisma.ReviewWhereInput = {
      organizationId,
      status: ReviewStatus.PUBLISHED,
      ...(filter.serviceId ? { serviceId: filter.serviceId } : {}),
      ...(filter.providerId ? { providerId: filter.providerId } : {}),
    };

    const stats = await this.prisma.review.aggregate({
      where: whereClause,
      _count: { id: true },
      _avg: { rating: true },
    });

    const groups = await this.prisma.review.groupBy({
      by: ['rating'],
      where: whereClause,
      _count: { id: true },
    });

    const distribution: Record<'1' | '2' | '3' | '4' | '5', number> = {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
    };

    for (const g of groups) {
      if (g.rating >= 1 && g.rating <= 5) {
        distribution[String(g.rating) as '1' | '2' | '3' | '4' | '5'] = g._count.id;
      }
    }

    const totalReviews = stats._count.id || 0;
    const avg = stats._avg.rating || 0;
    const averageRating = avg.toFixed(2);

    return {
      averageRating,
      totalReviews,
      ratingDistribution: distribution,
    };
  }

  /**
   * Provider Response: Atomic Create
   */
  async atomicCreateProviderResponse(params: {
    reviewId: string;
    providerId: string;
    organizationId: string;
    actorUserId: string;
    comment: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const review = await tx.review.findFirst({
        where: { id: params.reviewId, organizationId: params.organizationId },
      });

      if (!review) {
        throw new Error('REVIEW_NOT_FOUND');
      }

      if (review.providerId !== params.providerId) {
        throw new Error('PROVIDER_REVIEW_ACCESS_DENIED');
      }

      const existingResp = await tx.reviewResponse.findUnique({
        where: { reviewId: params.reviewId },
      });

      if (existingResp) {
        throw new Error('REVIEW_RESPONSE_ALREADY_EXISTS');
      }

      const response = await tx.reviewResponse.create({
        data: {
          reviewId: params.reviewId,
          organizationId: params.organizationId,
          providerId: params.providerId,
          comment: params.comment,
        },
      });

      // Backward compatibility mirror
      await tx.review.update({
        where: { id: params.reviewId },
        data: {
          response: params.comment,
          responseAt: new Date(),
        },
      });

      await tx.auditEvent.create({
        data: {
          organizationId: params.organizationId,
          actorUserId: params.actorUserId,
          action: ReviewAuditEvent.REVIEW_RESPONSE_CREATED,
          entityType: 'ReviewResponse',
          entityId: response.id,
          metadataJson: { reviewId: params.reviewId, providerId: params.providerId },
        },
      });

      return response;
    });
  }

  /**
   * Provider Response: Atomic Update
   */
  async atomicUpdateProviderResponse(params: {
    reviewId: string;
    providerId: string;
    organizationId: string;
    actorUserId: string;
    comment: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const response = await tx.reviewResponse.findFirst({
        where: {
          reviewId: params.reviewId,
          organizationId: params.organizationId,
          providerId: params.providerId,
        },
      });

      if (!response) {
        throw new Error('REVIEW_RESPONSE_NOT_FOUND');
      }

      const updated = await tx.reviewResponse.update({
        where: { id: response.id },
        data: {
          comment: params.comment,
          updatedAt: new Date(),
        },
      });

      await tx.review.update({
        where: { id: params.reviewId },
        data: { response: params.comment },
      });

      await tx.auditEvent.create({
        data: {
          organizationId: params.organizationId,
          actorUserId: params.actorUserId,
          action: ReviewAuditEvent.REVIEW_RESPONSE_UPDATED,
          entityType: 'ReviewResponse',
          entityId: response.id,
          metadataJson: { reviewId: params.reviewId },
        },
      });

      return updated;
    });
  }

  /**
   * Provider Response: Atomic Delete
   */
  async atomicDeleteProviderResponse(params: {
    reviewId: string;
    providerId: string;
    organizationId: string;
    actorUserId: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const response = await tx.reviewResponse.findFirst({
        where: {
          reviewId: params.reviewId,
          organizationId: params.organizationId,
          providerId: params.providerId,
        },
      });

      if (!response) {
        throw new Error('REVIEW_RESPONSE_NOT_FOUND');
      }

      await tx.reviewResponse.delete({
        where: { id: response.id },
      });

      await tx.review.update({
        where: { id: params.reviewId },
        data: { response: null, responseAt: null },
      });

      await tx.auditEvent.create({
        data: {
          organizationId: params.organizationId,
          actorUserId: params.actorUserId,
          action: ReviewAuditEvent.REVIEW_RESPONSE_DELETED,
          entityType: 'ReviewResponse',
          entityId: response.id,
          metadataJson: { reviewId: params.reviewId },
        },
      });

      return { success: true };
    });
  }

  /**
   * Review Abuse Report: Atomic Create
   */
  async atomicCreateReviewReport(params: {
    reviewId: string;
    organizationId: string;
    reportedByUserId: string;
    reason: ReviewReportReason;
    description?: string;
  }) {
    const publicId = await this.generateReportPublicId(params.organizationId);

    return this.prisma.$transaction(async (tx) => {
      const review = await tx.review.findFirst({
        where: { id: params.reviewId, organizationId: params.organizationId },
        include: { customer: true },
      });

      if (!review) {
        throw new Error('REVIEW_NOT_FOUND');
      }

      if (review.status !== ReviewStatus.PUBLISHED) {
        throw new Error('REVIEW_REPORT_INVALID_STATE');
      }

      if (review.customer.userId === params.reportedByUserId) {
        throw new Error('REVIEW_REPORT_NOT_ALLOWED');
      }

      const existingReport = await tx.reviewReport.findUnique({
        where: {
          reviewId_reportedByUserId: {
            reviewId: params.reviewId,
            reportedByUserId: params.reportedByUserId,
          },
        },
      });

      if (existingReport && (existingReport.status === ReviewReportStatus.OPEN || existingReport.status === ReviewReportStatus.UNDER_REVIEW)) {
        throw new Error('REVIEW_REPORT_ALREADY_EXISTS');
      }

      const report = await tx.reviewReport.create({
        data: {
          publicId,
          organizationId: params.organizationId,
          reviewId: params.reviewId,
          reportedByUserId: params.reportedByUserId,
          reason: params.reason,
          description: params.description || null,
          status: ReviewReportStatus.OPEN,
        },
      });

      await tx.auditEvent.create({
        data: {
          organizationId: params.organizationId,
          actorUserId: params.reportedByUserId,
          action: ReviewAuditEvent.REVIEW_REPORTED,
          entityType: 'ReviewReport',
          entityId: report.publicId,
          metadataJson: { reviewId: params.reviewId, reason: params.reason },
        },
      });

      return report;
    });
  }

  /**
   * Review Report: Transition to UNDER_REVIEW
   */
  async atomicStartReportReview(params: {
    reportId: string;
    organizationId: string;
    actorUserId: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const report = await tx.reviewReport.findFirst({
        where: { id: params.reportId, organizationId: params.organizationId },
      });

      if (!report) {
        throw new Error('REVIEW_REPORT_NOT_FOUND');
      }

      if (report.status !== ReviewReportStatus.OPEN) {
        throw new Error('REVIEW_REPORT_INVALID_STATE');
      }

      const updated = await tx.reviewReport.update({
        where: { id: params.reportId },
        data: {
          status: ReviewReportStatus.UNDER_REVIEW,
          updatedAt: new Date(),
        },
      });

      await tx.auditEvent.create({
        data: {
          organizationId: params.organizationId,
          actorUserId: params.actorUserId,
          action: ReviewAuditEvent.REVIEW_REPORT_REVIEW_STARTED,
          entityType: 'ReviewReport',
          entityId: report.publicId,
        },
      });

      return updated;
    });
  }

  /**
   * Review Report: Resolve
   */
  async atomicResolveReport(params: {
    reportId: string;
    organizationId: string;
    actorUserId: string;
    resolutionNote: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const report = await tx.reviewReport.findFirst({
        where: { id: params.reportId, organizationId: params.organizationId },
      });

      if (!report) {
        throw new Error('REVIEW_REPORT_NOT_FOUND');
      }

      if (report.status === ReviewReportStatus.RESOLVED || report.status === ReviewReportStatus.DISMISSED) {
        throw new Error('REVIEW_REPORT_INVALID_STATE');
      }

      const updated = await tx.reviewReport.update({
        where: { id: params.reportId },
        data: {
          status: ReviewReportStatus.RESOLVED,
          resolvedAt: new Date(),
          resolvedByUserId: params.actorUserId,
          resolutionNote: params.resolutionNote,
          updatedAt: new Date(),
        },
      });

      await tx.auditEvent.create({
        data: {
          organizationId: params.organizationId,
          actorUserId: params.actorUserId,
          action: ReviewAuditEvent.REVIEW_REPORT_RESOLVED,
          entityType: 'ReviewReport',
          entityId: report.publicId,
          metadataJson: { resolutionNote: params.resolutionNote },
        },
      });

      return updated;
    });
  }

  /**
   * Review Report: Dismiss
   */
  async atomicDismissReport(params: {
    reportId: string;
    organizationId: string;
    actorUserId: string;
    resolutionNote?: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const report = await tx.reviewReport.findFirst({
        where: { id: params.reportId, organizationId: params.organizationId },
      });

      if (!report) {
        throw new Error('REVIEW_REPORT_NOT_FOUND');
      }

      if (report.status === ReviewReportStatus.RESOLVED || report.status === ReviewReportStatus.DISMISSED) {
        throw new Error('REVIEW_REPORT_INVALID_STATE');
      }

      const updated = await tx.reviewReport.update({
        where: { id: params.reportId },
        data: {
          status: ReviewReportStatus.DISMISSED,
          resolvedAt: new Date(),
          resolvedByUserId: params.actorUserId,
          resolutionNote: params.resolutionNote || 'Dismissed as non-violating',
          updatedAt: new Date(),
        },
      });

      await tx.auditEvent.create({
        data: {
          organizationId: params.organizationId,
          actorUserId: params.actorUserId,
          action: ReviewAuditEvent.REVIEW_REPORT_DISMISSED,
          entityType: 'ReviewReport',
          entityId: report.publicId,
        },
      });

      return updated;
    });
  }

  /**
   * Search / List Reviews with pagination, filters, and sorting
   */
  async findReviews(params: {
    organizationId: string;
    customerId?: string;
    providerId?: string;
    serviceId?: string;
    bookingId?: string;
    status?: ReviewStatus;
    rating?: number;
    from?: Date;
    to?: Date;
    page: number;
    pageSize: number;
    sortBy: 'newest' | 'oldest' | 'highest_rating' | 'lowest_rating';
    sortOrder: 'asc' | 'desc';
    publishedOnly?: boolean;
  }) {
    const where: Prisma.ReviewWhereInput = {
      organizationId: params.organizationId,
      ...(params.publishedOnly ? { status: ReviewStatus.PUBLISHED } : {}),
      ...(params.status ? { status: params.status } : {}),
      ...(params.customerId ? { customerId: params.customerId } : {}),
      ...(params.providerId ? { providerId: params.providerId } : {}),
      ...(params.serviceId ? { serviceId: params.serviceId } : {}),
      ...(params.bookingId ? { bookingId: params.bookingId } : {}),
      ...(params.rating ? { rating: params.rating } : {}),
      ...(params.from || params.to
        ? {
            createdAt: {
              ...(params.from ? { gte: params.from } : {}),
              ...(params.to ? { lte: params.to } : {}),
            },
          }
        : {}),
    };

    let orderBy: Prisma.ReviewOrderByWithRelationInput = { createdAt: 'desc' };
    if (params.sortBy === 'oldest') orderBy = { createdAt: 'asc' };
    else if (params.sortBy === 'highest_rating') orderBy = { rating: 'desc' };
    else if (params.sortBy === 'lowest_rating') orderBy = { rating: 'asc' };

    const skip = (params.page - 1) * params.pageSize;
    const take = params.pageSize;

    const [items, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          customer: { select: { id: true, fullName: true, publicId: true } },
          provider: { select: { id: true, businessName: true, publicId: true } },
          service: { select: { id: true, name: true, publicId: true } },
          reviewResponse: true,
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      items,
      meta: {
        page: params.page,
        pageSize: params.pageSize,
        total,
        totalPages: Math.ceil(total / params.pageSize),
      },
    };
  }

  /**
   * Search / List Review Reports
   */
  async findReports(params: {
    organizationId: string;
    reviewId?: string;
    status?: ReviewReportStatus;
    reason?: ReviewReportReason;
    page: number;
    pageSize: number;
    sortOrder: 'asc' | 'desc';
  }) {
    const where: Prisma.ReviewReportWhereInput = {
      organizationId: params.organizationId,
      ...(params.reviewId ? { reviewId: params.reviewId } : {}),
      ...(params.status ? { status: params.status } : {}),
      ...(params.reason ? { reason: params.reason } : {}),
    };

    const skip = (params.page - 1) * params.pageSize;
    const take = params.pageSize;

    const [items, total] = await Promise.all([
      this.prisma.reviewReport.findMany({
        where,
        orderBy: { createdAt: params.sortOrder },
        skip,
        take,
        include: {
          review: { select: { id: true, publicId: true, title: true } },
        },
      }),
      this.prisma.reviewReport.count({ where }),
    ]);

    return {
      items,
      meta: {
        page: params.page,
        pageSize: params.pageSize,
        total,
        totalPages: Math.ceil(total / params.pageSize),
      },
    };
  }

  /**
   * Find single report by ID or Public ID
   */
  async findReportById(identifier: string, organizationId: string) {
    return this.prisma.reviewReport.findFirst({
      where: {
        organizationId,
        OR: [
          { id: identifier.length === 36 ? identifier : undefined },
          { publicId: identifier },
        ],
      },
      include: {
        review: {
          include: {
            customer: { select: { id: true, fullName: true, publicId: true } },
            provider: { select: { id: true, businessName: true, publicId: true } },
            service: { select: { id: true, name: true, publicId: true } },
          },
        },
      },
    });
  }

  /**
   * Get Moderation History for a Review
   */
  async findModerationHistory(reviewId: string, organizationId: string) {
    return this.prisma.reviewModerationHistory.findMany({
      where: { reviewId, organizationId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
