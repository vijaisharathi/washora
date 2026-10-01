import { Metadata } from "next";
import { DataQualityReportView } from "@/features/admin/reports/components/views/DataQualityReportView";

export const metadata: Metadata = {
  title: "Data Quality & Ledger Reconciliation | WASHORA Admin",
  description: "Automated telemetry schema verification, tenant isolation audit, and financial reconciliation",
};

export default function AdminDataQualityReportPage() {
  return <DataQualityReportView />;
}
