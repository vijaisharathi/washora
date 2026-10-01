"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useOrderTracking } from "@/features/customer/hooks/useOrderTracking";
import { TrackingHeader } from "@/features/customer/components/tracking/TrackingHeader";
import { TrackingTimeline } from "@/features/customer/components/tracking/TrackingTimeline";
import { TrackingCurrentActionCard } from "@/features/customer/components/tracking/TrackingCurrentActionCard";
import { TrackingProviderCard } from "@/features/customer/components/tracking/TrackingProviderCard";
import { TrackingSupportBanner } from "@/features/customer/components/tracking/TrackingSupportBanner";
import { TrackingSkeleton } from "@/features/customer/components/tracking/TrackingSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = (params?.id as string) || "WSH-20260901-1024";

  const { data: order, isLoading, isError, refetch } = useOrderTracking(orderId);

  if (isLoading) {
    return <TrackingSkeleton />;
  }

  if (isError || !order) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <ErrorState
          title="Could Not Load Order Lifecycle"
          message="We were unable to retrieve the live tracking status for this order."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 pb-20 animate-in fade-in zoom-in-95 duration-200">
      {/* Top Header matching Stitch anything_clean_live_order_tracking_scheduled */}
      <TrackingHeader
        orderNumber={order.orderNumber}
        statusLabel={order.statusLabel}
        canReschedule={order.canReschedule}
        canCancel={order.canCancel}
      />

      {/* 12-Column Grid Split matching Stitch */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Status Timeline (4 cols) */}
        <div className="lg:col-span-4">
          <TrackingTimeline timeline={order.timeline} />
        </div>

        {/* Right Column: Details & Provider Cards (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Current Action Needed Card */}
          <TrackingCurrentActionCard
            pickupWindow={order.pickupWindow}
            addressLine1={order.pickupAddressLine1}
            addressLine2={order.pickupAddressLine2}
          />

          {/* Assigned Care Studio Card */}
          <TrackingProviderCard
            providerName={order.providerName}
            providerRating={order.providerRating}
            providerReviewCount={order.providerReviewCount}
            providerImageUrl={order.providerImageUrl}
          />

          {/* Support and Assistance CTA Banner */}
          <TrackingSupportBanner />
        </div>
      </div>
    </main>
  );
}
