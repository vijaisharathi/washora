import {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationStatus,
  CommunicationMessage,
  CommunicationChannel,
  CommunicationStatus,
  RecipientType,
  NotificationPreferences,
  NotificationSummaryMetrics,
  ListNotificationsParams,
  ListNotificationsResult,
  NotificationDetailResult,
  ListCommunicationsParams,
  ListCommunicationsResult,
  CommunicationDetailResult,
} from "@/types/admin/notification";
import {
  getMockNotifications,
  getMockCommunications,
  markNotificationAsReadInStore,
  markNotificationAsUnreadInStore,
  markAllNotificationsAsReadInStore,
  dismissNotificationInStore,
  saveCommunicationDraftInStore,
  sendCommunicationMessageInStore,
  archiveCommunicationMessageInStore,
  deleteCommunicationDraftInStore,
  getNotificationPreferencesInStore,
  updateNotificationPreferencesInStore,
  createMockNotificationInStore,
} from "@/mocks/admin/notification.mock";
import { INITIAL_ORG_0001_CUSTOMERS, INITIAL_ORG_0002_CUSTOMERS } from "@/mocks/admin/customer.mock";
import { INITIAL_ORG_0001_PROVIDERS, INITIAL_ORG_0002_PROVIDERS } from "@/mocks/admin/provider.mock";
import { INITIAL_ORG_0001_DELIVERY_PARTNERS, INITIAL_ORG_0002_DELIVERY_PARTNERS } from "@/mocks/admin/deliveryPartner.mock";
import { INITIAL_ORG_0001_BOOKINGS, INITIAL_ORG_0002_BOOKINGS } from "@/mocks/admin/booking.mock";
import { INITIAL_ORG_0001_SERVICES, INITIAL_ORG_0002_SERVICES } from "@/mocks/admin/serviceCatalog.mock";
import { INITIAL_ORG_0001_REVIEWS, INITIAL_ORG_0002_REVIEWS } from "@/mocks/admin/review.mock";
import { isLiveMode } from "@/lib/api/mode";
import { adminApi } from "@/features/admin/api/adminApi";

function mapBackendNotificationToNotification(n: any): Notification {
  return {
    id: n.id,
    organizationId: n.organizationId || "ORG-0001",
    userId: n.userId || undefined,
    type: (n.type || "System") as NotificationType,
    priority: (n.priority || "Normal") as NotificationPriority,
    status: (n.isRead ? "Read" : "Unread") as NotificationStatus,
    title: n.title || "",
    message: n.message || "",
    relatedEntityType: n.relatedEntityType,
    relatedEntityId: n.relatedEntityId,
    actionRoute: n.actionRoute,
    actorName: n.actorName || "System",
    createdAt: n.createdAt || new Date().toISOString(),
  };
}

const PRIORITY_WEIGHTS: Record<NotificationPriority, number> = {
  Critical: 4,
  High: 3,
  Normal: 2,
  Low: 1,
};

/**
 * Returns summary counts for notifications
 */
export async function getNotificationSummary(
  orgId: string,
  userId: string
): Promise<NotificationSummaryMetrics> {
  if (isLiveMode()) {
    const res = await adminApi.notifications.list({ limit: 100 });
    const list: Notification[] = (res.data || []).map(mapBackendNotificationToNotification);
    return {
      totalNotifications: list.length,
      unreadCount: list.filter((n: Notification) => n.status === "Unread").length,
      criticalCount: list.filter((n: Notification) => n.priority === "Critical").length,
      highPriorityCount: list.filter((n: Notification) => n.priority === "High").length,
    };
  }

  const notifications = getMockNotifications(orgId, userId);
  let unreadCount = 0;
  let criticalCount = 0;
  let highPriorityCount = 0;

  notifications.forEach((n) => {
    if (n.status === "Unread") unreadCount++;
    if (n.priority === "Critical") criticalCount++;
    if (n.priority === "High") highPriorityCount++;
  });

  return {
    totalNotifications: notifications.length,
    unreadCount,
    criticalCount,
    highPriorityCount,
  };
}

export async function getUnreadNotificationCount(
  orgId: string,
  userId: string
): Promise<number> {
  if (isLiveMode()) {
    const res = await adminApi.notifications.list({ limit: 100 });
    const list: Notification[] = (res.data || []).map(mapBackendNotificationToNotification);
    return list.filter((n: Notification) => n.status === "Unread").length;
  }

  const notifications = getMockNotifications(orgId, userId);
  return notifications.filter((n) => n.status === "Unread").length;
}

/**
 * Lists notifications with full search, filter, sort, and pagination
 */
export async function listNotifications(
  params: ListNotificationsParams
): Promise<ListNotificationsResult> {
  if (isLiveMode()) {
    const res = await adminApi.notifications.list({
      page: params.page,
      limit: params.pageSize,
      search: params.search,
    });
    const items: Notification[] = (res.data || []).map(mapBackendNotificationToNotification);
    const unreadCount = items.filter((n: Notification) => n.status === "Unread").length;
    const meta = (res as any).meta || { page: params.page || 1, limit: params.pageSize || 10, total: items.length, totalPages: 1 };
    return {
      notifications: items,
      total: meta.total,
      page: meta.page,
      pageSize: meta.limit,
      totalPages: meta.totalPages || Math.ceil(meta.total / (meta.limit || 10)),
      unreadCount,
    };
  }

  const {
    organizationId,
    userId,
    search = "",
    status = "all",
    type = "all",
    priority = "all",
    datePreset = "all",
    sort = "newest",
    sortDirection = "desc",
    page = 1,
    pageSize = 10,
  } = params;

  let notifications = getMockNotifications(organizationId, userId);
  const unreadCount = notifications.filter((n) => n.status === "Unread").length;

  // 1. Search filter
  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    notifications = notifications.filter(
      (n) =>
        n.id.toLowerCase().includes(q) ||
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        n.type.toLowerCase().includes(q) ||
        (n.relatedEntityId && n.relatedEntityId.toLowerCase().includes(q))
    );
  }

  // 2. Status filter
  if (status !== "all") {
    notifications = notifications.filter((n) => n.status === status);
  }

  // 3. Type filter
  if (type !== "all") {
    notifications = notifications.filter((n) => n.type === type);
  }

  // 4. Priority filter
  if (priority !== "all") {
    notifications = notifications.filter((n) => n.priority === priority);
  }

  // 5. Date filter
  if (datePreset !== "all") {
    const now = new Date("2026-09-08T12:00:00Z").getTime();
    const oneDay = 24 * 60 * 60 * 1000;

    notifications = notifications.filter((n) => {
      const createdTime = new Date(n.createdAt).getTime();
      const diffDays = (now - createdTime) / oneDay;

      if (datePreset === "today") return diffDays <= 1;
      if (datePreset === "yesterday") return diffDays > 1 && diffDays <= 2;
      if (datePreset === "last_7_days") return diffDays <= 7;
      if (datePreset === "last_30_days") return diffDays <= 30;
      return true;
    });
  }

  // 6. Sorting
  notifications.sort((a, b) => {
    let result = 0;
    if (sort === "newest") {
      result = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sort === "oldest") {
      result = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sort === "highest_priority") {
      result = PRIORITY_WEIGHTS[b.priority] - PRIORITY_WEIGHTS[a.priority];
    } else if (sort === "lowest_priority") {
      result = PRIORITY_WEIGHTS[a.priority] - PRIORITY_WEIGHTS[b.priority];
    }

    return sortDirection === "desc" ? result : -result;
  });

  const total = notifications.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const paginated = notifications.slice(startIdx, startIdx + pageSize);

  return {
    notifications: paginated,
    total,
    unreadCount,
    page: currentPage,
    pageSize,
    totalPages,
  };
}

/**
 * Retrieves a single notification and resolves related entity details
 */
export async function getNotificationById(
  orgId: string,
  notifId: string,
  userId: string
): Promise<NotificationDetailResult | null> {
  if (isLiveMode()) {
    try {
      const res = await adminApi.notifications.getById(notifId);
      if (!res.data) return null;
      const n = mapBackendNotificationToNotification(res.data);
      return {
        notification: n,
        relatedEntitySummary: undefined,
      };
    } catch (err: any) {
      if (err?.status === 404 || err?.statusCode === 404) return null;
      throw err;
    }
  }

  const notifications = getMockNotifications(orgId, userId);
  const notification = notifications.find((n) => n.id === notifId);

  if (!notification) return null;

  let relatedEntitySummary: NotificationDetailResult["relatedEntitySummary"] = undefined;

  if (notification.relatedEntityType && notification.relatedEntityId) {
    const id = notification.relatedEntityId;
    const type = notification.relatedEntityType;

    if (type === "Booking" || type === "Assignment") {
      const bookings = orgId === "ORG-0002" ? INITIAL_ORG_0002_BOOKINGS : INITIAL_ORG_0001_BOOKINGS;
      const b = bookings.find((item) => item.id === id);
      if (b) {
        relatedEntitySummary = {
          entityType: type,
          id: b.id,
          title: `Booking #${b.bookingNumber}`,
          subtitle: `${b.serviceName} • Total ₹${b.totalAmount}`,
          status: b.status,
          route: type === "Assignment" ? `/admin/operations/${b.id}` : `/admin/bookings/${b.id}`,
        };
      }
    } else if (type === "Provider") {
      const providers = orgId === "ORG-0002" ? INITIAL_ORG_0002_PROVIDERS : INITIAL_ORG_0001_PROVIDERS;
      const p = providers.find((item) => item.id === id);
      if (p) {
        relatedEntitySummary = {
          entityType: "Provider",
          id: p.id,
          title: p.businessName || p.fullName,
          subtitle: `Rating ${p.rating.toFixed(1)} ★ • ${p.serviceAreas.join(", ")}`,
          status: p.status,
          route: `/admin/providers/${p.id}`,
        };
      }
    } else if (type === "Delivery Partner") {
      const partners = orgId === "ORG-0002" ? INITIAL_ORG_0002_DELIVERY_PARTNERS : INITIAL_ORG_0001_DELIVERY_PARTNERS;
      const dp = partners.find((item) => item.id === id);
      if (dp) {
        relatedEntitySummary = {
          entityType: "Delivery Partner",
          id: dp.id,
          title: dp.fullName,
          subtitle: `Vehicle: ${dp.vehicleType} • ${dp.totalDeliveries} Completed Runs`,
          status: dp.status,
          route: `/admin/delivery-partners/${dp.id}`,
        };
      }
    } else if (type === "Customer") {
      const customers = orgId === "ORG-0002" ? INITIAL_ORG_0002_CUSTOMERS : INITIAL_ORG_0001_CUSTOMERS;
      const c = customers.find((item) => item.id === id);
      if (c) {
        relatedEntitySummary = {
          entityType: "Customer",
          id: c.id,
          title: c.fullName,
          subtitle: `${c.email} • ${c.phone}`,
          status: c.status,
          route: `/admin/customers/${c.id}`,
        };
      }
    } else if (type === "Service") {
      const services = orgId === "ORG-0002" ? INITIAL_ORG_0002_SERVICES : INITIAL_ORG_0001_SERVICES;
      const s = services.find((item) => item.id === id);
      if (s) {
        relatedEntitySummary = {
          entityType: "Service",
          id: s.id,
          title: s.name,
          subtitle: `${s.category} • Base ₹${s.basePrice}`,
          status: s.status,
          route: `/admin/services/${s.id}`,
        };
      }
    } else if (type === "Review") {
      const reviews = orgId === "ORG-0002" ? INITIAL_ORG_0002_REVIEWS : INITIAL_ORG_0001_REVIEWS;
      const r = reviews.find((item) => item.id === id);
      if (r) {
        relatedEntitySummary = {
          entityType: "Review",
          id: r.id,
          title: `Customer Review (${r.rating} ★)`,
          subtitle: `"${r.comment.slice(0, 60)}..."`,
          status: r.status,
          route: `/admin/reviews/${r.id}`,
        };
      }
    }
  }

  return {
    notification,
    relatedEntitySummary,
  };
}

export async function markNotificationAsRead(
  orgId: string,
  notifId: string,
  userId: string
): Promise<Notification> {
  return markNotificationAsReadInStore(orgId, notifId);
}

export async function markNotificationAsUnread(
  orgId: string,
  notifId: string,
  userId: string
): Promise<Notification> {
  return markNotificationAsUnreadInStore(orgId, notifId);
}

export async function markAllNotificationsAsRead(
  orgId: string,
  userId: string
): Promise<void> {
  markAllNotificationsAsReadInStore(orgId, userId);
}

export async function dismissNotification(
  orgId: string,
  notifId: string,
  userId: string
): Promise<void> {
  dismissNotificationInStore(orgId, notifId, userId);
}

// =========================================================================
// COMMUNICATION SERVICES
// =========================================================================

export async function listCommunications(
  params: ListCommunicationsParams
): Promise<ListCommunicationsResult> {
  const {
    organizationId,
    userId,
    search = "",
    status = "all",
    recipientType = "all",
    channel = "all",
    datePreset = "all",
    sort = "newest",
    sortDirection = "desc",
    page = 1,
    pageSize = 10,
  } = params;

  let messages = getMockCommunications(organizationId);

  // Counts across entire org
  let draftCount = 0;
  let sentCount = 0;
  let archivedCount = 0;

  messages.forEach((m) => {
    if (m.status === "Draft") draftCount++;
    else if (m.status === "Sent") sentCount++;
    else if (m.status === "Archived") archivedCount++;
  });

  // 1. Search
  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    messages = messages.filter(
      (m) =>
        m.id.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.body.toLowerCase().includes(q) ||
        (m.senderName && m.senderName.toLowerCase().includes(q)) ||
        m.recipientType.toLowerCase().includes(q) ||
        (m.relatedBookingId && m.relatedBookingId.toLowerCase().includes(q))
    );
  }

  // 2. Status filter
  if (status !== "all") {
    messages = messages.filter((m) => m.status === status);
  }

  // 3. Recipient type filter
  if (recipientType !== "all") {
    messages = messages.filter((m) => m.recipientType === recipientType);
  }

  // 4. Channel filter
  if (channel !== "all") {
    messages = messages.filter((m) => m.channel === channel);
  }

  // 5. Date filter
  if (datePreset !== "all") {
    const now = new Date("2026-09-08T12:00:00Z").getTime();
    const oneDay = 24 * 60 * 60 * 1000;

    messages = messages.filter((m) => {
      const createdTime = new Date(m.createdAt).getTime();
      const diffDays = (now - createdTime) / oneDay;

      if (datePreset === "today") return diffDays <= 1;
      if (datePreset === "yesterday") return diffDays > 1 && diffDays <= 2;
      if (datePreset === "last_7_days") return diffDays <= 7;
      if (datePreset === "last_30_days") return diffDays <= 30;
      return true;
    });
  }

  // 6. Sorting
  messages.sort((a, b) => {
    let result = 0;
    if (sort === "newest") {
      result = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sort === "oldest") {
      result = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sort === "subject") {
      result = a.subject.localeCompare(b.subject);
    } else if (sort === "status") {
      result = a.status.localeCompare(b.status);
    }

    return sortDirection === "desc" ? result : -result;
  });

  const total = messages.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const paginated = messages.slice(startIdx, startIdx + pageSize);

  return {
    messages: paginated,
    total,
    draftCount,
    sentCount,
    archivedCount,
    page: currentPage,
    pageSize,
    totalPages,
  };
}

export async function getCommunicationById(
  orgId: string,
  msgId: string,
  userId: string
): Promise<CommunicationDetailResult | null> {
  const messages = getMockCommunications(orgId);
  const message = messages.find((m) => m.id === msgId);

  if (!message) return null;

  // Resolve recipients based on type
  const resolvedRecipients: CommunicationDetailResult["resolvedRecipients"] = [];

  if (message.recipientType === "Provider") {
    const providers = orgId === "ORG-0002" ? INITIAL_ORG_0002_PROVIDERS : INITIAL_ORG_0001_PROVIDERS;
    message.recipientIds.forEach((id) => {
      const p = providers.find((item) => item.id === id);
      resolvedRecipients.push({
        id,
        name: p ? (p.businessName || p.fullName) : id,
        contactInfo: p ? p.phone : undefined,
      });
    });
  } else if (message.recipientType === "Delivery Partner") {
    const partners = orgId === "ORG-0002" ? INITIAL_ORG_0002_DELIVERY_PARTNERS : INITIAL_ORG_0001_DELIVERY_PARTNERS;
    message.recipientIds.forEach((id) => {
      const dp = partners.find((item) => item.id === id);
      resolvedRecipients.push({
        id,
        name: dp ? dp.fullName : id,
        contactInfo: dp ? dp.phone : undefined,
      });
    });
  } else {
    message.recipientIds.forEach((id) => {
      resolvedRecipients.push({
        id,
        name: id === "ADM-0001" ? "Operations Lead (Aarav)" : id === "ADM-0002" ? "Regional Admin (Rahul)" : `Team Member ${id}`,
        contactInfo: "Internal Console",
      });
    });
  }

  // Related Entity
  let relatedEntitySummary: CommunicationDetailResult["relatedEntitySummary"] = undefined;
  if (message.relatedBookingId) {
    relatedEntitySummary = {
      type: "Booking",
      id: message.relatedBookingId,
      label: `Booking #${message.relatedBookingId}`,
      route: `/admin/bookings/${message.relatedBookingId}`,
    };
  } else if (message.relatedProviderId) {
    relatedEntitySummary = {
      type: "Provider",
      id: message.relatedProviderId,
      label: `Provider #${message.relatedProviderId}`,
      route: `/admin/providers/${message.relatedProviderId}`,
    };
  } else if (message.relatedDeliveryPartnerId) {
    relatedEntitySummary = {
      type: "Delivery Partner",
      id: message.relatedDeliveryPartnerId,
      label: `Valet Partner #${message.relatedDeliveryPartnerId}`,
      route: `/admin/delivery-partners/${message.relatedDeliveryPartnerId}`,
    };
  }

  return {
    message,
    resolvedRecipients,
    relatedEntitySummary,
  };
}

export async function listDrafts(
  orgId: string,
  userId: string
): Promise<CommunicationMessage[]> {
  const messages = getMockCommunications(orgId);
  return messages.filter((m) => m.status === "Draft" && m.senderId === userId);
}

export async function saveDraft(
  orgId: string,
  userId: string,
  data: {
    id?: string;
    channel?: CommunicationChannel;
    subject: string;
    body: string;
    recipientType: RecipientType;
    recipientIds: string[];
    relatedBookingId?: string;
    relatedProviderId?: string;
    relatedDeliveryPartnerId?: string;
  }
): Promise<CommunicationMessage> {
  return saveCommunicationDraftInStore(orgId, userId, data);
}

export async function sendMessage(
  orgId: string,
  userId: string,
  data: {
    id?: string;
    channel?: CommunicationChannel;
    subject: string;
    body: string;
    recipientType: RecipientType;
    recipientIds: string[];
    relatedBookingId?: string;
    relatedProviderId?: string;
    relatedDeliveryPartnerId?: string;
  }
): Promise<CommunicationMessage> {
  if (isLiveMode()) {
    await adminApi.notifications.broadcast({
      title: data.subject,
      message: data.body,
      targetRole: (data.recipientType as string) !== "All" ? (data.recipientType as string).toUpperCase() : undefined,
    });
  }
  return sendCommunicationMessageInStore(orgId, userId, data);
}

export async function archiveMessage(
  orgId: string,
  msgId: string,
  userId: string
): Promise<CommunicationMessage> {
  return archiveCommunicationMessageInStore(orgId, msgId);
}

export async function deleteDraft(
  orgId: string,
  msgId: string,
  userId: string
): Promise<void> {
  deleteCommunicationDraftInStore(orgId, msgId, userId);
}

export async function getRecipientOptions(
  orgId: string,
  recipientType: RecipientType
): Promise<Array<{ id: string; name: string; info: string }>> {
  if (recipientType === "Provider") {
    const providers = orgId === "ORG-0002" ? INITIAL_ORG_0002_PROVIDERS : INITIAL_ORG_0001_PROVIDERS;
    return providers.map((p) => ({
      id: p.id,
      name: p.businessName || p.fullName,
      info: `Rating ${p.rating.toFixed(1)} ★ • ${p.serviceAreas[0] || "Active"}`,
    }));
  }

  if (recipientType === "Delivery Partner") {
    const partners = orgId === "ORG-0002" ? INITIAL_ORG_0002_DELIVERY_PARTNERS : INITIAL_ORG_0001_DELIVERY_PARTNERS;
    return partners.map((dp) => ({
      id: dp.id,
      name: dp.fullName,
      info: `Zone: ${dp.serviceAreas[0] || "Metro"} • ${dp.vehicleType}`,
    }));
  }

  if (recipientType === "Operations" || recipientType === "Admin") {
    return [
      { id: "ADM-0001", name: "Operations Lead (Aarav)", info: "Central Shift Lead" },
      { id: "ADM-0002", name: "Regional Dispatch Desk", info: "Metro Fleet Support" },
      { id: "ADM-0003", name: "Safety & Compliance Officer", info: "Trust & Moderation" },
    ];
  }

  return [];
}

// =========================================================================
// PREFERENCES SERVICES
// =========================================================================

export async function getNotificationPreferences(
  orgId: string,
  userId: string
): Promise<NotificationPreferences> {
  return getNotificationPreferencesInStore(orgId, userId);
}

export async function updateNotificationPreferences(
  orgId: string,
  userId: string,
  prefs: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  return updateNotificationPreferencesInStore(orgId, userId, prefs);
}

export async function createNotification(params: {
  organizationId: string;
  userId?: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  relatedEntityType?: "Booking" | "Provider" | "Delivery Partner" | "Customer" | "Service" | "Payment" | "Review" | "Assignment";
  relatedEntityId?: string;
  actionRoute?: string;
  actorName?: string;
}): Promise<Notification> {
  return createMockNotificationInStore(params);
}

export const adminNotificationService = {
  getNotificationSummary,
  getUnreadNotificationCount,
  listNotifications,
  getNotificationById,
  markNotificationAsRead,
  markNotificationAsUnread,
  markAllNotificationsAsRead,
  dismissNotification,
  listCommunications,
  getCommunicationById,
  listDrafts,
  saveDraft,
  sendMessage,
  archiveMessage,
  deleteDraft,
  getRecipientOptions,
  getNotificationPreferences,
  updateNotificationPreferences,
  createNotification,
};

