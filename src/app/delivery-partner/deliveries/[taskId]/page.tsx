import React from "react";
import { Metadata } from "next";
import { DeliveryPartnerShell } from "@/features/delivery-partner/components/DeliveryPartnerShell";
import { DeliveryExecutionMasterView } from "@/features/delivery-partner/deliveries/components/DeliveryExecutionMasterView";

interface DeliveryPartnerDeliveryExecutionPageProps {
  params: {
    taskId: string;
  };
}

export async function generateMetadata({
  params,
}: DeliveryPartnerDeliveryExecutionPageProps): Promise<Metadata> {
  return {
    title: `Complete Delivery #${params.taskId} | WASHORA Delivery Partner`,
    description: "Doorstep navigation, security seal inspection, and customer OTP verified handover.",
  };
}

export default function DeliveryPartnerDeliveryExecutionPage({
  params,
}: DeliveryPartnerDeliveryExecutionPageProps) {
  return (
    <DeliveryPartnerShell
      headerTitle="Execute Customer Handover"
      headerSubtitle={`Task ID: ${params.taskId}`}
    >
      <DeliveryExecutionMasterView taskId={params.taskId} />
    </DeliveryPartnerShell>
  );
}
