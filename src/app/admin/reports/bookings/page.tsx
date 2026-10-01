import { Metadata } from "next";
import { BookingsReportView } from "@/features/admin/reports/components/views/BookingsReportView";

export const metadata: Metadata = {
  title: "Booking Volume Analytics | WASHORA Admin",
  description: "End-to-end lifecycle throughput, fulfillment velocity, and dropoff diagnostics",
};

export default function AdminBookingsReportPage() {
  return <BookingsReportView />;
}
