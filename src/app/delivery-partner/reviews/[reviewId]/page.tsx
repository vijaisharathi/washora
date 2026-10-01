import React from "react";
import { Metadata } from "next";
import { DeliveryPartnerShell } from "@/features/delivery-partner/components/DeliveryPartnerShell";
import { ReviewDetailMasterView } from "@/features/delivery-partner/reviews/components/ReviewDetailMasterView";

interface DeliveryPartnerReviewDetailPageProps {
  params: {
    reviewId: string;
  };
}

export async function generateMetadata({
  params,
}: DeliveryPartnerReviewDetailPageProps): Promise<Metadata> {
  return {
    title: `Customer Review #${params.reviewId} | WASHORA Delivery Partner`,
    description: "Detailed customer feedback, service badges, and linked historical delivery trip context.",
  };
}

export default function DeliveryPartnerReviewDetailPage({
  params,
}: DeliveryPartnerReviewDetailPageProps) {
  return (
    <DeliveryPartnerShell
      headerTitle="Customer Review & Rating"
      headerSubtitle={`Review ID: ${params.reviewId}`}
    >
      <ReviewDetailMasterView reviewId={params.reviewId} />
    </DeliveryPartnerShell>
  );
}
