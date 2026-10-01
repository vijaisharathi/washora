"use client";

import React from "react";
import {
  TrendingUp,
  ArrowDownRight,
  Smartphone,
  Laptop,
  Tablet,
  CheckCircle2,
  RefreshCw,
  Download,
} from "lucide-react";
import { useFunnelAnalytics } from "../../hooks/useProductAnalytics";
import { AnalyticsSkeleton } from "../skeletons/AnalyticsSkeleton";
import { AnalyticsKpiCard, AnalyticsKpiGrid } from "../AnalyticsKpiCard";

export function FunnelReportView() {
  const { data, loading, error, refetch } = useFunnelAnalytics();

  if (loading && !data) return <AnalyticsSkeleton />;

  if (error || !data) {
    return (
      <div className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-center space-y-3">
        <p className="text-sm font-semibold text-rose-500">{error || "Unable to load funnel analytics."}</p>
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

  const { summary, steps, deviceBreakdown } = data;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-on-surface">
            Customer Conversion Funnel
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Step-by-step conversion rates and drop-off diagnostics across the booking flow.
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
          <a
            href="/api/v1/analytics/export/events"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* Funnel Summary KPIs */}
      <AnalyticsKpiGrid>
        <AnalyticsKpiCard
          kpi={{
            id: "funnel-starts",
            label: "Funnel Starts (App Opened)",
            value: summary.totalFunnelStarts,
            formattedValue: summary.totalFunnelStarts.toLocaleString(),
          }}
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <AnalyticsKpiCard
          kpi={{
            id: "funnel-completions",
            label: "Confirmed Orders",
            value: summary.totalFunnelCompletions,
            formattedValue: summary.totalFunnelCompletions.toLocaleString(),
          }}
          icon={<CheckCircle2 className="w-4 h-4" />}
        />
        <AnalyticsKpiCard
          kpi={{
            id: "funnel-conversion-rate",
            label: "End-to-End Conversion Rate",
            value: summary.overallFunnelConversionRate,
            formattedValue: `${summary.overallFunnelConversionRate}%`,
          }}
          icon={<TrendingUp className="w-4 h-4" />}
        />
      </AnalyticsKpiGrid>

      {/* Main Multi-Stage Funnel Flow */}
      <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-on-surface">Stage-by-Stage Progression</h2>
          <span className="text-xs text-on-surface-variant font-medium">
            Baseline: 100% at Step 1
          </span>
        </div>

        <div className="space-y-4">
          {steps.map((step, idx) => (
            <div
              key={step.step}
              className="p-4 rounded-xl bg-surface-container border border-outline-variant/20 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                    {step.step}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-on-surface">{step.label}</h3>
                    <p className="text-[11px] text-on-surface-variant font-mono">{step.eventName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="text-right">
                    <span className="text-on-surface font-bold">
                      {step.uniqueUsers.toLocaleString()}
                    </span>
                    <span className="text-on-surface-variant ml-1 text-[11px]">visitors</span>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {step.overallConversionRate}%
                    </span>
                    <span className="text-on-surface-variant ml-1 text-[11px]">of total</span>
                  </div>
                  {idx > 0 && (
                    <div className="text-right flex items-center gap-1 text-rose-500 font-semibold text-[11px]">
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      <span>{step.dropOffRate}% drop</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="w-full h-2.5 rounded-full bg-surface-container-high overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(4, step.overallConversionRate)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Platform / Device Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {deviceBreakdown.map((item) => {
          const Icon =
            item.device.toLowerCase() === "mobile"
              ? Smartphone
              : item.device.toLowerCase() === "desktop"
              ? Laptop
              : Tablet;

          const total = deviceBreakdown.reduce((acc, d) => acc + d.count, 0);
          const share = total > 0 ? ((item.count / total) * 100).toFixed(1) : "0";

          return (
            <div
              key={item.device}
              className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-surface-container text-primary">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-on-surface capitalize">
                    {item.device}
                  </h4>
                  <p className="text-[11px] text-on-surface-variant">
                    {item.count.toLocaleString()} sessions
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-on-surface font-mono">{share}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
