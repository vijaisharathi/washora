"use client";

import React from "react";
import Link from "next/link";
import { Layers, CheckCircle2, PauseCircle, Archive, ShoppingBag, Star, ExternalLink } from "lucide-react";
import { useAdminServicesReport } from "../../../hooks/useAdminAnalytics";
import { ReportsHeader } from "../ReportsHeader";
import { AnalyticsKpiCard, AnalyticsKpiGrid } from "../AnalyticsKpiCard";
import { AreaTrendChart } from "../charts/AreaTrendChart";
import { DonutDistributionChart } from "../charts/DonutDistributionChart";
import { HorizontalBarChart } from "../charts/HorizontalBarChart";
import { AnalyticsDataTable, TableColumn } from "../tables/AnalyticsDataTable";
import { AnalyticsSkeleton } from "../skeletons/AnalyticsSkeleton";
import { formatINR } from "@/services/admin/adminAnalyticsService";

export function ServicesReportView() {
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
  } = useAdminServicesReport();

  if (loading && !data) return <AnalyticsSkeleton />;

  if (error || !data) {
    return (
      <div className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-center space-y-3">
        <p className="text-sm font-semibold text-rose-500">{error || "Unable to load service analytics."}</p>
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

  const { kpis, categoryBookingsDistribution, categoryRevenueDistribution, servicePopularityTrend, topServices } = data;

  const tableColumns: TableColumn<typeof topServices[0]>[] = [
    {
      key: "name",
      header: "Service Offering",
      sortable: true,
      render: (r) => (
        <div>
          <Link
            href={`/admin/services/${r.id}`}
            className="font-semibold text-on-surface hover:text-primary transition-colors flex items-center gap-1"
          >
            <span>{r.name}</span>
            <ExternalLink className="w-3 h-3 opacity-50" />
          </Link>
          <span className="text-[11px] text-on-surface-variant font-mono">Base: {formatINR(r.basePrice)}</span>
        </div>
      ),
    },
    { key: "category", header: "Category", sortable: true },
    { key: "totalBookings", header: "Total Orders", align: "right", sortable: true, render: (r) => <span className="font-mono font-bold">{r.totalBookings}</span> },
    { key: "completed", header: "Completed", align: "right", sortable: true, render: (r) => <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{r.completed}</span> },
    { key: "cancelled", header: "Cancelled", align: "right", sortable: true, render: (r) => <span className="font-mono text-rose-500">{r.cancelled}</span> },
    {
      key: "rating",
      header: "Score",
      align: "right",
      sortable: true,
      render: (r) => (
        <span className="font-mono font-bold flex items-center justify-end gap-1 text-amber-500">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          {r.rating.toFixed(1)}
        </span>
      ),
    },
    {
      key: "revenue",
      header: "Catalog Revenue",
      align: "right",
      sortable: true,
      render: (r) => <span className="font-mono font-bold text-on-surface">{formatINR(r.revenue)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <ReportsHeader
        title="Service Catalog & SKU Analytics"
        subtitle="Itemized service popularity, category sales contribution, and customer satisfaction"
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
        hiddenFilters={["provider", "deliveryPartner"]}
      />

      {/* KPIs Grid */}
      <AnalyticsKpiGrid columns={5}>
        <AnalyticsKpiCard kpi={kpis.totalServices} icon={<Layers className="w-4 h-4 text-primary" />} />
        <AnalyticsKpiCard kpi={kpis.activeServices} icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />} />
        <AnalyticsKpiCard kpi={kpis.inactiveServices} icon={<PauseCircle className="w-4 h-4 text-amber-500" />} />
        <AnalyticsKpiCard kpi={kpis.archivedServices} icon={<Archive className="w-4 h-4 text-rose-500" />} />
        <AnalyticsKpiCard kpi={kpis.totalBookings} icon={<ShoppingBag className="w-4 h-4 text-blue-500" />} />
      </AnalyticsKpiGrid>

      {/* Featured Callout Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Top Ordered Offering
            </span>
            <h4 className="text-sm font-bold text-on-surface mt-0.5">
              {kpis.mostBookedServiceName}
            </h4>
          </div>
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
            #1
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Highest Quality Rating
            </span>
            <h4 className="text-sm font-bold text-on-surface mt-0.5">
              {kpis.highestRatedServiceName}
            </h4>
          </div>
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Star className="w-4 h-4 fill-amber-400" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AreaTrendChart
            title="Catalog Demand Momentum"
            subtitle="Order throughput generated across all catalog services"
            data={servicePopularityTrend}
            primarySeries={{
              name: "Catalog Orders",
              color: "#3B82F6",
              gradientId: "grad-srv-ord",
            }}
            height={260}
          />
        </div>

        <div>
          <DonutDistributionChart
            title="Category Revenue Share"
            subtitle="Gross turnover generated per garment care category"
            items={categoryRevenueDistribution}
            centerLabel="Categories"
          />
        </div>
      </div>

      {/* Horizontal Distribution */}
      <div className="grid grid-cols-1 gap-6">
        <HorizontalBarChart
          title="Booking Volume by Category"
          subtitle="Total transactions categorized by service type"
          items={categoryBookingsDistribution}
          color="#8B5CF6"
        />
      </div>

      {/* Catalog Table */}
      <AnalyticsDataTable
        title="Full Catalog Service Performance"
        subtitle="Granular metrics breakdown per individual catalog item"
        columns={tableColumns}
        data={topServices}
        loading={loading}
      />
    </div>
  );
}
