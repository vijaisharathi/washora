"use client";

import React from "react";
import { Check, Navigation, MapPin, PackageCheck, KeyRound } from "lucide-react";
import { DeliveryStep } from "@/types/delivery-partner";

interface DeliveryWorkflowStepperProps {
  currentStep: DeliveryStep;
}

export function DeliveryWorkflowStepper({ currentStep }: DeliveryWorkflowStepperProps) {
  const steps: { id: DeliveryStep; label: string; icon: React.ElementType }[] = [
    { id: "TRANSIT", label: "1. In Transit", icon: Navigation },
    { id: "ARRIVE", label: "2. Arrive", icon: MapPin },
    { id: "VERIFY_HANDOVER", label: "3. Check Garments", icon: PackageCheck },
    { id: "CONFIRM_OTP", label: "4. Handover OTP", icon: KeyRound },
  ];

  const getStepIndex = (step: DeliveryStep) => {
    switch (step) {
      case "TRANSIT":
        return 0;
      case "ARRIVE":
        return 1;
      case "VERIFY_HANDOVER":
        return 2;
      case "CONFIRM_OTP":
        return 3;
      case "COMPLETED":
        return 4;
    }
  };

  const currentIndex = getStepIndex(currentStep);

  return (
    <div className="p-4 rounded-3xl bg-surface-container/80 border border-outline-variant/20 shadow-sm overflow-x-auto">
      <div className="flex items-center justify-between min-w-[540px] px-2">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <React.Fragment key={step.id}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isDone
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : isCurrent
                      ? "bg-primary/20 text-primary border-2 border-primary animate-pulse"
                      : "bg-surface-container-highest text-on-surface-variant/40 border border-outline-variant/20"
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span
                  className={`text-xs font-semibold whitespace-nowrap ${
                    isCurrent ? "text-primary" : isDone ? "text-on-surface" : "text-on-surface-variant/50"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {idx < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-3 rounded transition-all ${
                    idx < currentIndex ? "bg-primary" : "bg-outline-variant/20"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
