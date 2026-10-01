import React from "react";
import { Metadata } from "next";
import { DeliveryPartnerShell } from "@/features/delivery-partner/components/DeliveryPartnerShell";
import { DeliveryPartnerSettingsMasterView } from "@/features/delivery-partner/settings/components/DeliveryPartnerSettingsMasterView";

export const metadata: Metadata = {
  title: "Partner Settings & Preferences | WASHORA Delivery Partner",
  description: "Manage valet account security, navigation preferences, audio dispatch alerts, and platform settings.",
};

export default function DeliveryPartnerSettingsPage() {
  return (
    <DeliveryPartnerShell
      headerTitle="Partner Settings"
      headerSubtitle="D13 Account & App Configuration"
    >
      <DeliveryPartnerSettingsMasterView />
    </DeliveryPartnerShell>
  );
}
