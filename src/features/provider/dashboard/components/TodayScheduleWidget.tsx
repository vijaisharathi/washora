import React from "react";
import Link from "next/link";
import { ProviderScheduleItem } from "@/types/provider/dashboard";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

interface TodayScheduleWidgetProps {
  items: ProviderScheduleItem[];
}

export function TodayScheduleWidget({ items }: TodayScheduleWidgetProps) {
  const getStatusBadge = (status: ProviderScheduleItem["status"]) => {
    switch (status) {
      case "NEW_PICKUP":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950/40 text-blue-300 border border-blue-500/30">New Intake</span>;
      case "IN_INSPECTION":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-500/30">Inspection</span>;
      case "IN_PROCESSING":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950/40 text-purple-300 border border-purple-500/30">In Care</span>;
      case "READY_VALET":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-500/30">Ready</span>;
      case "DISPATCHED":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">Dispatched</span>;
      default:
        return null;
    }
  };

  return (
    <ProviderCard variant="container" className="p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
        <div>
          <h3 className="text-sm font-bold text-on-surface">Today&apos;s Schedule</h3>
          <p className="text-[11px] text-on-surface-variant">Scheduled valet collections & drop-offs</p>
        </div>
        <Link
          href="/provider/orders"
          className="text-xs text-primary hover:underline font-semibold"
        >
          View All
        </Link>
      </div>

      <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-xl bg-surface-container-low border border-white/5 flex flex-col gap-1.5 transition-colors hover:bg-surface-container"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-on-surface">{item.orderNumber}</span>
              {getStatusBadge(item.status)}
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-on-surface truncate">{item.customerName}</span>
              <span className="text-on-surface-variant shrink-0">{item.itemsCount} items</span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-1 border-t border-white/5">
              <span className="text-primary truncate">{item.serviceCategory}</span>
              <span className="font-medium text-on-surface shrink-0">{item.timeWindow}</span>
            </div>
          </div>
        ))}
      </div>
    </ProviderCard>
  );
}
