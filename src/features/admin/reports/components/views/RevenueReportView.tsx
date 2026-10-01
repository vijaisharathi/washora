"use client";

import React from "react";
import { IndianRupee, ArrowDownLeft, Store, Bike, Layers, Wallet } from "lucide-react";
import { useAdminRevenueReport } from "../../../hooks/useAdminAnalytics";
import { ReportsHeader } from "../ReportsHeader";
import { AnalyticsKpiCard, AnalyticsKpiGrid } from "../AnalyticsKpiCard";
import { AreaTrendChart } from "../charts/AreaTrendChart";
import { DonutDistributionChart } from "../charts/DonutDistributionChart";
import { AnalyticsDataTable, TableColumn } from "../tables/AnalyticsDataTable";
import { AnalyticsSkeleton } from "../skeletons/AnalyticsSkeleton";
import { formatINR } from "@/services/admin/adminAnalyticsService";

export function RevenueReportView() {
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
  } = useAdminRevenueReport();

  if (loading && !data) return <AnalyticsSkeleton />;

  if (error || !data) {
    return (
      <div className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-center space-y-3">
        <p className="text-sm font-semibold text-rose-500">{error || "Unable to load revenue analytics."}</p>
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

  const { kpis, revenueTrend, revenueBreakdown, dailyFinancials } = data;

  const tableColumns: TableColumn<typeof dailyFinancials[0]>[] = [
    { key: "label", header: "Date / Period", sortable: true },
    {
      key: "payments",
      header: "Customer Payments",
      align: "right",
      sortable: true,
      render: (r) => <span className="font-mono">{formatINR(r.payments)}</span>,
    },
    {
      key: "refunds",
      header: "Refunds",
      align: "right",
      sortable: true,
      render: (r) => <span className="font-mono text-rose-500">{formatINR(r.refunds)}</span>,
    },
    {
      key: "netRevenue",
      header: "Net Realized",
      align: "right",
      sortable: true,
      render: (r) => (
        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
          {formatINR(r.netRevenue)}
        </span>
      ),
    },
    {
      key: "providerEarnings",
      header: "Provider Payouts",
      align: "right",
      sortable: true,
      render: (r) => <span className="font-mono text-on-surface-variant">{formatINR(r.providerEarnings)}</span>,
    },
    {
      key: "deliveryEarnings",
      header: "Delivery Payouts",
      align: "right",
      sortable: true,
      render: (r) => <span className="font-mono text-on-surface-variant">{formatINR(r.deliveryEarnings)}</span>,
    },
    {
      key: "platformRevenue",
      header: "Platform Margin",
      align: "right",
      sortable: true,
      render: (r) => <span className="font-mono font-bold text-primary">{formatINR(r.platformRevenue)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <ReportsHeader
        title="Revenue & Financial Analytics"
        subtitle="Audited financial ledger performance, payout distribution, and platform take-rate"
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

      {/* KPIs Grid */}
      <AnalyticsKpiGrid columns={6}>
        <AnalyticsKpiCard
          kpi={kpis.totalRevenue}
          icon={<IndianRupee className="w-4 h-4 text-emerald-500" />}
        />
        <AnalyticsKpiCard
          kpi={kpis.paidRevenue}
          icon={<Wallet className="w-4 h-4 text-blue-500" />}
        />
        <AnalyticsKpiCard
          kpi={kpis.refundedAmount}
          icon={<ArrowDownLeft className="w-4 h-4 text-rose-500" />}
        />
        <AnalyticsKpiCard
          kpi={kpis.providerEarnings}
          icon={<Store className="w-4 h-4 text-amber-500" />}
        />
        <AnalyticsKpiCard
          kpi={kpis.deliveryPartnerEarnings}
          icon={<Bike className="w-4 h-4 text-cyan-500" />}
        />
        <AnalyticsKpiCard
          kpi={kpis.platformRevenue}
          icon={<Layers className="w-4 h-4 text-primary" />}
        />
      </AnalyticsKpiGrid>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AreaTrendChart
            title="Realized Cash Inflow & Refund Trajectory"
            subtitle="Comparing customer collections, approved refunds, and net retained volume"
            data={revenueTrend}
            primarySeries={{
              name: "Customer Payments",
              color: "#3B82F6",
              gradientId: "grad-rev-pay",
              formatter: formatINR,
            }}
            secondarySeries={{
              name: "Approved Refunds",
              color: "#EF4444",
              gradientId: "grad-rev-ref",
              formatter: formatINR,
            }}
            tertiarySeries={{
              name: "Net Realized Revenue",
              color: "#10B981",
              gradientId: "grad-rev-net",
              formatter: formatINR,
            }}
            height={260}
          />
        </div>

        <div>
          <DonutDistributionChart
            title="Financial Allocation Share"
            subtitle="Distribution of net revenue across partners and platform"
            items={revenueBreakdown}
            centerLabel="Total Net"
            centerValue={kpis.totalRevenue.formattedValue}
          />
        </div>
      </div>

      {/* Financials Table */}
      <AnalyticsDataTable
        title="Daily Financial Settlement Breakdown"
        subtitle="Chronological transaction ledger totals for the active date range"
        columns={tableColumns}
        data={dailyFinancials}
        loading={loading}
      />
    </div>
  );
}
