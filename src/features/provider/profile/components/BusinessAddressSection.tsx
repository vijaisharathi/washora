"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  providerBusinessAddressSchema,
  ProviderBusinessAddressFormData,
} from "@/features/provider/profile/schemas/providerProfileSchemas";
import { ProviderBusinessAddress } from "@/types/provider/profile";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

interface BusinessAddressSectionProps {
  initialData?: ProviderBusinessAddress;
  onSave: (data: Partial<ProviderBusinessAddress>) => Promise<any>;
  isSaving: boolean;
}

export function BusinessAddressSection({
  initialData,
  onSave,
  isSaving,
}: BusinessAddressSectionProps) {
  const [successMsg, setSuccessMsg] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProviderBusinessAddressFormData>({
    resolver: zodResolver(providerBusinessAddressSchema),
    defaultValues: {
      addressLine1: initialData?.addressLine1 || "Shop 14, Ground Floor, Indiranagar Galleria",
      addressLine2: initialData?.addressLine2 || "100 Feet Road, HAL 2nd Stage",
      locality: initialData?.locality || "Indiranagar",
      city: initialData?.city || "Bangalore",
      state: initialData?.state || "Karnataka",
      postalCode: initialData?.postalCode || "560038",
      country: initialData?.country || "India",
      landmark: initialData?.landmark || "Opposite Metro Pillar 114",
    },
  });

  const onSubmit = async (data: ProviderBusinessAddressFormData) => {
    await onSave(data);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <ProviderCard variant="container" className="p-6">
      <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-4">
        <div>
          <h3 className="text-base font-bold text-on-surface">Studio Physical Location</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Physical workshop and customer drop-off storefront coordinates for valet logistics.
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
          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">Street Address / Unit / Floor</label>
            <input
              type="text"
              {...register("addressLine1")}
              className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-2.5 border border-transparent focus:border-primary outline-none"
            />
            {errors.addressLine1 && (
              <span className="text-xs text-error">{errors.addressLine1.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">Building / Complex / Street</label>
            <input
              type="text"
              {...register("addressLine2")}
              className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-2.5 border border-transparent focus:border-primary outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">Locality / Area</label>
            <input
              type="text"
              {...register("locality")}
              className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-2.5 border border-transparent focus:border-primary outline-none"
            />
            {errors.locality && (
              <span className="text-xs text-error">{errors.locality.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">City</label>
            <input
              type="text"
              {...register("city")}
              className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-2.5 border border-transparent focus:border-primary outline-none"
            />
            {errors.city && (
              <span className="text-xs text-error">{errors.city.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">State</label>
            <input
              type="text"
              {...register("state")}
              className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-2.5 border border-transparent focus:border-primary outline-none"
            />
            {errors.state && (
              <span className="text-xs text-error">{errors.state.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">Postal PIN Code</label>
            <input
              type="text"
              {...register("postalCode")}
              className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-2.5 border border-transparent focus:border-primary outline-none"
            />
            {errors.postalCode && (
              <span className="text-xs text-error">{errors.postalCode.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">Landmark (Optional)</label>
            <input
              type="text"
              {...register("landmark")}
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
                <span>Save Studio Address</span>
              </>
            )}
          </button>
        </div>
      </form>
    </ProviderCard>
  );
}
