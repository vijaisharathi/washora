"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Layers,
  ChevronRight,
  ArrowLeft,
  Edit2,
  Info,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Archive,
  Lock,
} from "lucide-react";
import {
  EditServiceFormValues,
  SERVICE_CATEGORIES,
  Service,
  editServiceSchema,
  formatDuration,
} from "@/types/admin/serviceCatalog";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EditServiceFormProps {
  service: Service | null;
  isLoading?: boolean;
  onSubmit: (serviceId: string, payload: EditServiceFormValues) => Promise<Service>;
}

export function EditServiceForm({
  service,
  isLoading = false,
  onSubmit,
}: EditServiceFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<EditServiceFormValues>({
    resolver: zodResolver(editServiceSchema),
    defaultValues: {
      name: "",
      category: "Home Cleaning",
      shortDescription: "",
      description: "",
      basePrice: 0,
      serviceFee: 0,
      durationMinutes: 60,
      minQuantity: 1,
      maxQuantity: 10,
    },
  });

  // Populate form with existing service data
  useEffect(() => {
    if (service) {
      reset({
        name: service.name,
        category: service.category,
        shortDescription: service.shortDescription,
        description: service.description,
        basePrice: service.basePrice,
        serviceFee: service.serviceFee,
        durationMinutes: service.durationMinutes,
        minQuantity: service.minQuantity,
        maxQuantity: service.maxQuantity,
      });
    }
  }, [service, reset]);

  const watchedBasePrice = watch("basePrice");
  const watchedServiceFee = watch("serviceFee");
  const watchedDuration = watch("durationMinutes");
  const watchedShortDesc = watch("shortDescription");
  const watchedDesc = watch("description");

  const safeBasePrice =
    typeof watchedBasePrice === "number" && !isNaN(watchedBasePrice)
      ? watchedBasePrice
      : 0;
  const safeServiceFee =
    typeof watchedServiceFee === "number" && !isNaN(watchedServiceFee)
      ? watchedServiceFee
      : 0;
  const computedDisplayPrice = safeBasePrice + safeServiceFee;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
        <p className="text-xs text-on-surface-variant">
          Loading service editor...
        </p>
      </div>
    );
  }

  // Cross-org isolation / Not found guard
  if (!service) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto py-12">
        <div className="bg-surface-container-low border border-critical/30 rounded-xl p-8 text-center flex flex-col items-center shadow-lg">
          <div className="w-14 h-14 rounded-full bg-critical/15 text-critical flex items-center justify-center mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-on-surface mb-2">
            Service Record Not Found
          </h2>
          <p className="text-xs text-on-surface-variant max-w-md mb-6">
            The requested service identifier does not exist or does not belong to your organization workspace.
          </p>
          <Link
            href="/admin/services"
            className="px-4 py-2 rounded-lg bg-primary text-on-primary font-semibold text-xs flex items-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Services Catalog</span>
          </Link>
        </div>
      </div>
    );
  }

  const isArchived = service.status === "Archived";

  if (isArchived) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto py-12">
        <div className="bg-surface-container-low border border-surface-variant/70 rounded-xl p-8 text-center flex flex-col items-center shadow-lg">
          <div className="w-14 h-14 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center mb-4">
            <Archive className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-on-surface mb-2">
            Archived Service Cannot Be Edited
          </h2>
          <p className="text-xs text-on-surface-variant max-w-md mb-6">
            Service <strong className="font-mono text-on-surface">{service.id}</strong> is archived and permanently locked to preserve catalog audit integrity.
          </p>
          <Link
            href={`/admin/services/${service.id}`}
            className="px-4 py-2 rounded-lg bg-primary text-on-primary font-semibold text-xs flex items-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Service Details</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleFormSubmit = async (values: EditServiceFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const updated = await onSubmit(service.id, values);
      router.push(`/admin/services/${updated.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update service";
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
        <Link
          href={`/admin/services/${service.id}`}
          className="hover:text-primary transition-colors truncate max-w-xs"
        >
          {service.name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 opacity-50" />
        <span className="text-on-surface font-medium">Edit Specifications</span>
      </nav>

      {/* 2. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-low border border-surface-variant/50 p-6 rounded-2xl shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Edit2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-on-surface tracking-tight">
                Edit Catalog Service
              </h1>
              <span className="font-mono text-xs text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                {service.id}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Modify operational service parameters for organization{" "}
              <strong className="font-mono text-primary">{service.organizationId}</strong>.
            </p>
          </div>
        </div>

        <Link
          href={`/admin/services/${service.id}`}
          className="px-3.5 py-2 rounded-xl border border-surface-variant bg-surface-container text-xs font-medium text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Cancel & Return</span>
        </Link>
      </div>

      {/* 3. Form */}
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {submitError && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-xs text-rose-300">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Validation / Update Error</strong>
              <p>{submitError}</p>
            </div>
          </div>
        )}

        {/* Section 1: Basic Classification & Read-only Guards */}
        <div className="bg-surface-container-low border border-surface-variant/50 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-surface-variant/40 pb-3">
            <Info className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-on-surface uppercase tracking-wider">
              1. Basic Classification
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="md:col-span-2 space-y-1.5">
              <label
                htmlFor="service-edit-name"
                className="text-xs font-medium text-on-surface flex items-center justify-between"
              >
                <span>Service Name *</span>
                <span className="text-[10px] text-outline">Customer-facing title</span>
              </label>
              <input
                id="service-edit-name"
                type="text"
                {...register("name")}
                placeholder="Service name"
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
                htmlFor="service-edit-category"
                className="text-xs font-medium text-on-surface block"
              >
                Category *
              </label>
              <select
                id="service-edit-category"
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

            {/* Current Lifecycle Status (Read-only on form, managed via Status Dialog) */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-on-surface block">
                Lifecycle Status (Managed via Action Dialog)
              </label>
              <div className="flex items-center justify-between bg-surface-container/60 border border-surface-variant/60 rounded-xl px-3.5 py-2.5 text-xs">
                <span className="font-semibold text-on-surface">
                  {service.status}
                </span>
                <span className="text-[10px] text-outline flex items-center gap-1">
                  <Lock className="w-3 h-3 text-outline" />
                  Protected
                </span>
              </div>
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
                  htmlFor="service-edit-short-desc"
                  className="text-xs font-medium text-on-surface"
                >
                  Short Summary *
                </label>
                <span className="text-[10px] text-outline">
                  {watchedShortDesc?.length || 0}/200 characters (min 10)
                </span>
              </div>
              <input
                id="service-edit-short-desc"
                type="text"
                {...register("shortDescription")}
                placeholder="Short summary"
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
                  htmlFor="service-edit-desc"
                  className="text-xs font-medium text-on-surface"
                >
                  Detailed Description & Scope of Work *
                </label>
                <span className="text-[10px] text-outline">
                  {watchedDesc?.length || 0}/2000 characters (min 20)
                </span>
              </div>
              <textarea
                id="service-edit-desc"
                rows={4}
                {...register("description")}
                placeholder="Full service description..."
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
                htmlFor="service-edit-base-price"
                className="text-xs font-medium text-on-surface block"
              >
                Base Price (₹) *
              </label>
              <input
                id="service-edit-base-price"
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
                htmlFor="service-edit-fee"
                className="text-xs font-medium text-on-surface block"
              >
                Platform Service Fee (₹) *
              </label>
              <input
                id="service-edit-fee"
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
                htmlFor="service-edit-min-qty"
                className="text-xs font-medium text-on-surface block"
              >
                Minimum Quantity *
              </label>
              <input
                id="service-edit-min-qty"
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
                htmlFor="service-edit-max-qty"
                className="text-xs font-medium text-on-surface block"
              >
                Maximum Quantity *
              </label>
              <input
                id="service-edit-max-qty"
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
                htmlFor="service-edit-duration"
                className="text-xs font-medium text-on-surface block"
              >
                Standard Duration (Minutes) *
              </label>
              <input
                id="service-edit-duration"
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
            href={`/admin/services/${service.id}`}
            className="px-5 py-2.5 rounded-xl border border-surface-variant bg-surface-container text-xs font-medium text-on-surface hover:bg-surface-container-high transition-colors"
          >
            Cancel
          </Link>

          <Button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="px-6 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
