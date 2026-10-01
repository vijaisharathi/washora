"use client";

import React from "react";
import { ProviderShell } from "@/features/provider/components/ProviderShell";
import { ProviderPageHeader } from "@/features/provider/components/ProviderPageHeader";
import { ProviderAvailabilityView } from "@/features/provider/availability/components/ProviderAvailabilityView";

export default function ProviderScheduleAliasPage() {
  return (
    <ProviderShell headerTitle="Availability &amp; Shifts" headerSubtitle="Schedule Management">
      <ProviderPageHeader
        title="Availability &amp; Logistics Scheduling"
        description="Configure your weekly studio opening hours, valet collection windows, daily capacity caps, and holiday blackout dates."
      />

      <ProviderAvailabilityView />
    </ProviderShell>
  );
}
