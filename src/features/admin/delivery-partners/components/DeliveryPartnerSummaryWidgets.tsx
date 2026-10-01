"use client";

import React from "react";
import {
  Users,
  Wifi,
  Bike,
  Clock,
  AlertTriangle,
  Ban,
} from "lucide-react";
import { DeliveryPartnerSummaryMetrics } from "@/types/admin";

interface DeliveryPartnerSummaryWidgetsProps {
  metrics: DeliveryPartnerSummaryMetrics | null;
  isLoading?: boolean;
}

export function DeliveryPartnerSummaryWidgets({
  metrics,
  isLoading = false,
}: DeliveryPartnerSummaryWidgetsProps) {
  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
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
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {/* Widget 1: Total Partners */}
      <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4 flex flex-col justify-between hover:border-outline-variant transition-colors relative overflow-hidden group">
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-outline uppercase tracking-wider">
            Total Partners
          </span>
          <div className="p-1.5 rounded-lg bg-primary/15 text-primary">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="my-1">
          <span className="text-2xl font-bold font-display text-on-surface">
            {metrics.totalPartners}
          </span>
        </div>
        <div className="flex items-center gap-1 text-on-surface-variant text-[11px] font-medium">
          <span>{metrics.activeRatePct}% active rate</span>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-surface-variant group-hover:bg-primary transition-colors" />
      </div>

      {/* Widget 2: Online Now */}
      <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4 flex flex-col justify-between hover:border-outline-variant transition-colors relative overflow-hidden group">
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-outline uppercase tracking-wider">
            Online Now
          </span>
          <div className="p-1.5 rounded-lg bg-success/15 text-success">
            <Wifi className="w-4 h-4" />
          </div>
        </div>
        <div className="my-1">
          <span className="text-2xl font-bold font-display text-on-surface">
            {metrics.onlinePartners}
          </span>
        </div>
        <div className="flex items-center gap-1 text-success text-[11px] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span>Active shifts</span>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-surface-variant group-hover:bg-success transition-colors" />
      </div>

      {/* Widget 3: Active Fleet */}
      <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4 flex flex-col justify-between hover:border-outline-variant transition-colors relative overflow-hidden group">
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-outline uppercase tracking-wider">
            Active Fleet
          </span>
          <div className="p-1.5 rounded-lg bg-info/15 text-info">
            <Bike className="w-4 h-4" />
          </div>
        </div>
        <div className="my-1">
          <span className="text-2xl font-bold font-display text-on-surface">
            {metrics.activePartners}
          </span>
        </div>
        <div className="flex items-center gap-1 text-info text-[11px] font-medium">
          <span>Ready for dispatch</span>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-surface-variant group-hover:bg-info transition-colors" />
      </div>

      {/* Widget 4: Pending Review */}
      <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4 flex flex-col justify-between hover:border-outline-variant transition-colors relative overflow-hidden group">
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
              metrics.pendingReviewPartners > 0 ? "text-warning" : "text-on-surface"
            }`}
          >
            {metrics.pendingReviewPartners}
          </span>
        </div>
        <div className="flex items-center gap-1 text-warning text-[11px] font-medium">
          <span>Awaiting approval</span>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-surface-variant group-hover:bg-warning transition-colors" />
      </div>

      {/* Widget 5: Action Required */}
      <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4 flex flex-col justify-between hover:border-outline-variant transition-colors relative overflow-hidden group">
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-outline uppercase tracking-wider">
            Action Req
          </span>
          <div className="p-1.5 rounded-lg bg-critical/15 text-critical">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="my-1">
          <span
            className={`text-2xl font-bold font-display ${
              metrics.actionRequiredPartners > 0
                ? "text-critical"
                : "text-on-surface"
            }`}
          >
            {metrics.actionRequiredPartners}
          </span>
        </div>
        <div className="flex items-center gap-1 text-critical text-[11px] font-medium">
          <span>Pending or flagged</span>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-surface-variant group-hover:bg-critical transition-colors" />
      </div>

      {/* Widget 6: Suspended */}
      <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4 flex flex-col justify-between hover:border-outline-variant transition-colors relative overflow-hidden group">
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
              metrics.suspendedPartners > 0
                ? "text-critical"
                : "text-on-surface"
            }`}
          >
            {metrics.suspendedPartners}
          </span>
        </div>
        <div className="flex items-center gap-1 text-outline text-[11px] font-medium">
          <span>Access blocked</span>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-surface-variant group-hover:bg-on-surface-variant transition-colors" />
      </div>
    </div>
  );
}
