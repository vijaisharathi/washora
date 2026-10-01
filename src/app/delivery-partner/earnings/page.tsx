import React from "react";
import { Metadata } from "next";
import { DeliveryPartnerShell } from "@/features/delivery-partner/components/DeliveryPartnerShell";
import { DeliveryPartnerEarningsMasterView } from "@/features/delivery-partner/earnings/components/DeliveryPartnerEarningsMasterView";

export const metadata: Metadata = {
  title: "Earnings & Payout Settlements | WASHORA Delivery Partner",
  description: "Review wallet balance, trip earnings breakdown, daily payouts, and request instant cashouts.",
};

export default function DeliveryPartnerEarningsPage() {
  return (
    <DeliveryPartnerShell
      headerTitle="Valet Earnings & Payouts"
      headerSubtitle="D8 Financial Dashboard & Bank Settlements"
    >
      <DeliveryPartnerEarningsMasterView />
    </DeliveryPartnerShell>
  );
}
