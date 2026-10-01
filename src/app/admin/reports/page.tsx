import { Metadata } from "next";
import { ReportsOverviewMasterView } from "@/features/admin/reports/components/views/ReportsOverviewMasterView";

export const metadata: Metadata = {
  title: "Reports Overview | WASHORA Admin",
  description: "Executive platform performance overview and operational throughput",
};

export default function AdminReportsOverviewPage() {
  return <ReportsOverviewMasterView />;
}
