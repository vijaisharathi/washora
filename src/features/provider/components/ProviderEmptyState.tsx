import React from "react";
import { cn } from "@/lib/utils";

interface ProviderEmptyStateProps {
  title: string;
  description: string;
  iconName?: string;
  action?: React.ReactNode;
  className?: string;
}

export function ProviderEmptyState({
  title,
  description,
  iconName = "inbox",
  action,
  className,
}: ProviderEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center rounded-xl bg-surface-container/50 border border-white/5",
        className
      )}
    >
      <div className="w-14 h-14 rounded-full bg-surface-variant flex items-center justify-center mb-4 text-primary border border-white/5">
        <span className="material-symbols-outlined text-3xl">{iconName}</span>
      </div>
      <h3 className="text-base font-semibold text-on-surface mb-1">{title}</h3>
      <p className="text-sm text-on-surface-variant max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
