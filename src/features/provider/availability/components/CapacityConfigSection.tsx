"use client";

import React, { useState } from "react";
import { ProviderCapacityConfig } from "@/types/provider/availability";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

interface CapacityConfigSectionProps {
  initialCapacity: ProviderCapacityConfig;
  onSave: (capacity: ProviderCapacityConfig) => Promise<any>;
  isSaving: boolean;
}

export function CapacityConfigSection({
  initialCapacity,
  onSave,
  isSaving,
}: CapacityConfigSectionProps) {
  const [capacity, setCapacity] = useState<ProviderCapacityConfig>(initialCapacity);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(capacity);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <ProviderCard variant="container" className="p-6 md:p-8 space-y-6">
      <div className="border-b border-white/5 pb-4">
        <h3 className="text-lg font-bold text-on-surface">Studio Capacity &amp; Logistics Windows</h3>
        <p className="text-xs text-on-surface-variant mt-0.5">
          Throttle daily order volumes and configure pickup/drop-off logistics windows.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Max Daily Orders */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">
              Max Daily Orders (Capacity Cap)
            </label>
            <input
              type="number"
              min={1}
              max={200}
              value={capacity.maxDailyOrders}
              onChange={(e) =>
                setCapacity((prev) => ({ ...prev, maxDailyOrders: parseInt(e.target.value) || 20 }))
              }
              className="bg-surface-container-low text-on-surface text-xs rounded-xl px-3.5 py-2.5 border border-white/10 focus:border-primary outline-none"
            />
          </div>

          {/* Max Concurrent Jobs */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">
              Max In-Workshop Concurrent Care Jobs
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={capacity.maxConcurrentJobs}
              onChange={(e) =>
                setCapacity((prev) => ({
                  ...prev,
                  maxConcurrentJobs: parseInt(e.target.value) || 10,
                }))
              }
              className="bg-surface-container-low text-on-surface text-xs rounded-xl px-3.5 py-2.5 border border-white/10 focus:border-primary outline-none"
            />
          </div>
        </div>

        {/* Logistics Windows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Pickup Window */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-white/5 space-y-2">
            <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[16px]">storefront</span>
              <span>Valet Pickup Window</span>
            </span>
            <div className="flex items-center gap-2 text-xs">
              <input
                type="time"
                value={capacity.pickupWindowStart}
                onChange={(e) =>
                  setCapacity((prev) => ({ ...prev, pickupWindowStart: e.target.value }))
                }
                className="bg-surface-container text-on-surface rounded-lg px-2.5 py-1.5 border border-white/10 outline-none text-xs"
              />
              <span className="text-on-surface-variant font-medium">to</span>
              <input
                type="time"
                value={capacity.pickupWindowEnd}
                onChange={(e) =>
                  setCapacity((prev) => ({ ...prev, pickupWindowEnd: e.target.value }))
                }
                className="bg-surface-container text-on-surface rounded-lg px-2.5 py-1.5 border border-white/10 outline-none text-xs"
              />
            </div>
          </div>

          {/* Delivery Window */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-white/5 space-y-2">
            <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[16px]">home_work</span>
              <span>Valet Drop-off Window</span>
            </span>
            <div className="flex items-center gap-2 text-xs">
              <input
                type="time"
                value={capacity.deliveryWindowStart}
                onChange={(e) =>
                  setCapacity((prev) => ({ ...prev, deliveryWindowStart: e.target.value }))
                }
                className="bg-surface-container text-on-surface rounded-lg px-2.5 py-1.5 border border-white/10 outline-none text-xs"
              />
              <span className="text-on-surface-variant font-medium">to</span>
              <input
                type="time"
                value={capacity.deliveryWindowEnd}
                onChange={(e) =>
                  setCapacity((prev) => ({ ...prev, deliveryWindowEnd: e.target.value }))
                }
                className="bg-surface-container text-on-surface rounded-lg px-2.5 py-1.5 border border-white/10 outline-none text-xs"
              />
            </div>
          </div>
        </div>

        {/* Express Rush Surcharge Toggle */}
        <div className="p-4 rounded-xl bg-surface-container-low border border-white/5 flex items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-on-surface">Accept Express Rush Bookings</h4>
            <p className="text-[11px] text-on-surface-variant mt-0.5">
              Allow customers to book high-priority 12-hour same-day expedited care.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setCapacity((prev) => ({ ...prev, expressRushEnabled: !prev.expressRushEnabled }))
            }
            className={`w-10 h-6 rounded-full p-0.5 transition-colors relative ${
              capacity.expressRushEnabled ? "bg-primary-container" : "bg-zinc-700"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                capacity.expressRushEnabled ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Save */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div>
            {saveSuccess && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Capacity settings saved!</span>
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary font-bold text-xs transition-all shadow-md shadow-primary/20 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            <span>{isSaving ? "Saving..." : "Save Capacity Limits"}</span>
          </button>
        </div>
      </form>
    </ProviderCard>
  );
}
