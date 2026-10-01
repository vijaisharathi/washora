"use client";

import React from "react";
import { ProviderShell } from "@/features/provider/components/ProviderShell";
import { ProviderPageHeader } from "@/features/provider/components/ProviderPageHeader";
import { ProviderSettingsMasterView } from "@/features/provider/settings/components/ProviderSettingsMasterView";

export default function ProviderSettingsPage() {
  return (
    <ProviderShell headerTitle="Account &amp; Settings" headerSubtitle="Partner Administration">
      <ProviderPageHeader
        title="Studio Account &amp; Settings"
        description="Manage your partner credentials, change security passwords, configure auto-dispatch preferences, review active workstation sessions, and manage your account."
      />

      <ProviderSettingsMasterView />
    </ProviderShell>
  );
}
