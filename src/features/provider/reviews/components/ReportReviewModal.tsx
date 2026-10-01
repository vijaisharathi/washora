import React, { useState } from "react";
import { ProviderReviewItem } from "@/types/provider/reviews";

interface ReportReviewModalProps {
  review: ProviderReviewItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, details: string) => Promise<void>;
  isReporting: boolean;
}

export function ReportReviewModal({
  review,
  isOpen,
  onClose,
  onConfirm,
  isReporting,
}: ReportReviewModalProps) {
  const [reason, setReason] = useState("Inappropriate / Abusive Language");
  const [details, setDetails] = useState("");

  if (!isOpen || !review) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) return;
    await onConfirm(reason, details.trim());
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container rounded-2xl border border-white/10 p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-2xl bg-error-container/20 text-error flex items-center justify-center mb-4 border border-error/30">
          <span className="material-symbols-outlined text-2xl">flag</span>
        </div>

        <h3 className="text-lg font-bold text-on-surface mb-1">Report Customer Review</h3>
        <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
          Submit feedback regarding order{" "}
          <span className="font-semibold text-primary">{review.orderNumber}</span> for trust &amp; safety review.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">Report Category</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-surface-container-low text-on-surface text-xs rounded-xl px-3.5 py-2.5 border border-white/10 focus:border-primary outline-none"
            >
              <option value="Inappropriate / Abusive Language">Inappropriate / Abusive Language</option>
              <option value="Factually Untrue / Wrong Order">Factually Untrue / Wrong Order</option>
              <option value="Competitor Spam / Harassment">Competitor Spam / Harassment</option>
              <option value="Extortion / Threat">Extortion / Threat</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">Explanation</label>
            <textarea
              rows={3}
              placeholder="Explain why this review violates platform terms..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              required
              className="w-full bg-surface-container-low text-on-surface text-xs rounded-xl p-3 border border-white/10 focus:border-primary outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isReporting}
              className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-variant text-xs font-semibold text-on-surface transition-colors border border-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isReporting}
              className="px-5 py-2 rounded-xl bg-error text-on-error hover:bg-error/90 text-xs font-bold transition-all shadow-md shadow-error/20 flex items-center gap-1.5"
            >
              {isReporting ? <span>Submitting...</span> : <span>Submit Report</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
