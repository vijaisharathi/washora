import React, { useState } from "react";
import { ProviderPayoutAccount, UpdatePayoutAccountPayload } from "@/types/provider/earnings";

interface EditPayoutAccountModalProps {
  account?: ProviderPayoutAccount;
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: UpdatePayoutAccountPayload) => Promise<void>;
  isSaving: boolean;
}

export function EditPayoutAccountModal({
  account,
  isOpen,
  onClose,
  onSave,
  isSaving,
}: EditPayoutAccountModalProps) {
  const [holderName, setHolderName] = useState(account?.accountHolderName || "");
  const [bankName, setBankName] = useState(account?.bankName || "");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState(account?.ifscCode || "");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      accountHolderName: holderName.trim(),
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      ifscCode: ifsc.trim().toUpperCase(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container rounded-2xl border border-white/10 p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-2xl bg-primary-container/20 text-primary flex items-center justify-center mb-4 border border-primary/30">
          <span className="material-symbols-outlined text-2xl">account_balance</span>
        </div>

        <h3 className="text-lg font-bold text-on-surface mb-1">Update Settlement Account</h3>
        <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
          Provide updated studio bank details for automated weekly payouts.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface-variant">Account Holder Name</label>
            <input
              type="text"
              value={holderName}
              onChange={(e) => setHolderName(e.target.value)}
              required
              className="w-full bg-surface-container-low text-on-surface text-xs rounded-xl px-3.5 py-2.5 border border-white/10 focus:border-primary outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface-variant">Bank Name</label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              required
              className="w-full bg-surface-container-low text-on-surface text-xs rounded-xl px-3.5 py-2.5 border border-white/10 focus:border-primary outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface-variant">Account Number</label>
            <input
              type="password"
              placeholder="Enter new account number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
              className="w-full bg-surface-container-low text-on-surface text-xs rounded-xl px-3.5 py-2.5 border border-white/10 focus:border-primary outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface-variant">IFSC Code</label>
            <input
              type="text"
              value={ifsc}
              onChange={(e) => setIfsc(e.target.value.toUpperCase())}
              required
              className="w-full bg-surface-container-low text-on-surface text-xs font-mono uppercase rounded-xl px-3.5 py-2.5 border border-white/10 focus:border-primary outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-variant text-xs font-semibold text-on-surface transition-colors border border-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary text-xs font-bold transition-all shadow-md shadow-primary/20 flex items-center gap-1.5"
            >
              {isSaving ? <span>Saving...</span> : <span>Save Changes</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
