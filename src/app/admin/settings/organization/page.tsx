"use client";

import React from "react";
import { OrganizationSettingsView } from "@/features/admin/settings/components/views/OrganizationSettingsView";
import { AdminPermissionGuard } from "@/features/admin/components/AdminPermissionGuard";

export default function AdminOrganizationSettingsPage() {
  return (
    <AdminPermissionGuard
      requiredPermission="Manage Organization"
      resourceName="Organization Settings"
    >
      <OrganizationSettingsView />
    </AdminPermissionGuard>
  );
}
