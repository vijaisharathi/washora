import React from "react";
import { Metadata } from "next";
import { DeliveryPartnerShell } from "@/features/delivery-partner/components/DeliveryPartnerShell";
import { PickupExecutionMasterView } from "@/features/delivery-partner/pickup/components/PickupExecutionMasterView";

interface DeliveryPartnerPickupExecutionPageProps {
  params: {
    taskId: string;
  };
}

export async function generateMetadata({
  params,
}: DeliveryPartnerPickupExecutionPageProps): Promise<Metadata> {
  return {
    title: `Execute Pickup #${params.taskId} | WASHORA Delivery Partner`,
    description: "Doorstep arrival, garment checklist verification, security seal tagging, and customer OTP confirmation.",
  };
}

export default function DeliveryPartnerPickupExecutionPage({
  params,
}: DeliveryPartnerPickupExecutionPageProps) {
  return (
    <DeliveryPartnerShell
      headerTitle="Execute Doorstep Pickup"
      headerSubtitle={`Task ID: ${params.taskId}`}
    >
      <PickupExecutionMasterView taskId={params.taskId} />
    </DeliveryPartnerShell>
  );
}
