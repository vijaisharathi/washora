"use client";

import React, { useState } from "react";
import {
  Archive,
  X,
  AlertTriangle,
} from "lucide-react";
import { CommunicationMessage } from "@/types/admin/notification";

interface ArchiveMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: CommunicationMessage | null;
  onConfirm: () => Promise<any>;
}

export function ArchiveMessageModal({
  isOpen,
  onClose,
  message,
  onConfirm,
}: ArchiveMessageModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !message) return null;

  const handleArchive = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      await onConfirm();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to archive message";
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
            <div className="w-8 h-8 rounded-lg bg-slate-500/10 border border-slate-500/20 flex items-center justify-center">
              <Archive className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-on-surface">Archive Communication Record</h2>
              <p className="text-[11px] text-on-surface-variant font-mono">{message.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 rounded-lg bg-surface-container border border-outline-variant/30 mb-4 text-xs space-y-1">
          <div className="font-semibold text-on-surface">{message.subject}</div>
          <p className="text-on-surface-variant line-clamp-2">{message.body}</p>
        </div>

        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-4 text-xs text-amber-500 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            Archived messages are locked as read-only historical records and moved out of active operational views.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-outline-variant/20">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-outline-variant/50 text-xs font-medium text-on-surface hover:bg-surface-container-high transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleArchive}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-slate-600 text-white text-xs font-semibold hover:bg-slate-700 transition-all disabled:opacity-50"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>{isSubmitting ? "Archiving..." : "Confirm Archive"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
