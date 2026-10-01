"use client";

import React from "react";
import Link from "next/link";
import {
  User,
  Globe,
  Bell,
  ShieldCheck,
  Building2,
  Users,
  Shield,
  ArrowRight,
  CheckCircle2,
  Clock,
  Key,
  Laptop,
} from "lucide-react";
import { SettingsHeader } from "../SettingsHeader";
import { SettingsNavigationTabs } from "../SettingsNavigationTabs";
import { useAdminSettingsOverview } from "@/features/admin/hooks/useAdminSettings";
import { SettingsOverviewSkeleton } from "../skeletons/SettingsSkeleton";

export function SettingsOverviewMasterView() {
  const { data, loading, error, refresh } = useAdminSettingsOverview();

  if (loading) {
    return (
      <div className="space-y-6">
        <SettingsHeader
          title="Account, Roles & Settings"
          subtitle="Enterprise governance, identity profile, organization settings, and role permissions."
        />
        <SettingsNavigationTabs />
        <SettingsOverviewSkeleton />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <SettingsHeader
          title="Account, Roles & Settings"
          subtitle="Enterprise governance, identity profile, organization settings, and role permissions."
        />
        <SettingsNavigationTabs />
        <div className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-center">
          <p className="text-xs text-error font-medium mb-3">{error || "Failed to load settings."}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { account, preferences, organization, security, memberCounts } = data;

  return (
    <div className="space-y-6">
      <SettingsHeader
        title="Account, Roles & Settings"
        subtitle="Enterprise governance, identity profile, organization settings, and role permissions."
      />

      <SettingsNavigationTabs />

      {/* Grid of Settings Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Account Profile Card */}
        <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between hover:border-primary/40 transition-colors group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
                {account.profileImage ? (
                  <img
                    src={account.profileImage}
                    alt={account.fullName}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  account.fullName[0]
                )}
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                {account.status}
              </span>
            </div>

            <h3 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
              {account.fullName}
            </h3>
            <p className="text-xs text-on-surface-variant font-mono mt-0.5 truncate">
              {account.email}
            </p>

            <div className="mt-4 pt-3 border-t border-outline-variant/20 space-y-1.5 text-xs text-on-surface-variant">
              <div className="flex justify-between">
                <span>Role:</span>
                <span className="font-semibold text-on-surface">{account.role}</span>
              </div>
              <div className="flex justify-between">
                <span>Work Area:</span>
                <span className="text-on-surface">{account.primaryWorkArea}</span>
              </div>
            </div>
          </div>

          <Link
            href="/admin/settings/account"
            className="mt-5 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs font-semibold text-primary hover:underline"
          >
            <span>Edit Account Profile</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Organization Card */}
        <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between hover:border-primary/40 transition-colors group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-500">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="font-mono text-xs text-primary font-bold">
                {organization.organizationId}
              </span>
            </div>

            <h3 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors truncate">
              {organization.organizationName}
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {organization.organizationType}
            </p>

            <div className="mt-4 pt-3 border-t border-outline-variant/20 space-y-1.5 text-xs text-on-surface-variant">
              <div className="flex justify-between">
                <span>Email:</span>
                <span className="text-on-surface truncate max-w-[160px]">
                  {organization.organizationEmail}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {organization.organizationStatus}
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/admin/settings/organization"
            className="mt-5 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs font-semibold text-primary hover:underline"
          >
            <span>Manage Organization</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Staff Members Card */}
        <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between hover:border-primary/40 transition-colors group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-500">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold text-on-surface">
                {memberCounts.total} Staff
              </span>
            </div>

            <h3 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
              Staff Members Roster
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Admin & operations personnel directory
            </p>

            <div className="mt-4 pt-3 border-t border-outline-variant/20 space-y-1.5 text-xs text-on-surface-variant">
              <div className="flex justify-between">
                <span>Active Personnel:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {memberCounts.active}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Pending Invites:</span>
                <span className="font-bold text-amber-500">{memberCounts.pending}</span>
              </div>
            </div>
          </div>

          <Link
            href="/admin/settings/members"
            className="mt-5 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs font-semibold text-primary hover:underline"
          >
            <span>Manage Members</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Security & Sessions Card */}
        <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between hover:border-primary/40 transition-colors group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="px-2 py-0.5 rounded bg-surface-container-high text-[10px] font-bold text-on-surface">
                {security.activeSessions.length} Active Sessions
              </span>
            </div>

            <h3 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
              Security & Credentials
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Password status & multi-device login management
            </p>

            <div className="mt-4 pt-3 border-t border-outline-variant/20 space-y-1.5 text-xs text-on-surface-variant">
              <div className="flex justify-between">
                <span>Password:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Key className="w-3 h-3" />
                  {security.passwordStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated:</span>
                <span className="font-mono text-[11px] text-on-surface">
                  {new Date(security.lastPasswordUpdate).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/admin/settings/security"
            className="mt-5 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs font-semibold text-primary hover:underline"
          >
            <span>Security Settings</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Preferences Card */}
        <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between hover:border-primary/40 transition-colors group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-500">
                <Globe className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold text-on-surface">
                {preferences.preferredLanguage}
              </span>
            </div>

            <h3 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
              Display & Localization
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Timezone, date formats, and language settings
            </p>

            <div className="mt-4 pt-3 border-t border-outline-variant/20 space-y-1.5 text-xs text-on-surface-variant">
              <div className="flex justify-between">
                <span>Timezone:</span>
                <span className="font-mono text-on-surface">{preferences.timezone}</span>
              </div>
              <div className="flex justify-between">
                <span>Date & Time:</span>
                <span className="font-mono text-on-surface">
                  {preferences.dateFormat} ({preferences.timeFormat})
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/admin/settings/preferences"
            className="mt-5 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs font-semibold text-primary hover:underline"
          >
            <span>Edit Preferences</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Roles & Permissions Card */}
        <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between hover:border-primary/40 transition-colors group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-500">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold text-on-surface">
                3 Standard Roles
              </span>
            </div>

            <h3 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
              Roles & Permission Matrix
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Role definitions, capability scopes, and access tiers
            </p>

            <div className="mt-4 pt-3 border-t border-outline-variant/20 space-y-1.5 text-xs text-on-surface-variant">
              <div className="flex justify-between">
                <span>Administrator:</span>
                <span className="font-bold text-primary">28 / 28 Grants</span>
              </div>
              <div className="flex justify-between">
                <span>Operations Manager:</span>
                <span className="font-bold text-on-surface">25 / 28 Grants</span>
              </div>
            </div>
          </div>

          <Link
            href="/admin/settings/roles"
            className="mt-5 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs font-semibold text-primary hover:underline"
          >
            <span>View Permission Matrix</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
