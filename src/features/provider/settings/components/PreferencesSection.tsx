"use client";

import React from "react";
import { ProviderAccountPreferences } from "@/types/provider/settings";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

interface PreferencesSectionProps {
  preferences: ProviderAccountPreferences;
  onUpdate: (payload: Partial<ProviderAccountPreferences>) => Promise<unknown>;
  isUpdating: boolean;
}

export function PreferencesSection({
  preferences,
  onUpdate,
  isUpdating,
}: PreferencesSectionProps) {
  return (
    <ProviderCard variant="container" className="p-6 space-y-6">
      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
        <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
        <div>
          <h3 className="text-sm font-bold text-on-surface">Studio Regional &amp; Automation Preferences</h3>
          <p className="text-xs text-on-surface-variant">
            Configure system language, currency standards, and auto-dispatch rules.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="flex flex-col gap-1">
          <label className="font-semibold text-on-surface-variant">Default Language</label>
          <select
            value={preferences.language}
            onChange={(e) => onUpdate({ language: e.target.value })}
            disabled={isUpdating}
            className="w-full bg-surface-container-low text-on-surface text-xs rounded-xl px-3.5 py-2.5 border border-white/10 focus:border-primary outline-none"
          >
            <option value="English (India)">English (India)</option>
            <option value="Hindi">Hindi (हिन्दी)</option>
            <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-semibold text-on-surface-variant">Timezone</label>
          <select
            value={preferences.timezone}
            onChange={(e) => onUpdate({ timezone: e.target.value })}
            disabled={isUpdating}
            className="w-full bg-surface-container-low text-on-surface text-xs rounded-xl px-3.5 py-2.5 border border-white/10 focus:border-primary outline-none"
          >
            <option value="Asia/Kolkata (IST - UTC+5:30)">Asia/Kolkata (IST - UTC+5:30)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-semibold text-on-surface-variant">Operating Currency</label>
          <select
            value={preferences.currency}
            onChange={(e) => onUpdate({ currency: e.target.value })}
            disabled={isUpdating}
            className="w-full bg-surface-container-low text-on-surface text-xs rounded-xl px-3.5 py-2.5 border border-white/10 focus:border-primary outline-none"
          >
            <option value="INR (₹)">INR (₹)</option>
          </select>
        </div>
      </div>

      {/* Auto-accept toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-white/5">
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-on-surface">Auto-Accept Valet Direct Bookings</h4>
          <p className="text-[11px] text-on-surface-variant">
            Automatically confirm customer bookings when our studio is within daily capacity caps.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onUpdate({ autoAcceptBookings: !preferences.autoAcceptBookings })}
          disabled={isUpdating}
          className={`w-11 h-6 rounded-full transition-colors relative ${
            preferences.autoAcceptBookings ? "bg-primary" : "bg-surface-container-highest"
          }`}
        >
          <span
            className={`w-4 h-4 rounded-full bg-on-primary transition-transform absolute top-1 left-1 ${
              preferences.autoAcceptBookings ? "translate-x-5" : ""
            }`}
          />
        </button>
      </div>
    </ProviderCard>
  );
}
