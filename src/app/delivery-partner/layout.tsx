import React from "react";
import { Metadata } from "next";
import { DeliveryPartnerRouteGuard } from "@/features/delivery-partner/components/DeliveryPartnerRouteGuard";

export const metadata: Metadata = {
  title: "WASHORA Valet | Delivery Partner Logistics Portal",
  description: "Real-time dispatch, route optimization, and pickup/delivery fulfillment portal for WASHORA valet logistics partners.",
};

export default function DeliveryPartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DeliveryPartnerRouteGuard>{children}</DeliveryPartnerRouteGuard>;
}
