"use client";

import React from "react";
import { RolesSettingsView } from "@/features/admin/settings/components/views/RolesSettingsView";
import { AdminPermissionGuard } from "@/features/admin/components/AdminPermissionGuard";

export default function AdminRolesSettingsPage() {
  return (
    <AdminPermissionGuard
      requiredPermission="Manage Roles"
      resourceName="Roles & Permission Matrix"
    >
      <RolesSettingsView />
    </AdminPermissionGuard>
  );
}
