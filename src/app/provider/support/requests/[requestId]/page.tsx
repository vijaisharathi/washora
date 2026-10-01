"use client";

import React from "react";
import { useParams } from "next/navigation";
import { ProviderShell } from "@/features/provider/components/ProviderShell";
import { SupportTicketDetailView } from "@/features/provider/support/components/SupportTicketDetailView";

export default function ProviderSupportRequestDetailPage() {
  const params = useParams();
  const requestId = params?.requestId as string;

  return (
    <ProviderShell headerTitle="Support Request" headerSubtitle="Operations Log">
      <SupportTicketDetailView ticketId={requestId} />
    </ProviderShell>
  );
}
