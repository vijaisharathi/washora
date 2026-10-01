import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateReviewDto,
  CreateReviewReportDto,
  ReviewListQueryDto,
  ReviewResponseDto,
  UpdateReviewDto,
} from '../dto';
import { ReviewsRepository } from '../repositories/reviews.repository';
import {
  ReviewsErrorCode,
  ReviewStatus,
} from '../types/reviews.types';
import { IdempotencyService } from './idempotency.service';
import { ReviewValidationService } from './review-validation.service';

@Injectable()
export class CustomerReviewService {
  constructor(
    private readonly reviewsRepo: ReviewsRepository,
    private readonly validationService: ReviewValidationService,
    private readonly idempotencyService: IdempotencyService,
  ) {}

  /**
   * Helper: Map Prisma review to clean ReviewResponseDto
   */
  mapToResponse(review: any): ReviewResponseDto {
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
      providerResponse:
        review.status === ReviewStatus.PUBLISHED && review.reviewResponse
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

  /**
   * Submit Review for Completed Booking
   */
  async createReview(
    organizationId: string,
    userId: string,
    dto: CreateReviewDto,
    idempotencyKey?: string,
  ): Promise<ReviewResponseDto> {
    const scope = `${organizationId}:review:create:${userId}`;
    if (idempotencyKey) {
      const cached = this.idempotencyService.get<ReviewResponseDto>(
        scope,
        idempotencyKey,
        dto,
      );
      if (cached) return cached;
    }

    const customer = await this.reviewsRepo.findCustomerByUserId(
      userId,
      organizationId,
    );
    if (!customer) {
      throw new ForbiddenException({
        code: ReviewsErrorCode.REVIEW_ACCESS_DENIED,
        message: 'Customer profile not found for authenticated user.',
      });
    }

    // Resolve booking
    const booking = await this.reviewsRepo.findBookingForReview(
      organizationId,
      dto.bookingId,
    );
    if (!booking) {
      throw new NotFoundException({
        code: ReviewsErrorCode.REVIEW_NOT_ELIGIBLE,
        message: 'Booking not found in the current organization.',
      });
    }

    // Ownership check
    if (booking.customerId !== customer.id) {
      throw new ForbiddenException({
        code: ReviewsErrorCode.REVIEW_ACCESS_DENIED,
        message: 'You can only review bookings that you own.',
      });
    }

    // Status check - only completed bookings
    if (booking.status !== 'COMPLETED') {
      throw new BadRequestException({
        code: ReviewsErrorCode.REVIEW_NOT_ELIGIBLE,
        message: `Reviews are only permitted for COMPLETED bookings. Current status: ${booking.status}`,
      });
    }

    // Duplicate check
    if (booking.review) {
      throw new ConflictException({
        code: ReviewsErrorCode.REVIEW_ALREADY_EXISTS,
        message: 'A review has already been submitted for this booking.',
      });
    }

    // Provider check
    if (!booking.providerId) {
      throw new BadRequestException({
        code: ReviewsErrorCode.REVIEW_NOT_ELIGIBLE,
        message: 'Booking does not have an assigned provider.',
      });
    }

    // Validation
    const rating = this.validationService.validateRating(dto.rating);
    const title = this.validationService.validateTitle(dto.title);
    const comment = this.validationService.validateComment(dto.comment);

    // Atomic Creation
    const created = await this.reviewsRepo.atomicCreateReview({
      organizationId,
      customerId: customer.id,
      actorUserId: userId,
      bookingId: booking.id,
      providerId: booking.providerId,
      serviceId: booking.serviceId,
      rating,
      title,
      comment,
    });

    const response = this.mapToResponse(created);

    if (idempotencyKey) {
      this.idempotencyService.set(scope, idempotencyKey, dto, response);
    }

    return response;
  }

  /**
   * List Customer's own reviews
   */
  async getCustomerReviews(
    organizationId: string,
    userId: string,
    query: ReviewListQueryDto,
  ) {
    const customer = await this.reviewsRepo.findCustomerByUserId(
      userId,
      organizationId,
    );
    if (!customer) {
      throw new ForbiddenException({
        code: ReviewsErrorCode.REVIEW_ACCESS_DENIED,
        message: 'Customer profile not found.',
      });
    }

    const result = await this.reviewsRepo.findReviews({
      organizationId,
      customerId: customer.id,
      status: query.status,
      rating: query.rating,
      bookingId: query.bookingId,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
      page: query.page,
      pageSize: query.pageSize,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    return {
      items: result.items.map((r) => this.mapToResponse(r)),
      meta: result.meta,
    };
  }

  /**
   * Get single review by ID for customer
   */
  async getCustomerReview(
    organizationId: string,
    userId: string,
    reviewId: string,
  ): Promise<ReviewResponseDto> {
    const customer = await this.reviewsRepo.findCustomerByUserId(
      userId,
      organizationId,
    );
    if (!customer) {
      throw new ForbiddenException({
        code: ReviewsErrorCode.REVIEW_ACCESS_DENIED,
        message: 'Customer profile not found.',
      });
    }

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

    if (review.customerId !== customer.id) {
      throw new ForbiddenException({
        code: ReviewsErrorCode.REVIEW_ACCESS_DENIED,
        message: 'Access denied: You do not own this review.',
      });
    }

    return this.mapToResponse(review);
  }

  /**
   * Get review associated with a booking for customer
   */
  async getBookingReview(
    organizationId: string,
    userId: string,
    bookingId: string,
  ): Promise<ReviewResponseDto> {
    const customer = await this.reviewsRepo.findCustomerByUserId(
      userId,
      organizationId,
    );
    if (!customer) {
      throw new ForbiddenException({
        code: ReviewsErrorCode.REVIEW_ACCESS_DENIED,
        message: 'Customer profile not found.',
      });
    }

    const review = await this.reviewsRepo.findReviewByBookingId(
      bookingId,
      organizationId,
    );
    if (!review) {
      throw new NotFoundException({
        code: ReviewsErrorCode.REVIEW_NOT_FOUND,
        message: 'No review found for this booking.',
      });
    }

    if (review.customerId !== customer.id) {
      throw new ForbiddenException({
        code: ReviewsErrorCode.REVIEW_ACCESS_DENIED,
        message: 'Access denied: You do not own this review.',
      });
    }

    return this.mapToResponse(review);
  }

  /**
   * Edit Customer's own review
   */
  async editReview(
    organizationId: string,
    userId: string,
    reviewId: string,
    dto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    const customer = await this.reviewsRepo.findCustomerByUserId(
      userId,
      organizationId,
    );
    if (!customer) {
      throw new ForbiddenException({
        code: ReviewsErrorCode.REVIEW_ACCESS_DENIED,
        message: 'Customer profile not found.',
      });
    }

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

    if (existing.customerId !== customer.id) {
      throw new ForbiddenException({
        code: ReviewsErrorCode.REVIEW_ACCESS_DENIED,
        message: 'Access denied: You cannot edit another customer review.',
      });
    }

    let validatedRating: number | undefined;
    if (dto.rating !== undefined) {
      validatedRating = this.validationService.validateRating(dto.rating);
    }

    let validatedTitle: string | undefined;
    if (dto.title !== undefined) {
      validatedTitle = this.validationService.validateTitle(dto.title);
    }

    let validatedComment: string | undefined;
    if (dto.comment !== undefined) {
      validatedComment = this.validationService.validateComment(dto.comment);
    }

    try {
      const updated = await this.reviewsRepo.atomicEditReview({
        reviewId: existing.id,
        organizationId,
        actorUserId: userId,
        rating: validatedRating,
        title: validatedTitle,
        comment: validatedComment,
      });

      return this.mapToResponse(updated);
    } catch (err: any) {
      if (err.message === 'REVIEW_NOT_EDITABLE') {
        throw new BadRequestException({
          code: ReviewsErrorCode.REVIEW_NOT_EDITABLE,
          message: 'Review can only be edited while in PENDING or PUBLISHED status.',
        });
      }
      throw err;
    }
  }

  /**
   * Customer withdraws own review
   */
  async withdrawReview(
    organizationId: string,
    userId: string,
    reviewId: string,
  ): Promise<ReviewResponseDto> {
    const customer = await this.reviewsRepo.findCustomerByUserId(
      userId,
      organizationId,
    );
    if (!customer) {
      throw new ForbiddenException({
        code: ReviewsErrorCode.REVIEW_ACCESS_DENIED,
        message: 'Customer profile not found.',
      });
    }

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

    if (existing.customerId !== customer.id) {
      throw new ForbiddenException({
        code: ReviewsErrorCode.REVIEW_ACCESS_DENIED,
        message: 'Access denied: You cannot withdraw another customer review.',
      });
    }

    try {
      const updated = await this.reviewsRepo.atomicWithdrawReview({
        reviewId: existing.id,
        organizationId,
        actorUserId: userId,
      });

      return this.mapToResponse(updated);
    } catch (err: any) {
      if (err.message === 'REVIEW_NOT_WITHDRAWABLE') {
        throw new BadRequestException({
          code: ReviewsErrorCode.REVIEW_NOT_WITHDRAWABLE,
          message: 'Review cannot be withdrawn from its current status.',
        });
      }
      throw err;
    }
  }

  /**
   * Customer reports abuse on a published review
   */
  async reportReview(
    organizationId: string,
    userId: string,
    reviewId: string,
    dto: CreateReviewReportDto,
  ) {
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
      const report = await this.reviewsRepo.atomicCreateReviewReport({
        reviewId: existing.id,
        organizationId,
        reportedByUserId: userId,
        reason: dto.reason,
        description: dto.description,
      });

      return {
        id: report.id,
        publicId: report.publicId,
        reviewId: report.reviewId,
        reason: report.reason,
        status: report.status,
        createdAt: report.createdAt,
      };
    } catch (err: any) {
      if (err.message === 'REVIEW_REPORT_NOT_ALLOWED') {
        throw new BadRequestException({
          code: ReviewsErrorCode.REVIEW_REPORT_NOT_ALLOWED,
          message: 'You cannot report your own review.',
        });
      }
      if (err.message === 'REVIEW_REPORT_INVALID_STATE') {
        throw new BadRequestException({
          code: ReviewsErrorCode.REVIEW_REPORT_INVALID_STATE,
          message: 'Only PUBLISHED reviews can be reported for abuse.',
        });
      }
      if (err.message === 'REVIEW_REPORT_ALREADY_EXISTS') {
        throw new ConflictException({
          code: ReviewsErrorCode.REVIEW_REPORT_ALREADY_EXISTS,
          message: 'You have already submitted an active report for this review.',
        });
      }
      throw err;
    }
  }
}
