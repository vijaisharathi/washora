"use client";

import React from "react";
import { ShoppingCart, Clock, CheckCircle2, AlertOctagon, Activity, Percent } from "lucide-react";
import { useAdminBookingsReport } from "../../../hooks/useAdminAnalytics";
import { ReportsHeader } from "../ReportsHeader";
import { AnalyticsKpiCard, AnalyticsKpiGrid } from "../AnalyticsKpiCard";
import { AreaTrendChart } from "../charts/AreaTrendChart";
import { DonutDistributionChart } from "../charts/DonutDistributionChart";
import { HorizontalBarChart } from "../charts/HorizontalBarChart";
import { AnalyticsDataTable, TableColumn } from "../tables/AnalyticsDataTable";
import { AnalyticsSkeleton } from "../skeletons/AnalyticsSkeleton";

export function BookingsReportView() {
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
  } = useAdminBookingsReport();

  if (loading && !data) return <AnalyticsSkeleton />;

  if (error || !data) {
    return (
      <div className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-center space-y-3">
        <p className="text-sm font-semibold text-rose-500">{error || "Unable to load booking analytics."}</p>
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

  const { kpis, bookingVolumeTrend, statusDistribution, categoryDistribution, cityDistribution, dailyBookings } = data;

  const tableColumns: TableColumn<typeof dailyBookings[0]>[] = [
    { key: "label", header: "Date / Period", sortable: true },
    { key: "total", header: "Total Orders", align: "right", sortable: true, render: (r) => <span className="font-mono font-bold">{r.total}</span> },
    { key: "completed", header: "Completed", align: "right", sortable: true, render: (r) => <span className="font-mono text-emerald-600 dark:text-emerald-400">{r.completed}</span> },
    { key: "cancelled", header: "Cancelled", align: "right", sortable: true, render: (r) => <span className="font-mono text-rose-500">{r.cancelled}</span> },
    { key: "completionRate", header: "Fulfillment Rate", align: "right", sortable: true, render: (r) => <span className="font-mono font-semibold">{r.completionRate}%</span> },
    { key: "cancellationRate", header: "Dropout Rate", align: "right", sortable: true, render: (r) => <span className="font-mono text-on-surface-variant">{r.cancellationRate}%</span> },
  ];

  return (
    <div className="space-y-6">
      <ReportsHeader
        title="Booking & Order Volume Analytics"
        subtitle="End-to-end lifecycle throughput, fulfillment velocity, and dropoff diagnostics"
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

      {/* 8 KPIs Grid */}
      <AnalyticsKpiGrid columns={4}>
        <AnalyticsKpiCard kpi={kpis.totalBookings} icon={<ShoppingCart className="w-4 h-4 text-blue-500" />} />
        <AnalyticsKpiCard kpi={kpis.pending} icon={<Clock className="w-4 h-4 text-amber-500" />} />
        <AnalyticsKpiCard kpi={kpis.confirmed} icon={<Activity className="w-4 h-4 text-indigo-500" />} />
        <AnalyticsKpiCard kpi={kpis.inProgress} icon={<Activity className="w-4 h-4 text-cyan-500" />} />
        <AnalyticsKpiCard kpi={kpis.completed} icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />} />
        <AnalyticsKpiCard kpi={kpis.cancelled} icon={<AlertOctagon className="w-4 h-4 text-rose-500" />} />
        <AnalyticsKpiCard kpi={kpis.completionRate} icon={<Percent className="w-4 h-4 text-emerald-500" />} />
        <AnalyticsKpiCard kpi={kpis.cancellationRate} icon={<Percent className="w-4 h-4 text-rose-500" />} />
      </AnalyticsKpiGrid>

      {/* Trend & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AreaTrendChart
            title="Booking Creation Velocity"
            subtitle="Volume of new reservations received across the reporting window"
            data={bookingVolumeTrend}
            primarySeries={{
              name: "Bookings",
              color: "#3B82F6",
              gradientId: "grad-bkg-vol",
            }}
            height={260}
          />
        </div>

        <div>
          <DonutDistributionChart
            title="Lifecycle Stage Distribution"
            subtitle="Current status split across all active orders"
            items={statusDistribution}
            centerLabel="Total Orders"
            centerValue={kpis.totalBookings.formattedValue}
          />
        </div>
      </div>

      {/* Category & City Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HorizontalBarChart
          title="Orders by Service Category"
          subtitle="Relative demand share across core offerings"
          items={categoryDistribution}
          color="#3B82F6"
        />
        <HorizontalBarChart
          title="Orders by Geographic Hub"
          subtitle="Booking density distributed across operating metropolitan zones"
          items={cityDistribution}
          color="#10B981"
        />
      </div>

      {/* Daily Bookings Table */}
      <AnalyticsDataTable
        title="Chronological Fulfillment Table"
        subtitle="Daily aggregate booking volume and completion efficiency"
        columns={tableColumns}
        data={dailyBookings}
        loading={loading}
      />
    </div>
  );
}
