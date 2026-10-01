/**
 * WASHORA Phase B13: Notifications & Communication Domain Types & Enums
 */

export {
  NotificationType,
  NotificationPriority,
  NotificationStatus,
  CommunicationChannel,
  CommunicationStatus,
  RecipientType,
} from '@prisma/client';

// ============================================================================
// 1. NOTIFICATION TAXONOMY & CATEGORIES
// ============================================================================

export const NotificationTaxonomy = {
  // Customer Scope
  BOOKING_CONFIRMED: 'BOOKING_CONFIRMED',
  PICKUP_SCHEDULED: 'PICKUP_SCHEDULED',
  PICKUP_COMPLETED: 'PICKUP_COMPLETED',
  PROCESSING_STARTED: 'PROCESSING_STARTED',
  PROCESSING_COMPLETED: 'PROCESSING_COMPLETED',
  OUTFIT_DELIVERED: 'OUTFIT_DELIVERED',
  PAYMENT_SUCCESS: 'PAYMENT_SUCCESS',
  REFUND_PROCESSED: 'REFUND_PROCESSED',
  DISCOUNT_ALERT: 'DISCOUNT_ALERT',
  REVIEW_REQUESTED: 'REVIEW_REQUESTED',
  BOOKING_CANCELLED: 'BOOKING_CANCELLED',

  // Provider Scope
  NEW_ORDER_ASSIGNED: 'NEW_ORDER_ASSIGNED',
  PICKUP_ARRIVED: 'PICKUP_ARRIVED',
  PAYOUT_SETTLED: 'PAYOUT_SETTLED',
  REVIEW_RECEIVED: 'REVIEW_RECEIVED',
  CAPACITY_WARNING: 'CAPACITY_WARNING',
  DISPUTE_RAISED: 'DISPUTE_RAISED',

  // Delivery Partner Scope
  DELIVERY_JOB_ASSIGNED: 'DELIVERY_JOB_ASSIGNED',
  DELIVERY_JOB_CANCELLED: 'DELIVERY_JOB_CANCELLED',
  PICKUP_READY: 'PICKUP_READY',
  EARNING_CREDITED: 'EARNING_CREDITED',
  DELIVERY_ROUTE_UPDATED: 'DELIVERY_ROUTE_UPDATED',

  // Operations / Admin Scope
  OPERATIONS_BROADCAST: 'OPERATIONS_BROADCAST',
  SYSTEM_ALERT: 'SYSTEM_ALERT',
  SECURITY_ALERT: 'SECURITY_ALERT',
  DISPUTE_SUBMITTED: 'DISPUTE_SUBMITTED',
  REFUND_REQUESTED: 'REFUND_REQUESTED',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
} as const;

export type NotificationTaxonomyType =
  (typeof NotificationTaxonomy)[keyof typeof NotificationTaxonomy];

export const NotificationCategory = {
  BOOKING: 'BOOKING',
  ASSIGNMENT: 'ASSIGNMENT',
  PAYMENT: 'PAYMENT',
  EARNINGS: 'EARNINGS',
  PROMOTIONS: 'PROMOTIONS',
  REVIEWS: 'REVIEWS',
  SECURITY: 'SECURITY',
  SYSTEM: 'SYSTEM',
} as const;

export type NotificationCategoryType =
  (typeof NotificationCategory)[keyof typeof NotificationCategory];

/**
 * Maps granular notification types to notification categories
 */
export const NotificationTypeCategoryMap: Record<string, NotificationCategoryType> = {
  BOOKING_CONFIRMED: 'BOOKING',
  PICKUP_SCHEDULED: 'BOOKING',
  PICKUP_COMPLETED: 'BOOKING',
  PROCESSING_STARTED: 'BOOKING',
  PROCESSING_COMPLETED: 'BOOKING',
  OUTFIT_DELIVERED: 'BOOKING',
  BOOKING_CANCELLED: 'BOOKING',

  NEW_ORDER_ASSIGNED: 'ASSIGNMENT',
  DELIVERY_JOB_ASSIGNED: 'ASSIGNMENT',
  DELIVERY_JOB_CANCELLED: 'ASSIGNMENT',
  PICKUP_READY: 'ASSIGNMENT',
  PICKUP_ARRIVED: 'ASSIGNMENT',
  DELIVERY_ROUTE_UPDATED: 'ASSIGNMENT',

  PAYMENT_SUCCESS: 'PAYMENT',
  REFUND_PROCESSED: 'PAYMENT',
  REFUND_REQUESTED: 'PAYMENT',

  PAYOUT_SETTLED: 'EARNINGS',
  EARNING_CREDITED: 'EARNINGS',

  DISCOUNT_ALERT: 'PROMOTIONS',

  REVIEW_REQUESTED: 'REVIEWS',
  REVIEW_RECEIVED: 'REVIEWS',

  SECURITY_ALERT: 'SECURITY',
  SUSPICIOUS_ACTIVITY: 'SECURITY',

  OPERATIONS_BROADCAST: 'SYSTEM',
  SYSTEM_ALERT: 'SYSTEM',
  CAPACITY_WARNING: 'SYSTEM',
  DISPUTE_RAISED: 'SYSTEM',
  DISPUTE_SUBMITTED: 'SYSTEM',
};

// ============================================================================
// 2. TEMPLATE VARIABLE WHITELIST
// ============================================================================

export const TemplateVariableWhitelist = [
  'customerName',
  'providerName',
  'deliveryPartnerName',
  'bookingId',
  'bookingNumber',
  'serviceName',
  'amount',
  'currency',
  'pickupTime',
  'deliveryTime',
  'trackingUrl',
  'status',
  'reason',
  'date',
  'address',
  'rating',
  'couponCode',
  'discountAmount',
  'supportTicketId',
] as const;

export type TemplateVariable = (typeof TemplateVariableWhitelist)[number];

// ============================================================================
// 3. ERROR CODES
// ============================================================================

export const NotificationErrorCode = {
  NOTIFICATION_NOT_FOUND: 'NOTIFICATION_NOT_FOUND',
  NOTIFICATION_FORBIDDEN: 'NOTIFICATION_FORBIDDEN',
  NOTIFICATION_ALREADY_READ: 'NOTIFICATION_ALREADY_READ',
  NOTIFICATION_ALREADY_ARCHIVED: 'NOTIFICATION_ALREADY_ARCHIVED',
  PREFERENCE_NOT_FOUND: 'PREFERENCE_NOT_FOUND',
  TEMPLATE_NOT_FOUND: 'TEMPLATE_NOT_FOUND',
  TEMPLATE_ALREADY_EXISTS: 'TEMPLATE_ALREADY_EXISTS',
  TEMPLATE_VARIABLE_INVALID: 'TEMPLATE_VARIABLE_INVALID',
  COMMUNICATION_NOT_FOUND: 'COMMUNICATION_NOT_FOUND',
  COMMUNICATION_ALREADY_SENT: 'COMMUNICATION_ALREADY_SENT',
  COMMUNICATION_CANCEL_FORBIDDEN: 'COMMUNICATION_CANCEL_FORBIDDEN',
  COMMUNICATION_RETRY_EXCEEDED: 'COMMUNICATION_RETRY_EXCEEDED',
  IDEMPOTENCY_KEY_MISSING: 'IDEMPOTENCY_KEY_MISSING',
  IDEMPOTENCY_KEY_CONFLICT: 'IDEMPOTENCY_KEY_CONFLICT',
  TENANT_MISMATCH: 'TENANT_MISMATCH',
  RECIPIENT_RESOLUTION_EMPTY: 'RECIPIENT_RESOLUTION_EMPTY',
} as const;

export type NotificationErrorCodeType =
  (typeof NotificationErrorCode)[keyof typeof NotificationErrorCode];

// ============================================================================
// 4. AUDIT EVENT ACTIONS
// ============================================================================

export const NotificationAuditAction = {
  NOTIFICATION_CREATED: 'NOTIFICATION_CREATED',
  NOTIFICATION_READ: 'NOTIFICATION_READ',
  NOTIFICATION_ARCHIVED: 'NOTIFICATION_ARCHIVED',
  NOTIFICATION_BULK_READ: 'NOTIFICATION_BULK_READ',
  NOTIFICATION_PREFERENCE_UPDATED: 'NOTIFICATION_PREFERENCE_UPDATED',
  NOTIFICATION_TEMPLATE_CREATED: 'NOTIFICATION_TEMPLATE_CREATED',
  NOTIFICATION_TEMPLATE_UPDATED: 'NOTIFICATION_TEMPLATE_UPDATED',
  NOTIFICATION_TEMPLATE_ARCHIVED: 'NOTIFICATION_TEMPLATE_ARCHIVED',
  COMMUNICATION_CREATED: 'COMMUNICATION_CREATED',
  COMMUNICATION_QUEUED: 'COMMUNICATION_QUEUED',
  COMMUNICATION_SENT: 'COMMUNICATION_SENT',
  COMMUNICATION_DELIVERED: 'COMMUNICATION_DELIVERED',
  COMMUNICATION_FAILED: 'COMMUNICATION_FAILED',
  COMMUNICATION_RETRIED: 'COMMUNICATION_RETRIED',
  COMMUNICATION_CANCELLED: 'COMMUNICATION_CANCELLED',
  OPERATIONS_BROADCAST_CREATED: 'OPERATIONS_BROADCAST_CREATED',
} as const;

export type NotificationAuditActionType =
  (typeof NotificationAuditAction)[keyof typeof NotificationAuditAction];

// ============================================================================
// 5. RBAC PERMISSION CODES (B13)
// ============================================================================

export const NotificationPermission = {
  READ_SELF: 'notifications.read.self',
  UPDATE_SELF: 'notifications.update.self',
  PREFERENCES_READ_SELF: 'notifications.preferences.read.self',
  PREFERENCES_UPDATE_SELF: 'notifications.preferences.update.self',
  READ_ORGANIZATION: 'notifications.read.organization',
  BROADCAST_CREATE: 'notifications.broadcast.create',
  TEMPLATES_READ: 'notifications.templates.read',
  TEMPLATES_CREATE: 'notifications.templates.create',
  TEMPLATES_UPDATE: 'notifications.templates.update',
  COMMUNICATIONS_READ_ORGANIZATION: 'communications.read.organization',
  COMMUNICATIONS_CREATE: 'communications.create',
  COMMUNICATIONS_RETRY: 'communications.retry',
  COMMUNICATIONS_CANCEL: 'communications.cancel',
  COMMUNICATIONS_READ_SELF: 'communications.read.self',
  ADMIN: 'notifications.admin',
} as const;

// ============================================================================
// 6. DOMAIN EVENT INTERFACES
// ============================================================================

export interface NotificationEvent<T = Record<string, any>> {
  eventId: string; // SHA-256 or UUID
  eventType: string; // e.g. "BOOKING_CONFIRMED"
  organizationId: string;
  resourceType: string; // e.g. "BOOKING"
  resourceId: string;
  recipientUserIds: string[];
  data: T;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  occurredAt?: Date;
}
