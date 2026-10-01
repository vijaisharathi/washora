"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Clock,
  CheckCircle2,
  Package,
  ShieldCheck,
  AlertCircle,
  XCircle,
  Check,
  CircleDot,
  DollarSign,
  ChevronRight,
} from "lucide-react";
import { useDeliveryPartnerHistoryDetail } from "../hooks/useDeliveryPartnerHistory";

interface HistoryDetailMasterViewProps {
  deliveryId: string;
}

export function HistoryDetailMasterView({ deliveryId }: HistoryDetailMasterViewProps) {
  const { record, isLoading, isError, error } = useDeliveryPartnerHistoryDetail(deliveryId);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="h-10 w-32 bg-surface-container rounded-xl animate-pulse" />
        <div className="h-64 rounded-3xl bg-surface-container animate-pulse" />
      </div>
    );
  }

  if (isError || !record) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-4 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-error/15 text-error flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-on-surface">Historical Record Not Found</h2>
          <p className="text-xs text-on-surface-variant">
            {error instanceof Error ? error.message : "The requested historical delivery was not found or unauthorized."}
          </p>
        </div>
        <Link
          href="/delivery-partner/history"
          className="px-5 py-2 rounded-xl bg-surface-container-highest text-xs font-semibold text-on-surface hover:text-primary transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Delivery History</span>
        </Link>
      </div>
    );
  }

  const isFailed = record.outcome === "FAILED" || record.outcome === "CANCELLED";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header & Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/delivery-partner/history"
          className="text-xs font-semibold text-on-surface-variant hover:text-on-surface flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Delivery History</span>
        </Link>

        <span
          className={`text-xs font-bold px-3 py-1 rounded-full border ${
            record.outcome === "DELIVERED"
              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
              : record.outcome === "PICKED_UP"
              ? "bg-primary/15 text-primary border-primary/30"
              : "bg-error/15 text-error border-error/30"
          }`}
        >
          {record.outcome}
        </span>
      </div>

      {/* Main Historical Bento */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-surface-container-high via-surface-container to-surface border border-outline-variant/30 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/20 pb-5">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-primary bg-primary/15 px-2 py-0.5 rounded border border-primary/25">
              Historical Fulfilled Trip
            </span>
            <h1 className="text-2xl font-extrabold text-on-surface font-mono">
              Order #{record.orderId}
            </h1>
            <p className="text-xs text-on-surface-variant">
              Customer: <span className="text-on-surface font-semibold">{record.customerName}</span> ({record.customerPhone})
            </p>
          </div>

          <div className="text-left sm:text-right p-3 rounded-2xl bg-surface-container-high/80 border border-outline-variant/20">
            <span className="text-2xl font-mono font-extrabold text-emerald-400">
              +₹{record.earnedAmount}
            </span>
            <p className="text-[10px] text-on-surface-variant font-medium">Credited Fare</p>
          </div>
        </div>

        {/* Failure / Exception Banner if any */}
        {isFailed && record.failureReason && (
          <div className="p-4 rounded-2xl bg-error/15 border border-error/30 text-xs text-error space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Trip Exception / Failure Reason:</span>
            </div>
            <p className="text-on-surface opacity-90 pl-5">{record.failureReason}</p>
          </div>
        )}

        {/* Verification & Security Record */}
        <div className="p-4 rounded-2xl bg-surface/80 border border-outline-variant/20 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-on-surface-variant flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verification Method
            </span>
            <p className="font-mono font-semibold text-on-surface">
              {record.verificationMethod || "Standard Supervisor Handover"}
            </p>
          </div>

          {record.securitySealCode && (
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Tamper Security Seal
              </span>
              <p className="font-mono font-semibold text-primary">{record.securitySealCode}</p>
            </div>
          )}
        </div>

        {/* Garment Items List */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-on-surface flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-primary" />
            <span>Garment Package Contents ({record.packageCount} items)</span>
          </h2>
          <div className="p-4 rounded-2xl bg-surface/80 border border-outline-variant/20 space-y-1.5 text-xs">
            {record.itemsList.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-on-surface">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Milestones */}
        <div className="space-y-3 pt-2 border-t border-outline-variant/15">
          <h2 className="text-xs font-bold text-on-surface flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>Trip Execution Milestones</span>
          </h2>
          <div className="space-y-2">
            {record.timeline.map((step) => (
              <div
                key={step.id}
                className="p-3 rounded-xl bg-surface/60 border border-outline-variant/15 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <p className="font-bold text-on-surface">{step.title}</p>
                    <p className="text-[11px] text-on-surface-variant">{step.description}</p>
                  </div>
                </div>
                {step.timestamp && (
                  <span className="font-mono text-[10px] text-on-surface-variant font-semibold">
                    {step.timestamp}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Link to Earnings */}
        <div className="pt-2 border-t border-outline-variant/15 flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="text-on-surface-variant">Archived record • Read-only</span>
          <Link
            href="/delivery-partner/earnings"
            className="text-primary hover:underline font-semibold flex items-center gap-1"
          >
            <span>View Payout Settlements</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
