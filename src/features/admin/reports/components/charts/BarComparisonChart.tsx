"use client";

import React, { useState } from "react";
import { AnalyticsTimePoint } from "@/types/admin/analytics";

interface BarComparisonChartProps {
  title: string;
  subtitle?: string;
  data: AnalyticsTimePoint[];
  barColor?: string;
  secondaryBarColor?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  formatter?: (val: number) => string;
  height?: number;
}

export function BarComparisonChart({
  title,
  subtitle,
  data,
  barColor = "#3B82F6",
  secondaryBarColor = "#10B981",
  primaryLabel = "Value",
  secondaryLabel,
  formatter = (v) => String(v),
  height = 240,
}: BarComparisonChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col items-center justify-center text-center h-[280px]">
        <p className="text-xs font-semibold text-on-surface">No data available</p>
      </div>
    );
  }

  const allVals = [
    ...data.map((d) => d.value),
    ...(secondaryLabel ? data.map((d) => d.secondaryValue || 0) : []),
  ];
  const maxVal = Math.max(...allVals, 1);

  return (
    <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-on-surface">{title}</h3>
          {subtitle && (
            <p className="text-xs text-on-surface-variant mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: barColor }}
            />
            <span className="text-on-surface-variant font-medium">
              {primaryLabel}
            </span>
          </div>

          {secondaryLabel && (
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: secondaryBarColor }}
              />
              <span className="text-on-surface-variant font-medium">
                {secondaryLabel}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bars Canvas */}
      <div
        className="relative w-full flex items-end gap-2 pt-6 pb-6 select-none"
        style={{ height: `${height}px` }}
      >
        {/* Y Grid Lines */}
        <div className="absolute inset-x-0 top-6 border-b border-outline-variant/15 text-[10px] font-mono text-on-surface-variant/70">
          {formatter(maxVal)}
        </div>
        <div className="absolute inset-x-0 top-1/2 border-b border-outline-variant/15 text-[10px] font-mono text-on-surface-variant/70">
          {formatter(Math.round(maxVal / 2))}
        </div>
        <div className="absolute inset-x-0 bottom-6 border-b border-outline-variant/25 text-[10px] font-mono text-on-surface-variant/70">
          0
        </div>

        {/* Bars */}
        <div className="relative z-10 w-full h-full flex items-end justify-between gap-1.5 px-2">
          {data.map((item, idx) => {
            const h1 = Math.max(4, Math.round((item.value / maxVal) * 85));
            const h2 = secondaryLabel
              ? Math.max(4, Math.round(((item.secondaryValue || 0) / maxVal) * 85))
              : 0;

            const isHovered = hoveredIndex === idx;

            return (
              <div
                key={item.date}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Tooltip on hover */}
                {isHovered && (
                  <div className="absolute -top-4 pointer-events-none px-2.5 py-1.5 rounded-xl bg-surface-container-highest border border-outline-variant/50 shadow-lg text-[11px] z-30 flex flex-col items-center">
                    <span className="font-bold text-on-surface">{item.label}</span>
                    <span className="font-semibold text-primary">
                      {primaryLabel}: {formatter(item.value)}
                    </span>
                    {secondaryLabel && item.secondaryValue !== undefined && (
                      <span className="font-semibold text-emerald-500">
                        {secondaryLabel}: {formatter(item.secondaryValue)}
                      </span>
                    )}
                  </div>
                )}

                <div className="w-full flex items-end justify-center gap-1">
                  <div
                    className="w-full max-w-[20px] rounded-t-md transition-all duration-300"
                    style={{
                      height: `${h1}%`,
                      backgroundColor: barColor,
                      opacity: isHovered ? 1 : 0.85,
                    }}
                  />
                  {secondaryLabel && (
                    <div
                      className="w-full max-w-[20px] rounded-t-md transition-all duration-300"
                      style={{
                        height: `${h2}%`,
                        backgroundColor: secondaryBarColor,
                        opacity: isHovered ? 1 : 0.85,
                      }}
                    />
                  )}
                </div>

                {/* X Label */}
                <span
                  className={`mt-2 text-[10px] font-mono transition-colors ${
                    isHovered ? "font-bold text-primary" : "text-on-surface-variant"
                  }`}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
