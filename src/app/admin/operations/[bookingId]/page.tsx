import React, { Suspense } from "react";
import { Metadata } from "next";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { OperationsBookingDetailsMasterView } from "@/features/admin/operations/components/details/OperationsBookingDetailsMasterView";

interface AdminOperationsBookingDetailPageProps {
  params: {
    bookingId: string;
  };
}

export const metadata: Metadata = {
  title: "Booking Operations — WASHORA Admin Console",
  description:
    "Operational triage, resource assignments, delivery valet coordination, readiness evaluation, and assignment activity audit trail.",
};

export default function AdminOperationsBookingDetailPage({
  params,
}: AdminOperationsBookingDetailPageProps) {
  const { bookingId } = params;

  return (
    <AdminShell headerTitle="Booking Operations">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[350px]">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
            <p className="text-xs text-on-surface-variant">Loading booking operations...</p>
          </div>
        }
      >
        <OperationsBookingDetailsMasterView bookingId={bookingId} />
      </Suspense>
    </AdminShell>
  );
}
