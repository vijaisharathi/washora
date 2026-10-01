"use client";

import React from "react";
import Link from "next/link";
import { Bike, ShieldCheck, Clock, AlertTriangle, Star, CheckCircle2, IndianRupee, ExternalLink } from "lucide-react";
import { useAdminDeliveryPartnersReport } from "../../../hooks/useAdminAnalytics";
import { ReportsHeader } from "../ReportsHeader";
import { AnalyticsKpiCard, AnalyticsKpiGrid } from "../AnalyticsKpiCard";
import { AreaTrendChart } from "../charts/AreaTrendChart";
import { DonutDistributionChart } from "../charts/DonutDistributionChart";
import { HorizontalBarChart } from "../charts/HorizontalBarChart";
import { AnalyticsDataTable, TableColumn } from "../tables/AnalyticsDataTable";
import { AnalyticsSkeleton } from "../skeletons/AnalyticsSkeleton";
import { formatINR } from "@/services/admin/adminAnalyticsService";

export function DeliveryPartnersReportView() {
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
  } = useAdminDeliveryPartnersReport();

  if (loading && !data) return <AnalyticsSkeleton />;

  if (error || !data) {
    return (
      <div className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-center space-y-3">
        <p className="text-sm font-semibold text-rose-500">{error || "Unable to load delivery partner analytics."}</p>
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

  const { kpis, deliveriesTrend, cityDistribution, vehicleDistribution, statusDistribution, topPartners } = data;

  const tableColumns: TableColumn<typeof topPartners[0]>[] = [
    {
      key: "name",
      header: "Delivery Valet",
      sortable: true,
      render: (r) => (
        <div>
          <Link
            href={`/admin/delivery-partners/${r.id}`}
            className="font-semibold text-on-surface hover:text-primary transition-colors flex items-center gap-1"
          >
            <span>{r.name}</span>
            <ExternalLink className="w-3 h-3 opacity-50" />
          </Link>
          <span className="text-[11px] text-on-surface-variant uppercase font-mono">{r.vehicleType}</span>
        </div>
      ),
    },
    { key: "city", header: "Operating City", sortable: true },
    { key: "completedDeliveries", header: "Completed Trips", align: "right", sortable: true, render: (r) => <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{r.completedDeliveries}</span> },
    { key: "cancelledDeliveries", header: "Cancelled / Failed", align: "right", sortable: true, render: (r) => <span className="font-mono text-rose-500">{r.cancelledDeliveries}</span> },
    {
      key: "rating",
      header: "Valet Score",
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
      key: "earnings",
      header: "Earned Payouts",
      align: "right",
      sortable: true,
      render: (r) => <span className="font-mono font-bold text-on-surface">{formatINR(r.earnings)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <ReportsHeader
        title="Logistics Fleet & Delivery Analytics"
        subtitle="Valet dispatch throughput, vehicle fleet distribution, and turnaround reliability"
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
        hiddenFilters={["provider", "service"]}
      />

      {/* KPIs Grid */}
      <AnalyticsKpiGrid columns={5}>
        <AnalyticsKpiCard kpi={kpis.totalPartners} icon={<Bike className="w-4 h-4 text-cyan-500" />} />
        <AnalyticsKpiCard kpi={kpis.activePartners} icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />} />
        <AnalyticsKpiCard kpi={kpis.approvedPartners} icon={<ShieldCheck className="w-4 h-4 text-blue-500" />} />
        <AnalyticsKpiCard kpi={kpis.completedDeliveries} icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />} />
        <AnalyticsKpiCard kpi={kpis.totalEarnings} icon={<IndianRupee className="w-4 h-4 text-emerald-500" />} />
      </AnalyticsKpiGrid>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AreaTrendChart
            title="Completed Delivery Trajectory"
            subtitle="Completed pickup & delivery runs over the active window"
            data={deliveriesTrend}
            primarySeries={{
              name: "Completed Trips",
              color: "#06B6D4",
              gradientId: "grad-dp-trips",
            }}
            height={260}
          />
        </div>

        <div>
          <DonutDistributionChart
            title="Vehicle Fleet Breakdown"
            subtitle="Distribution of fleet by vehicle classification"
            items={vehicleDistribution}
            centerLabel="Fleet"
            centerValue={kpis.totalPartners.formattedValue}
          />
        </div>
      </div>

      {/* Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HorizontalBarChart
          title="Deliveries by Hub City"
          subtitle="Trips fulfilled across operating zones"
          items={cityDistribution}
          color="#06B6D4"
        />
        <HorizontalBarChart
          title="Trip Outcome Distribution"
          subtitle="Proportion of successful vs failed dispatch assignments"
          items={statusDistribution}
          color="#10B981"
        />
      </div>

      {/* Top Partners Table */}
      <AnalyticsDataTable
        title="Delivery Partner Fleet Roster"
        subtitle="Individual valet ranking based on successful trip volume and punctuality"
        columns={tableColumns}
        data={topPartners}
        loading={loading}
      />
    </div>
  );
}
