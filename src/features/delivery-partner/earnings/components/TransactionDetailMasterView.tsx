"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  PackageCheck,
  ChevronRight,
} from "lucide-react";
import { useDeliveryPartnerTransactionDetail } from "../hooks/useDeliveryPartnerEarnings";

interface TransactionDetailMasterViewProps {
  earningId: string;
}

export function TransactionDetailMasterView({ earningId }: TransactionDetailMasterViewProps) {
  const { transaction, isLoading, isError, error } = useDeliveryPartnerTransactionDetail(earningId);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="h-10 w-32 bg-surface-container rounded-xl animate-pulse" />
        <div className="h-64 rounded-3xl bg-surface-container animate-pulse" />
      </div>
    );
  }

  if (isError || !transaction) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-4 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-error/15 text-error flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-on-surface">Earning Record Not Found</h2>
          <p className="text-xs text-on-surface-variant">
            {error instanceof Error ? error.message : "The requested transaction does not exist or is unauthorized."}
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

        <span
          className={`text-xs font-bold px-3 py-1 rounded-full border ${
            transaction.status === "SETTLED"
              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
              : "bg-amber-500/15 text-amber-400 border-amber-500/30"
          }`}
        >
          {transaction.status.replace("_", " ")}
        </span>
      </div>

      {/* Main Earning Bento */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-surface-container-high via-surface-container to-surface border border-outline-variant/30 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/20 pb-5">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-primary bg-primary/15 px-2 py-0.5 rounded border border-primary/25">
              Trip Earning Breakdown
            </span>
            <h1 className="text-2xl font-extrabold text-on-surface font-mono">
              Order #{transaction.orderId}
            </h1>
            <p className="text-xs text-on-surface-variant">
              Customer: <span className="text-on-surface font-semibold">{transaction.customerName}</span> • {new Date(transaction.date).toLocaleDateString()}
            </p>
          </div>

          <div className="text-left sm:text-right p-3 rounded-2xl bg-surface-container-high/80 border border-outline-variant/20">
            <span className="text-2xl font-mono font-extrabold text-emerald-400">
              +₹{transaction.totalEarned}
            </span>
            <p className="text-[10px] text-on-surface-variant font-medium">Net Credited Pay</p>
          </div>
        </div>

        {/* Itemized Calculation Breakdown */}
        <div className="space-y-3 p-5 rounded-2xl bg-surface/80 border border-outline-variant/20 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant">Base Valet Fare</span>
            <span className="font-mono font-bold text-on-surface">₹{transaction.basePay}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant">Distance Coverage Allowance</span>
            <span className="font-mono font-bold text-on-surface">+₹{transaction.distancePay}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant">Peak Fuel Surge Incentive</span>
            <span className="font-mono font-bold text-emerald-400">+₹{transaction.fuelSurgeIncentive}</span>
          </div>

          {transaction.tipAmount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant">Customer Doorstep Gratuity / Tip</span>
              <span className="font-mono font-bold text-primary">+₹{transaction.tipAmount}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-outline-variant/20 font-bold text-sm">
            <span className="text-on-surface">Total Credited Earning</span>
            <span className="font-mono text-emerald-400 text-base">₹{transaction.totalEarned}</span>
          </div>
        </div>

        {/* Origin & Destination */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-surface border border-outline-variant/15 space-y-1">
            <span className="text-[9px] uppercase font-bold text-on-surface-variant flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-400" /> Origin
            </span>
            <p className="font-semibold text-on-surface truncate">{transaction.pickupAddress}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface border border-outline-variant/15 space-y-1">
            <span className="text-[9px] uppercase font-bold text-on-surface-variant flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-400" /> Destination
            </span>
            <p className="font-semibold text-on-surface truncate">{transaction.deliveryAddress}</p>
          </div>
        </div>

        {/* Linked Task Button */}
        <div className="flex items-center justify-between pt-2 border-t border-outline-variant/15 flex-wrap gap-2">
          <Link
            href={`/delivery-partner/tasks/${transaction.taskId}`}
            className="px-4 py-2 rounded-xl bg-surface border border-outline-variant/30 text-xs font-semibold text-on-surface hover:text-primary transition-colors flex items-center gap-1.5"
          >
            <span>View Associated Task #{transaction.orderId}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
