"use client";

import React from "react";
import Link from "next/link";
import { useNotifications } from "@/features/customer/hooks/useNotifications";
import { NotificationPreferencesForm } from "@/features/customer/components/notifications/NotificationPreferencesForm";
import { NotificationSkeleton } from "@/features/customer/components/notifications/NotificationSkeleton";
import { ArrowLeft, Bell } from "lucide-react";

export default function NotificationPreferencesPage() {
  const { preferences, isLoading, updatePreferences, isUpdatingPreferences } =
    useNotifications();

  if (isLoading || !preferences) {
    return <NotificationSkeleton />;
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 pb-24 animate-in fade-in zoom-in-95 duration-200">
      {/* Top Header */}
      <div className="space-y-2">
        <Link
          href="/customer/notifications"
          className="text-xs text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Notifications</span>
        </Link>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface font-headline flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            <span>Notification Preferences</span>
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Choose which alerts you receive across Push, Email, and SMS communication channels.
          </p>
        </div>
      </div>

      <NotificationPreferencesForm
        initialPreferences={preferences}
        onSave={async (p) => {
          await updatePreferences(p);
        }}
        isSaving={isUpdatingPreferences}
      />
    </main>
  );
}
