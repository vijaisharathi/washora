"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Bike,
  FileCheck,
} from "lucide-react";
import {
  DeliveryPartner,
  DeliveryPartnerApprovalStatus,
  UpdateDeliveryPartnerApprovalPayload,
} from "@/types/admin";
import { Button } from "@/components/ui/button";

interface DeliveryPartnerApprovalModalProps {
  isOpen: boolean;
  deliveryPartner: DeliveryPartner | null;
  onClose: () => void;
  onConfirmApproval: (
    partnerId: string,
    payload: UpdateDeliveryPartnerApprovalPayload
  ) => Promise<DeliveryPartner>;
}

export function DeliveryPartnerApprovalModal({
  isOpen,
  deliveryPartner,
  onClose,
  onConfirmApproval,
}: DeliveryPartnerApprovalModalProps) {
  const [selectedApproval, setSelectedApproval] =
    useState<"approved" | "rejected">("approved");
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (deliveryPartner) {
      setSelectedApproval(
        deliveryPartner.approvalStatus === "rejected" ? "rejected" : "approved"
      );
      setReason("");
      setError(null);
      setSuccess(false);
    }
  }, [deliveryPartner]);

  if (!isOpen || !deliveryPartner) return null;

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      await onConfirmApproval(deliveryPartner.id, {
        approvalStatus: selectedApproval,
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
          : "Failed to update delivery partner verification status";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isApprove = selectedApproval === "approved";

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
                isApprove
                  ? "bg-primary/20 text-primary border-primary/30"
                  : "bg-critical/20 text-critical border-critical/30"
              }`}
            >
              {isApprove ? (
                <FileCheck className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
            </div>
            <div>
              <h2 className="text-base font-semibold text-on-surface">
                Review Rider Application
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
                Application {selectedApproval.toUpperCase()} successfully!
              </span>
            </div>
          )}

          {/* Current Status Pill */}
          <div className="p-3 rounded-lg bg-surface-container-low border border-surface-variant/40 flex items-center justify-between">
            <span className="text-outline">Current Verification:</span>
            <span
              className={`inline-flex items-center gap-1 font-semibold text-[11px] px-2 py-0.5 rounded-full ${
                deliveryPartner.approvalStatus === "approved"
                  ? "bg-success/15 text-success"
                  : deliveryPartner.approvalStatus === "rejected"
                  ? "bg-critical/15 text-critical"
                  : "bg-warning/15 text-warning"
              }`}
            >
              <Clock className="w-3 h-3" />
              {deliveryPartner.approvalStatus.toUpperCase()}
            </span>
          </div>

          {/* Decision Selection Options */}
          <div>
            <label className="block text-xs font-medium text-on-surface mb-2">
              Verification Decision *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedApproval("approved")}
                className={`p-3 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                  selectedApproval === "approved"
                    ? "bg-primary/15 border-primary text-primary ring-1 ring-primary"
                    : "bg-surface-container-low border-surface-variant text-on-surface hover:bg-surface-container-high"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve</span>
                </div>
                <span className="text-[10px] opacity-80">
                  Activates rider for active dispatch
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedApproval("rejected")}
                className={`p-3 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                  selectedApproval === "rejected"
                    ? "bg-critical/15 border-critical text-critical ring-1 ring-critical"
                    : "bg-surface-container-low border-surface-variant text-on-surface hover:bg-surface-container-high"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </div>
                <span className="text-[10px] opacity-80">
                  Declines onboard application & marks inactive
                </span>
              </button>
            </div>
          </div>

          {/* Consequence Explanation Banner */}
          <div
            className={`p-3 rounded-lg border text-[11px] leading-relaxed ${
              isApprove
                ? "bg-primary/10 border-primary/25 text-on-surface"
                : "bg-critical/10 border-critical/25 text-on-surface"
            }`}
          >
            {isApprove ? (
              <p>
                <strong>Operational Impact:</strong> Approving this application
                will mark the delivery partner as verified and set their operational
                status to <strong>ACTIVE</strong>. They will immediately become eligible
                for pickup and delivery task dispatches in their assigned zones.
              </p>
            ) : (
              <p>
                <strong>Operational Impact:</strong> Rejecting will set the
                delivery partner to <strong>INACTIVE</strong>. The rider cannot
                accept delivery jobs or go online in the mobile app.
              </p>
            )}
          </div>

          {/* Audit Reason Field */}
          <div>
            <label className="block text-xs font-medium text-on-surface mb-1">
              Audit Note / Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                isApprove
                  ? "e.g. Driving license, RC book, and background verification cleared."
                  : "e.g. Expired driving license or missing insurance documents."
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
            disabled={isSubmitting}
            className={`text-xs ${
              isApprove
                ? "bg-primary text-primary-inverse hover:bg-primary-dim"
                : "bg-critical text-on-error hover:bg-critical/90"
            }`}
          >
            {isSubmitting
              ? "Updating..."
              : isApprove
              ? "Approve & Activate Rider"
              : "Reject Application"}
          </Button>
        </div>
      </div>
    </div>
  );
}
