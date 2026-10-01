"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ShieldCheck,
  Globe,
  Clock,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Sliders,
} from "lucide-react";
import {
  step3Schema,
  Step3FormData,
} from "../schemas/onboardingSchema";
import {
  AdminOnboardingData,
  AdminRoleSelection,
  AdminPrimaryWorkArea,
  AdminPreferredLanguage,
} from "@/types/admin";

interface Step3RolePreferencesProps {
  initialData: Partial<AdminOnboardingData>;
  onNext: (data: Step3FormData) => void;
  onBack: () => void;
}

export function Step3RolePreferences({
  initialData,
  onNext,
  onBack,
}: Step3RolePreferencesProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      role: initialData.role || "administrator",
      primaryWorkArea: initialData.primaryWorkArea || "platform-operations",
      preferredLanguage: initialData.preferredLanguage || "english",
      timezone: initialData.timezone || "Asia/Kolkata",
    },
  });

  const selectedRole = watch("role");
  const selectedArea = watch("primaryWorkArea");
  const selectedLanguage = watch("preferredLanguage");

  const roles: { id: AdminRoleSelection; title: string; desc: string }[] = [
    {
      id: "administrator",
      title: "Administrator",
      desc: "Full system governance, master settings & policy controls",
    },
    {
      id: "operations-manager",
      title: "Operations Manager",
      desc: "Hub operations oversight, dispatcher management & escalations",
    },
    {
      id: "operations-executive",
      title: "Operations Executive",
      desc: "Daily order routing, fleet dispatch & customer assistance",
    },
  ];

  const workAreas: { id: AdminPrimaryWorkArea; title: string }[] = [
    { id: "customer-operations", title: "Customer Operations" },
    { id: "provider-operations", title: "Provider Operations" },
    { id: "delivery-operations", title: "Delivery Operations" },
    { id: "platform-operations", title: "Platform Operations" },
  ];

  const languages: { id: AdminPreferredLanguage; title: string }[] = [
    { id: "english", title: "English" },
    { id: "tamil", title: "Tamil" },
  ];

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div className="border-b border-outline-variant/20 pb-4">
        <h2 className="text-lg font-bold text-on-surface">Step 3 — Role & Preferences</h2>
        <p className="text-xs text-on-surface-variant mt-0.5">
          Select your operational role, functional work domain, and regional preferences.
        </p>
      </div>

      {/* Role Selection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block">
          Platform Role <span className="text-critical">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {roles.map((r) => {
            const isSelected = selectedRole === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setValue("role", r.id, { shouldValidate: true })}
                className={`p-3.5 rounded-xl text-left border transition-all ${
                  isSelected
                    ? "bg-primary/15 border-primary text-primary font-bold shadow-sm"
                    : "bg-surface-container border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                <div className="text-xs font-bold text-on-surface flex items-center justify-between">
                  <span>{r.title}</span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-primary" />}
                </div>
                <p className="text-[10px] text-on-surface-variant mt-1 leading-normal">
                  {r.desc}
                </p>
              </button>
            );
          })}
        </div>
        {errors.role && (
          <p className="text-[11px] text-critical mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.role.message}
          </p>
        )}
      </div>

      {/* Primary Work Area */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block">
          Primary Work Area <span className="text-critical">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {workAreas.map((a) => {
            const isSelected = selectedArea === a.id;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => setValue("primaryWorkArea", a.id, { shouldValidate: true })}
                className={`py-2.5 px-3 rounded-xl text-center text-xs font-semibold border transition-all ${
                  isSelected
                    ? "bg-primary text-on-primary border-primary shadow-sm"
                    : "bg-surface-container border-outline-variant/30 text-on-surface hover:bg-surface-container-high"
                }`}
              >
                {a.title}
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

      {/* Preferred Language & Timezone Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Preferred Language */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-on-surface block">
            Preferred Language <span className="text-critical">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {languages.map((l) => {
              const isSelected = selectedLanguage === l.id;
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setValue("preferredLanguage", l.id, { shouldValidate: true })}
                  className={`py-2.5 px-3 rounded-xl text-center text-xs font-semibold border transition-all ${
                    isSelected
                      ? "bg-primary text-on-primary border-primary shadow-sm"
                      : "bg-surface-container border-outline-variant/30 text-on-surface hover:bg-surface-container-high"
                  }`}
                >
                  {l.title}
                </button>
              );
            })}
          </div>
          {errors.preferredLanguage && (
            <p className="text-[11px] text-critical mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.preferredLanguage.message}
            </p>
          )}
        </div>

        {/* Timezone */}
        <div className="space-y-1.5">
          <label htmlFor="timezone" className="text-xs font-medium text-on-surface block">
            Operational Timezone <span className="text-critical">*</span>
          </label>
          <div className="relative">
            <Clock className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="timezone"
              type="text"
              {...register("timezone")}
              placeholder="Asia/Kolkata"
              className={`w-full bg-surface-container border ${
                errors.timezone ? "border-critical" : "border-outline-variant/40"
              } rounded-xl pl-9 pr-4 py-2.5 text-xs text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono`}
            />
          </div>
          {errors.timezone && (
            <p className="text-[11px] text-critical mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.timezone.message}
            </p>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="pt-4 flex justify-between items-center">
        <button
          type="button"
          onClick={onBack}
          className="py-2.5 px-5 rounded-xl bg-surface-container-high border border-outline-variant/30 text-on-surface font-semibold text-xs flex items-center gap-2 hover:bg-surface-container-highest transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="submit"
          className="py-2.5 px-6 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center gap-2 hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
