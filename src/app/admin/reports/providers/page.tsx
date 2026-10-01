import { Metadata } from "next";
import { ProvidersReportView } from "@/features/admin/reports/components/views/ProvidersReportView";

export const metadata: Metadata = {
  title: "Provider Network Analytics | WASHORA Admin",
  description: "Facility capacity utilization, verification throughput, and rating quality control",
};

export default function AdminProvidersReportPage() {
  return <ProvidersReportView />;
}
