import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Transaction } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import {
  TransactionListQueryDto,
  TransactionResponseDto,
} from '../dto';
import { FinancialRepository } from '../repositories/financial.repository';
import { FinancialErrorCode } from '../types/financial.types';

@Injectable()
export class TransactionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly financialRepo: FinancialRepository,
  ) {}

  mapToResponseDto(tx: Transaction): TransactionResponseDto {
    return {
      id: tx.id,
      publicId: tx.publicId,
      organizationId: tx.organizationId,
      bookingId: tx.bookingId,
      paymentId: tx.paymentId,
      type: tx.type,
      amount: tx.amount.toFixed(2),
      currency: tx.currency,
      status: tx.status,
      referenceNumber: tx.referenceNumber,
      description: tx.description,
      createdAt: tx.createdAt,
    };
  }

  /**
   * Customer views own transactions
   */
  async getCustomerTransactions(
    query: TransactionListQueryDto,
    organizationId: string,
    customerUserId: string,
  ): Promise<{ data: TransactionResponseDto[]; total: number }> {
    const customer = await this.financialRepo.findCustomerByUserId(customerUserId);
    if (!customer) {
      return { data: [], total: 0 };
    }

    const where: Prisma.TransactionWhereInput = {
      organizationId,
      OR: [
        { booking: { customerId: customer.id } },
        { payment: { booking: { customerId: customer.id } } },
      ],
      ...(query.type ? { type: query.type } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.bookingId
        ? {
            booking: {
              OR: [{ id: query.bookingId }, { bookingNumber: query.bookingId }],
            },
          }
        : {}),
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

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip: query.skip,
        take: query.take,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data: transactions.map((t) => this.mapToResponseDto(t)),
      total,
    };
  }

  /**
   * Customer views single transaction detail with ownership enforcement
   */
  async getCustomerTransactionById(
    transactionIdentifier: string,
    organizationId: string,
    customerUserId: string,
  ): Promise<TransactionResponseDto> {
    const customer = await this.financialRepo.findCustomerByUserId(customerUserId);
    if (!customer) {
      throw new ForbiddenException({
        code: FinancialErrorCode.TRANSACTION_ACCESS_DENIED,
        message: 'Customer profile required.',
      });
    }

    const tx = await this.prisma.transaction.findFirst({
      where: {
        organizationId,
        OR: [{ id: transactionIdentifier }, { publicId: transactionIdentifier }],
      },
      include: {
        booking: true,
        payment: { include: { booking: true } },
      },
    });

    if (!tx) {
      throw new NotFoundException({
        code: FinancialErrorCode.TRANSACTION_NOT_FOUND,
        message: `Transaction '${transactionIdentifier}' was not found.`,
      });
    }

    const ownerCustomerId = tx.booking?.customerId || tx.payment?.booking?.customerId;
    if (ownerCustomerId !== customer.id) {
      throw new ForbiddenException({
        code: FinancialErrorCode.TRANSACTION_ACCESS_DENIED,
        message: 'You are not authorized to view this transaction.',
      });
    }

    return this.mapToResponseDto(tx);
  }

  /**
   * Customer views transactions for a specific booking
   */
  async getCustomerBookingTransactions(
    bookingIdentifier: string,
    organizationId: string,
    customerUserId: string,
  ): Promise<TransactionResponseDto[]> {
    const customer = await this.financialRepo.findCustomerByUserId(customerUserId);
    if (!customer) {
      throw new ForbiddenException({
        code: FinancialErrorCode.TRANSACTION_ACCESS_DENIED,
        message: 'Customer profile required.',
      });
    }

    const booking = await this.financialRepo.findBooking(organizationId, bookingIdentifier);
    if (!booking) {
      throw new NotFoundException({
        code: FinancialErrorCode.TRANSACTION_NOT_FOUND,
        message: `Booking '${bookingIdentifier}' was not found.`,
      });
    }

    if (booking.customerId !== customer.id) {
      throw new ForbiddenException({
        code: FinancialErrorCode.TRANSACTION_ACCESS_DENIED,
        message: 'You are not authorized to view transactions for this booking.',
      });
    }

    const transactions = await this.prisma.transaction.findMany({
      where: {
        organizationId,
        bookingId: booking.id,
      },
      orderBy: { createdAt: 'desc' },
    });

    return transactions.map((t) => this.mapToResponseDto(t));
  }

  /**
   * Operations: Get paginated organization transactions
   */
  async getOperationsTransactions(
    query: TransactionListQueryDto,
    organizationId: string,
  ): Promise<{ data: TransactionResponseDto[]; total: number }> {
    const where: Prisma.TransactionWhereInput = {
      organizationId,
      ...(query.type ? { type: query.type } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.bookingId
        ? {
            booking: {
              OR: [{ id: query.bookingId }, { bookingNumber: query.bookingId }],
            },
          }
        : {}),
      ...(query.paymentId
        ? {
            payment: {
              OR: [{ id: query.paymentId }, { publicId: query.paymentId }],
            },
          }
        : {}),
      ...(query.customerId
        ? {
            booking: { customerId: query.customerId },
          }
        : {}),
      ...(query.providerId
        ? {
            booking: { providerId: query.providerId },
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

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip: query.skip,
        take: query.take,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data: transactions.map((t) => this.mapToResponseDto(t)),
      total,
    };
  }

  /**
   * Operations: Get transaction detail
   */
  async getOperationsTransactionById(
    transactionIdentifier: string,
    organizationId: string,
  ): Promise<TransactionResponseDto> {
    const tx = await this.financialRepo.findTransactionByIdentifier(
      organizationId,
      transactionIdentifier,
    );
    if (!tx) {
      throw new NotFoundException({
        code: FinancialErrorCode.TRANSACTION_NOT_FOUND,
        message: `Transaction '${transactionIdentifier}' was not found.`,
      });
    }

    return this.mapToResponseDto(tx);
  }

  /**
   * Operations: Get transactions for a booking
   */
  async getOperationsBookingTransactions(
    bookingIdentifier: string,
    organizationId: string,
  ): Promise<TransactionResponseDto[]> {
    const booking = await this.financialRepo.findBooking(organizationId, bookingIdentifier);
    if (!booking) {
      throw new NotFoundException({
        code: FinancialErrorCode.TRANSACTION_NOT_FOUND,
        message: `Booking '${bookingIdentifier}' was not found.`,
      });
    }

    const transactions = await this.prisma.transaction.findMany({
      where: {
        organizationId,
        bookingId: booking.id,
      },
      orderBy: { createdAt: 'desc' },
    });

    return transactions.map((t) => this.mapToResponseDto(t));
  }

  /**
   * Operations: Get transactions for a payment
   */
  async getOperationsPaymentTransactions(
    paymentIdentifier: string,
    organizationId: string,
  ): Promise<TransactionResponseDto[]> {
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

    const transactions = await this.prisma.transaction.findMany({
      where: {
        organizationId,
        paymentId: payment.id,
      },
      orderBy: { createdAt: 'desc' },
    });

    return transactions.map((t) => this.mapToResponseDto(t));
  }
}
