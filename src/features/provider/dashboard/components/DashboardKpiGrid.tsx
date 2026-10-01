import React from "react";
import { ProviderDashboardSummary } from "@/types/provider/dashboard";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

interface DashboardKpiGridProps {
  summary: ProviderDashboardSummary;
}

export function DashboardKpiGrid({ summary }: DashboardKpiGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {/* Today's Orders */}
      <ProviderCard variant="container" className="p-4 flex flex-col justify-between">
        <span className="text-xs font-medium text-on-surface-variant">Today&apos;s Orders</span>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-on-surface">{summary.todayOrdersCount}</span>
          <span className="text-[11px] text-primary font-semibold">Active</span>
        </div>
      </ProviderCard>

      {/* Pending Intake Inspection */}
      <ProviderCard variant="container" className="p-4 flex flex-col justify-between">
        <span className="text-xs font-medium text-on-surface-variant">Pending Intake</span>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-error">{summary.pendingInspectionCount}</span>
          <span className="text-[11px] text-error font-semibold">Needs Inspection</span>
        </div>
      </ProviderCard>

      {/* In Processing */}
      <ProviderCard variant="container" className="p-4 flex flex-col justify-between">
        <span className="text-xs font-medium text-on-surface-variant">In Processing</span>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-primary">{summary.inProcessingCount}</span>
          <span className="text-[11px] text-primary font-semibold">In Care Cycles</span>
        </div>
      </ProviderCard>

      {/* Ready for Valet */}
      <ProviderCard variant="container" className="p-4 flex flex-col justify-between">
        <span className="text-xs font-medium text-on-surface-variant">Ready for Valet</span>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-amber-400">{summary.readyForValetCount}</span>
          <span className="text-[11px] text-amber-400 font-semibold">Bagged & Tagged</span>
        </div>
      </ProviderCard>

      {/* Estimated Today's Revenue */}
      <ProviderCard
        variant="container"
        className="p-4 flex flex-col justify-between col-span-2 sm:col-span-1 border-primary/20 bg-surface-container"
      >
        <span className="text-xs font-medium text-on-surface-variant">Est. Today&apos;s Revenue</span>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-emerald-400">₹{summary.todayEstimatedRevenue.toLocaleString()}</span>
          <span className="text-[11px] text-emerald-400 font-semibold">{summary.completionRatePercent}% SLA</span>
        </div>
      </ProviderCard>
    </div>
  );
}
