"use client";

import React, { useState } from "react";
import { BlackoutDateItem } from "@/types/provider/availability";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

interface BlackoutDatesManagerProps {
  blackoutDates: BlackoutDateItem[];
  onAdd: (payload: { date: string; reason: string }) => Promise<any>;
  onRemove: (id: string) => Promise<any>;
  isAdding: boolean;
  isRemoving: boolean;
}

export function BlackoutDatesManager({
  blackoutDates,
  onAdd,
  onRemove,
  isAdding,
  isRemoving,
}: BlackoutDatesManagerProps) {
  const [newDate, setNewDate] = useState("");
  const [newReason, setNewReason] = useState("");

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newReason.trim()) return;
    await onAdd({ date: newDate, reason: newReason.trim() });
    setNewDate("");
    setNewReason("");
  };

  return (
    <ProviderCard variant="container" className="p-6 md:p-8 space-y-6">
      <div className="border-b border-white/5 pb-4">
        <h3 className="text-lg font-bold text-on-surface">Blackout Dates &amp; Studio Holidays</h3>
        <p className="text-xs text-on-surface-variant mt-0.5">
          Mark scheduled holidays, festival closures, or renovation periods as unavailable.
        </p>
      </div>

      {/* Add Form */}
      <form onSubmit={handleAddSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
        <div className="sm:col-span-4 flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-on-surface-variant">Closure Date</label>
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            required
            className="bg-surface-container-low text-on-surface text-xs rounded-xl px-3.5 py-2.5 border border-white/10 focus:border-primary outline-none"
          />
        </div>

        <div className="sm:col-span-6 flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-on-surface-variant">Reason for Closure</label>
          <input
            type="text"
            placeholder="e.g. Festival Holiday / Annual Machinery Maintenance"
            value={newReason}
            onChange={(e) => setNewReason(e.target.value)}
            required
            className="bg-surface-container-low text-on-surface text-xs rounded-xl px-3.5 py-2.5 border border-white/10 focus:border-primary outline-none"
          />
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={isAdding}
            className="w-full py-2.5 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary font-bold text-xs transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>{isAdding ? "Adding..." : "Add Date"}</span>
          </button>
        </div>
      </form>

      {/* Blackout Dates List */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
          Configured Blackout Dates ({blackoutDates.length})
        </h4>

        {blackoutDates.length === 0 ? (
          <p className="text-xs text-on-surface-variant italic py-2">
            No holiday blackout dates configured. Studio will operate per standard weekly schedule.
          </p>
        ) : (
          blackoutDates.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-surface-container-low border border-white/5 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-error-container/20 text-error flex items-center justify-center border border-error/30 shrink-0">
                  <span className="material-symbols-outlined text-[16px]">event_busy</span>
                </div>
                <div>
                  <span className="font-bold text-on-surface font-mono">{item.date}</span>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">{item.reason}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onRemove(item.id)}
                disabled={isRemoving}
                className="p-1.5 rounded-lg text-error hover:bg-error-container/30 transition-colors"
                title="Remove Blackout Date"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          ))
        )}
      </div>
    </ProviderCard>
  );
}
