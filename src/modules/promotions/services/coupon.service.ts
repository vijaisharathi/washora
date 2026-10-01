import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  CouponListQueryDto,
  CouponRedemptionResponseDto,
  CouponResponseDto,
  CreateCouponDto,
  RedeemCouponDto,
  RedeemCouponResponseDto,
  UpdateCouponDto,
  ValidateCouponDto,
  ValidateCouponResponseDto,
} from '../dto';
import { PromotionsRepository } from '../repositories/promotions.repository';
import {
  CouponStatus,
  DiscountType,
  PromotionAuditEvent,
  PromotionErrorCode,
  VALID_COUPON_TRANSITIONS,
} from '../types/promotions.types';
import { IdempotencyService } from './idempotency.service';
import { PromotionCalculatorService } from './promotion-calculator.service';

@Injectable()
export class CouponService {
  constructor(
    private readonly promoRepo: PromotionsRepository,
    private readonly calculator: PromotionCalculatorService,
    private readonly idempotencyService: IdempotencyService,
  ) {}

  private mapCouponToDto(coupon: any): CouponResponseDto {
    return {
      id: coupon.id,
      publicId: coupon.publicId,
      organizationId: coupon.organizationId,
      code: coupon.code,
      name: coupon.title,
      description: coupon.description,
      discountType: coupon.discountType as DiscountType,
      discountValue: new Prisma.Decimal(coupon.discountValue).toFixed(2),
      minimumOrderValue: new Prisma.Decimal(coupon.minOrderAmount).toFixed(2),
      maximumDiscountAmount: coupon.maxDiscount
        ? new Prisma.Decimal(coupon.maxDiscount).toFixed(2)
        : null,
      startAt: coupon.validFrom,
      endAt: coupon.validUntil,
      usageLimit: coupon.usageLimit,
      perCustomerLimit: (coupon as any).perCustomerLimit ?? 1,
      usageCount: coupon.usedCount,
      status: coupon.status as CouponStatus,
      createdAt: coupon.createdAt,
      updatedAt: coupon.updatedAt,
    };
  }

  // --------------------------------------------------------------------------
  // Operations Coupon CRUD & Lifecycle
  // --------------------------------------------------------------------------

  async createCoupon(
    organizationId: string,
    dto: CreateCouponDto,
    userId?: string,
  ): Promise<CouponResponseDto> {
    const normalizedCode = dto.code.trim().toUpperCase();

    // 1. Date Validation
    const startAt = new Date(dto.startAt);
    const endAt = new Date(dto.endAt);
    if (startAt >= endAt) {
      throw new BadRequestException({
        code: PromotionErrorCode.COUPON_NOT_STARTED,
        message: 'Coupon startAt must be strictly before endAt.',
      });
    }

    // 2. Value Validations
    const discountVal = new Prisma.Decimal(dto.discountValue);
    if (dto.discountType === DiscountType.PERCENTAGE) {
      if (discountVal.lte(0) || discountVal.gt(100)) {
        throw new BadRequestException({
          code: PromotionErrorCode.PROMOTION_DISCOUNT_INVALID,
          message: 'Percentage discount must be greater than 0 and at most 100.',
        });
      }
    } else {
      if (discountVal.lte(0)) {
        throw new BadRequestException({
          code: PromotionErrorCode.PROMOTION_DISCOUNT_INVALID,
          message: 'Fixed discount amount must be greater than zero.',
        });
      }
    }

    const minOrder = dto.minimumOrderValue
      ? new Prisma.Decimal(dto.minimumOrderValue)
      : new Prisma.Decimal(0.0);
    if (minOrder.lt(0)) {
      throw new BadRequestException({
        code: PromotionErrorCode.COUPON_MINIMUM_ORDER_NOT_MET,
        message: 'Minimum order value cannot be negative.',
      });
    }

    const maxDiscount = dto.maximumDiscountAmount
      ? new Prisma.Decimal(dto.maximumDiscountAmount)
      : undefined;
    if (maxDiscount && maxDiscount.lte(0)) {
      throw new BadRequestException({
        code: PromotionErrorCode.PROMOTION_DISCOUNT_INVALID,
        message: 'Maximum discount amount must be greater than zero.',
      });
    }

    // 3. Unique normalized code per organization check
    const existing = await this.promoRepo.findCouponByCode(
      organizationId,
      normalizedCode,
    );
    if (existing) {
      throw new ConflictException({
        code: PromotionErrorCode.COUPON_CODE_DUPLICATE,
        message: `Active coupon with code '${normalizedCode}' already exists in this organization.`,
      });
    }

    // 4. Generate Public ID & Persist
    const publicId = await this.promoRepo.generateCouponPublicId(organizationId);
    const created = await this.promoRepo.createCoupon(organizationId, {
      publicId,
      code: normalizedCode,
      name: dto.name.trim(),
      description: dto.description?.trim(),
      discountType: dto.discountType,
      discountValue: discountVal,
      minimumOrderValue: minOrder,
      maximumDiscountAmount: maxDiscount,
      startAt,
      endAt,
      usageLimit: dto.usageLimit,
      perCustomerLimit: dto.perCustomerLimit ?? 1,
    });

    // 5. Audit Event
    await this.promoRepo.createAuditEvent({
      organizationId,
      userId,
      action: PromotionAuditEvent.COUPON_CREATED,
      entityType: 'Coupon',
      entityId: created.id,
      metadataJson: {
        code: created.code,
        discountType: created.discountType,
        discountValue: created.discountValue.toString(),
      },
    });

    return this.mapCouponToDto(created);
  }

  async getCoupons(
    organizationId: string,
    query: CouponListQueryDto,
  ): Promise<{
    items: CouponResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { skip, take, page, limit } = query;
    const [coupons, total] = await Promise.all([
      this.promoRepo.findCoupons(organizationId, query, skip, take),
      this.promoRepo.countCoupons(organizationId, query),
    ]);

    const items = coupons.map((c) => this.mapCouponToDto(c));
    const totalPages = Math.ceil(total / limit) || 1;

    return { items, total, page, limit, totalPages };
  }

  async getCoupon(
    organizationId: string,
    couponIdentifier: string,
  ): Promise<CouponResponseDto> {
    const coupon = await this.promoRepo.findCouponByIdOrPublicId(
      organizationId,
      couponIdentifier,
    );
    if (!coupon) {
      throw new NotFoundException({
        code: PromotionErrorCode.COUPON_NOT_FOUND,
        message: `Coupon '${couponIdentifier}' was not found in current organization.`,
      });
    }
    return this.mapCouponToDto(coupon);
  }

  async updateCoupon(
    organizationId: string,
    couponIdentifier: string,
    dto: UpdateCouponDto,
    userId?: string,
  ): Promise<CouponResponseDto> {
    const coupon = await this.promoRepo.findCouponByIdOrPublicId(
      organizationId,
      couponIdentifier,
    );
    if (!coupon) {
      throw new NotFoundException({
        code: PromotionErrorCode.COUPON_NOT_FOUND,
        message: `Coupon '${couponIdentifier}' was not found.`,
      });
    }

    const data: Prisma.CouponUpdateInput = {};
    if (dto.name !== undefined) data.title = dto.name.trim();
    if (dto.description !== undefined) data.description = dto.description?.trim();
    if (dto.discountType !== undefined) data.discountType = dto.discountType as any;
    if (dto.discountValue !== undefined) {
      data.discountValue = new Prisma.Decimal(dto.discountValue);
    }
    if (dto.minimumOrderValue !== undefined) {
      data.minOrderAmount = new Prisma.Decimal(dto.minimumOrderValue);
    }
    if (dto.maximumDiscountAmount !== undefined) {
      data.maxDiscount = new Prisma.Decimal(dto.maximumDiscountAmount);
    }
    if (dto.startAt !== undefined) data.validFrom = new Date(dto.startAt);
    if (dto.endAt !== undefined) data.validUntil = new Date(dto.endAt);
    if (dto.usageLimit !== undefined) data.usageLimit = dto.usageLimit;

    const updated = await this.promoRepo.updateCoupon(
      organizationId,
      coupon.id,
      data,
    );

    await this.promoRepo.createAuditEvent({
      organizationId,
      userId,
      action: PromotionAuditEvent.COUPON_UPDATED,
      entityType: 'Coupon',
      entityId: updated.id,
      metadataJson: { code: updated.code },
    });

    return this.mapCouponToDto(updated);
  }

  async activateCoupon(
    organizationId: string,
    couponIdentifier: string,
    userId?: string,
  ): Promise<CouponResponseDto> {
    const coupon = await this.promoRepo.findCouponByIdOrPublicId(
      organizationId,
      couponIdentifier,
    );
    if (!coupon) {
      throw new NotFoundException({
        code: PromotionErrorCode.COUPON_NOT_FOUND,
        message: `Coupon '${couponIdentifier}' not found.`,
      });
    }

    const currentStatus = coupon.status as CouponStatus;
    const allowed = VALID_COUPON_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(CouponStatus.ACTIVE)) {
      throw new ConflictException({
        code: PromotionErrorCode.COUPON_INVALID_TRANSITION,
        message: `Cannot transition coupon from status '${currentStatus}' to 'ACTIVE'.`,
      });
    }

    // Expired coupons must never become redeemable again by simply changing state
    if (new Date(coupon.validUntil) < new Date()) {
      throw new BadRequestException({
        code: PromotionErrorCode.COUPON_EXPIRED,
        message: 'Cannot activate an expired coupon. Extend validUntil first.',
      });
    }

    const updated = await this.promoRepo.updateCoupon(organizationId, coupon.id, {
      status: CouponStatus.ACTIVE as any,
    });

    await this.promoRepo.createAuditEvent({
      organizationId,
      userId,
      action: PromotionAuditEvent.COUPON_ACTIVATED,
      entityType: 'Coupon',
      entityId: updated.id,
    });

    return this.mapCouponToDto(updated);
  }

  async pauseCoupon(
    organizationId: string,
    couponIdentifier: string,
    userId?: string,
  ): Promise<CouponResponseDto> {
    const coupon = await this.promoRepo.findCouponByIdOrPublicId(
      organizationId,
      couponIdentifier,
    );
    if (!coupon) {
      throw new NotFoundException({
        code: PromotionErrorCode.COUPON_NOT_FOUND,
        message: `Coupon '${couponIdentifier}' not found.`,
      });
    }

    const currentStatus = coupon.status as CouponStatus;
    const allowed = VALID_COUPON_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(CouponStatus.PAUSED)) {
      throw new ConflictException({
        code: PromotionErrorCode.COUPON_INVALID_TRANSITION,
        message: `Cannot pause coupon with status '${currentStatus}'.`,
      });
    }

    const updated = await this.promoRepo.updateCoupon(organizationId, coupon.id, {
      status: CouponStatus.PAUSED as any,
    });

    await this.promoRepo.createAuditEvent({
      organizationId,
      userId,
      action: PromotionAuditEvent.COUPON_PAUSED,
      entityType: 'Coupon',
      entityId: updated.id,
    });

    return this.mapCouponToDto(updated);
  }

  async disableCoupon(
    organizationId: string,
    couponIdentifier: string,
    userId?: string,
  ): Promise<CouponResponseDto> {
    const coupon = await this.promoRepo.findCouponByIdOrPublicId(
      organizationId,
      couponIdentifier,
    );
    if (!coupon) {
      throw new NotFoundException({
        code: PromotionErrorCode.COUPON_NOT_FOUND,
        message: `Coupon '${couponIdentifier}' not found.`,
      });
    }

    const updated = await this.promoRepo.updateCoupon(organizationId, coupon.id, {
      status: CouponStatus.DISABLED as any,
    });

    await this.promoRepo.createAuditEvent({
      organizationId,
      userId,
      action: PromotionAuditEvent.COUPON_DISABLED,
      entityType: 'Coupon',
      entityId: updated.id,
    });

    return this.mapCouponToDto(updated);
  }

  async getCouponRedemptions(
    organizationId: string,
    couponIdentifier: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    items: CouponRedemptionResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const coupon = await this.promoRepo.findCouponByIdOrPublicId(
      organizationId,
      couponIdentifier,
    );
    if (!coupon) {
      throw new NotFoundException({
        code: PromotionErrorCode.COUPON_NOT_FOUND,
        message: `Coupon '${couponIdentifier}' not found.`,
      });
    }

    const skip = (page - 1) * limit;
    const [redemptions, total] = await Promise.all([
      this.promoRepo.findCouponRedemptions(organizationId, coupon.id, skip, limit),
      this.promoRepo.countCouponRedemptions(organizationId, coupon.id),
    ]);

    const items: CouponRedemptionResponseDto[] = redemptions.map((r) => ({
      id: r.id,
      couponId: r.couponId,
      customerId: r.customerId,
      bookingId: r.bookingId,
      organizationId: r.organizationId,
      discountAmount: new Prisma.Decimal(r.discountApplied).toFixed(2),
      currency: 'INR',
      redeemedAt: r.redeemedAt,
    }));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  // --------------------------------------------------------------------------
  // Customer Coupon Validation & Redemption
  // --------------------------------------------------------------------------

  async validateCustomerCoupon(
    organizationId: string,
    customerUserId: string,
    dto: ValidateCouponDto,
  ): Promise<ValidateCouponResponseDto> {
    const normalizedCode = dto.code.trim().toUpperCase();

    // 1. Resolve Customer Profile
    const customer = await this.promoRepo.findCustomerByUserId(
      customerUserId,
      organizationId,
    );
    if (!customer) {
      throw new ForbiddenException({
        code: PromotionErrorCode.PROMOTION_ACCESS_DENIED,
        message: 'Customer profile required to validate coupon.',
      });
    }

    // 2. Resolve Booking
    const booking = await this.promoRepo.findBooking(
      organizationId,
      dto.bookingId,
    );
    if (!booking) {
      throw new NotFoundException({
        code: PromotionErrorCode.COUPON_NOT_FOUND,
        message: `Booking '${dto.bookingId}' was not found.`,
      });
    }

    // 3. Customer Ownership Verification
    if (booking.customerId !== customer.id) {
      throw new ForbiddenException({
        code: PromotionErrorCode.PROMOTION_ACCESS_DENIED,
        message: 'You are not authorized to validate coupons on another customer booking.',
      });
    }

    // 4. Stacking Rule Check: ONE PROMOTION PER BOOKING
    if (
      (booking.discountAmount && new Prisma.Decimal(booking.discountAmount).gt(0)) ||
      (booking.couponRedemptions && booking.couponRedemptions.length > 0) ||
      (booking.offerRedemptions && booking.offerRedemptions.length > 0)
    ) {
      throw new ConflictException({
        code: PromotionErrorCode.PROMOTION_ALREADY_APPLIED,
        message: 'A promotion is already applied to this booking. Remove it first to apply another.',
      });
    }

    // 5. Resolve Coupon
    const coupon = await this.promoRepo.findCouponByCode(
      organizationId,
      normalizedCode,
    );
    if (!coupon) {
      throw new NotFoundException({
        code: PromotionErrorCode.COUPON_NOT_FOUND,
        message: `Coupon code '${normalizedCode}' is invalid or does not exist.`,
      });
    }

    // 6. Active & Status Check
    if (coupon.status !== ('ACTIVE' as any)) {
      throw new BadRequestException({
        code: PromotionErrorCode.COUPON_INACTIVE,
        message: `Coupon '${normalizedCode}' is currently ${coupon.status.toLowerCase()}.`,
      });
    }

    // 7. Time Window Check
    const now = new Date();
    if (now < new Date(coupon.validFrom)) {
      throw new BadRequestException({
        code: PromotionErrorCode.COUPON_NOT_STARTED,
        message: `Coupon '${normalizedCode}' is not active yet. Valid from ${coupon.validFrom.toISOString()}.`,
      });
    }
    if (now > new Date(coupon.validUntil)) {
      throw new BadRequestException({
        code: PromotionErrorCode.COUPON_EXPIRED,
        message: `Coupon '${normalizedCode}' has expired on ${coupon.validUntil.toISOString()}.`,
      });
    }

    // 8. Global Usage Limit Check
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException({
        code: PromotionErrorCode.COUPON_USAGE_LIMIT_REACHED,
        message: `Coupon '${normalizedCode}' has reached its maximum global usage limit.`,
      });
    }

    // 9. Per-Customer Usage Limit Check
    const customerRedemptions = await this.promoRepo.countCustomerCouponRedemptions(
      organizationId,
      coupon.id,
      customer.id,
    );
    const perCustomerLimit = 1; // canonical default 1 per customer
    if (customerRedemptions >= perCustomerLimit) {
      throw new BadRequestException({
        code: PromotionErrorCode.COUPON_CUSTOMER_LIMIT_REACHED,
        message: `You have already redeemed coupon '${normalizedCode}'. Limit: ${perCustomerLimit}.`,
      });
    }

    // 10. Minimum Order Value Check
    const subtotal = new Prisma.Decimal(booking.subtotal);
    const minOrder = new Prisma.Decimal(coupon.minOrderAmount);
    if (subtotal.lt(minOrder)) {
      throw new BadRequestException({
        code: PromotionErrorCode.COUPON_MINIMUM_ORDER_NOT_MET,
        message: `Booking subtotal (₹${subtotal.toFixed(
          2,
        )}) does not meet the minimum order requirement of ₹${minOrder.toFixed(2)}.`,
      });
    }

    // 11. Calculate Authoritative Discount
    const discountAmount = this.calculator.calculatePromotionDiscount(
      subtotal,
      coupon.discountType as DiscountType,
      new Prisma.Decimal(coupon.discountValue),
      coupon.maxDiscount ? new Prisma.Decimal(coupon.maxDiscount) : null,
    );

    const pricing = this.calculator.calculateFinalPricing({
      subtotal,
      serviceFee: new Prisma.Decimal(booking.serviceFee),
      taxAmount: new Prisma.Decimal(booking.taxAmount),
      promotionDiscount: discountAmount,
      rewardDiscount: new Prisma.Decimal(booking.rewardDiscount || 0),
    });

    return {
      valid: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType as DiscountType,
        discountValue: new Prisma.Decimal(coupon.discountValue).toFixed(2),
      },
      discountAmount: discountAmount.toFixed(2),
      finalAmount: pricing.finalAmount,
    };
  }

  async redeemCustomerCoupon(
    organizationId: string,
    customerUserId: string,
    dto: RedeemCouponDto,
    idempotencyKey?: string,
  ): Promise<RedeemCouponResponseDto> {
    const scope = `${organizationId}:coupon:redeem:${dto.bookingId}`;

    // 1. Idempotency Check
    if (idempotencyKey) {
      const cached = this.idempotencyService.check<RedeemCouponResponseDto>(
        scope,
        idempotencyKey,
        dto,
      );
      if (cached) return cached;
    }

    // 2. Validate all coupon eligibility rules
    const validation = await this.validateCustomerCoupon(
      organizationId,
      customerUserId,
      dto,
    );

    const customer = await this.promoRepo.findCustomerByUserId(
      customerUserId,
      organizationId,
    );
    const booking = await this.promoRepo.findBooking(organizationId, dto.bookingId);
    const coupon = await this.promoRepo.findCouponByCode(
      organizationId,
      dto.code.trim().toUpperCase(),
    );

    if (!customer || !booking || !coupon) {
      throw new NotFoundException({
        code: PromotionErrorCode.COUPON_NOT_FOUND,
        message: 'Could not resolve entities for redemption.',
      });
    }

    const discountDec = new Prisma.Decimal(validation.discountAmount);
    const newTotal = new Prisma.Decimal(validation.finalAmount);

    // 3. Concurrency-Safe Atomic Redemption
    let result: { redemption: any; updatedCoupon: any; updatedBooking: any };
    try {
      result = await this.promoRepo.atomicRedeemCoupon({
        couponId: coupon.id,
        customerId: customer.id,
        bookingId: booking.id,
        organizationId,
        discountAmount: discountDec,
        newBookingTotal: newTotal,
        usageLimit: coupon.usageLimit,
      });
    } catch (err: any) {
      if (err.message === 'COUPON_USAGE_LIMIT_REACHED') {
        throw new BadRequestException({
          code: PromotionErrorCode.COUPON_USAGE_LIMIT_REACHED,
          message: 'Coupon usage limit was reached during concurrent redemption.',
        });
      }
      throw err;
    }

    // 4. Audit Event
    await this.promoRepo.createAuditEvent({
      organizationId,
      userId: customerUserId,
      action: PromotionAuditEvent.COUPON_REDEEMED,
      entityType: 'CouponRedemption',
      entityId: result.redemption.id,
      metadataJson: {
        couponCode: coupon.code,
        bookingId: booking.id,
        discountAmount: validation.discountAmount,
        finalAmount: validation.finalAmount,
      },
    });

    const response: RedeemCouponResponseDto = {
      valid: true,
      coupon: validation.coupon,
      discountAmount: validation.discountAmount,
      finalAmount: validation.finalAmount,
      redemptionId: result.redemption.id,
      redeemedAt: result.redemption.redeemedAt,
    };

    // 5. Save Idempotency
    if (idempotencyKey) {
      this.idempotencyService.save(scope, idempotencyKey, dto, response);
    }

    return response;
  }

  async removeBookingCoupon(
    organizationId: string,
    customerUserId: string,
    bookingIdentifier: string,
  ): Promise<{ success: boolean; message: string; restoredAmount: string }> {
    const customer = await this.promoRepo.findCustomerByUserId(
      customerUserId,
      organizationId,
    );
    if (!customer) {
      throw new ForbiddenException({
        code: PromotionErrorCode.PROMOTION_ACCESS_DENIED,
        message: 'Customer profile required.',
      });
    }

    const booking = await this.promoRepo.findBooking(
      organizationId,
      bookingIdentifier,
    );
    if (!booking) {
      throw new NotFoundException({
        code: PromotionErrorCode.COUPON_NOT_FOUND,
        message: `Booking '${bookingIdentifier}' not found.`,
      });
    }

    if (booking.customerId !== customer.id) {
      throw new ForbiddenException({
        code: PromotionErrorCode.PROMOTION_ACCESS_DENIED,
        message: 'You are not authorized to modify another customer booking.',
      });
    }

    // Calculate restored total without promotion discount (preserving reward discount if any)
    const pricing = this.calculator.calculateFinalPricing({
      subtotal: new Prisma.Decimal(booking.subtotal),
      serviceFee: new Prisma.Decimal(booking.serviceFee),
      taxAmount: new Prisma.Decimal(booking.taxAmount),
      promotionDiscount: new Prisma.Decimal(0.0),
      rewardDiscount: new Prisma.Decimal(booking.rewardDiscount || 0.0),
    });

    const { updatedBooking } = await this.promoRepo.atomicRemovePromotionFromBooking({
      organizationId,
      bookingId: booking.id,
      restoredTotal: new Prisma.Decimal(pricing.finalAmount),
    });

    await this.promoRepo.createAuditEvent({
      organizationId,
      userId: customerUserId,
      action: PromotionAuditEvent.COUPON_REMOVED,
      entityType: 'Booking',
      entityId: booking.id,
      metadataJson: { restoredTotal: pricing.finalAmount },
    });

    return {
      success: true,
      message: 'Promotion removed successfully from booking.',
      restoredAmount: updatedBooking.totalAmount.toFixed(2),
    };
  }
}
