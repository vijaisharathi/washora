import React from "react";

interface BookingProgressIndicatorProps {
  currentStep: number;
  totalSteps?: number;
}

const STEP_LABELS = ["Package", "Address", "Schedule", "Review"];

export function BookingProgressIndicator({
  currentStep,
  totalSteps = 4,
}: BookingProgressIndicatorProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs">
        <span className="font-semibold text-on-surface">
          Step {currentStep}: {STEP_LABELS[currentStep - 1] || "Configure"}
        </span>
        <span className="text-on-surface-variant font-mono">
          Step {currentStep} of {totalSteps}
        </span>
      </div>

      <div className="flex gap-1.5 items-center">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                isCompleted || isCurrent
                  ? "bg-primary shadow-sm shadow-primary/30"
                  : "bg-surface-container-high"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
