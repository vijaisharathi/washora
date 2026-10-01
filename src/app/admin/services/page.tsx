import React, { Suspense } from "react";
import { Metadata } from "next";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { ServiceListMasterView } from "@/features/admin/services/components/ServiceListMasterView";

export const metadata: Metadata = {
  title: "Services Catalog — WASHORA Admin Console",
  description:
    "Enterprise service catalog directory, pricing management, operational durations, categorization, and lifecycle coordination.",
};

export default function AdminServicesPage() {
  return (
    <AdminShell headerTitle="Services Catalog">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[350px]">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
            <p className="text-xs text-on-surface-variant">Loading services catalog...</p>
          </div>
        }
      >
        <ServiceListMasterView />
      </Suspense>
    </AdminShell>
  );
}
