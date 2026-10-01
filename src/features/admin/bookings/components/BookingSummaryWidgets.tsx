"use client";

import React from "react";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Activity,
  CheckCheck,
  XCircle,
} from "lucide-react";
import { BookingSummaryMetrics } from "@/types/admin";

interface BookingSummaryWidgetsProps {
  metrics: BookingSummaryMetrics | null;
  isLoading?: boolean;
}

export function BookingSummaryWidgets({
  metrics,
  isLoading = false,
}: BookingSummaryWidgetsProps) {
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

  const completionRate =
    metrics.total > 0
      ? Math.round((metrics.completed / metrics.total) * 100)
      : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {/* 1. Total */}
      <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4 flex flex-col justify-between hover:border-outline-variant transition-colors relative overflow-hidden group">
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-outline uppercase tracking-wider">
            Total Orders
          </span>
          <div className="p-1.5 rounded-lg bg-primary/15 text-primary">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>
        <div className="my-1">
          <span className="text-2xl font-bold font-display text-on-surface">
            {metrics.total}
          </span>
        </div>
        <div className="flex items-center gap-1 text-on-surface-variant text-[11px] font-medium">
          <span>{completionRate}% completed</span>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-surface-variant group-hover:bg-primary transition-colors" />
      </div>

      {/* 2. Pending */}
      <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4 flex flex-col justify-between hover:border-amber-500/40 transition-colors relative overflow-hidden group">
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-outline uppercase tracking-wider">
            Pending
          </span>
          <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-500">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="my-1">
          <span className="text-2xl font-bold font-display text-amber-500">
            {metrics.pending}
          </span>
        </div>
        <div className="flex items-center gap-1 text-amber-600/80 text-[11px] font-medium">
          <span>Needs ops confirmation</span>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-surface-variant group-hover:bg-amber-500 transition-colors" />
      </div>

      {/* 3. Confirmed */}
      <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4 flex flex-col justify-between hover:border-blue-500/40 transition-colors relative overflow-hidden group">
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-outline uppercase tracking-wider">
            Confirmed
          </span>
          <div className="p-1.5 rounded-lg bg-blue-500/15 text-blue-500">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="my-1">
          <span className="text-2xl font-bold font-display text-blue-500">
            {metrics.confirmed}
          </span>
        </div>
        <div className="flex items-center gap-1 text-blue-600/80 text-[11px] font-medium">
          <span>Ready for execution</span>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-surface-variant group-hover:bg-blue-500 transition-colors" />
      </div>

      {/* 4. In Progress */}
      <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4 flex flex-col justify-between hover:border-purple-500/40 transition-colors relative overflow-hidden group">
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-outline uppercase tracking-wider">
            In Progress
          </span>
          <div className="p-1.5 rounded-lg bg-purple-500/15 text-purple-500">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="my-1">
          <span className="text-2xl font-bold font-display text-purple-500">
            {metrics.inProgress}
          </span>
        </div>
        <div className="flex items-center gap-1 text-purple-600/80 text-[11px] font-medium">
          <span>Active processing</span>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-surface-variant group-hover:bg-purple-500 transition-colors" />
      </div>

      {/* 5. Completed */}
      <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4 flex flex-col justify-between hover:border-emerald-500/40 transition-colors relative overflow-hidden group">
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-outline uppercase tracking-wider">
            Completed
          </span>
          <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-500">
            <CheckCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="my-1">
          <span className="text-2xl font-bold font-display text-emerald-500">
            {metrics.completed}
          </span>
        </div>
        <div className="flex items-center gap-1 text-emerald-600/80 text-[11px] font-medium">
          <span>Fulfilled & delivered</span>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-surface-variant group-hover:bg-emerald-500 transition-colors" />
      </div>

      {/* 6. Cancelled */}
      <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4 flex flex-col justify-between hover:border-rose-500/40 transition-colors relative overflow-hidden group">
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-outline uppercase tracking-wider">
            Cancelled
          </span>
          <div className="p-1.5 rounded-lg bg-rose-500/15 text-rose-500">
            <XCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="my-1">
          <span className="text-2xl font-bold font-display text-on-surface-variant">
            {metrics.cancelled}
          </span>
        </div>
        <div className="flex items-center gap-1 text-on-surface-variant/80 text-[11px] font-medium">
          <span>Terminated</span>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-surface-variant group-hover:bg-rose-500 transition-colors" />
      </div>
    </div>
  );
}
