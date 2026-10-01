"use client";

import React, { useState } from "react";
import { useProviderAvailability } from "@/features/provider/availability/hooks/useProviderAvailability";
import { ProviderLoadingState } from "@/features/provider/components/ProviderLoadingState";
import { ProviderErrorState } from "@/features/provider/components/ProviderErrorState";
import { AvailabilityOverviewCards } from "./AvailabilityOverviewCards";
import { WeeklyWorkingHoursEditor } from "./WeeklyWorkingHoursEditor";
import { BlackoutDatesManager } from "./BlackoutDatesManager";
import { CapacityConfigSection } from "./CapacityConfigSection";

export function ProviderAvailabilityView() {
  const {
    availability,
    isLoading,
    isError,
    refetch,
    toggleActive,
    isTogglingActive,
    updateWorkingHours,
    isUpdatingHours,
    updateCapacity,
    isUpdatingCapacity,
    addBlackoutDate,
    isAddingBlackout,
    removeBlackoutDate,
    isRemovingBlackout,
  } = useProviderAvailability();

  const [activeTab, setActiveTab] = useState<"hours" | "capacity" | "blackouts">("hours");

  if (isLoading) {
    return <ProviderLoadingState message="Loading Studio Availability &amp; Scheduling..." />;
  }

  if (isError || !availability) {
    return <ProviderErrorState title="Failed to load availability settings" onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      {/* Master Overview & Status Cards */}
      <AvailabilityOverviewCards
        availability={availability}
        onToggleActive={toggleActive}
        isToggling={isTogglingActive}
      />

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("hours")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === "hours"
              ? "bg-primary text-on-primary shadow-sm shadow-primary/20"
              : "bg-surface-container hover:bg-surface-variant text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">schedule</span>
          <span>Weekly Working Hours</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("capacity")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === "capacity"
              ? "bg-primary text-on-primary shadow-sm shadow-primary/20"
              : "bg-surface-container hover:bg-surface-variant text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">local_shipping</span>
          <span>Capacity &amp; Logistics Windows</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("blackouts")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === "blackouts"
              ? "bg-primary text-on-primary shadow-sm shadow-primary/20"
              : "bg-surface-container hover:bg-surface-variant text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">event_busy</span>
          <span>Blackout Dates &amp; Holidays ({availability.blackoutDates.length})</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "hours" && (
        <WeeklyWorkingHoursEditor
          initialSchedule={availability.weeklySchedule}
          onSave={(sched) => updateWorkingHours({ weeklySchedule: sched })}
          isSaving={isUpdatingHours}
        />
      )}

      {activeTab === "capacity" && (
        <CapacityConfigSection
          initialCapacity={availability.capacity}
          onSave={(cap) => updateCapacity({ capacity: cap })}
          isSaving={isUpdatingCapacity}
        />
      )}

      {activeTab === "blackouts" && (
        <BlackoutDatesManager
          blackoutDates={availability.blackoutDates}
          onAdd={addBlackoutDate}
          onRemove={removeBlackoutDate}
          isAdding={isAddingBlackout}
          isRemoving={isRemovingBlackout}
        />
      )}
    </div>
  );
}
