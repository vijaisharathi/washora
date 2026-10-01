import React, { Suspense } from "react";
import { Metadata } from "next";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { CreateServiceMasterView } from "@/features/admin/services/components/forms/CreateServiceMasterView";

export const metadata: Metadata = {
  title: "Create New Service — WASHORA Admin Console",
  description:
    "Add a new operational service specification, pricing structure, duration, and categorization to the enterprise catalog.",
};

export default function AdminCreateServicePage() {
  return (
    <AdminShell headerTitle="Create Service">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[350px]">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
            <p className="text-xs text-on-surface-variant">Loading service creator...</p>
          </div>
        }
      >
        <CreateServiceMasterView />
      </Suspense>
    </AdminShell>
  );
}
