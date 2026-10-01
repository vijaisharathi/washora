"use client";

import React from "react";
import { ProviderAvailabilityData } from "@/types/provider/availability";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

interface AvailabilityOverviewCardsProps {
  availability: ProviderAvailabilityData;
  onToggleActive: () => Promise<any>;
  isToggling: boolean;
}

export function AvailabilityOverviewCards({
  availability,
  onToggleActive,
  isToggling,
}: AvailabilityOverviewCardsProps) {
  const isActive = availability.isOverallActive;

  // Count active open days
  const openDays = Object.values(availability.weeklySchedule).filter((d) => d.isOpen);
  const openDaysLabel =
    openDays.length === 7
      ? "7 Days / Week"
      : openDays.length === 6
      ? "Mon – Sat"
      : openDays.length === 5
      ? "Mon – Fri"
      : `${openDays.length} Days Open`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Active / Paused Status Card */}
      <ProviderCard
        variant="container"
        className={`lg:col-span-4 p-6 flex flex-col justify-between border-l-4 ${
          isActive ? "border-l-emerald-400" : "border-l-amber-400"
        }`}
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`material-symbols-outlined text-xl ${
                isActive ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {isActive ? "check_circle" : "pause_circle"}
            </span>
            <h3 className="text-base font-bold text-on-surface">
              Availability: {isActive ? "Active" : "Paused"}
            </h3>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
            {isActive
              ? "Your studio is online and accepting valet collection orders within configured slots."
              : "Studio bookings are temporarily paused. Existing orders in processing remain active."}
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleActive}
          disabled={isToggling}
          className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
            isActive
              ? "border-white/10 bg-surface-container hover:bg-surface-variant text-on-surface"
              : "bg-primary text-on-primary hover:opacity-90 border-transparent shadow-md shadow-primary/20"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">
            {isActive ? "pause_circle" : "play_circle"}
          </span>
          <span>{isActive ? "Pause Availability" : "Resume Availability"}</span>
        </button>
      </ProviderCard>

      {/* 4-Cell Bento Metric Summary */}
      <div className="lg:col-span-8 grid grid-cols-2 gap-4">
        {/* Working Days */}
        <ProviderCard variant="container" className="p-4 flex flex-col justify-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
            Working Schedule
          </span>
          <div className="flex items-center gap-2 text-on-surface">
            <span className="material-symbols-outlined text-primary text-lg">event</span>
            <span className="text-base font-bold">{openDaysLabel}</span>
          </div>
        </ProviderCard>

        {/* Daily Capacity */}
        <ProviderCard variant="container" className="p-4 flex flex-col justify-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
            Daily Capacity
          </span>
          <div className="flex items-center gap-2 text-on-surface">
            <span className="material-symbols-outlined text-primary text-lg">local_shipping</span>
            <span className="text-base font-bold">{availability.capacity.maxDailyOrders} Orders / Day</span>
          </div>
        </ProviderCard>

        {/* Pickup Window */}
        <ProviderCard variant="container" className="p-4 flex flex-col justify-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
            Valet Pickup Window
          </span>
          <div className="flex items-center gap-2 text-on-surface">
            <span className="material-symbols-outlined text-primary text-lg">storefront</span>
            <span className="text-base font-bold">
              {availability.capacity.pickupWindowStart} – {availability.capacity.pickupWindowEnd}
            </span>
          </div>
        </ProviderCard>

        {/* Delivery Window */}
        <ProviderCard variant="container" className="p-4 flex flex-col justify-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
            Valet Drop-off Window
          </span>
          <div className="flex items-center gap-2 text-on-surface">
            <span className="material-symbols-outlined text-primary text-lg">home_work</span>
            <span className="text-base font-bold">
              {availability.capacity.deliveryWindowStart} – {availability.capacity.deliveryWindowEnd}
            </span>
          </div>
        </ProviderCard>
      </div>
    </div>
  );
}
