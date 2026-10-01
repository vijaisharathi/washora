import React, { Suspense } from "react";
import { Metadata } from "next";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { OperationsListMasterView } from "@/features/admin/operations/components/OperationsListMasterView";

export const metadata: Metadata = {
  title: "Operations & Assignments — WASHORA Admin Console",
  description:
    "Live operational triage workspace, provider and delivery valet assignments, workload balancing, and booking fulfillment coordination.",
};

export default function AdminOperationsPage() {
  return (
    <AdminShell headerTitle="Live Operations">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[350px]">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
            <p className="text-xs text-on-surface-variant">Loading operations workspace...</p>
          </div>
        }
      >
        <OperationsListMasterView />
      </Suspense>
    </AdminShell>
  );
}
