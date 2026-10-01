import { Metadata } from "next";
import { RevenueReportView } from "@/features/admin/reports/components/views/RevenueReportView";

export const metadata: Metadata = {
  title: "Revenue & Financial Analytics | WASHORA Admin",
  description: "Audited financial ledger performance, payout distribution, and platform take-rate",
};

export default function AdminRevenueReportPage() {
  return <RevenueReportView />;
}
