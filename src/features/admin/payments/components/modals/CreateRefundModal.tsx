"use client";

import React, { useState } from "react";
import {
  RotateCcw,
  X,
  AlertTriangle,
  CheckCircle2,
  IndianRupee,
} from "lucide-react";
import { Payment } from "@/types/admin";

interface CreateRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  payment: Payment | null;
  onSubmit: (data: {
    paymentId: string;
    bookingId: string;
    amount: number;
    reason: string;
    requestedBy: string;
  }) => Promise<any>;
}

export function CreateRefundModal({
  isOpen,
  onClose,
  bookingId,
  payment,
  onSubmit,
}: CreateRefundModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const maxRefundable = payment
    ? Math.max(0, payment.paidAmount - payment.refundedAmount)
    : 0;

  const parsedAmount = Number(amount) || 0;

  const validate = (): string | null => {
    if (!payment) return "No active payment record found for this booking.";
    if (payment.status !== "Paid" && payment.status !== "Partially Refunded") {
      return `Refund is not allowed for payment with status ${payment.status}.`;
    }
    if (maxRefundable <= 0) {
      return "This payment has already been fully refunded.";
    }
    if (!amount || parsedAmount <= 0) {
      return "Refund amount must be greater than ₹0.";
    }
    if (parsedAmount > maxRefundable) {
      return `Refund amount cannot exceed remaining refundable amount of ₹${maxRefundable}.`;
    }
    if (!reason.trim()) {
      return "Refund reason is required.";
    }
    if (reason.trim().length < 10) {
      return "Refund reason must be at least 10 characters.";
    }
    if (!confirmed) {
      return "Please confirm the refund action to proceed.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        paymentId: payment!.id,
        bookingId,
        amount: parsedAmount,
        reason: reason.trim(),
        requestedBy: "Admin Console",
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create refund");
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
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-on-surface">Initiate Customer Refund</h2>
            <p className="text-[11px] text-on-surface-variant">Booking #{bookingId}</p>
          </div>
        </div>

        {success ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto animate-bounce" />
            <p className="text-xs font-bold text-on-surface">Refund Initiated Successfully!</p>
            <p className="text-[11px] text-on-surface-variant">Status set to Processing.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Payment Summary Info */}
            <div className="p-3 rounded-xl bg-surface-container/60 border border-outline-variant/30 space-y-1.5">
              <div className="flex justify-between text-on-surface-variant">
                <span>Total Paid:</span>
                <span className="font-semibold text-on-surface">
                  ₹{payment?.paidAmount.toLocaleString("en-IN") || 0}
                </span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Already Refunded:</span>
                <span className="font-semibold text-rose-500">
                  ₹{payment?.refundedAmount.toLocaleString("en-IN") || 0}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-outline-variant/20 font-bold text-on-surface">
                <span>Maximum Refundable:</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  ₹{maxRefundable.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-2 text-[11px]">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Refund Amount */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-on-surface flex justify-between">
                <span>Refund Amount (₹) *</span>
                <button
                  type="button"
                  onClick={() => setAmount(String(maxRefundable))}
                  className="text-primary hover:underline text-[10px]"
                >
                  Full (₹{maxRefundable})
                </button>
              </label>
              <div className="relative">
                <IndianRupee className="w-3.5 h-3.5 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min={1}
                  max={maxRefundable}
                  step={1}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`Max ₹${maxRefundable}`}
                  className="w-full pl-8 pr-3 py-2 rounded-lg bg-surface-container/50 border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary text-xs font-semibold"
                />
              </div>
            </div>

            {/* Refund Reason */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-on-surface">
                Reason for Refund (min 10 characters) *
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Detail customer reason, stain report, valet delay compensation, etc."
                className="w-full p-2.5 rounded-lg bg-surface-container/50 border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary text-xs resize-none"
              />
              <span className="text-[10px] text-on-surface-variant float-right">
                {reason.trim().length}/10 min chars
              </span>
            </div>

            {/* Confirmation Checkbox */}
            <label className="flex items-start gap-2.5 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5 rounded border-outline-variant/50 text-primary focus:ring-primary"
              />
              <span className="text-[11px] text-on-surface-variant">
                I verify that this refund is approved under WASHORA platform policy and will adjust the realized ledger.
              </span>
            </label>

            {/* Submit Actions */}
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
                type="submit"
                disabled={isSubmitting || maxRefundable <= 0}
                className="px-4 py-1.5 rounded-lg bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Processing..." : `Process Refund (₹${parsedAmount || 0})`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
