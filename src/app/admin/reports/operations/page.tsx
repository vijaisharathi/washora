import { Metadata } from "next";
import { OperationsReportView } from "@/features/admin/reports/components/views/OperationsReportView";

export const metadata: Metadata = {
  title: "Operations & Assignment Analytics | WASHORA Admin",
  description: "Real-time hub throughput, partner capacity balancing, and turnaround efficiency",
};

export default function AdminOperationsReportPage() {
  return <OperationsReportView />;
}
