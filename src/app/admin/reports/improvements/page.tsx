import { Metadata } from "next";
import { ImprovementsReportView } from "@/features/admin/reports/components/views/ImprovementsReportView";

export const metadata: Metadata = {
  title: "Continuous Product Improvements | WASHORA Admin",
  description: "Data-driven product improvement initiatives, backlog priority, and validated impact",
};

export default function AdminImprovementsReportPage() {
  return <ImprovementsReportView />;
}
