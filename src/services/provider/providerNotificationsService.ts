import {
  ProviderNotificationItem,
  ProviderNotificationFilters,
  ProviderNotificationPreferences,
} from "@/types/provider/notifications";
import {
  MOCK_PROVIDER_NOTIFICATIONS,
  MOCK_PROVIDER_NOTIFICATION_PREFERENCES,
} from "@/mocks/provider/notifications.mock";
import { providerApi } from "@/features/provider/api/providerApi";
import { isLiveMode } from "@/lib/api/mode";

const STORAGE_NOTIFS_KEY = "washora_provider_notifs_store";
const STORAGE_PREFS_KEY = "washora_provider_notif_prefs_store";

let inMemoryNotifs: ProviderNotificationItem[] = [...MOCK_PROVIDER_NOTIFICATIONS];
let inMemoryPrefs: ProviderNotificationPreferences = { ...MOCK_PROVIDER_NOTIFICATION_PREFERENCES };

export interface IProviderNotificationsService {
  getNotifications(
    filters?: ProviderNotificationFilters,
    providerId?: string
  ): Promise<ProviderNotificationItem[]>;
  getUnreadCount(providerId?: string): Promise<number>;
  markAsRead(notificationId: string, providerId?: string): Promise<ProviderNotificationItem>;
  markAllAsRead(providerId?: string): Promise<ProviderNotificationItem[]>;
  getPreferences(providerId?: string): Promise<ProviderNotificationPreferences>;
  updatePreferences(
    payload: Partial<ProviderNotificationPreferences>,
    providerId?: string
  ): Promise<ProviderNotificationPreferences>;
}

class ProviderNotificationsService implements IProviderNotificationsService {
  private async loadStoredNotifs(): Promise<ProviderNotificationItem[]> {
    if (typeof window === "undefined") return inMemoryNotifs;
    try {
      const stored = localStorage.getItem(STORAGE_NOTIFS_KEY);
      if (stored) {
        inMemoryNotifs = JSON.parse(stored);
        return inMemoryNotifs;
      }
    } catch {
      return inMemoryNotifs;
    }
    return inMemoryNotifs;
  }

  private persistNotifs(notifs: ProviderNotificationItem[]): void {
    inMemoryNotifs = notifs;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_NOTIFS_KEY, JSON.stringify(notifs));
      } catch {
        // ignore
      }
    }
  }

  private async loadStoredPrefs(): Promise<ProviderNotificationPreferences> {
    if (typeof window === "undefined") return inMemoryPrefs;
    try {
      const stored = localStorage.getItem(STORAGE_PREFS_KEY);
      if (stored) {
        inMemoryPrefs = JSON.parse(stored);
        return inMemoryPrefs;
      }
    } catch {
      return inMemoryPrefs;
    }
    return inMemoryPrefs;
  }

  private persistPrefs(prefs: ProviderNotificationPreferences): void {
    inMemoryPrefs = prefs;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_PREFS_KEY, JSON.stringify(prefs));
      } catch {
        // ignore
      }
    }
  }

  async getNotifications(
    filters?: ProviderNotificationFilters,
    providerId: string = "prov-1"
  ): Promise<ProviderNotificationItem[]> {
    if (isLiveMode()) {
      const res = await providerApi.notifications.list();
      const raw = Array.isArray(res.data) ? res.data : (res as any).data?.items || [];

      return raw.map((n: any) => ({
        id: n.id,
        providerId,
        type: (n.type === "NEW_BOOKING" || n.type === "BOOKING_CANCELLED" || n.type === "ORDER_UPDATE" || n.type === "NEW_REVIEW" || n.type === "PAYOUT_PROCESSED" || n.type === "ACCOUNT_VERIFIED" || n.type === "SYSTEM_ALERT"
          ? n.type
          : "ORDER_UPDATE") as ProviderNotificationItem["type"],
        category: (n.type?.includes("BOOKING") ? "BOOKINGS" : n.type?.includes("REVIEW") ? "REVIEWS" : n.type?.includes("PAYOUT") ? "PAYMENTS" : "ORDERS") as ProviderNotificationItem["category"],
        title: n.title,
        message: n.body || n.message,
        actionUrl: n.data?.actionUrl || "/provider",
        entityId: n.data?.bookingId || n.data?.orderId,
        isRead: !!n.isRead,
        timeAgo: "Just now",
        dateGroup: "TODAY",
        createdAt: n.createdAt || new Date().toISOString(),
      }));
    }

    await new Promise((res) => setTimeout(res, 50));
    const all = await this.loadStoredNotifs();

    let filtered = all;
    if (filters?.category && filters.category !== "ALL") {
      filtered = filtered.filter((n) => n.category === filters.category);
    }

    if (filters?.isRead !== undefined) {
      filtered = filtered.filter((n) => n.isRead === filters.isRead);
    }

    return filtered;
  }

  async getUnreadCount(providerId: string = "prov-1"): Promise<number> {
    if (isLiveMode()) {
      try {
        const res = await providerApi.notifications.unreadCount();
        return res.data?.unreadCount ?? 0;
      } catch {
        return 0;
      }
    }

    await new Promise((res) => setTimeout(res, 50));
    const all = await this.loadStoredNotifs();
    return all.filter((n) => !n.isRead).length;
  }

  async markAsRead(notificationId: string, providerId: string = "prov-1"): Promise<ProviderNotificationItem> {
    if (isLiveMode()) {
      const res = await providerApi.notifications.markRead(notificationId);
      const n = res.data;
      return {
        id: n.id,
        providerId,
        title: n.title,
        message: n.body,
        type: "ORDER_UPDATE",
        category: "ORDERS",
        isRead: true,
        timeAgo: "Just now",
        dateGroup: "TODAY",
        createdAt: n.createdAt,
        actionUrl: "/provider",
      };
    }

    await new Promise((res) => setTimeout(res, 150));
    const all = await this.loadStoredNotifs();
    const index = all.findIndex((n) => n.id === notificationId);

    if (index === -1) {
      throw new Error(`Notification ${notificationId} not found.`);
    }

    const updated = { ...all[index], isRead: true };
    all[index] = updated;
    this.persistNotifs([...all]);
    return updated;
  }

  async markAllAsRead(providerId: string = "prov-1"): Promise<ProviderNotificationItem[]> {
    if (isLiveMode()) {
      await providerApi.notifications.markAllRead();
      return this.getNotifications(undefined, providerId);
    }

    await new Promise((res) => setTimeout(res, 200));
    const all = await this.loadStoredNotifs();
    const updated = all.map((n) => ({ ...n, isRead: true }));
    this.persistNotifs(updated);
    return updated;
  }

  async getPreferences(providerId: string = "prov-1"): Promise<ProviderNotificationPreferences> {
    if (isLiveMode()) {
      try {
        const res = await providerApi.notifications.getPreferences();
        const p = res.data;
        const stored = await this.loadStoredPrefs();
        return {
          ...stored,
          bookingsPush: p.push ?? true,
          bookingsEmail: p.email ?? true,
          bookingsSms: p.sms ?? false,
          orderStatusUpdates: p.orderUpdates ?? true,
        };
      } catch {
        return this.loadStoredPrefs();
      }
    }

    await new Promise((res) => setTimeout(res, 50));
    return this.loadStoredPrefs();
  }

  async updatePreferences(
    payload: Partial<ProviderNotificationPreferences>,
    providerId: string = "prov-1"
  ): Promise<ProviderNotificationPreferences> {
    if (isLiveMode()) {
      await providerApi.notifications.updatePreferences({
        sms: payload.bookingsSms,
        email: payload.bookingsEmail,
        push: payload.bookingsPush,
        orderUpdates: payload.orderStatusUpdates,
      });
      return this.getPreferences(providerId);
    }

    await new Promise((res) => setTimeout(res, 200));
    const current = await this.loadStoredPrefs();
    const updated = { ...current, ...payload };
    this.persistPrefs(updated);
    return updated;
  }
}

export const providerNotificationsService = new ProviderNotificationsService();
