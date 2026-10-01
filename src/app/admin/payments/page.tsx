import React, { Suspense } from "react";
import { Metadata } from "next";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { PaymentsListMasterView } from "@/features/admin/payments/components/PaymentsListMasterView";

export const metadata: Metadata = {
  title: "Payments & Financial Ledger — WASHORA Admin Console",
  description:
    "Enterprise payments management, booking financial settlements, transaction audit ledger, and refund operations.",
};

export default function AdminPaymentsPage() {
  return (
    <AdminShell headerTitle="Payments & Earnings">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[350px]">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
            <p className="text-xs text-on-surface-variant">Loading payments & financial records...</p>
          </div>
        }
      >
        <PaymentsListMasterView />
      </Suspense>
    </AdminShell>
  );
}
