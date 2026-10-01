import React, { Suspense } from "react";
import { Metadata } from "next";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { DeliveryPartnerEarningsMasterView } from "@/features/admin/payments/components/details/DeliveryPartnerEarningsMasterView";

interface PageProps {
  params: {
    partnerId: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `Delivery Partner Earnings #${params.partnerId} — WASHORA Admin Console`,
    description: `Valet delivery earnings ledger, vehicle details, and fee settlements for ${params.partnerId}`,
  };
}

export default function AdminDeliveryPartnerEarningsPage({ params }: PageProps) {
  return (
    <AdminShell headerTitle={`Partner Earnings #${params.partnerId}`}>
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[350px]">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
            <p className="text-xs text-on-surface-variant">Loading delivery partner earnings ledger...</p>
          </div>
        }
      >
        <DeliveryPartnerEarningsMasterView partnerId={params.partnerId} />
      </Suspense>
    </AdminShell>
  );
}
