import React from "react";
import Link from "next/link";
import { ProviderUrgentAction } from "@/types/provider/dashboard";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

interface UrgentActionsCardProps {
  actions: ProviderUrgentAction[];
}

export function UrgentActionsCard({ actions }: UrgentActionsCardProps) {
  if (!actions || actions.length === 0) return null;

  return (
    <ProviderCard
      variant="high"
      className="p-5 border-l-4 border-l-error bg-surface-container/90 relative overflow-hidden"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-error text-xl">warning</span>
        <h3 className="text-sm font-bold text-on-surface">Urgent Workshop Actions Required</h3>
      </div>

      <div className="flex flex-col gap-2.5">
        {actions.map((act) => (
          <div
            key={act.id}
            className="p-3 rounded-xl bg-surface-container-low border border-white/5 flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-amber-400 text-lg">{act.iconName}</span>
              <span className="font-medium text-on-surface">{act.title}</span>
            </div>
            <Link
              href={act.href}
              className="px-3 py-1 rounded-lg bg-primary/15 text-primary hover:bg-primary hover:text-on-primary-container font-semibold transition-colors shrink-0"
            >
              {act.actionLabel}
            </Link>
          </div>
        ))}
      </div>
    </ProviderCard>
  );
}
