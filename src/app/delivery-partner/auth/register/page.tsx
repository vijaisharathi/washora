import React from "react";
import { Metadata } from "next";
import { DeliveryPartnerRegisterForm } from "@/features/delivery-partner/auth/components/DeliveryPartnerRegisterForm";

export const metadata: Metadata = {
  title: "Join Fleet | WASHORA Delivery Partner",
  description: "Register as a valet logistics partner with WASHORA.",
};

export default function DeliveryPartnerRegisterPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center p-4 md:p-8">
      <DeliveryPartnerRegisterForm />
    </div>
  );
}
