"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  IndianRupee,
  ShoppingCart,
  Users,
  Store,
  Bike,
  Layers,
  Activity,
  Star,
  TrendingUp,
  FlaskConical,
  Lightbulb,
  ShieldCheck,
} from "lucide-react";

export const REPORT_NAV_TABS = [
  { label: "Overview", href: "/admin/reports", icon: LayoutDashboard, exact: true },
  { label: "Revenue", href: "/admin/reports/revenue", icon: IndianRupee },
  { label: "Bookings", href: "/admin/reports/bookings", icon: ShoppingCart },
  { label: "Funnel", href: "/admin/reports/funnel", icon: TrendingUp },
  { label: "Experiments", href: "/admin/reports/experiments", icon: FlaskConical },
  { label: "Improvements", href: "/admin/reports/improvements", icon: Lightbulb },
  { label: "Data Quality", href: "/admin/reports/data-quality", icon: ShieldCheck },
  { label: "Customers", href: "/admin/reports/customers", icon: Users },
  { label: "Providers", href: "/admin/reports/providers", icon: Store },
  { label: "Delivery Partners", href: "/admin/reports/delivery-partners", icon: Bike },
  { label: "Services", href: "/admin/reports/services", icon: Layers },
  { label: "Operations", href: "/admin/reports/operations", icon: Activity },
  { label: "Reviews", href: "/admin/reports/reviews", icon: Star },
];

export function ReportsNavigationTabs() {
  const pathname = usePathname();

  return (
    <div className="w-full overflow-x-auto pb-1 scrollbar-none">
      <div className="flex items-center gap-1.5 min-w-max p-1 rounded-xl bg-surface-container-low border border-outline-variant/30">
        {REPORT_NAV_TABS.map((tab) => {
          const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
