"use client";

import React, { useState } from "react";
import {
  Lightbulb,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import { useProductImprovements } from "../../hooks/useProductAnalytics";
import { AnalyticsSkeleton } from "../skeletons/AnalyticsSkeleton";
import { AnalyticsKpiCard, AnalyticsKpiGrid } from "../AnalyticsKpiCard";

export function ImprovementsReportView() {
  const { data: improvements, loading, error, refetch } = useProductImprovements();
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  if (loading && improvements.length === 0) return <AnalyticsSkeleton />;

  if (error && improvements.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-center space-y-3">
        <p className="text-sm font-semibold text-rose-500">{error || "Unable to load improvements."}</p>
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

  const p0Count = improvements.filter((i) => i.priority === "P0").length;
  const inDevCount = improvements.filter(
    (i) => i.status === "IN_DEVELOPMENT" || i.status === "VALIDATING",
  ).length;
  const acceptedCount = improvements.filter((i) => i.status === "ACCEPTED").length;

  const filtered =
    selectedStatus === "ALL"
      ? improvements
      : improvements.filter((i) => i.status === selectedStatus);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-on-surface">
            Continuous Product Improvements
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Data-backed product enhancement initiatives, hypothesis tracking, and validated impact.
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
            id: "imp-total",
            label: "Total Initiatives",
            value: improvements.length,
            formattedValue: String(improvements.length),
          }}
          icon={<Lightbulb className="w-4 h-4" />}
        />
        <AnalyticsKpiCard
          kpi={{
            id: "imp-p0",
            label: "High Priority (P0)",
            value: p0Count,
            formattedValue: String(p0Count),
          }}
          icon={<Sparkles className="w-4 h-4" />}
        />
        <AnalyticsKpiCard
          kpi={{
            id: "imp-in-dev",
            label: "In Progress / Validating",
            value: inDevCount,
            formattedValue: String(inDevCount),
          }}
          icon={<Clock className="w-4 h-4" />}
        />
        <AnalyticsKpiCard
          kpi={{
            id: "imp-accepted",
            label: "Accepted & Shipped",
            value: acceptedCount,
            formattedValue: String(acceptedCount),
          }}
          icon={<CheckCircle2 className="w-4 h-4" />}
        />
      </AnalyticsKpiGrid>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {["ALL", "IDEA", "BACKLOG", "IN_DEVELOPMENT", "VALIDATING", "ACCEPTED"].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setSelectedStatus(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedStatus === st
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            {st.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Initiatives Cards */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-3">
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide ${
                    item.priority === "P0"
                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  }`}
                >
                  {item.priority}
                </span>
                <h2 className="text-sm font-bold text-on-surface">{item.title}</h2>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-surface-container text-[11px] font-semibold text-on-surface border border-outline-variant/30">
                  {item.status.replace("_", " ")}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Observed Problem & Evidence
                </span>
                <p className="text-on-surface leading-relaxed">{item.problem}</p>
                <p className="text-on-surface-variant italic text-[11px]">{item.evidence}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Proposed Change & Impact
                </span>
                <p className="text-on-surface leading-relaxed">{item.proposedChange}</p>
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Expected: {item.expectedImpact}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-outline-variant/10 text-[11px] text-on-surface-variant">
              <span>Owner: {item.owner}</span>
              {item.linkedKpi && <span>Target KPI: {item.linkedKpi}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
