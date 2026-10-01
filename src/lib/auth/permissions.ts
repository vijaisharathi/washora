/**
 * Canonical backend permission definitions and client-side authorization check helpers.
 * Note: Frontend permission checks are UX protection only; the backend remains authoritative.
 */

export const Permissions = {
  // Organization
  ORGANIZATION_READ: 'organization.read',
  ORGANIZATION_UPDATE: 'organization.update',

  // Members
  MEMBERS_READ: 'members.read',
  MEMBERS_CREATE: 'members.create',
  MEMBERS_UPDATE: 'members.update',

  // Customers
  CUSTOMERS_READ: 'customers.read',
  CUSTOMERS_UPDATE: 'customers.update',
  CUSTOMERS_MANAGE_STATUS: 'customers.manage_status',

  // Providers
  PROVIDERS_READ: 'providers.read',
  PROVIDERS_UPDATE: 'providers.update',

  // Delivery
  DELIVERY_READ: 'delivery.read',
  DELIVERY_UPDATE: 'delivery.update',

  // Bookings
  BOOKINGS_READ: 'bookings.read',
  BOOKINGS_CANCEL: 'bookings.cancel',
  BOOKINGS_RESCHEDULE: 'bookings.reschedule',

  // Assignments
  ASSIGNMENTS_READ: 'assignments.read',
  ASSIGNMENTS_REASSIGN: 'assignments.reassign',

  // Payments & Refunds
  PAYMENTS_READ: 'payments.read',
  PAYMENTS_MANAGE: 'payments.manage',
  REFUNDS_READ: 'refunds.read',
  REFUNDS_MANAGE: 'refunds.manage',

  // Reviews
  REVIEWS_READ: 'reviews.read',
  REVIEWS_MODERATE: 'reviews.moderate',

  // Notifications
  NOTIFICATIONS_READ: 'notifications.read',
  NOTIFICATIONS_BROADCAST: 'notifications.broadcast',

  // Support & Disputes
  SUPPORT_READ: 'support.read',
  SUPPORT_MANAGE: 'support.manage',
  DISPUTES_READ: 'disputes.read',
  DISPUTES_MANAGE: 'disputes.manage',

  // System & Analytics
  AUDIT_READ: 'audit.read',
  REPORTS_READ: 'reports.read',
  DASHBOARD_READ: 'dashboard.read',
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions] | string;

export function hasPermission(
  userPermissions: string[] | undefined | null,
  requiredPermission: Permission
): boolean {
  if (!userPermissions || !Array.isArray(userPermissions)) return false;
  // Wildcard admin permission support if present
  if (userPermissions.includes('*') || userPermissions.includes('admin.*')) {
    return true;
  }
  return userPermissions.includes(requiredPermission);
}

export function hasAllPermissions(
  userPermissions: string[] | undefined | null,
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.every((perm) => hasPermission(userPermissions, perm));
}

export function hasAnyPermission(
  userPermissions: string[] | undefined | null,
  candidatePermissions: Permission[]
): boolean {
  return candidatePermissions.some((perm) => hasPermission(userPermissions, perm));
}
