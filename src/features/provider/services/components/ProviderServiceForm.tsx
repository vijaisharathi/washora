"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  providerServiceSchema,
  ProviderServiceFormData,
} from "@/features/provider/services/schemas/providerServiceSchema";
import { ProviderServiceItem } from "@/types/provider/services";
import { ProviderCard } from "@/features/provider/components/ProviderCard";
import Link from "next/link";

interface ProviderServiceFormProps {
  initialData?: ProviderServiceItem | null;
  onSubmit: (data: ProviderServiceFormData) => Promise<void>;
  isSubmitting: boolean;
  title: string;
  subtitle: string;
}

export function ProviderServiceForm({
  initialData,
  onSubmit,
  isSubmitting,
  title,
  subtitle,
}: ProviderServiceFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProviderServiceFormData>({
    resolver: zodResolver(providerServiceSchema),
    defaultValues: {
      name: initialData?.name || "",
      category: initialData?.category || "laundry",
      description: initialData?.description || "",
      price: initialData?.price || 299,
      durationMinutes: initialData?.durationMinutes || 45,
      turnaroundHours: initialData?.turnaroundHours || 24,
      status: initialData?.status || "ACTIVE",
    },
  });

  return (
    <ProviderCard variant="container" className="p-6 md:p-8 max-w-2xl mx-auto">
      <div className="mb-6 border-b border-white/5 pb-4">
        <h2 className="text-xl font-bold text-on-surface">{title}</h2>
        <p className="text-xs text-on-surface-variant mt-0.5">{subtitle}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Service Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-on-surface-variant">Service Name</label>
          <input
            type="text"
            placeholder="e.g. Suede Sneaker Restoration Spa"
            {...register("name")}
            className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-2.5 border border-transparent focus:border-primary outline-none"
          />
          {errors.name && <span className="text-xs text-error">{errors.name.message}</span>}
        </div>

        {/* Category & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">Primary Category</label>
            <select
              {...register("category")}
              className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-2.5 border border-transparent focus:border-primary outline-none"
            >
              <option value="laundry">Dry Cleaning & Couture Laundry</option>
              <option value="shoes">Sneaker & Footwear Spa</option>
              <option value="bags">Leather Bags & Luggage</option>
              <option value="helmets">Helmet Sanitization</option>
              <option value="vehicles">Vehicle Steam & Detailing</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">Initial Offering Status</label>
            <select
              {...register("status")}
              className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-2.5 border border-transparent focus:border-primary outline-none"
            >
              <option value="ACTIVE">Active (Accepting Bookings)</option>
              <option value="INACTIVE">Inactive (Hidden from Marketplace)</option>
            </select>
          </div>
        </div>

        {/* Price, Duration, Turnaround SLA */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">Base Price (₹)</label>
            <input
              type="number"
              placeholder="299"
              {...register("price")}
              className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-2.5 border border-transparent focus:border-primary outline-none"
            />
            {errors.price && <span className="text-xs text-error">{errors.price.message}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">Care Cycle (Mins)</label>
            <input
              type="number"
              placeholder="45"
              {...register("durationMinutes")}
              className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-2.5 border border-transparent focus:border-primary outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">Turnaround SLA (Hours)</label>
            <select
              {...register("turnaroundHours")}
              className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-2.5 border border-transparent focus:border-primary outline-none"
            >
              <option value={12}>12h (Same-Day Rush)</option>
              <option value={24}>24h (Standard Express)</option>
              <option value={48}>48h (Specialty Spa)</option>
              <option value={72}>72h (Couture Preservation)</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-on-surface-variant">Treatment Description</label>
          <textarea
            rows={4}
            placeholder="Detailed description of cleaning agents, chemical treatments, and preservation safeguards..."
            {...register("description")}
            className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl p-3.5 border border-transparent focus:border-primary outline-none resize-none"
          />
          {errors.description && (
            <span className="text-xs text-error">{errors.description.message}</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
          <Link
            href="/provider/services"
            className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-variant text-xs font-semibold text-on-surface transition-colors border border-white/5"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary font-bold text-xs transition-all shadow-md shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Saving Service...</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>Save Service Offering</span>
              </>
            )}
          </button>
        </div>
      </form>
    </ProviderCard>
  );
}
