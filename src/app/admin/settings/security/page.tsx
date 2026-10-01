"use client";

import React from "react";
import { SecuritySettingsView } from "@/features/admin/settings/components/views/SecuritySettingsView";
import { AdminPermissionGuard } from "@/features/admin/components/AdminPermissionGuard";

export default function AdminSecuritySettingsPage() {
  return (
    <AdminPermissionGuard
      requiredPermission="Manage Account Settings"
      resourceName="Security & Session Settings"
    >
      <SecuritySettingsView />
    </AdminPermissionGuard>
  );
}
