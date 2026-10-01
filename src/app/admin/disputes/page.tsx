import React from "react";
import { Metadata } from "next";
import { DisputesListMasterView } from "@/features/admin/disputes/components/DisputesListMasterView";

export const metadata: Metadata = {
  title: "Dispute Resolution | Admin Portal | WASHORA",
  description: "Investigate and resolve disputes across customers, merchants, and delivery partners.",
};

export default function DisputesPage() {
  return <DisputesListMasterView />;
}
