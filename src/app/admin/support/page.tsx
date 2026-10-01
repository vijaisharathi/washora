import React from "react";
import { Metadata } from "next";
import { SupportListMasterView } from "@/features/admin/support/components/SupportListMasterView";

export const metadata: Metadata = {
  title: "Support Tickets | Admin Portal | WASHORA",
  description: "Manage customer, merchant, and delivery partner support cases and operational inquiries.",
};

export default function SupportTicketsPage() {
  return <SupportListMasterView />;
}
