"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useDisputesRefunds } from "@/features/customer/hooks/useDisputesRefunds";
import { DisputeClaimForm } from "@/features/customer/components/disputes-refunds/DisputeClaimForm";
import { DisputeStatusCard } from "@/features/customer/components/disputes-refunds/DisputeStatusCard";
import { DisputeSkeleton } from "@/features/customer/components/disputes-refunds/DisputeSkeleton";
import { DisputeClaimPayload, DisputeReasonType } from "@/types/customer/disputesRefunds";
import { ArrowLeft, ShieldAlert } from "lucide-react";

function DisputeClaimContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = (params?.id as string) || "WSH-20260901-1024";
  const categoryParam = (searchParams?.get("category") as DisputeReasonType) || "damaged_garment";

  const {
    receipt,
    reasons,
    existingDispute,
    isLoading,
    submitDispute,
    isSubmitting,
    submittedDispute,
  } = useDisputesRefunds(orderId);

  if (isLoading) {
    return <DisputeSkeleton />;
  }

  const activeDispute = submittedDispute || existingDispute;

  const handleSubmit = async (payload: DisputeClaimPayload) => {
    await submitDispute(payload);
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 pb-24 animate-in fade-in zoom-in-95 duration-200">
      {/* Top Breadcrumb */}
      <div className="space-y-2">
        <Link
          href={`/customer/orders/${orderId}`}
          className="text-xs text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Order Tracking</span>
        </Link>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface font-headline flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-red-400" />
            <span>Resolution &amp; Refund Request</span>
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            WASHORA Escrow Guarantee: Payments are protected until studio inspection standards are met.
          </p>
        </div>
      </div>

      {activeDispute ? (
        <DisputeStatusCard dispute={activeDispute} />
      ) : (
        <DisputeClaimForm
          orderId={orderId}
          reasons={reasons}
          totalAmount={receipt?.totalAmount || 502}
          initialReason={categoryParam}
          onSubmitDispute={handleSubmit}
          isSubmitting={isSubmitting}
          onCancel={() => window.history.back()}
        />
      )}
    </main>
  );
}

export default function OrderDisputePage() {
  return (
    <Suspense fallback={<DisputeSkeleton />}>
      <DisputeClaimContent />
    </Suspense>
  );
}
