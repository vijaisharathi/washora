import React from "react";
import { Metadata } from "next";
import { DeliveryPartnerShell } from "@/features/delivery-partner/components/DeliveryPartnerShell";
import { SupportTicketDetailMasterView } from "@/features/delivery-partner/support/components/SupportTicketDetailMasterView";

interface SupportTicketDetailPageProps {
  params: {
    ticketId: string;
  };
}

export async function generateMetadata({
  params,
}: SupportTicketDetailPageProps): Promise<Metadata> {
  return {
    title: `Ticket #${params.ticketId} | WASHORA Delivery Partner`,
    description: "Support ticket timeline, operational dispatch conversation thread, and resolution notes.",
  };
}

export default function SupportTicketDetailPage({
  params,
}: SupportTicketDetailPageProps) {
  return (
    <DeliveryPartnerShell
      headerTitle="Support Ticket Detail"
      headerSubtitle={`Ticket ID: ${params.ticketId}`}
    >
      <SupportTicketDetailMasterView ticketId={params.ticketId} />
    </DeliveryPartnerShell>
  );
}
