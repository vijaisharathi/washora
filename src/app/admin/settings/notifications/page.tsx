"use client";

import React from "react";
import { NotificationsSettingsView } from "@/features/admin/settings/components/views/NotificationsSettingsView";
import { AdminPermissionGuard } from "@/features/admin/components/AdminPermissionGuard";

export default function AdminNotificationsSettingsPage() {
  return (
    <AdminPermissionGuard
      requiredPermission="Manage Account Settings"
      resourceName="Notification Preferences"
    >
      <NotificationsSettingsView />
    </AdminPermissionGuard>
  );
}
