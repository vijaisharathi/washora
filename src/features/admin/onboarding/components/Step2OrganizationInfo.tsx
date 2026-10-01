"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  Mail,
  Phone,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Briefcase,
  Layers,
} from "lucide-react";
import {
  step2Schema,
  Step2FormData,
} from "../schemas/onboardingSchema";
import { AdminOnboardingData, AdminOrganizationType } from "@/types/admin";

interface Step2OrganizationInfoProps {
  initialData: Partial<AdminOnboardingData>;
  onNext: (data: Step2FormData) => void;
  onBack: () => void;
}

export function Step2OrganizationInfo({
  initialData,
  onNext,
  onBack,
}: Step2OrganizationInfoProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      organizationName:
        initialData.organizationName || "WASHORA Technologies India Pvt Ltd",
      organizationEmail:
        initialData.organizationEmail || "operations@washora.example.com",
      organizationPhone: initialData.organizationPhone || "+91 80234 56789",
      organizationType: initialData.organizationType || "washora",
    },
  });

  const selectedType = watch("organizationType");

  const orgTypes: { id: AdminOrganizationType; title: string; desc: string }[] = [
    {
      id: "washora",
      title: "WASHORA",
      desc: "Direct corporate headquarters and core engineering entity",
    },
    {
      id: "partner",
      title: "Partner Organization",
      desc: "Franchise partner, licensed laundry hub, or logistics vendor",
    },
    {
      id: "internal-operations",
      title: "Internal Operations",
      desc: "City-level dispatch, depot, and ground operations team",
    },
  ];

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div className="border-b border-outline-variant/20 pb-4">
        <h2 className="text-lg font-bold text-on-surface">Step 2 — Organization Information</h2>
        <p className="text-xs text-on-surface-variant mt-0.5">
          Specify the operating entity and operational unit you represent.
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
                onClick={() => setValue("organizationType", t.id, { shouldValidate: true })}
                className={`p-3.5 rounded-xl text-left border transition-all ${
                  isSelected
                    ? "bg-primary/15 border-primary text-primary font-bold shadow-sm"
                    : "bg-surface-container border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                <div className="text-xs font-bold text-on-surface flex items-center justify-between">
                  <span>{t.title}</span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </div>
                <p className="text-[10px] text-on-surface-variant mt-1 leading-normal">
                  {t.desc}
                </p>
              </button>
            );
          })}
        </div>
        {errors.organizationType && (
          <p className="text-[11px] text-critical mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.organizationType.message}
          </p>
        )}
      </div>

      {/* Organization Name */}
      <div className="space-y-1.5">
        <label htmlFor="organizationName" className="text-xs font-medium text-on-surface">
          Organization Legal Name <span className="text-critical">*</span>
        </label>
        <div className="relative">
          <Building2 className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="organizationName"
            type="text"
            {...register("organizationName")}
            placeholder="e.g. WASHORA Technologies India Pvt Ltd"
            className={`w-full bg-surface-container border ${
              errors.organizationName ? "border-critical" : "border-outline-variant/40"
            } rounded-xl pl-9 pr-4 py-2.5 text-xs text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all`}
          />
        </div>
        {errors.organizationName && (
          <p className="text-[11px] text-critical mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.organizationName.message}
          </p>
        )}
      </div>

      {/* Organization Email */}
      <div className="space-y-1.5">
        <label htmlFor="organizationEmail" className="text-xs font-medium text-on-surface">
          Organization Contact Email <span className="text-critical">*</span>
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="organizationEmail"
            type="email"
            {...register("organizationEmail")}
            placeholder="operations@washora.example.com"
            className={`w-full bg-surface-container border ${
              errors.organizationEmail ? "border-critical" : "border-outline-variant/40"
            } rounded-xl pl-9 pr-4 py-2.5 text-xs text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all`}
          />
        </div>
        {errors.organizationEmail && (
          <p className="text-[11px] text-critical mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.organizationEmail.message}
          </p>
        )}
      </div>

      {/* Organization Phone */}
      <div className="space-y-1.5">
        <label htmlFor="organizationPhone" className="text-xs font-medium text-on-surface">
          Organization Landline / Support Number <span className="text-critical">*</span>
        </label>
        <div className="relative">
          <Phone className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="organizationPhone"
            type="tel"
            {...register("organizationPhone")}
            placeholder="+91 80234 56789"
            className={`w-full bg-surface-container border ${
              errors.organizationPhone ? "border-critical" : "border-outline-variant/40"
            } rounded-xl pl-9 pr-4 py-2.5 text-xs text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono`}
          />
        </div>
        {errors.organizationPhone && (
          <p className="text-[11px] text-critical mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.organizationPhone.message}
          </p>
        )}
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
