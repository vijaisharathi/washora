import React, { Suspense } from "react";
import { Metadata } from "next";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { NotificationDetailsMasterView } from "@/features/admin/notifications/components/details/NotificationDetailsMasterView";

interface AdminNotificationDetailPageProps {
  params: {
    notificationId: string;
  };
}

export const metadata: Metadata = {
  title: "Notification Details — WASHORA Admin Console",
  description:
    "Detailed operational alert inspection, priority metrics, and related entity resolution.",
};

export default function AdminNotificationDetailPage({
  params,
}: AdminNotificationDetailPageProps) {
  const { notificationId } = params;

  return (
    <AdminShell headerTitle="Notification Details">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[350px]">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
            <p className="text-xs text-on-surface-variant">Loading alert details...</p>
          </div>
        }
      >
        <NotificationDetailsMasterView notificationId={notificationId} />
      </Suspense>
    </AdminShell>
  );
}
