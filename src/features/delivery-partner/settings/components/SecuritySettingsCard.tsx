"use client";

import React from "react";
import { Shield, KeyRound, Smartphone, Fingerprint, Lock } from "lucide-react";
import { DeliveryPartnerSecuritySettings } from "@/types/delivery-partner";

interface SecuritySettingsCardProps {
  securitySettings?: DeliveryPartnerSecuritySettings;
  onChangePasswordClick: () => void;
  onToggle2FA: (enabled: boolean) => void;
  onToggleBiometric: (enabled: boolean) => void;
  isUpdating: boolean;
}

export function SecuritySettingsCard({
  securitySettings,
  onChangePasswordClick,
  onToggle2FA,
  onToggleBiometric,
  isUpdating,
}: SecuritySettingsCardProps) {
  const is2FA = securitySettings?.twoFactorAuthEnabled ?? true;
  const isBiometric = securitySettings?.biometricLoginEnabled ?? false;
  const lastChanged = securitySettings?.lastPasswordChanged
    ? new Date(securitySettings.lastPasswordChanged).toLocaleDateString()
    : "Recently";

  return (
    <div className="p-6 rounded-3xl bg-surface-container/80 border border-outline-variant/25 space-y-5 shadow-sm">
      <div className="flex items-center gap-2 border-b border-outline-variant/15 pb-4">
        <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
          <Shield className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-on-surface">Security & Authentication</h2>
          <p className="text-[11px] text-on-surface-variant">Account login security, passwords, and 2-factor authentication</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Password Management */}
        <div className="p-4 rounded-2xl bg-surface border border-outline-variant/15 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-primary" /> Login Password
            </span>
            <p className="text-[10px] text-on-surface-variant font-mono">
              Last updated: {lastChanged}
            </p>
          </div>

          <button
            type="button"
            onClick={onChangePasswordClick}
            className="px-3.5 py-1.5 rounded-xl bg-surface-container-high border border-outline-variant/30 text-xs font-bold text-on-surface hover:text-primary hover:border-primary/40 transition-all flex items-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Change</span>
          </button>
        </div>

        {/* 2-Factor Authentication */}
        <div className="p-4 rounded-2xl bg-surface border border-outline-variant/15 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" /> SMS OTP Verification
            </span>
            <p className="text-[10px] text-on-surface-variant">
              Require one-time passcode for new device logins & high-value cashouts
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={is2FA}
            onClick={() => onToggle2FA(!is2FA)}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              is2FA ? "bg-primary" : "bg-surface-container-highest"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                is2FA ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Biometric Login */}
        <div className="p-4 rounded-2xl bg-surface border border-outline-variant/15 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
              <Fingerprint className="w-3.5 h-3.5 text-primary" /> Biometric Authentication
            </span>
            <p className="text-[10px] text-on-surface-variant">
              Use Fingerprint / Face ID for quick app unlock
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={isBiometric}
            onClick={() => onToggleBiometric(!isBiometric)}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              isBiometric ? "bg-primary" : "bg-surface-container-highest"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                isBiometric ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
