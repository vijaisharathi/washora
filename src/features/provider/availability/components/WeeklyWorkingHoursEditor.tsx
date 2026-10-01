"use client";

import React, { useState } from "react";
import { DayAvailabilityConfig } from "@/types/provider/availability";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

interface WeeklyWorkingHoursEditorProps {
  initialSchedule: Record<string, DayAvailabilityConfig>;
  onSave: (schedule: Record<string, DayAvailabilityConfig>) => Promise<any>;
  isSaving: boolean;
}

export function WeeklyWorkingHoursEditor({
  initialSchedule,
  onSave,
  isSaving,
}: WeeklyWorkingHoursEditorProps) {
  const [schedule, setSchedule] = useState<Record<string, DayAvailabilityConfig>>(initialSchedule);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const daysOrder: (keyof typeof schedule)[] = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  const handleToggleDay = (dayKey: string) => {
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        isOpen: !prev[dayKey].isOpen,
      },
    }));
  };

  const handleTimeChange = (dayKey: string, field: "startTime" | "endTime", value: string) => {
    setSchedule((prev) => {
      const currentSlots = prev[dayKey].slots;
      const updatedSlots = currentSlots.map((s, idx) =>
        idx === 0 ? { ...s, [field]: value } : s
      );
      return {
        ...prev,
        [dayKey]: {
          ...prev[dayKey],
          slots: updatedSlots,
        },
      };
    });
  };

  const handleCopyMondayToAll = () => {
    const mondayConfig = schedule.monday;
    if (!mondayConfig) return;

    setSchedule((prev) => {
      const next = { ...prev };
      daysOrder.forEach((d) => {
        if (d !== "sunday") {
          next[d] = {
            ...next[d],
            isOpen: mondayConfig.isOpen,
            slots: JSON.parse(JSON.stringify(mondayConfig.slots)),
          };
        }
      });
      return next;
    });
  };

  const handleSaveClick = async () => {
    await onSave(schedule);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <ProviderCard variant="container" className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h3 className="text-lg font-bold text-on-surface">Weekly Operational Working Hours</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Configure open days and intake collection hours across the week.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopyMondayToAll}
          className="text-primary hover:underline text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[16px]">content_copy</span>
          <span>Apply Monday to Mon–Sat</span>
        </button>
      </div>

      {/* 7-Day Rows */}
      <div className="space-y-3">
        {daysOrder.map((dayKey) => {
          const day = schedule[dayKey];
          if (!day) return null;
          const slot = day.slots[0] || { startTime: "09:00", endTime: "18:00" };

          return (
            <div
              key={dayKey}
              className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                day.isOpen
                  ? "bg-surface-container-low border-white/5"
                  : "bg-surface-container-low/40 border-transparent opacity-60"
              }`}
            >
              {/* Day Name & Open Toggle */}
              <div className="flex items-center gap-3 w-36">
                <button
                  type="button"
                  onClick={() => handleToggleDay(dayKey)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors relative ${
                    day.isOpen ? "bg-primary-container" : "bg-zinc-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      day.isOpen ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
                <span className="text-sm font-bold text-on-surface">{day.dayName}</span>
              </div>

              {/* Working Hours or Closed Status */}
              {day.isOpen ? (
                <div className="flex items-center gap-2 text-xs">
                  <input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => handleTimeChange(dayKey, "startTime", e.target.value)}
                    className="bg-surface-container text-on-surface rounded-lg px-2.5 py-1.5 border border-white/10 outline-none focus:border-primary text-xs"
                  />
                  <span className="text-on-surface-variant font-medium">to</span>
                  <input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => handleTimeChange(dayKey, "endTime", e.target.value)}
                    className="bg-surface-container text-on-surface rounded-lg px-2.5 py-1.5 border border-white/10 outline-none focus:border-primary text-xs"
                  />
                </div>
              ) : (
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Studio Closed
                </span>
              )}

              {/* Status Pill */}
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border self-end sm:self-auto ${
                  day.isOpen
                    ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/30"
                    : "bg-zinc-900 text-zinc-500 border-zinc-800"
                }`}
              >
                {day.isOpen ? "Open" : "Closed"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div>
          {saveSuccess && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>Working hours successfully updated!</span>
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleSaveClick}
          disabled={isSaving}
          className="px-6 py-2 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary font-bold text-xs transition-all shadow-md shadow-primary/20 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[16px]">save</span>
          <span>{isSaving ? "Saving Hours..." : "Save Working Hours"}</span>
        </button>
      </div>
    </ProviderCard>
  );
}
