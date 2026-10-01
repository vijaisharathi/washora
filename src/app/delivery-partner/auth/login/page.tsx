import React from "react";
import { Metadata } from "next";
import { DeliveryPartnerLoginForm } from "@/features/delivery-partner/auth/components/DeliveryPartnerLoginForm";

export const metadata: Metadata = {
  title: "Valet Login | WASHORA Delivery Partner",
  description: "Sign in to your WASHORA delivery partner logistics and dispatch portal.",
};

export default function DeliveryPartnerLoginPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center p-4 md:p-8">
      <DeliveryPartnerLoginForm />
    </div>
  );
}
