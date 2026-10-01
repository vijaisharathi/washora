import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateReviewResponseDto,
  ReviewListQueryDto,
  ReviewResponseDto,
  ReviewSummaryDto,
  UpdateReviewResponseDto,
} from '../dto';
import { ReviewsRepository } from '../repositories/reviews.repository';
import {
  ReviewsErrorCode,
  ReviewStatus,
} from '../types/reviews.types';
import { ReviewValidationService } from './review-validation.service';

@Injectable()
export class ProviderReviewService {
  constructor(
    private readonly reviewsRepo: ReviewsRepository,
    private readonly validationService: ReviewValidationService,
  ) {}

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
   * Public / Catalog Provider Reviews
   */
  async getProviderPublicReviews(
    organizationId: string,
    providerId: string,
    query: ReviewListQueryDto,
  ) {
    const result = await this.reviewsRepo.findReviews({
      organizationId,
      providerId,
      publishedOnly: true,
      rating: query.rating,
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
   * Public / Catalog Provider Review Summary
   */
  async getProviderReviewSummary(
    organizationId: string,
    providerId: string,
  ): Promise<ReviewSummaryDto> {
    return this.reviewsRepo.computeRatingSummary(organizationId, {
      providerId,
    });
  }

  /**
   * Provider Self Reviews Feed
   */
  async getProviderSelfReviews(
    organizationId: string,
    userId: string,
    query: ReviewListQueryDto,
  ) {
    const provider = await this.reviewsRepo.findProviderByUserId(
      userId,
      organizationId,
    );
    if (!provider) {
      throw new ForbiddenException({
        code: ReviewsErrorCode.PROVIDER_REVIEW_ACCESS_DENIED,
        message: 'Provider profile not found for authenticated user.',
      });
    }

    const result = await this.reviewsRepo.findReviews({
      organizationId,
      providerId: provider.id,
      publishedOnly: true,
      rating: query.rating,
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
   * Provider Self Review by ID
   */
  async getProviderSelfReview(
    organizationId: string,
    userId: string,
    reviewId: string,
  ): Promise<ReviewResponseDto> {
    const provider = await this.reviewsRepo.findProviderByUserId(
      userId,
      organizationId,
    );
    if (!provider) {
      throw new ForbiddenException({
        code: ReviewsErrorCode.PROVIDER_REVIEW_ACCESS_DENIED,
        message: 'Provider profile not found.',
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

    if (review.providerId !== provider.id) {
      throw new ForbiddenException({
        code: ReviewsErrorCode.PROVIDER_REVIEW_ACCESS_DENIED,
        message: 'Access denied: This review belongs to another provider.',
      });
    }

    return this.mapToResponse(review);
  }

  /**
   * Provider Self Summary
   */
  async getProviderSelfSummary(
    organizationId: string,
    userId: string,
  ): Promise<ReviewSummaryDto> {
    const provider = await this.reviewsRepo.findProviderByUserId(
      userId,
      organizationId,
    );
    if (!provider) {
      throw new ForbiddenException({
        code: ReviewsErrorCode.PROVIDER_REVIEW_ACCESS_DENIED,
        message: 'Provider profile not found.',
      });
    }

    return this.reviewsRepo.computeRatingSummary(organizationId, {
      providerId: provider.id,
    });
  }

  /**
   * Provider Response: Create
   */
  async createProviderResponse(
    organizationId: string,
    userId: string,
    reviewId: string,
    dto: CreateReviewResponseDto,
  ) {
    const provider = await this.reviewsRepo.findProviderByUserId(
      userId,
      organizationId,
    );
    if (!provider) {
      throw new ForbiddenException({
        code: ReviewsErrorCode.PROVIDER_REVIEW_ACCESS_DENIED,
        message: 'Provider profile not found.',
      });
    }

    const comment = this.validationService.validateResponseComment(dto.comment);

    try {
      const resp = await this.reviewsRepo.atomicCreateProviderResponse({
        reviewId,
        providerId: provider.id,
        organizationId,
        actorUserId: userId,
        comment,
      });

      return {
        id: resp.id,
        reviewId: resp.reviewId,
        comment: resp.comment,
        createdAt: resp.createdAt,
        updatedAt: resp.updatedAt,
      };
    } catch (err: any) {
      if (err.message === 'REVIEW_NOT_FOUND') {
        throw new NotFoundException({
          code: ReviewsErrorCode.REVIEW_NOT_FOUND,
          message: 'Review not found.',
        });
      }
      if (err.message === 'PROVIDER_REVIEW_ACCESS_DENIED') {
        throw new ForbiddenException({
          code: ReviewsErrorCode.PROVIDER_REVIEW_ACCESS_DENIED,
          message: 'You can only respond to reviews that reference your services.',
        });
      }
      if (err.message === 'REVIEW_RESPONSE_ALREADY_EXISTS') {
        throw new ConflictException({
          code: ReviewsErrorCode.REVIEW_RESPONSE_ALREADY_EXISTS,
          message: 'A response has already been submitted for this review.',
        });
      }
      throw err;
    }
  }

  /**
   * Provider Response: Update
   */
  async updateProviderResponse(
    organizationId: string,
    userId: string,
    reviewId: string,
    dto: UpdateReviewResponseDto,
  ) {
    const provider = await this.reviewsRepo.findProviderByUserId(
      userId,
      organizationId,
    );
    if (!provider) {
      throw new ForbiddenException({
        code: ReviewsErrorCode.PROVIDER_REVIEW_ACCESS_DENIED,
        message: 'Provider profile not found.',
      });
    }

    const comment = this.validationService.validateResponseComment(dto.comment);

    try {
      const resp = await this.reviewsRepo.atomicUpdateProviderResponse({
        reviewId,
        providerId: provider.id,
        organizationId,
        actorUserId: userId,
        comment,
      });

      return {
        id: resp.id,
        reviewId: resp.reviewId,
        comment: resp.comment,
        createdAt: resp.createdAt,
        updatedAt: resp.updatedAt,
      };
    } catch (err: any) {
      if (err.message === 'REVIEW_RESPONSE_NOT_FOUND') {
        throw new NotFoundException({
          code: ReviewsErrorCode.REVIEW_RESPONSE_NOT_FOUND,
          message: 'Provider response not found.',
        });
      }
      throw err;
    }
  }

  /**
   * Provider Response: Delete
   */
  async deleteProviderResponse(
    organizationId: string,
    userId: string,
    reviewId: string,
  ) {
    const provider = await this.reviewsRepo.findProviderByUserId(
      userId,
      organizationId,
    );
    if (!provider) {
      throw new ForbiddenException({
        code: ReviewsErrorCode.PROVIDER_REVIEW_ACCESS_DENIED,
        message: 'Provider profile not found.',
      });
    }

    try {
      return await this.reviewsRepo.atomicDeleteProviderResponse({
        reviewId,
        providerId: provider.id,
        organizationId,
        actorUserId: userId,
      });
    } catch (err: any) {
      if (err.message === 'REVIEW_RESPONSE_NOT_FOUND') {
        throw new NotFoundException({
          code: ReviewsErrorCode.REVIEW_RESPONSE_NOT_FOUND,
          message: 'Provider response not found.',
        });
      }
      throw err;
    }
  }
}
