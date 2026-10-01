import React from "react";
import { Provider7DayRevenuePoint } from "@/types/provider/dashboard";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

interface WeeklyRevenueChartProps {
  data: Provider7DayRevenuePoint[];
}

export function WeeklyRevenueChart({ data }: WeeklyRevenueChartProps) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 20000);

  return (
    <ProviderCard variant="container" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-on-surface">Weekly Revenue & Volume Trend</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Rolling 7-day fulfillment earnings and completed valet bookings.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-on-surface">
            <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
            Revenue (₹)
          </span>
          <span className="flex items-center gap-1.5 text-on-surface-variant">
            <span className="w-2.5 h-2.5 rounded-sm bg-surface-container-highest" />
            Volume
          </span>
        </div>
      </div>

      {/* SVG / Flex Bar Chart */}
      <div className="h-44 flex items-end justify-between gap-3 pt-4 px-2">
        {data.map((point) => {
          const heightPercent = Math.round((point.revenue / maxRevenue) * 100);

          return (
            <div key={point.day} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
              <div className="text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                ₹{point.revenue.toLocaleString()}
              </div>
              <div className="w-full bg-surface-container-high/40 rounded-t-lg h-full flex items-end p-1">
                <div
                  className="w-full bg-primary/80 group-hover:bg-primary rounded-t-md transition-all duration-300 shadow-md shadow-primary/10"
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-on-surface-variant group-hover:text-on-surface transition-colors">
                {point.day}
              </span>
            </div>
          );
        })}
      </div>
    </ProviderCard>
  );
}
