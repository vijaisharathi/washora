"use client";

import React, { useState } from "react";
import { AppliedCoupon } from "@/types/customer/checkout";
import { Tag, CheckCircle2, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CheckoutCouponCardProps {
  appliedCoupon?: AppliedCoupon;
  onApplyCoupon: (code: string) => Promise<void>;
  onRemoveCoupon: () => void;
  isApplying: boolean;
  error?: string | null;
}

export function CheckoutCouponCard({
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  isApplying,
  error,
}: CheckoutCouponCardProps) {
  const [inputCode, setInputCode] = useState("");

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim()) {
      await onApplyCoupon(inputCode.trim());
      setInputCode("");
    }
  };

  return (
    <div className="bg-surface-container rounded-2xl border border-white/10 p-5 sm:p-6 shadow-xl space-y-4">
      <div className="flex items-center gap-2 text-primary border-b border-white/5 pb-3">
        <Tag className="h-5 w-5" />
        <h3 className="font-bold text-base text-on-surface font-headline">Offers &amp; Promo Code</h3>
      </div>

      {appliedCoupon ? (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-green-500/10 border border-green-500/20 text-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
            <div>
              <span className="font-bold text-green-400">{appliedCoupon.code}</span>
              <p className="text-[11px] text-on-surface-variant">{appliedCoupon.description}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onRemoveCoupon}
            className="text-on-surface-variant hover:text-red-400 p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleApply} className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon (e.g. FRESH20, WASHORA50)"
              className="flex-1 bg-surface-container-low border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant/50 uppercase font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
            <Button
              type="submit"
              size="sm"
              disabled={isApplying || !inputCode.trim()}
              className="font-semibold text-xs px-4"
            >
              {isApplying ? "Applying..." : "Apply"}
            </Button>
          </div>

          {error && (
            <p className="text-[11px] text-red-400 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </p>
          )}

          <div className="flex gap-2 pt-1 flex-wrap text-[11px] text-on-surface-variant">
            <span>Available:</span>
            <button
              type="button"
              onClick={() => onApplyCoupon("FRESH20")}
              className="text-primary hover:underline font-mono font-bold"
            >
              FRESH20 (20% OFF)
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => onApplyCoupon("WASHORA50")}
              className="text-primary hover:underline font-mono font-bold"
            >
              WASHORA50 (₹50 OFF)
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
