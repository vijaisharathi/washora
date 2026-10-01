import React from "react";
import { Metadata } from "next";
import { DeliveryPartnerShell } from "@/features/delivery-partner/components/DeliveryPartnerShell";
import { DeliveryPartnerTaskDetailMasterView } from "@/features/delivery-partner/tasks/components/DeliveryPartnerTaskDetailMasterView";

interface DeliveryPartnerTaskDetailPageProps {
  params: {
    taskId: string;
  };
}

export async function generateMetadata({
  params,
}: DeliveryPartnerTaskDetailPageProps): Promise<Metadata> {
  return {
    title: `Valet Task #${params.taskId} | WASHORA Delivery Partner`,
    description: "Detailed dispatch route, itemized package inventory, and customer contact information.",
  };
}

export default function DeliveryPartnerTaskDetailPage({
  params,
}: DeliveryPartnerTaskDetailPageProps) {
  return (
    <DeliveryPartnerShell
      headerTitle="Dispatch Run Details"
      headerSubtitle={`Task ID: ${params.taskId}`}
    >
      <DeliveryPartnerTaskDetailMasterView taskId={params.taskId} />
    </DeliveryPartnerShell>
  );
}
