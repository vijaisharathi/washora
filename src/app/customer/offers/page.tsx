"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useOffersRewards } from "@/features/customer/hooks/useOffersRewards";
import { OffersHeroCard } from "@/features/customer/components/offers-rewards/OffersHeroCard";
import { OfferBentoCard, FlashSaleNotificationCard } from "@/features/customer/components/offers-rewards/OfferBentoCard";
import { RewardBalanceCard } from "@/features/customer/components/offers-rewards/RewardBalanceCard";
import { RewardCard } from "@/features/customer/components/offers-rewards/RewardCard";
import { RewardRedemptionModal } from "@/features/customer/components/offers-rewards/RewardRedemptionModal";
import { OffersSkeleton } from "@/features/customer/components/offers-rewards/OffersSkeleton";
import { RewardItem } from "@/types/customer/offersRewards";
import { Tag, Award, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CustomerOffersPage() {
  const {
    offers,
    rewardsBalance,
    redeemableRewards,
    isLoading,
    redeemReward,
    isRedeeming,
  } = useOffersRewards();

  const [activeTab, setActiveTab] = useState<"offers" | "rewards">("offers");
  const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null);

  if (isLoading) {
    return <OffersSkeleton />;
  }

  const featuredOffer = offers.find((o) => o.isFeatured) || offers[0];
  const bentoOffers = offers.filter((o) => o.id !== featuredOffer?.id);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 pb-24 animate-in fade-in zoom-in-95 duration-200">
      {/* Header Section matching Stitch anything_clean_offers_desktop */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/5 pb-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface font-headline">
            {activeTab === "offers" ? "Offers & Promotions" : "LuxeCare Rewards"}
          </h1>
          <p className="text-xs text-on-surface-variant">
            {activeTab === "offers"
              ? "Save more on your garment care, sneaker restoration, and express pickups."
              : "Earn points on every cleaning service and redeem exclusive vouchers."}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-surface-container p-1 rounded-xl border border-white/10 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("offers")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "offers"
                ? "bg-primary text-on-primary shadow-md"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Tag className="h-3.5 w-3.5" />
            <span>Offers</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("rewards")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "rewards"
                ? "bg-primary text-on-primary shadow-md"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            <span>Rewards</span>
          </button>
        </div>
      </div>

      {/* OFFERS TAB */}
      {activeTab === "offers" && (
        <div className="space-y-8">
          {featuredOffer && <OffersHeroCard offer={featuredOffer} />}

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-on-surface font-headline">
                Active Promotions &amp; Flash Deals
              </h3>
              <Link
                href="/customer/coupons"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>View All Coupons</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bentoOffers.map((offer) => (
                <OfferBentoCard key={offer.id} offer={offer} />
              ))}
              <FlashSaleNotificationCard />
            </div>
          </div>
        </div>
      )}

      {/* REWARDS TAB matching Stitch anything_clean_loyalty_rewards_mobile */}
      {activeTab === "rewards" && (
        <div className="space-y-8">
          {rewardsBalance && <RewardBalanceCard balance={rewardsBalance} />}

          <div className="space-y-4">
            <h3 className="font-bold text-base text-on-surface font-headline">
              Redeemable Vouchers &amp; Perks
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {redeemableRewards.map((reward) => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  onSelectReward={setSelectedReward}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reward Redemption Modal */}
      {selectedReward && (
        <RewardRedemptionModal
          reward={selectedReward}
          onConfirm={async () => {
            await redeemReward(selectedReward.id);
          }}
          onClose={() => setSelectedReward(null)}
          isRedeeming={isRedeeming}
        />
      )}
    </div>
  );
}
