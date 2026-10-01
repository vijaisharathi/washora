"use client";

import React from "react";
import Link from "next/link";
import { Users, UserPlus, UserCheck, ShoppingBag, IndianRupee, ExternalLink } from "lucide-react";
import { useAdminCustomersReport } from "../../../hooks/useAdminAnalytics";
import { ReportsHeader } from "../ReportsHeader";
import { AnalyticsKpiCard, AnalyticsKpiGrid } from "../AnalyticsKpiCard";
import { AreaTrendChart } from "../charts/AreaTrendChart";
import { DonutDistributionChart } from "../charts/DonutDistributionChart";
import { HorizontalBarChart } from "../charts/HorizontalBarChart";
import { AnalyticsDataTable, TableColumn } from "../tables/AnalyticsDataTable";
import { AnalyticsSkeleton } from "../skeletons/AnalyticsSkeleton";
import { formatINR } from "@/services/admin/adminAnalyticsService";

export function CustomersReportView() {
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
  } = useAdminCustomersReport();

  if (loading && !data) return <AnalyticsSkeleton />;

  if (error || !data) {
    return (
      <div className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-center space-y-3">
        <p className="text-sm font-semibold text-rose-500">{error || "Unable to load customer analytics."}</p>
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

  const { kpis, newCustomersTrend, cityDistribution, frequencyDistribution, topCustomers } = data;

  const tableColumns: TableColumn<typeof topCustomers[0]>[] = [
    {
      key: "name",
      header: "Customer",
      sortable: true,
      render: (r) => (
        <div>
          <Link
            href={`/admin/customers/${r.id}`}
            className="font-semibold text-on-surface hover:text-primary transition-colors flex items-center gap-1"
          >
            <span>{r.name}</span>
            <ExternalLink className="w-3 h-3 opacity-50" />
          </Link>
          <span className="text-[11px] text-on-surface-variant font-mono">{r.email}</span>
        </div>
      ),
    },
    { key: "city", header: "City", sortable: true },
    { key: "totalBookings", header: "Total Orders", align: "right", sortable: true, render: (r) => <span className="font-mono font-bold">{r.totalBookings}</span> },
    { key: "completedBookings", header: "Completed", align: "right", sortable: true, render: (r) => <span className="font-mono text-emerald-600 dark:text-emerald-400">{r.completedBookings}</span> },
    {
      key: "totalSpend",
      header: "Lifetime Spend",
      align: "right",
      sortable: true,
      render: (r) => <span className="font-mono font-bold">{formatINR(r.totalSpend)}</span>,
    },
    {
      key: "lastBookingDate",
      header: "Last Active",
      align: "right",
      sortable: true,
      render: (r) => (
        <span className="font-mono text-on-surface-variant text-[11px]">
          {r.lastBookingDate ? new Date(r.lastBookingDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <ReportsHeader
        title="Customer Base & Retention Analytics"
        subtitle="User acquisition growth, geographic concentration, and repeat booking frequency"
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
        hiddenFilters={["provider", "deliveryPartner", "service"]}
      />

      {/* 6 KPIs Grid */}
      <AnalyticsKpiGrid columns={6}>
        <AnalyticsKpiCard kpi={kpis.totalCustomers} icon={<Users className="w-4 h-4 text-indigo-500" />} />
        <AnalyticsKpiCard kpi={kpis.newCustomers} icon={<UserPlus className="w-4 h-4 text-emerald-500" />} />
        <AnalyticsKpiCard kpi={kpis.activeCustomers} icon={<UserCheck className="w-4 h-4 text-blue-500" />} />
        <AnalyticsKpiCard kpi={kpis.customersWithCompletedBookings} icon={<ShoppingBag className="w-4 h-4 text-amber-500" />} />
        <AnalyticsKpiCard kpi={kpis.averageBookingsPerCustomer} icon={<ShoppingBag className="w-4 h-4 text-cyan-500" />} />
        <AnalyticsKpiCard kpi={kpis.averageCustomerSpend} icon={<IndianRupee className="w-4 h-4 text-emerald-500" />} />
      </AnalyticsKpiGrid>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AreaTrendChart
            title="New Customer Acquisition Trend"
            subtitle="Pace of newly registered profiles across the selected timeframe"
            data={newCustomersTrend}
            primarySeries={{
              name: "New Customers",
              color: "#6366F1",
              gradientId: "grad-cust-acq",
            }}
            height={260}
          />
        </div>

        <div>
          <DonutDistributionChart
            title="Geographic User Share"
            subtitle="Customer distribution by primary residence city"
            items={cityDistribution}
            centerLabel="Total Users"
            centerValue={kpis.totalCustomers.formattedValue}
          />
        </div>
      </div>

      {/* Frequency Distribution */}
      <div className="grid grid-cols-1 gap-6">
        <HorizontalBarChart
          title="Booking Frequency & Repeat Loyalty"
          subtitle="Proportion of users by cumulative order count"
          items={frequencyDistribution}
          color="#6366F1"
        />
      </div>

      {/* Top Customers Table */}
      <AnalyticsDataTable
        title="High-Value Customers Roster"
        subtitle="Top accounts ranked by lifetime spend and order volume"
        columns={tableColumns}
        data={topCustomers}
        loading={loading}
      />
    </div>
  );
}
