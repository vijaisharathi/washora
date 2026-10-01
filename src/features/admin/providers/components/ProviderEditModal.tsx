"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Shield,
  Layers,
} from "lucide-react";
import {
  Provider,
  ProviderEditFormData,
  providerEditSchema,
  UpdateProviderPayload,
  PROVIDER_SERVICE_CATEGORIES,
} from "@/types/admin";
import { Button } from "@/components/ui/button";

interface ProviderEditModalProps {
  isOpen: boolean;
  provider: Provider | null;
  onClose: () => void;
  onSave: (
    providerId: string,
    payload: UpdateProviderPayload
  ) => Promise<Provider>;
}

export function ProviderEditModal({
  isOpen,
  provider,
  onClose,
  onSave,
}: ProviderEditModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [areasInput, setAreasInput] = useState<string>("");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProviderEditFormData>({
    resolver: zodResolver(providerEditSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      businessName: "",
      city: "",
      serviceCategories: [],
      serviceAreas: [],
    },
  });

  // Populate form when provider opens
  useEffect(() => {
    if (provider) {
      reset({
        fullName: provider.fullName || "",
        email: provider.email || "",
        phone: provider.phone || "",
        businessName: provider.businessName || "",
        city: provider.city || "",
        serviceCategories: provider.serviceCategories || [],
        serviceAreas: provider.serviceAreas || [],
      });
      setAreasInput((provider.serviceAreas || []).join(", "));
      setSubmitError(null);
      setSubmitSuccess(false);
    }
  }, [provider, reset]);

  if (!isOpen || !provider) return null;

  const handleAreasChange = (val: string) => {
    setAreasInput(val);
    const parsed = val
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a.length > 0);
    setValue("serviceAreas", parsed, { shouldDirty: true, shouldValidate: true });
  };

  const onSubmit = async (values: ProviderEditFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      await onSave(provider.id, values);
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        onClose();
      }, 1000);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update provider profile";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Box */}
      <div className="relative bg-surface-container border border-outline-variant rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-surface-variant flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary border border-primary/30 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-on-surface">
                Edit Provider Profile
              </h2>
              <p className="text-xs text-on-surface-variant">
                Modify contact, business entity, categories, and service coverage
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-md transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 overflow-y-auto"
        >
          <div className="p-5 space-y-4">
            {/* Read-only metadata banner */}
            <div className="p-3 rounded-lg bg-surface-container-low border border-surface-variant/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span className="text-outline">Provider ID:</span>
                <span className="font-mono font-bold text-primary">{provider.id}</span>
              </div>
              <div className="flex items-center gap-3">
                <span>
                  <span className="text-outline">Orders:</span>{" "}
                  <strong>{provider.totalBookings}</strong>
                </span>
                <span>
                  <span className="text-outline">Rating:</span>{" "}
                  <strong>
                    {provider.rating > 0 ? `★ ${provider.rating.toFixed(1)}` : "Unrated"}
                  </strong>
                </span>
              </div>
            </div>

            {/* Error & Success alerts */}
            {submitError && (
              <div className="p-3 rounded-lg bg-critical/15 border border-critical/30 text-critical text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}
            {submitSuccess && (
              <div className="p-3 rounded-lg bg-success/15 border border-success/30 text-success text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Provider details updated successfully!</span>
              </div>
            )}

            {/* Full Name & Business Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-on-surface mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant" />
                  <input
                    type="text"
                    {...register("fullName")}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full bg-surface-container-low border border-surface-variant rounded-lg pl-8 pr-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-[11px] text-critical mt-1">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-on-surface mb-1">
                  Business / Trading Name
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant" />
                  <input
                    type="text"
                    {...register("businessName")}
                    placeholder="e.g. Chennai Super Cleaners"
                    className="w-full bg-surface-container-low border border-surface-variant rounded-lg pl-8 pr-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                {errors.businessName && (
                  <p className="text-[11px] text-critical mt-1">
                    {errors.businessName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-on-surface mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant" />
                  <input
                    type="email"
                    {...register("email")}
                    placeholder="e.g. provider@example.com"
                    className="w-full bg-surface-container-low border border-surface-variant rounded-lg pl-8 pr-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-critical mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-on-surface mb-1">
                  Phone Number * (10 digits)
                </label>
                <div className="relative">
                  <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant" />
                  <input
                    type="text"
                    {...register("phone")}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full bg-surface-container-low border border-surface-variant rounded-lg pl-8 pr-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                {errors.phone && (
                  <p className="text-[11px] text-critical mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-medium text-on-surface mb-1">
                City / Operating Base *
              </label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant" />
                <input
                  type="text"
                  {...register("city")}
                  placeholder="e.g. Chennai"
                  className="w-full bg-surface-container-low border border-surface-variant rounded-lg pl-8 pr-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
              {errors.city && (
                <p className="text-[11px] text-critical mt-1">{errors.city.message}</p>
              )}
            </div>

            {/* Service Categories Multi-select */}
            <div>
              <label className="block text-xs font-medium text-on-surface mb-1">
                Authorized Service Categories * (Select at least 1)
              </label>
              <Controller
                name="serviceCategories"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-2 p-3 bg-surface-container-low border border-surface-variant/50 rounded-lg">
                    {PROVIDER_SERVICE_CATEGORIES.map((cat) => {
                      const isChecked = field.value.includes(cat);
                      return (
                        <label
                          key={cat}
                          className="flex items-center gap-2 text-xs text-on-surface cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                field.onChange([...field.value, cat]);
                              } else {
                                field.onChange(
                                  field.value.filter((item) => item !== cat)
                                );
                              }
                            }}
                            className="rounded border-surface-variant text-primary focus:ring-primary"
                          />
                          <span>{cat}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              />
              {errors.serviceCategories && (
                <p className="text-[11px] text-critical mt-1">
                  {errors.serviceCategories.message}
                </p>
              )}
            </div>

            {/* Service Areas */}
            <div>
              <label className="block text-xs font-medium text-on-surface mb-1">
                Service Coverage Areas * (Comma-separated)
              </label>
              <div className="relative">
                <Layers className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant" />
                <input
                  type="text"
                  value={areasInput}
                  onChange={(e) => handleAreasChange(e.target.value)}
                  placeholder="e.g. T. Nagar, Anna Nagar, Adyar, Velachery"
                  className="w-full bg-surface-container-low border border-surface-variant rounded-lg pl-8 pr-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
              <p className="text-[10px] text-outline mt-1">
                Enter locality or postal zones where provider can fulfill orders.
              </p>
              {errors.serviceAreas && (
                <p className="text-[11px] text-critical mt-1">
                  {errors.serviceAreas.message}
                </p>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-surface-variant bg-surface-container-low flex items-center justify-end gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || (!isDirty && areasInput === (provider.serviceAreas || []).join(", "))}
              className="bg-primary text-on-primary text-xs"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
