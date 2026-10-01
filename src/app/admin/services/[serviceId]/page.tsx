import React, { Suspense } from "react";
import { Metadata } from "next";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { ServiceDetailsMasterView } from "@/features/admin/services/components/details/ServiceDetailsMasterView";

interface AdminServiceDetailPageProps {
  params: {
    serviceId: string;
  };
}

export const metadata: Metadata = {
  title: "Service Specifications — WASHORA Admin Console",
  description:
    "Comprehensive service specifications, pricing breakdown, operational duration, and activity audit timeline.",
};

export default function AdminServiceDetailPage({
  params,
}: AdminServiceDetailPageProps) {
  const { serviceId } = params;

  return (
    <AdminShell headerTitle="Service Specifications">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[350px]">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
            <p className="text-xs text-on-surface-variant">Loading service specifications...</p>
          </div>
        }
      >
        <ServiceDetailsMasterView serviceId={serviceId} />
      </Suspense>
    </AdminShell>
  );
}
