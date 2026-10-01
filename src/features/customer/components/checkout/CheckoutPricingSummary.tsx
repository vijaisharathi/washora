"use client";

import React from "react";
import { CheckoutPricing, AppliedCoupon } from "@/types/customer/checkout";
import { Button } from "@/components/ui/button";
import { Lock, ArrowRight, Tag } from "lucide-react";

interface CheckoutPricingSummaryProps {
  pricing: CheckoutPricing;
  appliedCoupon?: AppliedCoupon;
  onProceedToPayment: () => void;
}

export function CheckoutPricingSummary({
  pricing,
  appliedCoupon,
  onProceedToPayment,
}: CheckoutPricingSummaryProps) {
  return (
    <div className="bg-surface-container rounded-2xl border border-white/10 p-6 shadow-2xl space-y-5 sticky top-28">
      <h3 className="font-bold text-base text-on-surface font-headline border-b border-white/5 pb-3">
        Order Summary
      </h3>

      <div className="space-y-3 text-xs border-b border-white/5 pb-4">
        <div className="flex justify-between items-center text-on-surface-variant">
          <span>Subtotal</span>
          <span className="font-mono text-on-surface font-semibold">₹{pricing.subtotal}</span>
        </div>

        {appliedCoupon && (
          <div className="flex justify-between items-center text-green-400 font-semibold">
            <span className="flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" />
              <span>Coupon ({appliedCoupon.code})</span>
            </span>
            <span className="font-mono">-₹{appliedCoupon.discountAmount}</span>
          </div>
        )}

        <div className="flex justify-between items-center text-on-surface-variant">
          <span>Doorstep Pickup</span>
          <span className="font-mono text-green-400 font-semibold">FREE (₹0)</span>
        </div>

        <div className="flex justify-between items-center text-on-surface-variant">
          <span>Return Delivery</span>
          <span className="font-mono text-green-400 font-semibold">FREE (₹0)</span>
        </div>

        <div className="flex justify-between items-center text-on-surface-variant">
          <span>GST &amp; Fabric Insurance (5%)</span>
          <span className="font-mono text-on-surface">₹{pricing.taxes}</span>
        </div>
      </div>

      <div className="flex justify-between items-baseline pt-1">
        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
          Total Amount
        </span>
        <span className="text-2xl sm:text-3xl font-bold text-primary font-headline">
          ₹{pricing.total}
        </span>
      </div>

      <Button
        size="lg"
        onClick={onProceedToPayment}
        className="w-full gap-2 font-semibold text-base shadow-lg shadow-primary/20"
      >
        <span>Continue to Payment</span>
        <ArrowRight className="h-4 w-4" />
      </Button>

      <p className="text-center text-[11px] text-on-surface-variant flex items-center justify-center gap-1.5 pt-1">
        <Lock className="h-3 w-3 text-primary" />
        <span>Secure 256-bit Encrypted Checkout</span>
      </p>
    </div>
  );
}
