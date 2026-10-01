import React from "react";
import { ProviderOrderPipelineStage } from "@/types/provider/dashboard";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

interface OrderPipelineWidgetProps {
  stages: ProviderOrderPipelineStage[];
}

export function OrderPipelineWidget({ stages }: OrderPipelineWidgetProps) {
  return (
    <ProviderCard variant="container" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-on-surface">Order Care Pipeline</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Real-time live throughput distribution across workshop processing stages.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary-container/30 text-primary border border-primary/20">
          56 Units Active
        </span>
      </div>

      {/* Progress Track & Nodes */}
      <div className="relative pt-3 pb-2">
        {/* Background Track Bar */}
        <div className="absolute top-[28px] left-8 right-8 h-1 bg-surface-container-high rounded-full -translate-y-1/2 z-0">
          <div className="h-full bg-primary rounded-full transition-all duration-500 w-[65%]" />
        </div>

        {/* Nodes Grid */}
        <div className="grid grid-cols-4 gap-2 relative z-10">
          {stages.map((stage) => {
            return (
              <div key={stage.id} className="flex flex-col items-center text-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md ${
                    stage.isComplete
                      ? "bg-primary-container text-on-primary-container border-2 border-primary shadow-primary/20"
                      : stage.isActive
                      ? "bg-primary text-on-primary border-2 border-white animate-pulse"
                      : "bg-surface-container-high text-on-surface-variant border-2 border-white/10"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{stage.icon}</span>
                </div>
                <span className="text-xs font-semibold text-on-surface mt-2.5 line-clamp-1">
                  {stage.label}
                </span>
                <span className="text-[11px] font-bold text-primary">
                  {stage.count} {stage.count === 1 ? "unit" : "units"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </ProviderCard>
  );
}
