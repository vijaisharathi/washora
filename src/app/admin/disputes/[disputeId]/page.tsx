import React from "react";
import { Metadata } from "next";
import { DisputeDetailsMasterView } from "@/features/admin/disputes/components/details/DisputeDetailsMasterView";

interface DisputeDetailPageProps {
  params: {
    disputeId: string;
  };
}

export const metadata: Metadata = {
  title: "Dispute Case Details | Admin Portal | WASHORA",
  description: "View dispute claims, audit evidence, record decisions, and finalize dispute resolutions.",
};

export default function DisputeDetailPage({
  params,
}: DisputeDetailPageProps) {
  return <DisputeDetailsMasterView disputeId={params.disputeId} />;
}
