import React from "react";
import { Metadata } from "next";
import { ComposeMessageView } from "@/features/admin/communications/components/compose/ComposeMessageView";

export const metadata: Metadata = {
  title: "Compose Message | Admin Portal | WASHORA",
  description: "Compose and dispatch internal and operational announcements and messages.",
};

export default function ComposeMessagePage() {
  return <ComposeMessageView />;
}
