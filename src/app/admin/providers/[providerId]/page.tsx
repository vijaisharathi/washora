import React, { Suspense } from "react";
import { Metadata } from "next";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { ProviderDetailsMasterView } from "@/features/admin/providers/components/details/ProviderDetailsMasterView";

interface AdminProviderDetailPageProps {
  params: {
    providerId: string;
  };
}

export const metadata: Metadata = {
  title: "Provider Profile — WASHORA Admin Console",
  description: "Detailed service partner profile, performance telemetry, catalog authorization, and status audit log.",
};

export default function AdminProviderDetailPage({
  params,
}: AdminProviderDetailPageProps) {
  const { providerId } = params;

  return (
    <AdminShell headerTitle="Provider Profile">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[350px]">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
            <p className="text-xs text-on-surface-variant">Loading provider profile...</p>
          </div>
        }
      >
        <ProviderDetailsMasterView providerId={providerId} />
      </Suspense>
    </AdminShell>
  );
}
