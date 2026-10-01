"use client";

import React from "react";
import Link from "next/link";
import { ProviderAccountOverview } from "@/types/provider/settings";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

interface AccountOverviewBentoProps {
  account: ProviderAccountOverview;
}

export function AccountOverviewBento({ account }: AccountOverviewBentoProps) {
  return (
    <div className="space-y-6">
      {/* Profile & Business Hero Card */}
      <ProviderCard
        variant="container"
        className="p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 border-l-4 border-l-primary"
      >
        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/30 shrink-0 relative bg-surface-container-high flex items-center justify-center font-bold text-2xl text-primary">
          {account.name.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="text-xl font-extrabold text-on-surface">{account.name}</h3>
            {account.isVerified && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">verified</span>
                <span>Verified Studio Partner</span>
              </span>
            )}
          </div>

          <p className="text-xs text-on-surface-variant mb-3">
            <span className="font-semibold text-on-surface">{account.businessName}</span> •{" "}
            {account.email} • Joined {account.joinedDate}
          </p>

          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/provider/profile"
              className="px-3.5 py-1.5 rounded-lg border border-white/10 hover:bg-surface-container-high text-xs font-semibold text-on-surface transition-colors"
            >
              Edit Business Profile
            </Link>
            <Link
              href="/provider/services"
              className="px-3.5 py-1.5 rounded-lg border border-white/10 hover:bg-surface-container-high text-xs font-semibold text-on-surface transition-colors"
            >
              Service Catalog
            </Link>
          </div>
        </div>
      </ProviderCard>

      {/* 4-Card Quick Access Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/provider/profile" className="block group">
          <ProviderCard variant="container" className="p-5 h-full space-y-2 hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-[20px]">person</span>
              <h4 className="text-xs font-bold text-on-surface group-hover:text-primary">Profile Info</h4>
            </div>
            <p className="text-[11px] text-on-surface-variant">Update studio owner identity and contacts.</p>
          </ProviderCard>
        </Link>

        <Link href="/provider/availability" className="block group">
          <ProviderCard variant="container" className="p-5 h-full space-y-2 hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-[20px]">calendar_month</span>
              <h4 className="text-xs font-bold text-on-surface group-hover:text-primary">Operating Hours</h4>
            </div>
            <p className="text-[11px] text-on-surface-variant">Manage daily intake and blackout dates.</p>
          </ProviderCard>
        </Link>

        <Link href="/provider/earnings" className="block group">
          <ProviderCard variant="container" className="p-5 h-full space-y-2 hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-[20px]">account_balance</span>
              <h4 className="text-xs font-bold text-on-surface group-hover:text-primary">Payout Account</h4>
            </div>
            <p className="text-[11px] text-on-surface-variant">Bank settlement details and history.</p>
          </ProviderCard>
        </Link>

        <Link href="/provider/notifications/preferences" className="block group">
          <ProviderCard variant="container" className="p-5 h-full space-y-2 hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-[20px]">notifications_active</span>
              <h4 className="text-xs font-bold text-on-surface group-hover:text-primary">Notification Alerts</h4>
            </div>
            <p className="text-[11px] text-on-surface-variant">Push, SMS, and Email alert preferences.</p>
          </ProviderCard>
        </Link>
      </div>
    </div>
  );
}
