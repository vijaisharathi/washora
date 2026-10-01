import React from "react";
import { Metadata } from "next";
import { DeliveryPartnerShell } from "@/features/delivery-partner/components/DeliveryPartnerShell";
import { PickupQueueMasterView } from "@/features/delivery-partner/pickup/components/PickupQueueMasterView";

export const metadata: Metadata = {
  title: "Doorstep Pickup Queue | WASHORA Delivery Partner",
  description: "Review pending pickup runs, customer addresses, and execute garment collection workflows.",
};

export default function DeliveryPartnerPickupQueuePage() {
  return (
    <DeliveryPartnerShell
      headerTitle="Valet Pickup Queue"
      headerSubtitle="D5 Doorstep Pickup & Custody Verification"
    >
      <PickupQueueMasterView />
    </DeliveryPartnerShell>
  );
}
