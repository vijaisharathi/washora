import {
  DeliveryPartnerEarningsSummary,
  DeliveryEarningTransaction,
  PayoutRecord,
  RequestPayoutPayload,
  EarningStatus,
} from "@/types/delivery-partner";
import {
  MOCK_EARNINGS_SUMMARY,
  MOCK_DELIVERY_TRANSACTIONS,
  MOCK_PAYOUT_RECORDS,
} from "@/mocks/delivery-partner/earnings.mock";
import { deliveryPartnerAuthService } from "./deliveryPartnerAuthService";
import { deliveryPartnerApi } from "@/features/delivery-partner/api/deliveryPartnerApi";
import { isLiveMode } from "@/lib/api/mode";

const STORAGE_EARNINGS_KEY = "washora_delivery_partner_earnings_summary";
const STORAGE_TRANSACTIONS_KEY = "washora_delivery_partner_transactions";
const STORAGE_PAYOUTS_KEY = "washora_delivery_partner_payouts";

function mapBackendEarningToTransaction(e: any, partnerId: string): DeliveryEarningTransaction {
  const status: EarningStatus =
    e.status === "PAID"
      ? "SETTLED"
      : e.status === "PENDING"
        ? "PENDING_SETTLEMENT"
        : "PROCESSING";

  return {
    id: e.id,
    partnerId: e.partnerId || partnerId,
    taskId: e.deliveryJobId || `task-${e.id.slice(0, 8)}`,
    orderId: `ORD-${e.id.slice(0, 6).toUpperCase()}`,
    date: e.createdAt || new Date().toISOString(),
    taskType: "CUSTOMER_DELIVERY",
    basePay: Number(e.baseAmount || 50),
    distancePay: Number(e.distanceAmount || 25),
    fuelSurgeIncentive: 10,
    tipAmount: Number(e.tipAmount || 0),
    totalEarned: Number(e.netAmount || 85),
    status,
    payoutId: e.payoutBatchId,
    customerName: "Valued Customer",
    pickupAddress: "Indiranagar Hub #04",
    deliveryAddress: "Customer Doorstep, Indiranagar",
  };
}

export interface IDeliveryPartnerEarningsService {
  getEarningsSummary(): Promise<DeliveryPartnerEarningsSummary>;
  getTransactions(filter?: { status?: string; dateRange?: string }): Promise<DeliveryEarningTransaction[]>;
  getTransactionById(id: string): Promise<DeliveryEarningTransaction | null>;
  getPayouts(): Promise<PayoutRecord[]>;
  getPayoutById(id: string): Promise<PayoutRecord | null>;
  requestInstantPayout(payload: RequestPayoutPayload): Promise<{ success: boolean; payout: PayoutRecord }>;
}

class DeliveryPartnerEarningsService implements IDeliveryPartnerEarningsService {
  private memorySummary: DeliveryPartnerEarningsSummary | null = null;
  private memoryTransactions: DeliveryEarningTransaction[] | null = null;
  private memoryPayouts: PayoutRecord[] | null = null;

  private loadSummary(): DeliveryPartnerEarningsSummary {
    if (this.memorySummary) return this.memorySummary;
    if (typeof window !== "undefined") {
      try {
        const val = localStorage.getItem(STORAGE_EARNINGS_KEY);
        if (val) {
          this.memorySummary = JSON.parse(val);
          return this.memorySummary!;
        }
      } catch {
        // ignore
      }
    }
    this.memorySummary = { ...MOCK_EARNINGS_SUMMARY };
    return this.memorySummary;
  }

  private persistSummary(summary: DeliveryPartnerEarningsSummary) {
    this.memorySummary = summary;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_EARNINGS_KEY, JSON.stringify(summary));
      } catch {
        // ignore
      }
    }
  }

  private loadTransactions(): DeliveryEarningTransaction[] {
    if (this.memoryTransactions) return this.memoryTransactions;
    if (typeof window !== "undefined") {
      try {
        const val = localStorage.getItem(STORAGE_TRANSACTIONS_KEY);
        if (val) {
          this.memoryTransactions = JSON.parse(val);
          return this.memoryTransactions!;
        }
      } catch {
        // ignore
      }
    }
    this.memoryTransactions = [...MOCK_DELIVERY_TRANSACTIONS];
    return this.memoryTransactions;
  }

  private persistTransactions(txs: DeliveryEarningTransaction[]) {
    this.memoryTransactions = txs;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_TRANSACTIONS_KEY, JSON.stringify(txs));
      } catch {
        // ignore
      }
    }
  }

  private loadPayouts(): PayoutRecord[] {
    if (this.memoryPayouts) return this.memoryPayouts;
    if (typeof window !== "undefined") {
      try {
        const val = localStorage.getItem(STORAGE_PAYOUTS_KEY);
        if (val) {
          this.memoryPayouts = JSON.parse(val);
          return this.memoryPayouts!;
        }
      } catch {
        // ignore
      }
    }
    this.memoryPayouts = [...MOCK_PAYOUT_RECORDS];
    return this.memoryPayouts;
  }

  private persistPayouts(payouts: PayoutRecord[]) {
    this.memoryPayouts = payouts;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_PAYOUTS_KEY, JSON.stringify(payouts));
      } catch {
        // ignore
      }
    }
  }

  async getEarningsSummary(): Promise<DeliveryPartnerEarningsSummary> {
    if (isLiveMode()) {
      const session = await deliveryPartnerAuthService.getSession();
      const currentPartnerId = session.partner?.id || "dp-1";

      const [summaryRes, earningsRes] = await Promise.all([
        deliveryPartnerApi.earnings.getSummary(),
        deliveryPartnerApi.earnings.getEarnings({ limit: 10 }),
      ]);

      const s = summaryRes.data;
      const rawTxs: any[] = Array.isArray(earningsRes.data) ? earningsRes.data : [];
      const mappedTxs = rawTxs.map((e: any) => mapBackendEarningToTransaction(e, currentPartnerId));
      const payouts = this.loadPayouts().filter((p) => p.partnerId === currentPartnerId);

      const summary: DeliveryPartnerEarningsSummary = {
        availableBalance: Number(s.availableBalance || 0),
        todayEarnings: Number(s.todayEarnings || 0),
        thisWeekEarnings: Number(s.thisWeekEarnings || 0),
        thisMonthEarnings: Number(s.thisMonthEarnings || 0),
        lifetimeEarnings: Number(s.totalEarnings || 0),
        pendingSettlementAmount: Number(s.pendingSettlementAmount ?? s.pendingBalance ?? 0),
        totalSettledAmount: Number(s.settledAmount || 0),
        weeklyDailyBreakdown: [
          { day: "Mon", amount: 980, tripCount: 12 },
          { day: "Tue", amount: 1120, tripCount: 14 },
          { day: "Wed", amount: 890, tripCount: 11 },
          { day: "Thu", amount: 1240, tripCount: 15 },
          { day: "Fri", amount: 1450, tripCount: 17 },
          { day: "Sat", amount: 1680, tripCount: 19 },
          { day: "Sun", amount: 1290, tripCount: 15 },
        ],
        recentTransactions: mappedTxs,
        payoutHistory: payouts,
        paymentMethodSummary: {
          bankName: "HDFC Bank",
          accountNumberMasked: "•••• •••• •••• 0928",
          ifscCode: "HDFC0001234",
          upiIdMasked: "vikram.valet@••••",
          autoSettlementSchedule: "Every Monday 06:00 AM (Weekly Automated Cycle)",
        },
      };

      this.persistSummary(summary);
      return summary;
    }

    await new Promise((res) => setTimeout(res, 50));
    const session = await deliveryPartnerAuthService.getSession();
    const currentPartnerId = session.partner?.id || "dp-1";

    const summary = this.loadSummary();
    const transactions = this.loadTransactions().filter((t) => t.partnerId === currentPartnerId);
    const payouts = this.loadPayouts().filter((p) => p.partnerId === currentPartnerId);

    return {
      ...summary,
      recentTransactions: transactions,
      payoutHistory: payouts,
    };
  }

  async getTransactions(filter?: {
    status?: string;
    dateRange?: string;
  }): Promise<DeliveryEarningTransaction[]> {
    if (isLiveMode()) {
      const session = await deliveryPartnerAuthService.getSession();
      const currentPartnerId = session.partner?.id || "dp-1";

      const queryParams: Record<string, any> = {};
      if (filter?.status && filter.status !== "ALL") {
        queryParams.status = filter.status === "SETTLED" ? "PAID" : filter.status;
      }

      const res = await deliveryPartnerApi.earnings.getEarnings(queryParams);
      const items: any[] = Array.isArray(res.data) ? res.data : [];
      return items.map((e: any) => mapBackendEarningToTransaction(e, currentPartnerId));
    }

    await new Promise((res) => setTimeout(res, 50));
    const session = await deliveryPartnerAuthService.getSession();
    const currentPartnerId = session.partner?.id || "dp-1";

    let txs = this.loadTransactions().filter((t) => t.partnerId === currentPartnerId);

    if (filter?.status && filter.status !== "ALL") {
      txs = txs.filter((t) => t.status === filter.status);
    }

    return txs;
  }

  async getTransactionById(id: string): Promise<DeliveryEarningTransaction | null> {
    if (isLiveMode()) {
      const session = await deliveryPartnerAuthService.getSession();
      const currentPartnerId = session.partner?.id || "dp-1";

      try {
        const res = await deliveryPartnerApi.earnings.getEarningById(id);
        if (!res.data) return null;
        return mapBackendEarningToTransaction(res.data, currentPartnerId);
      } catch {
        return null;
      }
    }

    await new Promise((res) => setTimeout(res, 50));
    const session = await deliveryPartnerAuthService.getSession();
    const currentPartnerId = session.partner?.id || "dp-1";

    const txs = this.loadTransactions().filter((t) => t.partnerId === currentPartnerId);
    return txs.find((t) => t.id === id) || null;
  }

  async getPayouts(): Promise<PayoutRecord[]> {
    await new Promise((res) => setTimeout(res, 50));
    const session = await deliveryPartnerAuthService.getSession();
    const currentPartnerId = session.partner?.id || "dp-1";

    return this.loadPayouts().filter((p) => p.partnerId === currentPartnerId);
  }

  async getPayoutById(id: string): Promise<PayoutRecord | null> {
    await new Promise((res) => setTimeout(res, 50));
    const session = await deliveryPartnerAuthService.getSession();
    const currentPartnerId = session.partner?.id || "dp-1";

    const payouts = this.loadPayouts().filter((p) => p.partnerId === currentPartnerId);
    return payouts.find((p) => p.id === id) || null;
  }

  async requestInstantPayout(payload: RequestPayoutPayload): Promise<{ success: boolean; payout: PayoutRecord }> {
    await new Promise((res) => setTimeout(res, 120));
    const summary = this.loadSummary();

    if (payload.amount < 100) {
      throw new Error("Minimum payout cashout amount is ₹100.");
    }
    if (payload.amount > summary.availableBalance) {
      throw new Error(`Insufficient available balance. You can withdraw up to ₹${summary.availableBalance}.`);
    }

    const session = await deliveryPartnerAuthService.getSession();
    const currentPartnerId = session.partner?.id || "dp-1";

    const newPayout: PayoutRecord = {
      id: `payout-${Date.now()}`,
      partnerId: currentPartnerId,
      payoutReference: `WASH-PAY-${Date.now().toString().slice(-8)}`,
      utrNumber: `HDFC${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      amount: payload.amount,
      status: "COMPLETED",
      initiatedAt: new Date().toISOString(),
      settledAt: new Date().toISOString(),
      periodCovered: `Instant Valet On-Demand Cashout (${new Date().toLocaleDateString()})`,
      paymentMethod:
        payload.paymentMethodType === "UPI"
          ? `UPI Transfer (${summary.paymentMethodSummary.upiIdMasked})`
          : `Direct Bank Deposit (${summary.paymentMethodSummary.accountNumberMasked})`,
      tripCount: 3,
    };

    // Deduct from balance
    const updatedSummary: DeliveryPartnerEarningsSummary = {
      ...summary,
      availableBalance: summary.availableBalance - payload.amount,
      totalSettledAmount: summary.totalSettledAmount + payload.amount,
      payoutHistory: [newPayout, ...summary.payoutHistory],
    };

    const currentPayouts = this.loadPayouts();
    this.persistPayouts([newPayout, ...currentPayouts]);
    this.persistSummary(updatedSummary);

    return {
      success: true,
      payout: newPayout,
    };
  }
}

export const deliveryPartnerEarningsService = new DeliveryPartnerEarningsService();
