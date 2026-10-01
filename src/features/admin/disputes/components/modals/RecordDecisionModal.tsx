import React, { useState } from "react";
import { X, FileCheck, AlertTriangle, Scale } from "lucide-react";
import {
  Dispute,
  DisputeOutcome,
  DISPUTE_OUTCOMES,
  DisputeDecisionSchema,
} from "@/types/admin/support";

interface RecordDecisionModalProps {
  isOpen: boolean;
  dispute: Dispute | null;
  onClose: () => void;
  onRecordDecision: (outcome: DisputeOutcome, resolution: string) => Promise<void>;
}

export function RecordDecisionModal({
  isOpen,
  dispute,
  onClose,
  onRecordDecision,
}: RecordDecisionModalProps) {
  const [outcome, setOutcome] = useState<DisputeOutcome>("Customer Favored");
  const [resolution, setResolution] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !dispute) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = DisputeDecisionSchema.safeParse({
      outcome,
      resolution: resolution.trim(),
    });

    if (!result.success) {
      setError(result.error.errors[0]?.message || "Invalid decision payload.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onRecordDecision(outcome, resolution.trim());
      setResolution("");
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to record decision");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-5 border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-on-surface">Record Dispute Decision</h2>
              <p className="text-xs text-on-surface-variant font-mono">
                {dispute.disputeNumber} ({dispute.id})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <span className="text-xs text-on-surface-variant">Dispute Claim:</span>
            <p className="text-xs font-semibold text-on-surface mt-0.5">
              {dispute.subject}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Outcome selection */}
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              Dispute Outcome / Ruling <span className="text-rose-500">*</span>
            </label>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value as DisputeOutcome)}
              className="w-full py-2 px-3 text-xs rounded-lg bg-surface-container/50 border border-outline-variant/30 text-on-surface focus:outline-none focus:border-teal-500/50"
            >
              {DISPUTE_OUTCOMES.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          {/* Resolution justification */}
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              Decision Findings & Resolution <span className="text-rose-500">*</span>
            </label>
            <p className="text-[11px] text-on-surface-variant mb-2">
              Detail findings from evidence audit, merchant response, and case closure rationale (10–1000 characters).
            </p>
            <textarea
              rows={4}
              value={resolution}
              onChange={(e) => {
                setResolution(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Reviewed CCTV intake footage and validated that formal shirt was handled in bulk wash contrary to instructions. Ruling in favor of customer for garment replacement value."
              className="w-full p-2.5 text-xs rounded-lg bg-surface-container/50 border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-teal-500/50"
            />
            <div className="text-right text-[10px] text-on-surface-variant mt-1 font-mono">
              {resolution.length} / 1000 characters
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-surface-container text-on-surface-variant text-xs font-medium hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || resolution.trim().length < 10}
              className="px-4 py-2 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors disabled:opacity-40 inline-flex items-center gap-1.5"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>{submitting ? "Recording..." : "Confirm Decision"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
