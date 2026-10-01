import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Payment, PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import {
  CreatePaymentDto,
  PaymentListQueryDto,
  PaymentResponseDto,
  ProcessPaymentDto,
} from '../dto';
import { FinancialRepository } from '../repositories/financial.repository';
import {
  ALLOWED_PAYMENT_TRANSITIONS,
  FinancialErrorCode,
  isValidTransition,
} from '../types/financial.types';
import { IdempotencyService } from './idempotency.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly financialRepo: FinancialRepository,
    private readonly idempotencyService: IdempotencyService,
  ) {}

  /**
   * Helper to map Prisma Payment entity to PaymentResponseDto
   */
  mapToResponseDto(
    payment: Payment & { booking?: { customerId?: string } },
  ): PaymentResponseDto {
    return {
      id: payment.id,
      publicId: payment.publicId,
      organizationId: payment.organizationId,
      bookingId: payment.bookingId,
      customerId: payment.booking?.customerId,
      amount: payment.amount.toFixed(2),
      currency: payment.currency,
      method: payment.method,
      status: payment.status,
      gatewayRef: payment.gatewayRef,
      gatewayName: payment.gatewayName,
      paidAt: payment.paidAt,
      failureReason: payment.failureReason,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }

  /**
   * Customer initiates payment for their booking.
   * Enforces server-authoritative amount validation, tenant and customer isolation, and idempotency.
   */
  async createCustomerPayment(
    bookingIdentifier: string,
    dto: CreatePaymentDto,
    organizationId: string,
    customerUserId: string,
    idempotencyKey?: string,
  ): Promise<PaymentResponseDto> {
    const scope = `${organizationId}:payment:create:${bookingIdentifier}`;

    // 1. Idempotency Check
    if (idempotencyKey) {
      const cached = this.idempotencyService.check<PaymentResponseDto>(
        scope,
        idempotencyKey,
        dto,
      );
      if (cached) return cached;
    }

    // 2. Resolve Customer Profile
    const customer = await this.financialRepo.findCustomerByUserId(customerUserId);
    if (!customer) {
      throw new ForbiddenException({
        code: FinancialErrorCode.PAYMENT_ACCESS_DENIED,
        message: 'Customer profile required to initiate payment.',
      });
    }

    // 3. Resolve Booking
    const booking = await this.financialRepo.findBooking(organizationId, bookingIdentifier);
    if (!booking) {
      throw new NotFoundException({
        code: FinancialErrorCode.PAYMENT_NOT_FOUND,
        message: `Booking '${bookingIdentifier}' was not found.`,
      });
    }

    // 4. Verify Customer Booking Ownership
    if (booking.customerId !== customer.id) {
      throw new ForbiddenException({
        code: FinancialErrorCode.PAYMENT_ACCESS_DENIED,
        message: 'You are not authorized to create payment for another customer booking.',
      });
    }

    // 5. Verify Booking is Payable
    if (booking.status === 'CANCELLED') {
      throw new BadRequestException({
        code: FinancialErrorCode.PAYMENT_NOT_PAYABLE,
        message: 'Cannot create payment for a cancelled booking.',
      });
    }

    // Check existing payment status
    if (booking.payment) {
      if (
        booking.payment.status === PaymentStatus.PAID ||
        booking.payment.status === PaymentStatus.PARTIALLY_REFUNDED ||
        booking.payment.status === PaymentStatus.REFUNDED
      ) {
        throw new ConflictException({
          code: FinancialErrorCode.PAYMENT_ALREADY_COMPLETED,
          message: 'This booking has already been paid.',
        });
      }

      if (booking.payment.status === PaymentStatus.PENDING) {
        const response = this.mapToResponseDto(booking.payment);
        if (idempotencyKey) {
          this.idempotencyService.save(scope, idempotencyKey, dto, response);
        }
        return response;
      }
    }

    // 6. Server-Authoritative Amount Validation
    const requestedAmount = new Prisma.Decimal(dto.amount);
    if (!requestedAmount.equals(booking.totalAmount)) {
      throw new BadRequestException({
        code: FinancialErrorCode.PAYMENT_AMOUNT_MISMATCH,
        message: `Payment amount (${requestedAmount.toFixed(
          2,
        )}) does not match canonical booking total (${booking.totalAmount.toFixed(2)}).`,
      });
    }

    // 7. Atomic Payment & Transaction Creation
    const { payment } = await this.financialRepo.createPaymentWithTransaction({
      organizationId,
      bookingId: booking.id,
      amount: booking.totalAmount,
      currency: dto.currency || booking.currency,
      method: dto.paymentMethod,
      gatewayName: dto.gateway || 'MOCK',
      actorUserId: customerUserId,
    });

    const response = this.mapToResponseDto({
      ...payment,
      booking: { customerId: customer.id },
    });

    // 8. Save Idempotency
    if (idempotencyKey) {
      this.idempotencyService.save(scope, idempotencyKey, dto, response);
    }

    return response;
  }

  /**
   * Customer initiates processing of their pending payment
   */
  async processCustomerPayment(
    paymentIdentifier: string,
    dto: ProcessPaymentDto,
    organizationId: string,
    customerUserId: string,
  ): Promise<PaymentResponseDto> {
    const customer = await this.financialRepo.findCustomerByUserId(customerUserId);
    if (!customer) {
      throw new ForbiddenException({
        code: FinancialErrorCode.PAYMENT_ACCESS_DENIED,
        message: 'Customer profile required.',
      });
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

    if (payment.booking.customerId !== customer.id) {
      throw new ForbiddenException({
        code: FinancialErrorCode.PAYMENT_ACCESS_DENIED,
        message: 'You are not authorized to process this payment.',
      });
    }

    if (!isValidTransition(ALLOWED_PAYMENT_TRANSITIONS, payment.status, PaymentStatus.PROCESSING)) {
      throw new ConflictException({
        code: FinancialErrorCode.PAYMENT_INVALID_STATE,
        message: `Cannot transition payment from ${payment.status} to ${PaymentStatus.PROCESSING}.`,
      });
    }

    const updated = await this.financialRepo.updatePaymentStatusWithTransaction(
      payment.id,
      organizationId,
      PaymentStatus.PROCESSING,
      {
        gatewayRef: dto.gatewayRef,
        actorUserId: customerUserId,
      },
    );

    return this.mapToResponseDto(updated);
  }

  /**
   * Customer cancels their pending payment
   */
  async cancelCustomerPayment(
    paymentIdentifier: string,
    organizationId: string,
    customerUserId: string,
  ): Promise<PaymentResponseDto> {
    const customer = await this.financialRepo.findCustomerByUserId(customerUserId);
    if (!customer) {
      throw new ForbiddenException({
        code: FinancialErrorCode.PAYMENT_ACCESS_DENIED,
        message: 'Customer profile required.',
      });
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

    if (payment.booking.customerId !== customer.id) {
      throw new ForbiddenException({
        code: FinancialErrorCode.PAYMENT_ACCESS_DENIED,
        message: 'You are not authorized to cancel this payment.',
      });
    }

    if (!isValidTransition(ALLOWED_PAYMENT_TRANSITIONS, payment.status, PaymentStatus.FAILED)) {
      throw new ConflictException({
        code: FinancialErrorCode.PAYMENT_INVALID_STATE,
        message: `Cannot cancel payment from state ${payment.status}.`,
      });
    }

    const updated = await this.financialRepo.updatePaymentStatusWithTransaction(
      payment.id,
      organizationId,
      PaymentStatus.FAILED,
      {
        failureReason: 'Cancelled by customer',
        actorUserId: customerUserId,
      },
    );

    return this.mapToResponseDto(updated);
  }

  /**
   * Get paginated customer payments
   */
  async getCustomerPayments(
    query: PaymentListQueryDto,
    organizationId: string,
    customerUserId: string,
  ): Promise<{ data: PaymentResponseDto[]; total: number }> {
    const customer = await this.financialRepo.findCustomerByUserId(customerUserId);
    if (!customer) {
      return { data: [], total: 0 };
    }

    const where: Prisma.PaymentWhereInput = {
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
      ...(query.paymentMethod ? { method: query.paymentMethod } : {}),
      ...(query.from || query.to
        ? {
            createdAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    };

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: { booking: { select: { customerId: true } } },
        skip: query.skip,
        take: query.take,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data: payments.map((p) => this.mapToResponseDto(p)),
      total,
    };
  }

  /**
   * Get single customer payment by identifier
   */
  async getCustomerPaymentById(
    paymentIdentifier: string,
    organizationId: string,
    customerUserId: string,
  ): Promise<PaymentResponseDto> {
    const customer = await this.financialRepo.findCustomerByUserId(customerUserId);
    if (!customer) {
      throw new ForbiddenException({
        code: FinancialErrorCode.PAYMENT_ACCESS_DENIED,
        message: 'Customer profile required.',
      });
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

    if (payment.booking.customerId !== customer.id) {
      throw new ForbiddenException({
        code: FinancialErrorCode.PAYMENT_ACCESS_DENIED,
        message: 'You are not authorized to view this payment.',
      });
    }

    return this.mapToResponseDto(payment);
  }

  /**
   * Operations: Get paginated organization payments
   */
  async getOperationsPayments(
    query: PaymentListQueryDto,
    organizationId: string,
  ): Promise<{ data: PaymentResponseDto[]; total: number }> {
    const where: Prisma.PaymentWhereInput = {
      organizationId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.paymentMethod ? { method: query.paymentMethod } : {}),
      ...(query.bookingId
        ? {
            booking: {
              OR: [{ id: query.bookingId }, { bookingNumber: query.bookingId }],
            },
          }
        : {}),
      ...(query.customerId
        ? {
            booking: { customerId: query.customerId },
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

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: { booking: { select: { customerId: true } } },
        skip: query.skip,
        take: query.take,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data: payments.map((p) => this.mapToResponseDto(p)),
      total,
    };
  }

  /**
   * Operations: Get payment detail
   */
  async getOperationsPaymentById(
    paymentIdentifier: string,
    organizationId: string,
  ): Promise<PaymentResponseDto> {
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

    return this.mapToResponseDto(payment);
  }

  /**
   * Operations: Mark payment as PROCESSING
   */
  async processOperationsPayment(
    paymentIdentifier: string,
    dto: ProcessPaymentDto,
    organizationId: string,
    actorUserId: string,
  ): Promise<PaymentResponseDto> {
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

    if (!isValidTransition(ALLOWED_PAYMENT_TRANSITIONS, payment.status, PaymentStatus.PROCESSING)) {
      throw new ConflictException({
        code: FinancialErrorCode.PAYMENT_INVALID_STATE,
        message: `Cannot transition payment from ${payment.status} to ${PaymentStatus.PROCESSING}.`,
      });
    }

    const updated = await this.financialRepo.updatePaymentStatusWithTransaction(
      payment.id,
      organizationId,
      PaymentStatus.PROCESSING,
      {
        gatewayRef: dto.gatewayRef,
        actorUserId,
      },
    );

    return this.mapToResponseDto(updated);
  }

  /**
   * Operations: Mark payment as PAID
   */
  async markOperationsPaymentPaid(
    paymentIdentifier: string,
    dto: ProcessPaymentDto,
    organizationId: string,
    actorUserId: string,
  ): Promise<PaymentResponseDto> {
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

    if (!isValidTransition(ALLOWED_PAYMENT_TRANSITIONS, payment.status, PaymentStatus.PAID)) {
      throw new ConflictException({
        code: FinancialErrorCode.PAYMENT_INVALID_STATE,
        message: `Cannot transition payment from ${payment.status} to ${PaymentStatus.PAID}.`,
      });
    }

    const updated = await this.financialRepo.updatePaymentStatusWithTransaction(
      payment.id,
      organizationId,
      PaymentStatus.PAID,
      {
        gatewayRef: dto.gatewayRef,
        actorUserId,
      },
    );

    return this.mapToResponseDto(updated);
  }

  /**
   * Operations: Mark payment as FAILED
   */
  async markOperationsPaymentFailed(
    paymentIdentifier: string,
    dto: ProcessPaymentDto,
    organizationId: string,
    actorUserId: string,
  ): Promise<PaymentResponseDto> {
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

    if (!isValidTransition(ALLOWED_PAYMENT_TRANSITIONS, payment.status, PaymentStatus.FAILED)) {
      throw new ConflictException({
        code: FinancialErrorCode.PAYMENT_INVALID_STATE,
        message: `Cannot transition payment from ${payment.status} to ${PaymentStatus.FAILED}.`,
      });
    }

    const updated = await this.financialRepo.updatePaymentStatusWithTransaction(
      payment.id,
      organizationId,
      PaymentStatus.FAILED,
      {
        failureReason: dto.failureReason || 'Payment failed by operator',
        actorUserId,
      },
    );

    return this.mapToResponseDto(updated);
  }

  /**
   * Operations: Cancel payment
   */
  async cancelOperationsPayment(
    paymentIdentifier: string,
    organizationId: string,
    actorUserId: string,
  ): Promise<PaymentResponseDto> {
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

    if (!isValidTransition(ALLOWED_PAYMENT_TRANSITIONS, payment.status, PaymentStatus.FAILED)) {
      throw new ConflictException({
        code: FinancialErrorCode.PAYMENT_INVALID_STATE,
        message: `Cannot cancel payment from state ${payment.status}.`,
      });
    }

    const updated = await this.financialRepo.updatePaymentStatusWithTransaction(
      payment.id,
      organizationId,
      PaymentStatus.FAILED,
      {
        failureReason: 'Cancelled by operator',
        actorUserId,
      },
    );

    return this.mapToResponseDto(updated);
  }
}
