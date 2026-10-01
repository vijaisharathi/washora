"use client";

import React from "react";
import { useParams } from "next/navigation";
import { ProviderShell } from "@/features/provider/components/ProviderShell";
import { ProviderPickupDetailView } from "@/features/provider/pickups/components/ProviderPickupDetailView";

export default function ProviderHandoverDetailAliasPage() {
  const params = useParams();
  const handoverId = params?.handoverId as string;

  return (
    <ProviderShell headerTitle="Handoff Verification" headerSubtitle="Valet Dispatch SOP">
      <ProviderPickupDetailView pickupId={handoverId} />
    </ProviderShell>
  );
}
