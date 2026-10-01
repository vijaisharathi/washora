"use client";

import React from "react";
import { useParams } from "next/navigation";
import { ProviderShell } from "@/features/provider/components/ProviderShell";
import { SupportTicketDetailView } from "@/features/provider/support/components/SupportTicketDetailView";

export default function ProviderSupportTicketDetailPage() {
  const params = useParams();
  const ticketId = params?.ticketId as string;

  return (
    <ProviderShell headerTitle="Support Request" headerSubtitle="Operations Log">
      <SupportTicketDetailView ticketId={ticketId} />
    </ProviderShell>
  );
}
