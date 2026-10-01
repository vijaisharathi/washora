import {
  PaymentStatus,
  PaymentMethod,
  TransactionType,
  TransactionStatus,
  EarningStatus,
  EarningTransactionType,
  RefundStatus,
  Prisma,
} from '@prisma/client';

export {
  PaymentStatus,
  PaymentMethod,
  TransactionType,
  TransactionStatus,
  EarningStatus,
  EarningTransactionType,
  RefundStatus,
};

/**
 * Domain-specific error codes for the financial layer.
 */
export enum FinancialErrorCode {
  PAYMENT_NOT_FOUND = 'PAYMENT_NOT_FOUND',
  PAYMENT_NOT_PAYABLE = 'PAYMENT_NOT_PAYABLE',
  PAYMENT_ALREADY_COMPLETED = 'PAYMENT_ALREADY_COMPLETED',
  PAYMENT_ALREADY_PROCESSED = 'PAYMENT_ALREADY_PROCESSED',
  PAYMENT_INVALID_STATE = 'PAYMENT_INVALID_STATE',
  PAYMENT_AMOUNT_MISMATCH = 'PAYMENT_AMOUNT_MISMATCH',
  PAYMENT_BOOKING_MISMATCH = 'PAYMENT_BOOKING_MISMATCH',
  PAYMENT_ACCESS_DENIED = 'PAYMENT_ACCESS_DENIED',
  PAYMENT_ALREADY_EXISTS = 'PAYMENT_ALREADY_EXISTS',
  
  TRANSACTION_NOT_FOUND = 'TRANSACTION_NOT_FOUND',
  TRANSACTION_IMMUTABLE = 'TRANSACTION_IMMUTABLE',
  TRANSACTION_ACCESS_DENIED = 'TRANSACTION_ACCESS_DENIED',

  REFUND_NOT_FOUND = 'REFUND_NOT_FOUND',
  REFUND_AMOUNT_EXCEEDED = 'REFUND_AMOUNT_EXCEEDED',
  REFUND_AMOUNT_INVALID = 'REFUND_AMOUNT_INVALID',
  REFUND_NOT_ALLOWED = 'REFUND_NOT_ALLOWED',
  REFUND_INVALID_STATE = 'REFUND_INVALID_STATE',
  REFUND_ACCESS_DENIED = 'REFUND_ACCESS_DENIED',

  EARNING_NOT_FOUND = 'EARNING_NOT_FOUND',
  EARNING_NOT_ELIGIBLE = 'EARNING_NOT_ELIGIBLE',
  EARNING_ALREADY_EXISTS = 'EARNING_ALREADY_EXISTS',
  EARNING_INVALID_STATE = 'EARNING_INVALID_STATE',
  EARNING_ACCESS_DENIED = 'EARNING_ACCESS_DENIED',

  FINANCIAL_OPERATION_DUPLICATE = 'FINANCIAL_OPERATION_DUPLICATE',
  IDEMPOTENCY_KEY_CONFLICT = 'IDEMPOTENCY_KEY_CONFLICT',
  TENANT_MISMATCH = 'TENANT_MISMATCH',
}

/**
 * Financial Audit Event Action Names
 */
export enum FinancialAuditEventAction {
  PAYMENT_CREATED = 'PAYMENT_CREATED',
  PAYMENT_PROCESSING_STARTED = 'PAYMENT_PROCESSING_STARTED',
  PAYMENT_COMPLETED = 'PAYMENT_COMPLETED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_CANCELLED = 'PAYMENT_CANCELLED',

  REFUND_CREATED = 'REFUND_CREATED',
  REFUND_PROCESSING_STARTED = 'REFUND_PROCESSING_STARTED',
  REFUND_COMPLETED = 'REFUND_COMPLETED',
  REFUND_FAILED = 'REFUND_FAILED',
  REFUND_CANCELLED = 'REFUND_CANCELLED',

  PROVIDER_EARNING_CREATED = 'PROVIDER_EARNING_CREATED',
  PROVIDER_EARNING_UPDATED = 'PROVIDER_EARNING_UPDATED',
  PROVIDER_EARNING_REVERSED = 'PROVIDER_EARNING_REVERSED',

  DELIVERY_EARNING_CREATED = 'DELIVERY_EARNING_CREATED',
  DELIVERY_EARNING_UPDATED = 'DELIVERY_EARNING_UPDATED',
  DELIVERY_EARNING_REVERSED = 'DELIVERY_EARNING_REVERSED',

  FINANCIAL_ADJUSTMENT_CREATED = 'FINANCIAL_ADJUSTMENT_CREATED',
  FINANCIAL_ACCESS_DENIED = 'FINANCIAL_ACCESS_DENIED',
}

/**
 * Allowed State Transitions for Payments.
 */
export const ALLOWED_PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  [PaymentStatus.PENDING]: [PaymentStatus.PROCESSING, PaymentStatus.FAILED],
  [PaymentStatus.PROCESSING]: [
    PaymentStatus.PAID,
    PaymentStatus.FAILED,
  ],
  [PaymentStatus.PAID]: [
    PaymentStatus.PARTIALLY_REFUNDED,
    PaymentStatus.REFUNDED,
  ],
  [PaymentStatus.PARTIALLY_REFUNDED]: [PaymentStatus.REFUNDED],
  [PaymentStatus.FAILED]: [],
  [PaymentStatus.REFUNDED]: [],
};

/**
 * Allowed State Transitions for Refunds.
 */
export const ALLOWED_REFUND_TRANSITIONS: Record<RefundStatus, RefundStatus[]> = {
  [RefundStatus.PENDING]: [RefundStatus.PROCESSED, RefundStatus.APPROVED, RefundStatus.REJECTED, RefundStatus.FAILED],
  [RefundStatus.APPROVED]: [RefundStatus.PROCESSED, RefundStatus.FAILED, RefundStatus.REJECTED],
  [RefundStatus.PROCESSED]: [],
  [RefundStatus.FAILED]: [],
  [RefundStatus.REJECTED]: [],
};

/**
 * Allowed State Transitions for Earnings.
 */
export const ALLOWED_EARNING_TRANSITIONS: Record<EarningStatus, EarningStatus[]> = {
  [EarningStatus.PENDING]: [EarningStatus.AVAILABLE, EarningStatus.CANCELLED],
  [EarningStatus.AVAILABLE]: [EarningStatus.PROCESSING, EarningStatus.CANCELLED],
  [EarningStatus.PROCESSING]: [EarningStatus.PAID_OUT, EarningStatus.CANCELLED],
  [EarningStatus.PAID_OUT]: [],
  [EarningStatus.CANCELLED]: [],
};

/**
 * Validates whether a state transition is legal.
 */
export function isValidTransition<T extends string>(
  transitionMap: Record<T, T[]>,
  from: T,
  to: T,
): boolean {
  const allowed = transitionMap[from];
  return Array.isArray(allowed) && allowed.includes(to);
}
