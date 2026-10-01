import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import {
  CreatePaymentParams,
  CreateRefundParams,
  IPaymentProvider,
  PaymentCancelResult,
  PaymentProcessResult,
  PaymentResult,
  PaymentStatusResult,
  PaymentWebhookEvent,
  RefundResult,
  RefundStatusResult,
} from './payment-provider.interface';

@Injectable()
export class MockPaymentProviderService implements IPaymentProvider {
  private readonly logger = new Logger(MockPaymentProviderService.name);
  private readonly payments = new Map<string, any>();
  private readonly refunds = new Map<string, any>();

  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    const providerPaymentId = `pay_mock_${crypto.randomBytes(8).toString('hex')}`;
    const clientSecret = `pi_secret_mock_${crypto.randomBytes(12).toString('hex')}`;

    const paymentRecord = {
      providerPaymentId,
      amount: params.amount,
      currency: params.currency.toUpperCase(),
      orderId: params.orderId,
      customerId: params.customerId,
      status: 'PENDING',
      metadata: params.metadata || {},
      createdAt: new Date(),
    };

    this.payments.set(providerPaymentId, paymentRecord);
    this.logger.log(`[MockPayment] Created payment ${providerPaymentId} for amount ${params.amount} ${params.currency}`);

    return {
      providerPaymentId,
      status: 'PENDING',
      clientSecret,
      amount: params.amount,
      currency: params.currency.toUpperCase(),
      rawResponse: { id: providerPaymentId, status: 'pending' },
    };
  }

  async getPaymentStatus(providerPaymentId: string): Promise<PaymentStatusResult> {
    const payment = this.payments.get(providerPaymentId);
    if (!payment) {
      return {
        providerPaymentId,
        status: 'FAILED',
        amount: 0,
        currency: 'INR',
        failureReason: 'PAYMENT_NOT_FOUND',
      };
    }

    return {
      providerPaymentId,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: 'mock_card_visa',
    };
  }

  async processPayment(providerPaymentId: string, _details?: any): Promise<PaymentProcessResult> {
    const payment = this.payments.get(providerPaymentId);
    if (!payment) {
      return {
        providerPaymentId,
        status: 'FAILED',
      };
    }

    payment.status = 'SUCCEEDED';
    payment.processedAt = new Date();
    this.payments.set(providerPaymentId, payment);

    return {
      providerPaymentId,
      status: 'SUCCEEDED',
      receiptUrl: `https://receipts.washora.internal/mock/${providerPaymentId}`,
      transactionReference: `tx_ref_${crypto.randomBytes(6).toString('hex')}`,
    };
  }

  async cancelPayment(providerPaymentId: string, _reason?: string): Promise<PaymentCancelResult> {
    const payment = this.payments.get(providerPaymentId);
    if (payment) {
      payment.status = 'CANCELLED';
      this.payments.set(providerPaymentId, payment);
    }

    return {
      providerPaymentId,
      status: 'CANCELLED',
      cancelledAt: new Date(),
    };
  }

  async createRefund(params: CreateRefundParams): Promise<RefundResult> {
    const providerRefundId = `ref_mock_${crypto.randomBytes(8).toString('hex')}`;
    const refundRecord = {
      providerRefundId,
      providerPaymentId: params.providerPaymentId,
      amount: params.amount,
      currency: params.currency.toUpperCase(),
      status: 'SUCCEEDED',
      createdAt: new Date(),
    };

    this.refunds.set(providerRefundId, refundRecord);
    this.logger.log(`[MockPayment] Refund ${providerRefundId} created for ${params.providerPaymentId}`);

    return {
      providerRefundId,
      providerPaymentId: params.providerPaymentId,
      amount: params.amount,
      currency: params.currency.toUpperCase(),
      status: 'SUCCEEDED',
      createdAt: refundRecord.createdAt,
    };
  }

  async getRefundStatus(providerRefundId: string): Promise<RefundStatusResult> {
    const refund = this.refunds.get(providerRefundId);
    if (!refund) {
      return {
        providerRefundId,
        status: 'FAILED',
        amount: 0,
        currency: 'INR',
      };
    }

    return {
      providerRefundId,
      status: refund.status,
      amount: refund.amount,
      currency: refund.currency,
    };
  }

  verifyWebhookSignature(rawPayload: string | Buffer, signature: string, secret: string): boolean {
    if (!signature || !secret) {
      return false;
    }
    const payloadStr = Buffer.isBuffer(rawPayload) ? rawPayload.toString('utf8') : rawPayload;
    const computedHmac = crypto.createHmac('sha256', secret).update(payloadStr).digest('hex');

    try {
      const computedBuf = Buffer.from(computedHmac, 'utf8');
      const sigBuf = Buffer.from(signature, 'utf8');
      if (computedBuf.length !== sigBuf.length) {
        return false;
      }
      return crypto.timingSafeEqual(computedBuf, sigBuf);
    } catch {
      return false;
    }
  }

  parseWebhookEvent(rawPayload: string | Buffer): PaymentWebhookEvent {
    const str = Buffer.isBuffer(rawPayload) ? rawPayload.toString('utf8') : rawPayload;
    try {
      const parsed = JSON.parse(str);
      return {
        id: parsed.id || `evt_mock_${crypto.randomBytes(6).toString('hex')}`,
        type: parsed.type || 'payment.succeeded',
        data: parsed.data || parsed,
        created: parsed.created || Math.floor(Date.now() / 1000),
      };
    } catch (e: any) {
      throw new Error(`Failed to parse webhook payload: ${e.message}`);
    }
  }
}
