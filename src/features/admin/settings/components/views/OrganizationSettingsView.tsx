"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  CheckCircle2,
  AlertCircle,
  Shield,
  Calendar,
  Phone,
  Mail,
} from "lucide-react";
import { SettingsHeader } from "../SettingsHeader";
import { SettingsNavigationTabs } from "../SettingsNavigationTabs";
import { useAdminOrganizationSettings } from "@/features/admin/hooks/useAdminSettings";
import {
  OrganizationSettingsSchema,
  OrganizationSettingsFormData,
} from "@/types/admin";
import { SettingsFormSkeleton } from "../skeletons/SettingsSkeleton";

export function OrganizationSettingsView() {
  const {
    organization,
    loading,
    saving,
    error,
    successMessage,
    updateOrganization,
    refresh,
    setSuccessMessage,
  } = useAdminOrganizationSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OrganizationSettingsFormData>({
    resolver: zodResolver(OrganizationSettingsSchema),
  });

  useEffect(() => {
    if (organization) {
      reset({
        organizationName: organization.organizationName,
        organizationEmail: organization.organizationEmail,
        organizationPhone: organization.organizationPhone,
        organizationType: organization.organizationType,
      });
    }
  }, [organization, reset]);

  if (loading) {
    return (
      <div className="space-y-6">
        <SettingsHeader
          title="Organization Legal & Contact Profile"
          subtitle="Configure entity legal details, corporate headquarters contact, and administrative operational type."
          breadcrumbs={[
            { label: "Settings", href: "/admin/settings" },
            { label: "Organization" },
          ]}
        />
        <SettingsNavigationTabs />
        <SettingsFormSkeleton />
      </div>
    );
  }

  const onSubmit = async (data: OrganizationSettingsFormData) => {
    try {
      await updateOrganization(data);
    } catch {
      // handled in hook
    }
  };

  const handleCancel = () => {
    if (organization) {
      reset({
        organizationName: organization.organizationName,
        organizationEmail: organization.organizationEmail,
        organizationPhone: organization.organizationPhone,
        organizationType: organization.organizationType,
      });
      setSuccessMessage(null);
    }
  };

  return (
    <div className="space-y-6">
      <SettingsHeader
        title="Organization Legal & Contact Profile"
        subtitle="Configure entity legal details, corporate headquarters contact, and administrative operational type."
        breadcrumbs={[
          { label: "Settings", href: "/admin/settings" },
          { label: "Organization" },
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editable Fields */}
          <div className="lg:col-span-2 p-6 sm:p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-6">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              <span>Entity Profile</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Organization Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  Legal Organization Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. WASHORA Technologies India Pvt Ltd"
                  {...register("organizationName")}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
                {errors.organizationName && (
                  <p className="text-[11px] text-error mt-1">
                    {errors.organizationName.message}
                  </p>
                )}
              </div>

              {/* Organization Email */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  Corporate Email <span className="text-error">*</span>
                </label>
                <input
                  type="email"
                  placeholder="ops-governance@washora.example.com"
                  {...register("organizationEmail")}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
                {errors.organizationEmail && (
                  <p className="text-[11px] text-error mt-1">
                    {errors.organizationEmail.message}
                  </p>
                )}
              </div>

              {/* Organization Phone */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  Contact Phone <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  placeholder="+91 80234 56780"
                  {...register("organizationPhone")}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
                {errors.organizationPhone && (
                  <p className="text-[11px] text-error mt-1">
                    {errors.organizationPhone.message}
                  </p>
                )}
              </div>

              {/* Organization Type */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  Organization Operational Type <span className="text-error">*</span>
                </label>
                <select
                  {...register("organizationType")}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="WASHORA">WASHORA (Platform Operator)</option>
                  <option value="Partner Organization">Partner Organization (Franchise/Master)</option>
                  <option value="Internal Operations">Internal Operations (Logistics/Hub)</option>
                </select>
                {errors.organizationType && (
                  <p className="text-[11px] text-error mt-1">
                    {errors.organizationType.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
              >
                {saving && (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                <span>Save Organization</span>
              </button>
            </div>
          </div>

          {/* Read-Only Status & Legal Meta Card */}
          <div className="space-y-5">
            <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-4">
              <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>Legal Entity Metadata</span>
              </h4>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-outline-variant/15">
                  <span className="text-on-surface-variant">Organization ID:</span>
                  <span className="font-mono font-bold text-primary">
                    {organization?.organizationId}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-outline-variant/15">
                  <span className="text-on-surface-variant">Status:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {organization?.organizationStatus}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-outline-variant/15">
                  <span className="text-on-surface-variant">Established Date:</span>
                  <span className="font-mono text-on-surface">
                    {organization?.createdAt
                      ? new Date(organization.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-on-surface-variant">Last Registry Sync:</span>
                  <span className="font-mono text-on-surface">
                    {organization?.updatedAt
                      ? new Date(organization.updatedAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface-variant space-y-2">
              <p className="font-bold text-on-surface">Compliance Note</p>
              <p className="leading-relaxed text-[11px]">
                Organization registration ID and statutory status are managed by platform compliance officers. Updates to company legal structure take effect across all staff members in this organization.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
