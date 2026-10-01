"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Mail,
  Phone,
  Camera,
  Trash2,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import {
  step1Schema,
  Step1FormData,
} from "../schemas/onboardingSchema";
import { AdminOnboardingData } from "@/types/admin";

interface Step1PersonalInfoProps {
  initialData: Partial<AdminOnboardingData>;
  onNext: (data: Step1FormData) => void;
}

export function Step1PersonalInfo({
  initialData,
  onNext,
}: Step1PersonalInfoProps) {
  const [previewUrl, setPreviewUrl] = useState<string>(
    initialData.profileImage || ""
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      fullName: initialData.fullName || "",
      workEmail: initialData.workEmail || "",
      phone: initialData.phone || "",
      profileImage: initialData.profileImage || "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewUrl(result);
        setValue("profileImage", result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl("");
    setValue("profileImage", "");
  };

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div className="border-b border-outline-variant/20 pb-4">
        <h2 className="text-lg font-bold text-on-surface">Step 1 — Personal Information</h2>
        <p className="text-xs text-on-surface-variant mt-0.5">
          Enter your official identity details to configure your administrative profile.
        </p>
      </div>

      {/* Profile Image Picker (Frontend-only) */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container border border-outline-variant/30">
        <div className="relative w-16 h-16 rounded-full bg-surface-container-high border-2 border-primary/40 flex items-center justify-center overflow-hidden shrink-0">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Profile Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-8 h-8 text-on-surface-variant" />
          )}
        </div>

        <div className="space-y-1.5 flex-1">
          <label className="text-xs font-semibold text-on-surface block">
            Profile Avatar (Optional)
          </label>
          <div className="flex items-center gap-2">
            <label className="px-3 py-1.5 rounded-lg bg-surface-container-highest border border-outline-variant/40 text-xs font-semibold text-on-surface hover:bg-surface-bright cursor-pointer flex items-center gap-1.5 transition-colors">
              <Camera className="w-3.5 h-3.5 text-primary" />
              <span>{previewUrl ? "Replace Avatar" : "Upload Photo"}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
            {previewUrl && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="px-2.5 py-1.5 rounded-lg text-critical hover:bg-critical/15 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            )}
          </div>
          <p className="text-[10px] text-on-surface-variant">
            PNG, JPG, or SVG up to 2MB. Saved locally in frontend session.
          </p>
        </div>
      </div>

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
            placeholder="e.g. Priyanshu Roy"
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
            placeholder="e.g. priyanshu.admin@washora.example.com"
            className={`w-full bg-surface-container border ${
              errors.workEmail ? "border-critical" : "border-outline-variant/40"
            } rounded-xl pl-9 pr-4 py-2.5 text-xs text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all`}
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
          Mobile Phone Number <span className="text-critical">*</span>
        </label>
        <div className="relative">
          <Phone className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="phone"
            type="tel"
            {...register("phone")}
            placeholder="+91 98765 43210"
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

      {/* Actions */}
      <div className="pt-4 flex justify-end">
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
