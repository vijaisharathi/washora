"use client";

import React from "react";
import Link from "next/link";
import { useProviderDashboard } from "@/features/provider/dashboard/hooks/useProviderDashboard";
import { useProviderProfile } from "@/features/provider/profile/hooks/useProviderProfile";
import { useProviderSession } from "@/features/provider/hooks/useProviderSession";
import { ProviderLoadingState } from "@/features/provider/components/ProviderLoadingState";
import { ProviderErrorState } from "@/features/provider/components/ProviderErrorState";
import { DashboardKpiGrid } from "./DashboardKpiGrid";
import { UrgentActionsCard } from "./UrgentActionsCard";
import { OrderPipelineWidget } from "./OrderPipelineWidget";
import { TodayScheduleWidget } from "./TodayScheduleWidget";
import { WeeklyRevenueChart } from "./WeeklyRevenueChart";
import { RecentActivityFeed } from "./RecentActivityFeed";

export function ProviderDashboardView() {
  const { data, isLoading, isError, refresh, isRefreshing } = useProviderDashboard();
  const { profile } = useProviderProfile();
  const { isOnline, toggleOnline, isTogglingOnline } = useProviderSession();

  if (isLoading) {
    return <ProviderLoadingState message="Loading Studio Operations Dashboard..." />;
  }

  if (isError || !data) {
    return <ProviderErrorState title="Unable to load operations dashboard" onRetry={() => refresh()} />;
  }

  const businessName = profile?.identity?.businessName || "LuxeCare Garment Studio";
  const ownerName = profile?.identity?.legalEntityName?.split(" ")[0] || "Rajesh";

  return (
    <div className="space-y-6">
      {/* Studio Greeting & Operational Status Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight">
              Good morning, {businessName}
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary-container/30 text-primary border border-primary/20">
              Elite Pro
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Here is your live care queue, valet dispatches, and fulfillment operations for today.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => refresh()}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-variant text-xs font-semibold text-on-surface transition-colors border border-white/5 flex items-center gap-1.5"
          >
            <span className={`material-symbols-outlined text-[16px] ${isRefreshing ? "animate-spin" : ""}`}>
              sync
            </span>
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => toggleOnline()}
            disabled={isTogglingOnline}
            className="px-4 py-2 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary text-xs font-bold transition-all shadow-md shadow-primary/20 flex items-center gap-2"
          >
            <div
              className={`w-2 h-2 rounded-full ${
                isOnline ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-zinc-500"
              }`}
            />
            <span>{isOnline ? "Studio Online" : "Go Online"}</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Metrics */}
      <DashboardKpiGrid summary={data.summary} />

      {/* Urgent Action Alerts */}
      <UrgentActionsCard actions={data.urgentActions} />

      {/* Main Operations Grid: Left (Pipeline + Chart) | Right (Schedule + Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Pipeline & Revenue Chart */}
        <div className="lg:col-span-8 space-y-6">
          <OrderPipelineWidget stages={data.pipeline} />
          <WeeklyRevenueChart data={data.weeklyRevenue} />
        </div>

        {/* Right Column (4 cols): Today's Schedule & Recent Activity */}
        <div className="lg:col-span-4 space-y-6">
          <TodayScheduleWidget items={data.todaySchedule} />
          <RecentActivityFeed activities={data.recentActivities} />
        </div>
      </div>

      {/* Quick Access Action Bar */}
      <div className="p-4 rounded-xl bg-surface-container border border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-on-surface-variant font-medium">Quick Workspace Navigation:</span>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/provider/profile"
            className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface font-semibold transition-colors border border-white/5 flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[14px]">store</span>
            <span>Business Setup</span>
          </Link>
          <Link
            href="/provider/settings"
            className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface font-semibold transition-colors border border-white/5 flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[14px]">tune</span>
            <span>Studio Shifts</span>
          </Link>
          <Link
            href="/provider/orders"
            className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 font-semibold transition-colors border border-primary/30 flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[14px]">list_alt</span>
            <span>View All Bookings</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
