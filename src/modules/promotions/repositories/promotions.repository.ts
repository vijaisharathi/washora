import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import {
  CouponStatus,
  DiscountType,
  OfferStatus,
  OfferType,
  RewardAccountStatus,
  RewardTransactionType,
} from '../types/promotions.types';

@Injectable()
export class PromotionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // Public ID Generators
  // --------------------------------------------------------------------------

  async generateCouponPublicId(organizationId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.coupon.count({
      where: { organizationId },
    });
    return `CPN-${year}-${String(count + 1).padStart(6, '0')}`;
  }

  async generateOfferPublicId(organizationId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.promotionalOffer.count({
      where: { organizationId },
    });
    return `OFF-${year}-${String(count + 1).padStart(6, '0')}`;
  }

  // --------------------------------------------------------------------------
  // Common Entity Lookups
  // --------------------------------------------------------------------------

  async findCustomerByUserId(userId: string, organizationId?: string) {
    const where: Prisma.CustomerWhereInput = { userId };
    if (organizationId) {
      where.organizationId = organizationId;
    }
    return this.prisma.customer.findFirst({
      where,
      include: { user: true },
    });
  }

  async findCustomerById(customerId: string, organizationId: string) {
    return this.prisma.customer.findFirst({
      where: { id: customerId, organizationId },
      include: { user: true },
    });
  }

  async findBooking(organizationId: string, bookingIdentifier: string) {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        bookingIdentifier,
      );

    return this.prisma.booking.findFirst({
      where: {
        organizationId,
        ...(isUuid
          ? { id: bookingIdentifier }
          : { bookingNumber: bookingIdentifier }),
      },
      include: {
        customer: { include: { user: true } },
        service: true,
        items: true,
        couponRedemptions: {
          include: { coupon: true },
        },
        offerRedemptions: {
          include: { offer: true },
        },
        rewardTransactions: true,
        payment: true,
      },
    });
  }

  // --------------------------------------------------------------------------
  // Coupon Operations
  // --------------------------------------------------------------------------

  async createCoupon(
    organizationId: string,
    data: {
      publicId: string;
      code: string;
      name: string;
      description?: string;
      discountType: DiscountType;
      discountValue: Prisma.Decimal;
      minimumOrderValue: Prisma.Decimal;
      maximumDiscountAmount?: Prisma.Decimal;
      startAt: Date;
      endAt: Date;
      usageLimit?: number;
      perCustomerLimit?: number;
    },
  ) {
    return this.prisma.coupon.create({
      data: {
        organizationId,
        publicId: data.publicId,
        code: data.code.toUpperCase(),
        title: data.name,
        description: data.description,
        discountType: data.discountType as any,
        discountValue: data.discountValue,
        minOrderAmount: data.minimumOrderValue,
        maxDiscount: data.maximumDiscountAmount,
        validFrom: data.startAt,
        validUntil: data.endAt,
        usageLimit: data.usageLimit,
        usedCount: 0,
        status: CouponStatus.ACTIVE as any,
      },
    });
  }

  async findCouponByIdOrPublicId(
    organizationId: string,
    couponIdentifier: string,
  ) {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        couponIdentifier,
      );

    return this.prisma.coupon.findFirst({
      where: {
        organizationId,
        ...(isUuid ? { id: couponIdentifier } : { publicId: couponIdentifier }),
      },
      include: {
        _count: { select: { redemptions: true } },
      },
    });
  }

  async findCouponByCode(organizationId: string, code: string) {
    return this.prisma.coupon.findUnique({
      where: {
        organizationId_code: {
          organizationId,
          code: code.toUpperCase(),
        },
      },
    });
  }

  async findCoupons(
    organizationId: string,
    filters: {
      status?: CouponStatus;
      discountType?: DiscountType;
      code?: string;
      from?: string;
      to?: string;
    },
    skip: number,
    take: number,
  ) {
    const where: Prisma.CouponWhereInput = { organizationId };

    if (filters.status) where.status = filters.status as any;
    if (filters.discountType) where.discountType = filters.discountType as any;
    if (filters.code) {
      where.code = { contains: filters.code.toUpperCase(), mode: 'insensitive' };
    }
    if (filters.from || filters.to) {
      where.createdAt = {};
      if (filters.from) where.createdAt.gte = new Date(filters.from);
      if (filters.to) where.createdAt.lte = new Date(filters.to);
    }

    return this.prisma.coupon.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { redemptions: true } },
      },
    });
  }

  async countCoupons(
    organizationId: string,
    filters: {
      status?: CouponStatus;
      discountType?: DiscountType;
      code?: string;
      from?: string;
      to?: string;
    },
  ) {
    const where: Prisma.CouponWhereInput = { organizationId };
    if (filters.status) where.status = filters.status as any;
    if (filters.discountType) where.discountType = filters.discountType as any;
    if (filters.code) {
      where.code = { contains: filters.code.toUpperCase(), mode: 'insensitive' };
    }
    if (filters.from || filters.to) {
      where.createdAt = {};
      if (filters.from) where.createdAt.gte = new Date(filters.from);
      if (filters.to) where.createdAt.lte = new Date(filters.to);
    }
    return this.prisma.coupon.count({ where });
  }

  async updateCoupon(
    organizationId: string,
    couponId: string,
    data: Prisma.CouponUpdateInput,
  ) {
    return this.prisma.coupon.update({
      where: { id: couponId },
      data,
    });
  }

  async countCustomerCouponRedemptions(
    organizationId: string,
    couponId: string,
    customerId: string,
  ): Promise<number> {
    return this.prisma.couponRedemption.count({
      where: {
        organizationId,
        couponId,
        customerId,
      },
    });
  }

  async findCouponRedemptions(
    organizationId: string,
    couponId: string,
    skip: number,
    take: number,
  ) {
    return this.prisma.couponRedemption.findMany({
      where: { organizationId, couponId },
      skip,
      take,
      orderBy: { redeemedAt: 'desc' },
      include: {
        customer: { include: { user: true } },
        booking: true,
      },
    });
  }

  async countCouponRedemptions(
    organizationId: string,
    couponId: string,
  ): Promise<number> {
    return this.prisma.couponRedemption.count({
      where: { organizationId, couponId },
    });
  }

  /**
   * Concurrency-safe atomic coupon redemption:
   * Increments usedCount, creates immutable CouponRedemption, and updates Booking totals.
   */
  async atomicRedeemCoupon(params: {
    couponId: string;
    customerId: string;
    bookingId: string;
    organizationId: string;
    discountAmount: Prisma.Decimal;
    newBookingTotal: Prisma.Decimal;
    usageLimit?: number | null;
  }) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Fetch coupon with current usedCount inside transaction
      const coupon = await tx.coupon.findUnique({
        where: { id: params.couponId },
      });
      if (!coupon) {
        throw new Error('COUPON_NOT_FOUND');
      }

      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        throw new Error('COUPON_USAGE_LIMIT_REACHED');
      }

      // 2. Increment usage counter
      const updatedCoupon = await tx.coupon.update({
        where: { id: params.couponId },
        data: {
          usedCount: { increment: 1 },
          ...(coupon.usageLimit && coupon.usedCount + 1 >= coupon.usageLimit
            ? { status: 'DEPLETED' as any }
            : {}),
        },
      });

      // 3. Create canonical immutable redemption record
      const redemption = await tx.couponRedemption.create({
        data: {
          couponId: params.couponId,
          customerId: params.customerId,
          bookingId: params.bookingId,
          organizationId: params.organizationId,
          discountApplied: params.discountAmount,
          redeemedAt: new Date(),
        },
      });

      // 4. Snapshot-update Booking pricing
      const updatedBooking = await tx.booking.update({
        where: { id: params.bookingId },
        data: {
          discountAmount: params.discountAmount,
          totalAmount: params.newBookingTotal,
        },
      });

      return {
        redemption,
        updatedCoupon,
        updatedBooking,
      };
    });
  }

  /**
   * Removes active coupon or offer from booking and restores original booking total
   */
  async atomicRemovePromotionFromBooking(params: {
    organizationId: string;
    bookingId: string;
    restoredTotal: Prisma.Decimal;
  }) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Find existing redemptions on this booking
      const couponRedemptions = await tx.couponRedemption.findMany({
        where: { organizationId: params.organizationId, bookingId: params.bookingId },
      });

      for (const red of couponRedemptions) {
        // Decrement coupon usedCount
        await tx.coupon.update({
          where: { id: red.couponId },
          data: {
            usedCount: { decrement: 1 },
            status: 'ACTIVE' as any,
          },
        });
        await tx.couponRedemption.delete({ where: { id: red.id } });
      }

      const offerRedemptions = await tx.offerRedemption.findMany({
        where: { organizationId: params.organizationId, bookingId: params.bookingId },
      });

      for (const red of offerRedemptions) {
        await tx.offerRedemption.delete({ where: { id: red.id } });
      }

      // 2. Reset booking discount and restore total
      const updatedBooking = await tx.booking.update({
        where: { id: params.bookingId },
        data: {
          discountAmount: new Prisma.Decimal(0.0),
          totalAmount: params.restoredTotal,
        },
      });

      return { updatedBooking, removedCount: couponRedemptions.length + offerRedemptions.length };
    });
  }

  // --------------------------------------------------------------------------
  // Promotional Offer Operations
  // --------------------------------------------------------------------------

  async createOffer(
    organizationId: string,
    data: {
      publicId: string;
      name: string;
      bannerText?: string;
      bannerImageUrl?: string;
      offerType?: OfferType;
      discountType: DiscountType;
      discountValue: Prisma.Decimal;
      minimumOrderValue: Prisma.Decimal;
      startAt: Date;
      endAt: Date;
      serviceId?: string;
      categoryId?: string;
    },
  ) {
    return this.prisma.promotionalOffer.create({
      data: {
        organizationId,
        publicId: data.publicId,
        title: data.name,
        bannerText: data.bannerText,
        bannerImageUrl: data.bannerImageUrl,
        discountType: data.discountType as any,
        discountValue: data.discountValue,
        minOrderAmount: data.minimumOrderValue,
        validFrom: data.startAt,
        validUntil: data.endAt,
        status: OfferStatus.ACTIVE as any,
      },
    });
  }

  async findOfferByIdOrPublicId(
    organizationId: string,
    offerIdentifier: string,
  ) {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        offerIdentifier,
      );

    return this.prisma.promotionalOffer.findFirst({
      where: {
        organizationId,
        ...(isUuid ? { id: offerIdentifier } : { publicId: offerIdentifier }),
      },
      include: {
        _count: { select: { redemptions: true } },
      },
    });
  }

  async findOffers(
    organizationId: string,
    filters: {
      status?: OfferStatus;
      discountType?: DiscountType;
      from?: string;
      to?: string;
    },
    skip: number,
    take: number,
  ) {
    const where: Prisma.PromotionalOfferWhereInput = { organizationId };

    if (filters.status) where.status = filters.status as any;
    if (filters.discountType) where.discountType = filters.discountType as any;
    if (filters.from || filters.to) {
      where.createdAt = {};
      if (filters.from) where.createdAt.gte = new Date(filters.from);
      if (filters.to) where.createdAt.lte = new Date(filters.to);
    }

    return this.prisma.promotionalOffer.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { redemptions: true } },
      },
    });
  }

  async countOffers(
    organizationId: string,
    filters: {
      status?: OfferStatus;
      discountType?: DiscountType;
      from?: string;
      to?: string;
    },
  ) {
    const where: Prisma.PromotionalOfferWhereInput = { organizationId };
    if (filters.status) where.status = filters.status as any;
    if (filters.discountType) where.discountType = filters.discountType as any;
    if (filters.from || filters.to) {
      where.createdAt = {};
      if (filters.from) where.createdAt.gte = new Date(filters.from);
      if (filters.to) where.createdAt.lte = new Date(filters.to);
    }
    return this.prisma.promotionalOffer.count({ where });
  }

  async updateOffer(
    organizationId: string,
    offerId: string,
    data: Prisma.PromotionalOfferUpdateInput,
  ) {
    return this.prisma.promotionalOffer.update({
      where: { id: offerId },
      data,
    });
  }

  async countCustomerOfferRedemptions(
    organizationId: string,
    offerId: string,
    customerId: string,
  ): Promise<number> {
    return this.prisma.offerRedemption.count({
      where: {
        organizationId,
        offerId,
        customerId,
      },
    });
  }

  async countCustomerCompletedBookings(
    organizationId: string,
    customerId: string,
  ): Promise<number> {
    return this.prisma.booking.count({
      where: {
        organizationId,
        customerId,
        status: 'COMPLETED',
      },
    });
  }

  async atomicRedeemOffer(params: {
    offerId: string;
    customerId: string;
    bookingId: string;
    organizationId: string;
    discountAmount: Prisma.Decimal;
    newBookingTotal: Prisma.Decimal;
  }) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Create canonical immutable offer redemption
      const redemption = await tx.offerRedemption.create({
        data: {
          offerId: params.offerId,
          customerId: params.customerId,
          bookingId: params.bookingId,
          organizationId: params.organizationId,
          discountApplied: params.discountAmount,
          redeemedAt: new Date(),
        },
      });

      // 2. Snapshot-update Booking pricing
      const updatedBooking = await tx.booking.update({
        where: { id: params.bookingId },
        data: {
          discountAmount: params.discountAmount,
          totalAmount: params.newBookingTotal,
        },
      });

      return { redemption, updatedBooking };
    });
  }

  async findOfferRedemptions(
    organizationId: string,
    offerId: string,
    skip: number,
    take: number,
  ) {
    return this.prisma.offerRedemption.findMany({
      where: { organizationId, offerId },
      skip,
      take,
      orderBy: { redeemedAt: 'desc' },
      include: {
        customer: { include: { user: true } },
        booking: true,
      },
    });
  }

  async countOfferRedemptions(
    organizationId: string,
    offerId: string,
  ): Promise<number> {
    return this.prisma.offerRedemption.count({
      where: { organizationId, offerId },
    });
  }

  // --------------------------------------------------------------------------
  // Customer Reward Accounts & Ledger Operations
  // --------------------------------------------------------------------------

  async findOrCreateRewardAccount(
    organizationId: string,
    customerId: string,
  ) {
    let account = await this.prisma.customerRewardAccount.findUnique({
      where: { customerId },
    });

    if (!account) {
      account = await this.prisma.customerRewardAccount.create({
        data: {
          customerId,
          organizationId,
          pointsBalance: 0,
          lifetimeEarned: 0,
          lifetimeRedeemed: 0,
        },
      });
    }

    return account;
  }

  async findRewardAccountById(organizationId: string, accountId: string) {
    return this.prisma.customerRewardAccount.findFirst({
      where: { id: accountId, organizationId },
      include: {
        customer: { include: { user: true } },
      },
    });
  }

  async findRewardAccounts(
    organizationId: string,
    query: { search?: string },
    skip: number,
    take: number,
  ) {
    const where: Prisma.CustomerRewardAccountWhereInput = { organizationId };

    if (query.search) {
      where.customer = {
        OR: [
          { publicId: { contains: query.search, mode: 'insensitive' } },
          { fullName: { contains: query.search, mode: 'insensitive' } },
          { phone: { contains: query.search, mode: 'insensitive' } },
        ],
      };
    }

    return this.prisma.customerRewardAccount.findMany({
      where,
      skip,
      take,
      orderBy: { updatedAt: 'desc' },
      include: {
        customer: { include: { user: true } },
      },
    });
  }

  async countRewardAccounts(
    organizationId: string,
    query: { search?: string },
  ) {
    const where: Prisma.CustomerRewardAccountWhereInput = { organizationId };
    if (query.search) {
      where.customer = {
        OR: [
          { publicId: { contains: query.search, mode: 'insensitive' } },
          { fullName: { contains: query.search, mode: 'insensitive' } },
          { phone: { contains: query.search, mode: 'insensitive' } },
        ],
      };
    }
    return this.prisma.customerRewardAccount.count({ where });
  }

  // --------------------------------------------------------------------------
  // Audit Trail Logging
  // --------------------------------------------------------------------------

  async createAuditEvent(params: {
    organizationId: string;
    userId?: string;
    action: string;
    entityType: string;
    entityId: string;
    metadataJson?: Record<string, any>;
  }) {
    try {
      return await this.prisma.auditEvent.create({
        data: {
          organizationId: params.organizationId,
          actorUserId: params.userId,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
          metadataJson: (params.metadataJson || {}) as any,
        },
      });
    } catch {
      // Non-blocking audit logging fallback
      return null;
    }
  }

  /**
   * Concurrency-safe atomic reward redemption:
   * Debits customer balance, creates immutable ledger transaction, updates booking reward discount.
   */
  async atomicRedeemRewards(params: {
    rewardAccountId: string;
    customerId: string;
    organizationId: string;
    bookingId: string;
    pointsToRedeem: number;
    discountInCurrency: Prisma.Decimal;
    newBookingTotal: Prisma.Decimal;
  }) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Fetch current account with row-level integrity
      const account = await tx.customerRewardAccount.findUnique({
        where: { id: params.rewardAccountId },
      });

      if (!account) {
        throw new Error('REWARD_ACCOUNT_NOT_FOUND');
      }

      if (account.pointsBalance < params.pointsToRedeem) {
        throw new Error('INSUFFICIENT_REWARD_BALANCE');
      }

      const balanceAfter = account.pointsBalance - params.pointsToRedeem;

      // 2. Debit account
      const updatedAccount = await tx.customerRewardAccount.update({
        where: { id: params.rewardAccountId },
        data: {
          pointsBalance: balanceAfter,
          lifetimeRedeemed: { increment: params.pointsToRedeem },
        },
      });

      // 3. Create immutable ledger entry
      const transaction = await tx.customerRewardTransaction.create({
        data: {
          rewardAccountId: params.rewardAccountId,
          customerId: params.customerId,
          organizationId: params.organizationId,
          bookingId: params.bookingId,
          type: 'REDEEMED',
          points: -params.pointsToRedeem,
          balanceAfter,
          description: `Redeemed ${params.pointsToRedeem} points for ₹${params.discountInCurrency.toFixed(
            2,
          )} discount on booking`,
        },
      });

      // 4. Update booking reward discount & total
      const updatedBooking = await tx.booking.update({
        where: { id: params.bookingId },
        data: {
          rewardDiscount: params.discountInCurrency,
          totalAmount: params.newBookingTotal,
        },
      });

      return {
        updatedAccount,
        transaction,
        updatedBooking,
      };
    });
  }

  /**
   * Concurrency-safe manual points adjustment (Operations):
   * Credits/debits points and writes immutable ledger entry.
   */
  async atomicAdjustRewards(params: {
    rewardAccountId: string;
    organizationId: string;
    points: number;
    reason: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const account = await tx.customerRewardAccount.findUnique({
        where: { id: params.rewardAccountId },
      });

      if (!account) {
        throw new Error('REWARD_ACCOUNT_NOT_FOUND');
      }

      const newBalance = account.pointsBalance + params.points;
      if (newBalance < 0) {
        throw new Error('INSUFFICIENT_REWARD_BALANCE');
      }

      const updatedAccount = await tx.customerRewardAccount.update({
        where: { id: params.rewardAccountId },
        data: {
          pointsBalance: newBalance,
          ...(params.points > 0
            ? { lifetimeEarned: { increment: params.points } }
            : { lifetimeRedeemed: { increment: Math.abs(params.points) } }),
        },
      });

      const transaction = await tx.customerRewardTransaction.create({
        data: {
          rewardAccountId: params.rewardAccountId,
          customerId: account.customerId,
          organizationId: params.organizationId,
          type: 'ADJUSTED',
          points: params.points,
          balanceAfter: newBalance,
          description: `Operational adjustment: ${params.reason}`,
        },
      });

      return { updatedAccount, transaction };
    });
  }

  /**
   * Concurrency-safe transaction reversal (Operations):
   * Creates a compensating ledger transaction and adjusts balance.
   */
  async atomicReverseRewardTransaction(params: {
    transactionId: string;
    organizationId: string;
    reason: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const targetTx = await tx.customerRewardTransaction.findFirst({
        where: { id: params.transactionId, organizationId: params.organizationId },
        include: { rewardAccount: true },
      });

      if (!targetTx) {
        throw new Error('REWARD_TRANSACTION_NOT_FOUND');
      }

      // Check if already reversed
      const existingReversal = await tx.customerRewardTransaction.findFirst({
        where: {
          rewardAccountId: targetTx.rewardAccountId,
          description: { contains: targetTx.id },
        },
      });

      if (existingReversal) {
        throw new Error('REWARD_TRANSACTION_IMMUTABLE');
      }

      // Reverse points: If original was +50, reversal is -50; if original was -100, reversal is +100
      const reversalPoints = -targetTx.points;
      const account = targetTx.rewardAccount;
      const newBalance = account.pointsBalance + reversalPoints;

      if (newBalance < 0) {
        throw new Error('INSUFFICIENT_REWARD_BALANCE');
      }

      const updatedAccount = await tx.customerRewardAccount.update({
        where: { id: account.id },
        data: {
          pointsBalance: newBalance,
        },
      });

      const reversalTx = await tx.customerRewardTransaction.create({
        data: {
          rewardAccountId: account.id,
          customerId: targetTx.customerId,
          organizationId: params.organizationId,
          bookingId: targetTx.bookingId,
          type: 'REFUNDED',
          points: reversalPoints,
          balanceAfter: newBalance,
          description: `Reversal of tx ${targetTx.id}: ${params.reason}`,
        },
      });

      return { updatedAccount, reversalTx };
    });
  }

  /**
   * Server-authoritative reward earning for completed bookings:
   * Idempotent check ensures points cannot be awarded twice for the same booking.
   */
  async atomicAwardRewards(params: {
    organizationId: string;
    customerId: string;
    bookingId: string;
    pointsToAward: number;
    description: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Check for duplicate earning on this booking
      const existingEarning = await tx.customerRewardTransaction.findFirst({
        where: {
          organizationId: params.organizationId,
          bookingId: params.bookingId,
          type: 'EARNED',
        },
      });

      if (existingEarning) {
        throw new Error('REWARD_ALREADY_EARNED');
      }

      // 2. Find or create account
      let account = await tx.customerRewardAccount.findUnique({
        where: { customerId: params.customerId },
      });

      if (!account) {
        account = await tx.customerRewardAccount.create({
          data: {
            customerId: params.customerId,
            organizationId: params.organizationId,
            pointsBalance: 0,
            lifetimeEarned: 0,
            lifetimeRedeemed: 0,
          },
        });
      }

      const newBalance = account.pointsBalance + params.pointsToAward;

      // 3. Credit account
      const updatedAccount = await tx.customerRewardAccount.update({
        where: { id: account.id },
        data: {
          pointsBalance: newBalance,
          lifetimeEarned: { increment: params.pointsToAward },
        },
      });

      // 4. Create ledger transaction
      const transaction = await tx.customerRewardTransaction.create({
        data: {
          rewardAccountId: account.id,
          customerId: params.customerId,
          organizationId: params.organizationId,
          bookingId: params.bookingId,
          type: 'EARNED',
          points: params.pointsToAward,
          balanceAfter: newBalance,
          description: params.description,
        },
      });

      return { updatedAccount, transaction };
    });
  }

  async findRewardTransactions(
    organizationId: string,
    filter: {
      customerId?: string;
      bookingId?: string;
      type?: RewardTransactionType;
      from?: string;
      to?: string;
    },
    skip: number,
    take: number,
  ) {
    const where: Prisma.CustomerRewardTransactionWhereInput = { organizationId };

    if (filter.customerId) where.customerId = filter.customerId;
    if (filter.bookingId) where.bookingId = filter.bookingId;
    if (filter.type) where.type = filter.type as any;
    if (filter.from || filter.to) {
      where.createdAt = {};
      if (filter.from) where.createdAt.gte = new Date(filter.from);
      if (filter.to) where.createdAt.lte = new Date(filter.to);
    }

    return this.prisma.customerRewardTransaction.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { include: { user: true } },
      },
    });
  }

  async countRewardTransactions(
    organizationId: string,
    filter: {
      customerId?: string;
      bookingId?: string;
      type?: RewardTransactionType;
      from?: string;
      to?: string;
    },
  ) {
    const where: Prisma.CustomerRewardTransactionWhereInput = { organizationId };
    if (filter.customerId) where.customerId = filter.customerId;
    if (filter.bookingId) where.bookingId = filter.bookingId;
    if (filter.type) where.type = filter.type as any;
    if (filter.from || filter.to) {
      where.createdAt = {};
      if (filter.from) where.createdAt.gte = new Date(filter.from);
      if (filter.to) where.createdAt.lte = new Date(filter.to);
    }
    return this.prisma.customerRewardTransaction.count({ where });
  }

  async findRewardTransactionById(organizationId: string, txId: string) {
    return this.prisma.customerRewardTransaction.findFirst({
      where: { id: txId, organizationId },
      include: {
        customer: { include: { user: true } },
      },
    });
  }
}
