"use client";

import React, { useState } from "react";
import { NotificationPreferencesData } from "@/types/customer/notifications";
import {
  Calendar,
  Truck,
  CreditCard,
  ShieldAlert,
  Save,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationPreferencesFormProps {
  initialPreferences: NotificationPreferencesData;
  onSave: (prefs: NotificationPreferencesData) => Promise<void>;
  isSaving: boolean;
}

export function NotificationPreferencesForm({
  initialPreferences,
  onSave,
  isSaving,
}: NotificationPreferencesFormProps) {
  const [prefs, setPrefs] = useState<NotificationPreferencesData>(initialPreferences);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  const toggle = (key: keyof NotificationPreferencesData) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(prefs);
    setIsSavedSuccess(true);
    setTimeout(() => {
      setIsSavedSuccess(false);
    }, 2500);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Bookings Section matching Stitch anything_clean_notification_preferences */}
      <section className="bg-surface-container border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="font-bold text-base text-on-surface font-headline">
            Bookings &amp; Pickups
          </h2>
        </div>

        <div className="space-y-4 text-xs">
          {/* Valet Pickup Alerts */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2 border-b border-white/5">
            <div>
              <h3 className="font-bold text-on-surface">Valet Pickup Alerts</h3>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                Notifications when valet is arriving at your address.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefs.bookingsPush}
                  onChange={() => toggle("bookingsPush")}
                  className="rounded border-white/20 bg-surface-container-low text-primary focus:ring-primary"
                />
                <span className="text-[11px] text-on-surface-variant font-medium">Push</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefs.bookingsEmail}
                  onChange={() => toggle("bookingsEmail")}
                  className="rounded border-white/20 bg-surface-container-low text-primary focus:ring-primary"
                />
                <span className="text-[11px] text-on-surface-variant font-medium">Email</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefs.bookingsSms}
                  onChange={() => toggle("bookingsSms")}
                  className="rounded border-white/20 bg-surface-container-low text-primary focus:ring-primary"
                />
                <span className="text-[11px] text-on-surface-variant font-medium">SMS</span>
              </label>
            </div>
          </div>

          {/* Schedule Reminders */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2">
            <div>
              <h3 className="font-bold text-on-surface">Schedule Changes &amp; Rescheduling</h3>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                Alerts when pickup or delivery windows are updated.
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.orderPickupPush}
                onChange={() => toggle("orderPickupPush")}
                className="rounded border-white/20 bg-surface-container-low text-primary focus:ring-primary"
              />
              <span className="text-xs font-semibold text-primary">Enabled</span>
            </label>
          </div>
        </div>
      </section>

      {/* Orders & Garment Status Section */}
      <section className="bg-surface-container border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
          <Truck className="h-5 w-5 text-primary" />
          <h2 className="font-bold text-base text-on-surface font-headline">
            Garment Care Status
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-surface-container-low rounded-xl border border-white/5 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-on-surface">Inspection &amp; Treatment</h3>
              <p className="text-[10px] text-on-surface-variant">When care studio tags items</p>
            </div>
            <input
              type="checkbox"
              checked={prefs.orderStatusPush}
              onChange={() => toggle("orderStatusPush")}
              className="rounded border-white/20 bg-surface-container text-primary focus:ring-primary"
            />
          </div>

          <div className="p-3.5 bg-surface-container-low rounded-xl border border-white/5 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-on-surface">Doorstep Delivery ETA</h3>
              <p className="text-[10px] text-on-surface-variant">Live tracking dispatch alerts</p>
            </div>
            <input
              type="checkbox"
              checked={prefs.orderDeliveryPush}
              onChange={() => toggle("orderDeliveryPush")}
              className="rounded border-white/20 bg-surface-container text-primary focus:ring-primary"
            />
          </div>
        </div>
      </section>

      {/* Payments & Security Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-surface-container border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
            <CreditCard className="h-5 w-5 text-primary" />
            <h2 className="font-bold text-base text-on-surface font-headline">
              Billing &amp; Refunds
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-white/5">
              <span className="font-medium text-on-surface">Tax Invoices &amp; Receipts</span>
              <input
                type="checkbox"
                checked={prefs.paymentEmail}
                onChange={() => toggle("paymentEmail")}
                className="rounded border-white/20 bg-surface-container text-primary focus:ring-primary"
              />
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="font-medium text-on-surface">Refund Approvals &amp; Credit</span>
              <input
                type="checkbox"
                checked={prefs.paymentPush}
                onChange={() => toggle("paymentPush")}
                className="rounded border-white/20 bg-surface-container text-primary focus:ring-primary"
              />
            </div>
          </div>
        </section>

        {/* Security Alerts (Always On) */}
        <section className="bg-surface-container border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
            <ShieldAlert className="h-5 w-5 text-red-400" />
            <h2 className="font-bold text-base text-on-surface font-headline">
              Account Security
            </h2>
          </div>

          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <h3 className="font-bold text-on-surface">Critical Security Alerts</h3>
              <p className="text-[11px] text-on-surface-variant">
                Sign-ins from new devices and password changes.
              </p>
            </div>
            <span className="px-2.5 py-1 bg-surface-container-high rounded-full border border-white/10 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider shrink-0">
              Always On
            </span>
          </div>
        </section>
      </div>

      {/* Save Action */}
      <div className="flex justify-end pt-4 border-t border-white/5">
        <Button
          type="submit"
          disabled={isSaving}
          className="gap-2 text-xs font-bold shadow-lg shadow-primary/20"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : isSavedSuccess ? (
            <>
              <Check className="h-4 w-4 text-green-400" />
              <span>Preferences Saved!</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Save Preferences</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
