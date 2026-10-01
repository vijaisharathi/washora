import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentStatus, Prisma, Refund, RefundStatus } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import {
  CreateRefundDto,
  ProcessRefundDto,
  RefundListQueryDto,
  RefundResponseDto,
} from '../dto';
import { FinancialRepository } from '../repositories/financial.repository';
import {
  ALLOWED_REFUND_TRANSITIONS,
  FinancialErrorCode,
  isValidTransition,
} from '../types/financial.types';
import { IdempotencyService } from './idempotency.service';

@Injectable()
export class RefundService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly financialRepo: FinancialRepository,
    private readonly idempotencyService: IdempotencyService,
  ) {}

  mapToResponseDto(refund: Refund): RefundResponseDto {
    return {
      id: refund.id,
      publicId: refund.publicId,
      organizationId: refund.organizationId,
      bookingId: refund.bookingId,
      paymentId: refund.paymentId,
      transactionId: refund.transactionId,
      amount: refund.amount.toFixed(2),
      currency: refund.currency,
      status: refund.status,
      reason: refund.reason,
      gatewayRefundRef: refund.gatewayRefundRef,
      processedByUserId: refund.processedByUserId,
      processedAt: refund.processedAt,
      createdAt: refund.createdAt,
      updatedAt: refund.updatedAt,
    };
  }

  /**
   * Operations creates refund on a payment with strict balance validation & concurrency safety
   */
  async createRefund(
    paymentIdentifier: string,
    dto: CreateRefundDto,
    organizationId: string,
    operatorUserId: string,
    idempotencyKey?: string,
  ): Promise<RefundResponseDto> {
    const scope = `${organizationId}:refund:create:${paymentIdentifier}`;

    if (idempotencyKey) {
      const cached = this.idempotencyService.check<RefundResponseDto>(
        scope,
        idempotencyKey,
        dto,
      );
      if (cached) return cached;
    }

    const payment = await this.financialRepo.findPaymentByIdentifier(
      organizationId,
      paymentIdentifier,
    );
    if (!payment) {
      throw new NotFoundException({
        code: FinancialErrorCode.PAYMENT_NOT_FOUND,
        message: `Payment '${paymentIdentifier}' was not found.`,
      });
    }

    // Verify payment is refundable
    if (
      payment.status !== PaymentStatus.PAID &&
      payment.status !== PaymentStatus.PARTIALLY_REFUNDED
    ) {
      throw new BadRequestException({
        code: FinancialErrorCode.REFUND_NOT_ALLOWED,
        message: `Cannot refund payment in status '${payment.status}'. Only PAID or PARTIALLY_REFUNDED payments are refundable.`,
      });
    }

    const refundAmount = new Prisma.Decimal(dto.amount);
    if (refundAmount.lte(0)) {
      throw new BadRequestException({
        code: FinancialErrorCode.REFUND_AMOUNT_INVALID,
        message: 'Refund amount must be greater than zero.',
      });
    }

    // Check existing refunds to calculate remaining refundable amount
    const existingRefunds = await this.prisma.refund.findMany({
      where: {
        organizationId,
        paymentId: payment.id,
        status: { in: [RefundStatus.PROCESSED, RefundStatus.APPROVED, RefundStatus.PENDING] },
      },
      select: { amount: true },
    });

    let totalRefunded = new Prisma.Decimal(0);
    for (const r of existingRefunds) {
      totalRefunded = totalRefunded.add(r.amount);
    }

    const remainingRefundable = payment.amount.sub(totalRefunded);
    if (refundAmount.gt(remainingRefundable)) {
      throw new BadRequestException({
        code: FinancialErrorCode.REFUND_AMOUNT_EXCEEDED,
        message: `Refund amount (${refundAmount.toFixed(
          2,
        )}) exceeds remaining refundable balance (${remainingRefundable.toFixed(2)}).`,
      });
    }

    // Execute atomic refund transaction
    const { refund } = await this.financialRepo.createRefundWithTransaction({
      organizationId,
      payment,
      amount: refundAmount,
      reason: dto.reason,
      currency: dto.currency || payment.currency,
      gatewayRefundRef: dto.gatewayRefundRef,
      actorUserId: operatorUserId,
    });

    const response = this.mapToResponseDto(refund);

    if (idempotencyKey) {
      this.idempotencyService.save(scope, idempotencyKey, dto, response);
    }

    return response;
  }

  /**
   * Operations processes an existing refund
   */
  async processRefund(
    refundIdentifier: string,
    dto: ProcessRefundDto,
    organizationId: string,
    operatorUserId: string,
  ): Promise<RefundResponseDto> {
    const refund = await this.financialRepo.findRefundByIdentifier(
      organizationId,
      refundIdentifier,
    );
    if (!refund) {
      throw new NotFoundException({
        code: FinancialErrorCode.REFUND_NOT_FOUND,
        message: `Refund '${refundIdentifier}' was not found.`,
      });
    }

    if (!isValidTransition(ALLOWED_REFUND_TRANSITIONS, refund.status, dto.status)) {
      throw new ConflictException({
        code: FinancialErrorCode.REFUND_INVALID_STATE,
        message: `Cannot transition refund from ${refund.status} to ${dto.status}.`,
      });
    }

    const updated = await this.prisma.refund.update({
      where: { id: refund.id },
      data: {
        status: dto.status,
        gatewayRefundRef: dto.gatewayRefundRef || refund.gatewayRefundRef,
        processedByUserId: operatorUserId,
        processedAt: new Date(),
      },
    });

    return this.mapToResponseDto(updated);
  }

  /**
   * Operations fails an existing refund
   */
  async failRefund(
    refundIdentifier: string,
    organizationId: string,
    operatorUserId: string,
  ): Promise<RefundResponseDto> {
    return this.processRefund(
      refundIdentifier,
      { status: RefundStatus.FAILED },
      organizationId,
      operatorUserId,
    );
  }

  /**
   * Operations: Get paginated refunds
   */
  async getOperationsRefunds(
    query: RefundListQueryDto,
    organizationId: string,
  ): Promise<{ data: RefundResponseDto[]; total: number }> {
    const where: Prisma.RefundWhereInput = {
      organizationId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.paymentId
        ? {
            payment: {
              OR: [{ id: query.paymentId }, { publicId: query.paymentId }],
            },
          }
        : {}),
      ...(query.bookingId
        ? {
            booking: {
              OR: [{ id: query.bookingId }, { bookingNumber: query.bookingId }],
            },
          }
        : {}),
      ...(query.from || query.to
        ? {
            createdAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    };

    const [refunds, total] = await Promise.all([
      this.prisma.refund.findMany({
        where,
        skip: query.skip,
        take: query.take,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
      }),
      this.prisma.refund.count({ where }),
    ]);

    return {
      data: refunds.map((r) => this.mapToResponseDto(r)),
      total,
    };
  }

  /**
   * Operations: Get single refund detail
   */
  async getOperationsRefundById(
    refundIdentifier: string,
    organizationId: string,
  ): Promise<RefundResponseDto> {
    const refund = await this.financialRepo.findRefundByIdentifier(
      organizationId,
      refundIdentifier,
    );
    if (!refund) {
      throw new NotFoundException({
        code: FinancialErrorCode.REFUND_NOT_FOUND,
        message: `Refund '${refundIdentifier}' was not found.`,
      });
    }

    return this.mapToResponseDto(refund);
  }

  /**
   * Customer views own refunds
   */
  async getCustomerRefunds(
    query: RefundListQueryDto,
    organizationId: string,
    customerUserId: string,
  ): Promise<{ data: RefundResponseDto[]; total: number }> {
    const customer = await this.financialRepo.findCustomerByUserId(customerUserId);
    if (!customer) {
      return { data: [], total: 0 };
    }

    const where: Prisma.RefundWhereInput = {
      organizationId,
      booking: {
        customerId: customer.id,
        ...(query.bookingId
          ? {
              OR: [{ id: query.bookingId }, { bookingNumber: query.bookingId }],
            }
          : {}),
      },
      ...(query.status ? { status: query.status } : {}),
      ...(query.paymentId
        ? {
            payment: {
              OR: [{ id: query.paymentId }, { publicId: query.paymentId }],
            },
          }
        : {}),
      ...(query.from || query.to
        ? {
            createdAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    };

    const [refunds, total] = await Promise.all([
      this.prisma.refund.findMany({
        where,
        skip: query.skip,
        take: query.take,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
      }),
      this.prisma.refund.count({ where }),
    ]);

    return {
      data: refunds.map((r) => this.mapToResponseDto(r)),
      total,
    };
  }

  /**
   * Customer views single refund detail with ownership enforcement
   */
  async getCustomerRefundById(
    refundIdentifier: string,
    organizationId: string,
    customerUserId: string,
  ): Promise<RefundResponseDto> {
    const customer = await this.financialRepo.findCustomerByUserId(customerUserId);
    if (!customer) {
      throw new ForbiddenException({
        code: FinancialErrorCode.REFUND_ACCESS_DENIED,
        message: 'Customer profile required.',
      });
    }

    const refund = await this.financialRepo.findRefundByIdentifier(
      organizationId,
      refundIdentifier,
    );
    if (!refund) {
      throw new NotFoundException({
        code: FinancialErrorCode.REFUND_NOT_FOUND,
        message: `Refund '${refundIdentifier}' was not found.`,
      });
    }

    if (refund.booking.customerId !== customer.id) {
      throw new ForbiddenException({
        code: FinancialErrorCode.REFUND_ACCESS_DENIED,
        message: 'You are not authorized to view this refund.',
      });
    }

    return this.mapToResponseDto(refund);
  }
}
