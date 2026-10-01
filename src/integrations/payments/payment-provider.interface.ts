export interface CreatePaymentParams {
  amount: number;
  currency: string;
  orderId: string;
  customerId: string;
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  providerPaymentId: string;
  status: 'PENDING' | 'REQUIRES_ACTION' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED';
  clientSecret?: string;
  redirectUrl?: string;
  amount: number;
  currency: string;
  rawResponse?: any;
}

export interface PaymentStatusResult {
  providerPaymentId: string;
  status: 'PENDING' | 'REQUIRES_ACTION' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
  amount: number;
  currency: string;
  paymentMethod?: string;
  failureReason?: string;
}

export interface PaymentProcessResult {
  providerPaymentId: string;
  status: 'SUCCEEDED' | 'FAILED';
  receiptUrl?: string;
  transactionReference?: string;
}

export interface PaymentCancelResult {
  providerPaymentId: string;
  status: 'CANCELLED';
  cancelledAt: Date;
}

export interface CreateRefundParams {
  providerPaymentId: string;
  amount: number;
  currency: string;
  reason?: string;
  metadata?: Record<string, any>;
}

export interface RefundResult {
  providerRefundId: string;
  providerPaymentId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED';
  createdAt: Date;
}

export interface RefundStatusResult {
  providerRefundId: string;
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED';
  amount: number;
  currency: string;
}

export interface PaymentWebhookEvent {
  id: string;
  type: string;
  data: any;
  created: number;
}

export interface IPaymentProvider {
  createPayment(params: CreatePaymentParams): Promise<PaymentResult>;
  getPaymentStatus(providerPaymentId: string): Promise<PaymentStatusResult>;
  processPayment(providerPaymentId: string, details?: any): Promise<PaymentProcessResult>;
  cancelPayment(providerPaymentId: string, reason?: string): Promise<PaymentCancelResult>;
  createRefund(params: CreateRefundParams): Promise<RefundResult>;
  getRefundStatus(providerRefundId: string): Promise<RefundStatusResult>;
  verifyWebhookSignature(rawPayload: string | Buffer, signature: string, secret: string): boolean;
  parseWebhookEvent(rawPayload: string | Buffer): PaymentWebhookEvent;
}
