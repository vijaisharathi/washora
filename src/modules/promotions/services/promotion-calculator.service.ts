import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PricingCalculationDto } from '../dto/pricing-calculation.dto';
import { DiscountType, PromotionErrorCode } from '../types/promotions.types';

@Injectable()
export class PromotionCalculatorService {
  /**
   * Helper to round a decimal to 2 places deterministically
   */
  private round2(decimal: Prisma.Decimal): Prisma.Decimal {
    return new Prisma.Decimal(decimal.toFixed(2));
  }

  /**
   * Calculates discount for a coupon or promotional offer against a booking subtotal.
   * Enforces:
   * 1. Percentage discount: subtotal * (rate / 100), capped by maxDiscount if provided.
   * 2. Fixed discount: min(discountValue, subtotal).
   * 3. Lower bound: discount cannot exceed subtotal.
   */
  calculatePromotionDiscount(
    subtotal: Prisma.Decimal,
    discountType: DiscountType,
    discountValue: Prisma.Decimal,
    maxDiscount?: Prisma.Decimal | null,
  ): Prisma.Decimal {
    if (subtotal.lte(0)) {
      return new Prisma.Decimal(0);
    }

    let calculatedDiscount: Prisma.Decimal;

    if (discountType === DiscountType.PERCENTAGE) {
      if (discountValue.lte(0) || discountValue.gt(100)) {
        throw new BadRequestException({
          code: PromotionErrorCode.PROMOTION_DISCOUNT_INVALID,
          message: 'Percentage discount must be between 0 and 100.',
        });
      }
      calculatedDiscount = subtotal.mul(discountValue).div(100);

      if (maxDiscount && maxDiscount.gt(0) && calculatedDiscount.gt(maxDiscount)) {
        calculatedDiscount = maxDiscount;
      }
    } else if (discountType === DiscountType.FIXED_AMOUNT) {
      if (discountValue.lte(0)) {
        throw new BadRequestException({
          code: PromotionErrorCode.PROMOTION_DISCOUNT_INVALID,
          message: 'Fixed discount amount must be greater than zero.',
        });
      }
      calculatedDiscount = discountValue;
    } else {
      throw new BadRequestException({
        code: PromotionErrorCode.PROMOTION_DISCOUNT_INVALID,
        message: 'Unsupported discount type.',
      });
    }

    // Never allow discount to exceed subtotal
    if (calculatedDiscount.gt(subtotal)) {
      calculatedDiscount = subtotal;
    }

    return this.round2(calculatedDiscount);
  }

  /**
   * Converts customer reward points into an authoritative monetary discount:
   * Rule: 100 reward points = ₹10 discount => 10 points = ₹1.
   * The reward discount cannot exceed the remaining payable amount.
   */
  calculateRewardDiscount(
    points: number,
    remainingPayable: Prisma.Decimal,
  ): Prisma.Decimal {
    if (points <= 0) {
      return new Prisma.Decimal(0);
    }

    // 10 points = ₹1 discount => discount = points / 10
    const rawDiscount = new Prisma.Decimal(points).div(10);
    let effectiveDiscount = this.round2(rawDiscount);

    if (effectiveDiscount.gt(remainingPayable)) {
      effectiveDiscount = remainingPayable;
    }

    return effectiveDiscount;
  }

  /**
   * Complete pricing calculation pipeline:
   * Base Amount + Service Fee + Tax - (Promotion Discount + Reward Discount) = Final Amount
   */
  calculateFinalPricing(params: {
    subtotal: Prisma.Decimal;
    serviceFee?: Prisma.Decimal;
    taxAmount?: Prisma.Decimal;
    promotionDiscount?: Prisma.Decimal;
    rewardDiscount?: Prisma.Decimal;
  }): PricingCalculationDto {
    const subtotal = this.round2(params.subtotal);
    const serviceFee = this.round2(params.serviceFee || new Prisma.Decimal(0));
    const taxAmount = this.round2(params.taxAmount || new Prisma.Decimal(0));
    const promotionDiscount = this.round2(
      params.promotionDiscount || new Prisma.Decimal(0),
    );
    const rewardDiscount = this.round2(
      params.rewardDiscount || new Prisma.Decimal(0),
    );

    const grossPayable = subtotal.add(serviceFee).add(taxAmount);
    const totalDiscount = promotionDiscount.add(rewardDiscount);

    let finalAmount = grossPayable.sub(totalDiscount);
    if (finalAmount.lt(0)) {
      finalAmount = new Prisma.Decimal(0);
    }

    return {
      subtotal: subtotal.toFixed(2),
      serviceFee: serviceFee.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      promotionDiscount: promotionDiscount.toFixed(2),
      rewardDiscount: rewardDiscount.toFixed(2),
      totalDiscount: totalDiscount.toFixed(2),
      finalAmount: finalAmount.toFixed(2),
    };
  }
}
