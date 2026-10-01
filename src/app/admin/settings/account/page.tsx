"use client";

import React from "react";
import { AccountSettingsView } from "@/features/admin/settings/components/views/AccountSettingsView";
import { AdminPermissionGuard } from "@/features/admin/components/AdminPermissionGuard";

export default function AdminAccountSettingsPage() {
  return (
    <AdminPermissionGuard
      requiredPermission="Manage Account Settings"
      resourceName="Account Profile Settings"
    >
      <AccountSettingsView />
    </AdminPermissionGuard>
  );
}
