"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Camera,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Shield,
  Clock,
  Calendar,
  Layers,
} from "lucide-react";
import { SettingsHeader } from "../SettingsHeader";
import { SettingsNavigationTabs } from "../SettingsNavigationTabs";
import { useAdminAccountSettings } from "@/features/admin/hooks/useAdminSettings";
import {
  AccountSettingsSchema,
  AccountSettingsFormData,
} from "@/types/admin";
import { SettingsFormSkeleton } from "../skeletons/SettingsSkeleton";

export function AccountSettingsView() {
  const {
    account,
    loading,
    saving,
    error,
    successMessage,
    updateAccount,
    refresh,
    setSuccessMessage,
  } = useAdminAccountSettings();

  const [previewImage, setPreviewImage] = useState<string | undefined>(undefined);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<AccountSettingsFormData>({
    resolver: zodResolver(AccountSettingsSchema),
  });

  useEffect(() => {
    if (account) {
      reset({
        fullName: account.fullName,
        email: account.email,
        phone: account.phone,
        primaryWorkArea: account.primaryWorkArea,
        preferredLanguage: account.preferredLanguage,
        timezone: account.timezone,
      });
      setPreviewImage(account.profileImage);
    }
  }, [account, reset]);

  if (loading) {
    return (
      <div className="space-y-6">
        <SettingsHeader
          title="Account Profile Settings"
          subtitle="Manage your personal identity credentials, contact information, and operational focus."
          breadcrumbs={[
            { label: "Settings", href: "/admin/settings" },
            { label: "Account Profile" },
          ]}
        />
        <SettingsNavigationTabs />
        <SettingsFormSkeleton />
      </div>
    );
  }

  if (error && !account) {
    return (
      <div className="space-y-6">
        <SettingsHeader
          title="Account Profile Settings"
          subtitle="Manage your personal identity credentials, contact information, and operational focus."
          breadcrumbs={[
            { label: "Settings", href: "/admin/settings" },
            { label: "Account Profile" },
          ]}
        />
        <SettingsNavigationTabs />
        <div className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-center">
          <p className="text-xs text-error font-medium mb-3">{error}</p>
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

  const onSubmit = async (formData: AccountSettingsFormData) => {
    try {
      await updateAccount({
        ...formData,
        profileImage: previewImage,
      });
    } catch {
      // error handled in hook
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(undefined);
  };

  const handleCancel = () => {
    if (account) {
      reset({
        fullName: account.fullName,
        email: account.email,
        phone: account.phone,
        primaryWorkArea: account.primaryWorkArea,
        preferredLanguage: account.preferredLanguage,
        timezone: account.timezone,
      });
      setPreviewImage(account.profileImage);
      setSuccessMessage(null);
    }
  };

  return (
    <div className="space-y-6">
      <SettingsHeader
        title="Account Profile Settings"
        subtitle="Manage your personal identity credentials, contact information, and operational focus."
        breadcrumbs={[
          { label: "Settings", href: "/admin/settings" },
          { label: "Account Profile" },
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
              <User className="w-4 h-4 text-primary" />
              <span>Personal Information</span>
            </h3>

            {/* Profile Avatar Upload */}
            <div className="flex items-center gap-5 p-4 rounded-xl bg-surface-container/60 border border-outline-variant/20">
              <div className="relative w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center font-bold text-xl text-primary overflow-hidden shrink-0">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt={account?.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  account?.fullName?.[0] || "A"
                )}
              </div>

              <div className="space-y-1.5 flex-1">
                <p className="text-xs font-semibold text-on-surface">Profile Avatar</p>
                <p className="text-[11px] text-on-surface-variant">
                  Supports local PNG, JPG preview up to 2MB
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-xs font-semibold text-on-surface border border-outline-variant/30 transition-colors flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  {previewImage && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-error hover:bg-error/10 transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  Full Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Priyanshu Roy"
                  {...register("fullName")}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
                {errors.fullName && (
                  <p className="text-[11px] text-error mt-1">{errors.fullName.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  Work Email <span className="text-error">*</span>
                </label>
                <input
                  type="email"
                  placeholder="admin@washora.example.com"
                  {...register("email")}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
                {errors.email && (
                  <p className="text-[11px] text-error mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  Phone Number <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  {...register("phone")}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
                {errors.phone && (
                  <p className="text-[11px] text-error mt-1">{errors.phone.message}</p>
                )}
              </div>

              {/* Primary Work Area */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  Primary Work Area <span className="text-error">*</span>
                </label>
                <select
                  {...register("primaryWorkArea")}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="Customer Operations">Customer Operations</option>
                  <option value="Provider Operations">Provider Operations</option>
                  <option value="Delivery Operations">Delivery Operations</option>
                  <option value="Platform Operations">Platform Operations</option>
                </select>
                {errors.primaryWorkArea && (
                  <p className="text-[11px] text-error mt-1">
                    {errors.primaryWorkArea.message}
                  </p>
                )}
              </div>

              {/* Preferred Language */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  Preferred Language
                </label>
                <select
                  {...register("preferredLanguage")}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="English">English</option>
                  <option value="Tamil">Tamil (தமிழ்)</option>
                </select>
              </div>

              {/* Timezone */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  Timezone
                </label>
                <input
                  type="text"
                  value="Asia/Kolkata (IST, UTC+5:30)"
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container/50 border border-outline-variant/30 text-xs text-on-surface-variant font-mono cursor-not-allowed"
                />
              </div>
            </div>

            {/* Form Actions */}
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
                <span>Save Changes</span>
              </button>
            </div>
          </div>

          {/* Read-Only System Identity Card */}
          <div className="space-y-5">
            <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-4">
              <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>Account Identity & Access</span>
              </h4>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-outline-variant/15">
                  <span className="text-on-surface-variant">Account ID:</span>
                  <span className="font-mono font-bold text-primary">{account?.id}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-outline-variant/15">
                  <span className="text-on-surface-variant">Assigned Role:</span>
                  <span className="font-semibold text-on-surface px-2 py-0.5 rounded bg-surface-container-high">
                    {account?.role}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-outline-variant/15">
                  <span className="text-on-surface-variant">Status:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {account?.status}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-outline-variant/15">
                  <span className="text-on-surface-variant">Member Since:</span>
                  <span className="font-mono text-on-surface">
                    {account?.createdAt
                      ? new Date(account.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-on-surface-variant">Last Active Login:</span>
                  <span className="font-mono text-on-surface">
                    {account?.lastLoginAt
                      ? new Date(account.lastLoginAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface-variant space-y-2">
              <p className="font-bold text-on-surface">Role Modification Notice</p>
              <p className="leading-relaxed text-[11px]">
                Administrative roles are assigned by organization administrators. To modify role permissions or organization affiliation, contact your platform administrator.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
