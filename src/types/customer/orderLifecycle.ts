export type OrderLifecycleStatus =
  | "CONFIRMED"
  | "PAYMENT_CONFIRMED"
  | "PICKUP_SCHEDULED"
  | "PICKUP_IN_PROGRESS"
  | "PROVIDER_RECEIVED"
  | "IN_PROGRESS"
  | "READY_FOR_DELIVERY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderTimelineStep {
  id: string;
  title: string;
  timestamp?: string;
  state: "COMPLETED" | "ACTIVE" | "UPCOMING";
  iconName: string;
  description?: string;
}

export interface OrderTrackingDetails {
  id: string;
  orderNumber: string;
  status: OrderLifecycleStatus;
  statusLabel: string;
  serviceName: string;
  variantName?: string;
  providerName: string;
  providerRating: number;
  providerReviewCount: number;
  providerImageUrl?: string;
  pickupWindow: string;
  pickupAddressLine1: string;
  pickupAddressLine2: string;
  totalAmount: number;
  paymentMethodLabel: string;
  turnaroundEstimate: string;
  timeline: OrderTimelineStep[];
  canReschedule: boolean;
  canCancel: boolean;
}
