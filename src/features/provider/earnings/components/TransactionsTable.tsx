"use client";

import React, { useState } from "react";
import { ProviderTransaction } from "@/types/provider/earnings";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

interface TransactionsTableProps {
  transactions: ProviderTransaction[];
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const [filterType, setFilterType] = useState<string>("ALL");

  const filtered = transactions.filter((txn) => {
    if (filterType === "ORDER" && txn.type !== "ORDER_EARNING") return false;
    if (filterType === "PAYOUT" && txn.type !== "PAYOUT_WITHDRAWAL") return false;
    return true;
  });

  return (
    <ProviderCard variant="container" className="p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div>
          <h3 className="text-lg font-bold text-on-surface">Recent Financial Transactions</h3>
          <p className="text-xs text-on-surface-variant">Detailed ledger of orders, commission fees, and net payouts</p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-surface-container-low p-1 rounded-xl border border-white/5 self-start">
          {["ALL", "ORDER", "PAYOUT"].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilterType(f)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterType === f
                  ? "bg-primary text-on-primary font-bold shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {f === "ALL" ? "All" : f === "ORDER" ? "Orders" : "Payouts"}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-white/5">
        {filtered.map((txn) => (
          <div
            key={txn.id}
            className="py-3.5 flex items-center justify-between gap-4 hover:bg-surface-container-low/50 px-2 rounded-xl transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary shrink-0 border border-white/5">
                <span className="material-symbols-outlined text-[18px]">
                  {txn.type === "ORDER_EARNING" ? "receipt_long" : "payments"}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-on-surface">
                    {txn.serviceName || txn.transactionNumber}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.2 rounded-full uppercase ${
                      txn.status === "COMPLETED"
                        ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-950/40 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {txn.status}
                  </span>
                </div>
                <div className="text-[11px] text-on-surface-variant mt-0.5">
                  <span>{txn.customerName ? `Customer: ${txn.customerName} • ` : ""}</span>
                  <span className="font-mono">{txn.orderNumber || txn.transactionNumber}</span>
                  <span> • {txn.createdAt}</span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-sm font-bold text-emerald-400 block">
                +₹{txn.netAmount}
              </span>
              <span className="text-[10px] text-on-surface-variant">
                Gross: ₹{txn.grossAmount} (Fee: -₹{txn.platformFee})
              </span>
            </div>
          </div>
        ))}
      </div>
    </ProviderCard>
  );
}
