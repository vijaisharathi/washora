"use client";

import React from "react";
import { Wallet, TrendingUp, ArrowUpRight, DollarSign, Calendar, Sparkles } from "lucide-react";
import { DeliveryPartnerEarningsSummary } from "@/types/delivery-partner";

interface EarningsHeroCardProps {
  summary: DeliveryPartnerEarningsSummary;
  onRequestCashout: () => void;
}

export function EarningsHeroCard({
  summary,
  onRequestCashout,
}: EarningsHeroCardProps) {
  return (
    <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-surface-container-high via-surface-container to-surface border border-outline-variant/30 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/20 pb-5">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
            Valet Financial Dashboard
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">
            Earnings & Payout Settlements
          </h1>
          <p className="text-xs text-on-surface-variant">
            Live wallet balance, trip earnings breakdowns, and automated daily settlements.
          </p>
        </div>

        <button
          onClick={onRequestCashout}
          disabled={summary.availableBalance < 100}
          className="px-6 py-3 rounded-2xl bg-emerald-500 text-black text-xs font-extrabold shadow-lg hover:bg-emerald-400 disabled:opacity-50 transition-all flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Wallet className="w-4 h-4" />
          <span>Request Instant Cashout</span>
        </button>
      </div>

      {/* 4-Metric Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        {/* Available Balance */}
        <div className="p-4 rounded-2xl bg-surface/80 border border-emerald-500/20 space-y-1">
          <span className="text-[10px] uppercase font-bold text-on-surface-variant flex items-center gap-1">
            <Wallet className="w-3 h-3 text-emerald-400" /> Available Balance
          </span>
          <p className="text-xl md:text-2xl font-mono font-extrabold text-emerald-400">
            ₹{summary.availableBalance}
          </p>
          <span className="text-[10px] text-on-surface-variant font-mono">Ready for withdrawal</span>
        </div>

        {/* Today's Earnings */}
        <div className="p-4 rounded-2xl bg-surface/80 border border-outline-variant/15 space-y-1">
          <span className="text-[10px] uppercase font-bold text-on-surface-variant flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-primary" /> Today&apos;s Earnings
          </span>
          <p className="text-xl md:text-2xl font-mono font-extrabold text-on-surface">
            ₹{summary.todayEarnings}
          </p>
          <span className="text-[10px] text-primary font-bold">+18% vs yesterday</span>
        </div>

        {/* This Week */}
        <div className="p-4 rounded-2xl bg-surface/80 border border-outline-variant/15 space-y-1">
          <span className="text-[10px] uppercase font-bold text-on-surface-variant flex items-center gap-1">
            <Calendar className="w-3 h-3 text-purple-400" /> This Week Total
          </span>
          <p className="text-xl md:text-2xl font-mono font-extrabold text-purple-300">
            ₹{summary.thisWeekEarnings}
          </p>
          <span className="text-[10px] text-on-surface-variant font-mono">31 completed trips</span>
        </div>

        {/* Lifetime Earnings */}
        <div className="p-4 rounded-2xl bg-surface/80 border border-outline-variant/15 space-y-1">
          <span className="text-[10px] uppercase font-bold text-on-surface-variant flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Lifetime Earned
          </span>
          <p className="text-xl md:text-2xl font-mono font-extrabold text-amber-400">
            ₹{summary.lifetimeEarnings}
          </p>
          <span className="text-[10px] text-on-surface-variant font-mono">100% payout track</span>
        </div>
      </div>
    </div>
  );
}
