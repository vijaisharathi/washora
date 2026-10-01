"use client";

import React from "react";
import { ProviderShell } from "@/features/provider/components/ProviderShell";
import { ProviderPageHeader } from "@/features/provider/components/ProviderPageHeader";
import { ProviderBookingsCatalogView } from "@/features/provider/bookings/components/ProviderBookingsCatalogView";

export default function ProviderBookingsPage() {
  return (
    <ProviderShell headerTitle="Booking Requests" headerSubtitle="Reservations &amp; Care Intake">
      <ProviderPageHeader
        title="Bookings Management"
        description="Inspect incoming customer care requests, accept valet schedules, and track fulfillment appointments."
      />

      <ProviderBookingsCatalogView />
    </ProviderShell>
  );
}
