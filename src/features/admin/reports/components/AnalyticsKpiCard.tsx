import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { AnalyticsKPI } from "@/types/admin/analytics";

interface AnalyticsKpiCardProps {
  kpi: AnalyticsKPI;
  icon?: React.ReactNode;
}

export function AnalyticsKpiCard({ kpi, icon }: AnalyticsKpiCardProps) {
  const isUp = kpi.trend === "up";
  const isDown = kpi.trend === "down";

  return (
    <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between hover:border-outline-variant/60 transition-all duration-200">
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-xs font-medium text-on-surface-variant line-clamp-1">
          {kpi.label}
        </span>
        {icon && (
          <div className="w-8 h-8 rounded-xl bg-surface-container-high flex items-center justify-center text-primary shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="text-2xl font-bold text-on-surface tracking-tight">
          {kpi.formattedValue}
        </div>

        {kpi.changePercent !== undefined && (
          <div className="flex items-center gap-1.5 text-xs">
            <span
              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                isUp
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : isDown
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  : "bg-surface-container-high text-on-surface-variant"
              }`}
            >
              {isUp && <TrendingUp className="w-3 h-3" />}
              {isDown && <TrendingDown className="w-3 h-3" />}
              {!isUp && !isDown && <Minus className="w-3 h-3" />}
              {kpi.changePercent > 0 ? `+${kpi.changePercent}%` : `${kpi.changePercent}%`}
            </span>
            <span className="text-[11px] text-on-surface-variant truncate">
              vs previous period
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

interface AnalyticsKpiGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 5 | 6;
}

export function AnalyticsKpiGrid({ children, columns = 4 }: AnalyticsKpiGridProps) {
  const colClass = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
    6: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
  }[columns];

  return <div className={`grid ${colClass} gap-4`}>{children}</div>;
}
