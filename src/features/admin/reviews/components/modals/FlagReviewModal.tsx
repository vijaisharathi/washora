"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  X,
  Flag,
  CheckCircle2,
} from "lucide-react";
import { Review, ModerationReason, MODERATION_REASONS } from "@/types/admin/review";

interface FlagReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: Review | null;
  onSubmit: (reason: ModerationReason, note: string) => Promise<any>;
}

export function FlagReviewModal({
  isOpen,
  onClose,
  review,
  onSubmit,
}: FlagReviewModalProps) {
  const [reason, setReason] = useState<ModerationReason>("Spam");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !review) return null;

  const validate = (): string | null => {
    if (!reason) return "Please select a moderation reason.";
    if (!note.trim()) return "Moderation note is required.";
    if (note.trim().length < 5) {
      return "Moderation note must be at least 5 characters.";
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
      await onSubmit(reason, note.trim());
      onClose();
      setNote("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to flag review";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <Flag className="w-4 h-4 text-rose-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-on-surface">Flag Review for Moderation</h2>
              <p className="text-[11px] text-on-surface-variant font-mono">{review.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Review Snippet */}
        <div className="p-3 rounded-lg bg-surface-container border border-outline-variant/30 mb-4 text-xs">
          <div className="flex items-center justify-between text-[11px] text-on-surface-variant mb-1 font-mono">
            <span>Rating: {review.rating} ★</span>
            <span>Booking: {review.bookingId}</span>
          </div>
          <p className="text-on-surface line-clamp-2 italic">&ldquo;{review.comment}&rdquo;</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-xs text-rose-500">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1.5">
              Flag Reason <span className="text-rose-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as ModerationReason)}
              className="w-full px-3 py-2 bg-surface-container text-xs rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
            >
              {MODERATION_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1.5">
              Moderation Note <span className="text-rose-500">* (min 5 chars)</span>
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Explain why this review violates platform terms or requires oversight..."
              className="w-full px-3 py-2 bg-surface-container text-xs rounded-lg border border-outline-variant/40 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-outline-variant/50 text-xs font-medium text-on-surface hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 transition-all disabled:opacity-50"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Flagging..." : "Confirm Flag"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
