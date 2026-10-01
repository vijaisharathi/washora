"use client";

import React from "react";
import { useParams } from "next/navigation";
import { ProviderShell } from "@/features/provider/components/ProviderShell";
import { ProviderPickupDetailView } from "@/features/provider/pickups/components/ProviderPickupDetailView";

export default function ProviderPickupDetailPage() {
  const params = useParams();
  const pickupId = params?.pickupId as string;

  return (
    <ProviderShell headerTitle="Handoff Verification" headerSubtitle="Valet Dispatch SOP">
      <ProviderPickupDetailView pickupId={pickupId} />
    </ProviderShell>
  );
}
