import React from "react";
import { Metadata } from "next";
import { DeliveryPartnerShell } from "@/features/delivery-partner/components/DeliveryPartnerShell";
import { DeliveryQueueMasterView } from "@/features/delivery-partner/deliveries/components/DeliveryQueueMasterView";

export const metadata: Metadata = {
  title: "Active Deliveries & Handover | WASHORA Delivery Partner",
  description: "Manage in-flight delivery routes, customer doorstep arrival, and OTP verified laundry bag handovers.",
};

export default function DeliveryPartnerDeliveriesPage() {
  return (
    <DeliveryPartnerShell
      headerTitle="Valet Active Deliveries"
      headerSubtitle="D6 Customer Dropoff & Handover Management"
    >
      <DeliveryQueueMasterView />
    </DeliveryPartnerShell>
  );
}
