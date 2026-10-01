"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useOrderTracking } from "@/features/customer/hooks/useOrderTracking";
import { useCancellationDetails } from "@/features/customer/hooks/useCancellationReschedule";
import { CancelOrderCard } from "@/features/customer/components/cancellation-reschedule/CancelOrderCard";
import { CancellationSuccessModal } from "@/features/customer/components/cancellation-reschedule/CancellationSuccessModal";
import { TrackingSkeleton } from "@/features/customer/components/tracking/TrackingSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";

export default function OrderCancelPage() {
  const params = useParams();
  const orderId = (params?.id as string) || "WSH-20260901-1024";

  const { data: order, isLoading: isOrderLoading, isError: isOrderError, refetch } =
    useOrderTracking(orderId);
  const {
    reasons,
    refundInfo,
    isLoading: isDetailsLoading,
    cancelOrder,
    isCancelling,
    cancelResult,
  } = useCancellationDetails(orderId);

  const [cancelled, setCancelled] = useState(false);

  if (isOrderLoading || isDetailsLoading) {
    return <TrackingSkeleton />;
  }

  if (isOrderError || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <ErrorState
          title="Could Not Load Order"
          message="We were unable to retrieve cancellation details for this order."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const handleConfirmCancel = async (reason: string) => {
    await cancelOrder({ orderId, reason });
    setCancelled(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <CancelOrderCard
        order={order}
        refundInfo={refundInfo}
        reasons={reasons}
        onConfirmCancel={handleConfirmCancel}
        isCancelling={isCancelling}
      />

      {(cancelled || cancelResult?.success) && (
        <CancellationSuccessModal orderId={order.orderNumber} />
      )}
    </div>
  );
}
