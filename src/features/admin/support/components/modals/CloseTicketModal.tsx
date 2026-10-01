import React, { useState } from "react";
import { X, ShieldCheck, AlertTriangle } from "lucide-react";
import { SupportTicket } from "@/types/admin/support";

interface CloseTicketModalProps {
  isOpen: boolean;
  ticket: SupportTicket | null;
  onClose: () => void;
  onConfirmClose: (ticketId: string) => Promise<void>;
}

export function CloseTicketModal({
  isOpen,
  ticket,
  onClose,
  onConfirmClose,
}: CloseTicketModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !ticket) return null;

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await onConfirmClose(ticket.id);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to close ticket");
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
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-on-surface">Close Support Ticket</h2>
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
        <div className="p-5 space-y-4">
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Are you sure you want to permanently close this support ticket? Once closed, no further status transitions or reassignments can be performed.
          </p>

          <div className="p-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 text-xs">
            <div className="font-semibold text-on-surface mb-1">
              {ticket.subject}
            </div>
            <div className="text-[11px] text-on-surface-variant">
              Category: <span className="font-medium text-on-surface">{ticket.category}</span> • Current Status: <span className="font-medium text-on-surface">{ticket.status}</span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

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
              type="button"
              onClick={handleConfirm}
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors disabled:opacity-40"
            >
              {submitting ? "Closing..." : "Confirm Close Ticket"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
