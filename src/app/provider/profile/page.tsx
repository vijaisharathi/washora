"use client";

import React from "react";
import { ProviderShell } from "@/features/provider/components/ProviderShell";
import { ProviderPageHeader } from "@/features/provider/components/ProviderPageHeader";
import { ProviderProfileOverview } from "@/features/provider/profile/components/ProviderProfileOverview";

export default function ProviderProfilePage() {
  return (
    <ProviderShell headerTitle="Studio Business Profile" headerSubtitle="Identity & Operations Setup">
      <ProviderPageHeader
        title="Studio Profile & Setup"
        description="Configure your verified business legal identity, storefront coordinates, operational shifts, and doorstep valet coverage zones."
      />

      <ProviderProfileOverview />
    </ProviderShell>
  );
}
