import React from "react";
import { Metadata } from "next";
import { DeliveryPartnerShell } from "@/features/delivery-partner/components/DeliveryPartnerShell";
import { DeliveryPartnerNotificationsMasterView } from "@/features/delivery-partner/notifications/components/DeliveryPartnerNotificationsMasterView";

export const metadata: Metadata = {
  title: "Alerts & Operational Dispatch | WASHORA Delivery Partner",
  description: "Review real-time task dispatches, pickup reminders, customer reviews, and payout notifications.",
};

export default function DeliveryPartnerNotificationsPage() {
  return (
    <DeliveryPartnerShell
      headerTitle="Valet Notification Center"
      headerSubtitle="D11 Dispatch Alerts & Messages"
    >
      <DeliveryPartnerNotificationsMasterView />
    </DeliveryPartnerShell>
  );
}
