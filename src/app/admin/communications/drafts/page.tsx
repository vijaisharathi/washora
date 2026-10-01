import React from "react";
import { Metadata } from "next";
import { DraftsListMasterView } from "@/features/admin/communications/components/drafts/DraftsListMasterView";

export const metadata: Metadata = {
  title: "Message Drafts | Admin Portal | WASHORA",
  description: "View, edit, resume, and manage internal operational message drafts.",
};

export default function DraftsPage() {
  return <DraftsListMasterView />;
}
