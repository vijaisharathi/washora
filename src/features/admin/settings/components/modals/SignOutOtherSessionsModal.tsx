"use client";

import React from "react";
import { X, LogOut, AlertTriangle } from "lucide-react";

interface SignOutOtherSessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<any>;
  isLoading?: boolean;
}

export function SignOutOtherSessionsModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: SignOutOtherSessionsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-surface-container-low border border-outline-variant/30 rounded-2xl shadow-2xl p-6 sm:p-7">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-outline-variant/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-error/15 border border-error/30 flex items-center justify-center text-error">
              <LogOut className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-on-surface">Sign Out Other Sessions</h3>
              <p className="text-[11px] text-on-surface-variant">Terminate remote active logins</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-6 space-y-3 text-xs text-on-surface-variant">
          <p>
            Are you sure you want to sign out of all other devices and browser sessions?
          </p>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Your current active session will remain signed in, but all tablet and secondary workstation sessions will be immediately terminated.
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/20">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={async () => {
              await onConfirm();
              onClose();
            }}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-error text-on-error text-xs font-semibold hover:bg-error/90 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
          >
            {isLoading && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            <span>Sign Out All Other Devices</span>
          </button>
        </div>
      </div>
    </div>
  );
}
