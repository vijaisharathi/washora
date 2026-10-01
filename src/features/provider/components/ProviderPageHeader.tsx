import React from "react";
import { cn } from "@/lib/utils";

interface ProviderPageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function ProviderPageHeader({
  title,
  description,
  actions,
  className,
}: ProviderPageHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6", className)}>
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-on-surface tracking-tight">{title}</h2>
        {description && (
          <p className="text-sm text-on-surface-variant mt-1 max-w-2xl">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3 flex-wrap">{actions}</div>}
    </div>
  );
}
