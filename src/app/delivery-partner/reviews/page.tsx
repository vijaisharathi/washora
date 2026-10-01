import React from "react";
import { Metadata } from "next";
import { DeliveryPartnerShell } from "@/features/delivery-partner/components/DeliveryPartnerShell";
import { DeliveryPartnerReviewsMasterView } from "@/features/delivery-partner/reviews/components/DeliveryPartnerReviewsMasterView";

export const metadata: Metadata = {
  title: "Ratings & Customer Reviews | WASHORA Delivery Partner",
  description: "Review customer doorstep ratings, 5-star distribution breakdown, service praise, and compliments.",
};

export default function DeliveryPartnerReviewsPage() {
  return (
    <DeliveryPartnerShell
      headerTitle="Ratings & Customer Feedback"
      headerSubtitle="D10 Doorstep Reviews & Service Recognition"
    >
      <DeliveryPartnerReviewsMasterView />
    </DeliveryPartnerShell>
  );
}
