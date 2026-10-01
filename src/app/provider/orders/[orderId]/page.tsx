"use client";

import React from "react";
import { useParams } from "next/navigation";
import { ProviderShell } from "@/features/provider/components/ProviderShell";
import { ProviderOrderDetailView } from "@/features/provider/orders/components/ProviderOrderDetailView";

export default function ProviderOrderDetailPage() {
  const params = useParams();
  const orderId = params?.orderId as string;

  return (
    <ProviderShell headerTitle="Service Processing Checklist" headerSubtitle="Live Workshop SOP">
      <ProviderOrderDetailView orderId={orderId} />
    </ProviderShell>
  );
}
