"use client";

import React from "react";
import Link from "next/link";
import {
  IndianRupee,
  ShoppingCart,
  CheckCircle2,
  AlertOctagon,
  Users,
  Store,
  Bike,
  Star,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import { useAdminOverviewReport } from "../../../hooks/useAdminAnalytics";
import { ReportsHeader } from "../ReportsHeader";
import { AnalyticsKpiCard, AnalyticsKpiGrid } from "../AnalyticsKpiCard";
import { AreaTrendChart } from "../charts/AreaTrendChart";
import { DonutDistributionChart } from "../charts/DonutDistributionChart";
import { FunnelChart } from "../charts/FunnelChart";
import { AnalyticsSkeleton } from "../skeletons/AnalyticsSkeleton";
import { formatINR } from "@/services/admin/adminAnalyticsService";

export function ReportsOverviewMasterView() {
  const {
    loading,
    error,
    data,
    dateRange,
    startDate,
    endDate,
    city,
    serviceCategory,
    providerId,
    deliveryPartnerId,
    serviceId,
    filterOptions,
    activeFilterCount,
    setDateRange,
    setStartDate,
    setEndDate,
    setCity,
    setServiceCategory,
    setProviderId,
    setDeliveryPartnerId,
    setServiceId,
    resetFilters,
    refetch,
  } = useAdminOverviewReport();

  if (loading && !data) {
    return <AnalyticsSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-center space-y-3">
        <p className="text-sm font-semibold text-rose-500">
          {error || "Unable to load reports overview."}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { kpis, revenueBookingTrend, categoryDistribution, operationalFunnel, topProviders, topServices } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <ReportsHeader
        title="Reports & Analytics"
        subtitle="Platform-wide multi-dimensional performance intelligence and velocity metrics"
        dateRange={dateRange}
        startDate={startDate}
        endDate={endDate}
        onSelectPreset={setDateRange}
        onApplyCustomRange={(start, end) => {
          setStartDate(start);
          setEndDate(end);
          setDateRange("custom");
        }}
        city={city}
        serviceCategory={serviceCategory}
        providerId={providerId}
        deliveryPartnerId={deliveryPartnerId}
        serviceId={serviceId}
        filterOptions={filterOptions}
        activeFilterCount={activeFilterCount}
        onSetCity={setCity}
        onSetCategory={setServiceCategory}
        onSetProvider={setProviderId}
        onSetDeliveryPartner={setDeliveryPartnerId}
        onSetService={setServiceId}
        onResetFilters={resetFilters}
        onRefresh={refetch}
        isRefreshing={loading}
      />

      {/* 8 Core KPIs Grid */}
      <AnalyticsKpiGrid columns={4}>
        <AnalyticsKpiCard
          kpi={kpis.totalRevenue}
          icon={<IndianRupee className="w-4 h-4 text-emerald-500" />}
        />
        <AnalyticsKpiCard
          kpi={kpis.totalBookings}
          icon={<ShoppingCart className="w-4 h-4 text-blue-500" />}
        />
        <AnalyticsKpiCard
          kpi={kpis.completedBookings}
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
        />
        <AnalyticsKpiCard
          kpi={kpis.cancellationRate}
          icon={<AlertOctagon className="w-4 h-4 text-rose-500" />}
        />
        <AnalyticsKpiCard
          kpi={kpis.totalCustomers}
          icon={<Users className="w-4 h-4 text-indigo-500" />}
        />
        <AnalyticsKpiCard
          kpi={kpis.activeProviders}
          icon={<Store className="w-4 h-4 text-amber-500" />}
        />
        <AnalyticsKpiCard
          kpi={kpis.activeDeliveryPartners}
          icon={<Bike className="w-4 h-4 text-cyan-500" />}
        />
        <AnalyticsKpiCard
          kpi={kpis.averageRating}
          icon={<Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
        />
      </AnalyticsKpiGrid>

      {/* Primary Trend & Category Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AreaTrendChart
            title="Revenue & Order Velocity Trend"
            subtitle="Realized financial turnover alongside booking counts across active window"
            data={revenueBookingTrend}
            primarySeries={{
              name: "Realized Revenue (₹)",
              color: "#10B981",
              gradientId: "grad-overview-rev",
              formatter: formatINR,
            }}
            secondarySeries={{
              name: "Order Count",
              color: "#3B82F6",
              gradientId: "grad-overview-bkg",
            }}
            height={260}
          />
        </div>

        <div>
          <DonutDistributionChart
            title="Category Volume Share"
            subtitle="Booking volume distributed across core services"
            items={categoryDistribution}
            centerLabel="Bookings"
          />
        </div>
      </div>

      {/* Operational Funnel & Quick Top Highlights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <FunnelChart
            title="Operational Processing Funnel"
            subtitle="Conversion throughput from order intake to doorstep delivery"
            stages={operationalFunnel}
          />
        </div>

        {/* Top Providers Preview */}
        <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-on-surface">Top Performing Providers</h3>
              <Link
                href="/admin/reports/providers"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <p className="text-xs text-on-surface-variant mb-4">
              Leading facilities by rating and fulfillment volume
            </p>

            <div className="space-y-3">
              {topProviders.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container/60 hover:bg-surface-container transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <Link
                      href={`/admin/providers/${p.id}`}
                      className="font-semibold text-xs text-on-surface hover:text-primary transition-colors flex items-center gap-1 truncate"
                    >
                      <span className="truncate">{p.name}</span>
                      <ExternalLink className="w-3 h-3 shrink-0 opacity-50" />
                    </Link>
                    <span className="text-[11px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      {p.rating.toFixed(1)} • {p.completedBookings} orders
                    </span>
                  </div>
                  <span className="font-bold font-mono text-xs text-emerald-600 dark:text-emerald-400 shrink-0">
                    {formatINR(p.earnings)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Services Preview */}
        <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-on-surface">Most Popular Services</h3>
              <Link
                href="/admin/reports/services"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <p className="text-xs text-on-surface-variant mb-4">
              Catalog items generating the highest order volume
            </p>

            <div className="space-y-3">
              {topServices.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container/60 hover:bg-surface-container transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <Link
                      href={`/admin/services/${s.id}`}
                      className="font-semibold text-xs text-on-surface hover:text-primary transition-colors flex items-center gap-1 truncate"
                    >
                      <span className="truncate">{s.name}</span>
                      <ExternalLink className="w-3 h-3 shrink-0 opacity-50" />
                    </Link>
                    <span className="text-[11px] text-on-surface-variant mt-0.5 block truncate">
                      {s.category} • {s.bookings} orders
                    </span>
                  </div>
                  <span className="font-bold font-mono text-xs text-on-surface shrink-0">
                    {formatINR(s.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
