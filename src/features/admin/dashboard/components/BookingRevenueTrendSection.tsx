"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  BarChart3,
  CreditCard,
  Calendar,
  Layers,
} from "lucide-react";
import {
  DashboardTrendPoint,
  RevenueSummary,
  DashboardPeriod,
} from "@/types/admin";

interface BookingRevenueTrendSectionProps {
  trend: DashboardTrendPoint[];
  revenueSummary: RevenueSummary;
  period: DashboardPeriod;
}

export function BookingRevenueTrendSection({
  trend,
  revenueSummary,
  period,
}: BookingRevenueTrendSectionProps) {
  const [hoveredPoint, setHoveredPoint] = useState<DashboardTrendPoint | null>(
    null
  );

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const maxOrders = Math.max(...trend.map((t) => t.orders), 1);
  const maxRevenue = Math.max(...trend.map((t) => t.revenue), 1);

  // SVG points for revenue area curve
  const points = trend.map((point, index) => {
    const x = trend.length > 1 ? (index / (trend.length - 1)) * 100 : 50;
    const y = 90 - (point.revenue / maxRevenue) * 75;
    return `${x},${y}`;
  });

  const pathD =
    points.length > 1
      ? `M ${points[0]} ` +
        points
          .slice(1)
          .map((pt) => `L ${pt}`)
          .join(" ")
      : "";

  const areaD =
    points.length > 1
      ? `${pathD} L 100,100 L 0,100 Z`
      : "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Revenue Overview Area Chart */}
      <div className="lg:col-span-2 p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>Revenue Trend & Velocity</span>
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Cumulative financial turnover for the active window
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-sm font-bold text-success">
              {formatCurrency(revenueSummary.totalRevenue)}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/15 text-success font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +{revenueSummary.growthPct}%
            </span>
          </div>
        </div>

        {/* SVG Curve Canvas */}
        <div className="relative w-full h-56 pt-4 pb-6 flex items-end">
          {/* Y Axis Grid Lines */}
          <div className="absolute inset-x-0 top-2 border-b border-outline-variant/15 text-[10px] text-on-surface-variant font-mono">
            {formatCurrency(maxRevenue)}
          </div>
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-b border-outline-variant/15 text-[10px] text-on-surface-variant font-mono">
            {formatCurrency(maxRevenue / 2)}
          </div>
          <div className="absolute inset-x-0 bottom-6 border-b border-outline-variant/20 text-[10px] text-on-surface-variant font-mono">
            ₹0
          </div>

          {/* SVG Line & Area */}
          <svg
            className="w-full h-full overflow-visible z-10"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="adminRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8a2be2" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#8a2be2" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {areaD && (
              <path
                d={areaD}
                fill="url(#adminRevenueGrad)"
                className="transition-all duration-500"
              />
            )}

            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="#dcb8ff"
                strokeWidth="2.5"
                vectorEffect="non-scaling-stroke"
                className="transition-all duration-500"
              />
            )}
          </svg>

          {/* Interactive Hover Nodes & X Axis Labels */}
          <div className="absolute inset-x-0 bottom-0 flex justify-between text-[11px] font-mono text-on-surface-variant pt-2">
            {trend.map((pt) => (
              <button
                key={pt.label}
                type="button"
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
                className="focus:outline-none flex flex-col items-center group cursor-pointer"
              >
                <span className="group-hover:text-primary group-hover:font-bold transition-colors">
                  {pt.label}
                </span>
              </button>
            ))}
          </div>

          {/* Floating Tooltip */}
          {hoveredPoint && (
            <div className="absolute top-4 right-4 p-2.5 rounded-xl bg-surface-container-high border border-primary/40 shadow-xl text-xs z-20 animate-in fade-in">
              <span className="text-[10px] text-on-surface-variant block font-mono">
                {hoveredPoint.label}
              </span>
              <span className="font-bold text-primary block">
                {formatCurrency(hoveredPoint.revenue)}
              </span>
              <span className="text-[10px] text-on-surface">
                {hoveredPoint.orders} orders
              </span>
            </div>
          )}
        </div>

        {/* Supporting Summary Strip */}
        <div className="border-t border-outline-variant/20 pt-3 mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          <div>
            <span className="text-[10px] text-on-surface-variant block font-mono">
              Prev Period Baseline
            </span>
            <span className="font-semibold text-on-surface font-mono">
              {formatCurrency(revenueSummary.previousPeriodRevenue)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-on-surface-variant block font-mono">
              Total Transactions
            </span>
            <span className="font-semibold text-on-surface font-mono">
              {revenueSummary.transactionCount.toLocaleString("en-IN")}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-on-surface-variant block font-mono">
              Average Order Value
            </span>
            <span className="font-semibold text-on-surface font-mono">
              {formatCurrency(revenueSummary.averageOrderValue)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Order Volume Bar Histogram */}
      <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <span>Order Distribution</span>
          </h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Volume density across interval intervals
          </p>
        </div>

        {/* Bar Histogram */}
        <div className="h-56 flex items-end justify-around gap-1.5 pt-8 pb-4 border-b border-outline-variant/20">
          {trend.map((pt) => {
            const barHeightPct = (pt.orders / maxOrders) * 100;
            const isHighest = pt.orders === maxOrders;
            return (
              <div
                key={pt.label}
                className="flex-1 flex flex-col items-center h-full justify-end group relative"
              >
                {/* Tooltip on hover */}
                <div className="hidden group-hover:block absolute -top-8 bg-surface-container-highest border border-outline-variant px-1.5 py-0.5 rounded text-[10px] font-mono text-on-surface z-20 whitespace-nowrap shadow-md">
                  {pt.orders} orders
                </div>

                {/* Bar Element */}
                <div
                  className={`w-full rounded-t-md transition-all duration-300 ${
                    isHighest
                      ? "bg-primary shadow-[0_0_12px_rgba(220,184,255,0.4)]"
                      : "bg-surface-container-high group-hover:bg-primary/60"
                  }`}
                  style={{ height: `${Math.max(barHeightPct, 8)}%` }}
                />

                {/* Label */}
                <span className="text-[10px] font-mono text-on-surface-variant mt-2 truncate w-full text-center">
                  {pt.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="pt-3 text-[11px] text-on-surface-variant flex items-center justify-between">
          <span>Peak Interval: {trend.find((t) => t.orders === maxOrders)?.label}</span>
          <span className="font-bold text-primary">{maxOrders} orders peak</span>
        </div>
      </div>
    </div>
  );
}
