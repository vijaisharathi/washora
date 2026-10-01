"use client";

import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useDeliveryPartnerDashboard } from "../hooks/useDeliveryPartnerDashboard";
import { DashboardDutyStatusHero } from "./DashboardDutyStatusHero";
import { DashboardMetricCards } from "./DashboardMetricCards";
import { ActiveTaskInFlightCard } from "./ActiveTaskInFlightCard";
import { TodayTaskQueueCard } from "./TodayTaskQueueCard";
import { PerformanceMetricsBento } from "./PerformanceMetricsBento";
import { ValetQuickActionsBar } from "./ValetQuickActionsBar";

export function DeliveryPartnerDashboardMasterView() {
  const { summary, isLoading, isError, error, refetch } = useDeliveryPartnerDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Skeleton Hero */}
        <div className="h-44 rounded-3xl bg-surface-container animate-pulse border border-outline-variant/20" />

        {/* Skeleton Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-3xl bg-surface-container animate-pulse border border-outline-variant/20" />
          ))}
        </div>

        {/* Skeleton Tasks */}
        <div className="h-64 rounded-3xl bg-surface-container animate-pulse border border-outline-variant/20" />
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-4 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-error/15 text-error flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-on-surface">Unable to load valet dashboard</h2>
          <p className="text-xs text-on-surface-variant">
            {error instanceof Error ? error.message : "A connection issue occurred while fetching dispatch data."}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:opacity-95 transition-opacity flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Dispatch Sync</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. Live Duty Status Hero */}
      <DashboardDutyStatusHero summary={summary} />

      {/* 2. Key Operational Metric Cards */}
      <DashboardMetricCards summary={summary} />

      {/* 3. In-Flight Active Task */}
      <ActiveTaskInFlightCard task={summary.currentActiveTask} />

      {/* 4. Task Queue & Performance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TodayTaskQueueCard tasks={summary.todayTaskQueue} />
        </div>
        <div className="space-y-6">
          <PerformanceMetricsBento metrics={summary.metrics} />
        </div>
      </div>

      {/* 5. Valet Quick Actions */}
      <div className="space-y-2 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/70 px-1">
          Valet Operations Shortcuts
        </h3>
        <ValetQuickActionsBar />
      </div>
    </div>
  );
}
