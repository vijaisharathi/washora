"use client";

import React from "react";
import { Check, User, Building2, Sliders, FileCheck2 } from "lucide-react";

interface OnboardingProgressStepperProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

const STEPS = [
  { step: 1, title: "Personal Information", icon: User },
  { step: 2, title: "Organization Information", icon: Building2 },
  { step: 3, title: "Role & Preferences", icon: Sliders },
  { step: 4, title: "Review & Complete", icon: FileCheck2 },
];

export function OnboardingProgressStepper({
  currentStep,
  onStepClick,
}: OnboardingProgressStepperProps) {
  return (
    <div className="w-full max-w-3xl mx-auto mb-8 px-2">
      <div className="grid grid-cols-4 gap-2 md:gap-4 relative">
        {STEPS.map(({ step, title, icon: Icon }) => {
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;
          const isUpcoming = step > currentStep;

          return (
            <button
              key={step}
              type="button"
              disabled={isUpcoming}
              onClick={() => isCompleted && onStepClick(step)}
              className={`flex flex-col items-center text-center group transition-all p-2 rounded-xl ${
                isCompleted
                  ? "cursor-pointer hover:bg-surface-container"
                  : isCurrent
                  ? "cursor-default"
                  : "cursor-not-allowed opacity-40"
              }`}
            >
              {/* Step Circle */}
              <div
                className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                  isCompleted
                    ? "bg-success text-on-primary border border-success"
                    : isCurrent
                    ? "bg-primary text-on-primary border-2 border-primary ring-4 ring-primary/20"
                    : "bg-surface-container text-on-surface-variant border border-outline-variant/40"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>

              {/* Step Label */}
              <div className="mt-2 hidden sm:block">
                <span
                  className={`text-[10px] font-mono uppercase tracking-wider block ${
                    isCurrent ? "text-primary font-bold" : "text-on-surface-variant"
                  }`}
                >
                  Step {step}
                </span>
                <span
                  className={`text-xs font-semibold leading-tight line-clamp-1 ${
                    isCurrent
                      ? "text-on-surface"
                      : isCompleted
                      ? "text-on-surface/80"
                      : "text-on-surface-variant/60"
                  }`}
                >
                  {title}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
