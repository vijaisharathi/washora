import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { CustomerCouponController } from './controllers/customer-coupon.controller';
import { CustomerOfferController } from './controllers/customer-offer.controller';
import { CustomerRewardController } from './controllers/customer-reward.controller';
import { OperationsCouponController } from './controllers/operations-coupon.controller';
import { OperationsOfferController } from './controllers/operations-offer.controller';
import { OperationsRewardController } from './controllers/operations-reward.controller';
import { PromotionsRepository } from './repositories/promotions.repository';
import { CouponService } from './services/coupon.service';
import { IdempotencyService } from './services/idempotency.service';
import { OfferService } from './services/offer.service';
import { PromotionCalculatorService } from './services/promotion-calculator.service';
import { RewardService } from './services/reward.service';

@Module({
  imports: [PrismaModule, AuthModule, AuthorizationModule],
  controllers: [
    CustomerCouponController,
    CustomerOfferController,
    CustomerRewardController,
    OperationsCouponController,
    OperationsOfferController,
    OperationsRewardController,
  ],
  providers: [
    PromotionsRepository,
    IdempotencyService,
    PromotionCalculatorService,
    CouponService,
    OfferService,
    RewardService,
  ],
  exports: [
    PromotionsRepository,
    CouponService,
    OfferService,
    RewardService,
    PromotionCalculatorService,
    IdempotencyService,
  ],
})
export class PromotionsModule {}
