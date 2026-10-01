/**
 * Type definitions for WASHORA Service Provider Earnings & Payouts (P9)
 */

export interface ProviderEarningsSummary {
  providerId: string;
  todayEarnings: number;
  todayGrowthPercent: number;
  weekEarnings: number;
  monthEarnings: number;
  totalEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  paidOutAmount: number;
  completedOrdersCount: number;
  averageOrderValue: number;
}

export type TransactionType = "ORDER_EARNING" | "PAYOUT_WITHDRAWAL" | "ADJUSTMENT";
export type TransactionStatus = "COMPLETED" | "PENDING" | "FAILED";

export interface ProviderTransaction {
  id: string;
  transactionNumber: string; // e.g. "TXN-20260902-881"
  providerId: string;
  orderId?: string;
  orderNumber?: string;
  customerName?: string;
  serviceName?: string;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  type: TransactionType;
  status: TransactionStatus;
  createdAt: string;
}

export type PayoutStatus = "PAID" | "PROCESSING" | "PENDING" | "FAILED";

export interface ProviderPayoutRecord {
  id: string;
  payoutNumber: string; // e.g. "PO-20260901-44"
  providerId: string;
  amount: number;
  method: "DIRECT_BANK_TRANSFER" | "UPI_INSTANT";
  bankName: string;
  maskedAccount: string;
  periodLabel: string; // e.g. "Oct 16 - Oct 22"
  status: PayoutStatus;
  requestedAt: string;
  processedAt?: string;
}

export interface ProviderPayoutAccount {
  accountHolderName: string;
  bankName: string;
  accountNumberMasked: string; // e.g. "•••• •••• 4289"
  ifscCode: string;
  isVerified: boolean;
  payoutSchedule: "DAILY" | "WEEKLY_MONDAY" | "MONTHLY";
}

export interface WeeklyEarningsTrend {
  day: string; // "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"
  amount: number;
  date: string;
}

export interface RequestPayoutPayload {
  amount: number;
  notes?: string;
}

export interface UpdatePayoutAccountPayload {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
}
