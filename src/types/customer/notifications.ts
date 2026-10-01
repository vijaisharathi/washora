export type NotificationCategory =
  | "all"
  | "orders"
  | "offers"
  | "system"
  | "reviews"
  | "payments";

export interface CustomerNotificationItem {
  id: string;
  category: "orders" | "offers" | "system" | "reviews" | "payments";
  categoryLabel: string;
  title: string;
  message: string;
  timestamp: string;
  relativeTime: string;
  isRead: boolean;
  orderId?: string;
  actionUrl?: string;
  iconName: string;
  accentColor?: string;
}

export interface NotificationPreferencesData {
  bookingsPush: boolean;
  bookingsEmail: boolean;
  bookingsSms: boolean;
  orderStatusPush: boolean;
  orderPickupPush: boolean;
  orderDeliveryPush: boolean;
  paymentPush: boolean;
  paymentEmail: boolean;
  promoOffersPush: boolean;
  promoOffersEmail: boolean;
}
