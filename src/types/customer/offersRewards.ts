export interface PromoOfferItem {
  id: string;
  title: string;
  description: string;
  discountBadge: string;
  code: string;
  minOrder?: number;
  maxDiscount?: number;
  expiryDate: string;
  isFeatured?: boolean;
  isActive: boolean;
  imageUrl?: string;
}

export interface CouponItem {
  id: string;
  code: string;
  discountBadge: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  description: string;
  minOrderValue: number;
  maxDiscountValue?: number;
  expiryDate: string;
  isEligible: boolean;
  ineligibilityReason?: string;
  serviceCategory?: string;
}

export interface RewardItem {
  id: string;
  title: string;
  description: string;
  pointsRequired: number;
  iconName: string;
  isLocked: boolean;
  discountValue: number;
}

export interface CustomerRewardsBalance {
  points: number;
  tierName: string;
  nextRewardThreshold: number;
  pointsToNextReward: number;
  progressPercentage: number;
}
