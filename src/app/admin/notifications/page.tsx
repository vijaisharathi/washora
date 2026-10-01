import React, { Suspense } from "react";
import { Metadata } from "next";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { NotificationsListMasterView } from "@/features/admin/notifications/components/NotificationsListMasterView";

export const metadata: Metadata = {
  title: "Notifications & Alerts — WASHORA Admin Console",
  description:
    "Enterprise notification center, real-time order alerts, and operational event triggers.",
};

export default function AdminNotificationsPage() {
  return (
    <AdminShell headerTitle="Notifications">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[350px]">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
            <p className="text-xs text-on-surface-variant">Loading notifications...</p>
          </div>
        }
      >
        <NotificationsListMasterView />
      </Suspense>
    </AdminShell>
  );
}
