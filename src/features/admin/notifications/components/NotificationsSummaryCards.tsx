"use client";

import React from "react";
import {
  Bell,
  MailCheck,
  AlertTriangle,
  Flame,
  ShieldAlert,
  Clock,
} from "lucide-react";
import { NotificationSummaryMetrics } from "@/types/admin/notification";

interface NotificationsSummaryCardsProps {
  metrics: NotificationSummaryMetrics | null;
  isLoading?: boolean;
}

export function NotificationsSummaryCards({
  metrics,
  isLoading,
}: NotificationsSummaryCardsProps) {
  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 my-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 animate-pulse space-y-2.5"
          >
            <div className="w-6 h-6 rounded-md bg-surface-container-high" />
            <div className="w-16 h-3 rounded bg-surface-container-high" />
            <div className="w-24 h-5 rounded bg-surface-container-high" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Notifications",
      value: metrics.totalNotifications.toString(),
      subtitle: "Active in current view",
      icon: Bell,
      color: "text-primary",
      bgColor: "bg-primary/10 border-primary/20",
    },
    {
      title: "Unread Alerts",
      value: metrics.unreadCount.toString(),
      subtitle: "Requires attention",
      icon: MailCheck,
      color: metrics.unreadCount > 0 ? "text-rose-500" : "text-emerald-500",
      bgColor: metrics.unreadCount > 0 ? "bg-rose-500/10 border-rose-500/20" : "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Critical Priority",
      value: metrics.criticalCount.toString(),
      subtitle: "Immediate SLA risk",
      icon: Flame,
      color: "text-rose-500",
      bgColor: "bg-rose-500/10 border-rose-500/20",
    },
    {
      title: "High Priority",
      value: metrics.highPriorityCount.toString(),
      subtitle: "Operational escalation",
      icon: AlertTriangle,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10 border-amber-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 my-6">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 hover:border-outline-variant/60 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-on-surface-variant">
                {c.title}
              </span>
              <div
                className={`w-7 h-7 rounded-lg border flex items-center justify-center ${c.bgColor}`}
              >
                <Icon className={`w-3.5 h-3.5 ${c.color}`} />
              </div>
            </div>
            <div>
              <div className="text-xl font-bold text-on-surface tracking-tight">
                {c.value}
              </div>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                {c.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
