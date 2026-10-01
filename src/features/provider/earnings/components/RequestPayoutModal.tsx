import React, { useState } from "react";

interface RequestPayoutModalProps {
  availableBalance: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number, notes?: string) => Promise<void>;
  isSubmitting: boolean;
}

export function RequestPayoutModal({
  availableBalance,
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
}: RequestPayoutModalProps) {
  const [amount, setAmount] = useState<number>(availableBalance);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (amount <= 0) {
      setErrorMsg("Amount must be greater than zero.");
      return;
    }

    if (amount > availableBalance) {
      setErrorMsg(`Cannot exceed available balance of ₹${availableBalance}.`);
      return;
    }

    try {
      await onConfirm(amount);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process withdrawal.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container rounded-2xl border border-white/10 p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-2xl bg-primary-container/20 text-primary flex items-center justify-center mb-4 border border-primary/30">
          <span className="material-symbols-outlined text-2xl">payments</span>
        </div>

        <h3 className="text-lg font-bold text-on-surface mb-1">Request On-Demand Payout</h3>
        <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
          Transfer available earnings directly to your verified studio bank account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-on-surface-variant">Withdrawal Amount (₹)</label>
              <span className="text-on-surface-variant">
                Available: <strong className="text-primary font-bold">₹{availableBalance}</strong>
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">
                ₹
              </span>
              <input
                type="number"
                min={1}
                max={availableBalance}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
                className="w-full bg-surface-container-low text-on-surface text-lg font-bold rounded-xl pl-9 pr-4 py-3 border border-white/10 focus:border-primary outline-none"
              />
            </div>
            {errorMsg && <p className="text-xs text-error font-medium">{errorMsg}</p>}
          </div>

          <div className="p-3 rounded-xl bg-surface-container-low border border-white/5 text-xs text-on-surface-variant space-y-1">
            <div className="flex justify-between">
              <span>Transfer Mode:</span>
              <strong className="text-on-surface">NEFT / IMPS Express (Zero Platform Fee)</strong>
            </div>
            <div className="flex justify-between">
              <span>Estimated Settlement:</span>
              <strong className="text-emerald-400">Within 2–4 Business Hours</strong>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-variant text-xs font-semibold text-on-surface transition-colors border border-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary text-xs font-bold transition-all shadow-md shadow-primary/20 flex items-center gap-1.5"
            >
              {isSubmitting ? <span>Submitting...</span> : <span>Confirm Payout</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
