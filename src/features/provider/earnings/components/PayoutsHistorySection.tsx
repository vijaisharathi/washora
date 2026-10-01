"use client";

import React from "react";
import { ProviderPayoutRecord } from "@/types/provider/earnings";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

interface PayoutsHistorySectionProps {
  payouts: ProviderPayoutRecord[];
}

export function PayoutsHistorySection({ payouts }: PayoutsHistorySectionProps) {
  return (
    <ProviderCard variant="container" className="p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h3 className="text-lg font-bold text-on-surface">Payout Settlement History</h3>
          <p className="text-xs text-on-surface-variant">Scheduled bank transfers and on-demand withdrawals</p>
        </div>
      </div>

      <div className="divide-y divide-white/5">
        {payouts.map((po) => (
          <div
            key={po.id}
            className="py-3.5 flex items-center justify-between gap-4 hover:bg-surface-container-low/50 px-2 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary shrink-0 border border-white/5">
                <span className="material-symbols-outlined text-[18px]">account_balance</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-on-surface">{po.periodLabel}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.2 rounded-full uppercase ${
                      po.status === "PAID"
                        ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/30"
                        : po.status === "PROCESSING"
                        ? "bg-purple-950/40 text-purple-300 border border-purple-500/30"
                        : "bg-amber-950/40 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {po.status}
                  </span>
                </div>
                <div className="text-[11px] text-on-surface-variant mt-0.5 font-mono">
                  <span>{po.payoutNumber} • {po.bankName} ({po.maskedAccount}) • Requested: {po.requestedAt}</span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-base font-bold text-on-surface block">₹{po.amount}</span>
              <span className="text-[10px] text-on-surface-variant">{po.method.replace(/_/g, " ")}</span>
            </div>
          </div>
        ))}
      </div>
    </ProviderCard>
  );
}
