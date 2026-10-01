"use client";

import React from "react";
import { Sliders, Volume2, Vibrate, Map, Globe, Zap, Check } from "lucide-react";
import {
  DeliveryPartnerPreferences,
  NavigationAppPreference,
  LanguagePreference,
} from "@/types/delivery-partner";

interface AppPreferencesCardProps {
  preferences?: DeliveryPartnerPreferences;
  onUpdate: (payload: Partial<DeliveryPartnerPreferences>) => void;
  isUpdating: boolean;
}

export function AppPreferencesCard({
  preferences,
  onUpdate,
  isUpdating,
}: AppPreferencesCardProps) {
  const currentNav = preferences?.navigationApp || "GOOGLE_MAPS";
  const currentLang = preferences?.language || "en-IN";
  const isAudioEnabled = preferences?.audioChimeEnabled ?? true;
  const isVibrationEnabled = preferences?.vibrationFeedback ?? true;
  const isAutoAcceptEnabled = preferences?.autoAcceptPriorityOrders ?? false;

  return (
    <div className="p-6 rounded-3xl bg-surface-container/80 border border-outline-variant/25 space-y-5 shadow-sm">
      <div className="flex items-center gap-2 border-b border-outline-variant/15 pb-4">
        <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
          <Sliders className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-on-surface">Valet App & Navigation Preferences</h2>
          <p className="text-[11px] text-on-surface-variant">Configure navigation apps, audio pings, and operational alerts</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Navigation App */}
        <div className="p-4 rounded-2xl bg-surface border border-outline-variant/15 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
              <Map className="w-3.5 h-3.5 text-primary" /> Preferred Navigation Map
            </span>
            <span className="text-[10px] text-on-surface-variant">Default for turn-by-turn routing</span>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1">
            {(
              [
                { label: "Google Maps", value: "GOOGLE_MAPS" },
                { label: "Apple Maps", value: "APPLE_MAPS" },
                { label: "Waze", value: "WAZE" },
              ] as const
            ).map((item) => (
              <button
                key={item.value}
                onClick={() => onUpdate({ navigationApp: item.value })}
                disabled={isUpdating}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  currentNav === item.value
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-surface-container-high border-outline-variant/20 text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Language Selection */}
        <div className="p-4 rounded-2xl bg-surface border border-outline-variant/15 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-primary" /> Portal Display Language
            </span>
            <span className="text-[10px] text-on-surface-variant">Regional dialect</span>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1">
            {(
              [
                { label: "English (IN)", value: "en-IN" },
                { label: "Kannada (ಕನ್ನಡ)", value: "kn-IN" },
                { label: "Hindi (हिन्दी)", value: "hi-IN" },
              ] as const
            ).map((item) => (
              <button
                key={item.value}
                onClick={() => onUpdate({ language: item.value })}
                disabled={isUpdating}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold border truncate transition-all ${
                  currentLang === item.value
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-surface-container-high border-outline-variant/20 text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles List */}
        <div className="divide-y divide-outline-variant/15 bg-surface rounded-2xl border border-outline-variant/15">
          {/* Audio Chime */}
          <div className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-primary" /> Audio Dispatch Chime
              </div>
              <p className="text-[10px] text-on-surface-variant">
                Play audible ringtone when a new task is dispatched to your queue
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isAudioEnabled}
              onClick={() => onUpdate({ audioChimeEnabled: !isAudioEnabled })}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                isAudioEnabled ? "bg-primary" : "bg-surface-container-highest"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  isAudioEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Vibration Feedback */}
          <div className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <Vibrate className="w-3.5 h-3.5 text-primary" /> Haptic Vibration Feedback
              </div>
              <p className="text-[10px] text-on-surface-variant">
                Vibrate on security seal confirmation and OTP validation
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isVibrationEnabled}
              onClick={() => onUpdate({ vibrationFeedback: !isVibrationEnabled })}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                isVibrationEnabled ? "bg-primary" : "bg-surface-container-highest"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  isVibrationEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Auto Accept Priority */}
          <div className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Auto-Accept Urgent Tasks
              </div>
              <p className="text-[10px] text-on-surface-variant">
                Instantly accept high-incentive express delivery requests in your zone
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isAutoAcceptEnabled}
              onClick={() => onUpdate({ autoAcceptPriorityOrders: !isAutoAcceptEnabled })}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                isAutoAcceptEnabled ? "bg-primary" : "bg-surface-container-highest"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  isAutoAcceptEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
