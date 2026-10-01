"use client";

import React from "react";
import { ProviderShell } from "@/features/provider/components/ProviderShell";
import { ProviderPageHeader } from "@/features/provider/components/ProviderPageHeader";
import { ProviderOrdersCatalogView } from "@/features/provider/orders/components/ProviderOrdersCatalogView";

export default function ProviderOrdersPage() {
  return (
    <ProviderShell headerTitle="Care Processing Queue" headerSubtitle="Live Workshop Operations">
      <ProviderPageHeader
        title="Service Processing &amp; Workshop Operations"
        description="Inspect intake condition, track specialized hydrocarbon and steam cleaning stages, and complete quality assurance checklists."
      />

      <ProviderOrdersCatalogView />
    </ProviderShell>
  );
}
