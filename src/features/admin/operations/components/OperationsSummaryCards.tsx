"use client";

import React from "react";
import {
  Clock,
  UserCheck,
  Bike,
  Activity,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { OperationsSummaryMetrics } from "@/types/admin/operations";

interface OperationsSummaryCardsProps {
  metrics: OperationsSummaryMetrics | null;
  isLoading?: boolean;
}

export function OperationsSummaryCards({
  metrics,
  isLoading = false,
}: OperationsSummaryCardsProps) {
  const cards = [
    {
      title: "Needs Assignment",
      subtitle: "Confirmed bookings without provider",
      value: metrics?.needsAssignment ?? 0,
      icon: <Clock className="w-4 h-4 text-amber-500" />,
      colorClass: "border-amber-500/30 bg-amber-500/5",
      badgeClass: "text-amber-500 bg-amber-500/10",
    },
    {
      title: "Provider Assigned",
      subtitle: "Primary provider locked in",
      value: metrics?.providerAssigned ?? 0,
      icon: <UserCheck className="w-4 h-4 text-blue-500" />,
      colorClass: "border-blue-500/30 bg-blue-500/5",
      badgeClass: "text-blue-500 bg-blue-500/10",
    },
    {
      title: "Delivery Pending",
      subtitle: "Valet required for pickup/drop",
      value: metrics?.deliveryPending ?? 0,
      icon: <Bike className="w-4 h-4 text-purple-500" />,
      colorClass: "border-purple-500/30 bg-purple-500/5",
      badgeClass: "text-purple-500 bg-purple-500/10",
    },
    {
      title: "In Progress",
      subtitle: "Actively undergoing service",
      value: metrics?.inProgress ?? 0,
      icon: <Activity className="w-4 h-4 text-sky-500" />,
      colorClass: "border-sky-500/30 bg-sky-500/5",
      badgeClass: "text-sky-500 bg-sky-500/10",
    },
    {
      title: "Completed Today",
      subtitle: "Fulfilled service orders",
      value: metrics?.completedToday ?? 0,
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
      colorClass: "border-emerald-500/30 bg-emerald-500/5",
      badgeClass: "text-emerald-500 bg-emerald-500/10",
    },
    {
      title: "Cancelled Today",
      subtitle: "Cancelled operational orders",
      value: metrics?.cancelledToday ?? 0,
      icon: <XCircle className="w-4 h-4 text-rose-500" />,
      colorClass: "border-rose-500/30 bg-rose-500/5",
      badgeClass: "text-rose-500 bg-rose-500/10",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-surface-container-low border border-surface-variant/40 animate-pulse h-24"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c) => (
        <div
          key={c.title}
          className={`p-3.5 rounded-xl border ${c.colorClass} flex flex-col justify-between transition-all hover:border-surface-variant shadow-sm`}
        >
          <div className="flex items-center justify-between gap-1 mb-2">
            <span className="text-[11px] font-medium text-on-surface-variant truncate">
              {c.title}
            </span>
            <div className={`p-1.5 rounded-lg shrink-0 ${c.badgeClass}`}>
              {c.icon}
            </div>
          </div>
          <div>
            <span className="text-xl font-bold text-on-surface tracking-tight block">
              {c.value}
            </span>
            <span className="text-[10px] text-outline truncate block mt-0.5">
              {c.subtitle}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
