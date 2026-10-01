import React from "react";
import { ProviderServiceItem } from "@/types/provider/services";

interface ProviderServiceDeleteDialogProps {
  service: ProviderServiceItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export function ProviderServiceDeleteDialog({
  service,
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: ProviderServiceDeleteDialogProps) {
  if (!isOpen || !service) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container rounded-2xl border border-white/10 p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-2xl bg-error-container/20 text-error flex items-center justify-center mb-4 border border-error/30">
          <span className="material-symbols-outlined text-2xl">delete_forever</span>
        </div>

        <h3 className="text-lg font-bold text-on-surface mb-1">Archive &amp; Remove Service?</h3>
        <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
          Are you sure you want to remove <span className="font-semibold text-on-surface">&quot;{service.name}&quot;</span> from your active studio offerings? Existing orders in queue will not be affected.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-variant text-xs font-semibold text-on-surface transition-colors border border-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl bg-error text-on-error hover:bg-error/90 text-xs font-bold transition-all shadow-md shadow-error/20 flex items-center gap-1.5"
          >
            {isDeleting ? <span>Removing...</span> : <span>Confirm Archive</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
