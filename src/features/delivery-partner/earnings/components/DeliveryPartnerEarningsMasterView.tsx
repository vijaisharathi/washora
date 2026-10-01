"use client";

import React, { useState } from "react";
import {
  Wallet,
  Building2,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Layers,
  Calendar,
  History,
} from "lucide-react";
import {
  useDeliveryPartnerEarningsSummary,
  useDeliveryPartnerInstantCashout,
} from "../hooks/useDeliveryPartnerEarnings";
import { EarningsHeroCard } from "./EarningsHeroCard";
import { WeeklyEarningsChart } from "./WeeklyEarningsChart";
import { BankSettlementCard } from "./BankSettlementCard";
import { TransactionsTable } from "./TransactionsTable";
import { PayoutHistoryTable } from "./PayoutHistoryTable";
import { RequestPayoutModal } from "./RequestPayoutModal";

export function DeliveryPartnerEarningsMasterView() {
  const { summary, isLoading, isError, error, refetch } = useDeliveryPartnerEarningsSummary();
  const { requestCashout, isRequesting } = useDeliveryPartnerInstantCashout();

  const [activeTab, setActiveTab] = useState<"TRANSACTIONS" | "PAYOUTS">("TRANSACTIONS");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "SETTLED" | "PENDING_SETTLEMENT">("ALL");
  const [cashoutModalOpen, setCashoutModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="h-64 rounded-3xl bg-surface-container animate-pulse border border-outline-variant/20" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-48 rounded-3xl bg-surface-container animate-pulse border border-outline-variant/20" />
          <div className="h-48 rounded-3xl bg-surface-container animate-pulse border border-outline-variant/20" />
        </div>
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <div className="p-8 rounded-3xl bg-surface-container/70 border border-error/30 text-center space-y-3 max-w-lg mx-auto">
        <div className="w-10 h-10 rounded-2xl bg-error/15 text-error flex items-center justify-center mx-auto">
          <AlertCircle className="w-5 h-5" />
        </div>
        <p className="text-sm font-bold text-on-surface">Failed to load earnings summary</p>
        <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
          {error instanceof Error ? error.message : "Financial service unavailable."}
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 flex items-center gap-1.5 mx-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const filteredTransactions = summary.recentTransactions.filter((tx) => {
    if (filterStatus === "ALL") return true;
    return tx.status === filterStatus;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Earnings Hero */}
      <EarningsHeroCard
        summary={summary}
        onRequestCashout={() => setCashoutModalOpen(true)}
      />

      {/* Chart & Bank Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WeeklyEarningsChart data={summary.weeklyDailyBreakdown} />
        <BankSettlementCard paymentMethod={summary.paymentMethodSummary} />
      </div>

      {/* Tabs Bar: Delivery Trips vs Payout History */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-outline-variant/15 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("TRANSACTIONS")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "TRANSACTIONS"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Trip Earnings ({summary.recentTransactions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("PAYOUTS")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "PAYOUTS"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Settlement History ({summary.payoutHistory.length})</span>
          </button>
        </div>

        {/* Status Filter for Transactions */}
        {activeTab === "TRANSACTIONS" && (
          <div className="flex items-center gap-1 bg-surface-container/70 p-1 rounded-xl border border-outline-variant/20 text-xs">
            {(["ALL", "SETTLED", "PENDING_SETTLEMENT"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  filterStatus === st
                    ? "bg-surface text-on-surface border border-outline-variant/30 shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {st === "ALL" ? "All" : st === "SETTLED" ? "Settled" : "Pending"}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tab Panels */}
      {activeTab === "TRANSACTIONS" && (
        <TransactionsTable transactions={filteredTransactions} />
      )}

      {activeTab === "PAYOUTS" && (
        <PayoutHistoryTable payouts={summary.payoutHistory} />
      )}

      {/* Cashout Modal */}
      <RequestPayoutModal
        availableBalance={summary.availableBalance}
        bankMasked={summary.paymentMethodSummary.accountNumberMasked}
        upiMasked={summary.paymentMethodSummary.upiIdMasked}
        isOpen={cashoutModalOpen}
        onClose={() => setCashoutModalOpen(false)}
        onSubmit={requestCashout}
        isSubmitting={isRequesting}
      />
    </div>
  );
}
