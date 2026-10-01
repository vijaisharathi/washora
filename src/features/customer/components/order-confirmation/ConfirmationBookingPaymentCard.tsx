"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface ConfirmationBookingPaymentCardProps {
  orderId: string;
  transactionId: string;
  amountPaid: number;
  paymentMethodLabel: string;
}

export function ConfirmationBookingPaymentCard({
  orderId,
  transactionId,
  amountPaid,
  paymentMethodLabel,
}: ConfirmationBookingPaymentCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-surface-container rounded-2xl border border-white/10 p-5 sm:p-6 flex flex-col justify-between gap-4 shadow-xl">
      <div className="space-y-1.5 pb-4 border-b border-white/5">
        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
          Booking Reference ID
        </span>
        <div className="flex items-center justify-between">
          <span className="font-mono font-bold text-base sm:text-lg text-primary">
            {orderId}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            title="Copy Booking ID"
            className="p-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors border border-white/5 cursor-pointer"
          >
            {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
          Payment Summary
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-base sm:text-lg font-bold text-green-400 font-mono">
            Paid ₹{amountPaid}
          </span>
          <span className="text-xs text-on-surface-variant">via {paymentMethodLabel}</span>
        </div>
        <span className="text-[11px] font-mono text-on-surface-variant/70 block">
          {transactionId}
        </span>
      </div>
    </div>
  );
}
