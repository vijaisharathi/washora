"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Navigation,
  Wallet,
  Settings,
} from "lucide-react";

const MOBILE_NAV_ITEMS = [
  { name: "Live", href: "/delivery-partner", icon: LayoutDashboard },
  { name: "Tasks", href: "/delivery-partner/tasks", icon: ClipboardList },
  { name: "Deliveries", href: "/delivery-partner/deliveries", icon: Navigation },
  { name: "Earnings", href: "/delivery-partner/earnings", icon: Wallet },
  { name: "Settings", href: "/delivery-partner/settings", icon: Settings, isLocked: true },
];

export function DeliveryPartnerMobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-surface-container/95 backdrop-blur-xl border-t border-outline-variant/20 z-40 flex items-center justify-around px-2"
      aria-label="Mobile Navigation"
    >
      {MOBILE_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== "/delivery-partner" && pathname?.startsWith(item.href));

        if (item.isLocked) {
          return (
            <div
              key={item.name}
              className="flex flex-col items-center justify-center flex-1 py-1 text-on-surface-variant/40 cursor-not-allowed select-none"
              title="Unlocked in future phase"
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </div>
          );
        }

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              isActive ? "text-primary font-bold" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? "text-primary" : "text-on-surface-variant"}`} />
            <span className="text-[10px] font-medium">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
