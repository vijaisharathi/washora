"use client";

import React from "react";
import Link from "next/link";
import { useOffersRewards } from "@/features/customer/hooks/useOffersRewards";
import { CouponCard } from "@/features/customer/components/offers-rewards/CouponCard";
import { CouponInputBar } from "@/features/customer/components/offers-rewards/CouponInputBar";
import { AppliedCouponBanner } from "@/features/customer/components/offers-rewards/AppliedCouponBanner";
import { OffersSkeleton } from "@/features/customer/components/offers-rewards/OffersSkeleton";
import { ArrowLeft, ArrowRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CustomerCouponsPage() {
  const {
    coupons,
    appliedCoupon,
    isLoading,
    applyCoupon,
    isApplying,
    applyError,
    removeCoupon,
    isRemoving,
  } = useOffersRewards();

  if (isLoading) {
    return <OffersSkeleton />;
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 pb-24 animate-in fade-in zoom-in-95 duration-200">
      {/* Top Header */}
      <div className="space-y-2">
        <Link
          href="/customer/offers"
          className="text-xs text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Offers &amp; Rewards</span>
        </Link>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface font-headline flex items-center gap-2">
            <Tag className="h-6 w-6 text-primary" />
            <span>Offers &amp; Coupons</span>
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Apply a promo code or select from available discounts below.
          </p>
        </div>
      </div>

      {/* Manual Coupon Input Bar matching Stitch anything_clean_coupon_discovery_selection */}
      <CouponInputBar
        onApply={async (code) => {
          await applyCoupon(code);
        }}
        isApplying={isApplying}
        errorMessage={applyError}
      />

      {/* Active Applied State */}
      {appliedCoupon && (
        <AppliedCouponBanner
          coupon={appliedCoupon}
          onRemove={removeCoupon}
          isRemoving={isRemoving}
        />
      )}

      {/* Available Coupons List */}
      <section className="space-y-4">
        <h3 className="font-bold text-base text-on-surface font-headline">
          Available Coupons for Your Booking
        </h3>

        <div className="space-y-3">
          {coupons.map((coupon) => (
            <CouponCard
              key={coupon.id}
              coupon={coupon}
              isApplied={appliedCoupon?.code === coupon.code}
              onApply={(code) => applyCoupon(code)}
              isApplying={isApplying}
            />
          ))}
        </div>
      </section>

      {/* Continue to Booking CTA */}
      <div className="flex justify-end pt-4 border-t border-white/5">
        <Link href="/customer/checkout">
          <Button size="lg" className="gap-2 text-xs font-bold shadow-lg shadow-primary/20">
            <span>Continue to Checkout</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </main>
  );
}
