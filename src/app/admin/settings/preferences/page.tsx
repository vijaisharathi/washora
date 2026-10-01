"use client";

import React from "react";
import { PreferencesSettingsView } from "@/features/admin/settings/components/views/PreferencesSettingsView";
import { AdminPermissionGuard } from "@/features/admin/components/AdminPermissionGuard";

export default function AdminPreferencesSettingsPage() {
  return (
    <AdminPermissionGuard
      requiredPermission="Manage Account Settings"
      resourceName="Preferences"
    >
      <PreferencesSettingsView />
    </AdminPermissionGuard>
  );
}
