import { Injectable } from '@nestjs/common';
import { ReviewsRepository } from '../repositories/reviews.repository';
import { ReviewSummaryDto } from '../dto';

@Injectable()
export class ReviewAggregationService {
  constructor(private readonly reviewsRepo: ReviewsRepository) {}

  /**
   * Get rating summary for a specific service
   */
  async getServiceReviewSummary(
    organizationId: string,
    serviceId: string,
  ): Promise<ReviewSummaryDto> {
    return this.reviewsRepo.computeRatingSummary(organizationId, {
      serviceId,
    });
  }

  /**
   * Get rating summary for a specific provider
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
   * Recalculate and synchronize provider aggregates
   */
  async recalculateProvider(
    organizationId: string,
    providerId: string,
  ): Promise<ReviewSummaryDto> {
    return this.reviewsRepo.computeRatingSummary(organizationId, {
      providerId,
    });
  }

  /**
   * Recalculate and synchronize service aggregates
   */
  async recalculateService(
    organizationId: string,
    serviceId: string,
  ): Promise<ReviewSummaryDto> {
    return this.reviewsRepo.computeRatingSummary(organizationId, {
      serviceId,
    });
  }
}
