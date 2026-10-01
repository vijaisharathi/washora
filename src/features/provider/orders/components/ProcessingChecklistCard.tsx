"use client";

import React from "react";
import { ProcessingChecklistStep } from "@/types/provider/orders";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

interface ProcessingChecklistCardProps {
  steps: ProcessingChecklistStep[];
  serviceTitle: string;
  onToggleStep: (stepId: string) => Promise<any>;
  isToggling: boolean;
}

export function ProcessingChecklistCard({
  steps,
  serviceTitle,
  onToggleStep,
  isToggling,
}: ProcessingChecklistCardProps) {
  return (
    <ProviderCard variant="container" className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Service Processing Checklist</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">{serviceTitle}</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-container/20 text-primary border border-primary/20">
          Standard Operating Procedure (SOP)
        </span>
      </div>

      <div className="space-y-3">
        {steps.map((step) => {
          return (
            <div
              key={step.id}
              onClick={() => onToggleStep(step.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-4 group ${
                step.isCompleted
                  ? "bg-surface-container-high/40 border-white/5 opacity-80"
                  : step.isCurrent
                  ? "bg-primary-container/10 border-primary shadow-sm shadow-primary/10"
                  : "bg-surface-container-low border-white/5 hover:border-white/20"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <button
                  type="button"
                  disabled={isToggling}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all mt-0.5 ${
                    step.isCompleted
                      ? "bg-primary text-on-primary"
                      : step.isCurrent
                      ? "border-2 border-primary text-primary"
                      : "border-2 border-white/20 text-transparent"
                  }`}
                >
                  {step.isCompleted ? (
                    <span className="material-symbols-outlined text-[15px]">check</span>
                  ) : step.isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  ) : null}
                </button>

                <div>
                  <h3
                    className={`text-sm font-bold leading-tight ${
                      step.isCompleted
                        ? "text-on-surface line-through opacity-70"
                        : step.isCurrent
                        ? "text-primary"
                        : "text-on-surface"
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>

              {step.completedAt && (
                <span className="text-[11px] text-on-surface-variant font-mono whitespace-nowrap">
                  {step.completedAt}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </ProviderCard>
  );
}
