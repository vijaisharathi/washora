"use client";

import React from "react";
import { ProviderShell } from "@/features/provider/components/ProviderShell";
import { ProviderPageHeader } from "@/features/provider/components/ProviderPageHeader";
import { ProviderPickupsCatalogView } from "@/features/provider/pickups/components/ProviderPickupsCatalogView";

export default function ProviderPickupsPage() {
  return (
    <ProviderShell headerTitle="Pickup &amp; Handover" headerSubtitle="Valet Logistics Coordination">
      <ProviderPageHeader
        title="Pickup &amp; Handover Management"
        description="Verify packaged garment readiness, track assigned valet dispatch partners, and securely authorize handoffs."
      />

      <ProviderPickupsCatalogView />
    </ProviderShell>
  );
}
