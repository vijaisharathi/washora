"use client";

import React from "react";
import { QrCode, Smartphone } from "lucide-react";

interface PaymentUpiFormProps {
  upiId: string;
  onUpiIdChange: (v: string) => void;
}

export function PaymentUpiForm({ upiId, onUpiIdChange }: PaymentUpiFormProps) {
  return (
    <div className="p-5 rounded-2xl bg-surface-container border border-white/10 space-y-4 shadow-xl">
      <div className="flex items-center gap-2 text-primary border-b border-white/5 pb-3">
        <Smartphone className="h-5 w-5" />
        <h4 className="font-bold text-sm text-on-surface">Enter UPI Virtual Payment Address</h4>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-on-surface-variant">
            UPI ID / VPA
          </label>
          <input
            type="text"
            value={upiId}
            onChange={(e) => onUpiIdChange(e.target.value)}
            placeholder="e.g. mobile@okhdfcbank or username@upi"
            className="w-full bg-surface-container-low border border-white/10 rounded-xl p-3 text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <span className="text-[11px] text-on-surface-variant">Quick Fill:</span>
          <button
            type="button"
            onClick={() => onUpiIdChange("alex.care@okhdfcbank")}
            className="text-[11px] text-primary hover:underline font-mono"
          >
            alex.care@okhdfcbank
          </button>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-surface-container-low border border-white/5 flex items-center gap-3">
        <QrCode className="h-6 w-6 text-primary shrink-0" />
        <p className="text-[11px] text-on-surface-variant leading-relaxed">
          You can also accept the payment request notification on your UPI app (Google Pay, PhonePe, Paytm).
        </p>
      </div>
    </div>
  );
}
