import {
  ProviderEarningsSummary,
  ProviderTransaction,
  ProviderPayoutRecord,
  ProviderPayoutAccount,
  WeeklyEarningsTrend,
  RequestPayoutPayload,
  UpdatePayoutAccountPayload,
} from "@/types/provider/earnings";
import {
  MOCK_PROVIDER_EARNINGS_SUMMARY,
  MOCK_WEEKLY_EARNINGS_TRENDS,
  MOCK_PROVIDER_TRANSACTIONS,
  MOCK_PROVIDER_PAYOUTS,
  MOCK_PROVIDER_PAYOUT_ACCOUNT,
} from "@/mocks/provider/earnings.mock";
import { providerApi } from "@/features/provider/api/providerApi";
import { isLiveMode } from "@/lib/api/mode";

const STORAGE_FINANCE_KEY = "washora_provider_finance_store";

interface StoredFinancialState {
  summary: ProviderEarningsSummary;
  transactions: ProviderTransaction[];
  payouts: ProviderPayoutRecord[];
  account: ProviderPayoutAccount;
}

let inMemoryFinance: StoredFinancialState = {
  summary: { ...MOCK_PROVIDER_EARNINGS_SUMMARY },
  transactions: [...MOCK_PROVIDER_TRANSACTIONS],
  payouts: [...MOCK_PROVIDER_PAYOUTS],
  account: { ...MOCK_PROVIDER_PAYOUT_ACCOUNT },
};

export interface IProviderEarningsService {
  getEarningsSummary(providerId?: string): Promise<ProviderEarningsSummary>;
  getWeeklyTrends(providerId?: string): Promise<WeeklyEarningsTrend[]>;
  getTransactions(providerId?: string): Promise<ProviderTransaction[]>;
  getPayouts(providerId?: string): Promise<ProviderPayoutRecord[]>;
  getPayoutAccount(providerId?: string): Promise<ProviderPayoutAccount>;
  requestPayout(payload: RequestPayoutPayload, providerId?: string): Promise<ProviderPayoutRecord>;
  updatePayoutAccount(
    payload: UpdatePayoutAccountPayload,
    providerId?: string
  ): Promise<ProviderPayoutAccount>;
}

class ProviderEarningsService implements IProviderEarningsService {
  private async loadStoredFinance(): Promise<StoredFinancialState> {
    if (typeof window === "undefined") return inMemoryFinance;
    try {
      const stored = localStorage.getItem(STORAGE_FINANCE_KEY);
      if (stored) {
        inMemoryFinance = JSON.parse(stored);
        return inMemoryFinance;
      }
    } catch {
      return inMemoryFinance;
    }
    return inMemoryFinance;
  }

  private persistFinance(state: StoredFinancialState): void {
    inMemoryFinance = state;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_FINANCE_KEY, JSON.stringify(state));
      } catch {
        // ignore
      }
    }
  }

  async getEarningsSummary(providerId: string = "prov-1"): Promise<ProviderEarningsSummary> {
    if (isLiveMode()) {
      const res = await providerApi.earnings.getSummary();
      const s = res.data;

      const totalEarnings = Number(s.totalEarnings || 0);
      const availableBalance = Number(s.availableBalance || 0);
      const pendingClearance = Number(s.pendingBalance || 0);
      const completedOrdersCount = Number(s.completedJobsCount || 0);
      const averageOrderEarning =
        completedOrdersCount > 0 ? Math.round(totalEarnings / completedOrdersCount) : 0;

      return {
        ...MOCK_PROVIDER_EARNINGS_SUMMARY,
        providerId,
        totalEarnings,
        availableBalance,
        pendingBalance: pendingClearance,
        completedOrdersCount,
        averageOrderValue: completedOrdersCount > 0 ? Math.round(totalEarnings / completedOrdersCount) : 0,
      };
    }

    await new Promise((res) => setTimeout(res, 50));
    const state = await this.loadStoredFinance();
    return state.summary;
  }

  async getWeeklyTrends(providerId: string = "prov-1"): Promise<WeeklyEarningsTrend[]> {
    await new Promise((res) => setTimeout(res, 50));
    return MOCK_WEEKLY_EARNINGS_TRENDS;
  }

  async getTransactions(providerId: string = "prov-1"): Promise<ProviderTransaction[]> {
    if (isLiveMode()) {
      const res = await providerApi.earnings.getEarnings();
      const raw = Array.isArray(res.data) ? res.data : (res as any).data?.items || [];

      return raw.map((item: any) => ({
        id: item.id,
        transactionNumber: `TXN-${item.id.slice(0, 8).toUpperCase()}`,
        providerId,
        orderId: item.orderId || item.bookingId,
        orderNumber: item.bookingNumber || `BK-${item.id.slice(0, 8).toUpperCase()}`,
        customerName: item.customerName || "Customer",
        serviceName: item.serviceName || "Garment Care Studio Processing",
        grossAmount: Number(item.grossAmount || 0),
        platformFee: Number(item.commissionAmount || 0),
        netAmount: Number(item.netEarning || 0),
        type: "ORDER_EARNING",
        status: (item.status === "CLEARED" || item.status === "PAID_OUT" ? "COMPLETED" : "PENDING") as ProviderTransaction["status"],
        createdAt: item.earnedAt || new Date().toISOString(),
      }));
    }

    await new Promise((res) => setTimeout(res, 50));
    const state = await this.loadStoredFinance();
    return state.transactions;
  }

  async getPayouts(providerId: string = "prov-1"): Promise<ProviderPayoutRecord[]> {
    await new Promise((res) => setTimeout(res, 50));
    const state = await this.loadStoredFinance();
    return state.payouts;
  }

  async getPayoutAccount(providerId: string = "prov-1"): Promise<ProviderPayoutAccount> {
    await new Promise((res) => setTimeout(res, 50));
    const state = await this.loadStoredFinance();
    return state.account;
  }

  async requestPayout(
    payload: RequestPayoutPayload,
    providerId: string = "prov-1"
  ): Promise<ProviderPayoutRecord> {
    await new Promise((res) => setTimeout(res, 300));
    const state = await this.loadStoredFinance();

    if (payload.amount > state.summary.availableBalance) {
      throw new Error("Requested payout exceeds your available settlement balance.");
    }

    const newPayout: ProviderPayoutRecord = {
      id: `payout_${Date.now()}`,
      payoutNumber: `PO-${Date.now().toString().slice(-6)}`,
      providerId,
      amount: payload.amount,
      method: "DIRECT_BANK_TRANSFER",
      bankName: state.account.bankName || "HDFC Bank",
      maskedAccount: state.account.accountNumberMasked || "•••• •••• 4289",
      periodLabel: "Current Cycle",
      status: "PROCESSING",
      requestedAt: new Date().toISOString(),
    };

    const updatedState: StoredFinancialState = {
      ...state,
      summary: {
        ...state.summary,
        availableBalance: state.summary.availableBalance - payload.amount,
      },
      payouts: [newPayout, ...state.payouts],
    };

    this.persistFinance(updatedState);
    return newPayout;
  }

  async updatePayoutAccount(
    payload: UpdatePayoutAccountPayload,
    providerId: string = "prov-1"
  ): Promise<ProviderPayoutAccount> {
    await new Promise((res) => setTimeout(res, 300));
    const state = await this.loadStoredFinance();

    const updatedAccount: ProviderPayoutAccount = {
      ...state.account,
      accountHolderName: payload.accountHolderName,
      bankName: payload.bankName,
      ifscCode: payload.ifscCode,
      accountNumberMasked: `•••• •••• ${payload.accountNumber.slice(-4)}`,
      isVerified: false,
    };

    this.persistFinance({ ...state, account: updatedAccount });
    return updatedAccount;
  }
}

export const providerEarningsService = new ProviderEarningsService();
