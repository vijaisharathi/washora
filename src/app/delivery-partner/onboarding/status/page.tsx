import React from "react";
import { Metadata } from "next";
import { DeliveryPartnerOnboardingStatusView } from "@/features/delivery-partner/onboarding/components/DeliveryPartnerOnboardingStatusView";

export const metadata: Metadata = {
  title: "KYC Verification Status | WASHORA Delivery Partner",
  description: "Track your real-time KYC compliance and background check status.",
};

export default function DeliveryPartnerOnboardingStatusPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface py-12 px-4 md:px-8">
      <DeliveryPartnerOnboardingStatusView />
    </div>
  );
}
