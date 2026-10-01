"use client";

import React, { useState } from "react";
import { X, AlertTriangle, ShieldAlert } from "lucide-react";

interface DeactivateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<unknown>;
  isSubmitting: boolean;
}

export function DeactivateAccountModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
}: DeactivateAccountModalProps) {
  const [reason, setReason] = useState("TEMPORARY_BREAK");
  const [confirmText, setConfirmText] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmText.toUpperCase() !== "DEACTIVATE") {
      setErrorMsg("Please type DEACTIVATE to confirm.");
      return;
    }

    try {
      await onConfirm(reason);
      onClose();
    } catch {
      setErrorMsg("Failed to deactivate account.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-surface-container border border-error/30 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-outline-variant/20 bg-error/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-error/20 text-error flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-error">Deactivate Valet Account</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-on-surface leading-relaxed">
            Deactivating your valet account will take you offline and pause incoming dispatch orders. You can reactivate anytime by contacting your Hub Manager.
          </p>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-error/15 border border-error/30 text-error text-xs">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant">Reason for Deactivation</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-error"
            >
              <option value="TEMPORARY_BREAK">Taking a temporary personal break</option>
              <option value="VEHICLE_MAINTENANCE">Vehicle repair / maintenance</option>
              <option value="RELOCATING">Relocating to another city</option>
              <option value="OTHER">Other operational reason</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant">
              Type <span className="text-error font-mono font-bold">DEACTIVATE</span> to confirm
            </label>
            <input
              type="text"
              placeholder="DEACTIVATE"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface font-mono placeholder:text-on-surface-variant/40 focus:outline-none focus:border-error"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-surface border border-outline-variant/30 text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || confirmText.toUpperCase() !== "DEACTIVATE"}
              className="px-5 py-2.5 rounded-xl bg-error text-white text-xs font-bold shadow-md hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? "Deactivating..." : "Confirm Deactivation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
