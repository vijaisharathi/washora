"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useOrderConfirmation } from "@/features/customer/hooks/useOrderConfirmation";
import { ConfirmationHeader } from "@/features/customer/components/order-confirmation/ConfirmationHeader";
import { ConfirmationBookingPaymentCard } from "@/features/customer/components/order-confirmation/ConfirmationBookingPaymentCard";
import { ConfirmationServiceCard } from "@/features/customer/components/order-confirmation/ConfirmationServiceCard";
import { ConfirmationLogisticsCard } from "@/features/customer/components/order-confirmation/ConfirmationLogisticsCard";
import { ConfirmationActionButtons } from "@/features/customer/components/order-confirmation/ConfirmationActionButtons";
import { ConfirmationSkeleton } from "@/features/customer/components/order-confirmation/ConfirmationSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || undefined;

  const { data: confirmation, isLoading, isError, refetch } = useOrderConfirmation(orderId);

  if (isLoading) {
    return <ConfirmationSkeleton />;
  }

  if (isError || !confirmation) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <ErrorState
          title="Could Not Load Order Confirmation"
          message="We were unable to retrieve your booking confirmation details."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 animate-in fade-in zoom-in-95 duration-200">
      {/* Header with Glowing Badge matching Stitch anything_clean_order_confirmation */}
      <ConfirmationHeader />

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Booking ID & Payment Summary */}
        <ConfirmationBookingPaymentCard
          orderId={confirmation.orderId}
          transactionId={confirmation.transactionId}
          amountPaid={confirmation.amountPaid}
          paymentMethodLabel={confirmation.paymentMethodLabel}
        />

        {/* Service Details */}
        <ConfirmationServiceCard
          serviceName={confirmation.serviceName}
          variantName={confirmation.variantName}
          providerName={confirmation.providerName}
        />

        {/* Pickup Logistics & Turnaround (Spans 2 cols) */}
        <ConfirmationLogisticsCard
          pickupDateFormatted={confirmation.pickupDateFormatted}
          pickupTimeSlot={confirmation.pickupTimeSlot}
          addressFormatted={confirmation.addressFormatted}
          turnaroundEstimate={confirmation.turnaroundEstimate}
        />
      </div>

      {/* Action Buttons: Track Order & View Details */}
      <ConfirmationActionButtons orderId={confirmation.orderId} />
    </main>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<ConfirmationSkeleton />}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
