"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Bike,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import {
  DeliveryPartner,
  DeliveryPartnerEditFormData,
  deliveryPartnerEditSchema,
  UpdateDeliveryPartnerPayload,
  VEHICLE_TYPES,
  VehicleType,
} from "@/types/admin";
import { Button } from "@/components/ui/button";

interface DeliveryPartnerEditModalProps {
  isOpen: boolean;
  deliveryPartner: DeliveryPartner | null;
  onClose: () => void;
  onSave: (
    partnerId: string,
    payload: UpdateDeliveryPartnerPayload
  ) => Promise<DeliveryPartner>;
}

const VEHICLE_LABELS: Record<VehicleType, string> = {
  bike: "Motorcycle / Bike",
  scooter: "Scooter",
  electric_bike: "Electric Bike (EV)",
  three_wheeler: "Three Wheeler / Auto",
  van: "Van / Cargo Minivan",
};

export function DeliveryPartnerEditModal({
  isOpen,
  deliveryPartner,
  onClose,
  onSave,
}: DeliveryPartnerEditModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [areasInput, setAreasInput] = useState<string>("");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<DeliveryPartnerEditFormData>({
    resolver: zodResolver(deliveryPartnerEditSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      vehicleType: "bike",
      vehicleNumber: "",
      city: "",
      serviceAreas: [],
    },
  });

  // Populate form when modal opens with delivery partner
  useEffect(() => {
    if (deliveryPartner) {
      reset({
        fullName: deliveryPartner.fullName || "",
        email: deliveryPartner.email || "",
        phone: deliveryPartner.phone || "",
        vehicleType: deliveryPartner.vehicleType || "bike",
        vehicleNumber: deliveryPartner.vehicleNumber || "",
        city: deliveryPartner.city || "",
        serviceAreas: deliveryPartner.serviceAreas || [],
      });
      setAreasInput((deliveryPartner.serviceAreas || []).join(", "));
      setSubmitError(null);
      setSubmitSuccess(false);
    }
  }, [deliveryPartner, reset]);

  if (!isOpen || !deliveryPartner) return null;

  const handleAreasChange = (val: string) => {
    setAreasInput(val);
    const parsed = val
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a.length > 0);
    setValue("serviceAreas", parsed, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onSubmit = async (values: DeliveryPartnerEditFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      await onSave(deliveryPartner.id, values);
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        onClose();
      }, 1000);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to update delivery partner profile";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-surface-container-low border border-surface-variant rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-surface-variant flex items-center justify-between bg-surface-container/50">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-on-surface">
                Edit Delivery Partner Profile
              </h2>
              <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                {deliveryPartner.id}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Update rider credentials, vehicle details, and operational coverage zones.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto p-5 space-y-4">
          {submitError && (
            <div className="p-3 bg-critical/10 border border-critical/30 rounded-lg flex items-center gap-2 text-xs text-critical">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {submitSuccess && (
            <div className="p-3 bg-success/10 border border-success/30 rounded-lg flex items-center gap-2 text-xs text-success">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Partner profile updated successfully.</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-medium text-on-surface mb-1">
              Full Legal Name <span className="text-critical">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                {...register("fullName")}
                type="text"
                placeholder="Rider's full name"
                className="w-full bg-surface-container border border-surface-variant rounded-lg pl-9 pr-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
            {errors.fullName && (
              <p className="text-[11px] text-critical mt-1">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Contact Fields: Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-on-surface mb-1">
                Email Address <span className="text-critical">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="rider@domain.com"
                  className="w-full bg-surface-container border border-surface-variant rounded-lg pl-9 pr-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
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
                Mobile Number <span className="text-critical">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  {...register("phone")}
                  type="tel"
                  placeholder="+91 9876543210"
                  className="w-full bg-surface-container border border-surface-variant rounded-lg pl-9 pr-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
              {errors.phone && (
                <p className="text-[11px] text-critical mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          {/* Vehicle Fields: Vehicle Type & Registration Plate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-on-surface mb-1">
                Vehicle Type <span className="text-critical">*</span>
              </label>
              <div className="relative">
                <Bike className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  {...register("vehicleType")}
                  className="w-full bg-surface-container border border-surface-variant rounded-lg pl-9 pr-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                >
                  {VEHICLE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {VEHICLE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>
              {errors.vehicleType && (
                <p className="text-[11px] text-critical mt-1">
                  {errors.vehicleType.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-on-surface mb-1">
                Vehicle Plate Number <span className="text-critical">*</span>
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  {...register("vehicleNumber")}
                  type="text"
                  placeholder="e.g. TN 01 AB 1234"
                  className="w-full bg-surface-container border border-surface-variant rounded-lg pl-9 pr-3 py-2 text-xs text-on-surface uppercase font-mono focus:outline-none focus:border-primary"
                />
              </div>
              {errors.vehicleNumber && (
                <p className="text-[11px] text-critical mt-1">
                  {errors.vehicleNumber.message}
                </p>
              )}
            </div>
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-medium text-on-surface mb-1">
              Primary City <span className="text-critical">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                {...register("city")}
                type="text"
                placeholder="e.g. Chennai"
                className="w-full bg-surface-container border border-surface-variant rounded-lg pl-9 pr-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
            {errors.city && (
              <p className="text-[11px] text-critical mt-1">
                {errors.city.message}
              </p>
            )}
          </div>

          {/* Service Areas (Comma separated) */}
          <div>
            <label className="block text-xs font-medium text-on-surface mb-1">
              Assigned Hubs & Service Areas <span className="text-critical">*</span>
            </label>
            <textarea
              value={areasInput}
              onChange={(e) => handleAreasChange(e.target.value)}
              placeholder="e.g. T. Nagar, Nungambakkam, Kodambakkam (comma-separated)"
              rows={2}
              className="w-full bg-surface-container border border-surface-variant rounded-lg p-3 text-xs text-on-surface focus:outline-none focus:border-primary"
            />
            <p className="text-[11px] text-outline mt-0.5">
              Enter delivery hub names or operational neighborhoods separated by commas.
            </p>
            {errors.serviceAreas && (
              <p className="text-[11px] text-critical mt-1">
                {errors.serviceAreas.message}
              </p>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-surface-variant flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="text-xs bg-primary text-primary-inverse hover:bg-primary-dim"
            >
              {isSubmitting ? "Saving Changes..." : "Save Partner Profile"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
