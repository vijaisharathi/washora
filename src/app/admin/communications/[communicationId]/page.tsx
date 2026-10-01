import React, { Suspense } from "react";
import { Metadata } from "next";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { CommunicationDetailsMasterView } from "@/features/admin/communications/components/details/CommunicationDetailsMasterView";

interface AdminCommunicationDetailPageProps {
  params: {
    communicationId: string;
  };
}

export const metadata: Metadata = {
  title: "Communication Details — WASHORA Admin Console",
  description:
    "Detailed operational message record, recipient delivery list, and related entity context.",
};

export default function AdminCommunicationDetailPage({
  params,
}: AdminCommunicationDetailPageProps) {
  const { communicationId } = params;

  return (
    <AdminShell headerTitle="Communication Details">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[350px]">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
            <p className="text-xs text-on-surface-variant">Loading message details...</p>
          </div>
        }
      >
        <CommunicationDetailsMasterView communicationId={communicationId} />
      </Suspense>
    </AdminShell>
  );
}
