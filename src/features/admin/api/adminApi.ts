/**
 * Admin & Operations domain API functions consuming the central apiClient.
 * Maps to all Admin / Operations backend controllers from B15 + B2 Auth / B3 Organization:
 *   1. AuthController (/api/v1/auth)
 *   2. AdminDashboardController (/api/v1/admin/dashboard)
 *   3. AdminOrganizationController (/api/v1/admin/organization)
 *   4. AdminMembersController (/api/v1/admin/organization/members)
 *   5. AdminUsersController (/api/v1/admin/users)
 *   6. AdminCustomerController (/api/v1/admin/customers)
 *   7. AdminProviderController (/api/v1/admin/providers)
 *   8. AdminDeliveryController (/api/v1/admin/delivery-partners)
 *   9. AdminBookingController (/api/v1/admin/bookings)
 *  10. AdminAssignmentController (/api/v1/admin/assignments)
 *  11. AdminCatalogController (/api/v1/admin/catalog)
 *  12. AdminFinancialController (/api/v1/admin/financial)
 *  13. AdminReviewController (/api/v1/admin/reviews)
 *  14. AdminNotificationController (/api/v1/admin/notifications)
 *  15. AdminSupportController (/api/v1/admin/support/tickets)
 *  16. AdminDisputeController (/api/v1/admin/support/disputes)
 *  17. AdminAuditController (/api/v1/admin/audit-logs)
 *  18. AdminSearchController (/api/v1/admin/search)
 *  19. AdminReportController (/api/v1/admin/reports)
 */

import { apiClient } from '@/lib/api/client';
import type { ApiSuccess, ApiPaginated, QueryParams } from '@/lib/api/types';

// =============================================================================
// AUTH & ORG CONTEXT TYPES
// =============================================================================

export interface AuthLoginPayload {
  identifier?: string;
  email?: string;
  phone?: string;
  password?: string;
}

export interface AuthUserResponse {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  avatarUrl?: string;
  role: string;
  createdAt: string;
  organizationId?: string;
}

export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthSessionItemResponse {
  id: string;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  lastActiveAt: string;
  createdAt: string;
  isCurrent: boolean;
}

export interface OrganizationContextResponse {
  id: string;
  name: string;
  slug: string;
  type: string;
  status: string;
  role?: string;
}

// =============================================================================
// ADMIN API CLIENT
// =============================================================================

export const adminApi = {
  // ---------------------------------------------------------------------------
  // 1. AUTHENTICATION & ORGANIZATION CONTEXT
  // ---------------------------------------------------------------------------
  auth: {
    login: (payload: AuthLoginPayload) =>
      apiClient.post<ApiSuccess<{ user: AuthUserResponse; tokens: AuthTokensResponse }>>(
        '/auth/login',
        payload
      ),

    logout: (refreshToken?: string) =>
      apiClient.post<ApiSuccess<{ message: string }>>('/auth/logout', { refreshToken }),

    logoutAll: () =>
      apiClient.post<ApiSuccess<{ message: string }>>('/auth/logout-all'),

    getMe: () =>
      apiClient.get<ApiSuccess<AuthUserResponse>>('/auth/me'),

    getSessions: () =>
      apiClient.get<ApiSuccess<AuthSessionItemResponse[]>>('/auth/sessions'),

    revokeSession: (sessionId: string) =>
      apiClient.post<ApiSuccess<{ message: string }>>(`/auth/sessions/${sessionId}/revoke`),

    changePassword: (payload: { currentPassword?: string; oldPassword?: string; newPassword?: string }) =>
      apiClient.post<ApiSuccess<{ message: string }>>('/auth/change-password', payload),

    verifyEmail: (token: string) =>
      apiClient.post<ApiSuccess<{ message: string }>>('/auth/verify-email', { token }),

    resendVerification: (email: string) =>
      apiClient.post<ApiSuccess<{ message: string }>>('/auth/resend-verification', { email }),

    forgotPassword: (email: string) =>
      apiClient.post<ApiSuccess<{ message: string }>>('/auth/forgot-password', { email }),

    resetPassword: (payload: { token: string; newPassword?: string; password?: string }) =>
      apiClient.post<ApiSuccess<{ message: string }>>('/auth/reset-password', payload),

    getOrganizations: () =>
      apiClient.get<ApiSuccess<OrganizationContextResponse[]>>('/auth/organizations'),

    getCurrentOrganization: () =>
      apiClient.get<ApiSuccess<OrganizationContextResponse>>('/auth/organizations/current'),

    selectOrganization: (organizationId: string) =>
      apiClient.post<ApiSuccess<{ organization: OrganizationContextResponse; tokens: AuthTokensResponse }>>(
        '/auth/organizations/select',
        { organizationId }
      ),
  },

  // ---------------------------------------------------------------------------
  // 2. DASHBOARD & KPIS
  // ---------------------------------------------------------------------------
  dashboard: {
    getMetrics: () =>
      apiClient.get<ApiSuccess<any>>('/admin/dashboard/metrics'),

    getSummary: () =>
      apiClient.get<ApiSuccess<any>>('/admin/dashboard'),
  },

  // ---------------------------------------------------------------------------
  // 3. ORGANIZATION SETTINGS
  // ---------------------------------------------------------------------------
  organization: {
    get: () =>
      apiClient.get<ApiSuccess<any>>('/admin/organization'),

    update: (payload: any) =>
      apiClient.patch<ApiSuccess<any>>('/admin/organization', payload),
  },

  // ---------------------------------------------------------------------------
  // 4. ORGANIZATION MEMBERS
  // ---------------------------------------------------------------------------
  members: {
    list: (params?: QueryParams) =>
      apiClient.get<ApiPaginated<any>>('/admin/organization/members', { params }),

    getById: (memberId: string) =>
      apiClient.get<ApiSuccess<any>>(`/admin/organization/members/${memberId}`),

    create: (payload: any) =>
      apiClient.post<ApiSuccess<any>>('/admin/organization/members', payload),

    update: (memberId: string, payload: any) =>
      apiClient.patch<ApiSuccess<any>>(`/admin/organization/members/${memberId}`, payload),

    updateRoles: (memberId: string, payload: { roles: string[] }) =>
      apiClient.patch<ApiSuccess<any>>(`/admin/organization/members/${memberId}/roles`, payload),

    remove: (memberId: string) =>
      apiClient.delete<ApiSuccess<any>>(`/admin/organization/members/${memberId}`),
  },

  // ---------------------------------------------------------------------------
  // 5. USER ADMINISTRATION (ADMIN ONLY)
  // ---------------------------------------------------------------------------
  users: {
    list: (params?: QueryParams) =>
      apiClient.get<ApiPaginated<any>>('/admin/users', { params }),

    getById: (userId: string) =>
      apiClient.get<ApiSuccess<any>>(`/admin/users/${userId}`),

    updateStatus: (userId: string, status: string) =>
      apiClient.patch<ApiSuccess<any>>(`/admin/users/${userId}/status`, { status }),

    revokeSessions: (userId: string) =>
      apiClient.post<ApiSuccess<any>>(`/admin/users/${userId}/revoke-sessions`),
  },

  // ---------------------------------------------------------------------------
  // 6. CUSTOMER MANAGEMENT
  // ---------------------------------------------------------------------------
  customers: {
    list: (params?: QueryParams) =>
      apiClient.get<ApiPaginated<any>>('/admin/customers', { params }),

    getById: (customerId: string) =>
      apiClient.get<ApiSuccess<any>>(`/admin/customers/${customerId}`),

    update: (customerId: string, payload: any) =>
      apiClient.patch<ApiSuccess<any>>(`/admin/customers/${customerId}`, payload),

    getBookings: (customerId: string, params?: QueryParams) =>
      apiClient.get<ApiPaginated<any>>(`/admin/customers/${customerId}/bookings`, { params }),

    getPayments: (customerId: string, params?: QueryParams) =>
      apiClient.get<ApiPaginated<any>>(`/admin/customers/${customerId}/payments`, { params }),

    getAddresses: (customerId: string) =>
      apiClient.get<ApiSuccess<any>>(`/admin/customers/${customerId}/addresses`),
  },

  // ---------------------------------------------------------------------------
  // 7. PROVIDER MANAGEMENT
  // ---------------------------------------------------------------------------
  providers: {
    list: (params?: QueryParams) =>
      apiClient.get<ApiPaginated<any>>('/admin/providers', { params }),

    getById: (providerId: string) =>
      apiClient.get<ApiSuccess<any>>(`/admin/providers/${providerId}`),

    update: (providerId: string, payload: any) =>
      apiClient.patch<ApiSuccess<any>>(`/admin/providers/${providerId}`, payload),

    verify: (providerId: string, isVerified: boolean) =>
      apiClient.patch<ApiSuccess<any>>(`/admin/providers/${providerId}/verify`, { isVerified }),

    getBookings: (providerId: string, params?: QueryParams) =>
      apiClient.get<ApiPaginated<any>>(`/admin/providers/${providerId}/bookings`, { params }),

    getEarnings: (providerId: string, params?: QueryParams) =>
      apiClient.get<ApiPaginated<any>>(`/admin/providers/${providerId}/earnings`, { params }),
  },

  // ---------------------------------------------------------------------------
  // 8. DELIVERY PARTNER MANAGEMENT
  // ---------------------------------------------------------------------------
  deliveryPartners: {
    list: (params?: QueryParams) =>
      apiClient.get<ApiPaginated<any>>('/admin/delivery-partners', { params }),

    getById: (partnerId: string) =>
      apiClient.get<ApiSuccess<any>>(`/admin/delivery-partners/${partnerId}`),

    update: (partnerId: string, payload: any) =>
      apiClient.patch<ApiSuccess<any>>(`/admin/delivery-partners/${partnerId}`, payload),

    verify: (partnerId: string, isVerified: boolean) =>
      apiClient.patch<ApiSuccess<any>>(`/admin/delivery-partners/${partnerId}/verify`, { isVerified }),

    getAssignments: (partnerId: string, params?: QueryParams) =>
      apiClient.get<ApiPaginated<any>>(`/admin/delivery-partners/${partnerId}/assignments`, { params }),

    getEarnings: (partnerId: string, params?: QueryParams) =>
      apiClient.get<ApiPaginated<any>>(`/admin/delivery-partners/${partnerId}/earnings`, { params }),
  },

  // ---------------------------------------------------------------------------
  // 9. BOOKING OPERATIONS
  // ---------------------------------------------------------------------------
  bookings: {
    list: (params?: QueryParams) =>
      apiClient.get<ApiPaginated<any>>('/admin/bookings', { params }),

    getById: (bookingId: string) =>
      apiClient.get<ApiSuccess<any>>(`/admin/bookings/${bookingId}`),

    cancel: (bookingId: string, payload: { reason: string; notes?: string }) =>
      apiClient.post<ApiSuccess<any>>(`/admin/bookings/${bookingId}/cancel`, payload),

    reschedule: (bookingId: string, payload: { date: string; timeSlot: string; reason?: string }) =>
      apiClient.post<ApiSuccess<any>>(`/admin/bookings/${bookingId}/reschedule`, payload),

    createNote: (bookingId: string, payload: { note: string; isInternal?: boolean }) =>
      apiClient.post<ApiSuccess<any>>(`/admin/bookings/${bookingId}/notes`, payload),

    getAssignments: (bookingId: string) =>
      apiClient.get<ApiSuccess<any>>(`/admin/bookings/${bookingId}/assignments`),

    getPayments: (bookingId: string) =>
      apiClient.get<ApiSuccess<any>>(`/admin/bookings/${bookingId}/payments`),

    getStatusHistory: (bookingId: string) =>
      apiClient.get<ApiSuccess<any>>(`/admin/bookings/${bookingId}/status-history`),
  },

  // ---------------------------------------------------------------------------
  // 10. ASSIGNMENT OPERATIONS
  // ---------------------------------------------------------------------------
  assignments: {
    list: (params?: QueryParams) =>
      apiClient.get<ApiPaginated<any>>('/admin/assignments', { params }),

    getById: (assignmentId: string) =>
      apiClient.get<ApiSuccess<any>>(`/admin/assignments/${assignmentId}`),

    reassign: (assignmentId: string, payload: { providerId?: string; deliveryPartnerId?: string; reason?: string }) =>
      apiClient.post<ApiSuccess<any>>(`/admin/assignments/${assignmentId}/reassign`, payload),

    cancel: (assignmentId: string, payload: { reason: string }) =>
      apiClient.post<ApiSuccess<any>>(`/admin/assignments/${assignmentId}/cancel`, payload),
  },

  // ---------------------------------------------------------------------------
  // 11. CATALOG ADMINISTRATION
  // ---------------------------------------------------------------------------
  catalog: {
    listCategories: (params?: QueryParams) =>
      apiClient.get<ApiSuccess<any>>('/admin/catalog/categories', { params }),

    getCategory: (categoryId: string) =>
      apiClient.get<ApiSuccess<any>>(`/admin/catalog/categories/${categoryId}`),

    createCategory: (payload: any) =>
      apiClient.post<ApiSuccess<any>>('/admin/catalog/categories', payload),

    updateCategory: (categoryId: string, payload: any) =>
      apiClient.patch<ApiSuccess<any>>(`/admin/catalog/categories/${categoryId}`, payload),

    deleteCategory: (categoryId: string) =>
      apiClient.delete<ApiSuccess<any>>(`/admin/catalog/categories/${categoryId}`),

    listServices: (params?: QueryParams) =>
      apiClient.get<ApiSuccess<any>>('/admin/catalog/services', { params }),

    getService: (serviceId: string) =>
      apiClient.get<ApiSuccess<any>>(`/admin/catalog/services/${serviceId}`),

    createService: (payload: any) =>
      apiClient.post<ApiSuccess<any>>('/admin/catalog/services', payload),

    updateService: (serviceId: string, payload: any) =>
      apiClient.patch<ApiSuccess<any>>(`/admin/catalog/services/${serviceId}`, payload),

    publishService: (serviceId: string) =>
      apiClient.post<ApiSuccess<any>>(`/admin/catalog/services/${serviceId}/publish`),

    unpublishService: (serviceId: string) =>
      apiClient.post<ApiSuccess<any>>(`/admin/catalog/services/${serviceId}/unpublish`),
  },

  // ---------------------------------------------------------------------------
  // 12. FINANCIAL OVERSIGHT & LEDGER
  // ---------------------------------------------------------------------------
  financial: {
    listPayments: (params?: QueryParams) =>
      apiClient.get<ApiPaginated<any>>('/admin/financial/payments', { params }),

    getPayment: (paymentId: string) =>
      apiClient.get<ApiSuccess<any>>(`/admin/financial/payments/${paymentId}`),

    overridePayment: (paymentId: string, payload: { status: string; reason: string }) =>
      apiClient.post<ApiSuccess<any>>(`/admin/financial/payments/${paymentId}/override`, payload),

    listTransactions: (params?: QueryParams) =>
      apiClient.get<ApiPaginated<any>>('/admin/financial/transactions', { params }),

    getTransaction: (transactionId: string) =>
      apiClient.get<ApiSuccess<any>>(`/admin/financial/transactions/${transactionId}`),

    listRefunds: (params?: QueryParams) =>
      apiClient.get<ApiPaginated<any>>('/admin/financial/refunds', { params }),

    getRefund: (refundId: string) =>
      apiClient.get<ApiSuccess<any>>(`/admin/financial/refunds/${refundId}`),

    processRefund: (refundId: string) =>
      apiClient.post<ApiSuccess<any>>(`/admin/financial/refunds/${refundId}/process`),

    failRefund: (refundId: string, payload: { reason: string }) =>
      apiClient.post<ApiSuccess<any>>(`/admin/financial/refunds/${refundId}/fail`, payload),

    listEarnings: (params?: QueryParams) =>
      apiClient.get<ApiPaginated<any>>('/admin/financial/earnings', { params }),

    getEarning: (earningId: string) =>
      apiClient.get<ApiSuccess<any>>(`/admin/financial/earnings/${earningId}`),

    getSummary: (params?: QueryParams) =>
      apiClient.get<ApiSuccess<any>>('/admin/financial/summary', { params }),
  },

  // ---------------------------------------------------------------------------
  // 13. REVIEW MODERATION
  // ---------------------------------------------------------------------------
  reviews: {
    list: (params?: QueryParams) =>
      apiClient.get<ApiSuccess<any>>('/admin/reviews', { params }),

    listReports: (params?: QueryParams) =>
      apiClient.get<ApiSuccess<any>>('/admin/reviews/reports/all', { params }),

    getById: (reviewId: string) =>
      apiClient.get<ApiSuccess<any>>(`/admin/reviews/${reviewId}`),

    publish: (reviewId: string, reason?: string) =>
      apiClient.post<ApiSuccess<any>>(`/admin/reviews/${reviewId}/publish`, { reason }),

    hide: (reviewId: string, reason?: string) =>
      apiClient.post<ApiSuccess<any>>(`/admin/reviews/${reviewId}/hide`, { reason }),

    reject: (reviewId: string, reason?: string) =>
      apiClient.post<ApiSuccess<any>>(`/admin/reviews/${reviewId}/reject`, { reason }),

    restore: (reviewId: string, reason?: string) =>
      apiClient.post<ApiSuccess<any>>(`/admin/reviews/${reviewId}/restore`, { reason }),
  },

  // ---------------------------------------------------------------------------
  // 14. NOTIFICATIONS & BROADCAST
  // ---------------------------------------------------------------------------
  notifications: {
    list: (params?: QueryParams) =>
      apiClient.get<ApiSuccess<any>>('/admin/notifications', { params }),

    getById: (notificationId: string) =>
      apiClient.get<ApiSuccess<any>>(`/admin/notifications/${notificationId}`),

    listTemplates: (params?: QueryParams) =>
      apiClient.get<ApiSuccess<any>>('/admin/notifications/templates/all', { params }),

    getTemplate: (templateId: string) =>
      apiClient.get<ApiSuccess<any>>(`/admin/notifications/templates/${templateId}`),

    updateTemplate: (templateId: string, payload: any) =>
      apiClient.patch<ApiSuccess<any>>(`/admin/notifications/templates/${templateId}`, payload),

    broadcast: (payload: { title: string; message: string; targetRole?: string; priority?: string }) =>
      apiClient.post<ApiSuccess<any>>('/admin/notifications/broadcast', payload),
  },

  // ---------------------------------------------------------------------------
  // 15. SUPPORT TICKETS
  // ---------------------------------------------------------------------------
  support: {
    list: (params?: QueryParams) =>
      apiClient.get<ApiPaginated<any>>('/admin/support/tickets', { params }),

    getById: (ticketId: string) =>
      apiClient.get<ApiSuccess<any>>(`/admin/support/tickets/${ticketId}`),

    assign: (ticketId: string, payload: { assignedToId: string; notes?: string }) =>
      apiClient.post<ApiSuccess<any>>(`/admin/support/tickets/${ticketId}/assign`, payload),

    escalate: (ticketId: string, payload: { reason: string; escalatedToId?: string }) =>
      apiClient.post<ApiSuccess<any>>(`/admin/support/tickets/${ticketId}/escalate`, payload),

    updatePriority: (ticketId: string, payload: { priority: string; reason?: string }) =>
      apiClient.post<ApiSuccess<any>>(`/admin/support/tickets/${ticketId}/priority`, payload),

    resolve: (ticketId: string, payload: { resolution: string; internalNotes?: string }) =>
      apiClient.post<ApiSuccess<any>>(`/admin/support/tickets/${ticketId}/resolve`, payload),

    close: (ticketId: string, payload: { closeReason: string }) =>
      apiClient.post<ApiSuccess<any>>(`/admin/support/tickets/${ticketId}/close`, payload),

    reopen: (ticketId: string, payload: { reopenReason: string }) =>
      apiClient.post<ApiSuccess<any>>(`/admin/support/tickets/${ticketId}/reopen`, payload),

    createNote: (ticketId: string, payload: { note: string; isInternal?: boolean }) =>
      apiClient.post<ApiSuccess<any>>(`/admin/support/tickets/${ticketId}/notes`, payload),

    sendMessage: (ticketId: string, payload: { message: string; attachments?: string[] }) =>
      apiClient.post<ApiSuccess<any>>(`/admin/support/tickets/${ticketId}/messages`, payload),

    createDisputeFromTicket: (ticketId: string, payload: any) =>
      apiClient.post<ApiSuccess<any>>(`/admin/support/tickets/${ticketId}/dispute`, payload),
  },

  // ---------------------------------------------------------------------------
  // 16. DISPUTES RESOLUTION
  // ---------------------------------------------------------------------------
  disputes: {
    list: (params?: QueryParams) =>
      apiClient.get<ApiPaginated<any>>('/admin/support/disputes', { params }),

    getById: (disputeId: string) =>
      apiClient.get<ApiSuccess<any>>(`/admin/support/disputes/${disputeId}`),

    assign: (disputeId: string, payload: { assignedToId: string; notes?: string }) =>
      apiClient.post<ApiSuccess<any>>(`/admin/support/disputes/${disputeId}/assign`, payload),

    escalate: (disputeId: string, payload: { reason: string; escalatedToId?: string }) =>
      apiClient.post<ApiSuccess<any>>(`/admin/support/disputes/${disputeId}/escalate`, payload),

    updatePriority: (disputeId: string, payload: { priority: string; reason?: string }) =>
      apiClient.post<ApiSuccess<any>>(`/admin/support/disputes/${disputeId}/priority`, payload),

    resolve: (disputeId: string, payload: { resolution: string; refundAmount?: number; refundReason?: string }) =>
      apiClient.post<ApiSuccess<any>>(`/admin/support/disputes/${disputeId}/resolve`, payload),

    reject: (disputeId: string, payload: { rejectionReason: string }) =>
      apiClient.post<ApiSuccess<any>>(`/admin/support/disputes/${disputeId}/reject`, payload),

    reopen: (disputeId: string, payload: { reopenReason: string }) =>
      apiClient.post<ApiSuccess<any>>(`/admin/support/disputes/${disputeId}/reopen`, payload),
  },

  // ---------------------------------------------------------------------------
  // 17. AUDIT LOGS (ADMIN ONLY)
  // ---------------------------------------------------------------------------
  audit: {
    list: (params?: QueryParams) =>
      apiClient.get<ApiPaginated<any>>('/admin/audit-logs', { params }),

    getById: (auditEventId: string) =>
      apiClient.get<ApiSuccess<any>>(`/admin/audit-logs/${auditEventId}`),
  },

  // ---------------------------------------------------------------------------
  // 18. GLOBAL SEARCH
  // ---------------------------------------------------------------------------
  search: (params: { q: string; entityType?: string; limit?: number }) =>
    apiClient.get<ApiSuccess<any>>('/admin/search', { params }),

  // ---------------------------------------------------------------------------
  // 19. ANALYTICS & REPORTS (ADMIN ONLY)
  // ---------------------------------------------------------------------------
  reports: {
    bookings: (params?: QueryParams) =>
      apiClient.get<ApiSuccess<any>>('/admin/reports/bookings', { params }),

    revenue: (params?: QueryParams) =>
      apiClient.get<ApiSuccess<any>>('/admin/reports/revenue', { params }),

    providers: () =>
      apiClient.get<ApiSuccess<any>>('/admin/reports/providers'),

    customers: (params?: QueryParams) =>
      apiClient.get<ApiSuccess<any>>('/admin/reports/customers', { params }),
  },

  // ---------------------------------------------------------------------------
  // BACKWARDS-COMPATIBILITY TOP-LEVEL METHODS
  // ---------------------------------------------------------------------------
  getDashboardMetrics: () =>
    apiClient.get<ApiSuccess<any>>('/admin/dashboard'),

  getCustomers: (params?: QueryParams) =>
    apiClient.get<ApiPaginated<any>>('/admin/customers', { params }),

  getProviders: (params?: QueryParams) =>
    apiClient.get<ApiPaginated<any>>('/admin/providers', { params }),

  getDeliveryPartners: (params?: QueryParams) =>
    apiClient.get<ApiPaginated<any>>('/admin/delivery-partners', { params }),

  getBookings: (params?: QueryParams) =>
    apiClient.get<ApiPaginated<any>>('/admin/bookings', { params }),

  getDisputes: (params?: QueryParams) =>
    apiClient.get<ApiPaginated<any>>('/admin/support/disputes', { params }),

  getAuditLogs: (params?: QueryParams) =>
    apiClient.get<ApiPaginated<any>>('/admin/audit-logs', { params }),

  getAnalyticsSummary: (params?: QueryParams) =>
    apiClient.get<ApiSuccess<any>>('/admin/reports/revenue', { params }),
};
