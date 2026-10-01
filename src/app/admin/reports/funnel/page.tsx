import { Metadata } from "next";
import { FunnelReportView } from "@/features/admin/reports/components/views/FunnelReportView";

export const metadata: Metadata = {
  title: "Conversion Funnel Analytics | WASHORA Admin",
  description: "End-to-end customer journey conversion, drop-off diagnostics, and platform benchmarks",
};

export default function AdminFunnelReportPage() {
  return <FunnelReportView />;
}
