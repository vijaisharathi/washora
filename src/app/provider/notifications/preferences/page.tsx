"use client";

import React from "react";
import Link from "next/link";
import { ProviderShell } from "@/features/provider/components/ProviderShell";
import { ProviderPageHeader } from "@/features/provider/components/ProviderPageHeader";
import { NotificationPreferencesSection } from "@/features/provider/notifications/components/NotificationPreferencesSection";
import { useProviderNotifications } from "@/features/provider/notifications/hooks/useProviderNotifications";
import { ProviderLoadingState } from "@/features/provider/components/ProviderLoadingState";

export default function ProviderNotificationPreferencesPage() {
  const { preferences, isLoadingPreferences, updatePreferences, isUpdatingPreferences } =
    useProviderNotifications();

  if (isLoadingPreferences) {
    return <ProviderLoadingState message="Loading Notification Preferences..." />;
  }

  return (
    <ProviderShell headerTitle="Notification Settings" headerSubtitle="Channel Preferences">
      <div className="mb-4">
        <Link
          href="/provider/notifications"
          className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-on-surface font-semibold transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Notifications</span>
        </Link>
      </div>

      <ProviderPageHeader
        title="Notification Preferences"
        description="Choose how and when you want to receive booking requests, courier logistics updates, and customer feedback."
      />

      <NotificationPreferencesSection
        preferences={preferences}
        onSavePreferences={async (prefs) => {
          await updatePreferences(prefs);
        }}
        isSaving={isUpdatingPreferences}
      />
    </ProviderShell>
  );
}
