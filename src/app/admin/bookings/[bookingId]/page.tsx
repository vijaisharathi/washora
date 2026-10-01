import React, { Suspense } from "react";
import { Metadata } from "next";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { BookingDetailsMasterView } from "@/features/admin/bookings/components/details/BookingDetailsMasterView";

interface AdminBookingDetailPageProps {
  params: {
    bookingId: string;
  };
}

export const metadata: Metadata = {
  title: "Booking Order Details — WASHORA Admin Console",
  description:
    "Comprehensive operational booking profile, service specifications, schedule, fulfillment address, and audit timeline.",
};

export default function AdminBookingDetailPage({
  params,
}: AdminBookingDetailPageProps) {
  const { bookingId } = params;

  return (
    <AdminShell headerTitle="Booking Details">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[350px]">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
            <p className="text-xs text-on-surface-variant">Loading booking profile...</p>
          </div>
        }
      >
        <BookingDetailsMasterView bookingId={bookingId} />
      </Suspense>
    </AdminShell>
  );
}
