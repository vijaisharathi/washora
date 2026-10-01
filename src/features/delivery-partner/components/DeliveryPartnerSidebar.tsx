"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Bike,
  LayoutDashboard,
  UserCheck,
  ClipboardList,
  Navigation,
  Calendar,
  Wallet,
  History,
  Star,
  Bell,
  HelpCircle,
  Settings,
  LogOut,
  ShieldCheck,
  CircleDot,
} from "lucide-react";
import { useDeliveryPartnerSession } from "../hooks/useDeliveryPartnerSession";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  isLocked?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Live Portal", href: "/delivery-partner", icon: LayoutDashboard },
  { name: "Profile & Vehicle", href: "/delivery-partner/profile", icon: UserCheck },
  { name: "Task Queue", href: "/delivery-partner/tasks", icon: ClipboardList },
  { name: "Active Deliveries", href: "/delivery-partner/deliveries", icon: Navigation },
  { name: "Shift Schedule", href: "/delivery-partner/schedule", icon: Calendar },
  { name: "Earnings & Payouts", href: "/delivery-partner/earnings", icon: Wallet },
  { name: "Trip History", href: "/delivery-partner/history", icon: History },
  { name: "Ratings & Badges", href: "/delivery-partner/reviews", icon: Star },
  { name: "Alerts & Messages", href: "/delivery-partner/notifications", icon: Bell },
  { name: "Valet Support Desk", href: "/delivery-partner/support", icon: HelpCircle },
  { name: "Partner Settings", href: "/delivery-partner/settings", icon: Settings },
];

export function DeliveryPartnerSidebar() {
  const pathname = usePathname();
  const { partner, logout } = useDeliveryPartnerSession();

  return (
    <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-surface-container/95 backdrop-blur-md border-r border-outline-variant/20 z-40">
      {/* Brand Header */}
      <div className="p-5 flex items-center gap-3 border-b border-outline-variant/15">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary/30 via-primary/20 to-surface-container flex items-center justify-center border border-primary/30 shadow-sm">
          <Bike className="w-5 h-5 text-primary" />
        </div>
        <div>
          <span className="text-base font-bold tracking-tight text-on-surface flex items-center gap-1.5">
            WASHORA
            <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/20">
              Valet
            </span>
          </span>
          <p className="text-xs text-on-surface-variant/80">Logistics & Valet Portal</p>
        </div>
      </div>

      {/* Duty Status Quick Badge */}
      <div className="px-4 py-3 border-b border-outline-variant/10 bg-surface/50">
        <div className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-surface-container-high/60 border border-outline-variant/20">
          <div className="flex items-center gap-2">
            <CircleDot className={`w-3.5 h-3.5 ${partner?.status === "ONLINE" ? "text-emerald-400 animate-pulse" : "text-amber-400"}`} />
            <span className="font-medium text-on-surface">
              {partner?.status === "ONLINE" ? "On Duty • Available" : "Off Duty • Offline"}
            </span>
          </div>
          <span className="text-[10px] text-on-surface-variant font-mono">{partner?.hubName?.split(" ")[0]}</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant/60">
          Valet Operations
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/delivery-partner" && pathname?.startsWith(item.href));

          if (item.isLocked) {
            return (
              <div
                key={item.name}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-on-surface-variant/50 cursor-not-allowed select-none transition-colors"
                title={`${item.name} is currently locked`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-on-surface-variant/40" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant/60 font-mono border border-outline-variant/15">
                    {item.badge}
                  </span>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? "bg-primary/15 text-primary border border-primary/25 shadow-sm font-semibold"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/80"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-on-surface-variant"}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Partner Identity Footer */}
      <div className="p-3 border-t border-outline-variant/15 bg-surface-container/60">
        <div className="flex items-center justify-between p-2 rounded-xl bg-surface-container-high/80 border border-outline-variant/20">
          <Link href="/delivery-partner/profile" className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-85 transition-opacity">
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-primary/20 shrink-0 border border-primary/30">
              {partner?.avatarUrl ? (
                <Image
                  src={partner.avatarUrl}
                  alt={partner.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-xs text-primary">
                  {partner?.name?.charAt(0) || "V"}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-on-surface truncate flex items-center gap-1">
                {partner?.name || "Valet Partner"}
                <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
              </p>
              <p className="text-[10px] text-on-surface-variant truncate font-mono">{partner?.vehiclePlate}</p>
            </div>
          </Link>
          <button
            onClick={() => logout()}
            className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors"
            title="Log Out Session"
            aria-label="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
