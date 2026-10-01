import React from "react";
import { CustomerRewardsBalance } from "@/types/customer/offersRewards";
import { Award, Sparkles } from "lucide-react";

interface RewardBalanceCardProps {
  balance: CustomerRewardsBalance;
}

export function RewardBalanceCard({ balance }: RewardBalanceCardProps) {
  return (
    <section className="relative bg-surface-container border border-primary/30 rounded-2xl overflow-hidden p-6 sm:p-8 shadow-2xl">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-surface-container to-surface-container -z-10" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block">
              Available Balance
            </span>
            <span className="bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
              {balance.tierName}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-extrabold text-4xl sm:text-5xl text-primary font-headline font-mono">
              {balance.points.toLocaleString()}
            </span>
            <span className="text-sm sm:text-base font-bold text-on-surface-variant">
              Points
            </span>
          </div>
        </div>

        {/* Progress to Next Reward Module matching Stitch */}
        <div className="w-full md:w-1/2 bg-surface-container-low/70 backdrop-blur-md border border-white/10 rounded-xl p-4 space-y-2 shadow-inner">
          <div className="flex justify-between items-center text-xs">
            <span className="text-on-surface-variant">
              {balance.pointsToNextReward} points to your next reward
            </span>
            <span className="font-bold text-on-surface font-mono">
              {balance.nextRewardThreshold}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2.5 w-full bg-surface-container-high rounded-full overflow-hidden p-0.5 border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-primary to-electric-violet rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(138,43,226,0.6)]"
              style={{ width: `${balance.progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
