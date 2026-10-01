import React from "react";
import { Metadata } from "next";
import { DeliveryPartnerShell } from "@/features/delivery-partner/components/DeliveryPartnerShell";
import { TransactionDetailMasterView } from "@/features/delivery-partner/earnings/components/TransactionDetailMasterView";

interface DeliveryPartnerEarningDetailPageProps {
  params: {
    earningId: string;
  };
}

export async function generateMetadata({
  params,
}: DeliveryPartnerEarningDetailPageProps): Promise<Metadata> {
  return {
    title: `Trip Earning Breakdown #${params.earningId} | WASHORA Delivery Partner`,
    description: "Detailed itemization of base fare, distance pay, fuel surge incentive, and tip.",
  };
}

export default function DeliveryPartnerEarningDetailPage({
  params,
}: DeliveryPartnerEarningDetailPageProps) {
  return (
    <DeliveryPartnerShell
      headerTitle="Trip Earning Breakdown"
      headerSubtitle={`Transaction ID: ${params.earningId}`}
    >
      <TransactionDetailMasterView earningId={params.earningId} />
    </DeliveryPartnerShell>
  );
}
