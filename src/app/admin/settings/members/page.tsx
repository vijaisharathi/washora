"use client";

import React from "react";
import { MembersSettingsView } from "@/features/admin/settings/components/views/MembersSettingsView";
import { AdminPermissionGuard } from "@/features/admin/components/AdminPermissionGuard";

export default function AdminMembersSettingsPage() {
  return (
    <AdminPermissionGuard
      requiredPermission="Manage Members"
      resourceName="Staff Members Roster"
    >
      <MembersSettingsView />
    </AdminPermissionGuard>
  );
}
