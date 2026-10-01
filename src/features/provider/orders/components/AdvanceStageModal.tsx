import React from "react";
import { ProviderOrderItem, ProviderOrderStatus } from "@/types/provider/orders";

interface AdvanceStageModalProps {
  order: ProviderOrderItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (nextStatus: ProviderOrderStatus) => Promise<void>;
  isAdvancing: boolean;
}

export function AdvanceStageModal({
  order,
  isOpen,
  onClose,
  onConfirm,
  isAdvancing,
}: AdvanceStageModalProps) {
  if (!isOpen || !order) return null;

  const getNextStage = (current: ProviderOrderStatus): ProviderOrderStatus => {
    switch (current) {
      case "INTAKE_INSPECTION":
        return "HYDROCARBON_CARE";
      case "HYDROCARBON_CARE":
        return "STEAM_DEODORIZE";
      case "STEAM_DEODORIZE":
        return "QUALITY_CHECK";
      case "QUALITY_CHECK":
        return "READY_VALET";
      case "READY_VALET":
        return "READY_VALET";
    }
  };

  const nextStatus = getNextStage(order.status);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container rounded-2xl border border-white/10 p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-2xl bg-primary-container/20 text-primary flex items-center justify-center mb-4 border border-primary/30">
          <span className="material-symbols-outlined text-2xl">arrow_forward</span>
        </div>

        <h3 className="text-lg font-bold text-on-surface mb-1">Advance Care Stage?</h3>
        <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
          Move order <span className="font-semibold text-primary">{order.orderNumber}</span> from{" "}
          <span className="font-semibold text-on-surface">{order.status.replace("_", " ")}</span> to{" "}
          <span className="font-bold text-emerald-400">{nextStatus.replace("_", " ")}</span>.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isAdvancing}
            className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-variant text-xs font-semibold text-on-surface transition-colors border border-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(nextStatus)}
            disabled={isAdvancing}
            className="px-5 py-2 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary text-xs font-bold transition-all shadow-md shadow-primary/20 flex items-center gap-1.5"
          >
            {isAdvancing ? <span>Updating...</span> : <span>Confirm Stage Advance</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
