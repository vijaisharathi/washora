import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DismissReviewReportDto,
  ModerateReviewDto,
  ModerationHistoryResponseDto,
  ResolveReviewReportDto,
  ReviewListQueryDto,
  ReviewReportListQueryDto,
  ReviewReportResponseDto,
  ReviewResponseDto,
} from '../dto';
import { ReviewsRepository } from '../repositories/reviews.repository';
import {
  ReviewModerationAction,
  ReviewsErrorCode,
  ReviewStatus,
} from '../types/reviews.types';
import { ReviewValidationService } from './review-validation.service';

@Injectable()
export class OperationsReviewService {
  constructor(
    private readonly reviewsRepo: ReviewsRepository,
    private readonly validationService: ReviewValidationService,
  ) {}

  mapToReviewResponse(review: any): ReviewResponseDto {
    return {
      id: review.id,
      publicId: review.publicId,
      organizationId: review.organizationId,
      customerId: review.customerId,
      bookingId: review.bookingId,
      providerId: review.providerId,
      serviceId: review.serviceId,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      status: review.status,
      providerResponse: review.reviewResponse
        ? {
            comment: review.reviewResponse.comment,
            createdAt: review.reviewResponse.createdAt,
            updatedAt: review.reviewResponse.updatedAt,
          }
        : null,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      publishedAt: review.publishedAt,
      customerName: review.customer?.fullName,
      providerName: review.provider?.businessName,
      serviceName: review.service?.name,
    };
  }

  mapToReportResponse(report: any): ReviewReportResponseDto {
    return {
      id: report.id,
      publicId: report.publicId,
      organizationId: report.organizationId,
      reviewId: report.reviewId,
      reviewPublicId: report.review?.publicId,
      reportedByUserId: report.reportedByUserId,
      reason: report.reason,
      description: report.description,
      status: report.status,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      resolvedAt: report.resolvedAt,
      resolvedByUserId: report.resolvedByUserId,
      resolutionNote: report.resolutionNote,
    };
  }

  /**
   * Operations: Search / List all reviews
   */
  async listReviews(organizationId: string, query: ReviewListQueryDto) {
    const result = await this.reviewsRepo.findReviews({
      organizationId,
      customerId: query.customerId,
      providerId: query.providerId,
      serviceId: query.serviceId,
      bookingId: query.bookingId,
      status: query.status,
      rating: query.rating,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
      page: query.page,
      pageSize: query.pageSize,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    return {
      items: result.items.map((r) => this.mapToReviewResponse(r)),
      meta: result.meta,
    };
  }

  /**
   * Operations: Get single review details
   */
  async getReviewDetails(
    organizationId: string,
    reviewId: string,
  ): Promise<ReviewResponseDto> {
    const review = await this.reviewsRepo.findReviewByIdOrPublicId(
      reviewId,
      organizationId,
    );
    if (!review) {
      throw new NotFoundException({
        code: ReviewsErrorCode.REVIEW_NOT_FOUND,
        message: 'Review not found.',
      });
    }

    return this.mapToReviewResponse(review);
  }

  /**
   * Operations: Publish Review (PENDING/HIDDEN -> PUBLISHED)
   */
  async publishReview(
    organizationId: string,
    actorUserId: string,
    reviewId: string,
  ): Promise<ReviewResponseDto> {
    const existing = await this.reviewsRepo.findReviewByIdOrPublicId(
      reviewId,
      organizationId,
    );
    if (!existing) {
      throw new NotFoundException({
        code: ReviewsErrorCode.REVIEW_NOT_FOUND,
        message: 'Review not found.',
      });
    }

    try {
      const updated = await this.reviewsRepo.atomicModerateReview({
        reviewId: existing.id,
        organizationId,
        actorUserId,
        action: ReviewModerationAction.PUBLISHED,
        targetStatus: ReviewStatus.PUBLISHED,
      });

      return this.mapToReviewResponse(updated);
    } catch (err: any) {
      if (err.message === 'REVIEW_INVALID_STATE') {
        throw new BadRequestException({
          code: ReviewsErrorCode.REVIEW_INVALID_STATE,
          message: `Cannot publish review from current status: ${existing.status}`,
        });
      }
      throw err;
    }
  }

  /**
   * Operations: Hide Review (PUBLISHED/PENDING -> HIDDEN, requires reason)
   */
  async hideReview(
    organizationId: string,
    actorUserId: string,
    reviewId: string,
    dto: ModerateReviewDto,
  ): Promise<ReviewResponseDto> {
    const existing = await this.reviewsRepo.findReviewByIdOrPublicId(
      reviewId,
      organizationId,
    );
    if (!existing) {
      throw new NotFoundException({
        code: ReviewsErrorCode.REVIEW_NOT_FOUND,
        message: 'Review not found.',
      });
    }

    const reason = this.validationService.validateModerationReason(dto.reason);

    try {
      const updated = await this.reviewsRepo.atomicModerateReview({
        reviewId: existing.id,
        organizationId,
        actorUserId,
        action: ReviewModerationAction.HIDDEN,
        targetStatus: ReviewStatus.HIDDEN,
        reason,
      });

      return this.mapToReviewResponse(updated);
    } catch (err: any) {
      if (err.message === 'REVIEW_INVALID_STATE') {
        throw new BadRequestException({
          code: ReviewsErrorCode.REVIEW_INVALID_STATE,
          message: `Cannot hide review from current status: ${existing.status}`,
        });
      }
      if (err.message === 'REVIEW_MODERATION_REASON_REQUIRED') {
        throw new BadRequestException({
          code: ReviewsErrorCode.REVIEW_MODERATION_REASON_REQUIRED,
          message: 'A valid reason (3 to 500 characters) is required to hide a review.',
        });
      }
      throw err;
    }
  }

  /**
   * Operations: Reject Review (PENDING/HIDDEN -> REJECTED, requires reason)
   */
  async rejectReview(
    organizationId: string,
    actorUserId: string,
    reviewId: string,
    dto: ModerateReviewDto,
  ): Promise<ReviewResponseDto> {
    const existing = await this.reviewsRepo.findReviewByIdOrPublicId(
      reviewId,
      organizationId,
    );
    if (!existing) {
      throw new NotFoundException({
        code: ReviewsErrorCode.REVIEW_NOT_FOUND,
        message: 'Review not found.',
      });
    }

    const reason = this.validationService.validateModerationReason(dto.reason);

    try {
      const updated = await this.reviewsRepo.atomicModerateReview({
        reviewId: existing.id,
        organizationId,
        actorUserId,
        action: ReviewModerationAction.REJECTED,
        targetStatus: ReviewStatus.REJECTED,
        reason,
      });

      return this.mapToReviewResponse(updated);
    } catch (err: any) {
      if (err.message === 'REVIEW_INVALID_STATE') {
        throw new BadRequestException({
          code: ReviewsErrorCode.REVIEW_INVALID_STATE,
          message: `Cannot reject review from current status: ${existing.status}`,
        });
      }
      if (err.message === 'REVIEW_MODERATION_REASON_REQUIRED') {
        throw new BadRequestException({
          code: ReviewsErrorCode.REVIEW_MODERATION_REASON_REQUIRED,
          message: 'A valid reason (3 to 500 characters) is required to reject a review.',
        });
      }
      throw err;
    }
  }

  /**
   * Operations: Restore Review (HIDDEN -> PUBLISHED)
   */
  async restoreReview(
    organizationId: string,
    actorUserId: string,
    reviewId: string,
  ): Promise<ReviewResponseDto> {
    const existing = await this.reviewsRepo.findReviewByIdOrPublicId(
      reviewId,
      organizationId,
    );
    if (!existing) {
      throw new NotFoundException({
        code: ReviewsErrorCode.REVIEW_NOT_FOUND,
        message: 'Review not found.',
      });
    }

    try {
      const updated = await this.reviewsRepo.atomicModerateReview({
        reviewId: existing.id,
        organizationId,
        actorUserId,
        action: ReviewModerationAction.RESTORED,
        targetStatus: ReviewStatus.PUBLISHED,
        reason: 'Restored to public status after review',
      });

      return this.mapToReviewResponse(updated);
    } catch (err: any) {
      if (err.message === 'REVIEW_INVALID_STATE') {
        throw new BadRequestException({
          code: ReviewsErrorCode.REVIEW_INVALID_STATE,
          message: `Cannot restore review from current status: ${existing.status}. Rejection is terminal.`,
        });
      }
      throw err;
    }
  }

  /**
   * Operations: Moderation History for Review
   */
  async getModerationHistory(
    organizationId: string,
    reviewId: string,
  ): Promise<ModerationHistoryResponseDto[]> {
    const review = await this.reviewsRepo.findReviewByIdOrPublicId(
      reviewId,
      organizationId,
    );
    if (!review) {
      throw new NotFoundException({
        code: ReviewsErrorCode.REVIEW_NOT_FOUND,
        message: 'Review not found.',
      });
    }

    const history = await this.reviewsRepo.findModerationHistory(
      review.id,
      organizationId,
    );

    return history.map((h) => ({
      id: h.id,
      reviewId: h.reviewId,
      organizationId: h.organizationId,
      actorUserId: h.actorUserId || h.moderatorUserId,
      previousStatus: h.fromStatus,
      newStatus: h.toStatus,
      action: h.action,
      reason: h.reason,
      notes: h.notes,
      createdAt: h.createdAt,
    }));
  }

  /**
   * Operations: List Review Abuse Reports
   */
  async listReviewReports(
    organizationId: string,
    query: ReviewReportListQueryDto,
  ) {
    const result = await this.reviewsRepo.findReports({
      organizationId,
      reviewId: query.reviewId,
      status: query.status,
      reason: query.reason,
      page: query.page,
      pageSize: query.pageSize,
      sortOrder: query.sortOrder,
    });

    return {
      items: result.items.map((r) => this.mapToReportResponse(r)),
      meta: result.meta,
    };
  }

  /**
   * Operations: Get single report details
   */
  async getReviewReport(
    organizationId: string,
    reportId: string,
  ): Promise<ReviewReportResponseDto> {
    const report = await this.reviewsRepo.findReportById(
      reportId,
      organizationId,
    );
    if (!report) {
      throw new NotFoundException({
        code: ReviewsErrorCode.REVIEW_REPORT_NOT_FOUND,
        message: 'Review abuse report not found.',
      });
    }

    return this.mapToReportResponse(report);
  }

  /**
   * Operations: Start Review of Report (OPEN -> UNDER_REVIEW)
   */
  async startReportReview(
    organizationId: string,
    actorUserId: string,
    reportId: string,
  ): Promise<ReviewReportResponseDto> {
    const report = await this.reviewsRepo.findReportById(
      reportId,
      organizationId,
    );
    if (!report) {
      throw new NotFoundException({
        code: ReviewsErrorCode.REVIEW_REPORT_NOT_FOUND,
        message: 'Review report not found.',
      });
    }

    try {
      const updated = await this.reviewsRepo.atomicStartReportReview({
        reportId: report.id,
        organizationId,
        actorUserId,
      });

      return this.mapToReportResponse(updated);
    } catch (err: any) {
      if (err.message === 'REVIEW_REPORT_INVALID_STATE') {
        throw new BadRequestException({
          code: ReviewsErrorCode.REVIEW_REPORT_INVALID_STATE,
          message: `Cannot start review on report in status: ${report.status}`,
        });
      }
      throw err;
    }
  }

  /**
   * Operations: Resolve Report (OPEN/UNDER_REVIEW -> RESOLVED)
   */
  async resolveReport(
    organizationId: string,
    actorUserId: string,
    reportId: string,
    dto: ResolveReviewReportDto,
  ): Promise<ReviewReportResponseDto> {
    const report = await this.reviewsRepo.findReportById(
      reportId,
      organizationId,
    );
    if (!report) {
      throw new NotFoundException({
        code: ReviewsErrorCode.REVIEW_REPORT_NOT_FOUND,
        message: 'Review report not found.',
      });
    }

    if (!dto.resolutionNote || dto.resolutionNote.trim().length < 3) {
      throw new BadRequestException({
        code: ReviewsErrorCode.REVIEW_REPORT_REASON_REQUIRED,
        message: 'Resolution note (minimum 3 characters) is required to resolve a report.',
      });
    }

    try {
      const updated = await this.reviewsRepo.atomicResolveReport({
        reportId: report.id,
        organizationId,
        actorUserId,
        resolutionNote: dto.resolutionNote.trim(),
      });

      return this.mapToReportResponse(updated);
    } catch (err: any) {
      if (err.message === 'REVIEW_REPORT_INVALID_STATE') {
        throw new BadRequestException({
          code: ReviewsErrorCode.REVIEW_REPORT_INVALID_STATE,
          message: `Cannot resolve report in terminal status: ${report.status}`,
        });
      }
      throw err;
    }
  }

  /**
   * Operations: Dismiss Report (OPEN/UNDER_REVIEW -> DISMISSED)
   */
  async dismissReport(
    organizationId: string,
    actorUserId: string,
    reportId: string,
    dto: DismissReviewReportDto,
  ): Promise<ReviewReportResponseDto> {
    const report = await this.reviewsRepo.findReportById(
      reportId,
      organizationId,
    );
    if (!report) {
      throw new NotFoundException({
        code: ReviewsErrorCode.REVIEW_REPORT_NOT_FOUND,
        message: 'Review report not found.',
      });
    }

    try {
      const updated = await this.reviewsRepo.atomicDismissReport({
        reportId: report.id,
        organizationId,
        actorUserId,
        resolutionNote: dto.resolutionNote?.trim(),
      });

      return this.mapToReportResponse(updated);
    } catch (err: any) {
      if (err.message === 'REVIEW_REPORT_INVALID_STATE') {
        throw new BadRequestException({
          code: ReviewsErrorCode.REVIEW_REPORT_INVALID_STATE,
          message: `Cannot dismiss report in terminal status: ${report.status}`,
        });
      }
      throw err;
    }
  }
}
