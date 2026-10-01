"use client";

import React from "react";
import { ProviderPayoutAccount } from "@/types/provider/earnings";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

interface PayoutAccountCardProps {
  account?: ProviderPayoutAccount;
  onEditClick: () => void;
}

export function PayoutAccountCard({ account, onEditClick }: PayoutAccountCardProps) {
  if (!account) return null;

  return (
    <ProviderCard variant="container" className="p-6 space-y-4 border-l-4 border-l-primary">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-primary text-xl">account_balance</span>
          <div>
            <h3 className="text-base font-bold text-on-surface">Payout Bank Account</h3>
            <p className="text-xs text-on-surface-variant">Direct settlement destination</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onEditClick}
          className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-variant text-xs font-semibold text-primary transition-colors border border-white/5"
        >
          Edit Account
        </button>
      </div>

      <div className="p-4 rounded-xl bg-surface-container-low border border-white/5 space-y-2 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-on-surface-variant">Account Holder:</span>
          <strong className="text-on-surface">{account.accountHolderName}</strong>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-on-surface-variant">Bank &amp; IFSC:</span>
          <strong className="text-on-surface">{account.bankName} ({account.ifscCode})</strong>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-on-surface-variant">Account Number:</span>
          <strong className="font-mono text-on-surface">{account.accountNumberMasked}</strong>
        </div>
        <div className="flex justify-between items-center pt-1 border-t border-white/5">
          <span className="text-on-surface-variant">Settlement Cycle:</span>
          <span className="text-primary font-bold">Weekly every Monday (Auto-transfer)</span>
        </div>
      </div>
    </ProviderCard>
  );
}
