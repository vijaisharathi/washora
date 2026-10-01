"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  SlidersHorizontal,
  Save,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Activity,
  CreditCard,
  Star,
  Store,
  Bike,
  User,
  Terminal,
} from "lucide-react";
import { useAdminNotificationPreferences } from "@/features/admin/hooks/useAdminNotifications";
import { NotificationPreferences } from "@/types/admin/notification";

export function NotificationPreferencesView() {
  const {
    loading,
    error,
    preferences,
    updatePreferences,
  } = useAdminNotificationPreferences();

  const [formState, setFormState] = useState<Partial<NotificationPreferences>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  // Sync initial state
  const currentState: NotificationPreferences = {
    userId: preferences?.userId || "ADM-0001",
    organizationId: preferences?.organizationId || "ORG-0001",
    booking: formState.booking !== undefined ? formState.booking : preferences?.booking ?? true,
    assignment: formState.assignment !== undefined ? formState.assignment : preferences?.assignment ?? true,
    payment: formState.payment !== undefined ? formState.payment : preferences?.payment ?? true,
    review: formState.review !== undefined ? formState.review : preferences?.review ?? true,
    provider: formState.provider !== undefined ? formState.provider : preferences?.provider ?? true,
    deliveryPartner: formState.deliveryPartner !== undefined ? formState.deliveryPartner : preferences?.deliveryPartner ?? true,
    customer: formState.customer !== undefined ? formState.customer : preferences?.customer ?? true,
    service: formState.service !== undefined ? formState.service : preferences?.service ?? true,
    system: formState.system !== undefined ? formState.system : preferences?.system ?? true,
  };

  const handleToggle = (category: keyof Omit<NotificationPreferences, "userId" | "organizationId">) => {
    setFormState((prev) => ({
      ...prev,
      [category]: !currentState[category],
    }));
    setSuccessMessage(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await updatePreferences(currentState);
      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 3500);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4 animate-pulse">
        <div className="w-32 h-6 bg-surface-container-high rounded" />
        <div className="h-96 bg-surface-container-high rounded-xl" />
      </div>
    );
  }

  const categories: Array<{
    key: keyof Omit<NotificationPreferences, "userId" | "organizationId">;
    title: string;
    description: string;
    icon: React.ElementType;
  }> = [
    {
      key: "booking",
      title: "Booking Orders & Lifecycle",
      description: "Receive notifications when new bookings are created, confirmed, modified, or completed.",
      icon: Layers,
    },
    {
      key: "assignment",
      title: "Assignment & Dispatch Alerts",
      description: "Alerts for valet dispatch assignments, route delays, SLA threshold alerts, and reassignments.",
      icon: Activity,
    },
    {
      key: "payment",
      title: "Payments, Refunds & Settlements",
      description: "Notifications for payment completions, failed transactions, customer refund requests, and merchant settlements.",
      icon: CreditCard,
    },
    {
      key: "review",
      title: "Customer Reviews & Moderation",
      description: "Alerts when reviews are flagged by algorithms, require trust & safety moderation, or high-praise feedback.",
      icon: Star,
    },
    {
      key: "provider",
      title: "Provider Workshops & Facilities",
      description: "Updates regarding merchant capacity limits, KYC verification submissions, and operating schedules.",
      icon: Store,
    },
    {
      key: "deliveryPartner",
      title: "Delivery Valet Partners",
      description: "Fleet status alerts including vehicle breakdowns, attendance check-ins, and zone capacity warnings.",
      icon: Bike,
    },
    {
      key: "customer",
      title: "Customer Profiles & Accounts",
      description: "Alerts for new high-value customer registrations, address profile revisions, and account changes.",
      icon: User,
    },
    {
      key: "service",
      title: "Services & Pricing Catalog",
      description: "Notices when service base rates, fees, or catalog offerings are added or modified.",
      icon: Layers,
    },
    {
      key: "system",
      title: "Platform Infrastructure & Webhooks",
      description: "Critical server health checks, payment gateway latency warnings, and automated daily logs.",
      icon: Terminal,
    },
  ];

  return (
    <div className="max-w-4xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/notifications"
            className="p-2 rounded-lg border border-outline-variant/50 hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
            title="Back to notifications"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
              </div>
              <h1 className="text-xl font-bold text-on-surface tracking-tight">
                Notification Preferences
              </h1>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Customize operational notification categories for your console session.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? "Saving..." : "Save Preferences"}</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-500 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Your notification preferences have been successfully updated.</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Preferences List */}
      <form onSubmit={handleSave} className="space-y-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isEnabled = Boolean(currentState[cat.key]);

          return (
            <div
              key={cat.key}
              className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 hover:border-outline-variant/60 transition-all flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-on-surface">
                    {cat.title}
                  </h3>
                  <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={isEnabled}
                onClick={() => handleToggle(cat.key)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isEnabled ? "bg-primary" : "bg-surface-container-high"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    isEnabled ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </form>
    </div>
  );
}
