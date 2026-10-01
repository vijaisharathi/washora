import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  CreateOfferDto,
  OfferListQueryDto,
  OfferRedemptionResponseDto,
  OfferResponseDto,
  RedeemOfferDto,
  RedeemOfferResponseDto,
  UpdateOfferDto,
  ValidateOfferDto,
  ValidateOfferResponseDto,
} from '../dto';
import { PromotionsRepository } from '../repositories/promotions.repository';
import {
  DiscountType,
  OfferStatus,
  OfferType,
  PromotionAuditEvent,
  PromotionErrorCode,
  VALID_OFFER_TRANSITIONS,
} from '../types/promotions.types';
import { IdempotencyService } from './idempotency.service';
import { PromotionCalculatorService } from './promotion-calculator.service';

@Injectable()
export class OfferService {
  constructor(
    private readonly promoRepo: PromotionsRepository,
    private readonly calculator: PromotionCalculatorService,
    private readonly idempotencyService: IdempotencyService,
  ) {}

  private mapOfferToDto(offer: any): OfferResponseDto {
    return {
      id: offer.id,
      publicId: offer.publicId,
      organizationId: offer.organizationId,
      name: offer.title,
      bannerText: offer.bannerText,
      bannerImageUrl: offer.bannerImageUrl,
      offerType: (offer as any).offerType ?? OfferType.GENERAL,
      discountType: offer.discountType as DiscountType,
      discountValue: new Prisma.Decimal(offer.discountValue).toFixed(2),
      minimumOrderValue: new Prisma.Decimal(offer.minOrderAmount).toFixed(2),
      maximumDiscountAmount: offer.maxDiscount
        ? new Prisma.Decimal(offer.maxDiscount).toFixed(2)
        : null,
      startAt: offer.validFrom,
      endAt: offer.validUntil,
      usageLimit: (offer as any).usageLimit ?? null,
      perCustomerLimit: (offer as any).perCustomerLimit ?? 1,
      usageCount: (offer as any).usedCount ?? 0,
      status: offer.status as OfferStatus,
      serviceId: (offer as any).serviceId ?? null,
      categoryId: (offer as any).categoryId ?? null,
      createdAt: offer.createdAt,
      updatedAt: offer.updatedAt,
    };
  }

  // --------------------------------------------------------------------------
  // Operations Offer CRUD & Lifecycle
  // --------------------------------------------------------------------------

  async createOffer(
    organizationId: string,
    dto: CreateOfferDto,
    userId?: string,
  ): Promise<OfferResponseDto> {
    const startAt = new Date(dto.startAt);
    const endAt = new Date(dto.endAt);
    if (startAt >= endAt) {
      throw new BadRequestException({
        code: PromotionErrorCode.OFFER_NOT_STARTED,
        message: 'Offer startAt must be strictly before endAt.',
      });
    }

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

    const publicId = await this.promoRepo.generateOfferPublicId(organizationId);

    const created = await this.promoRepo.createOffer(organizationId, {
      publicId,
      name: dto.name.trim(),
      bannerText: dto.bannerText?.trim(),
      bannerImageUrl: dto.bannerImageUrl?.trim(),
      offerType: dto.offerType,
      discountType: dto.discountType,
      discountValue: discountVal,
      minimumOrderValue: minOrder,
      startAt,
      endAt,
      serviceId: dto.serviceId,
      categoryId: dto.categoryId,
    });

    await this.promoRepo.createAuditEvent({
      organizationId,
      userId,
      action: PromotionAuditEvent.OFFER_CREATED,
      entityType: 'PromotionalOffer',
      entityId: created.id,
      metadataJson: {
        title: created.title,
        discountType: created.discountType,
        discountValue: created.discountValue.toString(),
      },
    });

    return this.mapOfferToDto(created);
  }

  async getOffers(
    organizationId: string,
    query: OfferListQueryDto,
  ): Promise<{
    items: OfferResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { skip, take, page, limit } = query;
    const [offers, total] = await Promise.all([
      this.promoRepo.findOffers(organizationId, query, skip, take),
      this.promoRepo.countOffers(organizationId, query),
    ]);

    const items = offers.map((o) => this.mapOfferToDto(o));
    const totalPages = Math.ceil(total / limit) || 1;

    return { items, total, page, limit, totalPages };
  }

  async getOffer(
    organizationId: string,
    offerIdentifier: string,
  ): Promise<OfferResponseDto> {
    const offer = await this.promoRepo.findOfferByIdOrPublicId(
      organizationId,
      offerIdentifier,
    );
    if (!offer) {
      throw new NotFoundException({
        code: PromotionErrorCode.OFFER_NOT_FOUND,
        message: `Promotional offer '${offerIdentifier}' was not found.`,
      });
    }
    return this.mapOfferToDto(offer);
  }

  async updateOffer(
    organizationId: string,
    offerIdentifier: string,
    dto: UpdateOfferDto,
    userId?: string,
  ): Promise<OfferResponseDto> {
    const offer = await this.promoRepo.findOfferByIdOrPublicId(
      organizationId,
      offerIdentifier,
    );
    if (!offer) {
      throw new NotFoundException({
        code: PromotionErrorCode.OFFER_NOT_FOUND,
        message: `Promotional offer '${offerIdentifier}' was not found.`,
      });
    }

    const data: Prisma.PromotionalOfferUpdateInput = {};
    if (dto.name !== undefined) data.title = dto.name.trim();
    if (dto.bannerText !== undefined) data.bannerText = dto.bannerText?.trim();
    if (dto.bannerImageUrl !== undefined) data.bannerImageUrl = dto.bannerImageUrl?.trim();
    if (dto.discountType !== undefined) data.discountType = dto.discountType as any;
    if (dto.discountValue !== undefined) {
      data.discountValue = new Prisma.Decimal(dto.discountValue);
    }
    if (dto.minimumOrderValue !== undefined) {
      data.minOrderAmount = new Prisma.Decimal(dto.minimumOrderValue);
    }
    if (dto.startAt !== undefined) data.validFrom = new Date(dto.startAt);
    if (dto.endAt !== undefined) data.validUntil = new Date(dto.endAt);

    const updated = await this.promoRepo.updateOffer(
      organizationId,
      offer.id,
      data,
    );

    await this.promoRepo.createAuditEvent({
      organizationId,
      userId,
      action: PromotionAuditEvent.OFFER_UPDATED,
      entityType: 'PromotionalOffer',
      entityId: updated.id,
      metadataJson: { title: updated.title },
    });

    return this.mapOfferToDto(updated);
  }

  async activateOffer(
    organizationId: string,
    offerIdentifier: string,
    userId?: string,
  ): Promise<OfferResponseDto> {
    const offer = await this.promoRepo.findOfferByIdOrPublicId(
      organizationId,
      offerIdentifier,
    );
    if (!offer) {
      throw new NotFoundException({
        code: PromotionErrorCode.OFFER_NOT_FOUND,
        message: `Offer '${offerIdentifier}' not found.`,
      });
    }

    const currentStatus = offer.status as OfferStatus;
    const allowed = VALID_OFFER_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(OfferStatus.ACTIVE)) {
      throw new ConflictException({
        code: PromotionErrorCode.OFFER_INVALID_TRANSITION,
        message: `Cannot transition offer from status '${currentStatus}' to 'ACTIVE'.`,
      });
    }

    if (new Date(offer.validUntil) < new Date()) {
      throw new BadRequestException({
        code: PromotionErrorCode.OFFER_EXPIRED,
        message: 'Cannot activate an expired offer. Extend validUntil first.',
      });
    }

    const updated = await this.promoRepo.updateOffer(organizationId, offer.id, {
      status: OfferStatus.ACTIVE as any,
    });

    await this.promoRepo.createAuditEvent({
      organizationId,
      userId,
      action: PromotionAuditEvent.OFFER_ACTIVATED,
      entityType: 'PromotionalOffer',
      entityId: updated.id,
    });

    return this.mapOfferToDto(updated);
  }

  async pauseOffer(
    organizationId: string,
    offerIdentifier: string,
    userId?: string,
  ): Promise<OfferResponseDto> {
    const offer = await this.promoRepo.findOfferByIdOrPublicId(
      organizationId,
      offerIdentifier,
    );
    if (!offer) {
      throw new NotFoundException({
        code: PromotionErrorCode.OFFER_NOT_FOUND,
        message: `Offer '${offerIdentifier}' not found.`,
      });
    }

    const updated = await this.promoRepo.updateOffer(organizationId, offer.id, {
      status: OfferStatus.PAUSED as any,
    });

    await this.promoRepo.createAuditEvent({
      organizationId,
      userId,
      action: PromotionAuditEvent.OFFER_PAUSED,
      entityType: 'PromotionalOffer',
      entityId: updated.id,
    });

    return this.mapOfferToDto(updated);
  }

  async disableOffer(
    organizationId: string,
    offerIdentifier: string,
    userId?: string,
  ): Promise<OfferResponseDto> {
    const offer = await this.promoRepo.findOfferByIdOrPublicId(
      organizationId,
      offerIdentifier,
    );
    if (!offer) {
      throw new NotFoundException({
        code: PromotionErrorCode.OFFER_NOT_FOUND,
        message: `Offer '${offerIdentifier}' not found.`,
      });
    }

    const updated = await this.promoRepo.updateOffer(organizationId, offer.id, {
      status: OfferStatus.DISABLED as any,
    });

    await this.promoRepo.createAuditEvent({
      organizationId,
      userId,
      action: PromotionAuditEvent.OFFER_DISABLED,
      entityType: 'PromotionalOffer',
      entityId: updated.id,
    });

    return this.mapOfferToDto(updated);
  }

  async getOfferRedemptions(
    organizationId: string,
    offerIdentifier: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    items: OfferRedemptionResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const offer = await this.promoRepo.findOfferByIdOrPublicId(
      organizationId,
      offerIdentifier,
    );
    if (!offer) {
      throw new NotFoundException({
        code: PromotionErrorCode.OFFER_NOT_FOUND,
        message: `Offer '${offerIdentifier}' not found.`,
      });
    }

    const skip = (page - 1) * limit;
    const [redemptions, total] = await Promise.all([
      this.promoRepo.findOfferRedemptions(organizationId, offer.id, skip, limit),
      this.promoRepo.countOfferRedemptions(organizationId, offer.id),
    ]);

    const items: OfferRedemptionResponseDto[] = redemptions.map((r) => ({
      id: r.id,
      offerId: r.offerId,
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
  // Customer Offer Discovery, Validation & Redemption
  // --------------------------------------------------------------------------

  async getCustomerOffers(
    organizationId: string,
    customerUserId: string,
  ): Promise<OfferResponseDto[]> {
    const customer = await this.promoRepo.findCustomerByUserId(
      customerUserId,
      organizationId,
    );
    if (!customer) {
      throw new ForbiddenException({
        code: PromotionErrorCode.PROMOTION_ACCESS_DENIED,
        message: 'Customer profile required to view offers.',
      });
    }

    const now = new Date();
    const offers = await this.promoRepo.findOffers(
      organizationId,
      { status: OfferStatus.ACTIVE },
      0,
      100,
    );

    // Filter out expired offers
    const validOffers = offers.filter(
      (o) => new Date(o.validFrom) <= now && new Date(o.validUntil) >= now,
    );

    return validOffers.map((o) => this.mapOfferToDto(o));
  }

  async getCustomerOffer(
    organizationId: string,
    customerUserId: string,
    offerIdentifier: string,
  ): Promise<OfferResponseDto> {
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

    return this.getOffer(organizationId, offerIdentifier);
  }

  async validateCustomerOffer(
    organizationId: string,
    customerUserId: string,
    offerIdentifier: string,
    dto: ValidateOfferDto,
  ): Promise<ValidateOfferResponseDto> {
    // 1. Resolve Customer Profile
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

    // 2. Resolve Booking
    const booking = await this.promoRepo.findBooking(
      organizationId,
      dto.bookingId,
    );
    if (!booking) {
      throw new NotFoundException({
        code: PromotionErrorCode.OFFER_NOT_FOUND,
        message: `Booking '${dto.bookingId}' was not found.`,
      });
    }

    // 3. Customer Ownership Verification
    if (booking.customerId !== customer.id) {
      throw new ForbiddenException({
        code: PromotionErrorCode.PROMOTION_ACCESS_DENIED,
        message: 'You are not authorized to validate offers on another customer booking.',
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

    // 5. Resolve Offer
    const offer = await this.promoRepo.findOfferByIdOrPublicId(
      organizationId,
      offerIdentifier,
    );
    if (!offer) {
      throw new NotFoundException({
        code: PromotionErrorCode.OFFER_NOT_FOUND,
        message: `Promotional offer '${offerIdentifier}' was not found.`,
      });
    }

    // 6. Active & Status Check
    if (offer.status !== ('ACTIVE' as any)) {
      throw new BadRequestException({
        code: PromotionErrorCode.OFFER_INACTIVE,
        message: `Offer '${offer.title}' is currently inactive.`,
      });
    }

    // 7. Time Window Check
    const now = new Date();
    if (now < new Date(offer.validFrom)) {
      throw new BadRequestException({
        code: PromotionErrorCode.OFFER_NOT_STARTED,
        message: 'This promotional offer has not started yet.',
      });
    }
    if (now > new Date(offer.validUntil)) {
      throw new BadRequestException({
        code: PromotionErrorCode.OFFER_EXPIRED,
        message: 'This promotional offer has expired.',
      });
    }

    // 8. Eligibility Rules
    const offerType = (offer as any).offerType ?? OfferType.GENERAL;

    if (offerType === OfferType.FIRST_BOOKING) {
      const completedCount = await this.promoRepo.countCustomerCompletedBookings(
        organizationId,
        customer.id,
      );
      if (completedCount > 0) {
        throw new BadRequestException({
          code: PromotionErrorCode.OFFER_NOT_ELIGIBLE,
          message: 'First booking offer is only eligible for customers with zero prior completed bookings.',
        });
      }
    }

    if (offerType === OfferType.WELCOME) {
      const redeemedCount = await this.promoRepo.countCustomerOfferRedemptions(
        organizationId,
        offer.id,
        customer.id,
      );
      if (redeemedCount > 0) {
        throw new BadRequestException({
          code: PromotionErrorCode.OFFER_ALREADY_REDEEMED,
          message: 'You have already redeemed this welcome offer.',
        });
      }
    }

    // 9. Minimum Order Value Check
    const subtotal = new Prisma.Decimal(booking.subtotal);
    const minOrder = new Prisma.Decimal(offer.minOrderAmount);
    if (subtotal.lt(minOrder)) {
      throw new BadRequestException({
        code: PromotionErrorCode.COUPON_MINIMUM_ORDER_NOT_MET,
        message: `Booking subtotal (₹${subtotal.toFixed(
          2,
        )}) does not meet the minimum order requirement of ₹${minOrder.toFixed(2)}.`,
      });
    }

    // 10. Calculate Discount
    const discountAmount = this.calculator.calculatePromotionDiscount(
      subtotal,
      offer.discountType as DiscountType,
      new Prisma.Decimal(offer.discountValue),
      null,
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
      offer: {
        id: offer.id,
        publicId: offer.publicId,
        name: offer.title,
        offerType,
        discountType: offer.discountType as DiscountType,
        discountValue: new Prisma.Decimal(offer.discountValue).toFixed(2),
      },
      discountAmount: discountAmount.toFixed(2),
      finalAmount: pricing.finalAmount,
    };
  }

  async redeemCustomerOffer(
    organizationId: string,
    customerUserId: string,
    offerIdentifier: string,
    dto: RedeemOfferDto,
    idempotencyKey?: string,
  ): Promise<RedeemOfferResponseDto> {
    const scope = `${organizationId}:offer:redeem:${dto.bookingId}`;

    // 1. Idempotency Check
    if (idempotencyKey) {
      const cached = this.idempotencyService.check<RedeemOfferResponseDto>(
        scope,
        idempotencyKey,
        dto,
      );
      if (cached) return cached;
    }

    // 2. Validate Eligibility
    const validation = await this.validateCustomerOffer(
      organizationId,
      customerUserId,
      offerIdentifier,
      dto,
    );

    const customer = await this.promoRepo.findCustomerByUserId(
      customerUserId,
      organizationId,
    );
    const booking = await this.promoRepo.findBooking(organizationId, dto.bookingId);
    const offer = await this.promoRepo.findOfferByIdOrPublicId(
      organizationId,
      offerIdentifier,
    );

    if (!customer || !booking || !offer) {
      throw new NotFoundException({
        code: PromotionErrorCode.OFFER_NOT_FOUND,
        message: 'Could not resolve entities for offer redemption.',
      });
    }

    const discountDec = new Prisma.Decimal(validation.discountAmount);
    const newTotal = new Prisma.Decimal(validation.finalAmount);

    // 3. Concurrency-Safe Atomic Redemption
    const result = await this.promoRepo.atomicRedeemOffer({
      offerId: offer.id,
      customerId: customer.id,
      bookingId: booking.id,
      organizationId,
      discountAmount: discountDec,
      newBookingTotal: newTotal,
    });

    // 4. Audit Event
    await this.promoRepo.createAuditEvent({
      organizationId,
      userId: customerUserId,
      action: PromotionAuditEvent.OFFER_REDEEMED,
      entityType: 'OfferRedemption',
      entityId: result.redemption.id,
      metadataJson: {
        offerPublicId: offer.publicId,
        bookingId: booking.id,
        discountAmount: validation.discountAmount,
        finalAmount: validation.finalAmount,
      },
    });

    const response: RedeemOfferResponseDto = {
      valid: true,
      offer: validation.offer,
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
}
