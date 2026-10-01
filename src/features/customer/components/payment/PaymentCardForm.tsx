"use client";

import React from "react";
import { CardFormData } from "@/types/customer/payment";
import { CreditCard, Lock } from "lucide-react";

interface PaymentCardFormProps {
  cardData: CardFormData;
  onChange: (field: keyof CardFormData, value: string) => void;
}

export function PaymentCardForm({ cardData, onChange }: PaymentCardFormProps) {
  const formatCardNumber = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 16);
    return raw.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiry = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      return `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    return raw;
  };

  return (
    <div className="p-5 rounded-2xl bg-surface-container border border-white/10 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2 text-primary">
          <CreditCard className="h-5 w-5" />
          <h4 className="font-bold text-sm text-on-surface">Card Details</h4>
        </div>

        <span className="text-[10px] text-on-surface-variant flex items-center gap-1">
          <Lock className="h-3 w-3 text-green-400" />
          <span>256-bit Encrypted</span>
        </span>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-on-surface-variant">Cardholder Name</label>
          <input
            type="text"
            value={cardData.cardHolder}
            onChange={(e) => onChange("cardHolder", e.target.value)}
            placeholder="e.g. Alex Mercer"
            className="w-full bg-surface-container-low border border-white/10 rounded-xl p-3 text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-on-surface-variant">Card Number</label>
          <input
            type="text"
            value={cardData.cardNumber}
            onChange={(e) => onChange("cardNumber", formatCardNumber(e.target.value))}
            placeholder="4532 •••• •••• 8921"
            className="w-full bg-surface-container-low border border-white/10 rounded-xl p-3 text-xs sm:text-sm text-on-surface font-mono placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant">Expiry (MM/YY)</label>
            <input
              type="text"
              value={cardData.expiry}
              onChange={(e) => onChange("expiry", formatExpiry(e.target.value))}
              placeholder="08/29"
              className="w-full bg-surface-container-low border border-white/10 rounded-xl p-3 text-xs sm:text-sm text-on-surface font-mono placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant">CVV</label>
            <input
              type="password"
              maxLength={4}
              value={cardData.cvv}
              onChange={(e) => onChange("cvv", e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="•••"
              className="w-full bg-surface-container-low border border-white/10 rounded-xl p-3 text-xs sm:text-sm text-on-surface font-mono placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
