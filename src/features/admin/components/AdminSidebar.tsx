"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Store,
  Bike,
  Activity,
  Terminal,
  LifeBuoy,
  Settings,
  ShieldCheck,
  Layers,
  ChevronRight,
  User,
  Building2,
  CreditCard,
  Star,
  Bell,
  MessageSquare,
  Scale,
  BarChart3,
} from "lucide-react";
import { useAdminSession } from "../hooks/useAdminSession";
import { AdminNavigationItem } from "@/types/admin";

import { useAdminPermissions } from "../hooks/useAdminSettings";

interface NavItemWithPermission extends AdminNavigationItem {
  requiredPermission?: string;
}

const ADMIN_NAV_ITEMS: NavItemWithPermission[] = [
  {
    title: "Dashboard",
    href: "/admin",
    iconName: "dashboard",
    section: "MAIN",
    phase: "A0 Foundation",
    requiredPermission: "View Dashboard",
  },
  {
    title: "Bookings / Orders",
    href: "/admin/bookings",
    iconName: "orders",
    disabled: false,
    section: "MAIN",
    phase: "Booking & Order Management",
    requiredPermission: "View Bookings",
  },
  {
    title: "Services Catalog",
    href: "/admin/services",
    iconName: "services",
    disabled: false,
    section: "MAIN",
    phase: "Service & Catalog Management",
    requiredPermission: "View Services",
  },
  {
    title: "Customers",
    href: "/admin/customers",
    iconName: "customers",
    disabled: false,
    section: "MAIN",
    phase: "Customer Management",
    requiredPermission: "View Customers",
  },
  {
    title: "Providers",
    href: "/admin/providers",
    iconName: "providers",
    disabled: false,
    section: "MAIN",
    phase: "Provider Management",
    requiredPermission: "View Providers",
  },
  {
    title: "Delivery Partners",
    href: "/admin/delivery-partners",
    iconName: "delivery",
    disabled: false,
    section: "MAIN",
    phase: "Delivery Partner Management",
    requiredPermission: "View Delivery Partners",
  },
  {
    title: "Operations",
    href: "/admin/operations",
    iconName: "operations",
    disabled: false,
    section: "MAIN",
    phase: "Operations & Assignment Management",
    requiredPermission: "View Operations",
  },
  {
    title: "Payments & Earnings",
    href: "/admin/payments",
    iconName: "payments",
    disabled: false,
    section: "MAIN",
    phase: "Payments / Earnings / Transactions",
    requiredPermission: "View Payments",
  },
  {
    title: "Reviews & Moderation",
    href: "/admin/reviews",
    iconName: "reviews",
    disabled: false,
    section: "MAIN",
    phase: "Reviews & Moderation",
    requiredPermission: "View Reviews",
  },
  {
    title: "Notifications",
    href: "/admin/notifications",
    iconName: "notifications",
    disabled: false,
    section: "MAIN",
    phase: "Notifications & Communication",
    requiredPermission: "View Notifications",
  },
  {
    title: "Communications",
    href: "/admin/communications",
    iconName: "communications",
    disabled: false,
    section: "MAIN",
    phase: "Notifications & Communication",
    requiredPermission: "View Notifications",
  },
  {
    title: "Support Tickets",
    href: "/admin/support",
    iconName: "support",
    disabled: false,
    section: "MAIN",
    phase: "Support & Disputes",
    requiredPermission: "View Support",
  },
  {
    title: "Disputes",
    href: "/admin/disputes",
    iconName: "disputes",
    disabled: false,
    section: "MAIN",
    phase: "Support & Disputes",
    requiredPermission: "View Disputes",
  },
  {
    title: "Reports & Analytics",
    href: "/admin/reports",
    iconName: "reports",
    disabled: false,
    section: "MAIN",
    phase: "Reports & Analytics",
    requiredPermission: "View Reports",
  },
  {
    title: "Admin Profile",
    href: "/admin/profile",
    iconName: "profile",
    disabled: false,
    badge: "A2",
    badgeVariant: "info",
    section: "SYSTEM",
    phase: "Profile & Identity",
    requiredPermission: "Manage Account Settings",
  },
  {
    title: "Organization Setup",
    href: "/admin/organization",
    iconName: "organization",
    disabled: false,
    badge: "A2",
    badgeVariant: "info",
    section: "SYSTEM",
    phase: "Organization Management",
    requiredPermission: "Manage Organization",
  },
  {
    title: "Settings & Access",
    href: "/admin/settings",
    iconName: "settings",
    disabled: false,
    section: "SYSTEM",
    phase: "Account & Settings",
    requiredPermission: "Manage Account Settings",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, role } = useAdminSession();
  const { hasPermission } = useAdminPermissions();

  const renderIcon = (iconName: string, active: boolean) => {
    const className = `w-4 h-4 ${active ? "text-primary" : "text-on-surface-variant"}`;
    switch (iconName) {
      case "dashboard":
        return <LayoutDashboard className={className} />;
      case "orders":
        return <ShoppingCart className={className} />;
      case "services":
        return <Layers className={className} />;
      case "customers":
        return <Users className={className} />;
      case "providers":
        return <Store className={className} />;
      case "delivery":
        return <Bike className={className} />;
      case "operations":
        return <Activity className={className} />;
      case "payments":
        return <CreditCard className={className} />;
      case "reviews":
        return <Star className={className} />;
      case "notifications":
        return <Bell className={className} />;
      case "communications":
        return <MessageSquare className={className} />;
      case "profile":
        return <User className={className} />;
      case "organization":
        return <Building2 className={className} />;
      case "system":
        return <Terminal className={className} />;
      case "support":
        return <LifeBuoy className={className} />;
      case "disputes":
        return <Scale className={className} />;
      case "reports":
        return <BarChart3 className={className} />;
      case "settings":
        return <Settings className={className} />;
      default:
        return <LayoutDashboard className={className} />;
    }
  };

  const mainItems = ADMIN_NAV_ITEMS.filter(
    (i) => i.section === "MAIN" && (!i.requiredPermission || hasPermission(i.requiredPermission))
  );
  const systemItems = ADMIN_NAV_ITEMS.filter(
    (i) => i.section === "SYSTEM" && (!i.requiredPermission || hasPermission(i.requiredPermission))
  );

  return (
    <nav className="fixed left-0 top-0 h-full w-[260px] bg-surface-container-lowest border-r border-outline-variant/30 hidden md:flex flex-col py-6 z-40">
      {/* Brand Header */}
      <div className="px-6 mb-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-primary" />
        </div>
        <div className="overflow-hidden">
          <h1 className="font-bold text-sm text-on-surface tracking-tight truncate">
            Lumina Admin
          </h1>
          <p className="text-[11px] text-on-surface-variant flex items-center gap-1.5 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            WASHORA Console
          </p>
        </div>
      </div>

      {/* Role Badge Container */}
      <div className="mx-4 mb-4 p-2.5 rounded-lg bg-surface-container border border-outline-variant/30 flex items-center justify-between">
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
            Active Persona
          </span>
          <span className="text-xs font-semibold text-primary truncate">
            {role === "operations" || role === "OPERATIONS_MANAGER"
              ? "Operations Manager"
              : "Administrator"}
          </span>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
          A1
        </span>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 flex flex-col gap-1 px-3 overflow-y-auto custom-scrollbar">
        {/* Main Section */}
        <p className="text-[11px] font-semibold text-on-surface-variant/70 uppercase tracking-wider px-3 mb-1 mt-2">
          Platform Management
        </p>
        {mainItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === "/admin/bookings" &&
              pathname.startsWith("/admin/bookings")) ||
            (item.href === "/admin/customers" &&
              pathname.startsWith("/admin/customers")) ||
            (item.href === "/admin/providers" &&
              pathname.startsWith("/admin/providers")) ||
            (item.href === "/admin/delivery-partners" &&
              pathname.startsWith("/admin/delivery-partners")) ||
            (item.href === "/admin/operations" &&
              pathname.startsWith("/admin/operations")) ||
            (item.href === "/admin/payments" &&
              pathname.startsWith("/admin/payments")) ||
            (item.href === "/admin/reports" &&
              pathname.startsWith("/admin/reports"));
          if (item.disabled) {
            return (
              <div
                key={item.title}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-on-surface-variant/50 cursor-not-allowed text-xs select-none"
                title={`${item.title} (${item.phase})`}
              >
                <div className="flex items-center gap-2.5">
                  {renderIcon(item.iconName, false)}
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant border border-outline-variant/20">
                    {item.badge}
                  </span>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.title}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-surface-container-high text-on-surface font-semibold border-l-4 border-primary"
                  : "text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {renderIcon(item.iconName, isActive)}
                <span>{item.title}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-primary" />}
            </Link>
          );
        })}

        {/* System Section */}
        {systemItems.length > 0 && (
          <>
            <p className="text-[11px] font-semibold text-on-surface-variant/70 uppercase tracking-wider px-3 mb-1 mt-6">
              System & Governance
            </p>
            {systemItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href === "/admin/settings" &&
                  pathname.startsWith("/admin/settings"));

              if (item.disabled) {
                return (
                  <div
                    key={item.title}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-on-surface-variant/50 cursor-not-allowed text-xs select-none"
                    title={`${item.title} (${item.phase})`}
                  >
                    <div className="flex items-center gap-2.5">
                      {renderIcon(item.iconName, false)}
                      <span>{item.title}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant border border-outline-variant/20">
                        {item.badge}
                      </span>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-surface-container-high text-on-surface font-semibold border-l-4 border-primary"
                      : "text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {renderIcon(item.iconName, isActive)}
                    <span>{item.title}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-primary" />}
                </Link>
              );
            })}
          </>
        )}
      </div>

      {/* Footer User Info */}
      <div className="px-4 mt-auto pt-4 border-t border-outline-variant/20 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center shrink-0 overflow-hidden text-xs font-bold text-primary">
          {user?.name ? user.name[0] : "A"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-on-surface truncate">{user?.name || "Admin"}</p>
          <p className="text-[10px] text-on-surface-variant truncate">{user?.email || "admin@washora.com"}</p>
        </div>
      </div>
    </nav>
  );
}
