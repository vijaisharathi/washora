"use client";

import React from "react";
import { SettingsOverviewMasterView } from "@/features/admin/settings/components/views/SettingsOverviewMasterView";
import { AdminPermissionGuard } from "@/features/admin/components/AdminPermissionGuard";

export default function AdminSettingsOverviewPage() {
  return (
    <AdminPermissionGuard
      requiredPermission="Manage Account Settings"
      resourceName="Settings Overview"
    >
      <SettingsOverviewMasterView />
    </AdminPermissionGuard>
  );
}
