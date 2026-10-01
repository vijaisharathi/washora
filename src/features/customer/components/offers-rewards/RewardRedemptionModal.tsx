"use client";

import React, { useState } from "react";
import { RewardItem } from "@/types/customer/offersRewards";
import { Award, Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RewardRedemptionModalProps {
  reward: RewardItem;
  onConfirm: () => Promise<void>;
  onClose: () => void;
  isRedeeming: boolean;
}

export function RewardRedemptionModal({
  reward,
  onConfirm,
  onClose,
  isRedeeming,
}: RewardRedemptionModalProps) {
  const [success, setSuccess] = useState(false);

  const handleRedeem = async () => {
    await onConfirm();
    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-surface-container rounded-2xl border border-white/10 shadow-2xl p-6 sm:p-7 space-y-5 text-center animate-in fade-in zoom-in-95 duration-200">
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto shadow-lg ${
            success
              ? "bg-green-500/20 text-green-400 border border-green-500/30 shadow-green-500/20"
              : "bg-primary/20 text-primary border border-primary/30 shadow-primary/20"
          }`}
        >
          {success ? <Check className="h-7 w-7" /> : <Award className="h-7 w-7" />}
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-on-surface font-headline">
            {success ? "Reward Redeemed!" : "Redeem this reward?"}
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {success ? (
              <span>Your voucher has been credited and auto-applied to checkout.</span>
            ) : (
              <>
                You are about to redeem <strong className="text-on-surface">{reward.title}</strong>.<br />
                <span className="text-primary font-bold">{reward.pointsRequired} points</span> will be deducted from your balance.
              </>
            )}
          </p>
        </div>

        {!success && (
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isRedeeming}
              className="flex-1 text-xs font-semibold"
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleRedeem}
              disabled={isRedeeming}
              className="flex-1 text-xs font-bold gap-1.5 shadow-lg shadow-primary/20"
            >
              {isRedeeming ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
