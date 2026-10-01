"use client";

import React from "react";
import {
  Activity,
  ShoppingBag,
  CheckCircle2,
  Store,
  Bike,
  CreditCard,
  XCircle,
  Clock,
  User,
} from "lucide-react";
import { DashboardActivity, DashboardActivityType } from "@/types/admin";

interface RecentActivityFeedProps {
  activities: DashboardActivity[];
}

export function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  const getActivityIcon = (type: DashboardActivityType) => {
    switch (type) {
      case "booking_created":
        return <ShoppingBag className="w-4 h-4 text-primary" />;
      case "booking_completed":
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case "provider_status":
        return <Store className="w-4 h-4 text-tertiary" />;
      case "delivery_partner_active":
        return <Bike className="w-4 h-4 text-info" />;
      case "payment_recorded":
        return <CreditCard className="w-4 h-4 text-success" />;
      case "booking_cancelled":
        return <XCircle className="w-4 h-4 text-critical" />;
      default:
        return <Activity className="w-4 h-4 text-primary" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return "bg-success/15 text-success border-success/30";
      case "warning":
        return "bg-warning/15 text-warning border-warning/30";
      case "critical":
        return "bg-critical/15 text-critical border-critical/30";
      default:
        return "bg-info/15 text-info border-info/30";
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <span>Recent Operational Log</span>
        </h3>
        <span className="text-[10px] text-on-surface-variant font-mono">
          Live stream
        </span>
      </div>

      <div className="space-y-3">
        {activities.map((act) => (
          <div
            key={act.id}
            className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/20 hover:border-outline-variant/50 transition-all flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-surface-container-high border border-outline-variant/30 flex items-center justify-center shrink-0 mt-0.5">
              {getActivityIcon(act.type)}
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-xs font-semibold text-on-surface truncate">
                  {act.description}
                </p>
                <span className="text-[10px] text-on-surface-variant font-mono shrink-0">
                  {act.timeAgo}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-on-surface-variant flex-wrap">
                <span className="font-mono text-primary font-bold">
                  {act.relatedEntityId}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {act.actor}
                </span>
                <span className="ml-auto">
                  <span
                    className={`px-2 py-0.2 rounded-full text-[9px] font-bold border uppercase ${getStatusBadge(
                      act.status
                    )}`}
                  >
                    {act.status}
                  </span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
