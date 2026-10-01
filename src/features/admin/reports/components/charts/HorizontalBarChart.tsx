import React from "react";
import { AnalyticsBreakdownItem } from "@/types/admin/analytics";

interface HorizontalBarChartProps {
  title: string;
  subtitle?: string;
  items: AnalyticsBreakdownItem[];
  color?: string;
}

export function HorizontalBarChart({
  title,
  subtitle,
  items,
  color = "#3B82F6",
}: HorizontalBarChartProps) {
  if (!items || items.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col items-center justify-center text-center h-[280px]">
        <p className="text-xs font-semibold text-on-surface">No distribution data</p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-on-surface">{title}</h3>
        {subtitle && (
          <p className="text-xs text-on-surface-variant mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="space-y-3.5">
        {items.map((item) => {
          const itemColor = item.color || color;
          return (
            <div key={item.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-on-surface truncate pr-2">
                  {item.label}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-on-surface-variant">
                    {item.formattedValue || item.value}
                  </span>
                  <span className="font-bold font-mono text-on-surface w-10 text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(Math.max(item.percentage, 2), 100)}%`,
                    backgroundColor: itemColor,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
