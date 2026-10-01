"use client";

import React from "react";
import { ProviderPickupStatus } from "@/types/provider/pickups";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

interface HandoffTimelineCardProps {
  status: ProviderPickupStatus;
  handedOverAt?: string;
}

export function HandoffTimelineCard({ status, handedOverAt }: HandoffTimelineCardProps) {
  const isAwaiting = status === "AWAITING_ASSIGNMENT";
  const isAssigned = status === "PARTNER_ASSIGNED";
  const isArrived = status === "PARTNER_ARRIVED";
  const isHandedOver = status === "HANDED_OVER";

  return (
    <ProviderCard variant="container" className="p-6 space-y-4">
      <h3 className="text-base font-bold text-on-surface">Handoff Status</h3>

      <div className="relative pl-3 border-l-2 border-white/10 flex flex-col gap-6 ml-3 text-xs">
        {/* Step 1: Waiting */}
        <div className="relative flex items-start gap-3">
          <div
            className={`absolute -left-[19px] top-0.5 w-3.5 h-3.5 rounded-full border-2 ${
              isAwaiting
                ? "border-primary bg-primary"
                : "border-primary/50 bg-surface-container"
            }`}
          />
          <div>
            <span
              className={`font-semibold ${
                isAwaiting ? "text-primary" : "text-on-surface-variant line-through"
              }`}
            >
              Waiting for Assignment
            </span>
            <p className="text-[10px] text-on-surface-variant">Scheduled for valet routing</p>
          </div>
        </div>

        {/* Step 2: Assigned / En Route */}
        <div className="relative flex items-start gap-3">
          <div
            className={`absolute -left-[19px] top-0.5 w-3.5 h-3.5 rounded-full border-2 ${
              isAssigned || isArrived
                ? "border-primary bg-primary"
                : isHandedOver
                ? "border-primary/50 bg-surface-container"
                : "border-white/20 bg-surface-container-low"
            }`}
          />
          <div>
            <span
              className={`font-semibold ${
                isAssigned || isArrived
                  ? "text-primary"
                  : isHandedOver
                  ? "text-on-surface-variant line-through"
                  : "text-on-surface-variant"
              }`}
            >
              Partner En Route / Arrived
            </span>
            <p className="text-[10px] text-on-surface-variant">
              {isArrived ? "Valet arrived at studio" : "Assigned dispatch partner en route"}
            </p>
          </div>
        </div>

        {/* Step 3: Handed Over */}
        <div className="relative flex items-start gap-3">
          <div
            className={`absolute -left-[19px] top-0.5 w-3.5 h-3.5 rounded-full border-2 ${
              isHandedOver
                ? "border-emerald-400 bg-emerald-400"
                : "border-white/20 bg-surface-container-low"
            }`}
          />
          <div>
            <span
              className={`font-semibold ${
                isHandedOver ? "text-emerald-400" : "text-on-surface-variant"
              }`}
            >
              Picked Up by Valet Partner
            </span>
            <p className="text-[10px] text-on-surface-variant">
              {isHandedOver ? `Confirmed at ${handedOverAt || "Now"}` : "Pending Handover"}
            </p>
          </div>
        </div>
      </div>
    </ProviderCard>
  );
}
