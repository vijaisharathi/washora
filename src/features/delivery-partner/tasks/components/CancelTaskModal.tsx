"use client";

import React, { useState } from "react";
import { X, AlertTriangle, AlertCircle, Trash2 } from "lucide-react";

interface CancelTaskModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<unknown>;
  isCancelling: boolean;
}

export function CancelTaskModal({
  orderId,
  isOpen,
  onClose,
  onConfirm,
  isCancelling,
}: CancelTaskModalProps) {
  const [reason, setReason] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!reason.trim()) {
      setErrorMsg("Please provide a reason for cancelling this task.");
      return;
    }

    try {
      await onConfirm(reason.trim());
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to cancel task. Please try again.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-surface-container border border-outline-variant/30 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-outline-variant/20 bg-surface-container-high/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-error/15 text-error flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-on-surface">Cancel Task #{orderId}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-error/15 border border-error/30 text-error text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">Cancellation Reason</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Customer requested schedule change, severe weather, vehicle puncture..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-error resize-none"
              required
            />
            <p className="text-[10px] text-on-surface-variant">
              This task will be re-assigned to Indiranagar Hub #04 dispatch pool.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={onClose}
              disabled={isCancelling}
              className="px-4 py-2 rounded-xl bg-surface border border-outline-variant/30 text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isCancelling}
              className="px-5 py-2 rounded-xl bg-error text-error-foreground text-xs font-bold shadow-md hover:opacity-95 transition-opacity flex items-center gap-1.5 disabled:opacity-60"
            >
              {isCancelling ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-error-foreground/40 border-t-error-foreground rounded-full animate-spin" />
                  <span>Cancelling...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Confirm Cancel</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
