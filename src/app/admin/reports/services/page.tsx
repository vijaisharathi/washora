import { Metadata } from "next";
import { ServicesReportView } from "@/features/admin/reports/components/views/ServicesReportView";

export const metadata: Metadata = {
  title: "Service Catalog Analytics | WASHORA Admin",
  description: "Itemized service popularity, category sales contribution, and customer satisfaction",
};

export default function AdminServicesReportPage() {
  return <ServicesReportView />;
}
