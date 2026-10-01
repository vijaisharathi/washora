import {
  CustomerNotificationItem,
  NotificationPreferencesData,
} from "@/types/customer/notifications";
import { customerApi } from "@/features/customer/api/customerApi";
import { isLiveMode } from "@/lib/api";

const STORAGE_NOTIFICATIONS_KEY = "washora_customer_notifications";
const STORAGE_PREFS_KEY = "washora_customer_notification_preferences";

export const INITIAL_NOTIFICATIONS: CustomerNotificationItem[] = [
  {
    id: "notif-1",
    category: "orders",
    categoryLabel: "Order Update",
    title: "Your Sneaker Deep Clean is complete!",
    message: "CleanX Studio Partner has finished inspection and deep cleaning. Your care valet is scheduled for delivery.",
    timestamp: "2026-09-02T10:30:00Z",
    relativeTime: "12 min ago",
    isRead: false,
    orderId: "WSH-20260901-1024",
    actionUrl: "/customer/orders/WSH-20260901-1024",
    iconName: "local_shipping",
  },
  {
    id: "notif-2",
    category: "offers",
    categoryLabel: "Exclusive Offer",
    title: "20% off your next Silk & Delicates Care",
    message: "Use code LUXESILK at checkout. Valid on all certified fabric care studios until end of month.",
    timestamp: "2026-09-02T09:00:00Z",
    relativeTime: "2 hours ago",
    isRead: false,
    actionUrl: "/customer/services/silk-care",
    iconName: "loyalty",
  },
  {
    id: "notif-3",
    category: "reviews",
    categoryLabel: "Rate Your Experience",
    title: "How was your care service with CleanX?",
    message: "Help the community and earn 50 WASHORA Care Points by reviewing your recent order.",
    timestamp: "2026-09-02T08:15:00Z",
    relativeTime: "3 hours ago",
    isRead: false,
    orderId: "WSH-20260901-1024",
    actionUrl: "/customer/orders/WSH-20260901-1024/review",
    iconName: "star",
  },
  {
    id: "notif-4",
    category: "payments",
    categoryLabel: "Payment Receipt",
    title: "Payment of ₹502 confirmed",
    message: "UPI transaction TXN-20260901-1024 was processed successfully. View tax invoice and official receipt.",
    timestamp: "2026-09-01T16:30:00Z",
    relativeTime: "Yesterday",
    isRead: true,
    orderId: "WSH-20260901-1024",
    actionUrl: "/customer/orders/WSH-20260901-1024/receipt",
    iconName: "payments",
  },
  {
    id: "notif-5",
    category: "system",
    categoryLabel: "Security",
    title: "Two-factor authentication enabled",
    message: "Your WASHORA customer account is now protected with phone OTP verification on unknown devices.",
    timestamp: "2026-08-30T11:00:00Z",
    relativeTime: "Aug 30",
    isRead: true,
    actionUrl: "/customer/profile/security",
    iconName: "shield",
  },
];

export const INITIAL_PREFERENCES: NotificationPreferencesData = {
  bookingsPush: true,
  bookingsEmail: true,
  bookingsSms: true,
  orderStatusPush: true,
  orderPickupPush: true,
  orderDeliveryPush: true,
  paymentPush: true,
  paymentEmail: true,
  promoOffersPush: true,
  promoOffersEmail: true,
};

let inMemoryNotifications = [...INITIAL_NOTIFICATIONS];
let inMemoryPreferences = { ...INITIAL_PREFERENCES };

function mapNotification(n: Record<string, unknown>): CustomerNotificationItem {
  const rawCat = String(n.category || "orders").toLowerCase();
  const validCategories = ["reviews", "orders", "offers", "system", "payments"] as const;
  const category = (validCategories as readonly string[]).includes(rawCat)
    ? (rawCat as "reviews" | "orders" | "offers" | "system" | "payments")
    : "orders";

  return {
    id: String(n.id || ""),
    category,
    categoryLabel: String(n.categoryLabel || "Notification"),
    title: String(n.title || "Notification"),
    message: String(n.message || n.body || ""),
    timestamp: String(n.createdAt || new Date().toISOString()),
    relativeTime: n.createdAt ? new Date(String(n.createdAt)).toLocaleTimeString() : "Just now",
    isRead: Boolean(n.isRead),
    orderId: n.orderId ? String(n.orderId) : n.bookingId ? String(n.bookingId) : undefined,
    actionUrl: n.actionUrl ? String(n.actionUrl) : "/customer/notifications",
    iconName: String(n.iconName || "notifications"),
  };
}

export interface INotificationService {
  getNotifications(): Promise<CustomerNotificationItem[]>;
  getUnreadCount(): Promise<number>;
  markAsRead(id: string): Promise<CustomerNotificationItem[]>;
  markAllAsRead(): Promise<CustomerNotificationItem[]>;
  deleteNotification(id: string): Promise<CustomerNotificationItem[]>;
  getPreferences(): Promise<NotificationPreferencesData>;
  updatePreferences(prefs: NotificationPreferencesData): Promise<NotificationPreferencesData>;
}

class NotificationService implements INotificationService {
  private getStoredNotifications(): CustomerNotificationItem[] {
    if (typeof window === "undefined") return inMemoryNotifications;
    try {
      const stored = localStorage.getItem(STORAGE_NOTIFICATIONS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(STORAGE_NOTIFICATIONS_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    } catch {
      return inMemoryNotifications;
    }
  }

  private saveNotifications(items: CustomerNotificationItem[]) {
    inMemoryNotifications = items;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_NOTIFICATIONS_KEY, JSON.stringify(items));
      } catch {
        // ignore
      }
    }
  }

  async getNotifications(): Promise<CustomerNotificationItem[]> {
    if (isLiveMode()) {
      try {
        const res = await customerApi.notifications.list();
        const data = Array.isArray(res.data) ? res.data : [];
        const liveList = (data as Record<string, unknown>[]).map(mapNotification);
        this.saveNotifications(liveList);
        return liveList;
      } catch (err: unknown) {
        throw err;
      }
    }

    await new Promise((res) => setTimeout(res, 50));
    return this.getStoredNotifications();
  }

  async getUnreadCount(): Promise<number> {
    if (isLiveMode()) {
      try {
        const res = await customerApi.notifications.getUnreadCount();
        const data = res.data as Record<string, unknown>;
        if (typeof data?.total === "number") {
          return data.total;
        }
        if (typeof (data as Record<string, unknown>)?.unreadCount === "number") {
          return Number((data as Record<string, unknown>).unreadCount);
        }
      } catch {
        // fallback
      }
    }

    const list = this.getStoredNotifications();
    return list.filter((n) => !n.isRead).length;
  }

  async markAsRead(id: string): Promise<CustomerNotificationItem[]> {
    if (isLiveMode()) {
      try {
        await customerApi.notifications.markAsRead(id);
      } catch {
        // continue local update
      }
    }

    const list = this.getStoredNotifications().map((item) =>
      item.id === id ? { ...item, isRead: true } : item
    );
    this.saveNotifications(list);
    return list;
  }

  async markAllAsRead(): Promise<CustomerNotificationItem[]> {
    if (isLiveMode()) {
      try {
        await customerApi.notifications.markAllAsRead();
      } catch {
        // continue local update
      }
    }

    const list = this.getStoredNotifications().map((item) => ({ ...item, isRead: true }));
    this.saveNotifications(list);
    return list;
  }

  async deleteNotification(id: string): Promise<CustomerNotificationItem[]> {
    if (isLiveMode()) {
      try {
        await customerApi.notifications.archive(id);
      } catch {
        // continue local update
      }
    }

    const list = this.getStoredNotifications().filter((item) => item.id !== id);
    this.saveNotifications(list);
    return list;
  }

  async getPreferences(): Promise<NotificationPreferencesData> {
    if (isLiveMode()) {
      try {
        const res = await customerApi.notifications.getPreferences();
        if (res.data) {
          const prefs = res.data as NotificationPreferencesData;
          inMemoryPreferences = prefs;
          return prefs;
        }
      } catch (err: unknown) {
        throw err;
      }
    }

    await new Promise((res) => setTimeout(res, 50));
    if (typeof window === "undefined") return inMemoryPreferences;
    try {
      const stored = localStorage.getItem(STORAGE_PREFS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return inMemoryPreferences;
  }

  async updatePreferences(prefs: NotificationPreferencesData): Promise<NotificationPreferencesData> {
    if (isLiveMode()) {
      try {
        const res = await customerApi.notifications.updatePreferences(
          prefs as unknown as Record<string, unknown>
        );
        if (res.data) {
          const updated = res.data as NotificationPreferencesData;
          inMemoryPreferences = updated;
          return updated;
        }
      } catch (err: unknown) {
        throw err;
      }
    }

    return this.updatePreferencesMock(prefs);
  }

  private async updatePreferencesMock(prefs: NotificationPreferencesData): Promise<NotificationPreferencesData> {
    await new Promise((res) => setTimeout(res, 300));
    inMemoryPreferences = prefs;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_PREFS_KEY, JSON.stringify(prefs));
      } catch {
        // ignore
      }
    }
    return prefs;
  }
}

export const notificationService = new NotificationService();
