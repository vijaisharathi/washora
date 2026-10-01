import { z } from "zod";

/**
 * WASHORA ADMIN / OPERATIONS PAYMENTS & FINANCIAL MANAGEMENT DOMAIN TYPES (A10)
 * Canonical models, statuses, transaction records, earnings records, refunds, and query parameters.
 */

export const PAYMENT_STATUSES = [
  "Pending",
  "Paid",
  "Partially Refunded",
  "Refunded",
  "Failed",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_METHODS = [
  "UPI",
  "Credit Card",
  "Debit Card",
  "Net Banking",
  "Cash",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface Payment {
  id: string; // e.g. "PAY-0001"
  organizationId: string; // e.g. "ORG-0001"
  bookingId: string; // references BookingOrder.id

  amount: number; // in INR (₹) - matches booking.totalAmount
  paidAmount: number; // in INR (₹)
  refundedAmount: number; // in INR (₹)

  status: PaymentStatus;
  method: PaymentMethod;

  currency: "INR";

  createdAt: string; // ISO date-time string
  paidAt?: string; // ISO date-time string
  updatedAt: string; // ISO date-time string
}

export const TRANSACTION_TYPES = [
  "Payment",
  "Refund",
  "Provider Earning",
  "Delivery Partner Earning",
] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const TRANSACTION_STATUSES = [
  "Pending",
  "Completed",
  "Failed",
  "Reversed",
] as const;

export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];

export interface Transaction {
  id: string; // e.g. "TXN-000001"
  organizationId: string; // e.g. "ORG-0001"

  bookingId: string; // references BookingOrder.id
  paymentId?: string; // references Payment.id

  type: TransactionType;
  status: TransactionStatus;

  amount: number; // in INR (₹)
  currency: "INR";

  reference: string; // e.g. "TXN-REF-2026-0001"

  createdAt: string; // ISO date-time string
  completedAt?: string; // ISO date-time string

  description: string;
}

export const EARNINGS_RECIPIENT_TYPES = ["Provider", "Delivery Partner"] as const;
export type EarningsRecipientType = (typeof EARNINGS_RECIPIENT_TYPES)[number];

export const EARNINGS_STATUSES = [
  "Pending",
  "Accrued",
  "Paid",
  "Cancelled",
] as const;

export type EarningsStatus = (typeof EARNINGS_STATUSES)[number];

export const ALLOWED_EARNINGS_TRANSITIONS: Record<EarningsStatus, readonly EarningsStatus[]> = {
  Pending: ["Accrued", "Cancelled"],
  Accrued: ["Paid", "Cancelled"],
  Paid: ["Paid"], // Terminal state (cannot reverse to Pending/Accrued/Cancelled)
  Cancelled: ["Cancelled"], // Terminal state (cannot reverse to Pending)
};

export interface EarningsRecord {
  id: string; // e.g. "ERN-0001"
  organizationId: string; // e.g. "ORG-0001"

  bookingId: string; // references BookingOrder.id

  recipientType: EarningsRecipientType;
  recipientId: string; // references Provider.id or DeliveryPartner.id

  grossAmount: number; // in INR (₹)
  platformFee: number; // in INR (₹)
  netAmount: number; // grossAmount - platformFee in INR (₹)

  status: EarningsStatus;

  createdAt: string; // ISO date-time string
  updatedAt: string; // ISO date-time string
  paidAt?: string; // ISO date-time string
}

export const REFUND_STATUSES = [
  "Requested",
  "Processing",
  "Completed",
  "Rejected",
] as const;

export type RefundStatus = (typeof REFUND_STATUSES)[number];

export interface Refund {
  id: string; // e.g. "REF-0001"
  organizationId: string; // e.g. "ORG-0001"

  bookingId: string; // references BookingOrder.id
  paymentId: string; // references Payment.id

  amount: number; // in INR (₹)
  reason: string; // min 10 characters

  status: RefundStatus;

  requestedAt: string; // ISO date-time string
  processedAt?: string; // ISO date-time string

  requestedBy: string; // Actor name e.g. "Admin Aarav"
}

export interface FinancialSummaryMetrics {
  totalRevenue: number; // Sum of Completed Payment txns - Completed Refund txns
  paidAmount: number; // Sum of Paid amounts on successful payments
  pendingAmount: number; // Sum of pending payment amounts
  refundedAmount: number; // Total completed refunds
  failedAmount: number; // Total failed payment transactions
  providerEarningsTotal: number; // Total net provider earnings (Accrued + Paid)
  deliveryPartnerEarningsTotal: number; // Total net delivery partner earnings (Accrued + Paid)
  platformRevenueTotal: number; // Service fees + Provider platform fees + Partner platform fees - Completed refunds
  totalTransactionsCount: number;
  pendingRefundsCount: number;
}

export interface ListTransactionsParams {
  organizationId: string;
  search?: string;
  type?: TransactionType | "all";
  status?: TransactionStatus | "all";
  paymentMethod?: PaymentMethod | "all";
  datePreset?: "all" | "today" | "yesterday" | "last_7_days" | "last_30_days";
  amountRange?: "all" | "under_500" | "500_999" | "1000_4999" | "5000_plus";
  sort?: "createdAt" | "amount" | "booking" | "type" | "status";
  sortDirection?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface ListTransactionsResult {
  transactions: Transaction[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface BookingFinancialDetailResult {
  booking: {
    id: string;
    bookingNumber: string;
    organizationId: string;
    serviceName: string;
    serviceCategory: string;
    scheduledAt: string;
    createdAt: string;
    status: string;
    subtotal: number;
    serviceFee: number;
    totalAmount: number;
    customerId: string;
    customerName: string;
    customerPhone: string;
    providerId: string;
    providerName: string;
    deliveryPartnerId?: string;
    deliveryPartnerName?: string;
  };
  payment: Payment | null;
  earnings: {
    providerEarnings: EarningsRecord | null;
    deliveryPartnerEarnings: EarningsRecord | null;
  };
  transactions: Transaction[];
  refunds: Refund[];
  remainingRefundableAmount: number;
}

export interface ProviderEarningsSummary {
  providerId: string;
  providerName: string;
  businessName?: string;
  organizationId: string;
  totalCompletedBookings: number;
  totalEarnings: number; // Net total (Accrued + Paid)
  pendingEarnings: number;
  accruedEarnings: number;
  paidEarnings: number;
  cancelledEarnings: number;
  records: EarningsRecord[];
}

export interface DeliveryPartnerEarningsSummary {
  partnerId: string;
  partnerName: string;
  vehicleType: string;
  vehicleNumber: string;
  organizationId: string;
  totalCompletedDeliveries: number;
  totalEarnings: number; // Net total (Accrued + Paid)
  pendingEarnings: number;
  accruedEarnings: number;
  paidEarnings: number;
  cancelledEarnings: number;
  records: EarningsRecord[];
}

export const CreateRefundSchema = z.object({
  paymentId: z.string().min(1, "Payment ID is required"),
  bookingId: z.string().min(1, "Booking ID is required"),
  amount: z.number().positive("Refund amount must be greater than ₹0"),
  reason: z.string().min(10, "Refund reason must be at least 10 characters"),
  requestedBy: z.string().default("Admin Console"),
});

export type CreateRefundFormValues = z.infer<typeof CreateRefundSchema>;
