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
} from "@/types/admin/notification";
import { INITIAL_ORG_0001_BOOKINGS, INITIAL_ORG_0002_BOOKINGS } from "./booking.mock";
import { INITIAL_ORG_0001_CUSTOMERS, INITIAL_ORG_0002_CUSTOMERS } from "./customer.mock";
import { INITIAL_ORG_0001_PROVIDERS, INITIAL_ORG_0002_PROVIDERS } from "./provider.mock";
import { INITIAL_ORG_0001_DELIVERY_PARTNERS, INITIAL_ORG_0002_DELIVERY_PARTNERS } from "./deliveryPartner.mock";
import { INITIAL_ORG_0001_SERVICES, INITIAL_ORG_0002_SERVICES } from "./serviceCatalog.mock";
import { INITIAL_ORG_0001_REVIEWS, INITIAL_ORG_0002_REVIEWS } from "./review.mock";

/**
 * DETERMINISTIC MOCK REPOSITORY FOR NOTIFICATIONS & COMMUNICATIONS (A12)
 * Strictly isolated by Organization ID and User ID.
 * ORG-0001: 54 operational notifications, 22 communications
 * ORG-0002: 32 operational notifications, 12 communications
 * Total: 86 Notifications (>= 80), 34 Communications (>= 30)
 */

interface NotificationTemplate {
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  title: string;
  message: string;
  relatedEntityType?: "Booking" | "Provider" | "Delivery Partner" | "Customer" | "Service" | "Payment" | "Review" | "Assignment";
  getActionRoute?: (entityId: string) => string;
}

const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    type: "Booking",
    priority: "High",
    status: "Unread",
    title: "New express booking requires validation",
    message: "Customer placed an express 24h laundry booking. Capacity and slot allocation confirmed.",
    relatedEntityType: "Booking",
    getActionRoute: (id) => `/admin/bookings/${id}`,
  },
  {
    type: "Assignment",
    priority: "Critical",
    status: "Unread",
    title: "Valet pickup delayed beyond SLA window",
    message: "Pickup valet has exceeded the estimated arrival SLA by 15 minutes. Dispatch intervention recommended.",
    relatedEntityType: "Assignment",
    getActionRoute: (id) => `/admin/operations/${id}`,
  },
  {
    type: "Payment",
    priority: "Normal",
    status: "Read",
    title: "Booking payment successfully settled",
    message: "Online UPI payment received and settled to merchant escrow ledger.",
    relatedEntityType: "Payment",
    getActionRoute: (id) => `/admin/payments/transactions/${id}`,
  },
  {
    type: "Review",
    priority: "High",
    status: "Unread",
    title: "New review flagged for moderation",
    message: "A newly submitted 1-star customer review contains potentially abusive phrases and requires review.",
    relatedEntityType: "Review",
    getActionRoute: (id) => `/admin/reviews/${id}`,
  },
  {
    type: "Provider",
    priority: "Normal",
    status: "Unread",
    title: "Provider workshop capacity update",
    message: "Partner facility has reached 85% daily processing capacity limit for dry cleaning cycle.",
    relatedEntityType: "Provider",
    getActionRoute: (id) => `/admin/providers/${id}`,
  },
  {
    type: "Delivery Partner",
    priority: "Normal",
    status: "Read",
    title: "Valet partner checked in for duty",
    message: "Delivery valet is active and available for route dispatching in North Metro cluster.",
    relatedEntityType: "Delivery Partner",
    getActionRoute: (id) => `/admin/delivery-partners/${id}`,
  },
  {
    type: "Customer",
    priority: "Low",
    status: "Read",
    title: "Customer profile information updated",
    message: "Customer updated their primary delivery address instructions and landmark.",
    relatedEntityType: "Customer",
    getActionRoute: (id) => `/admin/customers/${id}`,
  },
  {
    type: "Service",
    priority: "Low",
    status: "Read",
    title: "Catalog service pricing revised",
    message: "Standard steam pressing base price tier was updated according to seasonal tariff schedule.",
    relatedEntityType: "Service",
    getActionRoute: (id) => `/admin/services/${id}`,
  },
  {
    type: "System",
    priority: "Critical",
    status: "Unread",
    title: "Payment gateway webhook latency detected",
    message: "Third-party payment callback webhook response times increased above threshold (3.2s).",
    relatedEntityType: undefined,
    getActionRoute: () => `/admin`,
  },
  {
    type: "Booking",
    priority: "Normal",
    status: "Read",
    title: "Booking marked as Completed",
    message: "Customer confirmed delivery receipt and order inspection successfully closed.",
    relatedEntityType: "Booking",
    getActionRoute: (id) => `/admin/bookings/${id}`,
  },
  {
    type: "Payment",
    priority: "Critical",
    status: "Unread",
    title: "Customer refund request initiated",
    message: "Operations processed a partial refund request of ₹350 for damaged collar button.",
    relatedEntityType: "Payment",
    getActionRoute: (id) => `/admin/payments/transactions/${id}`,
  },
  {
    type: "Provider",
    priority: "High",
    status: "Unread",
    title: "Provider submitted KYC document update",
    message: "Updated GST registration certificate and trade license uploaded for annual compliance review.",
    relatedEntityType: "Provider",
    getActionRoute: (id) => `/admin/providers/${id}`,
  },
  {
    type: "Delivery Partner",
    priority: "High",
    status: "Unread",
    title: "Valet reported vehicle breakdown",
    message: "Valet reported puncture during transit on Route 104. Reassignment of active batch required.",
    relatedEntityType: "Delivery Partner",
    getActionRoute: (id) => `/admin/delivery-partners/${id}`,
  },
  {
    type: "Assignment",
    priority: "Normal",
    status: "Read",
    title: "Auto-assignment successfully dispatched",
    message: "Intelligent dispatch engine matched order with nearest verified valet in 42 seconds.",
    relatedEntityType: "Assignment",
    getActionRoute: (id) => `/admin/operations/${id}`,
  },
  {
    type: "Review",
    priority: "Low",
    status: "Read",
    title: "5-star rating received from verified customer",
    message: "Outstanding feedback praising fabric care quality and courteous valet behavior.",
    relatedEntityType: "Review",
    getActionRoute: (id) => `/admin/reviews/${id}`,
  },
  {
    type: "System",
    priority: "Low",
    status: "Read",
    title: "Daily operations summary generated",
    message: "Automated end-of-day operations tally and fulfillment report compiled for export.",
    relatedEntityType: undefined,
    getActionRoute: () => `/admin`,
  },
  {
    type: "Service",
    priority: "Normal",
    status: "Unread",
    title: "New specialty service added to catalog",
    message: "Stain treatment and leather jacket restoration service launched in active catalog.",
    relatedEntityType: "Service",
    getActionRoute: (id) => `/admin/services/${id}`,
  },
  {
    type: "Customer",
    priority: "Normal",
    status: "Unread",
    title: "High-value enterprise customer registered",
    message: "Corporate corporate corporate corporate account created with recurring weekly laundry requirement.",
    relatedEntityType: "Customer",
    getActionRoute: (id) => `/admin/customers/${id}`,
  },
];

// Helper to generate deterministic dates
function getIsoDate(daysAgo: number, hoursAgo: number = 0): string {
  const base = new Date("2026-09-08T12:00:00Z").getTime();
  const target = base - (daysAgo * 24 * 3600 * 1000 + hoursAgo * 3600 * 1000);
  return new Date(target).toISOString();
}

// 1. Generate 54 ORG-0001 Notifications
export const INITIAL_ORG_0001_NOTIFICATIONS: Notification[] = Array.from({ length: 54 }).map((_, idx) => {
  const tpl = NOTIFICATION_TEMPLATES[idx % NOTIFICATION_TEMPLATES.length];
  const notifId = `NOTIF-${String(idx + 1).padStart(4, "0")}`;
  const daysAgo = Math.floor(idx / 6);
  const hoursAgo = (idx % 6) * 3;
  const createdAt = getIsoDate(daysAgo, hoursAgo);
  const readAt = tpl.status === "Read" ? getIsoDate(daysAgo, hoursAgo - 1) : undefined;

  let relatedEntityId: string | undefined;
  if (tpl.relatedEntityType === "Booking" || tpl.relatedEntityType === "Assignment" || tpl.relatedEntityType === "Payment") {
    const booking = INITIAL_ORG_0001_BOOKINGS[idx % INITIAL_ORG_0001_BOOKINGS.length];
    relatedEntityId = booking.id;
  } else if (tpl.relatedEntityType === "Provider") {
    const prov = INITIAL_ORG_0001_PROVIDERS[idx % INITIAL_ORG_0001_PROVIDERS.length];
    relatedEntityId = prov.id;
  } else if (tpl.relatedEntityType === "Delivery Partner") {
    const dp = INITIAL_ORG_0001_DELIVERY_PARTNERS[idx % INITIAL_ORG_0001_DELIVERY_PARTNERS.length];
    relatedEntityId = dp.id;
  } else if (tpl.relatedEntityType === "Customer") {
    const cust = INITIAL_ORG_0001_CUSTOMERS[idx % INITIAL_ORG_0001_CUSTOMERS.length];
    relatedEntityId = cust.id;
  } else if (tpl.relatedEntityType === "Service") {
    const serv = INITIAL_ORG_0001_SERVICES[idx % INITIAL_ORG_0001_SERVICES.length];
    relatedEntityId = serv.id;
  } else if (tpl.relatedEntityType === "Review") {
    const rev = INITIAL_ORG_0001_REVIEWS[idx % INITIAL_ORG_0001_REVIEWS.length];
    relatedEntityId = rev.id;
  }

  const actionRoute = tpl.getActionRoute ? tpl.getActionRoute(relatedEntityId || "main") : undefined;

  return {
    id: notifId,
    organizationId: "ORG-0001",
    type: tpl.type,
    priority: tpl.priority,
    status: tpl.status,
    title: tpl.title,
    message: tpl.message,
    createdAt,
    readAt,
    relatedEntityType: tpl.relatedEntityType,
    relatedEntityId,
    actionRoute,
  };
});

// 2. Generate 32 ORG-0002 Notifications
export const INITIAL_ORG_0002_NOTIFICATIONS: Notification[] = Array.from({ length: 32 }).map((_, idx) => {
  const globalIdx = 54 + idx;
  const tpl = NOTIFICATION_TEMPLATES[(idx + 4) % NOTIFICATION_TEMPLATES.length];
  const notifId = `NOTIF-${String(globalIdx + 1).padStart(4, "0")}`;
  const daysAgo = Math.floor(idx / 5);
  const hoursAgo = (idx % 5) * 4;
  const createdAt = getIsoDate(daysAgo, hoursAgo);
  const readAt = tpl.status === "Read" ? getIsoDate(daysAgo, hoursAgo - 1) : undefined;

  let relatedEntityId: string | undefined;
  if (tpl.relatedEntityType === "Booking" || tpl.relatedEntityType === "Assignment" || tpl.relatedEntityType === "Payment") {
    const booking = INITIAL_ORG_0002_BOOKINGS[idx % INITIAL_ORG_0002_BOOKINGS.length];
    relatedEntityId = booking.id;
  } else if (tpl.relatedEntityType === "Provider") {
    const prov = INITIAL_ORG_0002_PROVIDERS[idx % INITIAL_ORG_0002_PROVIDERS.length];
    relatedEntityId = prov.id;
  } else if (tpl.relatedEntityType === "Delivery Partner") {
  const dp = INITIAL_ORG_0002_DELIVERY_PARTNERS[idx % INITIAL_ORG_0002_DELIVERY_PARTNERS.length];
    relatedEntityId = dp.id;
  } else if (tpl.relatedEntityType === "Customer") {
    const cust = INITIAL_ORG_0002_CUSTOMERS[idx % INITIAL_ORG_0002_CUSTOMERS.length];
    relatedEntityId = cust.id;
  } else if (tpl.relatedEntityType === "Service") {
    const serv = INITIAL_ORG_0002_SERVICES[idx % INITIAL_ORG_0002_SERVICES.length];
    relatedEntityId = serv.id;
  } else if (tpl.relatedEntityType === "Review") {
    const rev = INITIAL_ORG_0002_REVIEWS[idx % INITIAL_ORG_0002_REVIEWS.length];
    relatedEntityId = rev.id;
  }

  const actionRoute = tpl.getActionRoute ? tpl.getActionRoute(relatedEntityId || "main") : undefined;

  return {
    id: notifId,
    organizationId: "ORG-0002",
    type: tpl.type,
    priority: tpl.priority,
    status: tpl.status,
    title: tpl.title,
    message: tpl.message,
    createdAt,
    readAt,
    relatedEntityType: tpl.relatedEntityType,
    relatedEntityId,
    actionRoute,
  };
});

// 3. Operational Communication Messages (34 total)
export const INITIAL_ORG_0001_COMMUNICATIONS: CommunicationMessage[] = [
  {
    id: "MSG-0001",
    organizationId: "ORG-0001",
    channel: "Operational",
    subject: "Weekend monsoon surge operating guidelines and garment rain-wrap protocol",
    body: "All delivery valets and provider centers must enforce waterproof double-bagging on all outbound garments due to continuous rainfall forecast across Chennai North and South zones.",
    senderId: "ADM-0001",
    senderName: "Operations Dispatch",
    recipientType: "Provider",
    recipientIds: ["PRO-0001", "PRO-0002", "PRO-0003"],
    status: "Sent",
    createdAt: "2026-09-07T08:00:00Z",
    updatedAt: "2026-09-07T08:00:00Z",
    sentAt: "2026-09-07T08:05:00Z",
  },
  {
    id: "MSG-0002",
    organizationId: "ORG-0001",
    channel: "Internal",
    subject: "Shift handover log: Morning shift dispatch backlog cleared",
    body: "Morning shift resolved 18 pending express bookings. High demand observed in Anna Nagar sector. Shift team lead assigned 3 additional floating valets.",
    senderId: "ADM-0001",
    senderName: "Aarav Sharma (Operations Lead)",
    recipientType: "Operations",
    recipientIds: ["ADM-0002", "ADM-0003"],
    status: "Sent",
    createdAt: "2026-09-07T13:30:00Z",
    updatedAt: "2026-09-07T13:30:00Z",
    sentAt: "2026-09-07T13:32:00Z",
  },
  {
    id: "MSG-0003",
    organizationId: "ORG-0001",
    channel: "Operational",
    subject: "Urgent: Express laundry pickup coordination for Booking BKG-000001",
    body: "Customer requested priority 60-minute pickup slot. Please confirm vehicle availability and immediate route dispatch.",
    senderId: "ADM-0001",
    senderName: "Operations Desk",
    recipientType: "Delivery Partner",
    recipientIds: ["DEL-0001"],
    status: "Draft",
    createdAt: "2026-09-08T09:15:00Z",
    updatedAt: "2026-09-08T09:15:00Z",
    relatedBookingId: "BKG-000001",
    relatedDeliveryPartnerId: "DEL-0001",
  },
  {
    id: "MSG-0004",
    organizationId: "ORG-0001",
    channel: "Operational",
    subject: "Quality audit notice: Steam press temperature calibration compliance",
    body: "Monthly equipment inspection checklist must be completed and submitted by end of day Friday. Please verify steam boiler PSI gauges.",
    senderId: "ADM-0001",
    senderName: "Quality Assurance",
    recipientType: "Provider",
    recipientIds: ["PRO-0001", "PRO-0004"],
    status: "Sent",
    createdAt: "2026-09-06T10:00:00Z",
    updatedAt: "2026-09-06T10:00:00Z",
    sentAt: "2026-09-06T10:15:00Z",
    relatedProviderId: "PRO-0001",
  },
  {
    id: "MSG-0005",
    organizationId: "ORG-0001",
    channel: "Internal",
    subject: "Proposed revision for dry cleaning turn-around SLA standards",
    body: "Draft proposal to reduce standard dry clean SLA from 48h to 36h in high-density metro zones following new automated presser installation.",
    senderId: "ADM-0001",
    senderName: "Service Operations",
    recipientType: "Admin",
    recipientIds: ["ADM-0001", "ADM-0002"],
    status: "Draft",
    createdAt: "2026-09-08T11:00:00Z",
    updatedAt: "2026-09-08T11:00:00Z",
  },
  {
    id: "MSG-0006",
    organizationId: "ORG-0001",
    channel: "Operational",
    subject: "Traffic advisory: Road closure near Anna Salai flyover during peak hours",
    body: "Delivery partners assigned to Central Zone please take Mount Road detour between 17:00 and 19:30 to avoid major delay penalties.",
    senderId: "ADM-0001",
    senderName: "Traffic Coordination",
    recipientType: "Delivery Partner",
    recipientIds: ["DEL-0001", "DEL-0002", "DEL-0003"],
    status: "Archived",
    createdAt: "2026-09-04T16:00:00Z",
    updatedAt: "2026-09-04T16:00:00Z",
    sentAt: "2026-09-04T16:05:00Z",
  },
  // Additional 16 messages for ORG-0001
  ...Array.from({ length: 16 }).map((_, idx) => {
    const idNum = 7 + idx;
    const msgId = `MSG-${String(idNum).padStart(4, "0")}`;
    const isDraft = idx % 5 === 0;
    const isArchived = idx % 4 === 1;
    const status: CommunicationStatus = isDraft ? "Draft" : isArchived ? "Archived" : "Sent";
    const recipientType: RecipientType = idx % 2 === 0 ? "Provider" : "Delivery Partner";
    const prov = INITIAL_ORG_0001_PROVIDERS[idx % INITIAL_ORG_0001_PROVIDERS.length];
    const dp = INITIAL_ORG_0001_DELIVERY_PARTNERS[idx % INITIAL_ORG_0001_DELIVERY_PARTNERS.length];
    const recipientIds = recipientType === "Provider" ? [prov.id] : [dp.id];
    const createdAt = getIsoDate(idx + 1, 4);

    return {
      id: msgId,
      organizationId: "ORG-0001",
      channel: idx % 3 === 0 ? "Internal" : "Operational" as CommunicationChannel,
      subject: `Operational update ${idx + 1}: Fleet and merchant coordination advisory`,
      body: `Formal communication regarding fulfillment efficiency, customer satisfaction metrics, and delivery turnaround targets for batch ${idx + 101}.`,
      senderId: "ADM-0001",
      senderName: "Operations Dispatch",
      recipientType,
      recipientIds,
      status,
      createdAt,
      updatedAt: createdAt,
      sentAt: status !== "Draft" ? createdAt : undefined,
      relatedBookingId: INITIAL_ORG_0001_BOOKINGS[idx % INITIAL_ORG_0001_BOOKINGS.length].id,
      relatedProviderId: recipientType === "Provider" ? prov.id : undefined,
      relatedDeliveryPartnerId: recipientType === "Delivery Partner" ? dp.id : undefined,
    };
  }),
];

export const INITIAL_ORG_0002_COMMUNICATIONS: CommunicationMessage[] = Array.from({ length: 12 }).map((_, idx) => {
  const globalIdx = 22 + idx;
  const msgId = `MSG-${String(globalIdx + 1).padStart(4, "0")}`;
  const isDraft = idx === 0 || idx === 6;
  const isArchived = idx === 3;
  const status: CommunicationStatus = isDraft ? "Draft" : isArchived ? "Archived" : "Sent";
  const recipientType: RecipientType = idx % 2 === 0 ? "Provider" : "Delivery Partner";
  const prov = INITIAL_ORG_0002_PROVIDERS[idx % INITIAL_ORG_0002_PROVIDERS.length];
  const dp = INITIAL_ORG_0002_DELIVERY_PARTNERS[idx % INITIAL_ORG_0002_DELIVERY_PARTNERS.length];
  const recipientIds = recipientType === "Provider" ? [prov.id] : [dp.id];
  const createdAt = getIsoDate(idx + 1, 2);

  return {
    id: msgId,
    organizationId: "ORG-0002",
    channel: idx % 2 === 0 ? "Operational" : "Internal" as CommunicationChannel,
    subject: `Southwest zone dispatch advisory ${idx + 1}: Kochi & Trivandrum cluster`,
    body: `Regional operational update for Kerala zone partner fleet and facility managers regarding order routing protocols.`,
    senderId: "ADM-0002",
    senderName: "Kerala Regional Admin",
    recipientType,
    recipientIds,
    status,
    createdAt,
    updatedAt: createdAt,
    sentAt: status !== "Draft" ? createdAt : undefined,
    relatedBookingId: INITIAL_ORG_0002_BOOKINGS[idx % INITIAL_ORG_0002_BOOKINGS.length].id,
    relatedProviderId: recipientType === "Provider" ? prov.id : undefined,
    relatedDeliveryPartnerId: recipientType === "Delivery Partner" ? dp.id : undefined,
  };
});

// 4. Default Notification Preferences
export const INITIAL_NOTIFICATION_PREFERENCES: Record<string, NotificationPreferences> = {
  "ADM-0001": {
    userId: "ADM-0001",
    organizationId: "ORG-0001",
    booking: true,
    assignment: true,
    payment: true,
    review: true,
    provider: true,
    deliveryPartner: true,
    customer: true,
    service: true,
    system: true,
  },
  "ADM-0002": {
    userId: "ADM-0002",
    organizationId: "ORG-0002",
    booking: true,
    assignment: true,
    payment: true,
    review: true,
    provider: true,
    deliveryPartner: true,
    customer: true,
    service: true,
    system: true,
  },
};

// =========================================================================
// 5. IN-MEMORY RUNTIME STORES & MUTATION LOGIC
// =========================================================================
let mockNotificationsStore: Notification[] = [
  ...INITIAL_ORG_0001_NOTIFICATIONS,
  ...INITIAL_ORG_0002_NOTIFICATIONS,
];

let mockCommunicationsStore: CommunicationMessage[] = [
  ...INITIAL_ORG_0001_COMMUNICATIONS,
  ...INITIAL_ORG_0002_COMMUNICATIONS,
];

let mockPreferencesStore: Record<string, NotificationPreferences> = {
  ...INITIAL_NOTIFICATION_PREFERENCES,
};

// Set of dismissed notification IDs per user (userId -> Set of notifIds)
const mockDismissedStore = new Map<string, Set<string>>();

let nextNotificationSeq = 87;
let nextMessageSeq = 35;

export function getMockNotifications(orgId: string, userId: string): Notification[] {
  const dismissed = mockDismissedStore.get(userId) || new Set<string>();
  return mockNotificationsStore.filter(
    (n) => n.organizationId === orgId && !dismissed.has(n.id)
  );
}

export function getMockCommunications(orgId: string): CommunicationMessage[] {
  return mockCommunicationsStore.filter((m) => m.organizationId === orgId);
}

export function markNotificationAsReadInStore(
  orgId: string,
  notifId: string
): Notification {
  const index = mockNotificationsStore.findIndex(
    (n) => n.id === notifId && n.organizationId === orgId
  );
  if (index === -1) {
    throw new Error(`Notification ${notifId} not found in organization ${orgId}`);
  }

  const existing = mockNotificationsStore[index];
  const updated: Notification = {
    ...existing,
    status: "Read",
    readAt: new Date().toISOString(),
  };

  mockNotificationsStore[index] = updated;
  return updated;
}

export function markNotificationAsUnreadInStore(
  orgId: string,
  notifId: string
): Notification {
  const index = mockNotificationsStore.findIndex(
    (n) => n.id === notifId && n.organizationId === orgId
  );
  if (index === -1) {
    throw new Error(`Notification ${notifId} not found in organization ${orgId}`);
  }

  const existing = mockNotificationsStore[index];
  const updated: Notification = {
    ...existing,
    status: "Unread",
    readAt: undefined,
  };

  mockNotificationsStore[index] = updated;
  return updated;
}

export function markAllNotificationsAsReadInStore(
  orgId: string,
  userId: string
): void {
  const dismissed = mockDismissedStore.get(userId) || new Set<string>();
  const now = new Date().toISOString();

  mockNotificationsStore = mockNotificationsStore.map((n) => {
    if (n.organizationId === orgId && !dismissed.has(n.id) && n.status === "Unread") {
      return {
        ...n,
        status: "Read",
        readAt: now,
      };
    }
    return n;
  });
}

export function dismissNotificationInStore(
  orgId: string,
  notifId: string,
  userId: string
): void {
  const notif = mockNotificationsStore.find(
    (n) => n.id === notifId && n.organizationId === orgId
  );
  if (!notif) {
    throw new Error(`Notification ${notifId} not found in organization ${orgId}`);
  }

  if (!mockDismissedStore.has(userId)) {
    mockDismissedStore.set(userId, new Set<string>());
  }
  mockDismissedStore.get(userId)!.add(notifId);
}

export function createNotificationInStore(
  orgId: string,
  data: {
    type: NotificationType;
    priority?: NotificationPriority;
    title: string;
    message: string;
    relatedEntityType?: "Booking" | "Provider" | "Delivery Partner" | "Customer" | "Service" | "Payment" | "Review" | "Assignment";
    relatedEntityId?: string;
    actionRoute?: string;
  }
): Notification {
  const id = `NOTIF-${String(nextNotificationSeq++).padStart(4, "0")}`;
  const now = new Date().toISOString();

  const newNotif: Notification = {
    id,
    organizationId: orgId,
    type: data.type,
    priority: data.priority || "Normal",
    status: "Unread",
    title: data.title,
    message: data.message,
    createdAt: now,
    relatedEntityType: data.relatedEntityType,
    relatedEntityId: data.relatedEntityId,
    actionRoute: data.actionRoute,
  };

  mockNotificationsStore = [newNotif, ...mockNotificationsStore];
  return newNotif;
}

export function saveCommunicationDraftInStore(
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
): CommunicationMessage {
  const now = new Date().toISOString();

  if (data.id) {
    const index = mockCommunicationsStore.findIndex(
      (m) => m.id === data.id && m.organizationId === orgId && m.senderId === userId
    );
    if (index !== -1) {
      const updated: CommunicationMessage = {
        ...mockCommunicationsStore[index],
        subject: data.subject,
        body: data.body,
        channel: data.channel || mockCommunicationsStore[index].channel,
        recipientType: data.recipientType,
        recipientIds: data.recipientIds,
        updatedAt: now,
        relatedBookingId: data.relatedBookingId,
        relatedProviderId: data.relatedProviderId,
        relatedDeliveryPartnerId: data.relatedDeliveryPartnerId,
      };
      mockCommunicationsStore[index] = updated;
      return updated;
    }
  }

  const id = `MSG-${String(nextMessageSeq++).padStart(4, "0")}`;
  const newDraft: CommunicationMessage = {
    id,
    organizationId: orgId,
    channel: data.channel || "Operational",
    subject: data.subject,
    body: data.body,
    senderId: userId,
    senderName: "Operations Dispatch",
    recipientType: data.recipientType,
    recipientIds: data.recipientIds,
    status: "Draft",
    createdAt: now,
    updatedAt: now,
    relatedBookingId: data.relatedBookingId,
    relatedProviderId: data.relatedProviderId,
    relatedDeliveryPartnerId: data.relatedDeliveryPartnerId,
  };

  mockCommunicationsStore = [newDraft, ...mockCommunicationsStore];
  return newDraft;
}

export function sendCommunicationMessageInStore(
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
): CommunicationMessage {
  const now = new Date().toISOString();

  if (data.id) {
    const index = mockCommunicationsStore.findIndex(
      (m) => m.id === data.id && m.organizationId === orgId
    );
    if (index !== -1) {
      const updated: CommunicationMessage = {
        ...mockCommunicationsStore[index],
        subject: data.subject,
        body: data.body,
        channel: data.channel || mockCommunicationsStore[index].channel,
        recipientType: data.recipientType,
        recipientIds: data.recipientIds,
        status: "Sent",
        updatedAt: now,
        sentAt: now,
        relatedBookingId: data.relatedBookingId,
        relatedProviderId: data.relatedProviderId,
        relatedDeliveryPartnerId: data.relatedDeliveryPartnerId,
      };
      mockCommunicationsStore[index] = updated;
      return updated;
    }
  }

  const id = `MSG-${String(nextMessageSeq++).padStart(4, "0")}`;
  const newMessage: CommunicationMessage = {
    id,
    organizationId: orgId,
    channel: data.channel || "Operational",
    subject: data.subject,
    body: data.body,
    senderId: userId,
    senderName: "Operations Dispatch",
    recipientType: data.recipientType,
    recipientIds: data.recipientIds,
    status: "Sent",
    createdAt: now,
    updatedAt: now,
    sentAt: now,
    relatedBookingId: data.relatedBookingId,
    relatedProviderId: data.relatedProviderId,
    relatedDeliveryPartnerId: data.relatedDeliveryPartnerId,
  };

  mockCommunicationsStore = [newMessage, ...mockCommunicationsStore];
  return newMessage;
}

export function archiveCommunicationMessageInStore(
  orgId: string,
  msgId: string
): CommunicationMessage {
  const index = mockCommunicationsStore.findIndex(
    (m) => m.id === msgId && m.organizationId === orgId
  );
  if (index === -1) {
    throw new Error(`Message ${msgId} not found in organization ${orgId}`);
  }

  const existing = mockCommunicationsStore[index];
  if (existing.status !== "Sent") {
    throw new Error(`Only Sent messages can be archived.`);
  }

  const updated: CommunicationMessage = {
    ...existing,
    status: "Archived",
    updatedAt: new Date().toISOString(),
  };

  mockCommunicationsStore[index] = updated;
  return updated;
}

export function deleteCommunicationDraftInStore(
  orgId: string,
  msgId: string,
  userId: string
): void {
  const index = mockCommunicationsStore.findIndex(
    (m) => m.id === msgId && m.organizationId === orgId
  );
  if (index === -1) {
    throw new Error(`Message ${msgId} not found in organization ${orgId}`);
  }

  const existing = mockCommunicationsStore[index];
  if (existing.status !== "Draft") {
    throw new Error(`Only Draft messages can be deleted.`);
  }
  if (existing.senderId !== userId) {
    throw new Error(`You cannot delete another user's draft.`);
  }

  mockCommunicationsStore.splice(index, 1);
}

export function getNotificationPreferencesInStore(
  orgId: string,
  userId: string
): NotificationPreferences {
  if (mockPreferencesStore[userId]) {
    return mockPreferencesStore[userId];
  }
  return {
    userId,
    organizationId: orgId,
    booking: true,
    assignment: true,
    payment: true,
    review: true,
    provider: true,
    deliveryPartner: true,
    customer: true,
    service: true,
    system: true,
  };
}

export function updateNotificationPreferencesInStore(
  orgId: string,
  userId: string,
  prefs: Partial<NotificationPreferences>
): NotificationPreferences {
  const current = getNotificationPreferencesInStore(orgId, userId);
  const updated: NotificationPreferences = {
    ...current,
    ...prefs,
    userId,
    organizationId: orgId,
  };
  mockPreferencesStore[userId] = updated;
  return updated;
}

export function createMockNotificationInStore(params: {
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
}): Notification {
  const id = `NOT-${String(nextNotificationSeq++).padStart(6, "0")}`;
  const now = new Date().toISOString();
  const newNotification: Notification = {
    id,
    organizationId: params.organizationId,
    userId: params.userId,
    type: params.type,
    priority: params.priority,
    status: "Unread",
    title: params.title,
    message: params.message,
    relatedEntityType: params.relatedEntityType,
    relatedEntityId: params.relatedEntityId,
    actionRoute: params.actionRoute,
    createdAt: now,
    actorName: params.actorName || "System",
  };

  mockNotificationsStore.unshift(newNotification);
  return newNotification;
}

export function resetMockNotificationStores(): void {
  mockNotificationsStore = [
    ...INITIAL_ORG_0001_NOTIFICATIONS,
    ...INITIAL_ORG_0002_NOTIFICATIONS,
  ];
  mockCommunicationsStore = [
    ...INITIAL_ORG_0001_COMMUNICATIONS,
    ...INITIAL_ORG_0002_COMMUNICATIONS,
  ];
  mockPreferencesStore = {
    ...INITIAL_NOTIFICATION_PREFERENCES,
  };
  mockDismissedStore.clear();
  nextNotificationSeq = 87;
  nextMessageSeq = 35;
}

