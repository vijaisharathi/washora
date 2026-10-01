import React from "react";
import { ProviderRecentActivity } from "@/types/provider/dashboard";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

interface RecentActivityFeedProps {
  activities: ProviderRecentActivity[];
}

export function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  const getBadgeClass = (variant?: ProviderRecentActivity["badgeVariant"]) => {
    switch (variant) {
      case "primary":
        return "bg-primary-container/30 text-primary border-primary/20";
      case "success":
        return "bg-emerald-950/40 text-emerald-300 border-emerald-500/30";
      case "warning":
        return "bg-amber-950/40 text-amber-300 border-amber-500/30";
      default:
        return "bg-surface-variant text-on-surface-variant border-white/5";
    }
  };

  return (
    <ProviderCard variant="container" className="p-5">
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
        <div>
          <h3 className="text-sm font-bold text-on-surface">Recent Workshop Activity</h3>
          <p className="text-[11px] text-on-surface-variant">Live audit log of intakes, treatments, and valet dispatches</p>
        </div>
      </div>

      <div className="space-y-3">
        {activities.map((act) => (
          <div
            key={act.id}
            className="p-3 rounded-xl bg-surface-container-low border border-white/5 flex items-start justify-between gap-3 text-xs"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary shrink-0 mt-0.5 border border-white/5">
                <span className="material-symbols-outlined text-[16px]">notifications_active</span>
              </div>
              <div>
                <h4 className="font-semibold text-on-surface">{act.title}</h4>
                <p className="text-[11px] text-on-surface-variant mt-0.5">{act.subtitle}</p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
              {act.badgeText && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getBadgeClass(
                    act.badgeVariant
                  )}`}
                >
                  {act.badgeText}
                </span>
              )}
              <span className="text-[10px] text-on-surface-variant">{act.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </ProviderCard>
  );
}
