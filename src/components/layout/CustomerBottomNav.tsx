"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Compass,
  CalendarDays,
  Gift,
  User,
} from "lucide-react";

/**
 * ==============================================================================
 * MOBILE BOTTOM NAVIGATION
 * Fixed thumb-friendly bottom nav for modern consumer marketplace experience
 * Items: Home, Explore, Bookings, Rewards, Profile
 * ==============================================================================
 */

export function CustomerBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/customer", icon: Sparkles },
    { label: "Explore", href: "/customer/services", icon: Compass },
    { label: "Bookings", href: "/customer/orders", icon: CalendarDays },
    { label: "Rewards", href: "/customer/offers", icon: Gift },
    { label: "Profile", href: "/customer/profile", icon: User },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-card/95 backdrop-blur-xl border-t border-white/[0.08] px-2 py-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))]"
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive =
            item.href === "/customer"
              ? pathname === "/customer"
              : pathname.startsWith(item.href);

          const IconComponent = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-semibold transition-all min-h-[46px] min-w-[52px]",
                isActive
                  ? "text-primary font-bold"
                  : "text-slate-400 hover:text-white"
              )}
            >
              <div
                className={cn(
                  "p-1 rounded-full transition-all",
                  isActive && "bg-primary/15 text-primary scale-110"
                )}
              >
                <IconComponent className="h-5 w-5" />
              </div>
              <span className="mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
