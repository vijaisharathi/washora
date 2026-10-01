"use client";

import React, { useState } from "react";
import { ProviderOperatingHoursConfig } from "@/types/provider/profile";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

interface OperatingHoursSectionProps {
  initialData?: ProviderOperatingHoursConfig;
  onSave: (data: Partial<ProviderOperatingHoursConfig>) => Promise<any>;
  isSaving: boolean;
}

export function OperatingHoursSection({
  initialData,
  onSave,
  isSaving,
}: OperatingHoursSectionProps) {
  const [successMsg, setSuccessMsg] = useState(false);
  const [slaHours, setSlaHours] = useState(initialData?.turnaroundSlaHours || 24);
  const [emergencyRush, setEmergencyRush] = useState(initialData?.acceptingEmergencyRush ?? true);
  const [schedule, setSchedule] = useState(
    initialData?.schedule || [
      { day: "Monday", isOpen: true, openTime: "08:00 AM", closeTime: "08:00 PM" },
      { day: "Tuesday", isOpen: true, openTime: "08:00 AM", closeTime: "08:00 PM" },
      { day: "Wednesday", isOpen: true, openTime: "08:00 AM", closeTime: "08:00 PM" },
      { day: "Thursday", isOpen: true, openTime: "08:00 AM", closeTime: "08:00 PM" },
      { day: "Friday", isOpen: true, openTime: "08:00 AM", closeTime: "08:00 PM" },
      { day: "Saturday", isOpen: true, openTime: "09:00 AM", closeTime: "09:00 PM" },
      { day: "Sunday", isOpen: false, openTime: "10:00 AM", closeTime: "04:00 PM" },
    ]
  );

  const toggleDay = (index: number) => {
    const updated = [...schedule];
    updated[index].isOpen = !updated[index].isOpen;
    setSchedule(updated as any);
  };

  const handleSave = async () => {
    await onSave({
      turnaroundSlaHours: slaHours,
      acceptingEmergencyRush: emergencyRush,
      schedule: schedule as any,
    });
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <ProviderCard variant="container" className="p-6">
      <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-4">
        <div>
          <h3 className="text-base font-bold text-on-surface">Operating Shifts & Turnaround SLA</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Define workshop processing windows, weekly off-days, and guaranteed delivery commitments.
          </p>
        </div>
        {successMsg && (
          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            Saved
          </span>
        )}
      </div>

      <div className="space-y-5">
        {/* SLA and Rush Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2 border-b border-white/5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">Default Turnaround Commitment</label>
            <select
              value={slaHours}
              onChange={(e) => setSlaHours(parseInt(e.target.value, 10))}
              className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-2.5 border border-transparent focus:border-primary outline-none"
            >
              <option value={12}>12 Hours (Same-Day Express Care)</option>
              <option value={24}>24 Hours (Next-Day Standard)</option>
              <option value={48}>48 Hours (Deep Restoration Spa)</option>
              <option value={72}>72 Hours (Couture Preservation)</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low">
            <div>
              <span className="text-xs font-semibold text-on-surface block">Express Rush Processing</span>
              <span className="text-[11px] text-on-surface-variant">Accept surcharge rush valet bookings</span>
            </div>
            <input
              type="checkbox"
              checked={emergencyRush}
              onChange={(e) => setEmergencyRush(e.target.checked)}
              className="w-4 h-4 rounded border-outline-variant/40 bg-surface-container text-primary focus:ring-primary cursor-pointer"
            />
          </div>
        </div>

        {/* Weekly Shifts Schedule */}
        <div className="space-y-2.5">
          <span className="text-xs font-semibold text-on-surface-variant block">Weekly Workshop Schedule</span>
          {schedule.map((item, idx) => (
            <div
              key={item.day}
              className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low text-xs"
            >
              <div className="flex items-center gap-3 w-32">
                <button
                  type="button"
                  onClick={() => toggleDay(idx)}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    item.isOpen
                      ? "bg-primary-container text-on-primary-container border-primary"
                      : "bg-surface-variant border-white/10"
                  }`}
                >
                  {item.isOpen && <span className="material-symbols-outlined text-[12px]">check</span>}
                </button>
                <span className={`font-semibold ${item.isOpen ? "text-on-surface" : "text-on-surface-variant/50"}`}>
                  {item.day}
                </span>
              </div>

              {item.isOpen ? (
                <div className="flex items-center gap-2 text-on-surface">
                  <span className="bg-surface-variant px-2 py-1 rounded">{item.openTime}</span>
                  <span className="text-on-surface-variant">to</span>
                  <span className="bg-surface-variant px-2 py-1 rounded">{item.closeTime}</span>
                </div>
              ) : (
                <span className="text-zinc-500 font-medium">Closed / Off Day</span>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary font-semibold text-xs transition-all shadow-md shadow-primary/20 flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSaving ? (
              <span>Saving...</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>Save Operating Hours</span>
              </>
            )}
          </button>
        </div>
      </div>
    </ProviderCard>
  );
}
