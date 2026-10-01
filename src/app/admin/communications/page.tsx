import React, { Suspense } from "react";
import { Metadata } from "next";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { CommunicationsListMasterView } from "@/features/admin/communications/components/CommunicationsListMasterView";

export const metadata: Metadata = {
  title: "Communications & Broadcasts — WASHORA Admin Console",
  description:
    "Enterprise internal messaging, provider notifications, and valet dispatch communications.",
};

export default function AdminCommunicationsPage() {
  return (
    <AdminShell headerTitle="Communications">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[350px]">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
            <p className="text-xs text-on-surface-variant">Loading communications...</p>
          </div>
        }
      >
        <CommunicationsListMasterView />
      </Suspense>
    </AdminShell>
  );
}
