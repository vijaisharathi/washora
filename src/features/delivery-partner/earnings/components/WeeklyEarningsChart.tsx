"use client";

import React from "react";
import { BarChart3, TrendingUp } from "lucide-react";

interface WeeklyEarningsChartProps {
  data: { day: string; amount: number; tripCount: number }[];
}

export function WeeklyEarningsChart({ data }: WeeklyEarningsChartProps) {
  const maxVal = Math.max(...data.map((d) => d.amount), 2000);

  return (
    <div className="p-6 rounded-3xl bg-surface-container/80 border border-outline-variant/25 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-on-surface">Weekly Earnings Performance</h2>
            <p className="text-[11px] text-on-surface-variant">Daily payout earnings distribution (Mon - Sun)</p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          Peak: Thu (₹1,890)
        </span>
      </div>

      {/* Bar Columns */}
      <div className="grid grid-cols-7 gap-2 pt-4 items-end h-44">
        {data.map((item) => {
          const heightPercent = Math.round((item.amount / maxVal) * 100);
          const isToday = item.day === "Wed";

          return (
            <div key={item.day} className="flex flex-col items-center gap-2 h-full justify-end">
              <span className="text-[10px] font-mono text-on-surface-variant font-semibold">
                ₹{item.amount}
              </span>

              <div className="w-full max-w-[40px] bg-surface-container-highest rounded-xl overflow-hidden p-0.5 flex flex-col justify-end h-28 border border-outline-variant/15">
                <div
                  className={`w-full rounded-lg transition-all duration-500 ${
                    isToday
                      ? "bg-gradient-to-t from-primary to-purple-400 shadow-md animate-pulse"
                      : "bg-primary/40 hover:bg-primary/70"
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>

              <div className="text-center">
                <p className={`text-xs font-bold ${isToday ? "text-primary" : "text-on-surface"}`}>
                  {item.day}
                </p>
                <p className="text-[9px] text-on-surface-variant font-mono">{item.tripCount} trips</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
