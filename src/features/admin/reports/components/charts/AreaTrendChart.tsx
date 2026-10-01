"use client";

import React, { useState } from "react";
import { AnalyticsTimePoint } from "@/types/admin/analytics";

interface SeriesConfig {
  name: string;
  color: string;
  gradientId: string;
  formatter?: (val: number) => string;
}

interface AreaTrendChartProps {
  title: string;
  subtitle?: string;
  data: AnalyticsTimePoint[];
  primarySeries: SeriesConfig;
  secondarySeries?: SeriesConfig;
  tertiarySeries?: SeriesConfig;
  height?: number;
}

export function AreaTrendChart({
  title,
  subtitle,
  data,
  primarySeries,
  secondarySeries,
  tertiarySeries,
  height = 240,
}: AreaTrendChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col items-center justify-center text-center h-[280px]">
        <p className="text-xs font-semibold text-on-surface">No data available</p>
        <p className="text-[11px] text-on-surface-variant mt-0.5">
          Try expanding your date range filter.
        </p>
      </div>
    );
  }

  const allValues = [
    ...data.map((d) => d.value),
    ...(secondarySeries ? data.map((d) => d.secondaryValue || 0) : []),
    ...(tertiarySeries ? data.map((d) => d.tertiaryValue || 0) : []),
  ];
  const maxValue = Math.max(...allValues, 1);

  // SVG Coordinates mapping (0 to 100 x, 10 to 90 y)
  const getCoordinates = (accessor: (d: AnalyticsTimePoint) => number) => {
    return data.map((item, idx) => {
      const x = data.length > 1 ? (idx / (data.length - 1)) * 100 : 50;
      const y = 90 - (accessor(item) / maxValue) * 75;
      return { x, y };
    });
  };

  const primaryCoords = getCoordinates((d) => d.value);
  const secondaryCoords = secondarySeries
    ? getCoordinates((d) => d.secondaryValue || 0)
    : [];
  const tertiaryCoords = tertiarySeries
    ? getCoordinates((d) => d.tertiaryValue || 0)
    : [];

  const buildPath = (coords: { x: number; y: number }[]) => {
    if (coords.length === 0) return "";
    return coords.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
    }, "");
  };

  const buildArea = (coords: { x: number; y: number }[]) => {
    if (coords.length === 0) return "";
    const line = buildPath(coords);
    return `${line} L 100,95 L 0,95 Z`;
  };

  const activeItem = hoverIndex !== null ? data[hoverIndex] : null;

  return (
    <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-on-surface">{title}</h3>
          {subtitle && (
            <p className="text-xs text-on-surface-variant mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: primarySeries.color }}
            />
            <span className="text-on-surface-variant font-medium">
              {primarySeries.name}
            </span>
          </div>

          {secondarySeries && (
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: secondarySeries.color }}
              />
              <span className="text-on-surface-variant font-medium">
                {secondarySeries.name}
              </span>
            </div>
          )}

          {tertiarySeries && (
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: tertiarySeries.color }}
              />
              <span className="text-on-surface-variant font-medium">
                {tertiarySeries.name}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* SVG Canvas */}
      <div
        className="relative w-full overflow-hidden select-none"
        style={{ height: `${height}px` }}
      >
        {/* Y-Axis Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
          <div className="border-b border-outline-variant/15 text-[10px] font-mono text-on-surface-variant/70">
            {primarySeries.formatter ? primarySeries.formatter(maxValue) : maxValue}
          </div>
          <div className="border-b border-outline-variant/15 text-[10px] font-mono text-on-surface-variant/70">
            {primarySeries.formatter
              ? primarySeries.formatter(Math.round(maxValue / 2))
              : Math.round(maxValue / 2)}
          </div>
          <div className="border-b border-outline-variant/25 text-[10px] font-mono text-on-surface-variant/70">
            0
          </div>
        </div>

        {/* SVG Drawing */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-[calc(100%-24px)] overflow-visible"
        >
          <defs>
            <linearGradient
              id={primarySeries.gradientId}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor={primarySeries.color}
                stopOpacity="0.25"
              />
              <stop
                offset="100%"
                stopColor={primarySeries.color}
                stopOpacity="0.0"
              />
            </linearGradient>

            {secondarySeries && (
              <linearGradient
                id={secondarySeries.gradientId}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={secondarySeries.color}
                  stopOpacity="0.2"
                />
                <stop
                  offset="100%"
                  stopColor={secondarySeries.color}
                  stopOpacity="0.0"
                />
              </linearGradient>
            )}
          </defs>

          {/* Secondary Area & Line */}
          {secondarySeries && secondaryCoords.length > 0 && (
            <>
              <path
                d={buildArea(secondaryCoords)}
                fill={`url(#${secondarySeries.gradientId})`}
              />
              <path
                d={buildPath(secondaryCoords)}
                fill="none"
                stroke={secondarySeries.color}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* Tertiary Line */}
          {tertiarySeries && tertiaryCoords.length > 0 && (
            <path
              d={buildPath(tertiaryCoords)}
              fill="none"
              stroke={tertiarySeries.color}
              strokeWidth="1.8"
              strokeDasharray="2 2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Primary Area & Line */}
          <path
            d={buildArea(primaryCoords)}
            fill={`url(#${primarySeries.gradientId})`}
          />
          <path
            d={buildPath(primaryCoords)}
            fill="none"
            stroke={primarySeries.color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hover Points and Vertical Guide */}
          {hoverIndex !== null && (
            <>
              <line
                x1={primaryCoords[hoverIndex]?.x}
                y1="10"
                x2={primaryCoords[hoverIndex]?.x}
                y2="95"
                stroke="currentColor"
                strokeWidth="0.8"
                strokeDasharray="2 2"
                className="text-on-surface-variant/50"
              />
              <circle
                cx={primaryCoords[hoverIndex]?.x}
                cy={primaryCoords[hoverIndex]?.y}
                r="2.5"
                fill={primarySeries.color}
                stroke="#ffffff"
                strokeWidth="1"
              />
            </>
          )}
        </svg>

        {/* X-Axis Labels */}
        <div className="absolute inset-x-0 bottom-0 flex justify-between text-[10px] font-mono text-on-surface-variant/80 px-1">
          {data.map((item, idx) => (
            <span
              key={item.date}
              className={`cursor-pointer transition-colors ${
                hoverIndex === idx ? "font-bold text-primary" : ""
              }`}
              onMouseEnter={() => setHoverIndex(idx)}
            >
              {item.label}
            </span>
          ))}
        </div>

        {/* Floating Tooltip */}
        {activeItem && hoverIndex !== null && (
          <div
            className="absolute top-2 pointer-events-none p-2 rounded-xl bg-surface-container-highest border border-outline-variant/50 shadow-lg text-[11px] z-20"
            style={{
              left: `${Math.min(Math.max(primaryCoords[hoverIndex]?.x || 0, 15), 75)}%`,
              transform: "translateX(-50%)",
            }}
          >
            <p className="font-bold text-on-surface mb-1">{activeItem.label}</p>
            <div className="space-y-0.5">
              <p className="flex items-center justify-between gap-3 text-on-surface">
                <span className="font-medium" style={{ color: primarySeries.color }}>
                  {primarySeries.name}:
                </span>
                <span className="font-bold font-mono">
                  {primarySeries.formatter
                    ? primarySeries.formatter(activeItem.value)
                    : activeItem.value}
                </span>
              </p>

              {secondarySeries && activeItem.secondaryValue !== undefined && (
                <p className="flex items-center justify-between gap-3 text-on-surface">
                  <span className="font-medium" style={{ color: secondarySeries.color }}>
                    {secondarySeries.name}:
                  </span>
                  <span className="font-bold font-mono">
                    {secondarySeries.formatter
                      ? secondarySeries.formatter(activeItem.secondaryValue)
                      : activeItem.secondaryValue}
                  </span>
                </p>
              )}

              {tertiarySeries && activeItem.tertiaryValue !== undefined && (
                <p className="flex items-center justify-between gap-3 text-on-surface">
                  <span className="font-medium" style={{ color: tertiarySeries.color }}>
                    {tertiarySeries.name}:
                  </span>
                  <span className="font-bold font-mono">
                    {tertiarySeries.formatter
                      ? tertiarySeries.formatter(activeItem.tertiaryValue)
                      : activeItem.tertiaryValue}
                  </span>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
