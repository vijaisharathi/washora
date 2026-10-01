import React from "react";
import { Metadata } from "next";
import { DeliveryPartnerShell } from "@/features/delivery-partner/components/DeliveryPartnerShell";
import { DeliveryPartnerProfileMasterView } from "@/features/delivery-partner/profile/components/DeliveryPartnerProfileMasterView";

export const metadata: Metadata = {
  title: "Valet Profile & Vehicle Setup | WASHORA Delivery Partner",
  description: "Manage personal information, assigned vehicle assets, operating zone, and payout bank settings.",
};

export default function DeliveryPartnerProfilePage() {
  return (
    <DeliveryPartnerShell
      headerTitle="Valet Partner Profile & Vehicle Setup"
      headerSubtitle="D2 Identity, Transit Assets & Payout Settings"
    >
      <DeliveryPartnerProfileMasterView />
    </DeliveryPartnerShell>
  );
}
