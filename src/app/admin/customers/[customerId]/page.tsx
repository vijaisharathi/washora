import React, { Suspense } from "react";
import { Metadata } from "next";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { CustomerDetailsMasterView } from "@/features/admin/customers/components/details/CustomerDetailsMasterView";

interface AdminCustomerDetailPageProps {
  params: {
    customerId: string;
  };
}

export const metadata: Metadata = {
  title: "Customer Profile — WASHORA Admin Console",
  description: "Detailed customer profile, bookings summary, spending metrics, and status controls.",
};

export default function AdminCustomerDetailPage({
  params,
}: AdminCustomerDetailPageProps) {
  const { customerId } = params;

  return (
    <AdminShell headerTitle="Customer Profile">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[350px]">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
            <p className="text-xs text-on-surface-variant">Loading customer profile...</p>
          </div>
        }
      >
        <CustomerDetailsMasterView customerId={customerId} />
      </Suspense>
    </AdminShell>
  );
}
