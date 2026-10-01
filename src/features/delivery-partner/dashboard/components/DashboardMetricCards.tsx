"use client";

import React from "react";
import { Navigation, Package, CheckCircle2, IndianRupee, ArrowUpRight } from "lucide-react";
import { DeliveryPartnerDashboardSummary } from "@/types/delivery-partner";

interface DashboardMetricCardsProps {
  summary: DeliveryPartnerDashboardSummary;
}

export function DashboardMetricCards({ summary }: DashboardMetricCardsProps) {
  const earningsProgress = Math.min(
    100,
    Math.round((summary.todayEarningsAmount / summary.todayTargetEarnings) * 100)
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Metric 1: Active Deliveries */}
      <div className="p-5 rounded-3xl bg-surface-container/70 border border-outline-variant/25 relative overflow-hidden group hover:border-primary/40 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-on-surface-variant">Active Transit Jobs</span>
          <div className="w-9 h-9 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
            <Navigation className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-2xl lg:text-3xl font-extrabold text-on-surface font-mono">
            {summary.activeDeliveriesCount}
          </p>
          <p className="text-[11px] text-purple-400 font-medium flex items-center gap-1">
            <span>In flight on live route</span>
          </p>
        </div>
      </div>

      {/* Metric 2: Pending Pickups */}
      <div className="p-5 rounded-3xl bg-surface-container/70 border border-outline-variant/25 relative overflow-hidden group hover:border-primary/40 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-on-surface-variant">Pending Pickups</span>
          <div className="w-9 h-9 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
            <Package className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-2xl lg:text-3xl font-extrabold text-on-surface font-mono">
            {summary.pendingPickupsCount}
          </p>
          <p className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
            <span>Ready at hub & doorsteps</span>
          </p>
        </div>
      </div>

      {/* Metric 3: Today Completed Runs */}
      <div className="p-5 rounded-3xl bg-surface-container/70 border border-outline-variant/25 relative overflow-hidden group hover:border-primary/40 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-on-surface-variant">Completed Today</span>
          <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-2xl lg:text-3xl font-extrabold text-on-surface font-mono">
            {summary.todayCompletedCount}
          </p>
          <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+24% vs yesterday</span>
          </p>
        </div>
      </div>

      {/* Metric 4: Today's Earnings */}
      <div className="p-5 rounded-3xl bg-surface-container/70 border border-outline-variant/25 relative overflow-hidden group hover:border-primary/40 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-on-surface-variant">Today&apos;s Estimated Payout</span>
          <div className="w-9 h-9 rounded-2xl bg-primary/15 text-primary flex items-center justify-center">
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <p className="text-2xl lg:text-3xl font-extrabold text-on-surface font-mono">
              ₹{summary.todayEarningsAmount.toLocaleString("en-IN")}
            </p>
            <span className="text-[10px] text-on-surface-variant font-mono">
              Goal: ₹{summary.todayTargetEarnings.toLocaleString("en-IN")}
            </span>
          </div>

          {/* Progress bar towards daily goal */}
          <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${earningsProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
