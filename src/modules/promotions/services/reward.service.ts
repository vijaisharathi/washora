import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  RewardAccountQueryDto,
  RewardAccountResponseDto,
  RewardAdjustmentDto,
  RewardRedeemDto,
  RewardRedeemResponseDto,
  RewardReverseDto,
  RewardTransactionQueryDto,
  RewardTransactionResponseDto,
} from '../dto';
import { PromotionsRepository } from '../repositories/promotions.repository';
import {
  PromotionAuditEvent,
  PromotionErrorCode,
  RewardAccountStatus,
  RewardTransactionStatus,
  RewardTransactionType,
} from '../types/promotions.types';
import { IdempotencyService } from './idempotency.service';
import { PromotionCalculatorService } from './promotion-calculator.service';

@Injectable()
export class RewardService {
  constructor(
    private readonly promoRepo: PromotionsRepository,
    private readonly calculator: PromotionCalculatorService,
    private readonly idempotencyService: IdempotencyService,
  ) {}

  private mapAccountToDto(account: any): RewardAccountResponseDto {
    return {
      id: account.id,
      publicId: `REW-${new Date(account.createdAt).getFullYear()}-${account.id.substring(0, 6).toUpperCase()}`,
      organizationId: account.organizationId,
      customerId: account.customerId,
      customerPublicId: account.customer?.publicId,
      customerName: account.customer?.user?.fullName,
      pointsBalance: account.pointsBalance,
      lifetimeEarned: account.lifetimeEarned,
      lifetimeRedeemed: account.lifetimeRedeemed,
      status: RewardAccountStatus.ACTIVE,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }

  private mapTransactionToDto(tx: any): RewardTransactionResponseDto {
    return {
      id: tx.id,
      rewardAccountId: tx.rewardAccountId,
      customerId: tx.customerId,
      organizationId: tx.organizationId,
      bookingId: tx.bookingId,
      type: tx.type as RewardTransactionType,
      points: tx.points,
      balanceAfter: tx.balanceAfter,
      description: tx.description,
      status: tx.type === 'REFUNDED' ? RewardTransactionStatus.REVERSED : RewardTransactionStatus.COMPLETED,
      createdAt: tx.createdAt,
    };
  }

  // --------------------------------------------------------------------------
  // Customer Reward Account & Ledger Endpoints
  // --------------------------------------------------------------------------

  async getCustomerRewardAccount(
    organizationId: string,
    customerUserId: string,
  ): Promise<RewardAccountResponseDto> {
    const customer = await this.promoRepo.findCustomerByUserId(
      customerUserId,
      organizationId,
    );
    if (!customer) {
      throw new ForbiddenException({
        code: PromotionErrorCode.REWARD_ACCESS_DENIED,
        message: 'Customer profile required to view rewards.',
      });
    }

    const account = await this.promoRepo.findOrCreateRewardAccount(
      organizationId,
      customer.id,
    );

    return this.mapAccountToDto({ ...account, customer });
  }

  async getCustomerRewardTransactions(
    organizationId: string,
    customerUserId: string,
    query: RewardTransactionQueryDto,
  ): Promise<{
    items: RewardTransactionResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const customer = await this.promoRepo.findCustomerByUserId(
      customerUserId,
      organizationId,
    );
    if (!customer) {
      throw new ForbiddenException({
        code: PromotionErrorCode.REWARD_ACCESS_DENIED,
        message: 'Customer profile required.',
      });
    }

    const { skip, take, page, limit } = query;
    const filter = {
      customerId: customer.id,
      type: query.type,
      bookingId: query.bookingId,
      from: query.from,
      to: query.to,
    };

    const [transactions, total] = await Promise.all([
      this.promoRepo.findRewardTransactions(organizationId, filter, skip, take),
      this.promoRepo.countRewardTransactions(organizationId, filter),
    ]);

    const items = transactions.map((t) => this.mapTransactionToDto(t));
    const totalPages = Math.ceil(total / limit) || 1;

    return { items, total, page, limit, totalPages };
  }

  async getCustomerRewardTransaction(
    organizationId: string,
    customerUserId: string,
    transactionId: string,
  ): Promise<RewardTransactionResponseDto> {
    const customer = await this.promoRepo.findCustomerByUserId(
      customerUserId,
      organizationId,
    );
    if (!customer) {
      throw new ForbiddenException({
        code: PromotionErrorCode.REWARD_ACCESS_DENIED,
        message: 'Customer profile required.',
      });
    }

    const tx = await this.promoRepo.findRewardTransactionById(
      organizationId,
      transactionId,
    );
    if (!tx) {
      throw new NotFoundException({
        code: PromotionErrorCode.REWARD_TRANSACTION_NOT_FOUND,
        message: `Reward transaction '${transactionId}' was not found.`,
      });
    }

    if (tx.customerId !== customer.id) {
      throw new ForbiddenException({
        code: PromotionErrorCode.REWARD_ACCESS_DENIED,
        message: 'You cannot access another customer reward transaction.',
      });
    }

    return this.mapTransactionToDto(tx);
  }

  async redeemCustomerRewards(
    organizationId: string,
    customerUserId: string,
    dto: RewardRedeemDto,
    idempotencyKey?: string,
  ): Promise<RewardRedeemResponseDto> {
    const scope = `${organizationId}:reward:redeem:${dto.bookingId}`;

    // 1. Idempotency Check
    if (idempotencyKey) {
      const cached = this.idempotencyService.check<RewardRedeemResponseDto>(
        scope,
        idempotencyKey,
        dto,
      );
      if (cached) return cached;
    }

    // 2. Validate points parameter
    if (!Number.isInteger(dto.points) || dto.points <= 0) {
      throw new BadRequestException({
        code: PromotionErrorCode.INVALID_REWARD_AMOUNT,
        message: 'Points must be a positive whole integer.',
      });
    }

    // 3. Resolve Customer & Account
    const customer = await this.promoRepo.findCustomerByUserId(
      customerUserId,
      organizationId,
    );
    if (!customer) {
      throw new ForbiddenException({
        code: PromotionErrorCode.REWARD_ACCESS_DENIED,
        message: 'Customer profile required.',
      });
    }

    const account = await this.promoRepo.findOrCreateRewardAccount(
      organizationId,
      customer.id,
    );

    if (account.pointsBalance < dto.points) {
      throw new BadRequestException({
        code: PromotionErrorCode.INSUFFICIENT_REWARD_BALANCE,
        message: `Insufficient reward balance. Available: ${account.pointsBalance}, Requested: ${dto.points}.`,
      });
    }

    // 4. Resolve Booking & Verify Ownership
    const booking = await this.promoRepo.findBooking(
      organizationId,
      dto.bookingId,
    );
    if (!booking) {
      throw new NotFoundException({
        code: PromotionErrorCode.REWARD_NOT_ELIGIBLE,
        message: `Booking '${dto.bookingId}' was not found.`,
      });
    }

    if (booking.customerId !== customer.id) {
      throw new ForbiddenException({
        code: PromotionErrorCode.REWARD_ACCESS_DENIED,
        message: 'You are not authorized to redeem rewards on another customer booking.',
      });
    }

    if (booking.status === 'CANCELLED') {
      throw new BadRequestException({
        code: PromotionErrorCode.REWARD_NOT_ELIGIBLE,
        message: 'Cannot redeem rewards on a cancelled booking.',
      });
    }

    // 5. Calculate Server-Authoritative Reward Discount
    // 100 points = ₹10 => 10 points = ₹1 => discount = points / 10
    const rawDiscount = new Prisma.Decimal(dto.points).div(10);

    // Remaining payable amount on the booking before rewards
    const subtotal = new Prisma.Decimal(booking.subtotal);
    const serviceFee = new Prisma.Decimal(booking.serviceFee);
    const taxAmount = new Prisma.Decimal(booking.taxAmount);
    const promoDiscount = new Prisma.Decimal(booking.discountAmount || 0);

    const grossBeforeRewards = subtotal
      .add(serviceFee)
      .add(taxAmount)
      .sub(promoDiscount);

    if (grossBeforeRewards.lte(0)) {
      throw new BadRequestException({
        code: PromotionErrorCode.REWARD_NOT_ELIGIBLE,
        message: 'Booking payable amount is already zero.',
      });
    }

    // Bound reward discount so finalAmount cannot become negative
    let rewardDiscount = rawDiscount;
    if (rewardDiscount.gt(grossBeforeRewards)) {
      rewardDiscount = grossBeforeRewards;
    }

    const newBookingTotal = grossBeforeRewards.sub(rewardDiscount);

    // 6. Concurrency-Safe Atomic Redemption
    const result = await this.promoRepo.atomicRedeemRewards({
      rewardAccountId: account.id,
      customerId: customer.id,
      organizationId,
      bookingId: booking.id,
      pointsToRedeem: dto.points,
      discountInCurrency: rewardDiscount,
      newBookingTotal,
    });

    // 7. Audit Event
    await this.promoRepo.createAuditEvent({
      organizationId,
      userId: customerUserId,
      action: PromotionAuditEvent.REWARD_REDEEMED,
      entityType: 'CustomerRewardTransaction',
      entityId: result.transaction.id,
      metadataJson: {
        pointsRedeemed: dto.points,
        rewardDiscount: rewardDiscount.toFixed(2),
        finalBookingAmount: newBookingTotal.toFixed(2),
      },
    });

    const response: RewardRedeemResponseDto = {
      bookingId: booking.id,
      pointsRedeemed: dto.points,
      rewardDiscount: rewardDiscount.toFixed(2),
      remainingPointsBalance: result.updatedAccount.pointsBalance,
      finalBookingAmount: newBookingTotal.toFixed(2),
      transactionId: result.transaction.id,
    };

    // 8. Save Idempotency
    if (idempotencyKey) {
      this.idempotencyService.save(scope, idempotencyKey, dto, response);
    }

    return response;
  }

  // --------------------------------------------------------------------------
  // Operations Reward Management Endpoints
  // --------------------------------------------------------------------------

  async getOperationsRewardAccounts(
    organizationId: string,
    query: RewardAccountQueryDto,
  ): Promise<{
    items: RewardAccountResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { skip, take, page, limit } = query;
    const [accounts, total] = await Promise.all([
      this.promoRepo.findRewardAccounts(organizationId, query, skip, take),
      this.promoRepo.countRewardAccounts(organizationId, query),
    ]);

    const items = accounts.map((a) => this.mapAccountToDto(a));
    const totalPages = Math.ceil(total / limit) || 1;

    return { items, total, page, limit, totalPages };
  }

  async getOperationsRewardAccount(
    organizationId: string,
    accountId: string,
  ): Promise<RewardAccountResponseDto> {
    const account = await this.promoRepo.findRewardAccountById(
      organizationId,
      accountId,
    );
    if (!account) {
      throw new NotFoundException({
        code: PromotionErrorCode.REWARD_ACCOUNT_NOT_FOUND,
        message: `Reward account '${accountId}' was not found.`,
      });
    }
    return this.mapAccountToDto(account);
  }

  async getOperationsRewardTransactions(
    organizationId: string,
    query: RewardTransactionQueryDto,
  ): Promise<{
    items: RewardTransactionResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { skip, take, page, limit } = query;
    const [transactions, total] = await Promise.all([
      this.promoRepo.findRewardTransactions(organizationId, query, skip, take),
      this.promoRepo.countRewardTransactions(organizationId, query),
    ]);

    const items = transactions.map((t) => this.mapTransactionToDto(t));
    const totalPages = Math.ceil(total / limit) || 1;

    return { items, total, page, limit, totalPages };
  }

  async adjustRewardAccount(
    organizationId: string,
    accountId: string,
    dto: RewardAdjustmentDto,
    userId?: string,
  ): Promise<{
    account: RewardAccountResponseDto;
    transaction: RewardTransactionResponseDto;
  }> {
    if (!Number.isInteger(dto.points) || dto.points === 0) {
      throw new BadRequestException({
        code: PromotionErrorCode.INVALID_REWARD_AMOUNT,
        message: 'Adjustment points must be a non-zero integer.',
      });
    }

    if (!dto.reason || !dto.reason.trim()) {
      throw new BadRequestException({
        code: PromotionErrorCode.INVALID_REWARD_AMOUNT,
        message: 'An explicit operational reason is required for points adjustment.',
      });
    }

    const { updatedAccount, transaction } =
      await this.promoRepo.atomicAdjustRewards({
        rewardAccountId: accountId,
        organizationId,
        points: dto.points,
        reason: dto.reason.trim(),
      });

    await this.promoRepo.createAuditEvent({
      organizationId,
      userId,
      action: PromotionAuditEvent.REWARD_ADJUSTED,
      entityType: 'CustomerRewardTransaction',
      entityId: transaction.id,
      metadataJson: {
        points: dto.points,
        reason: dto.reason,
        balanceAfter: updatedAccount.pointsBalance,
      },
    });

    return {
      account: this.mapAccountToDto(updatedAccount),
      transaction: this.mapTransactionToDto(transaction),
    };
  }

  async reverseRewardTransaction(
    organizationId: string,
    transactionId: string,
    dto: RewardReverseDto,
    userId?: string,
  ): Promise<{
    account: RewardAccountResponseDto;
    reversalTransaction: RewardTransactionResponseDto;
  }> {
    if (!dto.reason || !dto.reason.trim()) {
      throw new BadRequestException({
        code: PromotionErrorCode.INVALID_REWARD_AMOUNT,
        message: 'An explicit operational reason is required for reversal.',
      });
    }

    const { updatedAccount, reversalTx } =
      await this.promoRepo.atomicReverseRewardTransaction({
        transactionId,
        organizationId,
        reason: dto.reason.trim(),
      });

    await this.promoRepo.createAuditEvent({
      organizationId,
      userId,
      action: PromotionAuditEvent.REWARD_REVERSED,
      entityType: 'CustomerRewardTransaction',
      entityId: reversalTx.id,
      metadataJson: {
        originalTxId: transactionId,
        reason: dto.reason,
        reversalPoints: reversalTx.points,
      },
    });

    return {
      account: this.mapAccountToDto(updatedAccount),
      reversalTransaction: this.mapTransactionToDto(reversalTx),
    };
  }

  // --------------------------------------------------------------------------
  // Server-Authoritative Reward Earning Service Contract
  // --------------------------------------------------------------------------

  /**
   * Awards reward points to a customer upon eligible completed booking:
   * Rule: 1 reward point per ₹100 of eligible completed booking value, rounded down.
   */
  async awardRewards(params: {
    organizationId: string;
    customerId: string;
    bookingId: string;
    eligibleBookingValue: Prisma.Decimal;
  }): Promise<{
    pointsAwarded: number;
    newBalance: number;
    transactionId: string;
  }> {
    // 1. Calculate whole points: Math.floor(value / 100)
    const pointsToAward = Math.floor(
      params.eligibleBookingValue.toNumber() / 100,
    );

    if (pointsToAward <= 0) {
      return { pointsAwarded: 0, newBalance: 0, transactionId: '' };
    }

    const description = `Earned ${pointsToAward} points on completed booking #${params.bookingId}`;

    const { updatedAccount, transaction } =
      await this.promoRepo.atomicAwardRewards({
        organizationId: params.organizationId,
        customerId: params.customerId,
        bookingId: params.bookingId,
        pointsToAward,
        description,
      });

    await this.promoRepo.createAuditEvent({
      organizationId: params.organizationId,
      action: PromotionAuditEvent.REWARD_EARNED,
      entityType: 'CustomerRewardTransaction',
      entityId: transaction.id,
      metadataJson: {
        pointsAwarded: pointsToAward,
        bookingId: params.bookingId,
        newBalance: updatedAccount.pointsBalance,
      },
    });

    return {
      pointsAwarded: pointsToAward,
      newBalance: updatedAccount.pointsBalance,
      transactionId: transaction.id,
    };
  }
}
