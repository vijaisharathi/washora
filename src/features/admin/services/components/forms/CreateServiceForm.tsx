"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Layers,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Info,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sliders,
} from "lucide-react";
import {
  CreateServiceFormValues,
  SERVICE_CATEGORIES,
  ServiceCategory,
  createServiceSchema,
  formatDuration,
} from "@/types/admin/serviceCatalog";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CreateServiceFormProps {
  organizationId: string;
  onSubmit: (payload: CreateServiceFormValues) => Promise<import("@/types/admin/serviceCatalog").Service>;
}

export function CreateServiceForm({
  organizationId,
  onSubmit,
}: CreateServiceFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateServiceFormValues>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      name: "",
      category: "Home Cleaning",
      shortDescription: "",
      description: "",
      basePrice: 499,
      serviceFee: 50,
      durationMinutes: 60,
      minQuantity: 1,
      maxQuantity: 10,
      status: "Active",
    },
  });

  const watchedBasePrice = watch("basePrice");
  const watchedServiceFee = watch("serviceFee");
  const watchedDuration = watch("durationMinutes");
  const watchedShortDesc = watch("shortDescription");
  const watchedDesc = watch("description");

  const safeBasePrice = typeof watchedBasePrice === "number" && !isNaN(watchedBasePrice) ? watchedBasePrice : 0;
  const safeServiceFee = typeof watchedServiceFee === "number" && !isNaN(watchedServiceFee) ? watchedServiceFee : 0;
  const computedDisplayPrice = safeBasePrice + safeServiceFee;

  const handleFormSubmit = async (values: CreateServiceFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const created = await onSubmit(values);
      router.push(`/admin/services/${created.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create service";
      setSubmitError(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-16">
      {/* 1. Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs text-outline"
      >
        <Link
          href="/admin/services"
          className="hover:text-primary transition-colors flex items-center gap-1"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Services Catalog</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 opacity-50" />
        <span className="text-on-surface font-medium">Create New Service</span>
      </nav>

      {/* 2. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-low border border-surface-variant/50 p-6 rounded-2xl shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-on-surface tracking-tight">
              Create New Catalog Service
            </h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Add a new operational service specification to organization{" "}
              <strong className="font-mono text-primary">{organizationId}</strong>.
            </p>
          </div>
        </div>

        <Link
          href="/admin/services"
          className="px-3.5 py-2 rounded-xl border border-surface-variant bg-surface-container text-xs font-medium text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Catalog</span>
        </Link>
      </div>

      {/* 3. Form */}
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {submitError && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-xs text-rose-300">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Validation / Submission Error</strong>
              <p>{submitError}</p>
            </div>
          </div>
        )}

        {/* Section 1: Basic Classification */}
        <div className="bg-surface-container-low border border-surface-variant/50 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-surface-variant/40 pb-3">
            <Info className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-on-surface uppercase tracking-wider">
              1. Basic Classification & Status
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="md:col-span-2 space-y-1.5">
              <label
                htmlFor="service-name"
                className="text-xs font-medium text-on-surface flex items-center justify-between"
              >
                <span>Service Name *</span>
                <span className="text-[10px] text-outline">Customer-facing title</span>
              </label>
              <input
                id="service-name"
                type="text"
                {...register("name")}
                placeholder="E.g., Deep Kitchen Degreasing & Sanitization"
                className={`w-full bg-surface-container border rounded-xl px-3.5 py-2.5 text-xs text-on-surface placeholder:text-outline/60 focus:outline-none focus:border-primary transition-colors ${
                  errors.name ? "border-rose-500" : "border-surface-variant"
                }`}
              />
              {errors.name && (
                <p className="text-[11px] text-rose-400 font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label
                htmlFor="service-category"
                className="text-xs font-medium text-on-surface block"
              >
                Category *
              </label>
              <select
                id="service-category"
                {...register("category")}
                className={`w-full bg-surface-container border rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary transition-colors ${
                  errors.category ? "border-rose-500" : "border-surface-variant"
                }`}
              >
                {SERVICE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-[11px] text-rose-400 font-medium">
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label
                htmlFor="service-status"
                className="text-xs font-medium text-on-surface block"
              >
                Initial Lifecycle Status *
              </label>
              <select
                id="service-status"
                {...register("status")}
                className={`w-full bg-surface-container border rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary transition-colors ${
                  errors.status ? "border-rose-500" : "border-surface-variant"
                }`}
              >
                <option value="Active">Active (Publish for Discovery)</option>
                <option value="Inactive">Inactive (Draft / Hidden)</option>
              </select>
              {errors.status && (
                <p className="text-[11px] text-rose-400 font-medium">
                  {errors.status.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Descriptions */}
        <div className="bg-surface-container-low border border-surface-variant/50 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-surface-variant/40 pb-3">
            <Layers className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-semibold text-on-surface uppercase tracking-wider">
              2. Catalog Descriptions
            </h2>
          </div>

          <div className="space-y-4">
            {/* Short Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="service-short-desc"
                  className="text-xs font-medium text-on-surface"
                >
                  Short Summary *
                </label>
                <span className="text-[10px] text-outline">
                  {watchedShortDesc?.length || 0}/200 characters (min 10)
                </span>
              </div>
              <input
                id="service-short-desc"
                type="text"
                {...register("shortDescription")}
                placeholder="E.g., Complete kitchen surface scrub, hob degreasing, and chimney filter cleaning."
                className={`w-full bg-surface-container border rounded-xl px-3.5 py-2.5 text-xs text-on-surface placeholder:text-outline/60 focus:outline-none focus:border-primary transition-colors ${
                  errors.shortDescription ? "border-rose-500" : "border-surface-variant"
                }`}
              />
              {errors.shortDescription && (
                <p className="text-[11px] text-rose-400 font-medium">
                  {errors.shortDescription.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="service-desc"
                  className="text-xs font-medium text-on-surface"
                >
                  Detailed Description & Scope of Work *
                </label>
                <span className="text-[10px] text-outline">
                  {watchedDesc?.length || 0}/2000 characters (min 20)
                </span>
              </div>
              <textarea
                id="service-desc"
                rows={4}
                {...register("description")}
                placeholder="Provide complete breakdown of tasks performed, materials provided, customer preparation needed, and standard guarantees..."
                className={`w-full bg-surface-container border rounded-xl p-3.5 text-xs text-on-surface placeholder:text-outline/60 focus:outline-none focus:border-primary transition-colors resize-y ${
                  errors.description ? "border-rose-500" : "border-surface-variant"
                }`}
              />
              {errors.description && (
                <p className="text-[11px] text-rose-400 font-medium">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Pricing & Quantities */}
        <div className="bg-surface-container-low border border-surface-variant/50 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-surface-variant/40 pb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-on-surface uppercase tracking-wider">
                3. Pricing & Quantity Bounds
              </h2>
            </div>
            <span className="text-[11px] text-outline font-mono">Currency: INR (₹)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Base Price */}
            <div className="space-y-1.5">
              <label
                htmlFor="service-base-price"
                className="text-xs font-medium text-on-surface block"
              >
                Base Price (₹) *
              </label>
              <input
                id="service-base-price"
                type="number"
                step="1"
                min="1"
                {...register("basePrice", { valueAsNumber: true })}
                className={`w-full bg-surface-container border rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary transition-colors ${
                  errors.basePrice ? "border-rose-500" : "border-surface-variant"
                }`}
              />
              {errors.basePrice && (
                <p className="text-[11px] text-rose-400 font-medium">
                  {errors.basePrice.message}
                </p>
              )}
            </div>

            {/* Service Fee */}
            <div className="space-y-1.5">
              <label
                htmlFor="service-fee"
                className="text-xs font-medium text-on-surface block"
              >
                Platform Service Fee (₹) *
              </label>
              <input
                id="service-fee"
                type="number"
                step="1"
                min="0"
                {...register("serviceFee", { valueAsNumber: true })}
                className={`w-full bg-surface-container border rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary transition-colors ${
                  errors.serviceFee ? "border-rose-500" : "border-surface-variant"
                }`}
              />
              {errors.serviceFee && (
                <p className="text-[11px] text-rose-400 font-medium">
                  {errors.serviceFee.message}
                </p>
              )}
            </div>

            {/* Computed Customer Display Price Preview */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-semibold text-emerald-400">
                Customer Display Price
              </span>
              <span className="text-xl font-extrabold text-emerald-400">
                {formatCurrency(computedDisplayPrice)}
              </span>
              <span className="text-[10px] text-emerald-400/80">
                Base ({formatCurrency(safeBasePrice)}) + Fee ({formatCurrency(safeServiceFee)})
              </span>
            </div>

            {/* Min Quantity */}
            <div className="space-y-1.5">
              <label
                htmlFor="service-min-qty"
                className="text-xs font-medium text-on-surface block"
              >
                Minimum Quantity *
              </label>
              <input
                id="service-min-qty"
                type="number"
                min="1"
                {...register("minQuantity", { valueAsNumber: true })}
                className={`w-full bg-surface-container border rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary transition-colors ${
                  errors.minQuantity ? "border-rose-500" : "border-surface-variant"
                }`}
              />
              {errors.minQuantity && (
                <p className="text-[11px] text-rose-400 font-medium">
                  {errors.minQuantity.message}
                </p>
              )}
            </div>

            {/* Max Quantity */}
            <div className="space-y-1.5 sm:col-span-2 md:col-span-2">
              <label
                htmlFor="service-max-qty"
                className="text-xs font-medium text-on-surface block"
              >
                Maximum Quantity *
              </label>
              <input
                id="service-max-qty"
                type="number"
                min="1"
                {...register("maxQuantity", { valueAsNumber: true })}
                className={`w-full bg-surface-container border rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary transition-colors ${
                  errors.maxQuantity ? "border-rose-500" : "border-surface-variant"
                }`}
              />
              {errors.maxQuantity && (
                <p className="text-[11px] text-rose-400 font-medium">
                  {errors.maxQuantity.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Operational Configuration */}
        <div className="bg-surface-container-low border border-surface-variant/50 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-surface-variant/40 pb-3">
            <Sliders className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-semibold text-on-surface uppercase tracking-wider">
              4. Operational Duration & Scheduling
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Duration Minutes */}
            <div className="space-y-1.5">
              <label
                htmlFor="service-duration"
                className="text-xs font-medium text-on-surface block"
              >
                Standard Duration (Minutes) *
              </label>
              <input
                id="service-duration"
                type="number"
                step="5"
                min="15"
                {...register("durationMinutes", { valueAsNumber: true })}
                className={`w-full bg-surface-container border rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary transition-colors ${
                  errors.durationMinutes ? "border-rose-500" : "border-surface-variant"
                }`}
              />
              {errors.durationMinutes && (
                <p className="text-[11px] text-rose-400 font-medium">
                  {errors.durationMinutes.message}
                </p>
              )}
            </div>

            {/* Duration Human Readable Display */}
            <div className="p-3.5 rounded-xl bg-surface-container border border-surface-variant/50 flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary shrink-0" />
              <div>
                <span className="text-[10px] text-outline uppercase block font-semibold">
                  Formatted Duration
                </span>
                <span className="text-base font-bold text-on-surface">
                  {formatDuration(
                    typeof watchedDuration === "number" && !isNaN(watchedDuration)
                      ? watchedDuration
                      : 60
                  )}
                </span>
                <span className="text-[10px] text-outline block">
                  Minimum job duration is 15 minutes.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href="/admin/services"
            className="px-5 py-2.5 rounded-xl border border-surface-variant bg-surface-container text-xs font-medium text-on-surface hover:bg-surface-container-high transition-colors"
          >
            Cancel
          </Link>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating Service...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Create Service</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
