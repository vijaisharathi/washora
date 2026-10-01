import { Injectable } from '@nestjs/common';
import {
  Booking,
  Customer,
  Earning,
  EarningStatus,
  EarningTransaction,
  EarningTransactionType,
  Payment,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  Refund,
  RefundStatus,
  Transaction,
  TransactionStatus,
  TransactionType,
} from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { FinancialAuditEventAction } from '../types/financial.types';

@Injectable()
export class FinancialRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates next sequential public ID for Payment (PAY-YYYY-NNNNNN)
   */
  async generateNextPaymentPublicId(
    organizationId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<string> {
    const client = tx || this.prisma;
    const year = new Date().getFullYear();
    const prefix = `PAY-${year}-`;

    const latest = await client.payment.findFirst({
      where: {
        organizationId,
        publicId: { startsWith: prefix },
      },
      orderBy: { publicId: 'desc' },
      select: { publicId: true },
    });

    let nextSeq = 1;
    if (latest?.publicId) {
      const parts = latest.publicId.split('-');
      const parsed = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(parsed)) {
        nextSeq = parsed + 1;
      }
    }

    return `${prefix}${String(nextSeq).padStart(6, '0')}`;
  }

  /**
   * Generates next sequential public ID for Transaction (TXN-YYYY-NNNNNN)
   */
  async generateNextTransactionPublicId(
    organizationId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<string> {
    const client = tx || this.prisma;
    const year = new Date().getFullYear();
    const prefix = `TXN-${year}-`;

    const latest = await client.transaction.findFirst({
      where: {
        organizationId,
        publicId: { startsWith: prefix },
      },
      orderBy: { publicId: 'desc' },
      select: { publicId: true },
    });

    let nextSeq = 1;
    if (latest?.publicId) {
      const parts = latest.publicId.split('-');
      const parsed = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(parsed)) {
        nextSeq = parsed + 1;
      }
    }

    return `${prefix}${String(nextSeq).padStart(6, '0')}`;
  }

  /**
   * Generates next sequential public ID for Refund (REF-YYYY-NNNNNN)
   */
  async generateNextRefundPublicId(
    organizationId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<string> {
    const client = tx || this.prisma;
    const year = new Date().getFullYear();
    const prefix = `REF-${year}-`;

    const latest = await client.refund.findFirst({
      where: {
        organizationId,
        publicId: { startsWith: prefix },
      },
      orderBy: { publicId: 'desc' },
      select: { publicId: true },
    });

    let nextSeq = 1;
    if (latest?.publicId) {
      const parts = latest.publicId.split('-');
      const parsed = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(parsed)) {
        nextSeq = parsed + 1;
      }
    }

    return `${prefix}${String(nextSeq).padStart(6, '0')}`;
  }

  /**
   * Generates next sequential public ID for Earning (ERN-YYYY-NNNNNN)
   */
  async generateNextEarningPublicId(
    organizationId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<string> {
    const client = tx || this.prisma;
    const year = new Date().getFullYear();
    const prefix = `ERN-${year}-`;

    const latest = await client.earning.findFirst({
      where: {
        organizationId,
        publicId: { startsWith: prefix },
      },
      orderBy: { publicId: 'desc' },
      select: { publicId: true },
    });

    let nextSeq = 1;
    if (latest?.publicId) {
      const parts = latest.publicId.split('-');
      const parsed = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(parsed)) {
        nextSeq = parsed + 1;
      }
    }

    return `${prefix}${String(nextSeq).padStart(6, '0')}`;
  }

  /**
   * Look up payment by UUID or public ID
   */
  async findPaymentByIdentifier(
    organizationId: string,
    identifier: string,
    includeRelations = true,
  ): Promise<
    | (Payment & {
        booking: Booking & { customer?: Customer | null };
        transactions?: Transaction[];
        refunds?: Refund[];
      })
    | null
  > {
    return this.prisma.payment.findFirst({
      where: {
        organizationId,
        OR: [{ id: identifier }, { publicId: identifier }],
      },
      include: includeRelations
        ? {
            booking: {
              include: { customer: true },
            },
            transactions: { orderBy: { createdAt: 'desc' } },
            refunds: { orderBy: { createdAt: 'desc' } },
          }
        : undefined,
    }) as any;
  }

  /**
   * Find payment for a booking
   */
  async findPaymentByBookingId(
    organizationId: string,
    bookingIdentifier: string,
  ): Promise<Payment | null> {
    return this.prisma.payment.findFirst({
      where: {
        organizationId,
        booking: {
          OR: [
            { id: bookingIdentifier },
            { bookingNumber: bookingIdentifier },
          ],
        },
      },
      include: {
        booking: true,
        transactions: true,
        refunds: true,
      },
    });
  }

  /**
   * Find booking by identifier (UUID or bookingNumber)
   */
  async findBooking(
    organizationId: string,
    bookingIdentifier: string,
  ): Promise<
    | (Booking & {
        customer: Customer;
        payment: Payment | null;
        assignments: any[];
      })
    | null
  > {
    return this.prisma.booking.findFirst({
      where: {
        organizationId,
        OR: [{ id: bookingIdentifier }, { bookingNumber: bookingIdentifier }],
      },
      include: {
        customer: true,
        payment: true,
        assignments: {
          where: {
            status: { in: ['ASSIGNED', 'ACCEPTED', 'IN_TRANSIT', 'ARRIVED', 'COMPLETED'] },
          },
        },
      },
    });
  }

  /**
   * Create payment with initial pending transaction and audit event atomically
   */
  async createPaymentWithTransaction(data: {
    organizationId: string;
    bookingId: string;
    amount: Prisma.Decimal;
    currency: string;
    method: PaymentMethod;
    gatewayName?: string;
    gatewayRef?: string;
    actorUserId?: string;
  }): Promise<{ payment: Payment; transaction: Transaction }> {
    return this.prisma.$transaction(async (tx) => {
      const payPublicId = await this.generateNextPaymentPublicId(data.organizationId, tx);
      const txnPublicId = await this.generateNextTransactionPublicId(data.organizationId, tx);

      const payment = await tx.payment.create({
        data: {
          publicId: payPublicId,
          organizationId: data.organizationId,
          bookingId: data.bookingId,
          amount: data.amount,
          currency: data.currency,
          method: data.method,
          status: PaymentStatus.PENDING,
          gatewayName: data.gatewayName || 'MOCK',
          gatewayRef: data.gatewayRef,
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          publicId: txnPublicId,
          organizationId: data.organizationId,
          bookingId: data.bookingId,
          paymentId: payment.id,
          type: TransactionType.PAYMENT,
          amount: data.amount,
          currency: data.currency,
          status: TransactionStatus.PENDING,
          description: `Customer payment initiation for booking`,
        },
      });

      await tx.auditEvent.create({
        data: {
          organizationId: data.organizationId,
          actorUserId: data.actorUserId,
          action: FinancialAuditEventAction.PAYMENT_CREATED,
          entityType: 'Payment',
          entityId: payment.publicId,
          metadataJson: {
            paymentId: payment.id,
            bookingId: data.bookingId,
            amount: data.amount.toString(),
            method: data.method,
          },
        },
      });

      return { payment, transaction };
    });
  }

  /**
   * Update payment status atomically with transaction and audit event
   */
  async updatePaymentStatusWithTransaction(
    paymentId: string,
    organizationId: string,
    newStatus: PaymentStatus,
    options: {
      gatewayRef?: string;
      failureReason?: string;
      actorUserId?: string;
    } = {},
  ): Promise<Payment> {
    return this.prisma.$transaction(async (tx) => {
      const updateData: Prisma.PaymentUpdateInput = {
        status: newStatus,
      };

      if (newStatus === PaymentStatus.PAID) {
        updateData.paidAt = new Date();
      }
      if (options.gatewayRef) {
        updateData.gatewayRef = options.gatewayRef;
      }
      if (options.failureReason) {
        updateData.failureReason = options.failureReason;
      }

      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: updateData,
        include: { booking: true },
      });

      // Update or create ledger transaction
      if (newStatus === PaymentStatus.PAID) {
        // Find existing pending transaction or create one
        const existingTxn = await tx.transaction.findFirst({
          where: {
            organizationId,
            paymentId,
            type: TransactionType.PAYMENT,
          },
        });

        if (existingTxn) {
          await tx.transaction.update({
            where: { id: existingTxn.id },
            data: { status: TransactionStatus.COMPLETED },
          });
        } else {
          const txnPublicId = await this.generateNextTransactionPublicId(organizationId, tx);
          await tx.transaction.create({
            data: {
              publicId: txnPublicId,
              organizationId,
              bookingId: updatedPayment.bookingId,
              paymentId,
              type: TransactionType.PAYMENT,
              amount: updatedPayment.amount,
              currency: updatedPayment.currency,
              status: TransactionStatus.COMPLETED,
              description: `Payment captured for booking`,
            },
          });
        }

        // Also update booking status if PENDING
        if (updatedPayment.booking.status === 'PENDING') {
          await tx.booking.update({
            where: { id: updatedPayment.bookingId },
            data: { status: 'CONFIRMED' },
          });
        }

        await tx.auditEvent.create({
          data: {
            organizationId,
            actorUserId: options.actorUserId,
            action: FinancialAuditEventAction.PAYMENT_COMPLETED,
            entityType: 'Payment',
            entityId: updatedPayment.publicId,
            metadataJson: {
              paymentId,
              amount: updatedPayment.amount.toString(),
            },
          },
        });
      } else if (newStatus === PaymentStatus.FAILED) {
        await tx.transaction.updateMany({
          where: {
            organizationId,
            paymentId,
            type: TransactionType.PAYMENT,
            status: TransactionStatus.PENDING,
          },
          data: { status: TransactionStatus.FAILED },
        });

        await tx.auditEvent.create({
          data: {
            organizationId,
            actorUserId: options.actorUserId,
            action: FinancialAuditEventAction.PAYMENT_FAILED,
            entityType: 'Payment',
            entityId: updatedPayment.publicId,
            metadataJson: {
              paymentId,
              reason: options.failureReason,
            },
          },
        });
      } else if (newStatus === PaymentStatus.PROCESSING) {
        await tx.auditEvent.create({
          data: {
            organizationId,
            actorUserId: options.actorUserId,
            action: FinancialAuditEventAction.PAYMENT_PROCESSING_STARTED,
            entityType: 'Payment',
            entityId: updatedPayment.publicId,
            metadataJson: { paymentId },
          },
        });
      }

      return updatedPayment;
    });
  }

  /**
   * Create refund atomically inside database transaction
   */
  async createRefundWithTransaction(data: {
    organizationId: string;
    payment: Payment;
    amount: Prisma.Decimal;
    reason: string;
    currency: string;
    gatewayRefundRef?: string;
    actorUserId?: string;
  }): Promise<{ refund: Refund; transaction: Transaction; payment: Payment }> {
    return this.prisma.$transaction(async (tx) => {
      // 1. Lock/fetch latest completed refunds to calculate remaining refundable amount
      const existingRefunds = await tx.refund.findMany({
        where: {
          organizationId: data.organizationId,
          paymentId: data.payment.id,
          status: { in: [RefundStatus.PROCESSED, RefundStatus.APPROVED, RefundStatus.PENDING] },
        },
        select: { amount: true },
      });

      let totalRefunded = new Prisma.Decimal(0);
      for (const r of existingRefunds) {
        totalRefunded = totalRefunded.add(r.amount);
      }

      const remainingRefundable = data.payment.amount.sub(totalRefunded);
      if (data.amount.gt(remainingRefundable)) {
        throw new Error(
          `Refund amount (${data.amount}) exceeds remaining refundable balance (${remainingRefundable})`,
        );
      }

      const refPublicId = await this.generateNextRefundPublicId(data.organizationId, tx);
      const txnPublicId = await this.generateNextTransactionPublicId(data.organizationId, tx);

      // 2. Create ledger transaction for refund
      const transaction = await tx.transaction.create({
        data: {
          publicId: txnPublicId,
          organizationId: data.organizationId,
          bookingId: data.payment.bookingId,
          paymentId: data.payment.id,
          type: TransactionType.REFUND,
          amount: data.amount,
          currency: data.currency,
          status: TransactionStatus.COMPLETED,
          description: `Refund processed: ${data.reason}`,
        },
      });

      // 3. Create Refund record
      const refund = await tx.refund.create({
        data: {
          publicId: refPublicId,
          organizationId: data.organizationId,
          bookingId: data.payment.bookingId,
          paymentId: data.payment.id,
          transactionId: transaction.id,
          amount: data.amount,
          currency: data.currency,
          status: RefundStatus.PROCESSED,
          reason: data.reason,
          gatewayRefundRef: data.gatewayRefundRef,
          processedByUserId: data.actorUserId,
          processedAt: new Date(),
        },
      });

      // 4. Update Payment status (PARTIALLY_REFUNDED or REFUNDED)
      const newTotalRefunded = totalRefunded.add(data.amount);
      const newPaymentStatus = newTotalRefunded.gte(data.payment.amount)
        ? PaymentStatus.REFUNDED
        : PaymentStatus.PARTIALLY_REFUNDED;

      const updatedPayment = await tx.payment.update({
        where: { id: data.payment.id },
        data: { status: newPaymentStatus },
      });

      // 5. Audit event
      await tx.auditEvent.create({
        data: {
          organizationId: data.organizationId,
          actorUserId: data.actorUserId,
          action: FinancialAuditEventAction.REFUND_COMPLETED,
          entityType: 'Refund',
          entityId: refund.publicId,
          metadataJson: {
            refundId: refund.id,
            paymentId: data.payment.id,
            amount: data.amount.toString(),
            status: newPaymentStatus,
          },
        },
      });

      return { refund, transaction, payment: updatedPayment };
    });
  }

  /**
   * Find refund by UUID or public ID
   */
  async findRefundByIdentifier(
    organizationId: string,
    identifier: string,
  ): Promise<
    | (Refund & {
        payment: Payment;
        booking: Booking;
        transaction?: Transaction | null;
      })
    | null
  > {
    return this.prisma.refund.findFirst({
      where: {
        organizationId,
        OR: [{ id: identifier }, { publicId: identifier }],
      },
      include: {
        payment: true,
        booking: true,
        transaction: true,
      },
    });
  }

  /**
   * Find transaction by UUID or public ID
   */
  async findTransactionByIdentifier(
    organizationId: string,
    identifier: string,
  ): Promise<
    | (Transaction & {
        booking?: Booking | null;
        payment?: Payment | null;
        earningTransactions?: EarningTransaction[];
      })
    | null
  > {
    return this.prisma.transaction.findFirst({
      where: {
        organizationId,
        OR: [{ id: identifier }, { publicId: identifier }],
      },
      include: {
        booking: true,
        payment: true,
        earningTransactions: true,
      },
    });
  }

  /**
   * Find earning by UUID or public ID
   */
  async findEarningByIdentifier(
    organizationId: string,
    identifier: string,
  ): Promise<
    | (Earning & {
        booking: Booking;
        transactions: EarningTransaction[];
      })
    | null
  > {
    return this.prisma.earning.findFirst({
      where: {
        organizationId,
        OR: [{ id: identifier }, { publicId: identifier }],
      },
      include: {
        booking: true,
        transactions: { orderBy: { createdAt: 'desc' } },
      },
    });
  }

  /**
   * Find customer by user ID
   */
  async findCustomerByUserId(userId: string): Promise<Customer | null> {
    return this.prisma.customer.findFirst({
      where: { userId },
    });
  }

  /**
   * Find provider by user ID
   */
  async findProviderByUserId(userId: string): Promise<any | null> {
    return this.prisma.provider.findFirst({
      where: { userId },
    });
  }

  /**
   * Find delivery partner by user ID
   */
  async findDeliveryPartnerByUserId(userId: string): Promise<any | null> {
    return this.prisma.deliveryPartner.findFirst({
      where: { userId },
    });
  }

  /**
   * Create earning for provider or delivery partner with associated transactions atomically
   */
  async createEarningWithTransaction(data: {
    organizationId: string;
    bookingId: string;
    providerId?: string;
    deliveryPartnerId?: string;
    grossAmount: Prisma.Decimal;
    platformFee: Prisma.Decimal;
    taxWithheld?: Prisma.Decimal;
    netAmount: Prisma.Decimal;
    currency: string;
    actorUserId?: string;
  }): Promise<Earning> {
    return this.prisma.$transaction(async (tx) => {
      const ernPublicId = await this.generateNextEarningPublicId(data.organizationId, tx);
      const txnPublicId = await this.generateNextTransactionPublicId(data.organizationId, tx);

      const txnType = data.providerId
        ? TransactionType.PROVIDER_EARNING
        : TransactionType.DELIVERY_PARTNER_EARNING;

      // 1. Create ledger transaction
      const transaction = await tx.transaction.create({
        data: {
          publicId: txnPublicId,
          organizationId: data.organizationId,
          bookingId: data.bookingId,
          type: txnType,
          amount: data.netAmount,
          currency: data.currency,
          status: TransactionStatus.COMPLETED,
          description: data.providerId
            ? 'Provider net earnings allocated'
            : 'Delivery partner net earnings allocated',
        },
      });

      // 2. Create Earning
      const earning = await tx.earning.create({
        data: {
          publicId: ernPublicId,
          organizationId: data.organizationId,
          bookingId: data.bookingId,
          providerId: data.providerId,
          deliveryPartnerId: data.deliveryPartnerId,
          grossAmount: data.grossAmount,
          platformFee: data.platformFee,
          taxWithheld: data.taxWithheld || new Prisma.Decimal(0),
          netAmount: data.netAmount,
          currency: data.currency,
          status: EarningStatus.AVAILABLE,
        },
      });

      // 3. Create Earning Transactions breakdowns
      await tx.earningTransaction.create({
        data: {
          earningId: earning.id,
          organizationId: data.organizationId,
          transactionId: transaction.id,
          type: EarningTransactionType.ORDER_CREDIT,
          amount: data.grossAmount,
          currency: data.currency,
          notes: 'Gross booking credit',
        },
      });

      if (data.platformFee.gt(0)) {
        await tx.earningTransaction.create({
          data: {
            earningId: earning.id,
            organizationId: data.organizationId,
            transactionId: transaction.id,
            type: EarningTransactionType.COMMISSION_DEDUCTION,
            amount: data.platformFee,
            currency: data.currency,
            notes: 'Platform commission fee deduction',
          },
        });
      }

      // 4. Audit Event
      await tx.auditEvent.create({
        data: {
          organizationId: data.organizationId,
          actorUserId: data.actorUserId,
          action: data.providerId
            ? FinancialAuditEventAction.PROVIDER_EARNING_CREATED
            : FinancialAuditEventAction.DELIVERY_EARNING_CREATED,
          entityType: 'Earning',
          entityId: earning.publicId,
          metadataJson: {
            earningId: earning.id,
            bookingId: data.bookingId,
            netAmount: data.netAmount.toString(),
          },
        },
      });

      return earning;
    });
  }

  /**
   * Adjust existing earning with compensating transaction atomically
   */
  async adjustEarningWithTransaction(data: {
    earning: Earning;
    adjustmentAmount: Prisma.Decimal;
    type: EarningTransactionType;
    notes: string;
    actorUserId?: string;
  }): Promise<Earning> {
    return this.prisma.$transaction(async (tx) => {
      const txnPublicId = await this.generateNextTransactionPublicId(data.earning.organizationId, tx);

      // Create compensating transaction
      const transaction = await tx.transaction.create({
        data: {
          publicId: txnPublicId,
          organizationId: data.earning.organizationId,
          bookingId: data.earning.bookingId,
          type: data.earning.providerId
            ? TransactionType.PROVIDER_EARNING
            : TransactionType.DELIVERY_PARTNER_EARNING,
          amount: data.adjustmentAmount.abs(),
          currency: data.earning.currency,
          status: TransactionStatus.COMPLETED,
          description: `Earning adjustment: ${data.notes}`,
        },
      });

      // Create earning transaction
      await tx.earningTransaction.create({
        data: {
          earningId: data.earning.id,
          organizationId: data.earning.organizationId,
          transactionId: transaction.id,
          type: data.type,
          amount: data.adjustmentAmount,
          currency: data.earning.currency,
          notes: data.notes,
        },
      });

      // Update earning net amount
      const updatedEarning = await tx.earning.update({
        where: { id: data.earning.id },
        data: {
          netAmount: data.earning.netAmount.add(data.adjustmentAmount),
        },
        include: { transactions: true, booking: true },
      });

      await tx.auditEvent.create({
        data: {
          organizationId: data.earning.organizationId,
          actorUserId: data.actorUserId,
          action: FinancialAuditEventAction.FINANCIAL_ADJUSTMENT_CREATED,
          entityType: 'Earning',
          entityId: data.earning.publicId,
          metadataJson: {
            earningId: data.earning.id,
            adjustment: data.adjustmentAmount.toString(),
            notes: data.notes,
          },
        },
      });

      return updatedEarning;
    });
  }

  /**
   * Customer payment summary aggregator
   */
  async getCustomerPaymentSummary(
    organizationId: string,
    customerId: string,
  ): Promise<{ totalPaid: string; totalRefunded: string; pendingAmount: string }> {
    const paidSum = await this.prisma.payment.aggregate({
      where: {
        organizationId,
        booking: { customerId },
        status: { in: [PaymentStatus.PAID, PaymentStatus.PARTIALLY_REFUNDED, PaymentStatus.REFUNDED] },
      },
      _sum: { amount: true },
    });

    const refundSum = await this.prisma.refund.aggregate({
      where: {
        organizationId,
        booking: { customerId },
        status: { in: [RefundStatus.PROCESSED, RefundStatus.APPROVED] },
      },
      _sum: { amount: true },
    });

    const pendingSum = await this.prisma.payment.aggregate({
      where: {
        organizationId,
        booking: { customerId },
        status: { in: [PaymentStatus.PENDING, PaymentStatus.PROCESSING] },
      },
      _sum: { amount: true },
    });

    return {
      totalPaid: (paidSum._sum.amount || new Prisma.Decimal(0)).toFixed(2),
      totalRefunded: (refundSum._sum.amount || new Prisma.Decimal(0)).toFixed(2),
      pendingAmount: (pendingSum._sum.amount || new Prisma.Decimal(0)).toFixed(2),
    };
  }

  /**
   * Earning summary aggregator for provider or delivery partner
   */
  async getEarningSummary(
    organizationId: string,
    filter: { providerId?: string; deliveryPartnerId?: string },
  ): Promise<{
    grossEarnings: string;
    commission: string;
    adjustments: string;
    netEarnings: string;
    available: string;
    paid: string;
    onHold: string;
  }> {
    const where: Prisma.EarningWhereInput = {
      organizationId,
      ...(filter.providerId ? { providerId: filter.providerId } : {}),
      ...(filter.deliveryPartnerId ? { deliveryPartnerId: filter.deliveryPartnerId } : {}),
    };

    const earnings = await this.prisma.earning.findMany({
      where,
      select: {
        grossAmount: true,
        platformFee: true,
        netAmount: true,
        status: true,
      },
    });

    let gross = new Prisma.Decimal(0);
    let commission = new Prisma.Decimal(0);
    let net = new Prisma.Decimal(0);
    let available = new Prisma.Decimal(0);
    let paid = new Prisma.Decimal(0);
    let onHold = new Prisma.Decimal(0);

    for (const e of earnings) {
      gross = gross.add(e.grossAmount);
      commission = commission.add(e.platformFee);
      net = net.add(e.netAmount);

      if (e.status === EarningStatus.AVAILABLE) {
        available = available.add(e.netAmount);
      } else if (e.status === EarningStatus.PAID_OUT) {
        paid = paid.add(e.netAmount);
      } else if (e.status === EarningStatus.PENDING || e.status === EarningStatus.PROCESSING) {
        onHold = onHold.add(e.netAmount);
      }
    }

    // Adjustments: Net - (Gross - Commission)
    const adjustments = net.sub(gross.sub(commission));

    return {
      grossEarnings: gross.toFixed(2),
      commission: commission.toFixed(2),
      adjustments: adjustments.toFixed(2),
      netEarnings: net.toFixed(2),
      available: available.toFixed(2),
      paid: paid.toFixed(2),
      onHold: onHold.toFixed(2),
    };
  }

  /**
   * Operations financial summary aggregator
   */
  async getOperationsFinancialSummary(
    organizationId: string,
  ): Promise<{
    grossPayments: string;
    refunds: string;
    providerEarnings: string;
    deliveryEarnings: string;
    platformCommission: string;
  }> {
    // 1. Gross payments
    const paymentsSum = await this.prisma.payment.aggregate({
      where: {
        organizationId,
        status: { in: [PaymentStatus.PAID, PaymentStatus.PARTIALLY_REFUNDED, PaymentStatus.REFUNDED] },
      },
      _sum: { amount: true },
    });

    // 2. Refunds
    const refundSum = await this.prisma.refund.aggregate({
      where: {
        organizationId,
        status: { in: [RefundStatus.PROCESSED, RefundStatus.APPROVED] },
      },
      _sum: { amount: true },
    });

    // 3. Provider earnings & commission
    const providerEarnings = await this.prisma.earning.aggregate({
      where: {
        organizationId,
        providerId: { not: null },
        status: { not: EarningStatus.CANCELLED },
      },
      _sum: { netAmount: true, platformFee: true },
    });

    // 4. Delivery partner earnings
    const deliveryEarnings = await this.prisma.earning.aggregate({
      where: {
        organizationId,
        deliveryPartnerId: { not: null },
        status: { not: EarningStatus.CANCELLED },
      },
      _sum: { netAmount: true, platformFee: true },
    });

    const totalCommission = (providerEarnings._sum.platformFee || new Prisma.Decimal(0)).add(
      deliveryEarnings._sum.platformFee || new Prisma.Decimal(0),
    );

    return {
      grossPayments: (paymentsSum._sum.amount || new Prisma.Decimal(0)).toFixed(2),
      refunds: (refundSum._sum.amount || new Prisma.Decimal(0)).toFixed(2),
      providerEarnings: (providerEarnings._sum.netAmount || new Prisma.Decimal(0)).toFixed(2),
      deliveryEarnings: (deliveryEarnings._sum.netAmount || new Prisma.Decimal(0)).toFixed(2),
      platformCommission: totalCommission.toFixed(2),
    };
  }

  /**
   * Create an audit event directly
   */
  async createAuditEvent(data: {
    organizationId?: string;
    actorUserId?: string;
    action: string;
    entityType: string;
    entityId: string;
    metadataJson?: Record<string, any>;
  }) {
    return this.prisma.auditEvent.create({
      data: {
        organizationId: data.organizationId,
        actorUserId: data.actorUserId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        metadataJson: data.metadataJson || {},
      },
    });
  }
}
