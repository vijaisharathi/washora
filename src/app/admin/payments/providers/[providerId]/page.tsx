import React, { Suspense } from "react";
import { Metadata } from "next";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { ProviderEarningsMasterView } from "@/features/admin/payments/components/details/ProviderEarningsMasterView";

interface PageProps {
  params: {
    providerId: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `Provider Earnings #${params.providerId} — WASHORA Admin Console`,
    description: `Provider earnings ledger, platform fee splits, and payout settlements for ${params.providerId}`,
  };
}

export default function AdminProviderEarningsPage({ params }: PageProps) {
  return (
    <AdminShell headerTitle={`Provider Earnings #${params.providerId}`}>
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[350px]">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
            <p className="text-xs text-on-surface-variant">Loading provider earnings ledger...</p>
          </div>
        }
      >
        <ProviderEarningsMasterView providerId={params.providerId} />
      </Suspense>
    </AdminShell>
  );
}
