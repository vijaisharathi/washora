"use client";

import React from "react";
import {
  IndianRupee,
  TrendingUp,
  CheckCircle2,
  Clock,
  RotateCcw,
  Store,
  Bike,
  AlertOctagon,
} from "lucide-react";
import { FinancialSummaryMetrics } from "@/types/admin";

interface PaymentsSummaryCardsProps {
  metrics: FinancialSummaryMetrics | null;
  isLoading?: boolean;
}

export function PaymentsSummaryCards({
  metrics,
  isLoading,
}: PaymentsSummaryCardsProps) {
  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 my-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 animate-pulse space-y-2.5"
          >
            <div className="w-6 h-6 rounded-md bg-surface-container-high" />
            <div className="w-16 h-3 rounded bg-surface-container-high" />
            <div className="w-24 h-5 rounded bg-surface-container-high" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Revenue",
      value: `₹${metrics.totalRevenue.toLocaleString("en-IN")}`,
      subtitle: "Completed minus refunds",
      icon: TrendingUp,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Paid Collections",
      value: `₹${metrics.paidAmount.toLocaleString("en-IN")}`,
      subtitle: "Gross collected",
      icon: CheckCircle2,
      color: "text-primary",
      bgColor: "bg-primary/10 border-primary/20",
    },
    {
      title: "Pending Payments",
      value: `₹${metrics.pendingAmount.toLocaleString("en-IN")}`,
      subtitle: "Awaiting settlement",
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Refunded",
      value: `₹${metrics.refundedAmount.toLocaleString("en-IN")}`,
      subtitle: `${metrics.pendingRefundsCount} pending review`,
      icon: RotateCcw,
      color: "text-rose-500",
      bgColor: "bg-rose-500/10 border-rose-500/20",
    },
    {
      title: "Provider Earnings",
      value: `₹${metrics.providerEarningsTotal.toLocaleString("en-IN")}`,
      subtitle: "Net accrued + paid",
      icon: Store,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10 border-indigo-500/20",
    },
    {
      title: "Partner Earnings",
      value: `₹${metrics.deliveryPartnerEarningsTotal.toLocaleString("en-IN")}`,
      subtitle: "Valet delivery fees",
      icon: Bike,
      color: "text-sky-500",
      bgColor: "bg-sky-500/10 border-sky-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 my-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 hover:border-outline-variant/60 transition-all shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-on-surface-variant line-clamp-1">
                {card.title}
              </span>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center border ${card.bgColor}`}
              >
                <Icon className={`w-3.5 h-3.5 ${card.color}`} />
              </div>
            </div>
            <div>
              <div className="text-lg font-bold text-on-surface tracking-tight truncate">
                {card.value}
              </div>
              <div className="text-[10px] text-on-surface-variant/80 mt-0.5 truncate">
                {card.subtitle}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
