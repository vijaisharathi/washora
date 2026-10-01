import React, { Suspense } from "react";
import { Metadata } from "next";
import { DeliveryPartnerResetPasswordForm } from "@/features/delivery-partner/auth/components/DeliveryPartnerResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password | WASHORA Delivery Partner",
  description: "Set a new secure password for your delivery partner account.",
};

export default function DeliveryPartnerResetPasswordPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center p-4 md:p-8">
      <Suspense fallback={<div className="text-xs text-on-surface-variant">Loading reset form...</div>}>
        <DeliveryPartnerResetPasswordForm />
      </Suspense>
    </div>
  );
}
