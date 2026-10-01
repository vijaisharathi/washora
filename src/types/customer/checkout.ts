import { CustomerBookingDraft } from "./booking";

export interface AppliedCoupon {
  code: string;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: number;
  discountAmount: number;
  description: string;
}

export interface CheckoutPricing {
  subtotal: number;
  discount: number;
  pickupFee: number;
  deliveryFee: number;
  taxes: number;
  total: number;
}

export interface CheckoutSummary {
  draft: CustomerBookingDraft;
  pricing: CheckoutPricing;
  appliedCoupon?: AppliedCoupon;
}
