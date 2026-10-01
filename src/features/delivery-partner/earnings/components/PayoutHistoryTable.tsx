"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, ChevronRight, Building2, ExternalLink } from "lucide-react";
import { PayoutRecord } from "@/types/delivery-partner";

interface PayoutHistoryTableProps {
  payouts: PayoutRecord[];
}

export function PayoutHistoryTable({ payouts }: PayoutHistoryTableProps) {
  if (payouts.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-on-surface-variant bg-surface-container/40 rounded-2xl border border-outline-variant/15">
        No settlement payouts processed yet.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-outline-variant/20 overflow-hidden bg-surface-container/60 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-container-high/80 border-b border-outline-variant/20 text-on-surface-variant uppercase text-[10px] tracking-wider">
            <tr>
              <th className="py-3 px-4">Payout Ref & UTR</th>
              <th className="py-3 px-4">Settlement Period</th>
              <th className="py-3 px-4">Method</th>
              <th className="py-3 px-4 font-bold text-on-surface">Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Statement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/15">
            {payouts.map((payout) => (
              <tr key={payout.id} className="hover:bg-surface-container-high/40 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-on-surface">
                  {payout.payoutReference}
                  <p className="text-[10px] text-on-surface-variant font-mono block">
                    UTR: {payout.utrNumber}
                  </p>
                </td>

                <td className="py-3 px-4">
                  <span className="font-semibold text-on-surface">{payout.periodCovered}</span>
                  <p className="text-[10px] text-on-surface-variant font-mono">
                    {new Date(payout.initiatedAt).toLocaleDateString()}
                  </p>
                </td>

                <td className="py-3 px-4 text-on-surface-variant">
                  <span className="font-mono text-xs">{payout.paymentMethod}</span>
                  <span className="text-[10px] block text-on-surface-variant">({payout.tripCount} trips)</span>
                </td>

                <td className="py-3 px-4 font-mono font-bold text-sm text-emerald-400">
                  ₹{payout.amount}
                </td>

                <td className="py-3 px-4">
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1 w-fit">
                    <CheckCircle2 className="w-2.5 h-2.5" /> {payout.status}
                  </span>
                </td>

                <td className="py-3 px-4 text-right">
                  <Link
                    href={`/delivery-partner/payouts/${payout.id}`}
                    className="inline-flex items-center gap-1 text-primary hover:underline font-semibold"
                  >
                    <span>Details</span>
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
