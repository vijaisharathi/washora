import React from "react";
import { Metadata } from "next";
import { DeliveryPartnerShell } from "@/features/delivery-partner/components/DeliveryPartnerShell";
import { DeliveryPartnerHistoryMasterView } from "@/features/delivery-partner/history/components/DeliveryPartnerHistoryMasterView";

export const metadata: Metadata = {
  title: "Trip History & Delivery Archive | WASHORA Delivery Partner",
  description: "Review completed pickups, fulfilled customer deliveries, distance logs, and historical trip records.",
};

export default function DeliveryPartnerHistoryPage() {
  return (
    <DeliveryPartnerShell
      headerTitle="Valet Trip & Delivery History"
      headerSubtitle="D9 Historical Delivery Records & Archive"
    >
      <DeliveryPartnerHistoryMasterView />
    </DeliveryPartnerShell>
  );
}
