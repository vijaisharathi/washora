import { z } from "zod";

/**
 * WASHORA ADMIN / OPERATIONS NOTIFICATIONS & COMMUNICATION DOMAIN TYPES (A12)
 * Canonical types, categories, priority, communication channels, recipient types,
 * and form validation schemas.
 */

export const NOTIFICATION_TYPES = [
  "Booking",
  "Assignment",
  "Payment",
  "Review",
  "Provider",
  "Delivery Partner",
  "Customer",
  "Service",
  "System",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const NOTIFICATION_PRIORITIES = [
  "Low",
  "Normal",
  "High",
  "Critical",
] as const;

export type NotificationPriority = (typeof NOTIFICATION_PRIORITIES)[number];

export const NOTIFICATION_STATUSES = [
  "Unread",
  "Read",
] as const;

export type NotificationStatus = (typeof NOTIFICATION_STATUSES)[number];

export interface Notification {
  id: string; // e.g. "NOTIF-0001"
  organizationId: string; // e.g. "ORG-0001"

  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;

  title: string;
  message: string;

  createdAt: string; // ISO timestamp
  readAt?: string; // ISO timestamp

  relatedEntityType?:
    | "Booking"
    | "Provider"
    | "Delivery Partner"
    | "Customer"
    | "Service"
    | "Payment"
    | "Review"
    | "Assignment";

  relatedEntityId?: string;

  actionRoute?: string;
  userId?: string;
  actorName?: string;
}

export const COMMUNICATION_CHANNELS = [
  "Internal",
  "Operational",
] as const;

export type CommunicationChannel = (typeof COMMUNICATION_CHANNELS)[number];

export const COMMUNICATION_STATUSES = [
  "Draft",
  "Sent",
  "Archived",
] as const;

export type CommunicationStatus = (typeof COMMUNICATION_STATUSES)[number];

export const RECIPIENT_TYPES = [
  "Admin",
  "Operations",
  "Provider",
  "Delivery Partner",
] as const;

export type RecipientType = (typeof RECIPIENT_TYPES)[number];

export interface CommunicationMessage {
  id: string; // e.g. "MSG-0001"
  organizationId: string; // e.g. "ORG-0001"

  channel: CommunicationChannel;

  subject: string;
  body: string;

  senderId: string; // User ID or Name
  senderName?: string;

  recipientType: RecipientType;
  recipientIds: string[];

  status: CommunicationStatus;

  createdAt: string;
  updatedAt: string;
  sentAt?: string;

  relatedBookingId?: string;
  relatedProviderId?: string;
  relatedDeliveryPartnerId?: string;
}

export interface NotificationPreferences {
  userId: string;
  organizationId: string;

  booking: boolean;
  assignment: boolean;
  payment: boolean;
  review: boolean;
  provider: boolean;
  deliveryPartner: boolean;
  customer: boolean;
  service: boolean;
  system: boolean;
  updatedAt?: string;
}

export interface NotificationSummaryMetrics {
  totalNotifications: number;
  unreadCount: number;
  criticalCount: number;
  highPriorityCount: number;
}

export interface ListNotificationsParams {
  organizationId: string;
  userId: string;
  search?: string;
  status?: NotificationStatus | "all";
  type?: NotificationType | "all";
  priority?: NotificationPriority | "all";
  datePreset?: "all" | "today" | "yesterday" | "last_7_days" | "last_30_days";
  sort?: "newest" | "oldest" | "highest_priority" | "lowest_priority";
  sortDirection?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface ListNotificationsResult {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface NotificationDetailResult {
  notification: Notification;
  relatedEntitySummary?: {
    entityType: string;
    id: string;
    title: string;
    subtitle?: string;
    status?: string;
    route?: string;
  };
}

export interface ListCommunicationsParams {
  organizationId: string;
  userId: string;
  search?: string;
  status?: CommunicationStatus | "all";
  recipientType?: RecipientType | "all";
  channel?: CommunicationChannel | "all";
  datePreset?: "all" | "today" | "yesterday" | "last_7_days" | "last_30_days";
  sort?: "newest" | "oldest" | "subject" | "status";
  sortDirection?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface ListCommunicationsResult {
  messages: CommunicationMessage[];
  total: number;
  draftCount: number;
  sentCount: number;
  archivedCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CommunicationDetailResult {
  message: CommunicationMessage;
  resolvedRecipients: Array<{
    id: string;
    name: string;
    contactInfo?: string;
  }>;
  relatedEntitySummary?: {
    type: string;
    id: string;
    label: string;
    route?: string;
  };
}

/**
 * Zod validation schema for composing internal operational communications
 */
export const ComposeMessageSchema = z.object({
  subject: z
    .string({ required_error: "Subject is required." })
    .min(5, "Subject must be at least 5 characters.")
    .max(150, "Subject cannot exceed 150 characters."),
  body: z
    .string({ required_error: "Message body is required." })
    .min(10, "Message body must be at least 10 characters.")
    .max(2000, "Message body cannot exceed 2000 characters."),
  channel: z.enum(COMMUNICATION_CHANNELS).default("Operational"),
  recipientType: z.enum(RECIPIENT_TYPES, {
    required_error: "Recipient type is required.",
  }),
  recipientIds: z
    .array(z.string())
    .min(1, "Select at least one recipient."),
  relatedEntityType: z
    .enum(["Booking", "Provider", "Delivery Partner"])
    .optional(),
  relatedEntityId: z.string().optional(),
});

export type ComposeMessageFormValues = z.infer<typeof ComposeMessageSchema>;

/**
 * Zod validation schema for Notification Preferences
 */
export const NotificationPreferencesSchema = z.object({
  booking: z.boolean(),
  assignment: z.boolean(),
  payment: z.boolean(),
  review: z.boolean(),
  provider: z.boolean(),
  deliveryPartner: z.boolean(),
  customer: z.boolean(),
  service: z.boolean(),
  system: z.boolean(),
});

export type NotificationPreferencesFormValues = z.infer<typeof NotificationPreferencesSchema>;
