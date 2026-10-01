/**
 * Type definitions for WASHORA Service Provider Notifications (P11)
 */

export type ProviderNotificationCategory =
  | "ALL"
  | "BOOKINGS"
  | "ORDERS"
  | "PAYMENTS"
  | "REVIEWS"
  | "ACCOUNT";

export type ProviderNotificationType =
  | "NEW_BOOKING"
  | "BOOKING_CANCELLED"
  | "ORDER_UPDATE"
  | "NEW_REVIEW"
  | "PAYOUT_PROCESSED"
  | "ACCOUNT_VERIFIED"
  | "SYSTEM_ALERT";

export interface ProviderNotificationItem {
  id: string;
  providerId: string;
  type: ProviderNotificationType;
  category: ProviderNotificationCategory;
  title: string;
  message: string;
  entityId?: string; // e.g. "ord-1042" or "QH-20260902-1041"
  entityType?: "BOOKING" | "ORDER" | "PAYOUT" | "REVIEW" | "ACCOUNT";
  actionUrl?: string; // e.g. "/provider/orders/ord-1042"
  isRead: boolean;
  timeAgo: string; // e.g. "12 min ago", "Yesterday, 4:30 PM"
  dateGroup: "TODAY" | "YESTERDAY" | "EARLIER";
  createdAt: string;
}

export interface ProviderNotificationFilters {
  category?: ProviderNotificationCategory;
  isRead?: boolean;
}

export interface ProviderNotificationPreferences {
  bookingsPush: boolean;
  bookingsEmail: boolean;
  bookingsSms: boolean;
  cancellationsPush: boolean;
  cancellationsEmail: boolean;
  cancellationsSms: boolean;
  orderStatusUpdates: boolean;
  pickupReminders: boolean;
  deliveryNotifications: boolean;
  payoutAlerts: boolean;
  reviewAlerts: boolean;
}
