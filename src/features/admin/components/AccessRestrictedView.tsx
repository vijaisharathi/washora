"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, LayoutDashboard, UserCheck } from "lucide-react";
import { AdminRole } from "@/types/admin";

interface AccessRestrictedViewProps {
  requiredPermission?: string;
  userRole?: AdminRole | string;
  resourceName?: string;
}

export function AccessRestrictedView({
  requiredPermission = "Manage Resource",
  userRole = "Operations Executive",
  resourceName = "this administrative workspace",
}: AccessRestrictedViewProps) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-center shadow-lg animate-in fade-in zoom-in-95 duration-200">
        <div className="w-14 h-14 rounded-2xl bg-error/15 border border-error/30 text-error flex items-center justify-center mx-auto mb-5">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <h2 className="text-xl font-bold text-on-surface tracking-tight mb-2">
          Access Restricted
        </h2>

        <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
          Your current platform role does not possess the authorization required to access{" "}
          <span className="font-semibold text-on-surface">{resourceName}</span>.
        </p>

        <div className="p-4 rounded-xl bg-surface-container/70 border border-outline-variant/20 mb-6 text-left space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-on-surface-variant">Your Assigned Role:</span>
            <span className="font-bold text-on-surface px-2 py-0.5 rounded bg-surface-container-high border border-outline-variant/30">
              {userRole}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-on-surface-variant">Required Permission:</span>
            <span className="font-mono font-semibold text-error text-[11px]">
              {requiredPermission}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/admin"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/admin/settings/roles"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-xs font-semibold text-on-surface transition-colors"
          >
            <UserCheck className="w-4 h-4" />
            <span>View Roles</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
