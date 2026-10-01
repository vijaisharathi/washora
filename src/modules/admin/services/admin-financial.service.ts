import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentStatus, RefundStatus } from '@prisma/client';
import { FinancialSummaryService } from '../../financial/services/financial-summary.service';
import { RefundService } from '../../financial/services/refund.service';
import { AdminRepository } from '../admin.repository';
import {
  EarningAdminQueryDto,
  FinancialSummaryQueryDto,
  PaymentAdminQueryDto,
  RefundAdminQueryDto,
  TransactionAdminQueryDto,
} from '../dto/financial-admin.dto';
import { AdminAuditEvent, AdminErrorCode } from '../types/admin.types';
import { AdminAuditService } from './admin-audit.service';

@Injectable()
export class AdminFinancialService {
  constructor(
    private readonly adminRepo: AdminRepository,
    private readonly refundService: RefundService,
    private readonly summaryService: FinancialSummaryService,
    private readonly auditService: AdminAuditService,
  ) {}

  // 1. Payments
  async listPayments(orgId: string, query: PaymentAdminQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const { total, items } = await this.adminRepo.findPayments(orgId, {
      bookingId: query.bookingId,
      status: query.status,
      gatewayName: query.gatewayName,
      skip,
      take: limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPayment(orgId: string, paymentId: string) {
    const payment = await this.adminRepo.findPaymentById(paymentId, orgId);
    if (!payment) {
      throw new NotFoundException({
        code: AdminErrorCode.PAYMENT_NOT_FOUND,
        message: `Payment ${paymentId} not found`,
      });
    }
    return payment;
  }

  async overridePayment(
    orgId: string,
    paymentId: string,
    status: PaymentStatus,
    reason: string,
    actorUserId: string,
    ipAddress?: string,
  ) {
    const payment = await this.getPayment(orgId, paymentId);

    const updated = await this.adminRepo.overridePaymentStatus(
      payment.id,
      orgId,
      status,
      reason,
    );

    await this.auditService.record({
      organizationId: orgId,
      actorUserId,
      action: AdminAuditEvent.PAYMENT_OVERRIDDEN,
      entityType: 'Payment',
      entityId: payment.id,
      metadata: { previousStatus: payment.status, newStatus: status, reason },
      ipHash: ipAddress,
    });

    return updated;
  }

  // 2. Transactions
  async listTransactions(orgId: string, query: TransactionAdminQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const { total, items } = await this.adminRepo.findTransactions(orgId, {
      bookingId: query.bookingId,
      paymentId: query.paymentId,
      type: query.type,
      status: query.status,
      skip,
      take: limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTransaction(orgId: string, transactionId: string) {
    const tx = await this.adminRepo.findTransactionById(transactionId, orgId);
    if (!tx) {
      throw new NotFoundException({
        code: AdminErrorCode.TRANSACTION_NOT_FOUND,
        message: `Transaction ${transactionId} not found`,
      });
    }
    return tx;
  }

  // 3. Refunds
  async listRefunds(orgId: string, query: RefundAdminQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const { total, items } = await this.adminRepo.findRefunds(orgId, {
      paymentId: query.paymentId,
      status: query.status,
      skip,
      take: limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getRefund(orgId: string, refundId: string) {
    const refund = await this.adminRepo.findRefundById(refundId, orgId);
    if (!refund) {
      throw new NotFoundException({
        code: AdminErrorCode.REFUND_NOT_FOUND,
        message: `Refund ${refundId} not found`,
      });
    }
    return refund;
  }

  async processRefund(
    orgId: string,
    refundId: string,
    actorUserId: string,
    ipAddress?: string,
  ) {
    const refund = await this.getRefund(orgId, refundId);

    const result = await this.refundService.processRefund(
      refund.id,
      { status: RefundStatus.PROCESSED },
      orgId,
      actorUserId,
    );

    await this.auditService.record({
      organizationId: orgId,
      actorUserId,
      action: AdminAuditEvent.REFUND_PROCESSED,
      entityType: 'Refund',
      entityId: refund.id,
      metadata: { amount: refund.amount },
      ipHash: ipAddress,
    });

    return result;
  }

  async failRefund(
    orgId: string,
    refundId: string,
    reason: string,
    actorUserId: string,
    ipAddress?: string,
  ) {
    const refund = await this.getRefund(orgId, refundId);

    const result = await this.refundService.failRefund(
      refund.id,
      orgId,
      actorUserId,
    );

    await this.auditService.record({
      organizationId: orgId,
      actorUserId,
      action: AdminAuditEvent.REFUND_FAILED,
      entityType: 'Refund',
      entityId: refund.id,
      metadata: { reason },
      ipHash: ipAddress,
    });

    return result;
  }

  // 4. Earnings
  async listEarnings(orgId: string, query: EarningAdminQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const { total, items } = await this.adminRepo.findEarnings(orgId, {
      providerId: query.providerId,
      deliveryPartnerId: query.deliveryPartnerId,
      status: query.status,
      skip,
      take: limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getEarning(orgId: string, earningId: string) {
    const earning = await this.adminRepo.findEarningById(earningId, orgId);
    if (!earning) {
      throw new NotFoundException({
        code: AdminErrorCode.EARNING_NOT_FOUND,
        message: `Earning ${earningId} not found`,
      });
    }
    return earning;
  }

  // 5. Summary
  async getFinancialSummary(orgId: string, _query: FinancialSummaryQueryDto) {
    return this.summaryService.getOperationsFinancialSummary(orgId);
  }
}
