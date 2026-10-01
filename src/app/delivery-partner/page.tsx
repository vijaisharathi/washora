import React from "react";
import { Metadata } from "next";
import { DeliveryPartnerShell } from "@/features/delivery-partner/components/DeliveryPartnerShell";
import { DeliveryPartnerDashboardMasterView } from "@/features/delivery-partner/dashboard/components/DeliveryPartnerDashboardMasterView";

export const metadata: Metadata = {
  title: "Valet Dispatch Dashboard | WASHORA Delivery Partner",
  description: "Live logistics dispatch, active in-flight transit jobs, and quality SLA metrics.",
};

export default function DeliveryPartnerDashboardPage() {
  return (
    <DeliveryPartnerShell
      headerTitle="Valet Dispatch Command"
      headerSubtitle="Live Transit, Task Queue & Fleet Metrics"
    >
      <DeliveryPartnerDashboardMasterView />
    </DeliveryPartnerShell>
  );
}
