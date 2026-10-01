"use client";

import React from "react";
import { Activity, AlertCircle, Store, Bike, CheckCircle2, AlertOctagon, Percent } from "lucide-react";
import { useAdminOperationsReport } from "../../../hooks/useAdminAnalytics";
import { ReportsHeader } from "../ReportsHeader";
import { AnalyticsKpiCard, AnalyticsKpiGrid } from "../AnalyticsKpiCard";
import { AreaTrendChart } from "../charts/AreaTrendChart";
import { FunnelChart } from "../charts/FunnelChart";
import { AnalyticsSkeleton } from "../skeletons/AnalyticsSkeleton";

export function OperationsReportView() {
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
  } = useAdminOperationsReport();

  if (loading && !data) return <AnalyticsSkeleton />;

  if (error || !data) {
    return (
      <div className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-center space-y-3">
        <p className="text-sm font-semibold text-rose-500">{error || "Unable to load operations analytics."}</p>
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

  const { kpis, assignmentStatusTrend, operationalFunnel, providerWorkload, deliveryPartnerWorkload } = data;

  return (
    <div className="space-y-6">
      <ReportsHeader
        title="Operations & Assignment Analytics"
        subtitle="Real-time hub throughput, partner capacity balancing, and turnaround efficiency"
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
      <AnalyticsKpiGrid columns={4}>
        <AnalyticsKpiCard kpi={kpis.needsAssignment} icon={<AlertCircle className="w-4 h-4 text-rose-500" />} />
        <AnalyticsKpiCard kpi={kpis.providerAssigned} icon={<Store className="w-4 h-4 text-amber-500" />} />
        <AnalyticsKpiCard kpi={kpis.deliveryPending} icon={<Bike className="w-4 h-4 text-cyan-500" />} />
        <AnalyticsKpiCard kpi={kpis.inProgress} icon={<Activity className="w-4 h-4 text-blue-500" />} />
        <AnalyticsKpiCard kpi={kpis.completedToday} icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />} />
        <AnalyticsKpiCard kpi={kpis.cancelledToday} icon={<AlertOctagon className="w-4 h-4 text-rose-500" />} />
        <AnalyticsKpiCard kpi={kpis.providerAssignmentRate} icon={<Percent className="w-4 h-4 text-emerald-500" />} />
        <AnalyticsKpiCard kpi={kpis.deliveryAssignmentRate} icon={<Percent className="w-4 h-4 text-blue-500" />} />
      </AnalyticsKpiGrid>

      {/* Funnel and Assignment Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FunnelChart
          title="Fulfillment Operational Pipeline"
          subtitle="Stage progression from booking placement to doorstep delivery"
          stages={operationalFunnel}
        />

        <AreaTrendChart
          title="Daily Assignment Turnaround"
          subtitle="Operational orders processed vs backlog queue"
          data={assignmentStatusTrend}
          primarySeries={{
            name: "Assigned Orders",
            color: "#10B981",
            gradientId: "grad-ops-assigned",
          }}
          secondarySeries={{
            name: "Pending Dispatch",
            color: "#F59E0B",
            gradientId: "grad-ops-pending",
          }}
          height={260}
        />
      </div>

      {/* Workload Capacity Distribution (A9 Workload Rules: 0-2 Low, 3-5 Medium, 6+ High) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Provider Workload */}
        <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-on-surface">Provider Workload Distribution</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Active concurrent orders per facility (Thresholds: Low: 0-2, Medium: 3-5, High: 6+)
            </p>
          </div>

          <div className="space-y-4">
            {providerWorkload.map((item) => (
              <div key={item.workloadLevel} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-on-surface">
                    {item.workloadLevel} Load
                  </span>
                  <span className="font-bold font-mono text-on-surface">
                    {item.providerCount} facilities ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-surface-container-high overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.workloadLevel.startsWith("Low")
                        ? "bg-emerald-500"
                        : item.workloadLevel.startsWith("Medium")
                        ? "bg-blue-500"
                        : "bg-amber-500"
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Partner Workload */}
        <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-on-surface">Delivery Fleet Dispatch Load</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Active assigned courier trips per valet (Thresholds: Low: 0-2, Medium: 3-5, High: 6+)
            </p>
          </div>

          <div className="space-y-4">
            {deliveryPartnerWorkload.map((item) => (
              <div key={item.workloadLevel} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-on-surface">
                    {item.workloadLevel} Load
                  </span>
                  <span className="font-bold font-mono text-on-surface">
                    {item.partnerCount} valets ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-surface-container-high overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.workloadLevel.startsWith("Low")
                        ? "bg-emerald-500"
                        : item.workloadLevel.startsWith("Medium")
                        ? "bg-cyan-500"
                        : "bg-indigo-500"
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
