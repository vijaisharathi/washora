"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PROVIDER_MAIN_NAV, PROVIDER_SECONDARY_NAV } from "@/config/providerNavigation";
import { useProviderSession } from "@/features/provider/hooks/useProviderSession";

export function ProviderSidebar() {
  const pathname = usePathname();
  const { profile, isOnline, toggleOnline, isTogglingOnline } = useProviderSession();

  return (
    <aside className="bg-surface-container-low h-screen w-64 fixed left-0 top-0 border-r border-white/5 flex flex-col py-6 z-40 hidden md:flex">
      {/* Brand Header */}
      <div className="mb-6 px-4 flex items-center justify-between">
        <Link href="/provider" className="flex items-center gap-2">
          <span className="font-headline-md text-xl font-bold text-primary tracking-tight">
            WASHORA
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-primary-container/30 text-primary border border-primary/20">
            Studio
          </span>
        </Link>
      </div>

      {/* Provider Mini Profile Card */}
      <div className="px-4 mb-6">
        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-variant/40 border border-white/5">
          <img
            alt={profile?.businessName || "Provider Profile"}
            className="w-10 h-10 rounded-full object-cover border border-primary/30"
            src={
              profile?.avatarUrl ||
              "https://lh3.googleusercontent.com/aida-public/AB6AXuDIWosHxjBDTN_a7wR3xSEeOeMKDKVBkEtVpl3lmIhrbma3ayo2E3QpegdyDEgaMacJutd7hwm5FhmHu6Vv0juQhyUlLYpd6ETKiGqscj19HlVrrrA3WUs8w1wk3MFDIH13eVzoA_kJ8mJMb_7tNCRCofNU2jDPVfQDdyPlLYDpfcJ1xaTv6bqx1KuHLAfTWmDCR_Yjp16aJoxqk_B1CIzgJHeovb-Uqsq0pxvDVR_Mcy0dINyUN-O_IA"
            }
          />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-on-surface truncate">
              {profile?.businessName || "LuxeCare Studio"}
            </span>
            <span className="text-xs text-primary font-medium">Elite Partner</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 flex flex-col gap-1 px-2 overflow-y-auto">
        {PROVIDER_MAIN_NAV.map((item) => {
          const isActive = item.isExact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3.5 py-2.5 flex items-center gap-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary-container text-on-primary-container font-semibold shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-white/5"
              )}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Secondary Links & Online Switch */}
      <div className="px-4 mt-auto flex flex-col gap-1 border-t border-white/5 pt-4">
        {PROVIDER_SECONDARY_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-on-surface-variant hover:text-on-surface hover:bg-white/5 rounded-lg px-3.5 py-2 flex items-center gap-3 text-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}

        {/* Go Online / Go Offline Button */}
        <button
          onClick={() => toggleOnline()}
          disabled={isTogglingOnline}
          className={cn(
            "mt-3 w-full font-medium text-sm py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 border",
            isOnline
              ? "bg-surface-container-high hover:bg-surface-variant text-on-surface border-white/10"
              : "bg-primary-container text-on-primary-container hover:bg-primary border-primary/30"
          )}
        >
          <div
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-all",
              isOnline
                ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                : "bg-zinc-500"
            )}
          />
          <span>{isOnline ? "Studio Online" : "Go Online"}</span>
        </button>
      </div>
    </aside>
  );
}
