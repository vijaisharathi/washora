"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Building2,
  Calendar,
  AlertCircle,
  Clock,
  ShieldCheck,
  Receipt,
} from "lucide-react";
import { useDeliveryPartnerPayoutDetail } from "../hooks/useDeliveryPartnerEarnings";

interface PayoutDetailMasterViewProps {
  payoutId: string;
}

export function PayoutDetailMasterView({ payoutId }: PayoutDetailMasterViewProps) {
  const { payout, isLoading, isError, error } = useDeliveryPartnerPayoutDetail(payoutId);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="h-10 w-32 bg-surface-container rounded-xl animate-pulse" />
        <div className="h-64 rounded-3xl bg-surface-container animate-pulse" />
      </div>
    );
  }

  if (isError || !payout) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-4 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-error/15 text-error flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-on-surface">Payout Record Not Found</h2>
          <p className="text-xs text-on-surface-variant">
            {error instanceof Error ? error.message : "The requested payout settlement was not found."}
          </p>
        </div>
        <Link
          href="/delivery-partner/earnings"
          className="px-5 py-2 rounded-xl bg-surface-container-highest text-xs font-semibold text-on-surface hover:text-primary transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Earnings</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/delivery-partner/earnings"
          className="text-xs font-semibold text-on-surface-variant hover:text-on-surface flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Earnings & Payouts</span>
        </Link>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" /> {payout.status}
        </span>
      </div>

      {/* Main Statement Bento */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-surface-container-high via-surface-container to-surface border border-outline-variant/30 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/20 pb-5">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
              Settlement Statement
            </span>
            <h1 className="text-2xl font-extrabold text-on-surface font-mono">
              {payout.payoutReference}
            </h1>
            <p className="text-xs text-on-surface-variant">
              UTR Number: <span className="text-on-surface font-mono font-bold">{payout.utrNumber}</span>
            </p>
          </div>

          <div className="text-left sm:text-right p-3 rounded-2xl bg-surface-container-high/80 border border-outline-variant/20">
            <span className="text-2xl font-mono font-extrabold text-emerald-400">
              ₹{payout.amount}
            </span>
            <p className="text-[10px] text-on-surface-variant font-medium">Disbursed via Bank NEFT</p>
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="p-5 rounded-2xl bg-surface/80 border border-outline-variant/20 text-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant font-semibold">Settlement Period:</span>
            <span className="text-on-surface font-bold">{payout.periodCovered}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant font-semibold">Destination Payment Method:</span>
            <span className="font-mono text-on-surface font-semibold">{payout.paymentMethod}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant font-semibold">Processed Trips Count:</span>
            <span className="font-mono text-primary font-bold">{payout.tripCount} Completed Valet Runs</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant font-semibold">Disbursement Timestamp:</span>
            <span className="font-mono text-on-surface">
              {new Date(payout.initiatedAt).toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-outline-variant/20 font-bold text-sm">
            <span className="text-on-surface">Total Amount Settled</span>
            <span className="font-mono text-emerald-400 text-base">₹{payout.amount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
