import React, { Suspense } from "react";
import { Metadata } from "next";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { BookingFinancialDetailsMasterView } from "@/features/admin/payments/components/details/BookingFinancialDetailsMasterView";

interface PageProps {
  params: {
    bookingId: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `Booking Ledger #${params.bookingId} — WASHORA Admin Console`,
    description: `Booking-level payment details, provider earnings, and valet fees for ${params.bookingId}`,
  };
}

export default function AdminBookingFinancialDetailsPage({ params }: PageProps) {
  return (
    <AdminShell headerTitle={`Booking Ledger #${params.bookingId}`}>
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[350px]">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
            <p className="text-xs text-on-surface-variant">Loading booking financial record...</p>
          </div>
        }
      >
        <BookingFinancialDetailsMasterView bookingId={params.bookingId} />
      </Suspense>
    </AdminShell>
  );
}
