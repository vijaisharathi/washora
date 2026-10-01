"use client";

import React from "react";
import {
  AlertCircle,
  RefreshCw,
  User,
  Building2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useAdminDashboard } from "@/features/admin/hooks/useAdminDashboard";
import { AdminDashboardHeader } from "./AdminDashboardHeader";
import { DashboardKpiGrid } from "./DashboardKpiGrid";
import { OperationalStatusOverview } from "./OperationalStatusOverview";
import { BookingRevenueTrendSection } from "./BookingRevenueTrendSection";
import { AttentionRequiredSection } from "./AttentionRequiredSection";
import { RecentActivityFeed } from "./RecentActivityFeed";

export function AdminDashboardMasterView() {
  const {
    period,
    setPeriod,
    snapshot,
    isLoading,
    isRefreshing,
    error,
    refresh,
    profile,
    organization,
  } = useAdminDashboard();

  if (isLoading && !snapshot) {
    return (
      <div className="space-y-6 max-w-[1600px] mx-auto p-4 md:p-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="h-16 bg-surface-container-low rounded-2xl border border-outline-variant/30" />

        {/* KPI Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-28 bg-surface-container-low rounded-2xl border border-outline-variant/30"
            />
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-surface-container-low rounded-2xl border border-outline-variant/30" />
          <div className="h-72 bg-surface-container-low rounded-2xl border border-outline-variant/30" />
        </div>
      </div>
    );
  }

  if (error || !snapshot) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 rounded-2xl bg-surface-container-low border border-critical/40 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-critical/15 text-critical flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-on-surface">
          Unable to Load Operational Dashboard
        </h2>
        <p className="text-xs text-on-surface-variant max-w-md mx-auto">
          {error || "An unexpected error occurred while retrieving platform telemetry."}
        </p>
        <button
          type="button"
          onClick={() => refresh()}
          className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs inline-flex items-center gap-2 hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Loading Telemetry</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* 1. Dashboard Header */}
      <AdminDashboardHeader
        profile={profile}
        organization={organization}
        period={period}
        onPeriodChange={setPeriod}
        onRefresh={refresh}
        isRefreshing={isRefreshing}
      />

      {/* 2. Primary KPI Grid */}
      <DashboardKpiGrid kpis={snapshot.kpis} period={period} />

      {/* 3. Operational Workload & Fleet Status */}
      <OperationalStatusOverview
        bookingStatus={snapshot.bookingStatus}
        providerStatus={snapshot.providerStatus}
        deliveryPartnerStatus={snapshot.deliveryPartnerStatus}
      />

      {/* 4. Booking & Revenue Trend Analytics */}
      <BookingRevenueTrendSection
        trend={snapshot.bookingTrend}
        revenueSummary={snapshot.revenueSummary}
        period={period}
      />

      {/* 5. Bottom Operations Row: Attention Items & Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttentionRequiredSection items={snapshot.attentionRequired} />
        <RecentActivityFeed activities={snapshot.recentActivity} />
      </div>

      {/* 6. Quick Administrative Actions Strip */}
      <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-on-surface-variant font-medium">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>Quick Administrative Management Points:</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/profile"
            className="px-3.5 py-1.5 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface hover:border-primary/50 flex items-center gap-1.5 transition-colors font-semibold"
          >
            <User className="w-3.5 h-3.5 text-primary" />
            <span>Manage Admin Profile</span>
            <ExternalLink className="w-3 h-3 text-on-surface-variant" />
          </Link>

          <Link
            href="/admin/organization"
            className="px-3.5 py-1.5 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface hover:border-primary/50 flex items-center gap-1.5 transition-colors font-semibold"
          >
            <Building2 className="w-3.5 h-3.5 text-primary" />
            <span>Manage Organization</span>
            <ExternalLink className="w-3 h-3 text-on-surface-variant" />
          </Link>
        </div>
      </div>
    </div>
  );
}
