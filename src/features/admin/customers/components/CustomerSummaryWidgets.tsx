"use client";

import React from "react";
import {
  Users,
  UserCheck,
  UserPlus,
  ShoppingBag,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { CustomerSummaryMetrics } from "@/types/admin";

interface CustomerSummaryWidgetsProps {
  metrics: CustomerSummaryMetrics | null;
  isLoading?: boolean;
}

export function CustomerSummaryWidgets({
  metrics,
  isLoading = false,
}: CustomerSummaryWidgetsProps) {
  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {/* Widget 1: Total Customers */}
      <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4 flex flex-col justify-between hover:border-outline-variant transition-colors relative overflow-hidden">
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-outline uppercase tracking-wider">
            Total Customers
          </span>
          <div className="p-1.5 rounded-lg bg-primary/15 text-primary">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="my-1">
          <span className="text-2xl font-bold font-display text-on-surface">
            {metrics.totalCustomers}
          </span>
        </div>
        <div className="flex items-center gap-1 text-success text-[11px] font-medium">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>+12.5% vs last month</span>
        </div>
      </div>

      {/* Widget 2: Active Customers */}
      <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4 flex flex-col justify-between hover:border-outline-variant transition-colors relative overflow-hidden">
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-outline uppercase tracking-wider">
            Active Accounts
          </span>
          <div className="p-1.5 rounded-lg bg-success/15 text-success">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="my-1">
          <span className="text-2xl font-bold font-display text-on-surface">
            {metrics.activeCustomers}
          </span>
        </div>
        <div className="flex items-center gap-1 text-success text-[11px] font-medium">
          <span>{metrics.activeRatePct}% active rate</span>
        </div>
      </div>

      {/* Widget 3: New This Month */}
      <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4 flex flex-col justify-between hover:border-outline-variant transition-colors relative overflow-hidden">
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-outline uppercase tracking-wider">
            New This Month
          </span>
          <div className="p-1.5 rounded-lg bg-info/15 text-info">
            <UserPlus className="w-4 h-4" />
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
              width: `${Math.min(100, Math.round((metrics.newThisMonth / Math.max(1, metrics.totalCustomers)) * 100))}%`,
            }}
          />
        </div>
      </div>

      {/* Widget 4: Customers With Orders */}
      <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4 flex flex-col justify-between hover:border-outline-variant transition-colors relative overflow-hidden">
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-outline uppercase tracking-wider">
            With Bookings
          </span>
          <div className="p-1.5 rounded-lg bg-secondary/15 text-secondary">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>
        <div className="my-1">
          <span className="text-2xl font-bold font-display text-on-surface">
            {metrics.customersWithOrders}
          </span>
        </div>
        <div className="flex items-center gap-1 text-on-surface-variant text-[11px] font-medium">
          <span>{metrics.conversionRatePct}% conversion</span>
        </div>
      </div>

      {/* Widget 5: Requiring Attention */}
      <div className="col-span-2 md:col-span-1 bg-surface-container-low border border-surface-variant/50 rounded-xl p-4 flex flex-col justify-between hover:border-outline-variant transition-colors relative overflow-hidden">
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-outline uppercase tracking-wider">
            Needs Review
          </span>
          <div className="p-1.5 rounded-lg bg-warning/15 text-warning">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="my-1">
          <span
            className={`text-2xl font-bold font-display ${
              metrics.requiringAttention > 0 ? "text-warning" : "text-on-surface"
            }`}
          >
            {metrics.requiringAttention}
          </span>
        </div>
        <div className="flex items-center gap-1 text-warning text-[11px] font-medium">
          <span>Attention required</span>
        </div>
      </div>
    </div>
  );
}
