import React from "react";
import { Metadata } from "next";
import { DeliveryPartnerShell } from "@/features/delivery-partner/components/DeliveryPartnerShell";
import { HistoryDetailMasterView } from "@/features/delivery-partner/history/components/HistoryDetailMasterView";

interface DeliveryPartnerHistoryDetailPageProps {
  params: {
    deliveryId: string;
  };
}

export async function generateMetadata({
  params,
}: DeliveryPartnerHistoryDetailPageProps): Promise<Metadata> {
  return {
    title: `Trip History #${params.deliveryId} | WASHORA Delivery Partner`,
    description: "Read-only historical verification record, garment items list, and delivery milestone timestamps.",
  };
}

export default function DeliveryPartnerHistoryDetailPage({
  params,
}: DeliveryPartnerHistoryDetailPageProps) {
  return (
    <DeliveryPartnerShell
      headerTitle="Historical Trip Verification"
      headerSubtitle={`Record ID: ${params.deliveryId}`}
    >
      <HistoryDetailMasterView deliveryId={params.deliveryId} />
    </DeliveryPartnerShell>
  );
}
