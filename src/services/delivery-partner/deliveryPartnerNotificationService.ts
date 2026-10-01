import {
  DeliveryPartnerNotification,
  NotificationFilterParams,
} from "@/types/delivery-partner";
import { MOCK_NOTIFICATIONS } from "@/mocks/delivery-partner/notifications.mock";
import { deliveryPartnerAuthService } from "./deliveryPartnerAuthService";
import { deliveryPartnerApi } from "@/features/delivery-partner/api/deliveryPartnerApi";
import { isLiveMode } from "@/lib/api/mode";

const STORAGE_NOTIFICATIONS_KEY = "washora_delivery_partner_notifications";

function mapBackendNotification(n: any, partnerId: string): DeliveryPartnerNotification {
  return {
    id: n.id,
    partnerId: n.userId || partnerId,
    category: n.category || "TASK",
    priority: n.priority || "NORMAL",
    title: n.title,
    message: n.content || n.message || "",
    timestamp: n.createdAt || new Date().toISOString(),
    isRead: !!n.isRead,
    actionUrl: n.actionUrl,
    actionLabel: n.actionLabel,
    relatedOrderId: n.relatedEntityId,
  };
}

export interface IDeliveryPartnerNotificationService {
  getNotifications(filter?: NotificationFilterParams): Promise<DeliveryPartnerNotification[]>;
  getUnreadCount(): Promise<number>;
  getNotificationById(id: string): Promise<DeliveryPartnerNotification | null>;
  markAsRead(id: string): Promise<boolean>;
  markAsUnread(id: string): Promise<boolean>;
  markAllAsRead(): Promise<boolean>;
}

class DeliveryPartnerNotificationService implements IDeliveryPartnerNotificationService {
  private memoryNotifications: DeliveryPartnerNotification[] | null = null;

  private loadNotifications(): DeliveryPartnerNotification[] {
    if (this.memoryNotifications) return this.memoryNotifications;
    if (typeof window !== "undefined") {
      try {
        const val = localStorage.getItem(STORAGE_NOTIFICATIONS_KEY);
        if (val) {
          this.memoryNotifications = JSON.parse(val);
          return this.memoryNotifications!;
        }
      } catch {
        // ignore
      }
    }
    this.memoryNotifications = [...MOCK_NOTIFICATIONS];
    return this.memoryNotifications;
  }

  private persistNotifications(notifs: DeliveryPartnerNotification[]) {
    this.memoryNotifications = notifs;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_NOTIFICATIONS_KEY, JSON.stringify(notifs));
      } catch {
        // ignore
      }
    }
  }

  async getNotifications(filter?: NotificationFilterParams): Promise<DeliveryPartnerNotification[]> {
    if (isLiveMode()) {
      const session = await deliveryPartnerAuthService.getSession();
      const currentPartnerId = session.partner?.id || "dp-1";

      const queryParams: Record<string, any> = {};
      if (filter?.readStatus && filter.readStatus !== "ALL") {
        queryParams.unreadOnly = filter.readStatus === "UNREAD";
      }

      const res = await deliveryPartnerApi.notifications.list(queryParams);
      const items: any[] = Array.isArray(res.data) ? res.data : [];
      let notifs = items.map((n: any) => mapBackendNotification(n, currentPartnerId));

      if (filter?.category && filter.category !== "ALL") {
        notifs = notifs.filter((n: DeliveryPartnerNotification) => n.category === filter.category);
      }

      if (filter?.searchQuery && filter.searchQuery.trim()) {
        const q = filter.searchQuery.toLowerCase().trim();
        notifs = notifs.filter(
          (n: DeliveryPartnerNotification) =>
            n.title.toLowerCase().includes(q) ||
            n.message.toLowerCase().includes(q) ||
            (n.relatedOrderId && n.relatedOrderId.toLowerCase().includes(q))
        );
      }

      return notifs;
    }

    await new Promise((res) => setTimeout(res, 50));
    const session = await deliveryPartnerAuthService.getSession();
    const currentPartnerId = session.partner?.id || "dp-1";

    let notifs = this.loadNotifications().filter((n) => n.partnerId === currentPartnerId);

    if (filter?.category && filter.category !== "ALL") {
      notifs = notifs.filter((n) => n.category === filter.category);
    }

    if (filter?.readStatus && filter.readStatus !== "ALL") {
      if (filter.readStatus === "UNREAD") {
        notifs = notifs.filter((n) => !n.isRead);
      } else if (filter.readStatus === "READ") {
        notifs = notifs.filter((n) => n.isRead);
      }
    }

    if (filter?.searchQuery && filter.searchQuery.trim()) {
      const q = filter.searchQuery.toLowerCase().trim();
      notifs = notifs.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q) ||
          (n.relatedOrderId && n.relatedOrderId.toLowerCase().includes(q))
      );
    }

    return notifs;
  }

  async getUnreadCount(): Promise<number> {
    if (isLiveMode()) {
      try {
        const res = await deliveryPartnerApi.notifications.unreadCount();
        return typeof res.data?.unreadCount === "number" ? res.data.unreadCount : 0;
      } catch {
        return 0;
      }
    }

    await new Promise((res) => setTimeout(res, 20));
    const session = await deliveryPartnerAuthService.getSession();
    const currentPartnerId = session.partner?.id || "dp-1";

    const notifs = this.loadNotifications().filter((n) => n.partnerId === currentPartnerId);
    return notifs.filter((n) => !n.isRead).length;
  }

  async getNotificationById(id: string): Promise<DeliveryPartnerNotification | null> {
    await new Promise((res) => setTimeout(res, 40));
    const session = await deliveryPartnerAuthService.getSession();
    const currentPartnerId = session.partner?.id || "dp-1";

    const allNotifs = await this.getNotifications();
    const target = allNotifs.find((n) => n.id === id && n.partnerId === currentPartnerId);
    if (target && !target.isRead) {
      await this.markAsRead(id);
    }
    return target || null;
  }

  async markAsRead(id: string): Promise<boolean> {
    if (isLiveMode()) {
      await deliveryPartnerApi.notifications.markRead(id);
      return true;
    }

    await new Promise((res) => setTimeout(res, 40));
    const allNotifs = this.loadNotifications();
    const target = allNotifs.find((n) => n.id === id);
    if (target) {
      target.isRead = true;
      this.persistNotifications(allNotifs);
      return true;
    }
    return false;
  }

  async markAsUnread(id: string): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 40));
    const allNotifs = this.loadNotifications();
    const target = allNotifs.find((n) => n.id === id);
    if (target) {
      target.isRead = false;
      this.persistNotifications(allNotifs);
      return true;
    }
    return false;
  }

  async markAllAsRead(): Promise<boolean> {
    if (isLiveMode()) {
      await deliveryPartnerApi.notifications.markAllRead();
      return true;
    }

    await new Promise((res) => setTimeout(res, 80));
    const session = await deliveryPartnerAuthService.getSession();
    const currentPartnerId = session.partner?.id || "dp-1";

    const allNotifs = this.loadNotifications();
    allNotifs.forEach((n) => {
      if (n.partnerId === currentPartnerId) {
        n.isRead = true;
      }
    });
    this.persistNotifications(allNotifs);
    return true;
  }
}

export const deliveryPartnerNotificationService = new DeliveryPartnerNotificationService();
