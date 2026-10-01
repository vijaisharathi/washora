import React from "react";
import { Store } from "lucide-react";

interface ConfirmationServiceCardProps {
  serviceName: string;
  variantName?: string;
  providerName: string;
}

export function ConfirmationServiceCard({
  serviceName,
  variantName,
  providerName,
}: ConfirmationServiceCardProps) {
  return (
    <div className="bg-surface-container rounded-2xl border border-white/10 p-5 sm:p-6 flex flex-col justify-between gap-4 shadow-xl">
      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
        Service Details
      </span>

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-inner">
          <span className="material-symbols-outlined text-2xl">dry_cleaning</span>
        </div>

        <div className="space-y-1">
          <h3 className="font-bold text-sm sm:text-base text-on-surface">
            {serviceName}
          </h3>
          {variantName && (
            <p className="text-xs text-primary font-medium">{variantName}</p>
          )}
          <p className="text-xs text-on-surface-variant flex items-center gap-1.5 pt-0.5">
            <Store className="h-3.5 w-3.5 text-on-surface-variant" />
            <span>Studio: {providerName}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
