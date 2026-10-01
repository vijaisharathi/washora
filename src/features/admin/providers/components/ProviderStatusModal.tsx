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
} from "lucide-react";
import {
  Provider,
  ProviderStatus,
  UpdateProviderStatusPayload,
} from "@/types/admin";
import { Button } from "@/components/ui/button";

interface ProviderStatusModalProps {
  isOpen: boolean;
  provider: Provider | null;
  onClose: () => void;
  onConfirmStatus: (
    providerId: string,
    payload: UpdateProviderStatusPayload
  ) => Promise<Provider>;
}

export function ProviderStatusModal({
  isOpen,
  provider,
  onClose,
  onConfirmStatus,
}: ProviderStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<ProviderStatus>("active");
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (provider) {
      setSelectedStatus(provider.status);
      setReason("");
      setError(null);
      setSuccess(false);
    }
  }, [provider]);

  if (!isOpen || !provider) return null;

  const handleConfirm = async () => {
    if (selectedStatus === provider.status) {
      onClose();
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onConfirmStatus(provider.id, {
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
        err instanceof Error ? err.message : "Failed to update provider status";
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
                Change Operational Status
              </h2>
              <p className="text-xs text-on-surface-variant font-mono">
                {provider.id} • {provider.fullName}
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
                Status updated to {selectedStatus.toUpperCase()} successfully!
              </span>
            </div>
          )}

          {/* Current vs New Status */}
          <div className="p-3 rounded-lg bg-surface-container-low border border-surface-variant/40 flex items-center justify-between">
            <span className="text-outline">Current Status:</span>
            <span className="font-semibold text-on-surface uppercase tracking-wider">
              {provider.status}
            </span>
          </div>

          {/* Status Selection Buttons */}
          <div>
            <label className="block text-xs font-medium text-on-surface mb-2">
              Select New Operational State *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedStatus("active")}
                className={`p-2.5 rounded-lg border text-center flex flex-col items-center gap-1 transition-all ${
                  isActive
                    ? "bg-success/15 border-success text-success ring-1 ring-success font-bold"
                    : "bg-surface-container-low border-surface-variant text-on-surface hover:bg-surface-container-high"
                }`}
              >
                <PlayCircle className="w-4 h-4" />
                <span>Active</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus("inactive")}
                className={`p-2.5 rounded-lg border text-center flex flex-col items-center gap-1 transition-all ${
                  isInactive
                    ? "bg-warning/15 border-warning text-warning ring-1 ring-warning font-bold"
                    : "bg-surface-container-low border-surface-variant text-on-surface hover:bg-surface-container-high"
                }`}
              >
                <PauseCircle className="w-4 h-4" />
                <span>Inactive</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus("suspended")}
                className={`p-2.5 rounded-lg border text-center flex flex-col items-center gap-1 transition-all ${
                  isSuspended
                    ? "bg-critical/15 border-critical text-critical ring-1 ring-critical font-bold"
                    : "bg-surface-container-low border-surface-variant text-on-surface hover:bg-surface-container-high"
                }`}
              >
                <Ban className="w-4 h-4" />
                <span>Suspended</span>
              </button>
            </div>
          </div>

          {/* Consequence Banner */}
          {isSuspended && (
            <div className="p-3 rounded-lg bg-critical/15 border border-critical/30 text-critical text-[11px] flex items-start gap-2 leading-relaxed">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong>Warning:</strong> Suspending this provider will
                immediately block them from receiving job dispatches, hide their
                profile from customer discovery, and require administrative
                re-approval.
              </div>
            </div>
          )}

          {isInactive && (
            <div className="p-3 rounded-lg bg-warning/15 border border-warning/30 text-warning text-[11px] flex items-start gap-2 leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong>Off-Duty Notice:</strong> Marking this provider as
                inactive temporarily removes them from automatic dispatch until
                they are set back to active.
              </div>
            </div>
          )}

          {isActive && provider.status !== "active" && (
            <div className="p-3 rounded-lg bg-success/15 border border-success/30 text-success text-[11px] flex items-start gap-2 leading-relaxed">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong>Activation Notice:</strong> This will restore the
                provider to active status and enable immediate order allocation.
              </div>
            </div>
          )}

          {/* Reason Field */}
          <div>
            <label className="block text-xs font-medium text-on-surface mb-1">
              Reason for Status Change (Audit Trail)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Temporary leave request, quality inspection follow-up, or policy violation..."
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
            onClick={handleConfirm}
            disabled={isSubmitting || selectedStatus === provider.status}
            className={`text-xs ${
              isSuspended
                ? "bg-critical text-on-critical hover:bg-critical/90"
                : "bg-primary text-on-primary hover:bg-primary-hover"
            }`}
          >
            {isSubmitting ? "Updating..." : "Confirm Status"}
          </Button>
        </div>
      </div>
    </div>
  );
}
