import React, { Suspense } from "react";
import { Metadata } from "next";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { BookingListMasterView } from "@/features/admin/bookings/components/BookingListMasterView";

export const metadata: Metadata = {
  title: "Bookings & Orders — WASHORA Admin Console",
  description:
    "Enterprise booking and order directory, lifecycle management, schedule inspection, and fulfillment coordination.",
};

export default function AdminBookingsPage() {
  return (
    <AdminShell headerTitle="Bookings & Orders">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[350px]">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
            <p className="text-xs text-on-surface-variant">Loading orders & bookings...</p>
          </div>
        }
      >
        <BookingListMasterView />
      </Suspense>
    </AdminShell>
  );
}
