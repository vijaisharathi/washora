"use client";

import React, { useState } from "react";
import {
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";
import { CommunicationMessage } from "@/types/admin/notification";

interface DeleteDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: CommunicationMessage | null;
  onConfirm: () => Promise<any>;
}

export function DeleteDraftModal({
  isOpen,
  onClose,
  message,
  onConfirm,
}: DeleteDraftModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !message) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      await onConfirm();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete draft";
      setError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-rose-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-on-surface">Delete Draft Message</h2>
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
          <div className="font-semibold text-on-surface">{message.subject || "Untitled Draft"}</div>
          <p className="text-on-surface-variant line-clamp-2">{message.body || "Empty body"}</p>
        </div>

        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 mb-4 text-xs text-rose-500 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            Are you sure you want to permanently delete this unsent message draft? This action cannot be undone.
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
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 transition-all disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? "Deleting..." : "Delete Draft"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
