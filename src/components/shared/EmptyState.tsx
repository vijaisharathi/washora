import React from "react";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  materialIcon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  materialIcon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div
      role="region"
      aria-label={title}
      className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-outline-variant/30 bg-surface-container/50 my-6"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-4 border border-primary/20">
        {materialIcon ? (
          <span className="material-symbols-outlined text-2xl">{materialIcon}</span>
        ) : Icon ? (
          <Icon className="h-6 w-6" />
        ) : (
          <span className="material-symbols-outlined text-2xl">inbox</span>
        )}
      </div>
      <h3 className="text-base font-semibold text-on-surface mb-1">{title}</h3>
      <p className="text-sm text-on-surface-variant max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
