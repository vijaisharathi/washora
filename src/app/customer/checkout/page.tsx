"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCheckout } from "@/features/customer/hooks/useCheckout";
import { AppliedCoupon } from "@/types/customer/checkout";
import { CheckoutHeader } from "@/features/customer/components/checkout/CheckoutHeader";
import { CheckoutServiceCard } from "@/features/customer/components/checkout/CheckoutServiceCard";
import { CheckoutScheduleCard } from "@/features/customer/components/checkout/CheckoutScheduleCard";
import { CheckoutAddressCard } from "@/features/customer/components/checkout/CheckoutAddressCard";
import { CheckoutCouponCard } from "@/features/customer/components/checkout/CheckoutCouponCard";
import { CheckoutPricingSummary } from "@/features/customer/components/checkout/CheckoutPricingSummary";
import { CheckoutSkeleton } from "@/features/customer/components/checkout/CheckoutSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";

export default function CustomerCheckoutPage() {
  const router = useRouter();
  const {
    summary,
    isLoading,
    isError,
    refetch,
    applyCoupon,
    isApplyingCoupon,
    removeCoupon,
    calculatePricing,
  } = useCheckout();

  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | undefined>(undefined);
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    if (summary?.appliedCoupon && !appliedCoupon) {
      setAppliedCoupon(summary.appliedCoupon);
    }
  }, [summary?.appliedCoupon, appliedCoupon]);

  if (isLoading || !summary) {
    return <CheckoutSkeleton />;
  }

  if (isError || !summary.draft) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <ErrorState
          title="Could Not Load Checkout"
          message="We were unable to retrieve your order and booking draft."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const subtotal = summary.draft.estimatedServiceTotal || 449;
  const currentPricing = calculatePricing(subtotal, appliedCoupon);

  const handleApplyCoupon = async (code: string) => {
    try {
      setCouponError(null);
      const res = await applyCoupon({ code, subtotal });
      setAppliedCoupon(res);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setCouponError(err.message);
      } else {
        setCouponError("Failed to apply promo code");
      }
    }
  };

  const handleRemoveCoupon = async () => {
    await removeCoupon();
    setAppliedCoupon(undefined);
    setCouponError(null);
  };

  const handleProceedToPayment = () => {
    router.push("/customer/payment");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 pb-20">
      {/* Top Header & Progress matching Stitch anything_clean_checkout_overview */}
      <CheckoutHeader />

      {/* Main 12-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column Review Cards (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Service Details Card */}
          <CheckoutServiceCard draft={summary.draft} />

          {/* Pickup Schedule Card */}
          <CheckoutScheduleCard draft={summary.draft} />

          {/* Pickup Address Card */}
          <CheckoutAddressCard draft={summary.draft} />

          {/* Coupon & Offers Card */}
          <CheckoutCouponCard
            appliedCoupon={appliedCoupon}
            onApplyCoupon={handleApplyCoupon}
            onRemoveCoupon={handleRemoveCoupon}
            isApplying={isApplyingCoupon}
            error={couponError}
          />
        </div>

        {/* Right Column: Sticky Order Summary (4 cols) */}
        <div className="lg:col-span-4">
          <CheckoutPricingSummary
            pricing={currentPricing}
            appliedCoupon={appliedCoupon}
            onProceedToPayment={handleProceedToPayment}
          />
        </div>
      </div>
    </div>
  );
}
