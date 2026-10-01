"use client";

import React, { useState } from "react";
import Link from "next/link";
import { OrderTrackingDetails } from "@/types/customer/orderLifecycle";
import { RefundBreakdownData, CancellationReasonOption } from "@/types/customer/cancellationReschedule";
import { Info, XCircle, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CancelOrderCardProps {
  order: OrderTrackingDetails;
  refundInfo?: RefundBreakdownData;
  reasons: CancellationReasonOption[];
  onConfirmCancel: (reason: string) => Promise<void>;
  isCancelling: boolean;
}

export function CancelOrderCard({
  order,
  refundInfo,
  reasons,
  onConfirmCancel,
  isCancelling,
}: CancelOrderCardProps) {
  const [selectedReason, setSelectedReason] = useState("");

  const handleCancelSubmit = async () => {
    await onConfirmCancel(selectedReason);
  };

  return (
    <main className="w-full max-w-[640px] mx-auto bg-surface-container rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
      {/* Header matching Stitch anything_clean_cancel_order_refund_information */}
      <header className="p-6 sm:p-8 border-b border-white/5 bg-surface-container-low flex flex-col gap-1.5">
        <h1 className="text-2xl sm:text-3xl font-bold text-on-surface font-headline">
          Cancel Order
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant">
          Review the cancellation details before confirming.
        </p>
      </header>

      <div className="p-6 sm:p-8 space-y-6">
        {/* Service Summary Strip */}
        <div className="flex items-center justify-between gap-4 p-4 bg-surface-container-highest/50 rounded-xl border border-white/5 shadow-inner">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-14 h-14 rounded-lg bg-surface-variant flex items-center justify-center text-primary shrink-0 bg-primary/10 border border-primary/20">
              <span className="material-symbols-outlined text-2xl">dry_cleaning</span>
            </div>
            <div className="space-y-0.5 min-w-0">
              <span className="font-bold text-sm text-on-surface block truncate">
                {order.serviceName}
              </span>
              <span className="text-xs text-on-surface-variant block truncate">
                {order.providerName}
              </span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="font-bold text-sm text-on-surface font-mono">
              ₹{order.totalAmount}
            </span>
            <span className="text-[11px] text-green-400 block font-semibold">Paid</span>
          </div>
        </div>

        {/* Policy Info Notice */}
        <div className="flex items-start gap-3 p-4 bg-surface-variant/40 rounded-xl border border-white/5 text-xs text-on-surface-variant">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {refundInfo?.policyNotice ||
              "Cancellation is available before pickup. Orders cancelled before pickup are eligible for a full refund."}
          </p>
        </div>

        {/* Refund Breakdown Card */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-on-surface font-headline">Refund Breakdown</h3>
          <div className="bg-surface-container-low rounded-xl border border-white/5 p-4 space-y-3 text-xs">
            <div className="flex justify-between items-center text-on-surface-variant">
              <span>Amount Paid</span>
              <span className="font-mono text-on-surface font-semibold">₹{refundInfo?.amountPaid || order.totalAmount}</span>
            </div>

            <div className="flex justify-between items-center border-b border-white/5 pb-2 text-green-400 font-bold">
              <span>Estimated Refund</span>
              <span className="font-mono text-sm">₹{refundInfo?.estimatedRefund || order.totalAmount}</span>
            </div>

            <div className="flex justify-between items-center text-on-surface-variant">
              <span>Refund Method</span>
              <span className="text-on-surface font-medium">{refundInfo?.refundMethod || "Original Payment Method"}</span>
            </div>

            <div className="flex justify-between items-center text-on-surface-variant">
              <span>Timeline</span>
              <span className="text-on-surface font-medium">{refundInfo?.timeline || "3–5 business days"}</span>
            </div>
          </div>
        </div>

        {/* Reason Dropdown */}
        <div className="space-y-2">
          <label htmlFor="cancel-reason" className="text-xs font-semibold text-on-surface block">
            Reason for cancellation <span className="text-on-surface-variant font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <select
              id="cancel-reason"
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full bg-surface-container-low border border-white/10 rounded-xl p-3.5 pr-10 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
            >
              <option value="">Select a reason...</option>
              {reasons.map((r) => (
                <option key={r.id} value={r.label} className="bg-surface-container text-on-surface">
                  {r.label}
                </option>
              ))}
            </select>
            <ChevronDown className="h-4 w-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Footer CTAs matching Stitch */}
      <footer className="p-6 sm:p-8 border-t border-white/5 bg-surface-container-low flex flex-col-reverse sm:flex-row justify-end gap-3">
        <Link href={`/customer/orders/${order.id}`} className="w-full sm:w-auto">
          <Button variant="outline" className="w-full text-xs font-semibold">
            Keep Order
          </Button>
        </Link>

        <Button
          onClick={handleCancelSubmit}
          disabled={isCancelling}
          className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white gap-2 text-xs font-bold shadow-lg shadow-red-600/20"
        >
          {isCancelling ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Cancelling...</span>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4" />
              <span>Cancel Order</span>
            </>
          )}
        </Button>
      </footer>
    </main>
  );
}
