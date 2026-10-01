import React from "react";
import { Metadata } from "next";
import { DeliveryPartnerShell } from "@/features/delivery-partner/components/DeliveryPartnerShell";
import { PayoutDetailMasterView } from "@/features/delivery-partner/earnings/components/PayoutDetailMasterView";

interface DeliveryPartnerPayoutDetailPageProps {
  params: {
    payoutId: string;
  };
}

export async function generateMetadata({
  params,
}: DeliveryPartnerPayoutDetailPageProps): Promise<Metadata> {
  return {
    title: `Payout Statement #${params.payoutId} | WASHORA Delivery Partner`,
    description: "Official settlement statement, UTR disbursement reference, and payment destination details.",
  };
}

export default function DeliveryPartnerPayoutDetailPage({
  params,
}: DeliveryPartnerPayoutDetailPageProps) {
  return (
    <DeliveryPartnerShell
      headerTitle="Settlement Payout Statement"
      headerSubtitle={`Payout ID: ${params.payoutId}`}
    >
      <PayoutDetailMasterView payoutId={params.payoutId} />
    </DeliveryPartnerShell>
  );
}
