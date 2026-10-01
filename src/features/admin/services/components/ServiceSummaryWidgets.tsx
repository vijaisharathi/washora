"use client";

import React from "react";
import { Layers, CheckCircle2, PauseCircle, Archive } from "lucide-react";
import { ServiceSummaryMetrics } from "@/types/admin";

interface ServiceSummaryWidgetsProps {
  metrics: ServiceSummaryMetrics | null;
  isLoading?: boolean;
}

export function ServiceSummaryWidgets({
  metrics,
  isLoading = false,
}: ServiceSummaryWidgetsProps) {
  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
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

  const activePct =
    metrics.total > 0 ? Math.round((metrics.active / metrics.total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* 1. Total Services */}
      <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4 flex flex-col justify-between hover:border-outline-variant transition-colors relative overflow-hidden group">
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-outline uppercase tracking-wider">
            Total Services
          </span>
          <div className="p-1.5 rounded-lg bg-primary/15 text-primary">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="my-1">
          <span className="text-2xl font-bold font-display text-on-surface">
            {metrics.total}
          </span>
        </div>
        <div className="flex items-center gap-1 text-on-surface-variant text-[11px] font-medium">
          <span>{activePct}% currently active</span>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-surface-variant group-hover:bg-primary transition-colors" />
      </div>

      {/* 2. Active Services */}
      <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4 flex flex-col justify-between hover:border-emerald-500/40 transition-colors relative overflow-hidden group">
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-outline uppercase tracking-wider">
            Active
          </span>
          <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-500">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="my-1">
          <span className="text-2xl font-bold font-display text-emerald-500">
            {metrics.active}
          </span>
        </div>
        <div className="flex items-center gap-1 text-emerald-600/80 text-[11px] font-medium">
          <span>Available for booking</span>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-surface-variant group-hover:bg-emerald-500 transition-colors" />
      </div>

      {/* 3. Inactive Services */}
      <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4 flex flex-col justify-between hover:border-amber-500/40 transition-colors relative overflow-hidden group">
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-outline uppercase tracking-wider">
            Inactive
          </span>
          <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-500">
            <PauseCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="my-1">
          <span className="text-2xl font-bold font-display text-amber-500">
            {metrics.inactive}
          </span>
        </div>
        <div className="flex items-center gap-1 text-amber-600/80 text-[11px] font-medium">
          <span>Temporarily paused</span>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-surface-variant group-hover:bg-amber-500 transition-colors" />
      </div>

      {/* 4. Archived Services */}
      <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4 flex flex-col justify-between hover:border-outline-variant transition-colors relative overflow-hidden group">
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-outline uppercase tracking-wider">
            Archived
          </span>
          <div className="p-1.5 rounded-lg bg-surface-container-high text-on-surface-variant">
            <Archive className="w-4 h-4" />
          </div>
        </div>
        <div className="my-1">
          <span className="text-2xl font-bold font-display text-on-surface-variant">
            {metrics.archived}
          </span>
        </div>
        <div className="flex items-center gap-1 text-outline text-[11px] font-medium">
          <span>Permanently retired</span>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-surface-variant group-hover:bg-outline transition-colors" />
      </div>
    </div>
  );
}
