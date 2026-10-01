import React from "react";
import { Metadata } from "next";
import { DeliveryPartnerShell } from "@/features/delivery-partner/components/DeliveryPartnerShell";
import { DeliveryPartnerSupportMasterView } from "@/features/delivery-partner/support/components/DeliveryPartnerSupportMasterView";

export const metadata: Metadata = {
  title: "Valet Support & Help Desk | WASHORA Delivery Partner",
  description: "24/7 dedicated dispatch hotline, operational knowledgebase FAQs, and support ticket management.",
};

export default function DeliveryPartnerSupportPage() {
  return (
    <DeliveryPartnerShell
      headerTitle="Valet Support Desk"
      headerSubtitle="D12 Operational Help & Dispatch"
    >
      <DeliveryPartnerSupportMasterView />
    </DeliveryPartnerShell>
  );
}
