import React from "react";
import { Metadata } from "next";
import { DeliveryPartnerForgotPasswordForm } from "@/features/delivery-partner/auth/components/DeliveryPartnerForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password | WASHORA Delivery Partner",
  description: "Recover access to your WASHORA delivery partner portal.",
};

export default function DeliveryPartnerForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center p-4 md:p-8">
      <DeliveryPartnerForgotPasswordForm />
    </div>
  );
}
