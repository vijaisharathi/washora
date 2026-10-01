"use client";

import React from "react";
import Link from "next/link";
import { Store, ShieldCheck, Clock, AlertTriangle, Star, CheckCircle2, ExternalLink } from "lucide-react";
import { useAdminProvidersReport } from "../../../hooks/useAdminAnalytics";
import { ReportsHeader } from "../ReportsHeader";
import { AnalyticsKpiCard, AnalyticsKpiGrid } from "../AnalyticsKpiCard";
import { AreaTrendChart } from "../charts/AreaTrendChart";
import { DonutDistributionChart } from "../charts/DonutDistributionChart";
import { HorizontalBarChart } from "../charts/HorizontalBarChart";
import { AnalyticsDataTable, TableColumn } from "../tables/AnalyticsDataTable";
import { AnalyticsSkeleton } from "../skeletons/AnalyticsSkeleton";
import { formatINR } from "@/services/admin/adminAnalyticsService";

export function ProvidersReportView() {
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
  } = useAdminProvidersReport();

  if (loading && !data) return <AnalyticsSkeleton />;

  if (error || !data) {
    return (
      <div className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-center space-y-3">
        <p className="text-sm font-semibold text-rose-500">{error || "Unable to load provider analytics."}</p>
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

  const { kpis, providerActivityTrend, cityDistribution, categoryDistribution, ratingDistribution, topProviders } = data;

  const tableColumns: TableColumn<typeof topProviders[0]>[] = [
    {
      key: "name",
      header: "Provider Facility",
      sortable: true,
      render: (r) => (
        <div>
          <Link
            href={`/admin/providers/${r.id}`}
            className="font-semibold text-on-surface hover:text-primary transition-colors flex items-center gap-1"
          >
            <span>{r.name}</span>
            <ExternalLink className="w-3 h-3 opacity-50" />
          </Link>
          <span className="text-[11px] text-on-surface-variant">{r.businessName}</span>
        </div>
      ),
    },
    { key: "city", header: "City", sortable: true },
    { key: "category", header: "Specialty", sortable: true },
    { key: "completedBookings", header: "Completed", align: "right", sortable: true, render: (r) => <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{r.completedBookings}</span> },
    { key: "cancellationCount", header: "Cancelled", align: "right", sortable: true, render: (r) => <span className="font-mono text-rose-500">{r.cancellationCount}</span> },
    {
      key: "rating",
      header: "Rating",
      align: "right",
      sortable: true,
      render: (r) => (
        <span className="font-mono font-bold flex items-center justify-end gap-1 text-amber-500">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          {r.rating.toFixed(1)} ({r.reviewsCount})
        </span>
      ),
    },
    {
      key: "earnings",
      header: "Net Realized Payouts",
      align: "right",
      sortable: true,
      render: (r) => <span className="font-mono font-bold text-on-surface">{formatINR(r.earnings)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <ReportsHeader
        title="Provider Network & Quality Analytics"
        subtitle="Facility capacity utilization, verification throughput, and rating quality control"
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
        hiddenFilters={["deliveryPartner", "service"]}
      />

      {/* KPIs Grid */}
      <AnalyticsKpiGrid columns={4}>
        <AnalyticsKpiCard kpi={kpis.totalProviders} icon={<Store className="w-4 h-4 text-amber-500" />} />
        <AnalyticsKpiCard kpi={kpis.activeProviders} icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />} />
        <AnalyticsKpiCard kpi={kpis.approvedProviders} icon={<ShieldCheck className="w-4 h-4 text-blue-500" />} />
        <AnalyticsKpiCard kpi={kpis.pendingApproval} icon={<Clock className="w-4 h-4 text-amber-500" />} />
        <AnalyticsKpiCard kpi={kpis.suspendedProviders} icon={<AlertTriangle className="w-4 h-4 text-rose-500" />} />
        <AnalyticsKpiCard kpi={kpis.averageProviderRating} icon={<Star className="w-4 h-4 text-amber-400 fill-amber-400" />} />
        <AnalyticsKpiCard kpi={kpis.averageCompletedBookings} icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />} />
      </AnalyticsKpiGrid>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AreaTrendChart
            title="Provider Facility Active Capacity"
            subtitle="Operational partner volume ready for fulfillment"
            data={providerActivityTrend}
            primarySeries={{
              name: "Active Facilities",
              color: "#F59E0B",
              gradientId: "grad-prov-act",
            }}
            height={260}
          />
        </div>

        <div>
          <DonutDistributionChart
            title="Provider Rating Tiers"
            subtitle="Facilities stratified by verified customer review scores"
            items={ratingDistribution}
            centerLabel="Rating Avg"
            centerValue={kpis.averageProviderRating.formattedValue}
          />
        </div>
      </div>

      {/* City & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HorizontalBarChart
          title="Providers by Operating City"
          subtitle="Facility density across metropolitan coverage regions"
          items={cityDistribution}
          color="#F59E0B"
        />
        <HorizontalBarChart
          title="Providers by Service Capability"
          subtitle="Equipped facilities across cleaning and garment categories"
          items={categoryDistribution}
          color="#10B981"
        />
      </div>

      {/* Top Providers Table */}
      <AnalyticsDataTable
        title="Provider Performance Leaderboard"
        subtitle="Network ranking based on fulfillment volume, quality rating, and earnings"
        columns={tableColumns}
        data={topProviders}
        loading={loading}
      />
    </div>
  );
}
