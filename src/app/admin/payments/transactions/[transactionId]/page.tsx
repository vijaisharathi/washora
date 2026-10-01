import React, { Suspense } from "react";
import { Metadata } from "next";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { TransactionDetailsMasterView } from "@/features/admin/payments/components/details/TransactionDetailsMasterView";

interface PageProps {
  params: {
    transactionId: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `Transaction #${params.transactionId} — WASHORA Admin Console`,
    description: `Detailed financial audit record and profit split for transaction ${params.transactionId}`,
  };
}

export default function AdminTransactionDetailsPage({ params }: PageProps) {
  return (
    <AdminShell headerTitle={`Transaction #${params.transactionId}`}>
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[350px]">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
            <p className="text-xs text-on-surface-variant">Loading transaction audit record...</p>
          </div>
        }
      >
        <TransactionDetailsMasterView transactionId={params.transactionId} />
      </Suspense>
    </AdminShell>
  );
}
