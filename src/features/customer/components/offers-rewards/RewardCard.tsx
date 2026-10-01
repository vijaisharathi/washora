import React from "react";
import { RewardItem } from "@/types/customer/offersRewards";
import { CreditCard, Truck, Sparkles, Star, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RewardCardProps {
  reward: RewardItem;
  onSelectReward: (reward: RewardItem) => void;
}

const ICONS_MAP: Record<string, React.ReactNode> = {
  payments: <CreditCard className="h-6 w-6 text-primary" />,
  local_shipping: <Truck className="h-6 w-6 text-primary" />,
  cleaning_services: <Sparkles className="h-6 w-6 text-on-surface-variant" />,
};

export function RewardCard({ reward, onSelectReward }: RewardCardProps) {
  return (
    <div
      className={`rounded-2xl p-6 flex flex-col justify-between transition-all border shadow-lg relative overflow-hidden group ${
        reward.isLocked
          ? "bg-surface-container-low border-white/5 opacity-60 grayscale"
          : "bg-surface-container border-white/10 hover:border-primary/40 hover:bg-surface-container-high"
      }`}
    >
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="w-12 h-12 rounded-xl bg-surface-container-high border border-white/10 flex items-center justify-center shadow-inner">
            {ICONS_MAP[reward.iconName] || <Sparkles className="h-6 w-6 text-primary" />}
          </div>

          <div
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 font-mono ${
              reward.isLocked
                ? "bg-surface-container-high text-on-surface-variant border border-white/5"
                : "bg-primary/15 text-primary border border-primary/20"
            }`}
          >
            {reward.isLocked ? (
              <Lock className="h-3 w-3" />
            ) : (
              <Star className="h-3 w-3 fill-primary" />
            )}
            <span>{reward.pointsRequired} Pts</span>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-on-surface font-headline">
            {reward.title}
          </h3>
          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
            {reward.description}
          </p>
        </div>
      </div>

      <div className="pt-6">
        {reward.isLocked ? (
          <div className="w-full py-2 rounded-xl bg-surface-container-low border border-white/5 text-center text-xs font-semibold text-on-surface-variant">
            Insufficient Points
          </div>
        ) : (
          <Button
            size="sm"
            onClick={() => onSelectReward(reward)}
            className="w-full text-xs font-bold group-hover:bg-primary group-hover:text-on-primary shadow-lg shadow-primary/20"
          >
            Redeem Reward
          </Button>
        )}
      </div>
    </div>
  );
}
