"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, User, Mail, Phone, MapPin, Shield, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Customer,
  CustomerEditFormData,
  customerEditSchema,
  UpdateCustomerPayload,
} from "@/types/admin";
import { Button } from "@/components/ui/button";

interface CustomerEditModalProps {
  isOpen: boolean;
  customer: Customer | null;
  onClose: () => void;
  onSave: (
    customerId: string,
    payload: UpdateCustomerPayload
  ) => Promise<Customer>;
}

export function CustomerEditModal({
  isOpen,
  customer,
  onClose,
  onSave,
}: CustomerEditModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<CustomerEditFormData>({
    resolver: zodResolver(customerEditSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      city: "",
    },
  });

  // Populate form with customer details when opened
  useEffect(() => {
    if (customer) {
      reset({
        fullName: customer.fullName || "",
        email: customer.email || "",
        phone: customer.phone || "",
        city: customer.city || "",
      });
      setSubmitError(null);
      setSubmitSuccess(false);
    }
  }, [customer, reset]);

  if (!isOpen || !customer) return null;

  const onSubmit = async (values: CustomerEditFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      await onSave(customer.id, values);
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        onClose();
      }, 1000);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update customer profile";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Box */}
      <div className="relative bg-surface-container border border-outline-variant rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-surface-variant flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary border border-primary/30 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-headline-md text-base font-bold text-on-surface">
                Edit Customer Profile
              </h2>
              <p className="text-xs text-on-surface-variant font-mono">
                {customer.id} • {customer.organizationId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback Alerts */}
        {submitError && (
          <div className="mx-5 mt-4 p-3 rounded-lg bg-critical/15 border border-critical/30 text-critical text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {submitSuccess && (
          <div className="mx-5 mt-4 p-3 rounded-lg bg-success/15 border border-success/30 text-success text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Customer profile updated successfully!</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          {/* Readonly Identity Notice */}
          <div className="p-3 rounded-lg bg-surface-container-low border border-surface-variant/40 text-[11px] text-on-surface-variant flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary shrink-0" />
            <span>
              Customer ID, Account Age, and Spending History are immutable audit metrics and cannot be edited.
            </span>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              Full Name <span className="text-critical">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input
                type="text"
                {...register("fullName")}
                placeholder="e.g. Aarav Sharma"
                className="w-full bg-surface-container-low border border-surface-variant rounded-lg pl-9 pr-3 py-2 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary"
              />
            </div>
            {errors.fullName && (
              <p className="text-[11px] text-critical mt-1">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              Email Address <span className="text-critical">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input
                type="email"
                {...register("email")}
                placeholder="e.g. aarav.s@example.com"
                className="w-full bg-surface-container-low border border-surface-variant rounded-lg pl-9 pr-3 py-2 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary"
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-critical mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              Mobile Phone <span className="text-critical">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input
                type="text"
                {...register("phone")}
                placeholder="e.g. +91 9876543210"
                className="w-full bg-surface-container-low border border-surface-variant rounded-lg pl-9 pr-3 py-2 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary"
              />
            </div>
            {errors.phone && (
              <p className="text-[11px] text-critical mt-1">{errors.phone.message}</p>
            )}
          </div>

          {/* City / Service Zone */}
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              City / Zone <span className="text-critical">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input
                type="text"
                {...register("city")}
                placeholder="e.g. Chennai"
                className="w-full bg-surface-container-low border border-surface-variant rounded-lg pl-9 pr-3 py-2 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary"
              />
            </div>
            {errors.city && (
              <p className="text-[11px] text-critical mt-1">{errors.city.message}</p>
            )}
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-surface-variant flex items-center justify-end gap-3">
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
              disabled={isSubmitting || !isDirty}
              className="bg-primary text-on-primary font-semibold text-xs"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
