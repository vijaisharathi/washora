import React, { Suspense } from "react";
import { Metadata } from "next";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { CustomerListMasterView } from "@/features/admin/customers/components/CustomerListMasterView";

export const metadata: Metadata = {
  title: "Customers Directory — WASHORA Admin Console",
  description: "Enterprise customer management, activity telemetry, and account lifecycle control.",
};

export default function AdminCustomersPage() {
  return (
    <AdminShell headerTitle="Customers Directory">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[350px]">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
            <p className="text-xs text-on-surface-variant">Loading customers console...</p>
          </div>
        }
      >
        <CustomerListMasterView />
      </Suspense>
    </AdminShell>
  );
}
