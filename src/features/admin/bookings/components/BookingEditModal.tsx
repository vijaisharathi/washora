"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle2,
  Lock,
  Layers,
} from "lucide-react";
import {
  BookingOrder,
  BookingEditFormValues,
  bookingEditSchema,
} from "@/types/admin";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface BookingEditModalProps {
  isOpen: boolean;
  booking: BookingOrder | null;
  onClose: () => void;
  onSave: (
    bookingId: string,
    payload: BookingEditFormValues
  ) => Promise<BookingOrder>;
}

export function BookingEditModal({
  isOpen,
  booking,
  onClose,
  onSave,
}: BookingEditModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<BookingEditFormValues>({
    resolver: zodResolver(bookingEditSchema),
    defaultValues: {
      scheduledDate: "",
      scheduledTime: "",
      quantity: 1,
      addressLine1: "",
      addressLine2: "",
      area: "",
      city: "",
      state: "",
      postalCode: "",
      landmark: "",
      customerNotes: "",
    },
  });

  // Populate form on opening
  useEffect(() => {
    if (booking && isOpen) {
      let dateStr = "";
      let timeStr = "";

      try {
        const d = new Date(booking.scheduledAt);
        const yyyy = d.getUTCFullYear();
        const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
        const dd = String(d.getUTCDate()).padStart(2, "0");
        const hh = String(d.getUTCHours()).padStart(2, "0");
        const min = String(d.getUTCMinutes()).padStart(2, "0");

        dateStr = `${yyyy}-${mm}-${dd}`;
        timeStr = `${hh}:${min}`;
      } catch {
        dateStr = "2026-09-06";
        timeStr = "10:00";
      }

      reset({
        scheduledDate: dateStr,
        scheduledTime: timeStr,
        quantity: booking.quantity,
        addressLine1: booking.address.addressLine1,
        addressLine2: booking.address.addressLine2 || "",
        area: booking.address.area,
        city: booking.address.city,
        state: booking.address.state,
        postalCode: booking.address.postalCode,
        landmark: booking.address.landmark || "",
        customerNotes: booking.customerNotes || "",
      });

      setSubmitError(null);
      setSubmitSuccess(false);
    }
  }, [booking, isOpen, reset]);

  if (!isOpen || !booking) return null;

  const onSubmit = async (values: BookingEditFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSave(booking.id, values);
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        onClose();
      }, 1000);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update booking.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-booking-title"
    >
      <div className="relative w-full max-w-2xl bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-variant/40 bg-surface-container/30">
          <div>
            <h2
              id="edit-booking-title"
              className="text-lg font-bold text-on-surface"
            >
              Edit Booking Details
            </h2>
            <p className="text-xs text-on-surface-variant font-mono">
              {booking.bookingNumber} • {booking.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto p-6 flex flex-col gap-5"
        >
          {/* Protected Fields Notice */}
          <div className="p-3 rounded-xl bg-surface-container/70 border border-surface-variant/40 flex items-start gap-3">
            <Lock className="w-4 h-4 text-outline mt-0.5 shrink-0" />
            <div className="text-xs text-on-surface-variant">
              <span className="font-semibold text-on-surface">
                Protected Order Attributes:
              </span>{" "}
              Customer ({booking.customerId}), Provider ({booking.providerId}), Service ({booking.serviceName}), Status ({booking.status}), and Total ({formatCurrency(booking.totalAmount)}) are protected from direct manual editing. Status transitions must follow the operational lifecycle workflow.
            </div>
          </div>

          {/* Schedule Section */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-outline flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>Schedule & Service Load</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Date */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-on-surface">
                  Scheduled Date <span className="text-critical">*</span>
                </label>
                <input
                  type="date"
                  {...register("scheduledDate")}
                  className="bg-surface-container border border-surface-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
                {errors.scheduledDate && (
                  <span className="text-[11px] text-critical">
                    {errors.scheduledDate.message}
                  </span>
                )}
              </div>

              {/* Time */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-on-surface">
                  Scheduled Time <span className="text-critical">*</span>
                </label>
                <input
                  type="time"
                  {...register("scheduledTime")}
                  className="bg-surface-container border border-surface-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
                {errors.scheduledTime && (
                  <span className="text-[11px] text-critical">
                    {errors.scheduledTime.message}
                  </span>
                )}
              </div>

              {/* Quantity */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-on-surface">
                  Quantity Units <span className="text-critical">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  {...register("quantity", { valueAsNumber: true })}
                  className="bg-surface-container border border-surface-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
                {errors.quantity && (
                  <span className="text-[11px] text-critical">
                    {errors.quantity.message}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-outline flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>Fulfillment Address</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Address Line 1 */}
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-xs font-medium text-on-surface">
                  Address Line 1 <span className="text-critical">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Street address, building, floor"
                  {...register("addressLine1")}
                  className="bg-surface-container border border-surface-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
                {errors.addressLine1 && (
                  <span className="text-[11px] text-critical">
                    {errors.addressLine1.message}
                  </span>
                )}
              </div>

              {/* Address Line 2 */}
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-xs font-medium text-on-surface">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Suite, apartment, landmark details"
                  {...register("addressLine2")}
                  className="bg-surface-container border border-surface-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              {/* Area */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-on-surface">
                  Area / Locality <span className="text-critical">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Anna Nagar"
                  {...register("area")}
                  className="bg-surface-container border border-surface-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
                {errors.area && (
                  <span className="text-[11px] text-critical">
                    {errors.area.message}
                  </span>
                )}
              </div>

              {/* City */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-on-surface">
                  City <span className="text-critical">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chennai"
                  {...register("city")}
                  className="bg-surface-container border border-surface-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
                {errors.city && (
                  <span className="text-[11px] text-critical">
                    {errors.city.message}
                  </span>
                )}
              </div>

              {/* State */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-on-surface">
                  State <span className="text-critical">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tamil Nadu"
                  {...register("state")}
                  className="bg-surface-container border border-surface-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
                {errors.state && (
                  <span className="text-[11px] text-critical">
                    {errors.state.message}
                  </span>
                )}
              </div>

              {/* Postal Code */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-on-surface">
                  PIN Code <span className="text-critical">*</span>
                </label>
                <input
                  type="text"
                  placeholder="6-digit PIN code (e.g. 600040)"
                  {...register("postalCode")}
                  className="bg-surface-container border border-surface-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                />
                {errors.postalCode && (
                  <span className="text-[11px] text-critical">
                    {errors.postalCode.message}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-outline flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-primary" />
              <span>Special Customer Notes</span>
            </h3>
            <textarea
              rows={3}
              placeholder="Any operational requests or instructions..."
              {...register("customerNotes")}
              className="bg-surface-container border border-surface-variant rounded-lg p-3 text-xs text-on-surface focus:outline-none focus:border-primary resize-none"
            />
            {errors.customerNotes && (
              <span className="text-[11px] text-critical">
                {errors.customerNotes.message}
              </span>
            )}
          </div>

          {/* Feedback Status */}
          {submitError && (
            <div className="p-3 rounded-lg bg-critical/10 border border-critical/30 flex items-center gap-2 text-xs text-critical">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {submitSuccess && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-500">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Booking details saved successfully!</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-variant/40 mt-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="border-surface-variant hover:bg-surface-container text-on-surface text-xs"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !isDirty}
              className="bg-primary hover:bg-primary/90 text-on-primary text-xs font-semibold"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
