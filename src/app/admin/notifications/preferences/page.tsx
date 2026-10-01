import React, { Suspense } from "react";
import { Metadata } from "next";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { NotificationPreferencesView } from "@/features/admin/notifications/components/preferences/NotificationPreferencesView";

export const metadata: Metadata = {
  title: "Notification Preferences — WASHORA Admin Console",
  description:
    "Configure category alert subscriptions and console notification preferences.",
};

export default function AdminNotificationPreferencesPage() {
  return (
    <AdminShell headerTitle="Notification Preferences">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[350px]">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
            <p className="text-xs text-on-surface-variant">Loading preferences...</p>
          </div>
        }
      >
        <NotificationPreferencesView />
      </Suspense>
    </AdminShell>
  );
}
