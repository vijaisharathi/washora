"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PROVIDER_MOBILE_NAV } from "@/config/providerNavigation";

export function ProviderMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-white/5 px-2 py-1">
      <div className="flex items-center justify-around">
        {PROVIDER_MOBILE_NAV.map((item) => {
          const isActive = item.isExact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1.5 px-3 rounded-lg text-[11px] font-medium transition-colors",
                isActive
                  ? "text-primary font-semibold"
                  : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              <span
                className={cn(
                  "material-symbols-outlined text-2xl transition-transform",
                  isActive && "scale-105 text-primary"
                )}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
