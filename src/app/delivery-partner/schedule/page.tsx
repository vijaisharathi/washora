import React from "react";
import { Metadata } from "next";
import { DeliveryPartnerShell } from "@/features/delivery-partner/components/DeliveryPartnerShell";
import { DeliveryPartnerScheduleMasterView } from "@/features/delivery-partner/schedule/components/DeliveryPartnerScheduleMasterView";

export const metadata: Metadata = {
  title: "Shift Schedule & Route Sequence | WASHORA Delivery Partner",
  description: "Organize daily pickup and delivery stops, optimize route sequence, and manage dispatch time windows.",
};

export default function DeliveryPartnerSchedulePage() {
  return (
    <DeliveryPartnerShell
      headerTitle="Shift Schedule & Route Plan"
      headerSubtitle="D7 Delivery Sequencing & Day Agenda"
    >
      <DeliveryPartnerScheduleMasterView />
    </DeliveryPartnerShell>
  );
}
