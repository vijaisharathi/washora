"use client";

import React from "react";
import { useParams } from "next/navigation";
import { ProviderShell } from "@/features/provider/components/ProviderShell";
import { ProviderBookingDetailView } from "@/features/provider/bookings/components/ProviderBookingDetailView";

export default function ProviderBookingDetailPage() {
  const params = useParams();
  const bookingId = params?.bookingId as string;

  return (
    <ProviderShell headerTitle="Booking Inspection" headerSubtitle="Order Details">
      <ProviderBookingDetailView bookingId={bookingId} />
    </ProviderShell>
  );
}
