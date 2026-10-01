"use client";

import React from "react";
import {
  Split,
  FlaskConical,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { useExperiments } from "../../hooks/useProductAnalytics";
import { AnalyticsSkeleton } from "../skeletons/AnalyticsSkeleton";
import { AnalyticsKpiCard, AnalyticsKpiGrid } from "../AnalyticsKpiCard";

export function ExperimentsReportView() {
  const { data: experiments, loading, error, refetch } = useExperiments();

  if (loading && experiments.length === 0) return <AnalyticsSkeleton />;

  if (error && experiments.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-center space-y-3">
        <p className="text-sm font-semibold text-rose-500">{error || "Unable to load experiments."}</p>
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

  const activeCount = experiments.filter((e) => e.status === "ACTIVE").length;
  const concludedCount = experiments.filter((e) => e.status === "CONCLUDED").length;
  const totalAssigned = experiments.reduce((acc, e) => acc + (e.totalAssignments || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-on-surface">
            A/B Testing & Feature Rollouts
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Deterministic user bucketing, statistical lift evaluation, and data-driven product iterations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-outline-variant/50 text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <AnalyticsKpiGrid>
        <AnalyticsKpiCard
          kpi={{
            id: "exp-active",
            label: "Active Experiments",
            value: activeCount,
            formattedValue: String(activeCount),
          }}
          icon={<FlaskConical className="w-4 h-4" />}
        />
        <AnalyticsKpiCard
          kpi={{
            id: "exp-concluded",
            label: "Concluded Rollouts",
            value: concludedCount,
            formattedValue: String(concludedCount),
          }}
          icon={<CheckCircle2 className="w-4 h-4" />}
        />
        <AnalyticsKpiCard
          kpi={{
            id: "exp-sample-size",
            label: "Total Sample Size",
            value: totalAssigned,
            formattedValue: totalAssigned.toLocaleString(),
          }}
          icon={<Split className="w-4 h-4" />}
        />
      </AnalyticsKpiGrid>

      {/* Experiment List */}
      <div className="space-y-4">
        {experiments.map((exp) => (
          <div
            key={exp.id}
            className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/20 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-on-surface">{exp.name}</h2>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${
                      exp.status === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-surface-container text-on-surface-variant border border-outline-variant/30"
                    }`}
                  >
                    {exp.status}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-1">{exp.hypothesis}</p>
              </div>

              <div className="text-left sm:text-right text-xs">
                <span className="text-[11px] text-on-surface-variant block">Primary Metric</span>
                <span className="font-mono text-on-surface font-semibold text-[11px]">
                  {exp.primaryMetric}
                </span>
              </div>
            </div>

            {/* Variants Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exp.variants.map((v) => (
                <div
                  key={v.id}
                  className="p-4 rounded-xl bg-surface-container border border-outline-variant/20 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-on-surface">{v.name}</h3>
                      <span className="text-[10px] font-mono text-on-surface-variant">{v.key}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-surface-container-high text-[10px] font-medium text-on-surface">
                      {v.trafficAllocation}% traffic
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-outline-variant/10 text-center">
                    <div>
                      <span className="text-[10px] text-on-surface-variant block">Sample</span>
                      <span className="text-xs font-bold text-on-surface">
                        {(v.participants || 0).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-on-surface-variant block">Conversion</span>
                      <span className="text-xs font-bold text-on-surface">
                        {v.conversionRate || 0}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-on-surface-variant block">Lift</span>
                      <span
                        className={`text-xs font-bold ${
                          (v.liftPercentage || 0) > 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : (v.liftPercentage || 0) < 0
                            ? "text-rose-500"
                            : "text-on-surface-variant"
                        }`}
                      >
                        {(v.liftPercentage || 0) > 0 ? `+${v.liftPercentage}%` : `${v.liftPercentage || 0}%`}
                      </span>
                    </div>
                  </div>

                  {v.isStatisticallySignificant && (
                    <div className="flex items-center gap-1.5 pt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Statistically Significant (p &lt; 0.05)</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
