import React, { Suspense } from "react";
import { Metadata } from "next";
import { DeliveryPartnerVerifyPhoneForm } from "@/features/delivery-partner/auth/components/DeliveryPartnerVerifyPhoneForm";

export const metadata: Metadata = {
  title: "Verify Phone | WASHORA Delivery Partner",
  description: "Verify your mobile phone with OTP for WASHORA delivery fleet registration.",
};

export default function DeliveryPartnerVerifyPhonePage() {
  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center p-4 md:p-8">
      <Suspense fallback={<div className="text-xs text-on-surface-variant">Loading verification form...</div>}>
        <DeliveryPartnerVerifyPhoneForm />
      </Suspense>
    </div>
  );
}
