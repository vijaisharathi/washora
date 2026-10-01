"use client";

import React from "react";
import { ProviderShell } from "@/features/provider/components/ProviderShell";
import { ProviderPageHeader } from "@/features/provider/components/ProviderPageHeader";
import { ProviderEarningsOverview } from "@/features/provider/earnings/components/ProviderEarningsOverview";

export default function ProviderPayoutsPage() {
  return (
    <ProviderShell headerTitle="Earnings &amp; Payouts" headerSubtitle="Financial Performance">
      <ProviderPageHeader
        title="Earnings &amp; Settlement Ledger"
        description="Track net garment care revenue, platform fee deductions, weekly settlement schedules, and on-demand payout requests."
      />

      <ProviderEarningsOverview />
    </ProviderShell>
  );
}
