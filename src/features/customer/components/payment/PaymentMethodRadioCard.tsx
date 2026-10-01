"use client";

import React from "react";
import { PaymentMethodOption, PaymentMethodId } from "@/types/customer/payment";
import { CheckCircle2 } from "lucide-react";

interface PaymentMethodRadioCardProps {
  option: PaymentMethodOption;
  selected: boolean;
  onSelect: (id: PaymentMethodId) => void;
}

export function PaymentMethodRadioCard({
  option,
  selected,
  onSelect,
}: PaymentMethodRadioCardProps) {
  return (
    <div
      onClick={() => onSelect(option.id)}
      className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 shadow-lg ${
        selected
          ? "bg-primary/10 border-2 border-primary shadow-primary/10"
          : "bg-surface-container border-white/10 hover:border-primary/40 hover:bg-surface-container-high"
      }`}
    >
      <div className="mt-0.5">
        {selected ? (
          <CheckCircle2 className="h-5 w-5 text-primary" />
        ) : (
          <div className="w-5 h-5 rounded-full border border-white/20" />
        )}
      </div>

      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-sm sm:text-base text-on-surface">
            {option.name}
          </span>
          {option.badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 uppercase tracking-wider">
              {option.badge}
            </span>
          )}
        </div>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          {option.description}
        </p>

        {option.id === "upi" && (
          <div className="flex gap-2 pt-2">
            <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-bold text-on-surface-variant">
              GPay
            </span>
            <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-bold text-on-surface-variant">
              PhonePe
            </span>
            <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-bold text-on-surface-variant">
              Paytm
            </span>
          </div>
        )}

        {option.id === "card" && (
          <div className="flex gap-2 pt-2">
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-bold text-on-surface-variant">
              VISA
            </span>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-bold text-on-surface-variant">
              Mastercard
            </span>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-bold text-on-surface-variant">
              RuPay
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
