import {
  AppliedCoupon,
  CheckoutPricing,
  CheckoutSummary,
} from "@/types/customer/checkout";
import { bookingService } from "@/services/bookingService";
import { offersRewardsService } from "@/services/offersRewardsService";

export interface ICheckoutService {
  getCheckoutSummary(): Promise<CheckoutSummary>;
  validateCoupon(code: string, subtotal: number): Promise<AppliedCoupon>;
  calculatePricing(subtotal: number, coupon?: AppliedCoupon): CheckoutPricing;
}

class CheckoutService implements ICheckoutService {
  calculatePricing(subtotal: number, coupon?: AppliedCoupon): CheckoutPricing {
    const discount = coupon ? coupon.discountAmount : 0;
    const pickupFee = 0; // Free pickup in WASHORA standard tier
    const deliveryFee = 0; // Free doorstep return
    const taxes = Math.round((subtotal - discount) * 0.05); // 5% GST
    const total = Math.max(0, subtotal - discount + pickupFee + deliveryFee + taxes);

    return {
      subtotal,
      discount,
      pickupFee,
      deliveryFee,
      taxes,
      total,
    };
  }

  async validateCoupon(code: string, subtotal: number): Promise<AppliedCoupon> {
    const res = await offersRewardsService.validateCoupon(code, subtotal);
    if (!res.valid || !res.coupon) {
      throw new Error(res.message || "Invalid coupon code. Please check and try again.");
    }

    const c = res.coupon;
    let discountAmount = 0;
    if (c.discountType === "percentage") {
      discountAmount = Math.round((subtotal * c.discountValue) / 100);
      if (c.maxDiscountValue && discountAmount > c.maxDiscountValue) {
        discountAmount = c.maxDiscountValue;
      }
    } else {
      discountAmount = c.discountValue;
    }

    return {
      code: c.code,
      discountType: c.discountType === "percentage" ? "PERCENTAGE" : "FLAT",
      discountValue: c.discountValue,
      discountAmount,
      description: c.description,
    };
  }

  async getCheckoutSummary(): Promise<CheckoutSummary> {
    await new Promise((res) => setTimeout(res, 150));

    let draft = await bookingService.getSavedDraft();
    if (!draft) {
      draft = await bookingService.getInitialDraft({ serviceId: "srv-1" });
    }

    const subtotal = draft.estimatedServiceTotal || 449;

    // Check if a coupon is already applied via C18 Offers/Coupons
    const savedCoupon = await offersRewardsService.getAppliedCoupon();
    let appliedCoupon: AppliedCoupon | undefined = undefined;

    if (savedCoupon && subtotal >= savedCoupon.minOrderValue) {
      let discountAmount = 0;
      if (savedCoupon.discountType === "percentage") {
        discountAmount = Math.round((subtotal * savedCoupon.discountValue) / 100);
        if (savedCoupon.maxDiscountValue && discountAmount > savedCoupon.maxDiscountValue) {
          discountAmount = savedCoupon.maxDiscountValue;
        }
      } else {
        discountAmount = savedCoupon.discountValue;
      }

      appliedCoupon = {
        code: savedCoupon.code,
        discountType: savedCoupon.discountType === "percentage" ? "PERCENTAGE" : "FLAT",
        discountValue: savedCoupon.discountValue,
        discountAmount,
        description: savedCoupon.description,
      };
    }

    const pricing = this.calculatePricing(subtotal, appliedCoupon);

    return {
      draft,
      pricing,
      appliedCoupon,
    };
  }
}

export const checkoutService = new CheckoutService();
