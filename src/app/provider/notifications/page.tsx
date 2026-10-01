"use client";

import React from "react";
import { ProviderShell } from "@/features/provider/components/ProviderShell";
import { ProviderPageHeader } from "@/features/provider/components/ProviderPageHeader";
import { ProviderNotificationsCenterView } from "@/features/provider/notifications/components/ProviderNotificationsCenterView";

export default function ProviderNotificationsPage() {
  return (
    <ProviderShell headerTitle="Notifications" headerSubtitle="Studio Alerts &amp; Activity">
      <ProviderPageHeader
        title="Studio Notification Center"
        description="Stay updated on new client bookings, operational order stages, valet handovers, and settlement payout alerts."
      />

      <ProviderNotificationsCenterView />
    </ProviderShell>
  );
}
