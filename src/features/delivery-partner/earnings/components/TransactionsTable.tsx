"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, ArrowUpRight, CheckCircle2, Clock } from "lucide-react";
import { DeliveryEarningTransaction } from "@/types/delivery-partner";

interface TransactionsTableProps {
  transactions: DeliveryEarningTransaction[];
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-on-surface-variant bg-surface-container/40 rounded-2xl border border-outline-variant/15">
        No delivery earning transactions found.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-outline-variant/20 overflow-hidden bg-surface-container/60 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-container-high/80 border-b border-outline-variant/20 text-on-surface-variant uppercase text-[10px] tracking-wider">
            <tr>
              <th className="py-3 px-4">Order / Trip</th>
              <th className="py-3 px-4">Type & Customer</th>
              <th className="py-3 px-4">Base + Fuel</th>
              <th className="py-3 px-4">Tip</th>
              <th className="py-3 px-4 font-bold text-on-surface">Total Earned</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/15">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-surface-container-high/40 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-on-surface">
                  #{tx.orderId}
                  <p className="text-[10px] text-on-surface-variant font-normal font-sans">
                    {new Date(tx.date).toLocaleDateString([], { month: "short", day: "numeric" })} • {new Date(tx.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </td>

                <td className="py-3 px-4">
                  <span className="font-semibold text-on-surface">{tx.customerName}</span>
                  <p className="text-[10px] text-on-surface-variant">{tx.taskType.replace(/_/g, " ")}</p>
                </td>

                <td className="py-3 px-4 font-mono">
                  ₹{tx.basePay + tx.fuelSurgeIncentive}
                  <span className="text-[10px] text-on-surface-variant block">(+{tx.distancePay} dist)</span>
                </td>

                <td className="py-3 px-4 font-mono text-emerald-400">
                  {tx.tipAmount > 0 ? `+₹${tx.tipAmount}` : "—"}
                </td>

                <td className="py-3 px-4 font-mono font-bold text-sm text-emerald-400">
                  +₹{tx.totalEarned}
                </td>

                <td className="py-3 px-4">
                  {tx.status === "SETTLED" ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1 w-fit">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Settled
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1 w-fit">
                      <Clock className="w-2.5 h-2.5" /> Pending
                    </span>
                  )}
                </td>

                <td className="py-3 px-4 text-right">
                  <Link
                    href={`/delivery-partner/earnings/${tx.id}`}
                    className="inline-flex items-center gap-1 text-primary hover:underline font-semibold"
                  >
                    <span>View</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
