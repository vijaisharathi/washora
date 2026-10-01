import React from "react";
import { Metadata } from "next";
import { SupportTicketDetailsMasterView } from "@/features/admin/support/components/details/SupportTicketDetailsMasterView";

interface SupportTicketDetailPageProps {
  params: {
    ticketId: string;
  };
}

export const metadata: Metadata = {
  title: "Support Ticket Details | Admin Portal | WASHORA",
  description: "View, assign, resolve, and manage support ticket cases.",
};

export default function SupportTicketDetailPage({
  params,
}: SupportTicketDetailPageProps) {
  return <SupportTicketDetailsMasterView ticketId={params.ticketId} />;
}
