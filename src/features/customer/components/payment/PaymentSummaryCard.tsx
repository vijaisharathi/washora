"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Lock, ArrowRight, Loader2 } from "lucide-react";

interface PaymentSummaryCardProps {
  amount: number;
  serviceName?: string;
  subtotal: number;
  taxes: number;
  isProcessing: boolean;
  onPay: () => void;
}

export function PaymentSummaryCard({
  amount,
  serviceName = "Deep Cleaning Care",
  subtotal,
  taxes,
  isProcessing,
  onPay,
}: PaymentSummaryCardProps) {
  return (
    <div className="bg-surface-container rounded-2xl border border-white/10 overflow-hidden shadow-2xl sticky top-28">
      {/* Top Banner with Large Amount Display matching Stitch */}
      <div className="p-6 border-b border-white/5 bg-surface-container-high/60 space-y-2">
        <h3 className="font-bold text-base text-on-surface font-headline">Amount to Pay</h3>
        <div className="text-3xl sm:text-4xl font-bold text-primary font-headline flex items-baseline gap-1">
          <span className="text-xl sm:text-2xl font-normal">₹</span>
          <span>{amount}</span>
        </div>
      </div>

      {/* Breakdown */}
      <div className="p-6 border-b border-white/5 space-y-3 text-xs">
        <h4 className="font-bold text-on-surface-variant uppercase tracking-wider text-[11px]">
          Order Summary
        </h4>
        <div className="flex justify-between items-center text-on-surface">
          <span className="text-on-surface-variant truncate pr-2">{serviceName}</span>
          <span className="font-mono font-semibold shrink-0">₹{subtotal}</span>
        </div>
        <div className="flex justify-between items-center text-on-surface">
          <span className="text-on-surface-variant">Taxes &amp; Fees (5% GST)</span>
          <span className="font-mono font-semibold shrink-0">₹{taxes}</span>
        </div>
      </div>

      {/* Total & Action Button */}
      <div className="p-6 bg-surface-container-highest/20 space-y-4">
        <div className="flex justify-between items-center font-bold text-sm text-on-surface">
          <span>Total</span>
          <span className="text-lg text-primary font-mono">₹{amount}</span>
        </div>

        <Button
          size="lg"
          onClick={onPay}
          disabled={isProcessing}
          className="w-full gap-2 font-semibold text-base shadow-lg shadow-primary/20"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Processing Payment...</span>
            </>
          ) : (
            <>
              <span>Pay ₹{amount}</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>

        <p className="text-center text-[11px] text-on-surface-variant flex items-center justify-center gap-1.5 pt-1">
          <Lock className="h-3 w-3 text-green-400" />
          <span>Secure 256-bit Encrypted Checkout</span>
        </p>
      </div>
    </div>
  );
}
