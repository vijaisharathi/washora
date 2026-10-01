import React, { Suspense } from "react";
import { Metadata } from "next";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { DeliveryPartnerListMasterView } from "@/features/admin/delivery-partners/components/DeliveryPartnerListMasterView";

export const metadata: Metadata = {
  title: "Delivery Partners — WASHORA Admin Console",
  description: "Enterprise delivery partner fleet directory, verification approval, vehicle management, and operational coverage.",
};

export default function AdminDeliveryPartnersPage() {
  return (
    <AdminShell headerTitle="Delivery Partners Management">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[350px]">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
            <p className="text-xs text-on-surface-variant">Loading delivery partner fleet...</p>
          </div>
        }
      >
        <DeliveryPartnerListMasterView />
      </Suspense>
    </AdminShell>
  );
}
