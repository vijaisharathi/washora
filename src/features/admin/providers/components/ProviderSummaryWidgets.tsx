"use client";

import React from "react";
import {
  Users,
  UserCheck,
  Clock,
  AlertTriangle,
  Ban,
  CalendarPlus,
} from "lucide-react";
import { ProviderSummaryMetrics } from "@/types/admin";

interface ProviderSummaryWidgetsProps {
  metrics: ProviderSummaryMetrics | null;
  isLoading?: boolean;
}

export function ProviderSummaryWidgets({
  metrics,
  isLoading = false,
}: ProviderSummaryWidgetsProps) {
  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-surface-container-low border border-surface-variant/40 rounded-xl p-4 h-28 animate-pulse flex flex-col justify-between"
          >
            <div className="h-4 w-20 bg-surface-container-highest rounded" />
            <div className="h-7 w-16 bg-surface-container-highest rounded" />
            <div className="h-3 w-24 bg-surface-container-highest rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* Widget 1: Total Providers */}
      <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4 flex flex-col justify-between hover:border-outline-variant transition-colors relative overflow-hidden">
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-outline uppercase tracking-wider">
            Total Providers
          </span>
          <div className="p-1.5 rounded-lg bg-primary/15 text-primary">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="my-1">
          <span className="text-2xl font-bold font-display text-on-surface">
            {metrics.totalProviders}
          </span>
        </div>
        <div className="flex items-center gap-1 text-on-surface-variant text-[11px] font-medium">
          <span>{metrics.activeRatePct}% active rate</span>
        </div>
      </div>

      {/* Widget 2: Active Providers */}
      <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4 flex flex-col justify-between hover:border-outline-variant transition-colors relative overflow-hidden">
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-outline uppercase tracking-wider">
            Active Partners
          </span>
          <div className="p-1.5 rounded-lg bg-success/15 text-success">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="my-1">
          <span className="text-2xl font-bold font-display text-on-surface">
            {metrics.activeProviders}
          </span>
        </div>
        <div className="flex items-center gap-1 text-success text-[11px] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span>Ready for dispatch</span>
        </div>
      </div>

      {/* Widget 3: Pending Review */}
      <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4 flex flex-col justify-between hover:border-outline-variant transition-colors relative overflow-hidden">
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-outline uppercase tracking-wider">
            Pending Review
          </span>
          <div className="p-1.5 rounded-lg bg-warning/15 text-warning">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="my-1">
          <span
            className={`text-2xl font-bold font-display ${
              metrics.pendingReviewProviders > 0 ? "text-warning" : "text-on-surface"
            }`}
          >
            {metrics.pendingReviewProviders}
          </span>
        </div>
        <div className="flex items-center gap-1 text-warning text-[11px] font-medium">
          <span>Awaiting approval</span>
        </div>
      </div>

      {/* Widget 4: Action Required */}
      <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4 flex flex-col justify-between hover:border-outline-variant transition-colors relative overflow-hidden">
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-outline uppercase tracking-wider">
            Action Needed
          </span>
          <div className="p-1.5 rounded-lg bg-critical/15 text-critical">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="my-1">
          <span
            className={`text-2xl font-bold font-display ${
              metrics.actionRequiredProviders > 0 ? "text-critical" : "text-on-surface"
            }`}
          >
            {metrics.actionRequiredProviders}
          </span>
        </div>
        <div className="flex items-center gap-1 text-critical text-[11px] font-medium">
          <span>Pending or flagged</span>
        </div>
      </div>

      {/* Widget 5: Suspended Providers */}
      <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4 flex flex-col justify-between hover:border-outline-variant transition-colors relative overflow-hidden">
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-outline uppercase tracking-wider">
            Suspended
          </span>
          <div className="p-1.5 rounded-lg bg-surface-container-highest text-outline">
            <Ban className="w-4 h-4" />
          </div>
        </div>
        <div className="my-1">
          <span
            className={`text-2xl font-bold font-display ${
              metrics.suspendedProviders > 0 ? "text-critical" : "text-on-surface"
            }`}
          >
            {metrics.suspendedProviders}
          </span>
        </div>
        <div className="flex items-center gap-1 text-outline text-[11px] font-medium">
          <span>Access blocked</span>
        </div>
      </div>

      {/* Widget 6: New This Month */}
      <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4 flex flex-col justify-between hover:border-outline-variant transition-colors relative overflow-hidden">
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-outline uppercase tracking-wider">
            New This Month
          </span>
          <div className="p-1.5 rounded-lg bg-info/15 text-info">
            <CalendarPlus className="w-4 h-4" />
          </div>
        </div>
        <div className="my-1">
          <span className="text-2xl font-bold font-display text-on-surface">
            {metrics.newThisMonth}
          </span>
        </div>
        <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
          <div
            className="h-full bg-info rounded-full"
            style={{
              width: `${Math.min(
                100,
                Math.round(
                  (metrics.newThisMonth / Math.max(1, metrics.totalProviders)) * 100
                )
              )}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
