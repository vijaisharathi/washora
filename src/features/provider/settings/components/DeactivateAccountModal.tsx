import React, { useState } from "react";
import { DeactivateAccountPayload } from "@/types/provider/settings";

interface DeactivateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeactivate: (payload: DeactivateAccountPayload) => Promise<void>;
  isDeactivating: boolean;
}

export function DeactivateAccountModal({
  isOpen,
  onClose,
  onDeactivate,
  isDeactivating,
}: DeactivateAccountModalProps) {
  const [reason, setReason] = useState("");
  const [confirmationText, setConfirmationText] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmationText !== "DEACTIVATE") return;
    await onDeactivate({ reason, confirmationText });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container rounded-2xl border border-red-500/20 p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mb-4 border border-red-500/20">
          <span className="material-symbols-outlined text-2xl">pause_circle</span>
        </div>

        <h3 className="text-base font-bold text-on-surface mb-1">Deactivate Provider Operations</h3>
        <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
          This will temporarily pause incoming booking requests and unpublish your studio catalog.
          Active orders in progress must still be completed.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface-variant">
              Reason for temporary pause
            </label>
            <textarea
              rows={2}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Workshop maintenance, holiday break..."
              className="w-full bg-surface-container-low text-on-surface text-xs rounded-xl p-3 border border-white/10 focus:border-red-400 outline-none resize-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface-variant">
              Type <span className="font-mono text-red-400 font-bold">DEACTIVATE</span> to confirm
            </label>
            <input
              type="text"
              required
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="DEACTIVATE"
              className="w-full bg-surface-container-low text-on-surface text-xs rounded-xl px-4 py-2.5 border border-white/10 focus:border-red-400 outline-none font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeactivating}
              className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-variant text-xs font-semibold text-on-surface transition-colors border border-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDeactivating || confirmationText !== "DEACTIVATE"}
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-md shadow-red-600/20"
            >
              {isDeactivating ? "Pausing..." : "Confirm Deactivation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
