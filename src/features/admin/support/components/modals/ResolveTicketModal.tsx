import React, { useState } from "react";
import { X, CheckCircle2, AlertTriangle } from "lucide-react";
import { SupportTicket, ResolveSupportTicketSchema } from "@/types/admin/support";

interface ResolveTicketModalProps {
  isOpen: boolean;
  ticket: SupportTicket | null;
  onClose: () => void;
  onResolve: (ticketId: string, resolution: string) => Promise<void>;
}

export function ResolveTicketModal({
  isOpen,
  ticket,
  onClose,
  onResolve,
}: ResolveTicketModalProps) {
  const [resolution, setResolution] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !ticket) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = ResolveSupportTicketSchema.safeParse({ resolution: resolution.trim() });
    if (!result.success) {
      setError(result.error.errors[0]?.message || "Resolution text is invalid.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onResolve(ticket.id, resolution.trim());
      setResolution("");
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to resolve ticket");
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
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-on-surface">Resolve Ticket</h2>
              <p className="text-xs text-on-surface-variant font-mono">
                {ticket.ticketNumber} ({ticket.id})
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
          <div>
            <span className="text-xs text-on-surface-variant">Subject:</span>
            <p className="text-xs font-semibold text-on-surface mt-0.5">
              {ticket.subject}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              Resolution Details <span className="text-rose-500">*</span>
            </label>
            <p className="text-[11px] text-on-surface-variant mb-2">
              Provide specific details on what action was taken to resolve this support case (10–1000 characters).
            </p>
            <textarea
              rows={4}
              value={resolution}
              onChange={(e) => {
                setResolution(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Verified with workshop supervisor that cold solvent wash was applied. Silk garments inspected and released for priority express delivery."
              className="w-full p-2.5 text-xs rounded-lg bg-surface-container/50 border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-emerald-500/50"
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
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-40"
            >
              {submitting ? "Resolving..." : "Confirm Resolution"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
