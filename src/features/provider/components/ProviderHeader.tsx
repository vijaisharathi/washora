"use client";

import React from "react";
import Link from "next/link";
import { useProviderSession } from "@/features/provider/hooks/useProviderSession";
import { cn } from "@/lib/utils";

interface ProviderHeaderProps {
  title?: string;
  subtitle?: string;
}

export function ProviderHeader({ title = "Partner Dashboard", subtitle }: ProviderHeaderProps) {
  const { profile, isOnline } = useProviderSession();

  return (
    <header className="bg-surface/80 backdrop-blur-xl fixed top-0 w-full md:w-[calc(100%-16rem)] z-30 border-b border-white/5 shadow-sm h-16 flex justify-between items-center px-4 md:px-8">
      {/* Mobile Brand */}
      <div className="flex items-center gap-2 md:hidden">
        <Link href="/provider" className="flex items-center gap-1.5">
          <span className="font-headline-md text-lg font-bold text-primary">WASHORA</span>
          <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-primary-container/30 text-primary border border-primary/20">
            Studio
          </span>
        </Link>
      </div>

      {/* Desktop Title & Status */}
      <div className="hidden md:flex items-center gap-3">
        <h1 className="text-lg font-bold text-on-surface tracking-tight">{title}</h1>
        {subtitle && <span className="text-xs text-on-surface-variant font-normal">| {subtitle}</span>}
        <span
          className={cn(
            "px-2.5 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-colors",
            isOnline
              ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/30"
              : "bg-zinc-900 text-zinc-400 border-zinc-700/40"
          )}
        >
          <div
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              isOnline ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"
            )}
          />
          {isOnline ? "Studio Accepting Orders" : "Offline"}
        </span>
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-3">
        <Link
          href="/provider/notifications"
          aria-label="Studio Notifications"
          className="text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors p-2 rounded-full active:scale-95 relative"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
        </Link>

        {/* Mobile Profile Avatar */}
        <Link
          href="/provider/settings"
          className="w-8 h-8 rounded-full bg-surface-variant border border-white/10 overflow-hidden cursor-pointer md:hidden flex items-center justify-center"
        >
          <img
            alt="Provider Avatar"
            className="w-full h-full object-cover"
            src={
              profile?.avatarUrl ||
              "https://lh3.googleusercontent.com/aida-public/AB6AXuDIWosHxjBDTN_a7wR3xSEeOeMKDKVBkEtVpl3lmIhrbma3ayo2E3QpegdyDEgaMacJutd7hwm5FhmHu6Vv0juQhyUlLYpd6ETKiGqscj19HlVrrrA3WUs8w1wk3MFDIH13eVzoA_kJ8mJMb_7tNCRCofNU2jDPVfQDdyPlLYDpfcJ1xaTv6bqx1KuHLAfTWmDCR_Yjp16aJoxqk_B1CIzgJHeovb-Uqsq0pxvDVR_Mcy0dINyUN-O_IA"
            }
          />
        </Link>
      </div>
    </header>
  );
}
