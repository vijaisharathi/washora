"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sliders,
  User,
  Globe,
  Bell,
  ShieldCheck,
  Building2,
  Users,
  Shield,
} from "lucide-react";
import { useAdminPermissions } from "@/features/admin/hooks/useAdminSettings";

export interface SettingsTabItem {
  label: string;
  href: string;
  icon: React.ElementType;
  requiredPermission?: string;
}

export const SETTINGS_NAV_ITEMS: SettingsTabItem[] = [
  {
    label: "Overview",
    href: "/admin/settings",
    icon: Sliders,
    requiredPermission: "Manage Account Settings",
  },
  {
    label: "Account Profile",
    href: "/admin/settings/account",
    icon: User,
    requiredPermission: "Manage Account Settings",
  },
  {
    label: "Preferences",
    href: "/admin/settings/preferences",
    icon: Globe,
    requiredPermission: "Manage Account Settings",
  },
  {
    label: "Notifications",
    href: "/admin/settings/notifications",
    icon: Bell,
    requiredPermission: "Manage Account Settings",
  },
  {
    label: "Security & Sessions",
    href: "/admin/settings/security",
    icon: ShieldCheck,
    requiredPermission: "Manage Account Settings",
  },
  {
    label: "Organization",
    href: "/admin/settings/organization",
    icon: Building2,
    requiredPermission: "Manage Organization",
  },
  {
    label: "Staff Members",
    href: "/admin/settings/members",
    icon: Users,
    requiredPermission: "Manage Members",
  },
  {
    label: "Roles & Permissions",
    href: "/admin/settings/roles",
    icon: Shield,
    requiredPermission: "Manage Roles",
  },
];

export function SettingsNavigationTabs() {
  const pathname = usePathname();
  const { hasPermission } = useAdminPermissions();

  const visibleItems = SETTINGS_NAV_ITEMS.filter(
    (item) => !item.requiredPermission || hasPermission(item.requiredPermission)
  );

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-2 border-b border-outline-variant/30 custom-scrollbar">
      {visibleItems.map((tab) => {
        const isActive =
          pathname === tab.href ||
          (tab.href !== "/admin/settings" && pathname.startsWith(tab.href));
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              isActive
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
            }`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
