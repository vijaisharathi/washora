import React from "react";
import { Metadata } from "next";
import { DeliveryPartnerShell } from "@/features/delivery-partner/components/DeliveryPartnerShell";
import { DeliveryPartnerTaskListMasterView } from "@/features/delivery-partner/tasks/components/DeliveryPartnerTaskListMasterView";

export const metadata: Metadata = {
  title: "Valet Task & Dispatch Queue | WASHORA Delivery Partner",
  description: "Browse available dispatch broadcasts, manage assigned routes, and execute pickup/delivery jobs.",
};

export default function DeliveryPartnerTasksPage() {
  return (
    <DeliveryPartnerShell
      headerTitle="Valet Task & Dispatch Queue"
      headerSubtitle="D4 Task Management & Route Assignments"
    >
      <DeliveryPartnerTaskListMasterView />
    </DeliveryPartnerShell>
  );
}
