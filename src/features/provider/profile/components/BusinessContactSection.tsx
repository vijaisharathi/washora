"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  providerContactInfoSchema,
  ProviderContactInfoFormData,
} from "@/features/provider/profile/schemas/providerProfileSchemas";
import { ProviderContactInfo } from "@/types/provider/profile";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

interface BusinessContactSectionProps {
  initialData?: ProviderContactInfo;
  onSave: (data: Partial<ProviderContactInfo>) => Promise<any>;
  isSaving: boolean;
}

export function BusinessContactSection({
  initialData,
  onSave,
  isSaving,
}: BusinessContactSectionProps) {
  const [successMsg, setSuccessMsg] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProviderContactInfoFormData>({
    resolver: zodResolver(providerContactInfoSchema),
    defaultValues: {
      primaryEmail: initialData?.primaryEmail || "partner@luxecare.example.com",
      supportEmail: initialData?.supportEmail || "care@luxecare.example.com",
      primaryPhone: initialData?.primaryPhone || "+91 98401 23456",
      emergencyHotline: initialData?.emergencyHotline || "+91 80 4123 9999",
      websiteUrl: initialData?.websiteUrl || "https://luxecare.example.com",
    },
  });

  const onSubmit = async (data: ProviderContactInfoFormData) => {
    await onSave(data);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <ProviderCard variant="container" className="p-6">
      <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-4">
        <div>
          <h3 className="text-base font-bold text-on-surface">Business Contact & Support Channels</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Operational contact lines for partner dispatch, customer support, and emergency escalations.
          </p>
        </div>
        {successMsg && (
          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            Saved
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">Primary Business Email</label>
            <input
              type="email"
              {...register("primaryEmail")}
              className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-2.5 border border-transparent focus:border-primary outline-none"
            />
            {errors.primaryEmail && (
              <span className="text-xs text-error">{errors.primaryEmail.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">Customer Support Email</label>
            <input
              type="email"
              {...register("supportEmail")}
              className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-2.5 border border-transparent focus:border-primary outline-none"
            />
            {errors.supportEmail && (
              <span className="text-xs text-error">{errors.supportEmail.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">Primary Mobile / Desk Phone</label>
            <input
              type="tel"
              {...register("primaryPhone")}
              className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-2.5 border border-transparent focus:border-primary outline-none"
            />
            {errors.primaryPhone && (
              <span className="text-xs text-error">{errors.primaryPhone.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">Emergency Operations Hotline</label>
            <input
              type="tel"
              {...register("emergencyHotline")}
              className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-2.5 border border-transparent focus:border-primary outline-none"
            />
          </div>

          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">Studio Website (Optional)</label>
            <input
              type="url"
              {...register("websiteUrl")}
              className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-2.5 border border-transparent focus:border-primary outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary font-semibold text-xs transition-all shadow-md shadow-primary/20 flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSaving ? (
              <span>Saving...</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>Save Contact Details</span>
              </>
            )}
          </button>
        </div>
      </form>
    </ProviderCard>
  );
}
