"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Lock,
  PauseCircle,
  PlayCircle,
} from "lucide-react";
import { Customer, CustomerStatus } from "@/types/admin";
import { Button } from "@/components/ui/button";

interface CustomerStatusModalProps {
  isOpen: boolean;
  customer: Customer | null;
  onClose: () => void;
  onConfirmStatus: (
    customerId: string,
    newStatus: CustomerStatus,
    reason?: string
  ) => Promise<Customer>;
}

export function CustomerStatusModal({
  isOpen,
  customer,
  onClose,
  onConfirmStatus,
}: CustomerStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<CustomerStatus>("active");
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (customer) {
      setSelectedStatus(customer.status);
      setReason("");
      setError(null);
      setSuccess(false);
    }
  }, [customer]);

  if (!isOpen || !customer) return null;

  const handleConfirm = async () => {
    if (selectedStatus === customer.status) {
      onClose();
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onConfirmStatus(customer.id, selectedStatus, reason);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1000);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update customer status";
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
                  ? "bg-warning/20 text-warning border-warning/30"
                  : "bg-success/20 text-success border-success/30"
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-headline-md text-base font-bold text-on-surface">
                Account Status Action
              </h2>
              <p className="text-xs text-on-surface-variant font-mono">
                {customer.fullName} • {customer.id}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="mx-5 mt-4 p-3 rounded-lg bg-critical/15 border border-critical/30 text-critical text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mx-5 mt-4 p-3 rounded-lg bg-success/15 border border-success/30 text-success text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Account status changed to {selectedStatus.toUpperCase()}!</span>
          </div>
        )}

        <div className="p-5 space-y-4">
          {/* Target Status Selector */}
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-2">
              Select Target Account Status:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {/* Active Option */}
              <button
                type="button"
                onClick={() => setSelectedStatus("active")}
                className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors ${
                  isActive
                    ? "bg-success/15 border-success text-success shadow-sm"
                    : "bg-surface-container-low border-surface-variant text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                <PlayCircle className="w-4 h-4" />
                <span>Active</span>
              </button>

              {/* Inactive Option */}
              <button
                type="button"
                onClick={() => setSelectedStatus("inactive")}
                className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors ${
                  isInactive
                    ? "bg-warning/15 border-warning text-warning shadow-sm"
                    : "bg-surface-container-low border-surface-variant text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                <PauseCircle className="w-4 h-4" />
                <span>Inactive</span>
              </button>

              {/* Suspended Option */}
              <button
                type="button"
                onClick={() => setSelectedStatus("suspended")}
                className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors ${
                  isSuspended
                    ? "bg-critical/15 border-critical text-critical shadow-sm"
                    : "bg-surface-container-low border-surface-variant text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Suspended</span>
              </button>
            </div>
          </div>

          {/* Consequence Explanation Banner */}
          <div
            className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
              isSuspended
                ? "bg-critical/10 border-critical/30 text-critical"
                : isInactive
                ? "bg-warning/10 border-warning/30 text-warning"
                : "bg-success/10 border-success/30 text-success"
            }`}
          >
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-0.5">
                {isSuspended
                  ? "Security Suspension Warning"
                  : isInactive
                  ? "Dormant Status Action"
                  : "Reactivation Action"}
              </p>
              <p className="text-[11px] opacity-90">
                {isSuspended
                  ? "Suspending will immediately terminate active customer sessions and prevent all future logins and bookings."
                  : isInactive
                  ? "Setting account to inactive will disable placing new orders while allowing the customer to view past receipts."
                  : "Account will have full access to browse laundry services, place bookings, and track active deliveries."}
              </p>
            </div>
          </div>

          {/* Admin Reason Textarea */}
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              Admin Reason (Recorded for Audit Log)
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide context for this account status transition..."
              className="w-full bg-surface-container-low border border-surface-variant rounded-lg p-2.5 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-surface-variant flex items-center justify-end gap-3">
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
              type="button"
              size="sm"
              disabled={isSubmitting}
              onClick={handleConfirm}
              className={`text-xs font-bold text-white ${
                isSuspended
                  ? "bg-critical hover:bg-critical/90"
                  : isInactive
                  ? "bg-warning/90 hover:bg-warning text-black"
                  : "bg-success hover:bg-success/90"
              }`}
            >
              {isSubmitting
                ? "Updating..."
                : isSuspended
                ? "Suspend Account"
                : isInactive
                ? "Deactivate Account"
                : "Reactivate Account"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
