"use client";

import React from "react";
import { WeeklyEarningsTrend } from "@/types/provider/earnings";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

interface WeeklyRevenueFlexChartProps {
  trends: WeeklyEarningsTrend[];
}

export function WeeklyRevenueFlexChart({ trends }: WeeklyRevenueFlexChartProps) {
  const maxVal = Math.max(...trends.map((t) => t.amount), 1000);

  return (
    <ProviderCard variant="container" className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
        <div>
          <h3 className="text-lg font-bold text-on-surface">Weekly Revenue &amp; Care Volume</h3>
          <p className="text-xs text-on-surface-variant">Daily net revenue after platform fee deduction</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-on-surface-variant">Care Revenue (₹)</span>
          </div>
        </div>
      </div>

      {/* Bar Chart Container */}
      <div className="flex items-end justify-between gap-2 md:gap-4 h-48 pt-6 px-2">
        {trends.map((item, idx) => {
          const heightPercent = Math.round((item.amount / maxVal) * 100);
          const isToday = idx === trends.length - 1;

          return (
            <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
              {/* Tooltip & Value */}
              <span className="text-[11px] font-bold text-on-surface opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mb-1">
                ₹{item.amount}
              </span>

              {/* Bar */}
              <div className="w-full max-w-[42px] bg-surface-container-high rounded-t-lg overflow-hidden flex items-end">
                <div
                  className={`w-full rounded-t-lg transition-all duration-700 ease-out group-hover:brightness-110 ${
                    isToday ? "bg-primary shadow-lg shadow-primary/30" : "bg-primary/70"
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>

              {/* Label */}
              <span
                className={`text-xs font-semibold ${
                  isToday ? "text-primary" : "text-on-surface-variant"
                }`}
              >
                {item.day}
              </span>
              <span className="text-[10px] text-on-surface-variant/60 -mt-1">{item.date}</span>
            </div>
          );
        })}
      </div>
    </ProviderCard>
  );
}
