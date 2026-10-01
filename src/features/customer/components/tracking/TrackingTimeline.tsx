import React from "react";
import { OrderTimelineStep } from "@/types/customer/orderLifecycle";
import { Check, Clock } from "lucide-react";

interface TrackingTimelineProps {
  timeline: OrderTimelineStep[];
}

export function TrackingTimeline({ timeline }: TrackingTimelineProps) {
  return (
    <div className="bg-surface-container rounded-2xl border border-white/10 p-6 flex flex-col h-full shadow-xl">
      <h2 className="font-bold text-base text-on-surface font-headline mb-6">
        Status Timeline
      </h2>

      <div className="relative flex-1">
        {/* Continuous Vertical Connector */}
        <div className="absolute left-[15px] top-[15px] bottom-[15px] w-0.5 bg-white/10" />

        <ul className="flex flex-col gap-6 relative z-10">
          {timeline.map((step) => {
            const isCompleted = step.state === "COMPLETED";
            const isActive = step.state === "ACTIVE";
            const isUpcoming = step.state === "UPCOMING";

            return (
              <li
                key={step.id}
                className={`flex gap-3.5 items-start ${isUpcoming ? "opacity-40" : ""}`}
              >
                {/* Step Icon Badge */}
                {isCompleted && (
                  <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary flex items-center justify-center shrink-0 shadow-sm">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                )}

                {isActive && (
                  <div className="w-8 h-8 rounded-full bg-primary border-2 border-surface flex items-center justify-center shrink-0 shadow-lg shadow-primary/30 relative z-10 animate-pulse">
                    <Clock className="h-4 w-4 text-on-primary" />
                  </div>
                )}

                {isUpcoming && (
                  <div className="w-8 h-8 rounded-full bg-surface-container-low border border-white/10 flex items-center justify-center shrink-0 text-on-surface-variant">
                    <span className="w-2 h-2 rounded-full bg-white/20" />
                  </div>
                )}

                {/* Step Text Details */}
                <div className="pt-0.5 space-y-0.5 min-w-0">
                  <span
                    className={`font-bold text-xs sm:text-sm block ${
                      isActive
                        ? "text-primary"
                        : isCompleted
                        ? "text-on-surface"
                        : "text-on-surface-variant"
                    }`}
                  >
                    {step.title}
                  </span>

                  {step.timestamp && (
                    <span
                      className={`text-[11px] block ${
                        isActive ? "text-primary/80 font-medium" : "text-on-surface-variant"
                      }`}
                    >
                      {step.timestamp}
                    </span>
                  )}

                  {step.description && !isUpcoming && (
                    <p className="text-[11px] text-on-surface-variant/70 leading-relaxed pt-0.5">
                      {step.description}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
