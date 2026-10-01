"use client";

import React from "react";
import { ProviderShell } from "@/features/provider/components/ProviderShell";
import { ProviderDashboardView } from "@/features/provider/dashboard/components/ProviderDashboardView";

export default function ProviderDashboardAliasPage() {
  return (
    <ProviderShell headerTitle="Partner Dashboard" headerSubtitle="Operations Hub">
      <ProviderDashboardView />
    </ProviderShell>
  );
}
