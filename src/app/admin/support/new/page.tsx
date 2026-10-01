import React from "react";
import { Metadata } from "next";
import { CreateSupportTicketView } from "@/features/admin/support/components/create/CreateSupportTicketView";

export const metadata: Metadata = {
  title: "Create Support Ticket | Admin Portal | WASHORA",
  description: "Create and file a new operational support ticket.",
};

export default function CreateSupportTicketPage() {
  return <CreateSupportTicketView />;
}
