"use client";

import React, { useState } from "react";
import {
  X,
  AlertTriangle,
  CheckCircle2,
  Activity,
  CheckCheck,
  XCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import {
  BookingOrder,
  BookingStatus,
  ALLOWED_STATUS_TRANSITIONS,
} from "@/types/admin";
import { Button } from "@/components/ui/button";

interface BookingStatusActionDialogProps {
  isOpen: boolean;
  booking: BookingOrder | null;
  onClose: () => void;
  onConfirm: (
    bookingId: string,
    newStatus: BookingStatus,
    reason?: string
  ) => Promise<BookingOrder>;
}

const STATUS_DESCRIPTIONS: Record<
  BookingStatus,
  { label: string; actionLabel: string; consequence: string; colorClass: string }
> = {
  pending: {
    label: "Pending",
    actionLabel: "Keep Pending",
    consequence: "Order requires operations review.",
    colorClass: "text-amber-500 bg-amber-500/10 border-amber-500/30",
  },
  confirmed: {
    label: "Confirmed",
    actionLabel: "Confirm Order",
    consequence:
      "Confirms schedule and notifies the fulfillment partner to prepare garments.",
    colorClass: "text-blue-500 bg-blue-500/10 border-blue-500/30",
  },
  in_progress: {
    label: "In Progress",
    actionLabel: "Start Processing",
    consequence:
      "Marks order as currently being washed, cleaned, or pressed at provider facility.",
    colorClass: "text-purple-500 bg-purple-500/10 border-purple-500/30",
  },
  completed: {
    label: "Completed",
    actionLabel: "Complete Order",
    consequence:
      "Finalizes fulfillment. This is a terminal state; no further status edits will be permitted.",
    colorClass: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
  },
  cancelled: {
    label: "Cancelled",
    actionLabel: "Cancel Order",
    consequence:
      "Terminates this booking. This is a terminal state and cannot be undone or reopened.",
    colorClass: "text-rose-500 bg-rose-500/10 border-rose-500/30",
  },
};

export function BookingStatusActionDialog({
  isOpen,
  booking,
  onClose,
  onConfirm,
}: BookingStatusActionDialogProps) {
  const [selectedTargetStatus, setSelectedTargetStatus] =
    useState<BookingStatus | null>(null);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !booking) return null;

  const currentStatus = booking.status;
  const allowedTransitions = ALLOWED_STATUS_TRANSITIONS[currentStatus];

  // Set default target if not selected
  const activeTarget =
    selectedTargetStatus && allowedTransitions.includes(selectedTargetStatus)
      ? selectedTargetStatus
      : allowedTransitions[0] || null;

  const handleConfirm = async () => {
    if (!activeTarget) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onConfirm(
        booking.id,
        activeTarget,
        reason.trim() || undefined
      );
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to update booking status.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentInfo = STATUS_DESCRIPTIONS[currentStatus];
  const targetInfo = activeTarget ? STATUS_DESCRIPTIONS[activeTarget] : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="status-dialog-title"
    >
      <div className="relative w-full max-w-lg bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-variant/40 bg-surface-container/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="status-dialog-title"
                className="text-base font-bold text-on-surface"
              >
                Order Lifecycle Transition
              </h2>
              <p className="text-xs text-on-surface-variant font-mono">
                {booking.bookingNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-5">
          {/* Target Status Selector */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-outline uppercase tracking-wider">
              Select Next Operational Status:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {allowedTransitions.map((target) => {
                const isChosen = activeTarget === target;
                const info = STATUS_DESCRIPTIONS[target];
                const isCancel = target === "cancelled";

                return (
                  <button
                    key={target}
                    type="button"
                    onClick={() => setSelectedTargetStatus(target)}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      isChosen
                        ? isCancel
                          ? "border-rose-500 bg-rose-500/15 text-rose-500 shadow-sm"
                          : "border-primary bg-primary/15 text-primary shadow-sm"
                        : "border-surface-variant bg-surface-container text-on-surface hover:bg-surface-container-high"
                    }`}
                  >
                    <span className="text-xs font-bold">{info.actionLabel}</span>
                    <span className="text-[10px] opacity-80">
                      Transition to {info.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Transition Visualizer */}
          {targetInfo && (
            <div className="p-4 rounded-xl bg-surface-container/60 border border-surface-variant/40 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                {/* Current */}
                <div className="flex flex-col items-start gap-1">
                  <span className="text-[10px] text-outline uppercase font-semibold">
                    Current Status
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${currentInfo.colorClass}`}
                  >
                    {currentInfo.label}
                  </span>
                </div>

                <ArrowRight className="w-5 h-5 text-outline shrink-0 mx-2" />

                {/* Target */}
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] text-outline uppercase font-semibold">
                    Target Status
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${targetInfo.colorClass}`}
                  >
                    {targetInfo.label}
                  </span>
                </div>
              </div>

              {/* Consequence Warning */}
              <div
                className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                  activeTarget === "cancelled" || activeTarget === "completed"
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                    : "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400"
                }`}
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold">Consequence:</span>
                  <span>{targetInfo.consequence}</span>
                </div>
              </div>
            </div>
          )}

          {/* Optional Reason / Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-on-surface">
              Reason / Operational Audit Note (Optional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Schedule verified with customer; or cancellation reason..."
              className="bg-surface-container border border-surface-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-critical/10 border border-critical/30 text-xs text-critical flex items-center gap-2">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-surface-variant/40 bg-surface-container/30">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="border-surface-variant hover:bg-surface-container text-on-surface text-xs"
          >
            Cancel
          </Button>

          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={isSubmitting || !activeTarget}
            className={`text-xs font-semibold ${
              activeTarget === "cancelled"
                ? "bg-rose-600 hover:bg-rose-700 text-white"
                : "bg-primary hover:bg-primary/90 text-on-primary"
            }`}
          >
            {isSubmitting
              ? "Transitioning..."
              : `Confirm ${targetInfo ? targetInfo.label : ""}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
