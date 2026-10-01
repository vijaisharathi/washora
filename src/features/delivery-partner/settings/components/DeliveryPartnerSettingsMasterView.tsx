"use client";

import React, { useState } from "react";
import {
  useDeliveryPartnerPreferences,
  useDeliveryPartnerSecuritySettings,
  useDeliveryPartnerSettingsActions,
} from "../hooks/useDeliveryPartnerSettings";
import { AccountIdentityCard } from "./AccountIdentityCard";
import { AppPreferencesCard } from "./AppPreferencesCard";
import { SecuritySettingsCard } from "./SecuritySettingsCard";
import { ShortcutsAndLegalCard } from "./ShortcutsAndLegalCard";
import { ChangePasswordModal } from "./ChangePasswordModal";
import { DeactivateAccountModal } from "./DeactivateAccountModal";

export function DeliveryPartnerSettingsMasterView() {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);

  const { preferences, isLoading: isPrefsLoading } = useDeliveryPartnerPreferences();
  const { securitySettings, isLoading: isSecurityLoading } = useDeliveryPartnerSecuritySettings();
  const {
    updatePreferences,
    isUpdatingPreferences,
    changePassword,
    isChangingPassword,
    deactivateAccount,
    isDeactivating,
  } = useDeliveryPartnerSettingsActions();

  if (isPrefsLoading && isSecurityLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="h-44 rounded-3xl bg-surface-container animate-pulse border border-outline-variant/20" />
        <div className="h-64 rounded-3xl bg-surface-container animate-pulse border border-outline-variant/20" />
        <div className="h-44 rounded-3xl bg-surface-container animate-pulse border border-outline-variant/20" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Account Identity & Verification */}
      <AccountIdentityCard />

      {/* App & Navigation Preferences */}
      <AppPreferencesCard
        preferences={preferences}
        onUpdate={updatePreferences}
        isUpdating={isUpdatingPreferences}
      />

      {/* Security & Authentication */}
      <SecuritySettingsCard
        securitySettings={securitySettings}
        onChangePasswordClick={() => setIsPasswordModalOpen(true)}
        onToggle2FA={(enabled) => updatePreferences({ twoFactorAuthEnabled: enabled })}
        onToggleBiometric={(enabled) => updatePreferences({ biometricLoginEnabled: enabled })}
        isUpdating={isUpdatingPreferences}
      />

      {/* Shortcuts, Legal & Session Actions */}
      <ShortcutsAndLegalCard
        onDeactivateClick={() => setIsDeactivateModalOpen(true)}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={changePassword}
        isSubmitting={isChangingPassword}
      />

      {/* Deactivate Account Modal */}
      <DeactivateAccountModal
        isOpen={isDeactivateModalOpen}
        onClose={() => setIsDeactivateModalOpen(false)}
        onConfirm={deactivateAccount}
        isSubmitting={isDeactivating}
      />
    </div>
  );
}
