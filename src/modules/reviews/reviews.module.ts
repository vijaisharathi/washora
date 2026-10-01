import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { CatalogReviewController } from './controllers/catalog-review.controller';
import { CustomerReviewController } from './controllers/customer-review.controller';
import { OperationsReviewController } from './controllers/operations-review.controller';
import { ProviderReviewController } from './controllers/provider-review.controller';
import { ReviewsRepository } from './repositories/reviews.repository';
import { CatalogReviewService } from './services/catalog-review.service';
import { CustomerReviewService } from './services/customer-review.service';
import { IdempotencyService } from './services/idempotency.service';
import { OperationsReviewService } from './services/operations-review.service';
import { ProviderReviewService } from './services/provider-review.service';
import { ReviewAggregationService } from './services/review-aggregation.service';
import { ReviewValidationService } from './services/review-validation.service';

@Module({
  imports: [PrismaModule, AuthModule, AuthorizationModule],
  controllers: [
    CustomerReviewController,
    CatalogReviewController,
    ProviderReviewController,
    OperationsReviewController,
  ],
  providers: [
    ReviewsRepository,
    ReviewValidationService,
    ReviewAggregationService,
    IdempotencyService,
    CustomerReviewService,
    ProviderReviewService,
    CatalogReviewService,
    OperationsReviewService,
  ],
  exports: [
    ReviewsRepository,
    ReviewValidationService,
    ReviewAggregationService,
    CustomerReviewService,
    ProviderReviewService,
    CatalogReviewService,
    OperationsReviewService,
  ],
})
export class ReviewsModule {}
