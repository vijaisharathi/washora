import { Metadata } from "next";
import { DeliveryPartnersReportView } from "@/features/admin/reports/components/views/DeliveryPartnersReportView";

export const metadata: Metadata = {
  title: "Delivery Partner Fleet Analytics | WASHORA Admin",
  description: "Valet dispatch throughput, vehicle fleet distribution, and turnaround reliability",
};

export default function AdminDeliveryPartnersReportPage() {
  return <DeliveryPartnersReportView />;
}
