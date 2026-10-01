"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ShoppingCart,
  Activity,
  CreditCard,
  Star,
  Store,
  Bike,
  Users,
  Layers,
  Terminal,
} from "lucide-react";
import { SettingsHeader } from "../SettingsHeader";
import { SettingsNavigationTabs } from "../SettingsNavigationTabs";
import { useAdminNotificationPreferences } from "@/features/admin/hooks/useAdminSettings";
import {
  NotificationPreferencesSchema,
  NotificationPreferencesFormData,
} from "@/types/admin";
import { ResetNotificationPreferencesModal } from "../modals/ResetNotificationPreferencesModal";
import { SettingsFormSkeleton } from "../skeletons/SettingsSkeleton";

export function NotificationsSettingsView() {
  const {
    preferences,
    loading,
    saving,
    error,
    successMessage,
    updatePreferences,
    resetToDefaults,
    refresh,
    setSuccessMessage,
  } = useAdminNotificationPreferences();

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<NotificationPreferencesFormData>({
    resolver: zodResolver(NotificationPreferencesSchema),
  });

  useEffect(() => {
    if (preferences) {
      reset({
        booking: preferences.booking,
        assignment: preferences.assignment,
        payment: preferences.payment,
        review: preferences.review,
        provider: preferences.provider,
        deliveryPartner: preferences.deliveryPartner,
        customer: preferences.customer,
        service: preferences.service,
        system: preferences.system,
      });
    }
  }, [preferences, reset]);

  if (loading) {
    return (
      <div className="space-y-6">
        <SettingsHeader
          title="Notification Channel Preferences"
          subtitle="Customize in-app operational broadcast alerts and activity stream notifications."
          breadcrumbs={[
            { label: "Settings", href: "/admin/settings" },
            { label: "Notifications" },
          ]}
        />
        <SettingsNavigationTabs />
        <SettingsFormSkeleton />
      </div>
    );
  }

  const onSubmit = async (data: NotificationPreferencesFormData) => {
    try {
      await updatePreferences(data);
    } catch {
      // handled in hook
    }
  };

  const handleResetConfirm = async () => {
    await resetToDefaults();
  };

  const categoriesConfig = [
    {
      name: "booking" as const,
      label: "Bookings & Order Lifecycle",
      description: "Order placed, laundry received at hub, process initiated, and fulfillment completed alerts.",
      icon: ShoppingCart,
    },
    {
      name: "assignment" as const,
      label: "Dispatch & Valet Operations",
      description: "Courier pickup requests, urgent facility reassignments, and valet trip alerts.",
      icon: Activity,
    },
    {
      name: "payment" as const,
      label: "Payments, Refunds & Settlements",
      description: "Escrow captures, partial refund claims, and automated provider payout notifications.",
      icon: CreditCard,
    },
    {
      name: "review" as const,
      label: "Customer Reviews & Moderation",
      description: "Low star-rating submissions (≤2★) and customer dispute reviews requiring moderation.",
      icon: Star,
    },
    {
      name: "provider" as const,
      label: "Provider Facilities & KYC",
      description: "New cleaning workshop onboarding submissions and commercial compliance verification requests.",
      icon: Store,
    },
    {
      name: "deliveryPartner" as const,
      label: "Courier Fleet & Logistics",
      description: "Valet onboarding applications, vehicle documentation renewals, and shift check-ins.",
      icon: Bike,
    },
    {
      name: "customer" as const,
      label: "Customer Inquiries & Support",
      description: "Priority customer escalation tickets and high-value customer profile updates.",
      icon: Users,
    },
    {
      name: "service" as const,
      label: "Service Catalog Changes",
      description: "New garment service additions, price adjustments, and express surcharge revisions.",
      icon: Layers,
    },
    {
      name: "system" as const,
      label: "Platform Governance & System Health",
      description: "Maintenance window alerts, API gateway degradation reports, and audit logs.",
      icon: Terminal,
    },
  ];

  return (
    <div className="space-y-6">
      <SettingsHeader
        title="Notification Channel Preferences"
        subtitle="Customize in-app operational broadcast alerts and activity stream notifications."
        breadcrumbs={[
          { label: "Settings", href: "/admin/settings" },
          { label: "Notifications" },
        ]}
        actions={
          <button
            onClick={() => setIsResetModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-xs font-semibold text-on-surface flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-on-surface-variant" />
            <span>Reset to Defaults</span>
          </button>
        }
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="p-6 sm:p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              <span>Operational Alert Channels</span>
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Toggle specific category notifications in your console feed. Changes take effect immediately.
            </p>
          </div>

          <div className="space-y-3">
            {categoriesConfig.map((cat) => {
              const Icon = cat.icon;
              return (
                <label
                  key={cat.name}
                  className="flex items-start justify-between p-4 rounded-xl bg-surface-container border border-outline-variant/30 hover:bg-surface-container-high cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-3.5 pr-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-on-surface block">
                        {cat.label}
                      </span>
                      <span className="text-[11px] text-on-surface-variant leading-relaxed">
                        {cat.description}
                      </span>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    {...register(cat.name)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary mt-1 shrink-0 cursor-pointer"
                  />
                </label>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-outline-variant/20">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              {saving && (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              <span>Save Preferences</span>
            </button>
          </div>
        </div>
      </form>

      <ResetNotificationPreferencesModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleResetConfirm}
        isLoading={saving}
      />
    </div>
  );
}
