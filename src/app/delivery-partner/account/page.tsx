import React from "react";
import { Metadata } from "next";
import { DeliveryPartnerShell } from "@/features/delivery-partner/components/DeliveryPartnerShell";
import { DeliveryPartnerSettingsMasterView } from "@/features/delivery-partner/settings/components/DeliveryPartnerSettingsMasterView";

export const metadata: Metadata = {
  title: "Valet Account | WASHORA Delivery Partner",
  description: "Valet account overview, security settings, and app preferences.",
};

export default function DeliveryPartnerAccountPage() {
  return (
    <DeliveryPartnerShell
      headerTitle="Valet Account Overview"
      headerSubtitle="D13 Account & Identity Configuration"
    >
      <DeliveryPartnerSettingsMasterView />
    </DeliveryPartnerShell>
  );
}
