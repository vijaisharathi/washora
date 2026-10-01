"use client";

import React, { useState } from "react";
import { ProviderNotificationPreferences } from "@/types/provider/notifications";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

interface NotificationPreferencesSectionProps {
  preferences?: ProviderNotificationPreferences;
  onSavePreferences: (prefs: Partial<ProviderNotificationPreferences>) => Promise<void>;
  isSaving: boolean;
}

export function NotificationPreferencesSection({
  preferences,
  onSavePreferences,
  isSaving,
}: NotificationPreferencesSectionProps) {
  const [formState, setFormState] = useState<ProviderNotificationPreferences>(
    preferences || {
      bookingsPush: true,
      bookingsEmail: true,
      bookingsSms: false,
      cancellationsPush: true,
      cancellationsEmail: true,
      cancellationsSms: false,
      orderStatusUpdates: true,
      pickupReminders: true,
      deliveryNotifications: true,
      payoutAlerts: true,
      reviewAlerts: true,
    }
  );

  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleToggle = (key: keyof ProviderNotificationPreferences) => {
    setFormState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSavePreferences(formState);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Bookings & Scheduling Alerts */}
      <ProviderCard variant="container" className="p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/5 pb-3">
          <span className="material-symbols-outlined text-primary">calendar_today</span>
          <h3 className="text-base font-bold text-on-surface">Bookings &amp; Intake Alerts</h3>
        </div>

        <div className="space-y-4 text-xs">
          {/* New Bookings */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-1">
            <div>
              <h4 className="font-bold text-on-surface">New Booking Assignments</h4>
              <p className="text-on-surface-variant mt-0.5">
                Instant alerts when a garment intake or valet order is assigned.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formState.bookingsPush}
                  onChange={() => handleToggle("bookingsPush")}
                  className="rounded border-zinc-700 text-primary focus:ring-primary bg-zinc-800"
                />
                <span className="text-on-surface-variant">Push</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formState.bookingsEmail}
                  onChange={() => handleToggle("bookingsEmail")}
                  className="rounded border-zinc-700 text-primary focus:ring-primary bg-zinc-800"
                />
                <span className="text-on-surface-variant">Email</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formState.bookingsSms}
                  onChange={() => handleToggle("bookingsSms")}
                  className="rounded border-zinc-700 text-primary focus:ring-primary bg-zinc-800"
                />
                <span className="text-on-surface-variant">SMS</span>
              </label>
            </div>
          </div>

          {/* Cancellations */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/5">
            <div>
              <h4 className="font-bold text-on-surface">Cancellations &amp; Rescheduling</h4>
              <p className="text-on-surface-variant mt-0.5">
                Notifications when a customer cancels or reschedules intake slots.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formState.cancellationsPush}
                  onChange={() => handleToggle("cancellationsPush")}
                  className="rounded border-zinc-700 text-primary focus:ring-primary bg-zinc-800"
                />
                <span className="text-on-surface-variant">Push</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formState.cancellationsEmail}
                  onChange={() => handleToggle("cancellationsEmail")}
                  className="rounded border-zinc-700 text-primary focus:ring-primary bg-zinc-800"
                />
                <span className="text-on-surface-variant">Email</span>
              </label>
            </div>
          </div>
        </div>
      </ProviderCard>

      {/* Orders & Operational Logistics */}
      <ProviderCard variant="container" className="p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/5 pb-3">
          <span className="material-symbols-outlined text-primary">local_shipping</span>
          <h3 className="text-base font-bold text-on-surface">Orders &amp; Courier Logistics</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <label className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-white/5 cursor-pointer">
            <div>
              <h4 className="font-bold text-on-surface">Order Status Updates</h4>
              <p className="text-on-surface-variant mt-0.5">Stage transitions &amp; SOP completion alerts.</p>
            </div>
            <input
              type="checkbox"
              checked={formState.orderStatusUpdates}
              onChange={() => handleToggle("orderStatusUpdates")}
              className="rounded border-zinc-700 text-primary focus:ring-primary bg-zinc-800"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-white/5 cursor-pointer">
            <div>
              <h4 className="font-bold text-on-surface">Courier Pickup Reminders</h4>
              <p className="text-on-surface-variant mt-0.5">Driver arrival and handoff countdowns.</p>
            </div>
            <input
              type="checkbox"
              checked={formState.pickupReminders}
              onChange={() => handleToggle("pickupReminders")}
              className="rounded border-zinc-700 text-primary focus:ring-primary bg-zinc-800"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-white/5 cursor-pointer">
            <div>
              <h4 className="font-bold text-on-surface">Weekly Settlement &amp; Payouts</h4>
              <p className="text-on-surface-variant mt-0.5">Automated Monday bank transfer updates.</p>
            </div>
            <input
              type="checkbox"
              checked={formState.payoutAlerts}
              onChange={() => handleToggle("payoutAlerts")}
              className="rounded border-zinc-700 text-primary focus:ring-primary bg-zinc-800"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-white/5 cursor-pointer">
            <div>
              <h4 className="font-bold text-on-surface">Customer Review Alerts</h4>
              <p className="text-on-surface-variant mt-0.5">Notifications when client feedback is posted.</p>
            </div>
            <input
              type="checkbox"
              checked={formState.reviewAlerts}
              onChange={() => handleToggle("reviewAlerts")}
              className="rounded border-zinc-700 text-primary focus:ring-primary bg-zinc-800"
            />
          </label>
        </div>
      </ProviderCard>

      {/* Save Button */}
      <div className="flex items-center justify-between pt-2">
        {savedFeedback ? (
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>Preferences saved successfully!</span>
          </span>
        ) : (
          <span />
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2.5 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary font-bold text-xs transition-all shadow-md shadow-primary/20 flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">save</span>
          <span>{isSaving ? "Saving..." : "Save Preferences"}</span>
        </button>
      </div>
    </form>
  );
}
