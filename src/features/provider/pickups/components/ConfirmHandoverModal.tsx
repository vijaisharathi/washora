import React, { useState } from "react";
import { ProviderPickupItem } from "@/types/provider/pickups";

interface ConfirmHandoverModalProps {
  pickup: ProviderPickupItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (verificationCode?: string) => Promise<void>;
  isConfirming: boolean;
}

export function ConfirmHandoverModal({
  pickup,
  isOpen,
  onClose,
  onConfirm,
  isConfirming,
}: ConfirmHandoverModalProps) {
  const [code, setCode] = useState(pickup?.verificationOtp || "4289");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen || !pickup) return null;

  const handleConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      await onConfirm(code);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid verification code.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container rounded-2xl border border-white/10 p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-2xl bg-primary-container/20 text-primary flex items-center justify-center mb-4 border border-primary/30">
          <span className="material-symbols-outlined text-2xl">pin</span>
        </div>

        <h3 className="text-lg font-bold text-on-surface mb-1">Confirm Valet Handover</h3>
        <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
          Verify 4-digit handover PIN from valet partner{" "}
          <span className="font-semibold text-primary">{pickup.partner?.name || "Driver"}</span> for{" "}
          <span className="font-semibold text-on-surface">{pickup.pickupNumber}</span>.
        </p>

        <form onSubmit={handleConfirmSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">
              Handover Authorization Code
            </label>
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className="w-full bg-surface-container-low text-on-surface text-center font-mono font-bold text-xl tracking-widest rounded-xl p-3 border border-white/10 focus:border-primary outline-none"
            />
            {errorMsg && <p className="text-xs text-error font-medium">{errorMsg}</p>}
          </div>

          <div className="p-3 rounded-xl bg-surface-container-low border border-white/5 text-xs text-on-surface-variant space-y-1">
            <div className="flex justify-between">
              <span>Customer:</span>
              <strong className="text-on-surface">{pickup.customerName}</strong>
            </div>
            <div className="flex justify-between">
              <span>Package:</span>
              <strong className="text-on-surface">{pickup.itemDescription}</strong>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isConfirming}
              className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-variant text-xs font-semibold text-on-surface transition-colors border border-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isConfirming}
              className="px-5 py-2 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary text-xs font-bold transition-all shadow-md shadow-primary/20 flex items-center gap-1.5"
            >
              {isConfirming ? <span>Verifying...</span> : <span>Complete Handover</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
