"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  providerBusinessIdentitySchema,
  ProviderBusinessIdentityFormData,
} from "@/features/provider/profile/schemas/providerProfileSchemas";
import { ProviderBusinessIdentity } from "@/types/provider/profile";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

interface BusinessIdentitySectionProps {
  initialData?: ProviderBusinessIdentity;
  onSave: (data: Partial<ProviderBusinessIdentity>) => Promise<any>;
  isSaving: boolean;
}

export function BusinessIdentitySection({
  initialData,
  onSave,
  isSaving,
}: BusinessIdentitySectionProps) {
  const [successMsg, setSuccessMsg] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProviderBusinessIdentityFormData>({
    resolver: zodResolver(providerBusinessIdentitySchema),
    defaultValues: {
      businessName: initialData?.businessName || "LuxeCare Garment Studio",
      legalEntityName: initialData?.legalEntityName || "LuxeCare Care Services LLP",
      businessCategory: initialData?.businessCategory || "laundry",
      entityType: (initialData?.entityType as any) || "llp",
      gstin: initialData?.gstin || "29AABCU9603R1ZM",
      panNumber: initialData?.panNumber || "AABCU9603R",
      establishedYear: initialData?.establishedYear || "2021",
      description:
        initialData?.description ||
        "Premier artisanal dry cleaning, shoe spa restoration, and couture garment preservation facility operating with eco-solvent hydrocarbon technologies in Bangalore.",
    },
  });

  const onSubmit = async (data: ProviderBusinessIdentityFormData) => {
    await onSave(data);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <ProviderCard variant="container" className="p-6">
      <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-4">
        <div>
          <h3 className="text-base font-bold text-on-surface">Business Identity & Registration</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Manage your legal entity structure, registered trade name, and tax identifiers.
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
            <label className="text-xs font-semibold text-on-surface-variant">Business Trade Name</label>
            <input
              type="text"
              {...register("businessName")}
              className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-2.5 border border-transparent focus:border-primary outline-none"
            />
            {errors.businessName && (
              <span className="text-xs text-error">{errors.businessName.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">Legal Entity Name</label>
            <input
              type="text"
              {...register("legalEntityName")}
              className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-2.5 border border-transparent focus:border-primary outline-none"
            />
            {errors.legalEntityName && (
              <span className="text-xs text-error">{errors.legalEntityName.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">Entity Structure</label>
            <select
              {...register("entityType")}
              className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-2.5 border border-transparent focus:border-primary outline-none"
            >
              <option value="proprietorship">Sole Proprietorship</option>
              <option value="partnership">Partnership Firm</option>
              <option value="llp">Limited Liability Partnership (LLP)</option>
              <option value="private_limited">Private Limited Company</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">Established Year</label>
            <input
              type="text"
              {...register("establishedYear")}
              className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-2.5 border border-transparent focus:border-primary outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">Business PAN</label>
            <input
              type="text"
              {...register("panNumber")}
              className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-2.5 border border-transparent focus:border-primary outline-none uppercase"
            />
            {errors.panNumber && (
              <span className="text-xs text-error">{errors.panNumber.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">GSTIN</label>
            <input
              type="text"
              {...register("gstin")}
              className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-2.5 border border-transparent focus:border-primary outline-none uppercase"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-on-surface-variant">Studio Bio & Description</label>
          <textarea
            rows={3}
            {...register("description")}
            className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl p-3.5 border border-transparent focus:border-primary outline-none resize-none"
          />
          {errors.description && (
            <span className="text-xs text-error">{errors.description.message}</span>
          )}
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
                <span>Save Identity Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </ProviderCard>
  );
}
