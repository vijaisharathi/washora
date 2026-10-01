import { Injectable, NotFoundException } from '@nestjs/common';
import { ReviewListQueryDto, ReviewResponseDto, ReviewSummaryDto } from '../dto';
import { ReviewsRepository } from '../repositories/reviews.repository';
import { ReviewStatus } from '../types/reviews.types';

@Injectable()
export class CatalogReviewService {
  constructor(private readonly reviewsRepo: ReviewsRepository) {}

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
   * List Published Reviews for a Service (Public/Catalog)
   */
  async getServiceReviews(
    organizationId: string,
    serviceId: string,
    query: ReviewListQueryDto,
  ) {
    const result = await this.reviewsRepo.findReviews({
      organizationId,
      serviceId,
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
   * Rating Summary for a Service (Public/Catalog)
   */
  async getServiceReviewSummary(
    organizationId: string,
    serviceId: string,
  ): Promise<ReviewSummaryDto> {
    return this.reviewsRepo.computeRatingSummary(organizationId, {
      serviceId,
    });
  }
}
