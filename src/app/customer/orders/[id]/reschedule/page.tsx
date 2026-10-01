"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useOrderTracking } from "@/features/customer/hooks/useOrderTracking";
import { useRescheduleDetails } from "@/features/customer/hooks/useCancellationReschedule";
import { RescheduleOrderCard } from "@/features/customer/components/cancellation-reschedule/RescheduleOrderCard";
import { RescheduleSuccessModal } from "@/features/customer/components/cancellation-reschedule/RescheduleSuccessModal";
import { TrackingSkeleton } from "@/features/customer/components/tracking/TrackingSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";

export default function OrderReschedulePage() {
  const params = useParams();
  const orderId = (params?.id as string) || "WSH-20260901-1024";

  const { data: order, isLoading: isOrderLoading, isError: isOrderError, refetch } =
    useOrderTracking(orderId);
  const {
    dates,
    slots,
    isLoading: isDetailsLoading,
    rescheduleOrder,
    isRescheduling,
    rescheduleResult,
  } = useRescheduleDetails(orderId);

  const [rescheduledSchedule, setRescheduledSchedule] = useState<string | null>(null);

  if (isOrderLoading || isDetailsLoading) {
    return <TrackingSkeleton />;
  }

  if (isOrderError || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <ErrorState
          title="Could Not Load Order"
          message="We were unable to retrieve rescheduling availability for this order."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const handleConfirmReschedule = async (dateFormatted: string, timeSlot: string) => {
    const res = await rescheduleOrder({
      orderId,
      newDateFormatted: dateFormatted,
      newTimeSlot: timeSlot,
    });
    setRescheduledSchedule(res.newSchedule);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <RescheduleOrderCard
        order={order}
        dates={dates}
        slots={slots}
        onConfirmReschedule={handleConfirmReschedule}
        isRescheduling={isRescheduling}
      />

      {(rescheduledSchedule || rescheduleResult?.success) && (
        <RescheduleSuccessModal
          orderId={order.orderNumber}
          newSchedule={rescheduledSchedule || `${dates[0]?.dateFormatted}, 12:00 PM – 2:00 PM`}
        />
      )}
    </div>
  );
}
