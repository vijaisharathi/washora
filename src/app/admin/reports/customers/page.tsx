import { Metadata } from "next";
import { CustomersReportView } from "@/features/admin/reports/components/views/CustomersReportView";

export const metadata: Metadata = {
  title: "Customer & Retention Analytics | WASHORA Admin",
  description: "User acquisition growth, geographic concentration, and repeat booking frequency",
};

export default function AdminCustomersReportPage() {
  return <CustomersReportView />;
}
