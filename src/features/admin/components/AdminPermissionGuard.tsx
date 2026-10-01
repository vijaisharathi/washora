"use client";

import React from "react";
import { useAdminPermissions } from "../hooks/useAdminSettings";
import { AccessRestrictedView } from "./AccessRestrictedView";

interface AdminPermissionGuardProps {
  requiredPermission: string;
  resourceName?: string;
  children: React.ReactNode;
}

export function AdminPermissionGuard({
  requiredPermission,
  resourceName,
  children,
}: AdminPermissionGuardProps) {
  const { role, hasPermission } = useAdminPermissions();

  if (!hasPermission(requiredPermission)) {
    return (
      <AccessRestrictedView
        requiredPermission={requiredPermission}
        userRole={role}
        resourceName={resourceName}
      />
    );
  }

  return <>{children}</>;
}
