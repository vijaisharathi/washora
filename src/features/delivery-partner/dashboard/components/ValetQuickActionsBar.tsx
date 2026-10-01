"use client";

import React from "react";
import Link from "next/link";
import {
  UserCheck,
  Calendar,
  Wallet,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
  Bike,
} from "lucide-react";

export function ValetQuickActionsBar() {
  const actions = [
    {
      title: "Profile & Vehicle Setup",
      subtitle: "RC, DL, Hub & Payout Bank",
      href: "/delivery-partner/profile",
      icon: UserCheck,
      color: "text-primary bg-primary/15",
      isReady: true,
    },
    {
      title: "Shift Scheduling",
      subtitle: "Manage weekly valet slots",
      href: "#",
      icon: Calendar,
      color: "text-amber-400 bg-amber-500/15",
      badge: "D7",
      isReady: false,
    },
    {
      title: "Earnings & Payouts",
      subtitle: "Instant bank settlement summary",
      href: "#",
      icon: Wallet,
      color: "text-emerald-400 bg-emerald-500/15",
      badge: "D8",
      isReady: false,
    },
    {
      title: "Valet Support Desk",
      subtitle: "24x7 Roadside & Hub Assist",
      href: "#",
      icon: HelpCircle,
      color: "text-purple-400 bg-purple-500/15",
      badge: "D12",
      isReady: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((act) => {
        const Icon = act.icon;

        if (!act.isReady) {
          return (
            <div
              key={act.title}
              className="p-4 rounded-2xl bg-surface-container/60 border border-outline-variant/15 flex items-center justify-between text-on-surface-variant/50 cursor-not-allowed select-none"
              title={`Unlocked in phase ${act.badge}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-surface-container-highest text-on-surface-variant/40 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-on-surface-variant/70 truncate">
                    {act.title}
                  </p>
                  <p className="text-[10px] text-on-surface-variant/40 truncate">{act.subtitle}</p>
                </div>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-container-highest font-mono text-on-surface-variant/60">
                {act.badge}
              </span>
            </div>
          );
        }

        return (
          <Link
            key={act.title}
            href={act.href}
            className="p-4 rounded-2xl bg-surface-container/80 border border-outline-variant/20 hover:border-primary/40 hover:bg-surface-container transition-all flex items-center justify-between group shadow-sm"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-xl ${act.color} flex items-center justify-center shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                  {act.title}
                </p>
                <p className="text-[10px] text-on-surface-variant truncate">{act.subtitle}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-on-surface-variant group-hover:text-primary transition-colors shrink-0" />
          </Link>
        );
      })}
    </div>
  );
}
