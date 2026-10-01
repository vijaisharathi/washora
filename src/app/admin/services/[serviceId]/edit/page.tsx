import React, { Suspense } from "react";
import { Metadata } from "next";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { EditServiceMasterView } from "@/features/admin/services/components/forms/EditServiceMasterView";

interface AdminEditServicePageProps {
  params: {
    serviceId: string;
  };
}

export const metadata: Metadata = {
  title: "Edit Service Specifications — WASHORA Admin Console",
  description:
    "Modify catalog service specifications, pricing structure, duration, and descriptions.",
};

export default function AdminEditServicePage({
  params,
}: AdminEditServicePageProps) {
  const { serviceId } = params;

  return (
    <AdminShell headerTitle="Edit Service">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[350px]">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
            <p className="text-xs text-on-surface-variant">Loading service editor...</p>
          </div>
        }
      >
        <EditServiceMasterView serviceId={serviceId} />
      </Suspense>
    </AdminShell>
  );
}
