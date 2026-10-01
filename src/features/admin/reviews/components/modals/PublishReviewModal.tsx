"use client";

import React, { useState } from "react";
import {
  CheckCircle,
  X,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { Review } from "@/types/admin/review";

interface PublishReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: Review | null;
  onSubmit: () => Promise<any>;
}

export function PublishReviewModal({
  isOpen,
  onClose,
  review,
  onSubmit,
}: PublishReviewModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !review) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to approve review";
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
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-on-surface">Publish / Approve Review</h2>
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

        <div className="p-3 rounded-lg bg-surface-container border border-outline-variant/30 mb-4 text-xs">
          <p className="text-on-surface-variant mb-1">
            Current flag reason: <span className="font-semibold text-rose-500">{review.moderationReason || "Manual Review"}</span>
          </p>
          <p className="text-on-surface italic line-clamp-2">&ldquo;{review.comment}&rdquo;</p>
        </div>

        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 mb-4 text-xs text-primary flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            Clearing this flag will restore the review to Published status and re-include it in visible metrics.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Approving..." : "Approve & Publish"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
