"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
  PlayCircle,
  Ban,
  Bike,
} from "lucide-react";
import {
  DeliveryPartner,
  DeliveryPartnerStatus,
  UpdateDeliveryPartnerStatusPayload,
} from "@/types/admin";
import { Button } from "@/components/ui/button";

interface DeliveryPartnerStatusModalProps {
  isOpen: boolean;
  deliveryPartner: DeliveryPartner | null;
  onClose: () => void;
  onConfirmStatus: (
    partnerId: string,
    payload: UpdateDeliveryPartnerStatusPayload
  ) => Promise<DeliveryPartner>;
}

export function DeliveryPartnerStatusModal({
  isOpen,
  deliveryPartner,
  onClose,
  onConfirmStatus,
}: DeliveryPartnerStatusModalProps) {
  const [selectedStatus, setSelectedStatus] =
    useState<DeliveryPartnerStatus>("active");
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (deliveryPartner) {
      setSelectedStatus(deliveryPartner.status);
      setReason("");
      setError(null);
      setSuccess(false);
    }
  }, [deliveryPartner]);

  if (!isOpen || !deliveryPartner) return null;

  const handleConfirm = async () => {
    if (selectedStatus === deliveryPartner.status) {
      onClose();
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onConfirmStatus(deliveryPartner.id, {
        status: selectedStatus,
        reason: reason.trim() || undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1000);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to update delivery partner status";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSuspended = selectedStatus === "suspended";
  const isInactive = selectedStatus === "inactive";
  const isActive = selectedStatus === "active";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative bg-surface-container border border-outline-variant rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-surface-variant flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                isSuspended
                  ? "bg-critical/20 text-critical border-critical/30"
                  : isInactive
                  ? "bg-surface-container-highest text-outline border-surface-variant"
                  : "bg-success/20 text-success border-success/30"
              }`}
            >
              {isSuspended ? (
                <ShieldAlert className="w-4 h-4" />
              ) : isInactive ? (
                <PauseCircle className="w-4 h-4" />
              ) : (
                <PlayCircle className="w-4 h-4" />
              )}
            </div>
            <div>
              <h2 className="text-base font-semibold text-on-surface">
                Change Partner Operational Status
              </h2>
              <p className="text-xs text-on-surface-variant font-mono">
                {deliveryPartner.id} • {deliveryPartner.fullName}
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

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-critical/15 border border-critical/30 text-critical flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3 rounded-lg bg-success/15 border border-success/30 text-success flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                Partner status changed to {selectedStatus.toUpperCase()}!
              </span>
            </div>
          )}

          {/* Current Status Pill */}
          <div className="p-3 rounded-lg bg-surface-container-low border border-surface-variant/40 flex items-center justify-between">
            <span className="text-outline">Current Operational Status:</span>
            <span
              className={`inline-flex items-center gap-1 font-semibold text-[11px] px-2 py-0.5 rounded-full ${
                deliveryPartner.status === "active"
                  ? "bg-success/15 text-success"
                  : deliveryPartner.status === "suspended"
                  ? "bg-critical/15 text-critical"
                  : "bg-surface-container-highest text-on-surface-variant"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {deliveryPartner.status.toUpperCase()}
            </span>
          </div>

          {/* Status Selection Options */}
          <div>
            <label className="block text-xs font-medium text-on-surface mb-2">
              Select New Operational Status *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedStatus("active")}
                className={`p-3 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                  selectedStatus === "active"
                    ? "bg-success/15 border-success text-success ring-1 ring-success"
                    : "bg-surface-container-low border-surface-variant text-on-surface hover:bg-surface-container-high"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>Active</span>
                </div>
                <span className="text-[10px] opacity-80">
                  Ready for dispatches
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus("inactive")}
                className={`p-3 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                  selectedStatus === "inactive"
                    ? "bg-outline-variant/30 border-outline text-on-surface ring-1 ring-outline"
                    : "bg-surface-container-low border-surface-variant text-on-surface hover:bg-surface-container-high"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <PauseCircle className="w-3.5 h-3.5" />
                  <span>Inactive</span>
                </div>
                <span className="text-[10px] opacity-80">
                  Temporarily paused
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus("suspended")}
                className={`p-3 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                  selectedStatus === "suspended"
                    ? "bg-critical/15 border-critical text-critical ring-1 ring-critical"
                    : "bg-surface-container-low border-surface-variant text-on-surface hover:bg-surface-container-high"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <Ban className="w-3.5 h-3.5" />
                  <span>Suspended</span>
                </div>
                <span className="text-[10px] opacity-80">
                  Barred for violations
                </span>
              </button>
            </div>
          </div>

          {/* Consequence Explanation Banner */}
          <div
            className={`p-3 rounded-lg border text-[11px] leading-relaxed ${
              isSuspended
                ? "bg-critical/10 border-critical/30 text-on-surface"
                : isInactive
                ? "bg-warning/10 border-warning/30 text-on-surface"
                : "bg-success/10 border-success/30 text-on-surface"
            }`}
          >
            {isSuspended ? (
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-critical shrink-0 mt-0.5" />
                <div>
                  <strong className="text-critical block font-semibold mb-0.5">
                    Critical Security Impact:
                  </strong>
                  Suspension immediately forces the delivery partner offline, blocks mobile app session authentication, and revokes active assignment privileges.
                </div>
              </div>
            ) : isInactive ? (
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                <div>
                  <strong className="text-warning block font-semibold mb-0.5">
                    Operational Notice:
                  </strong>
                  The rider will be taken offline and will not receive any pickup/delivery dispatch requests until marked active.
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                <div>
                  <strong className="text-success block font-semibold mb-0.5">
                    Fleet Notice:
                  </strong>
                  Partner will be active and able to toggle online in their assigned coverage zones.
                </div>
              </div>
            )}
          </div>

          {/* Reason Field */}
          <div>
            <label className="block text-xs font-medium text-on-surface mb-1">
              Audit Note / Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                isSuspended
                  ? "e.g. Repeated delivery delays, customer dispute, or policy violation."
                  : isInactive
                  ? "e.g. Partner requested temporary leave or vehicle maintenance."
                  : "e.g. Identity verified and cleared for dispatch."
              }
              rows={2}
              className="w-full bg-surface-container-low border border-surface-variant rounded-lg p-2.5 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-surface-variant bg-surface-container-low flex items-center justify-end gap-2">
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
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting || selectedStatus === deliveryPartner.status}
            className={`text-xs ${
              isSuspended
                ? "bg-critical text-on-error hover:bg-critical/90"
                : isInactive
                ? "bg-surface-container-highest text-on-surface hover:bg-surface-container-high border border-surface-variant"
                : "bg-success text-on-primary hover:bg-success/90"
            }`}
          >
            {isSubmitting
              ? "Updating..."
              : `Confirm ${selectedStatus.toUpperCase()}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
