import React, { Suspense } from "react";
import { Metadata } from "next";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { ProviderListMasterView } from "@/features/admin/providers/components/ProviderListMasterView";

export const metadata: Metadata = {
  title: "Service Providers — WASHORA Admin Console",
  description: "Enterprise service provider directory, onboarding approval, operational coverage, and quality management.",
};

export default function AdminProvidersPage() {
  return (
    <AdminShell headerTitle="Service Providers Management">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[350px]">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
            <p className="text-xs text-on-surface-variant">Loading provider directory...</p>
          </div>
        }
      >
        <ProviderListMasterView />
      </Suspense>
    </AdminShell>
  );
}
