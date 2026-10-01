"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Globe, Clock, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { SettingsHeader } from "../SettingsHeader";
import { SettingsNavigationTabs } from "../SettingsNavigationTabs";
import { useAdminPreferences } from "@/features/admin/hooks/useAdminSettings";
import {
  PreferencesSettingsSchema,
  PreferencesSettingsFormData,
} from "@/types/admin";
import { SettingsFormSkeleton } from "../skeletons/SettingsSkeleton";

export function PreferencesSettingsView() {
  const {
    preferences,
    loading,
    saving,
    error,
    successMessage,
    updatePreferences,
    refresh,
    setSuccessMessage,
  } = useAdminPreferences();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PreferencesSettingsFormData>({
    resolver: zodResolver(PreferencesSettingsSchema),
  });

  useEffect(() => {
    if (preferences) {
      reset({
        preferredLanguage: preferences.preferredLanguage,
        timezone: preferences.timezone,
        dateFormat: preferences.dateFormat,
        timeFormat: preferences.timeFormat,
      });
    }
  }, [preferences, reset]);

  if (loading) {
    return (
      <div className="space-y-6">
        <SettingsHeader
          title="Display & Localization Preferences"
          subtitle="Configure regional formatting, interface language, timezone, and calendar representations."
          breadcrumbs={[
            { label: "Settings", href: "/admin/settings" },
            { label: "Preferences" },
          ]}
        />
        <SettingsNavigationTabs />
        <SettingsFormSkeleton />
      </div>
    );
  }

  const onSubmit = async (data: PreferencesSettingsFormData) => {
    try {
      await updatePreferences(data);
    } catch {
      // handled in hook
    }
  };

  const handleCancel = () => {
    if (preferences) {
      reset({
        preferredLanguage: preferences.preferredLanguage,
        timezone: preferences.timezone,
        dateFormat: preferences.dateFormat,
        timeFormat: preferences.timeFormat,
      });
      setSuccessMessage(null);
    }
  };

  return (
    <div className="space-y-6">
      <SettingsHeader
        title="Display & Localization Preferences"
        subtitle="Configure regional formatting, interface language, timezone, and calendar representations."
        breadcrumbs={[
          { label: "Settings", href: "/admin/settings" },
          { label: "Preferences" },
        ]}
      />

      <SettingsNavigationTabs />

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-xs text-emerald-600 dark:text-emerald-400 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-error/10 border border-error/20 flex items-center gap-2.5 text-xs text-error animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
        <div className="p-6 sm:p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-6">
          <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            <span>Localization Settings</span>
          </h3>

          <div className="space-y-4">
            {/* Language */}
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">
                Interface Language
              </label>
              <select
                {...register("preferredLanguage")}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="English">English (Default)</option>
                <option value="Tamil">Tamil (தமிழ்)</option>
              </select>
              <p className="text-[11px] text-on-surface-variant mt-1">
                Controls labels, notifications, and operations dashboard formatting.
              </p>
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">
                Platform Timezone
              </label>
              <input
                type="text"
                value="Asia/Kolkata (Indian Standard Time, UTC+05:30)"
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container/50 border border-outline-variant/30 text-xs text-on-surface-variant font-mono cursor-not-allowed"
              />
              <p className="text-[11px] text-on-surface-variant mt-1">
                All order dispatch windows and batch schedules are calculated in IST.
              </p>
            </div>

            {/* Date Format */}
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">
                Date Format
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-container border border-outline-variant/30 cursor-pointer hover:bg-surface-container-high transition-colors">
                  <input
                    type="radio"
                    value="DD/MM/YYYY"
                    {...register("dateFormat")}
                    className="text-primary focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-semibold text-on-surface block">
                      DD/MM/YYYY
                    </span>
                    <span className="text-[11px] text-on-surface-variant font-mono">
                      e.g. 10/09/2026
                    </span>
                  </div>
                </label>
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-container border border-outline-variant/30 cursor-pointer hover:bg-surface-container-high transition-colors">
                  <input
                    type="radio"
                    value="MM/DD/YYYY"
                    {...register("dateFormat")}
                    className="text-primary focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-semibold text-on-surface block">
                      MM/DD/YYYY
                    </span>
                    <span className="text-[11px] text-on-surface-variant font-mono">
                      e.g. 09/10/2026
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Time Format */}
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">
                Time Representation
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-container border border-outline-variant/30 cursor-pointer hover:bg-surface-container-high transition-colors">
                  <input
                    type="radio"
                    value="12-hour"
                    {...register("timeFormat")}
                    className="text-primary focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-semibold text-on-surface block">
                      12-Hour (AM/PM)
                    </span>
                    <span className="text-[11px] text-on-surface-variant font-mono">
                      e.g. 04:45 PM
                    </span>
                  </div>
                </label>
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-container border border-outline-variant/30 cursor-pointer hover:bg-surface-container-high transition-colors">
                  <input
                    type="radio"
                    value="24-hour"
                    {...register("timeFormat")}
                    className="text-primary focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-semibold text-on-surface block">
                      24-Hour Military
                    </span>
                    <span className="text-[11px] text-on-surface-variant font-mono">
                      e.g. 16:45
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              {saving && (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              <span>Save Preferences</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
