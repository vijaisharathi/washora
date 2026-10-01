import { Metadata } from "next";
import { ExperimentsReportView } from "@/features/admin/reports/components/views/ExperimentsReportView";

export const metadata: Metadata = {
  title: "Experiments & Feature Flags | WASHORA Admin",
  description: "A/B testing, deterministic user bucketing, and statistical conversion lift analysis",
};

export default function AdminExperimentsReportPage() {
  return <ExperimentsReportView />;
}
