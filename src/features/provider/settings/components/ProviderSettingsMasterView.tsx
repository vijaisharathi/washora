"use client";

import React, { useState } from "react";
import { useProviderSettings } from "@/features/provider/settings/hooks/useProviderSettings";
import { ProviderLoadingState } from "@/features/provider/components/ProviderLoadingState";
import { AccountOverviewBento } from "./AccountOverviewBento";
import { SecurityPasswordSection } from "./SecurityPasswordSection";
import { PreferencesSection } from "./PreferencesSection";
import { ActiveSessionsCard } from "./ActiveSessionsCard";
import { DangerZoneSection } from "./DangerZoneSection";
import { LogoutConfirmModal } from "./LogoutConfirmModal";
import { DeactivateAccountModal } from "./DeactivateAccountModal";

export function ProviderSettingsMasterView() {
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);

  const {
    account,
    isLoadingAccount,
    sessions,
    isLoadingSessions,
    preferences,
    isLoadingPreferences,
    changePassword,
    isChangingPassword,
    updatePreferences,
    isUpdatingPreferences,
    revokeSession,
    isRevokingSession,
    deactivateAccount,
    isDeactivating,
  } = useProviderSettings();

  if (isLoadingAccount || isLoadingSessions || isLoadingPreferences || !account || !preferences) {
    return <ProviderLoadingState message="Loading Studio Account &amp; Settings..." />;
  }

  return (
    <div className="space-y-8">
      {/* 1. Account & Business Overview Bento */}
      <AccountOverviewBento account={account} />

      {/* 2. Security & Password Change */}
      <SecurityPasswordSection
        onChangePassword={changePassword}
        isChanging={isChangingPassword}
      />

      {/* 3. Regional & Auto-Accept Preferences */}
      <PreferencesSection
        preferences={preferences}
        onUpdate={updatePreferences}
        isUpdating={isUpdatingPreferences}
      />

      {/* 4. Active Device Sessions */}
      <ActiveSessionsCard
        sessions={sessions}
        onRevokeSession={revokeSession}
        isRevoking={isRevokingSession}
      />

      {/* 5. Danger Zone / Actions */}
      <DangerZoneSection
        onOpenLogout={() => setIsLogoutOpen(true)}
        onOpenDeactivate={() => setIsDeactivateOpen(true)}
      />

      {/* Modals */}
      <LogoutConfirmModal isOpen={isLogoutOpen} onClose={() => setIsLogoutOpen(false)} />
      <DeactivateAccountModal
        isOpen={isDeactivateOpen}
        onClose={() => setIsDeactivateOpen(false)}
        onDeactivate={deactivateAccount}
        isDeactivating={isDeactivating}
      />
    </div>
  );
}
