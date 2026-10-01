import React, { Suspense } from "react";
import { Metadata } from "next";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { DeliveryPartnerDetailsMasterView } from "@/features/admin/delivery-partners/components/details/DeliveryPartnerDetailsMasterView";

interface AdminDeliveryPartnerDetailPageProps {
  params: {
    partnerId: string;
  };
}

export const metadata: Metadata = {
  title: "Delivery Partner Profile — WASHORA Admin Console",
  description: "Detailed delivery partner profile, vehicle telemetry, operational hub coverage, and status audit log.",
};

export default function AdminDeliveryPartnerDetailPage({
  params,
}: AdminDeliveryPartnerDetailPageProps) {
  const { partnerId } = params;

  return (
    <AdminShell headerTitle="Delivery Partner Profile">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[350px]">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
            <p className="text-xs text-on-surface-variant">Loading delivery partner profile...</p>
          </div>
        }
      >
        <DeliveryPartnerDetailsMasterView partnerId={partnerId} />
      </Suspense>
    </AdminShell>
  );
}
