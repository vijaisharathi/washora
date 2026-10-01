import React from "react";
import { Metadata } from "next";
import { DeliveryPartnerShell } from "@/features/delivery-partner/components/DeliveryPartnerShell";
import { NotificationDetailMasterView } from "@/features/delivery-partner/notifications/components/NotificationDetailMasterView";

interface DeliveryPartnerNotificationDetailPageProps {
  params: {
    notificationId: string;
  };
}

export async function generateMetadata({
  params,
}: DeliveryPartnerNotificationDetailPageProps): Promise<Metadata> {
  return {
    title: `Alert #${params.notificationId} | WASHORA Delivery Partner`,
    description: "Operational dispatch alert, recommended valet actions, and related order context.",
  };
}

export default function DeliveryPartnerNotificationDetailPage({
  params,
}: DeliveryPartnerNotificationDetailPageProps) {
  return (
    <DeliveryPartnerShell
      headerTitle="Dispatch Alert Detail"
      headerSubtitle={`Alert ID: ${params.notificationId}`}
    >
      <NotificationDetailMasterView notificationId={params.notificationId} />
    </DeliveryPartnerShell>
  );
}
