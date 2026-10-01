"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  Building2,
  Calendar,
  Clock,
  Globe,
  Sliders,
  Camera,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useAdminProfile } from "@/features/admin/hooks/useAdminProfile";
import {
  adminProfileEditSchema,
  AdminProfileEditFormData,
} from "../schemas/profileSchemas";
import { AdminPrimaryWorkArea } from "@/types/admin";

export function AdminProfileMasterView() {
  const { profile, organization, isLoading, isSavingProfile, error, updateProfile } =
    useAdminProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string>("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AdminProfileEditFormData>({
    resolver: zodResolver(adminProfileEditSchema),
    values: profile
      ? {
          fullName: profile.fullName,
          workEmail: profile.workEmail,
          phone: profile.phone,
          profileImage: profile.profileImage || "",
          primaryWorkArea: profile.primaryWorkArea,
          preferredLanguage: profile.preferredLanguage,
          timezone: profile.timezone,
        }
      : undefined,
  });

  const selectedArea = watch("primaryWorkArea");
  const selectedLang = watch("preferredLanguage");

  const startEdit = () => {
    if (!profile) return;
    reset({
      fullName: profile.fullName,
      workEmail: profile.workEmail,
      phone: profile.phone,
      profileImage: profile.profileImage || "",
      primaryWorkArea: profile.primaryWorkArea,
      preferredLanguage: profile.preferredLanguage,
      timezone: profile.timezone,
    });
    setPreviewPhoto(profile.profileImage || "");
    setIsEditing(true);
    setSaveSuccess(false);
    setSaveError(null);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setSaveError(null);
    if (profile) {
      reset({
        fullName: profile.fullName,
        workEmail: profile.workEmail,
        phone: profile.phone,
        profileImage: profile.profileImage || "",
        primaryWorkArea: profile.primaryWorkArea,
        preferredLanguage: profile.preferredLanguage,
        timezone: profile.timezone,
      });
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewPhoto(result);
        setValue("profileImage", result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPreviewPhoto("");
    setValue("profileImage", "");
  };

  const onSubmit = async (data: AdminProfileEditFormData) => {
    setSaveError(null);
    try {
      await updateProfile(data);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile.";
      setSaveError(msg);
    }
  };

  const formatWorkArea = (area: string) => {
    switch (area) {
      case "customer-operations":
        return "Customer Operations";
      case "provider-operations":
        return "Provider Operations";
      case "delivery-operations":
        return "Delivery Operations";
      case "platform-operations":
        return "Platform Operations";
      default:
        return area;
    }
  };

  const formatRole = (r: string) => {
    if (r === "operations" || r === "OPERATIONS_MANAGER") return "Operations Manager";
    return "Super Administrator";
  };

  if (isLoading || !profile) {
    return (
      <div className="p-8 space-y-4 max-w-5xl mx-auto">
        <div className="h-8 w-48 bg-surface-container rounded-xl animate-pulse" />
        <div className="h-64 bg-surface-container-low rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/20 pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-on-surface flex items-center gap-2.5">
            <User className="w-6 h-6 text-primary" />
            <span>Administrator Profile</span>
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Manage your personal operational identity, contact details, and platform preferences.
          </p>
        </div>

        {!isEditing ? (
          <button
            type="button"
            onClick={startEdit}
            className="px-4 py-2 rounded-xl bg-primary text-on-primary font-semibold text-xs flex items-center gap-2 hover:bg-primary/90 transition-all shadow-md shadow-primary/20 w-fit"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cancelEdit}
              disabled={isSavingProfile}
              className="px-3.5 py-2 rounded-xl bg-surface-container-high border border-outline-variant/30 text-on-surface font-semibold text-xs flex items-center gap-1.5 hover:bg-surface-container-highest transition-colors disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isSavingProfile}
              className="px-4 py-2 rounded-xl bg-success text-on-primary font-semibold text-xs flex items-center gap-1.5 hover:bg-success/90 transition-all shadow-md shadow-success/20 disabled:opacity-50"
            >
              {isSavingProfile ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div
          role="status"
          className="p-3.5 rounded-xl bg-success/15 border border-success/30 text-success text-xs flex items-center gap-2 animate-in fade-in"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Profile changes saved successfully to canonical store.</span>
        </div>
      )}

      {saveError && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-critical/15 border border-critical/30 text-critical text-xs flex items-center gap-2 animate-in fade-in"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* READ ONLY VIEW */}
      {!isEditing ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Identity Card */}
          <div className="lg:col-span-1 p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-5 h-fit shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-surface-container-high border-2 border-primary/40 flex items-center justify-center overflow-hidden mb-3 shadow-inner">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={profile.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-on-surface-variant" />
                )}
              </div>
              <h2 className="text-base font-bold text-on-surface">{profile.fullName}</h2>
              <p className="text-xs text-on-surface-variant font-mono mt-0.5">{profile.workEmail}</p>

              <div className="mt-3 flex flex-wrap gap-2 justify-center">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary border border-primary/30">
                  {formatRole(profile.role)}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-success/15 text-success border border-success/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  {profile.status}
                </span>
              </div>
            </div>

            <div className="border-t border-outline-variant/20 pt-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-on-surface-variant">Account ID</span>
                <span className="font-mono font-bold text-on-surface">{profile.id}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-on-surface-variant">User Identifier</span>
                <span className="font-mono text-on-surface">{profile.userId}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-on-surface-variant">Associated Org</span>
                <Link
                  href="/admin/organization"
                  className="font-mono text-primary hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>{profile.organizationId}</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Details & Preferences Bento Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Operational Domain Card */}
            <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-4 shadow-lg">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                <span>Operational Configuration</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/20">
                  <span className="text-[10px] uppercase font-mono text-on-surface-variant block mb-1">
                    Primary Work Area
                  </span>
                  <span className="font-bold text-on-surface text-sm">
                    {formatWorkArea(profile.primaryWorkArea)}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/20">
                  <span className="text-[10px] uppercase font-mono text-on-surface-variant block mb-1">
                    Authorization Tier
                  </span>
                  <span className="font-bold text-primary text-sm flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    {formatRole(profile.role)}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/20">
                  <span className="text-[10px] uppercase font-mono text-on-surface-variant block mb-1">
                    Operational Language
                  </span>
                  <span className="font-bold text-on-surface text-sm uppercase font-mono">
                    {profile.preferredLanguage}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/20">
                  <span className="text-[10px] uppercase font-mono text-on-surface-variant block mb-1">
                    Operational Timezone
                  </span>
                  <span className="font-bold text-on-surface text-sm font-mono">
                    {profile.timezone}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Details Card */}
            <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-4 shadow-lg">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>Official Contact Points</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-container border border-outline-variant/20">
                  <Mail className="w-5 h-5 text-on-surface-variant shrink-0" />
                  <div className="overflow-hidden">
                    <span className="text-[10px] text-on-surface-variant block font-mono">Work Email</span>
                    <span className="font-semibold text-on-surface font-mono truncate block">
                      {profile.workEmail}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-container border border-outline-variant/20">
                  <Phone className="w-5 h-5 text-on-surface-variant shrink-0" />
                  <div className="overflow-hidden">
                    <span className="text-[10px] text-on-surface-variant block font-mono">Mobile Number</span>
                    <span className="font-semibold text-on-surface font-mono truncate block">
                      {profile.phone}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Audit & Timestamps Card */}
            <div className="p-4 rounded-xl bg-surface-container/50 border border-outline-variant/20 text-xs text-on-surface-variant flex flex-col sm:flex-row justify-between gap-2 font-mono text-[11px]">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Member Since: {new Date(profile.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Last Synchronized: {new Date(profile.updatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* EDIT MODE FORM */
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 rounded-2xl bg-surface-container-low border border-outline-variant/40 space-y-6 shadow-2xl">
          <div className="border-b border-outline-variant/20 pb-4">
            <h2 className="text-base font-bold text-on-surface">Edit Profile Details</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Update personal identity and operational parameters. Role permissions are governed separately.
            </p>
          </div>

          {/* Photo Uploader */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container border border-outline-variant/30">
            <div className="relative w-16 h-16 rounded-full bg-surface-container-high border-2 border-primary/40 flex items-center justify-center overflow-hidden shrink-0">
              {previewPhoto ? (
                <img
                  src={previewPhoto}
                  alt="Avatar Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-on-surface-variant" />
              )}
            </div>

            <div className="space-y-1.5 flex-1">
              <label className="text-xs font-semibold text-on-surface block">
                Profile Avatar
              </label>
              <div className="flex items-center gap-2">
                <label className="px-3 py-1.5 rounded-lg bg-surface-container-highest border border-outline-variant/40 text-xs font-semibold text-on-surface hover:bg-surface-bright cursor-pointer flex items-center gap-1.5 transition-colors">
                  <Camera className="w-3.5 h-3.5 text-primary" />
                  <span>{previewPhoto ? "Replace Photo" : "Upload Photo"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>
                {previewPhoto && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-2.5 py-1.5 rounded-lg text-critical hover:bg-critical/15 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
              <p className="text-[10px] text-on-surface-variant">
                PNG, JPG, or SVG up to 2MB. Saved in frontend storage.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="text-xs font-medium text-on-surface">
                Full Name <span className="text-critical">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="fullName"
                  type="text"
                  {...register("fullName")}
                  className={`w-full bg-surface-container border ${
                    errors.fullName ? "border-critical" : "border-outline-variant/40"
                  } rounded-xl pl-9 pr-4 py-2.5 text-xs text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all`}
                />
              </div>
              {errors.fullName && (
                <p className="text-[11px] text-critical mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Work Email */}
            <div className="space-y-1.5">
              <label htmlFor="workEmail" className="text-xs font-medium text-on-surface">
                Work Email Address <span className="text-critical">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="workEmail"
                  type="email"
                  {...register("workEmail")}
                  className={`w-full bg-surface-container border ${
                    errors.workEmail ? "border-critical" : "border-outline-variant/40"
                  } rounded-xl pl-9 pr-4 py-2.5 text-xs text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono`}
                />
              </div>
              {errors.workEmail && (
                <p className="text-[11px] text-critical mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.workEmail.message}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-xs font-medium text-on-surface">
                Mobile Phone <span className="text-critical">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="phone"
                  type="tel"
                  {...register("phone")}
                  className={`w-full bg-surface-container border ${
                    errors.phone ? "border-critical" : "border-outline-variant/40"
                  } rounded-xl pl-9 pr-4 py-2.5 text-xs text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono`}
                />
              </div>
              {errors.phone && (
                <p className="text-[11px] text-critical mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Authorization Role (Read-only) */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-on-surface flex items-center justify-between">
                <span>Authorization Role</span>
                <span className="text-[10px] text-on-surface-variant font-mono">Protected</span>
              </label>
              <div className="p-2.5 rounded-xl bg-surface-container/50 border border-outline-variant/20 text-xs text-on-surface-variant flex items-center justify-between">
                <span className="font-semibold text-on-surface">{formatRole(profile.role)}</span>
                <ShieldCheck className="w-4 h-4 text-primary" />
              </div>
            </div>
          </div>

          {/* Primary Work Area Selector */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block">
              Primary Work Area <span className="text-critical">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "customer-operations", title: "Customer Operations" },
                { id: "provider-operations", title: "Provider Operations" },
                { id: "delivery-operations", title: "Delivery Operations" },
                { id: "platform-operations", title: "Platform Operations" },
              ].map((area) => {
                const isSelected = selectedArea === area.id;
                return (
                  <button
                    key={area.id}
                    type="button"
                    onClick={() =>
                      setValue("primaryWorkArea", area.id as AdminPrimaryWorkArea, {
                        shouldValidate: true,
                      })
                    }
                    className={`py-2.5 px-3 rounded-xl text-center text-xs font-semibold border transition-all ${
                      isSelected
                        ? "bg-primary text-on-primary border-primary shadow-sm"
                        : "bg-surface-container border-outline-variant/30 text-on-surface hover:bg-surface-container-high"
                    }`}
                  >
                    {area.title}
                  </button>
                );
              })}
            </div>
            {errors.primaryWorkArea && (
              <p className="text-[11px] text-critical mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.primaryWorkArea.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-outline-variant/20 flex justify-end gap-3">
            <button
              type="button"
              onClick={cancelEdit}
              disabled={isSavingProfile}
              className="px-5 py-2.5 rounded-xl bg-surface-container-high border border-outline-variant/30 text-on-surface font-semibold text-xs hover:bg-surface-container-highest transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSavingProfile}
              className="px-6 py-2.5 rounded-xl bg-success text-on-primary font-bold text-xs flex items-center gap-2 hover:bg-success/90 transition-all shadow-md shadow-success/20 disabled:opacity-50"
            >
              {isSavingProfile ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
