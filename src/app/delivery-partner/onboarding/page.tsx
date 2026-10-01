import React from "react";
import { Metadata } from "next";
import { DeliveryPartnerOnboardingWizard } from "@/features/delivery-partner/onboarding/components/DeliveryPartnerOnboardingWizard";

export const metadata: Metadata = {
  title: "Partner Onboarding & KYC | WASHORA Delivery Partner",
  description: "Complete your 4-step registration and KYC verification for WASHORA delivery fleet.",
};

export default function DeliveryPartnerOnboardingPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface py-12 px-4 md:px-8">
      <DeliveryPartnerOnboardingWizard />
    </div>
  );
}
