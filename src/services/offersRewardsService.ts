import {
  PromoOfferItem,
  CouponItem,
  CustomerRewardsBalance,
  RewardItem,
} from "@/types/customer/offersRewards";
import { customerApi } from "@/features/customer/api/customerApi";
import { isLiveMode } from "@/lib/api";

const STORAGE_APPLIED_COUPON_KEY = "washora_customer_applied_coupon";
const STORAGE_REWARDS_BALANCE_KEY = "washora_customer_rewards_points";

let inMemoryPoints = 1240;
let inMemoryCoupon: CouponItem | null = null;

export const PROMO_OFFERS: PromoOfferItem[] = [
  {
    id: "offer-hero-1",
    title: "20% Off Luxe Fabric Care",
    description: "Applicable on all designer couture, silks and woolens",
    code: "FRESH20",
    discountBadge: "20% OFF",
    expiryDate: "Sep 30, 2026",
    isFeatured: true,
    isActive: true,
    minOrder: 399,
    maxDiscount: 150,
  },
  {
    id: "offer-2",
    title: "₹100 Off Sneaker Deep Clean",
    description: "Complete foam extraction & midsole restoration",
    code: "SHOE100",
    discountBadge: "₹100 OFF",
    expiryDate: "Oct 15, 2026",
    isFeatured: false,
    isActive: true,
    minOrder: 599,
  },
  {
    id: "offer-3",
    title: "Free Doorstep Valet Pickup",
    description: "Complimentary priority doorstep pickup & return",
    code: "PICKFREE",
    discountBadge: "FREE PICKUP",
    expiryDate: "Ongoing",
    isFeatured: false,
    isActive: true,
  },
];

export const AVAILABLE_COUPONS: CouponItem[] = [
  {
    id: "cpn-1",
    code: "FRESH20",
    discountBadge: "20% OFF",
    discountType: "percentage",
    discountValue: 20,
    description: "Save 20% on any dry cleaning or shoe care order.",
    minOrderValue: 399,
    maxDiscountValue: 150,
    expiryDate: "Sep 30, 2026",
    isEligible: true,
  },
  {
    id: "cpn-2",
    code: "CLEAN50",
    discountBadge: "FLAT ₹50",
    discountType: "fixed",
    discountValue: 50,
    description: "Flat ₹50 discount on any service category.",
    minOrderValue: 0,
    expiryDate: "Dec 31, 2026",
    isEligible: true,
  },
  {
    id: "cpn-3",
    code: "SHOE100",
    discountBadge: "₹100 OFF",
    discountType: "fixed",
    discountValue: 100,
    description: "Save ₹100 on multi-pair sneaker restoration.",
    minOrderValue: 599,
    expiryDate: "Oct 15, 2026",
    isEligible: false,
    ineligibilityReason: "Min order value of ₹599 required",
  },
];

export const REDEEMABLE_REWARDS: RewardItem[] = [
  {
    id: "rwd-1",
    title: "₹100 Voucher",
    description: "Get ₹100 discount credited instantly to checkout.",
    pointsRequired: 500,
    iconName: "redeem",
    isLocked: false,
    discountValue: 100,
  },
  {
    id: "rwd-2",
    title: "Free Valet Pickup",
    description: "Waive the doorstep collection fee on your next booking.",
    pointsRequired: 800,
    iconName: "local_shipping",
    isLocked: false,
    discountValue: 60,
  },
  {
    id: "rwd-3",
    title: "Deep Clean Pass",
    description: "One free comprehensive sneaker or silk care session.",
    pointsRequired: 2000,
    iconName: "cleaning_services",
    isLocked: true,
    discountValue: 400,
  },
];

function mapOffer(o: Record<string, unknown>): PromoOfferItem {
  return {
    id: String(o.id || ""),
    title: String(o.title || o.name || "Special Offer"),
    description: String(o.description || ""),
    code: String(o.code || "SAVE10"),
    discountBadge: String(o.badge || `${o.discountValue || 10}% OFF`),
    expiryDate: o.validUntil ? new Date(String(o.validUntil)).toLocaleDateString() : "Ongoing",
    isFeatured: Boolean(o.isFeatured),
    isActive: o.isActive !== false,
    minOrder: typeof o.minOrderValue === "number" ? o.minOrderValue : undefined,
    maxDiscount: typeof o.maxDiscountValue === "number" ? o.maxDiscountValue : undefined,
  };
}

export interface IOffersRewardsService {
  getOffers(): Promise<PromoOfferItem[]>;
  getCoupons(): Promise<CouponItem[]>;
  validateCoupon(code: string, cartTotal?: number): Promise<{ valid: boolean; coupon?: CouponItem; message?: string }>;
  getAppliedCoupon(): Promise<CouponItem | null>;
  applyCoupon(code: string, cartTotal?: number): Promise<CouponItem>;
  removeCoupon(): Promise<void>;
  getRewardsBalance(): Promise<CustomerRewardsBalance>;
  getRedeemableRewards(): Promise<RewardItem[]>;
  redeemReward(rewardId: string): Promise<CustomerRewardsBalance>;
}

class OffersRewardsService implements IOffersRewardsService {
  async getOffers(): Promise<PromoOfferItem[]> {
    if (isLiveMode()) {
      try {
        const res = await customerApi.offers.list();
        const data = Array.isArray(res.data) ? res.data : [];
        return (data as Record<string, unknown>[]).map(mapOffer);
      } catch (err: unknown) {
        throw err;
      }
    }

    await new Promise((res) => setTimeout(res, 50));
    return PROMO_OFFERS;
  }

  async getCoupons(): Promise<CouponItem[]> {
    await new Promise((res) => setTimeout(res, 50));
    return AVAILABLE_COUPONS;
  }

  async validateCoupon(code: string, cartTotal: number = 502): Promise<{ valid: boolean; coupon?: CouponItem; message?: string }> {
    if (isLiveMode()) {
      try {
        const res = await customerApi.coupons.validate({ code, subtotal: cartTotal });
        const data = res.data as Record<string, unknown>;
        const coupon: CouponItem = {
          id: String(data.couponId || `cpn-${Date.now()}`),
          code: code.toUpperCase(),
          discountBadge: `₹${data.discountAmount || 50} OFF`,
          discountType: "fixed",
          discountValue: Number(data.discountAmount) || 50,
          description: String(data.description || "Applied coupon"),
          minOrderValue: 0,
          expiryDate: "Ongoing",
          isEligible: true,
        };
        return { valid: true, coupon };
      } catch (err: unknown) {
        throw err;
      }
    }

    return this.validateCouponMock(code, cartTotal);
  }

  private async validateCouponMock(code: string, cartTotal: number): Promise<{ valid: boolean; coupon?: CouponItem; message?: string }> {
    await new Promise((res) => setTimeout(res, 100));
    const normalized = code.trim().toUpperCase();
    const match = AVAILABLE_COUPONS.find((c) => c.code.toUpperCase() === normalized);

    if (!match) {
      return { valid: false, message: "Invalid coupon code. Please check and try again." };
    }

    if (cartTotal < match.minOrderValue) {
      return {
        valid: false,
        coupon: match,
        message: `Min order value of ₹${match.minOrderValue} required for ${match.code}.`,
      };
    }

    return { valid: true, coupon: match };
  }

  async getAppliedCoupon(): Promise<CouponItem | null> {
    if (typeof window === "undefined") return inMemoryCoupon;
    try {
      const stored = localStorage.getItem(STORAGE_APPLIED_COUPON_KEY);
      return stored ? JSON.parse(stored) : inMemoryCoupon;
    } catch {
      return inMemoryCoupon;
    }
  }

  async applyCoupon(code: string, cartTotal: number = 502): Promise<CouponItem> {
    const { valid, coupon, message } = await this.validateCoupon(code, cartTotal);
    if (!valid || !coupon) {
      throw new Error(message || "Unable to apply coupon");
    }

    inMemoryCoupon = coupon;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_APPLIED_COUPON_KEY, JSON.stringify(coupon));
      } catch {
        // ignore
      }
    }

    return coupon;
  }

  async removeCoupon(): Promise<void> {
    inMemoryCoupon = null;
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_APPLIED_COUPON_KEY);
      } catch {
        // ignore
      }
    }
  }

  async getRewardsBalance(): Promise<CustomerRewardsBalance> {
    if (isLiveMode()) {
      try {
        const res = await customerApi.rewards.get();
        const data = res.data as Record<string, unknown>;
        if (data) {
          const points = Number(data.balance || data.points) || inMemoryPoints;
          const nextThreshold = 1500;
          return {
            points,
            tierName: String(data.tier || "Luxe Elite Member"),
            nextRewardThreshold: nextThreshold,
            pointsToNextReward: Math.max(0, nextThreshold - points),
            progressPercentage: Math.min(100, Math.round((points / nextThreshold) * 100)),
          };
        }
      } catch (err: unknown) {
        throw err;
      }
    }

    return this.getRewardsBalanceMock();
  }

  private async getRewardsBalanceMock(): Promise<CustomerRewardsBalance> {
    await new Promise((res) => setTimeout(res, 50));
    let points = inMemoryPoints;

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_REWARDS_BALANCE_KEY);
        if (stored) {
          points = parseInt(stored, 10);
        }
      } catch {
        // ignore
      }
    }

    const nextThreshold = 1500;
    const pointsToNext = Math.max(0, nextThreshold - points);
    const progress = Math.min(100, Math.round((points / nextThreshold) * 100));

    return {
      points,
      tierName: "Luxe Elite Member",
      nextRewardThreshold: nextThreshold,
      pointsToNextReward: pointsToNext,
      progressPercentage: progress,
    };
  }

  async getRedeemableRewards(): Promise<RewardItem[]> {
    await new Promise((res) => setTimeout(res, 50));
    const balance = await this.getRewardsBalance();

    return REDEEMABLE_REWARDS.map((r) => ({
      ...r,
      isLocked: r.pointsRequired > balance.points,
    }));
  }

  async redeemReward(rewardId: string): Promise<CustomerRewardsBalance> {
    await new Promise((res) => setTimeout(res, 200));
    const reward = REDEEMABLE_REWARDS.find((r) => r.id === rewardId);
    if (!reward) throw new Error("Reward not found");

    const current = await this.getRewardsBalance();
    if (current.points < reward.pointsRequired) {
      throw new Error("Insufficient reward points");
    }

    const newPoints = current.points - reward.pointsRequired;
    inMemoryPoints = newPoints;

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_REWARDS_BALANCE_KEY, newPoints.toString());
      } catch {
        // ignore
      }
    }

    return this.getRewardsBalance();
  }
}

export const offersRewardsService = new OffersRewardsService();
