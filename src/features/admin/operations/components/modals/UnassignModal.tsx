"use client";

import React, { useState } from "react";
import { X, AlertTriangle, Loader2, UserX } from "lucide-react";
import { OperationalBookingView } from "@/types/admin/operations";

interface UnassignModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingView: OperationalBookingView | null;
  targetType: "provider" | "delivery_partner";
  onConfirm: (bookingId: string, notes?: string) => Promise<void>;
}

export function UnassignModal({
  isOpen,
  onClose,
  bookingView,
  targetType,
  onConfirm,
}: UnassignModalProps) {
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !bookingView) return null;

  const isProvider = targetType === "provider";
  const assigneeName = isProvider
    ? bookingView.provider?.fullName || "the assigned provider"
    : bookingView.deliveryPartner?.fullName || "the assigned valet";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);
      await onConfirm(bookingView.booking.id, notes.trim() || undefined);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unassign.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 bg-surface-container-low/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-on-surface">
                {isProvider ? "Unassign Provider?" : "Unassign Delivery Partner?"}
              </h2>
              <p className="text-xs text-on-surface-variant font-mono">
                Booking #{bookingView.booking.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
              {error}
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 leading-relaxed">
            <p className="font-semibold mb-1">Notice: Operational Impact</p>
            <p>
              Are you sure you want to unassign <strong>{assigneeName}</strong>? This booking will
              be returned to the operational triage queue as requiring assignment.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface block">
              Reason / Cancellation Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide reason for audit log..."
              className="w-full bg-surface-container border border-outline-variant/30 rounded-xl p-3 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-outline-variant/40 hover:bg-surface-container text-xs font-semibold text-on-surface transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 text-xs font-semibold shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Unassigning...
                </>
              ) : (
                <>
                  <UserX className="w-3.5 h-3.5" />
                  Confirm Unassignment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
