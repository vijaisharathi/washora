"use client";

import React from "react";
import { ProviderEarningsSummary } from "@/types/provider/earnings";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

interface EarningsSummaryBentoProps {
  summary: ProviderEarningsSummary;
  onRequestPayoutClick: () => void;
}

export function EarningsSummaryBento({
  summary,
  onRequestPayoutClick,
}: EarningsSummaryBentoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Today's Earnings (Featured Card) */}
      <ProviderCard
        variant="container"
        className="p-6 relative overflow-hidden group border-l-4 border-l-primary flex flex-col justify-between"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-25 transition-opacity pointer-events-none">
          <span className="material-symbols-outlined text-7xl text-primary">payments</span>
        </div>

        <div>
          <span className="text-xs font-semibold text-on-surface-variant block mb-1">
            Today&apos;s Studio Earnings
          </span>
          <h3 className="text-3xl font-extrabold text-primary mb-2">₹{summary.todayEarnings}</h3>
          <div className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-500/30">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            <span>+{summary.todayGrowthPercent}% vs yesterday</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-on-surface-variant">
          <span>Completed Units: {summary.completedOrdersCount}</span>
          <span>Avg Ticket: ₹{summary.averageOrderValue}</span>
        </div>
      </ProviderCard>

      {/* Available Balance / On-Demand Payout Card */}
      <ProviderCard variant="container" className="p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-on-surface-variant">Available for Payout</span>
            <span className="material-symbols-outlined text-primary text-[20px]">account_balance_wallet</span>
          </div>
          <h3 className="text-3xl font-extrabold text-on-surface mb-1">₹{summary.availableBalance}</h3>
          <p className="text-[11px] text-on-surface-variant">
            Pending Escrow Clearance: <strong className="text-on-surface">₹{summary.pendingBalance}</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={onRequestPayoutClick}
          className="w-full mt-4 bg-primary text-on-primary py-2.5 rounded-xl shadow-md shadow-primary/20 hover:bg-primary/90 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">payments</span>
          <span>Request Payout</span>
        </button>
      </ProviderCard>

      {/* Cycle Totals (Week + Month + Total) */}
      <ProviderCard variant="container" className="p-6 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1">
            <span>This Week (Payout Mon)</span>
            <span className="font-bold text-on-surface">₹{summary.weekEarnings}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1">
            <span>This Month Cycle</span>
            <span className="font-bold text-on-surface">₹{summary.monthEarnings}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-on-surface-variant">
            <span>Lifetime Paid Out</span>
            <span className="font-bold text-emerald-400">₹{summary.paidOutAmount}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
          <span className="text-on-surface-variant">Total Gross Volume</span>
          <span className="font-extrabold text-primary text-sm">₹{summary.totalEarnings}</span>
        </div>
      </ProviderCard>
    </div>
  );
}
