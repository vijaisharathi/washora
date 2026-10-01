"use client";

import React from "react";
import { CouponItem } from "@/types/customer/offersRewards";
import { Tag, Check, Info, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CouponCardProps {
  coupon: CouponItem;
  isApplied: boolean;
  onApply: (code: string) => void;
  isApplying?: boolean;
}

export function CouponCard({
  coupon,
  isApplied,
  onApply,
  isApplying,
}: CouponCardProps) {
  return (
    <div
      className={`rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all border shadow-lg relative overflow-hidden group ${
        isApplied
          ? "bg-primary/10 border-primary shadow-primary/10"
          : !coupon.isEligible
          ? "bg-surface-container-low border-white/5 opacity-60"
          : "bg-surface-container border-white/10 hover:border-primary/40"
      }`}
    >
      <div className="flex gap-4 items-start min-w-0">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
            isApplied
              ? "bg-primary text-on-primary border-primary"
              : !coupon.isEligible
              ? "bg-surface-container text-on-surface-variant border-white/10"
              : "bg-surface-container-high text-primary border-white/10 shadow-inner"
          }`}
        >
          {isApplied ? (
            <Check className="h-6 w-6" />
          ) : !coupon.isEligible ? (
            <Lock className="h-5 w-5" />
          ) : (
            <Tag className="h-6 w-6" />
          )}
        </div>

        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`font-mono font-bold text-xs tracking-wider px-2 py-0.5 rounded ${
                isApplied
                  ? "bg-primary text-on-primary"
                  : !coupon.isEligible
                  ? "bg-surface-container text-on-surface-variant line-through"
                  : "bg-primary/10 text-primary border border-primary/20"
              }`}
            >
              {coupon.code}
            </span>
            <span className="text-xs font-bold text-on-surface bg-surface-container-high px-2 py-0.5 rounded border border-white/10">
              {coupon.discountBadge}
            </span>
          </div>

          <p className="text-xs text-on-surface-variant leading-relaxed">
            {coupon.description}
          </p>
          <p className="text-[10px] text-on-surface-variant/70">
            {coupon.expiryDate}
          </p>

          {!coupon.isEligible && coupon.ineligibilityReason && (
            <div className="flex items-center gap-1 text-[11px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md w-fit mt-1">
              <Info className="h-3 w-3" />
              <span>{coupon.ineligibilityReason}</span>
            </div>
          )}
        </div>
      </div>

      <div className="w-full sm:w-auto shrink-0">
        {isApplied ? (
          <span className="text-xs font-bold text-primary flex items-center gap-1 px-3 py-1.5 bg-primary/10 rounded-xl">
            <Check className="h-3.5 w-3.5" />
            <span>Applied</span>
          </span>
        ) : (
          <Button
            size="sm"
            variant="outline"
            disabled={!coupon.isEligible || isApplying}
            onClick={() => onApply(coupon.code)}
            className="w-full sm:w-auto text-xs font-bold text-primary border-primary/40 hover:bg-primary/10"
          >
            Apply
          </Button>
        )}
      </div>
    </div>
  );
}
