"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  Mail,
  Phone,
  ShieldCheck,
  Calendar,
  Clock,
  Layers,
  Edit3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useAdminProfile } from "@/features/admin/hooks/useAdminProfile";
import {
  adminOrganizationEditSchema,
  AdminOrganizationEditFormData,
} from "../../profile/schemas/profileSchemas";
import { AdminOrganizationType } from "@/types/admin";

export function AdminOrganizationMasterView() {
  const { organization, profile, isLoading, isSavingOrganization, error, updateOrganization } =
    useAdminProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AdminOrganizationEditFormData>({
    resolver: zodResolver(adminOrganizationEditSchema),
    values: organization
      ? {
          name: organization.name,
          email: organization.email,
          phone: organization.phone,
          type: organization.type,
        }
      : undefined,
  });

  const selectedType = watch("type");

  const startEdit = () => {
    if (!organization) return;
    reset({
      name: organization.name,
      email: organization.email,
      phone: organization.phone,
      type: organization.type,
    });
    setIsEditing(true);
    setSaveSuccess(false);
    setSaveError(null);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setSaveError(null);
    if (organization) {
      reset({
        name: organization.name,
        email: organization.email,
        phone: organization.phone,
        type: organization.type,
      });
    }
  };

  const onSubmit = async (data: AdminOrganizationEditFormData) => {
    setSaveError(null);
    try {
      await updateOrganization(data);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update organization.";
      setSaveError(msg);
    }
  };

  const formatOrgType = (t: string) => {
    switch (t) {
      case "washora":
        return "WASHORA Corporate";
      case "partner":
        return "Partner Organization";
      case "internal-operations":
        return "Internal Operations";
      default:
        return t;
    }
  };

  const orgTypes: { id: AdminOrganizationType; title: string; desc: string }[] = [
    {
      id: "washora",
      title: "WASHORA Corporate",
      desc: "Direct corporate headquarters & core engineering entity",
    },
    {
      id: "partner",
      title: "Partner Organization",
      desc: "Franchise partner, licensed laundry hub, or logistics vendor",
    },
    {
      id: "internal-operations",
      title: "Internal Operations",
      desc: "City-level dispatch, depot, and ground operations unit",
    },
  ];

  if (isLoading || !organization) {
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
            <Building2 className="w-6 h-6 text-primary" />
            <span>Organization Setup</span>
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Manage legal entity details, official communications, and operating structure for your organization.
          </p>
        </div>

        {!isEditing ? (
          <button
            type="button"
            onClick={startEdit}
            className="px-4 py-2 rounded-xl bg-primary text-on-primary font-semibold text-xs flex items-center gap-2 hover:bg-primary/90 transition-all shadow-md shadow-primary/20 w-fit"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Organization</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cancelEdit}
              disabled={isSavingOrganization}
              className="px-3.5 py-2 rounded-xl bg-surface-container-high border border-outline-variant/30 text-on-surface font-semibold text-xs flex items-center gap-1.5 hover:bg-surface-container-highest transition-colors disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isSavingOrganization}
              className="px-4 py-2 rounded-xl bg-success text-on-primary font-semibold text-xs flex items-center gap-1.5 hover:bg-success/90 transition-all shadow-md shadow-success/20 disabled:opacity-50"
            >
              {isSavingOrganization ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save Organization</span>
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
          <span>Organization changes saved successfully to canonical store.</span>
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
              <div className="w-20 h-20 rounded-2xl bg-primary/20 border-2 border-primary/40 flex items-center justify-center mb-3 shadow-inner">
                <Building2 className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-base font-bold text-on-surface line-clamp-2">{organization.name}</h2>
              <p className="text-xs text-on-surface-variant font-mono mt-0.5">{organization.email}</p>

              <div className="mt-3 flex flex-wrap gap-2 justify-center">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary border border-primary/30">
                  {formatOrgType(organization.type)}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-success/15 text-success border border-success/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  {organization.status}
                </span>
              </div>
            </div>

            <div className="border-t border-outline-variant/20 pt-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-on-surface-variant">Organization ID</span>
                <span className="font-mono font-bold text-on-surface">{organization.id}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-on-surface-variant">Associated Lead</span>
                <Link
                  href="/admin/profile"
                  className="font-mono text-primary hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>{profile?.fullName || "Operator"}</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Details & Contacts Bento Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Operational Structure Card */}
            <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-4 shadow-lg">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span>Entity Classification</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/20">
                  <span className="text-[10px] uppercase font-mono text-on-surface-variant block mb-1">
                    Operating Entity Type
                  </span>
                  <span className="font-bold text-on-surface text-sm">
                    {formatOrgType(organization.type)}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/20">
                  <span className="text-[10px] uppercase font-mono text-on-surface-variant block mb-1">
                    Compliance Status
                  </span>
                  <span className="font-bold text-success text-sm flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Verified Operating Entity
                  </span>
                </div>
              </div>
            </div>

            {/* Official Contact Info Card */}
            <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-4 shadow-lg">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>Headquarters & Contact Channels</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-container border border-outline-variant/20">
                  <Mail className="w-5 h-5 text-on-surface-variant shrink-0" />
                  <div className="overflow-hidden">
                    <span className="text-[10px] text-on-surface-variant block font-mono">
                      Official Communications Email
                    </span>
                    <span className="font-semibold text-on-surface font-mono truncate block">
                      {organization.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-container border border-outline-variant/20">
                  <Phone className="w-5 h-5 text-on-surface-variant shrink-0" />
                  <div className="overflow-hidden">
                    <span className="text-[10px] text-on-surface-variant block font-mono">
                      Main Support / Landline
                    </span>
                    <span className="font-semibold text-on-surface font-mono truncate block">
                      {organization.phone}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Audit & Timestamps Card */}
            <div className="p-4 rounded-xl bg-surface-container/50 border border-outline-variant/20 text-xs text-on-surface-variant flex flex-col sm:flex-row justify-between gap-2 font-mono text-[11px]">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Entity Incorporated: {new Date(organization.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Last Record Update: {new Date(organization.updatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* EDIT MODE FORM */
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 rounded-2xl bg-surface-container-low border border-outline-variant/40 space-y-6 shadow-2xl">
          <div className="border-b border-outline-variant/20 pb-4">
            <h2 className="text-base font-bold text-on-surface">Edit Organization Details</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Update legal organization details and official operational points. Organization ID and status are protected.
            </p>
          </div>

          {/* Organization Type Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block">
              Organization Type <span className="text-critical">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {orgTypes.map((t) => {
                const isSelected = selectedType === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setValue("type", t.id, { shouldValidate: true })}
                    className={`p-3.5 rounded-xl text-left border transition-all ${
                      isSelected
                        ? "bg-primary/15 border-primary text-primary font-bold shadow-sm"
                        : "bg-surface-container border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                  >
                    <div className="text-xs font-bold text-on-surface flex items-center justify-between">
                      <span>{t.title}</span>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <p className="text-[10px] text-on-surface-variant mt-1 leading-normal">
                      {t.desc}
                    </p>
                  </button>
                );
              })}
            </div>
            {errors.type && (
              <p className="text-[11px] text-critical mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.type.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Legal Name */}
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="name" className="text-xs font-medium text-on-surface">
                Organization Legal Name <span className="text-critical">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="name"
                  type="text"
                  {...register("name")}
                  className={`w-full bg-surface-container border ${
                    errors.name ? "border-critical" : "border-outline-variant/40"
                  } rounded-xl pl-9 pr-4 py-2.5 text-xs text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all`}
                />
              </div>
              {errors.name && (
                <p className="text-[11px] text-critical mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium text-on-surface">
                Official Email Address <span className="text-critical">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  className={`w-full bg-surface-container border ${
                    errors.email ? "border-critical" : "border-outline-variant/40"
                  } rounded-xl pl-9 pr-4 py-2.5 text-xs text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono`}
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-critical mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-xs font-medium text-on-surface">
                Official Phone / Support <span className="text-critical">*</span>
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
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-outline-variant/20 flex justify-end gap-3">
            <button
              type="button"
              onClick={cancelEdit}
              disabled={isSavingOrganization}
              className="px-5 py-2.5 rounded-xl bg-surface-container-high border border-outline-variant/30 text-on-surface font-semibold text-xs hover:bg-surface-container-highest transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSavingOrganization}
              className="px-6 py-2.5 rounded-xl bg-success text-on-primary font-bold text-xs flex items-center gap-2 hover:bg-success/90 transition-all shadow-md shadow-success/20 disabled:opacity-50"
            >
              {isSavingOrganization ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Organization</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
