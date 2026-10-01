"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Key,
  Laptop,
  Smartphone,
  Tablet,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Clock,
  Globe,
} from "lucide-react";
import { SettingsHeader } from "../SettingsHeader";
import { SettingsNavigationTabs } from "../SettingsNavigationTabs";
import { useAdminSecuritySettings } from "@/features/admin/hooks/useAdminSettings";
import { useAdminSession } from "@/features/admin/hooks/useAdminSession";
import { ChangePasswordModal } from "../modals/ChangePasswordModal";
import { SignOutOtherSessionsModal } from "../modals/SignOutOtherSessionsModal";
import { SettingsOverviewSkeleton } from "../skeletons/SettingsSkeleton";

export function SecuritySettingsView() {
  const {
    security,
    loading,
    saving,
    error,
    successMessage,
    changePassword,
    signOutOtherSessions,
    refresh,
  } = useAdminSecuritySettings();

  const { logout } = useAdminSession();

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSignOutOtherModalOpen, setIsSignOutOtherModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="space-y-6">
        <SettingsHeader
          title="Security & Session Controls"
          subtitle="Manage administrative credentials, active device authorizations, and session terminations."
          breadcrumbs={[
            { label: "Settings", href: "/admin/settings" },
            { label: "Security & Sessions" },
          ]}
        />
        <SettingsNavigationTabs />
        <SettingsOverviewSkeleton />
      </div>
    );
  }

  const renderDeviceIcon = (deviceName: string) => {
    const lower = deviceName.toLowerCase();
    if (lower.includes("ipad") || lower.includes("tablet")) {
      return <Tablet className="w-5 h-5 text-primary" />;
    }
    if (lower.includes("iphone") || lower.includes("phone") || lower.includes("android")) {
      return <Smartphone className="w-5 h-5 text-primary" />;
    }
    return <Laptop className="w-5 h-5 text-primary" />;
  };

  return (
    <div className="space-y-6">
      <SettingsHeader
        title="Security & Session Controls"
        subtitle="Manage administrative credentials, active device authorizations, and session terminations."
        breadcrumbs={[
          { label: "Settings", href: "/admin/settings" },
          { label: "Security & Sessions" },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Password & Credentials */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-on-surface">Platform Password</h3>
                <p className="text-[11px] text-on-surface-variant">Admin login credential</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface-container/60 border border-outline-variant/20 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">Password Status:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {security?.passwordStatus}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">Last Changed:</span>
                <span className="font-mono text-on-surface text-[11px]">
                  {security?.lastPasswordUpdate
                    ? new Date(security.lastPasswordUpdate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Change Password</span>
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-3">
            <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Session Isolation Notice</span>
            </h4>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Administrative sessions are strictly bounded to your authorized organization context. Sign-out operations invalidate authenticated session tokens immediately across all platform endpoints.
            </p>
          </div>
        </div>

        {/* Right Column: Active Sessions */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-outline-variant/20">
            <div>
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <Laptop className="w-4 h-4 text-primary" />
                <span>Authorized Active Sessions</span>
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Devices currently authenticated into this administrative account.
              </p>
            </div>

            <button
              onClick={() => setIsSignOutOtherModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-error/10 hover:bg-error/20 border border-error/30 text-error text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out Other Devices</span>
            </button>
          </div>

          {/* Session Cards */}
          <div className="space-y-3">
            {security?.activeSessions.map((sess) => (
              <div
                key={sess.id}
                className={`p-4 rounded-xl border transition-all ${
                  sess.isCurrent
                    ? "bg-primary/5 border-primary/40 shadow-sm"
                    : "bg-surface-container border-outline-variant/30 hover:bg-surface-container-high"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center shrink-0">
                      {renderDeviceIcon(sess.deviceName)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-on-surface">
                          {sess.deviceName}
                        </span>
                        {sess.isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                            Current Device
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-on-surface-variant mt-0.5">
                        {sess.browser}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-on-surface-variant font-mono">
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3 opacity-60" />
                          <span>IP: {sess.ipAddressMasked}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 opacity-60" />
                          <span>
                            Last Active:{" "}
                            {new Date(sess.lastActiveAt).toLocaleString("en-IN", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {sess.isCurrent ? (
                      <button
                        onClick={logout}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-error hover:bg-error/10 transition-colors"
                      >
                        Sign Out
                      </button>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-container-high text-on-surface-variant">
                        Authorized
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={changePassword}
      />

      <SignOutOtherSessionsModal
        isOpen={isSignOutOtherModalOpen}
        onClose={() => setIsSignOutOtherModalOpen(false)}
        onConfirm={signOutOtherSessions}
        isLoading={saving}
      />
    </div>
  );
}
