"use client";

import React from "react";
import { ProviderShell } from "@/features/provider/components/ProviderShell";
import { ProviderPageHeader } from "@/features/provider/components/ProviderPageHeader";
import { ProviderSupportCenterView } from "@/features/provider/support/components/ProviderSupportCenterView";

export default function ProviderSupportPage() {
  return (
    <ProviderShell headerTitle="Support &amp; Help" headerSubtitle="Partner Operations Desk">
      <ProviderPageHeader
        title="Partner Help &amp; Support Center"
        description="Search garment care SOP guidelines, browse FAQs, or open a direct ticket with our partner operations desk."
      />

      <ProviderSupportCenterView />
    </ProviderShell>
  );
}
