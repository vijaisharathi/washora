"use client";

import React, { useState } from "react";
import { AnalyticsBreakdownItem } from "@/types/admin/analytics";

interface DonutDistributionChartProps {
  title: string;
  subtitle?: string;
  items: AnalyticsBreakdownItem[];
  centerLabel?: string;
  centerValue?: string;
}

const DEFAULT_PALETTE = [
  "#3B82F6",
  "#10B981",
  "#8B5CF6",
  "#F59E0B",
  "#EC4899",
  "#06B6D4",
  "#EF4444",
];

export function DonutDistributionChart({
  title,
  subtitle,
  items,
  centerLabel = "Total",
  centerValue,
}: DonutDistributionChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!items || items.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col items-center justify-center text-center h-[280px]">
        <p className="text-xs font-semibold text-on-surface">No distribution data</p>
      </div>
    );
  }

  const totalValue = items.reduce((sum, item) => sum + item.value, 0);

  // SVG Donut Calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  const segments = items.map((item, idx) => {
    const percent = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
    const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += percent;

    return {
      ...item,
      color: item.color || DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length],
      percent,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const activeSegment = hoveredIndex !== null ? segments[hoveredIndex] : null;

  return (
    <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-on-surface">{title}</h3>
        {subtitle && (
          <p className="text-xs text-on-surface-variant mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 my-auto">
        {/* SVG Ring */}
        <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 transform">
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth="10"
              className="text-surface-container-high"
            />
            {segments.map((seg, idx) => (
              <circle
                key={seg.id}
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={hoveredIndex === idx ? "12" : "10"}
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            ))}
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-2">
            <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
              {activeSegment ? activeSegment.label : centerLabel}
            </span>
            <span className="text-sm font-bold text-on-surface tracking-tight mt-0.5 font-mono">
              {activeSegment
                ? activeSegment.formattedValue || `${activeSegment.percent.toFixed(1)}%`
                : centerValue || totalValue}
            </span>
          </div>
        </div>

        {/* Legend List */}
        <div className="flex-1 w-full space-y-2">
          {segments.map((seg, idx) => (
            <div
              key={seg.id}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`flex items-center justify-between p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                hoveredIndex === idx
                  ? "bg-surface-container-high font-semibold"
                  : "hover:bg-surface-container"
              }`}
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="text-on-surface truncate">{seg.label}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 font-mono">
                <span className="text-on-surface-variant">
                  {seg.formattedValue || seg.value}
                </span>
                <span className="font-bold text-on-surface w-10 text-right">
                  {seg.percentage || seg.percent.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
