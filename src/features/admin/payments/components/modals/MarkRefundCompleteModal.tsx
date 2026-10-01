"use client";

import React, { useState } from "react";
import { CheckCircle2, X, AlertCircle } from "lucide-react";
import { Refund } from "@/types/admin";

interface MarkRefundCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  refund: Refund | null;
  onConfirm: (refundId: string) => Promise<any>;
}

export function MarkRefundCompleteModal({
  isOpen,
  onClose,
  refund,
  onConfirm,
}: MarkRefundCompleteModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !refund) return null;

  const handleComplete = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      await onConfirm(refund.id);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to mark refund complete");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-on-surface">Mark Refund Completed</h2>
            <p className="text-[11px] text-on-surface-variant">Refund ID #{refund.id}</p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-surface-container/60 border border-outline-variant/30 space-y-1.5">
            <div className="flex justify-between text-on-surface-variant">
              <span>Booking Order:</span>
              <span className="font-semibold text-on-surface">{refund.bookingId}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Refund Amount:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                ₹{refund.amount.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Reason:</span>
              <span className="text-on-surface text-right truncate max-w-[200px]">
                {refund.reason}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-on-surface-variant">
            Marking this refund as completed will finalize the settlement record and adjust realized net platform revenue.
          </p>

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-2 text-[11px]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3 py-1.5 rounded-lg border border-outline-variant/40 text-on-surface hover:bg-surface-container text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleComplete}
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Completing..." : "Confirm Completion"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
