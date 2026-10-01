import React, { useState } from "react";
import { X, FileText, AlertTriangle, PlusCircle } from "lucide-react";
import { Dispute, AddDisputeEvidenceSchema } from "@/types/admin/support";

interface AddEvidenceModalProps {
  isOpen: boolean;
  dispute: Dispute | null;
  onClose: () => void;
  onAddEvidence: (title: string, description: string) => Promise<void>;
}

export function AddEvidenceModal({
  isOpen,
  dispute,
  onClose,
  onAddEvidence,
}: AddEvidenceModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !dispute) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = AddDisputeEvidenceSchema.safeParse({
      title: title.trim(),
      description: description.trim(),
    });

    if (!result.success) {
      setError(result.error.errors[0]?.message || "Evidence payload is invalid.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onAddEvidence(title.trim(), description.trim());
      setTitle("");
      setDescription("");
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to add evidence");
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
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-on-surface">Add Case Evidence</h2>
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

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              Evidence Title / Documentation Ref <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Weighbridge Scale Calibration Certificate / Intake Photos"
              className="w-full py-2 px-3 text-xs rounded-lg bg-surface-container/50 border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              Evidence Summary & Technical Findings <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Detail timestamps, photos inspected, GPS telemetry, or supervisor witness statement (10–1000 characters)..."
              className="w-full p-2.5 text-xs rounded-lg bg-surface-container/50 border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary/50"
            />
            <div className="text-right text-[10px] text-on-surface-variant mt-1 font-mono">
              {description.length} / 1000 characters
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
              disabled={submitting || title.trim().length < 3 || description.trim().length < 10}
              className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{submitting ? "Adding..." : "Add Evidence"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
