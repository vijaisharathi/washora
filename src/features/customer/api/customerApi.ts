/**
 * Customer domain API functions consuming the central apiClient.
 * Maps to all customer-facing NestJS controllers:
 *   - AuthController
 *   - CustomerController
 *   - CustomerBookingController
 *   - CatalogController
 *   - CustomerNotificationController
 *   - CustomerSupportController
 *   - CustomerReviewController
 *   - CustomerOfferController
 *   - CustomerCouponController
 *   - CustomerPaymentController
 */

import { apiClient } from '@/lib/api/client';
import type { ApiSuccess, ApiPaginated, QueryParams } from '@/lib/api/types';

// =============================================================================
// AUTH
// =============================================================================

export interface AuthLoginPayload {
  identifier?: string;
  email?: string;
  password: string;
}

export interface AuthRegisterPayload {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthLoginResponse {
  user: AuthUserResponse;
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn: number;
}

export interface AuthRegisterResponse {
  user: AuthUserResponse;
  message: string;
  _devVerificationToken?: string;
  tokens?: AuthTokensResponse;
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
}

export interface AuthSessionResponse {
  id: string;
  device?: string;
  ipAddress?: string;
  lastActiveAt: string;
  createdAt: string;
  isCurrent: boolean;
}

export interface AuthOrganizationResponse {
  id: string;
  publicId: string;
  name: string;
  role: string;
}

// =============================================================================
// CUSTOMER PROFILE
// =============================================================================

export interface CustomerProfileData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  preferences?: Record<string, unknown>;
}

export interface CustomerAddressData {
  id: string;
  tag: string;
  recipientName?: string;
  phoneNumber?: string;
  addressLine1: string;
  addressLine2?: string;
  apartmentSuite?: string;
  landmark?: string;
  city: string;
  state?: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

// =============================================================================
// BOOKINGS
// =============================================================================

export interface BookingItemPayload {
  serviceId: string;
  serviceVariantId: string;
  quantity: number;
  specialInstructions?: string;
}

export interface CreateBookingPayload {
  addressId: string;
  scheduledPickupAt: string;
  scheduledDeliveryAt?: string;
  specialInstructions?: string;
  items: BookingItemPayload[];
}

export interface CancelBookingPayload {
  reason: string;
}

export interface RescheduleBookingPayload {
  scheduledPickupAt?: string;
  scheduledDeliveryAt?: string;
  reason?: string;
}

export interface BookingNotePayload {
  content: string;
}

// =============================================================================
// CATALOG
// =============================================================================

export interface CatalogCategoryQueryParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface CatalogServiceQueryParams {
  search?: string;
  categoryId?: string;
  categorySlug?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

// =============================================================================
// NOTIFICATIONS
// =============================================================================

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  isRead?: boolean;
}

// =============================================================================
// SUPPORT
// =============================================================================

export interface CreateSupportTicketPayload {
  subject: string;
  category: string;
  description: string;
  message?: string;
  priority?: string;
  bookingId?: string;
}

export interface CreateSupportMessagePayload {
  content: string;
  attachmentUrls?: string[];
}

// =============================================================================
// DISPUTES
// =============================================================================

export interface CreateDisputePayload {
  bookingId: string;
  reason: string;
  description: string;
  desiredResolution?: string;
  requestedResolution?: string;
  refundAmount?: number;
  refundAmountRequested?: number;
}

export interface CreateDisputeMessagePayload {
  content: string;
}

export interface CreateDisputeEvidencePayload {
  fileUrl: string;
  fileName: string;
  fileType: string;
  description?: string;
}

// =============================================================================
// REVIEWS
// =============================================================================

export interface CreateReviewPayload {
  bookingId: string;
  rating: number;
  comment?: string;
  tags?: string[];
}

export interface UpdateReviewPayload {
  rating?: number;
  comment?: string;
  tags?: string[];
}

export interface CreateReviewReportPayload {
  reason: string;
  description?: string;
}

export interface ReviewQueryParams {
  page?: number;
  limit?: number;
  status?: string;
}

// =============================================================================
// OFFERS & COUPONS
// =============================================================================

export interface ValidateOfferPayload {
  bookingId?: string;
  orderTotal?: number;
}

export interface RedeemOfferPayload {
  bookingId: string;
}

export interface ValidateCouponPayload {
  code: string;
  bookingId?: string;
  orderTotal?: number;
  subtotal?: number;
}

export interface RedeemCouponPayload {
  code: string;
  bookingId: string;
}

// =============================================================================
// PAYMENTS
// =============================================================================

export interface CreatePaymentPayload {
  method?: string;
  paymentMethod?: string;
  amount?: number;
  currency?: string;
}

export interface ProcessPaymentPayload {
  gatewayReference?: string;
  gatewayTransactionId?: string;
}


export interface PaymentQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  bookingId?: string;
}

// =============================================================================
// API FUNCTIONS
// =============================================================================

export const customerApi = {
  // ---------------------------------------------------------------------------
  // AUTH
  // ---------------------------------------------------------------------------

  auth: {
    login: (data: AuthLoginPayload) =>
      apiClient.post<ApiSuccess<AuthLoginResponse>>(
        '/auth/login',
        {
          email: data.email || data.identifier,
          password: data.password,
        },
        { auth: false }
      ),

    register: (data: AuthRegisterPayload) =>
      apiClient.post<ApiSuccess<AuthRegisterResponse>>('/auth/register', data, { auth: false }),


    refresh: (refreshToken: string) =>
      apiClient.post<ApiSuccess<AuthTokensResponse>>('/auth/refresh', { refreshToken }, { auth: false }),

    logout: () =>
      apiClient.post<ApiSuccess<{ message: string }>>('/auth/logout'),

    getMe: () =>
      apiClient.get<ApiSuccess<AuthUserResponse>>('/auth/me'),

    forgotPassword: (email: string) =>
      apiClient.post<ApiSuccess<{ message: string }>>('/auth/forgot-password', { email }, { auth: false }),

    resetPassword: (token: string, password: string) =>
      apiClient.post<ApiSuccess<{ message: string }>>('/auth/reset-password', { token, password }, { auth: false }),

    verifyEmail: (token: string) =>
      apiClient.post<ApiSuccess<{ message: string }>>('/auth/verify-email', { token }, { auth: false }),

    resendVerification: (email: string) =>
      apiClient.post<ApiSuccess<{ message: string }>>('/auth/resend-verification', { email }, { auth: false }),

    changePassword: (currentPassword: string, newPassword: string) =>
      apiClient.post<ApiSuccess<{ message: string }>>('/auth/change-password', { currentPassword, newPassword }),

    listSessions: () =>
      apiClient.get<ApiSuccess<AuthSessionResponse[]>>('/auth/sessions'),

    revokeSession: (sessionId: string) =>
      apiClient.delete<ApiSuccess<{ message: string }>>(`/auth/sessions/${sessionId}`),

    getOrganizations: () =>
      apiClient.get<ApiSuccess<AuthOrganizationResponse[]>>('/auth/organizations'),

    getCurrentOrganization: () =>
      apiClient.get<ApiSuccess<AuthOrganizationResponse>>('/auth/organizations/current'),

    selectOrganization: (organizationId: string) =>
      apiClient.post<ApiSuccess<AuthOrganizationResponse>>('/auth/organizations/select', { organizationId }),
  },

  // ---------------------------------------------------------------------------
  // PROFILE
  // ---------------------------------------------------------------------------

  profile: {
    get: () =>
      apiClient.get<ApiSuccess<CustomerProfileData>>('/customer/profile'),

    update: (data: Partial<CustomerProfileData>) =>
      apiClient.patch<ApiSuccess<CustomerProfileData>>('/customer/profile', data),
  },

  // ---------------------------------------------------------------------------
  // ADDRESSES
  // ---------------------------------------------------------------------------

  addresses: {
    list: () =>
      apiClient.get<ApiSuccess<CustomerAddressData[]>>('/customer/addresses'),

    get: (id: string) =>
      apiClient.get<ApiSuccess<CustomerAddressData>>(`/customer/addresses/${id}`),

    create: (data: Omit<CustomerAddressData, 'id'>) =>
      apiClient.post<ApiSuccess<CustomerAddressData>>('/customer/addresses', data),

    update: (id: string, data: Partial<CustomerAddressData>) =>
      apiClient.patch<ApiSuccess<CustomerAddressData>>(`/customer/addresses/${id}`, data),

    delete: (id: string) =>
      apiClient.delete<ApiSuccess<{ message: string }>>(`/customer/addresses/${id}`),

    setDefault: (id: string) =>
      apiClient.post<ApiSuccess<CustomerAddressData>>(`/customer/addresses/${id}/default`),
  },

  // ---------------------------------------------------------------------------
  // FAVORITES
  // ---------------------------------------------------------------------------

  favorites: {
    list: () =>
      apiClient.get<ApiSuccess<unknown[]>>('/customer/favorites'),

    add: (serviceId: string) =>
      apiClient.post<ApiSuccess<{ message: string }>>(`/customer/favorites/${serviceId}`),

    remove: (serviceId: string) =>
      apiClient.delete<ApiSuccess<{ message: string }>>(`/customer/favorites/${serviceId}`),
  },

  // ---------------------------------------------------------------------------
  // REWARDS
  // ---------------------------------------------------------------------------

  rewards: {
    get: () =>
      apiClient.get<ApiSuccess<unknown>>('/customer/rewards'),

    getTransactions: (params?: QueryParams) =>
      apiClient.get<ApiPaginated<unknown>>('/customer/rewards/transactions', { params }),
  },

  // ---------------------------------------------------------------------------
  // BOOKINGS
  // ---------------------------------------------------------------------------

  bookings: {
    list: (params?: QueryParams) =>
      apiClient.get<ApiPaginated<unknown>>('/customer/bookings', { params }),

    get: (id: string) =>
      apiClient.get<ApiSuccess<unknown>>(`/customer/bookings/${id}`),

    getById: (id: string) =>
      apiClient.get<ApiSuccess<unknown>>(`/customer/bookings/${id}`),


    create: (data: CreateBookingPayload, idempotencyKey?: string) =>
      apiClient.post<ApiSuccess<unknown>>('/customer/bookings', data, {
        idempotencyKey,
      }),

    cancel: (id: string, data: CancelBookingPayload) =>
      apiClient.post<ApiSuccess<unknown>>(`/customer/bookings/${id}/cancel`, data),

    reschedule: (id: string, data: RescheduleBookingPayload) =>
      apiClient.post<ApiSuccess<unknown>>(`/customer/bookings/${id}/reschedule`, data),

    getStatusHistory: (id: string) =>
      apiClient.get<ApiSuccess<unknown[]>>(`/customer/bookings/${id}/status-history`),

    getNotes: (id: string) =>
      apiClient.get<ApiSuccess<unknown[]>>(`/customer/bookings/${id}/notes`),

    addNote: (id: string, data: BookingNotePayload) =>
      apiClient.post<ApiSuccess<unknown>>(`/customer/bookings/${id}/notes`, data),
  },

  // ---------------------------------------------------------------------------
  // CATALOG
  // ---------------------------------------------------------------------------

  catalog: {
    getCategories: (params?: QueryParams) =>
      apiClient.get<ApiSuccess<unknown[]>>('/catalog/categories', { params }),

    getCategoryBySlug: (slug: string) =>
      apiClient.get<ApiSuccess<unknown>>(`/catalog/categories/slug/${slug}`),

    getCategoryById: (id: string) =>
      apiClient.get<ApiSuccess<unknown>>(`/catalog/categories/${id}`),

    getServices: (params?: QueryParams) =>
      apiClient.get<ApiPaginated<unknown>>('/catalog/services', { params }),

    getServiceBySlug: (slug: string) =>
      apiClient.get<ApiSuccess<unknown>>(`/catalog/services/slug/${slug}`),

    getServiceById: (id: string) =>
      apiClient.get<ApiSuccess<unknown>>(`/catalog/services/${id}`),

    getServiceVariants: (serviceId: string) =>
      apiClient.get<ApiSuccess<unknown[]>>(`/catalog/services/${serviceId}/variants`),

    getServiceImages: (serviceId: string) =>
      apiClient.get<ApiSuccess<unknown[]>>(`/catalog/services/${serviceId}/images`),
  },

  // ---------------------------------------------------------------------------
  // NOTIFICATIONS
  // ---------------------------------------------------------------------------

  notifications: {
    list: (params?: QueryParams) =>
      apiClient.get<ApiPaginated<unknown>>('/customer/notifications', { params }),

    getUnreadCount: () =>
      apiClient.get<ApiSuccess<{ total: number; byCategory?: Record<string, number> }>>('/customer/notifications/unread-count'),

    markAsRead: (id: string) =>
      apiClient.patch<ApiSuccess<unknown>>(`/customer/notifications/${id}/read`),

    markAllAsRead: () =>
      apiClient.post<ApiSuccess<{ count: number }>>('/customer/notifications/read-all'),

    archive: (id: string) =>
      apiClient.patch<ApiSuccess<unknown>>(`/customer/notifications/${id}/archive`),

    getPreferences: () =>
      apiClient.get<ApiSuccess<unknown>>('/customer/notifications/preferences'),

    updatePreferences: (data: Record<string, unknown>) =>
      apiClient.patch<ApiSuccess<unknown>>('/customer/notifications/preferences', data),

  },

  // ---------------------------------------------------------------------------
  // SUPPORT TICKETS
  // ---------------------------------------------------------------------------

  support: {
    createTicket: (data: CreateSupportTicketPayload) =>
      apiClient.post<ApiSuccess<unknown>>('/customer/support/tickets', data),

    listTickets: (params?: QueryParams) =>
      apiClient.get<ApiPaginated<unknown>>('/customer/support/tickets', { params }),

    getTicket: (ticketId: string) =>
      apiClient.get<ApiSuccess<unknown>>(`/customer/support/tickets/${ticketId}`),

    addMessage: (ticketId: string, data: CreateSupportMessagePayload) =>
      apiClient.post<ApiSuccess<unknown>>(`/customer/support/tickets/${ticketId}/messages`, data),

    listMessages: (ticketId: string) =>
      apiClient.get<ApiSuccess<unknown[]>>(`/customer/support/tickets/${ticketId}/messages`),

    reopenTicket: (ticketId: string) =>
      apiClient.post<ApiSuccess<unknown>>(`/customer/support/tickets/${ticketId}/reopen`),
  },

  // ---------------------------------------------------------------------------
  // DISPUTES
  // ---------------------------------------------------------------------------

  disputes: {
    create: (data: CreateDisputePayload) =>
      apiClient.post<ApiSuccess<unknown>>('/customer/disputes', data),

    list: (params?: QueryParams) =>
      apiClient.get<ApiPaginated<unknown>>('/customer/disputes', { params }),

    get: (disputeId: string) =>
      apiClient.get<ApiSuccess<unknown>>(`/customer/disputes/${disputeId}`),

    addMessage: (disputeId: string, data: CreateDisputeMessagePayload) =>
      apiClient.post<ApiSuccess<unknown>>(`/customer/disputes/${disputeId}/messages`, data),

    listMessages: (disputeId: string) =>
      apiClient.get<ApiSuccess<unknown[]>>(`/customer/disputes/${disputeId}/messages`),

    submitEvidence: (disputeId: string, data: CreateDisputeEvidencePayload) =>
      apiClient.post<ApiSuccess<unknown>>(`/customer/disputes/${disputeId}/evidence`, data),

    listEvidence: (disputeId: string) =>
      apiClient.get<ApiSuccess<unknown[]>>(`/customer/disputes/${disputeId}/evidence`),

    reopen: (disputeId: string) =>
      apiClient.post<ApiSuccess<unknown>>(`/customer/disputes/${disputeId}/reopen`),
  },

  // ---------------------------------------------------------------------------
  // REVIEWS
  // ---------------------------------------------------------------------------

  reviews: {
    create: (data: CreateReviewPayload, idempotencyKey?: string) =>
      apiClient.post<ApiSuccess<unknown>>('/customer/reviews', data, { idempotencyKey }),

    list: (params?: QueryParams) =>
      apiClient.get<ApiPaginated<unknown>>('/customer/reviews', { params }),

    get: (reviewId: string) =>
      apiClient.get<ApiSuccess<unknown>>(`/customer/reviews/${reviewId}`),

    update: (reviewId: string, data: UpdateReviewPayload) =>
      apiClient.patch<ApiSuccess<unknown>>(`/customer/reviews/${reviewId}`, data),

    withdraw: (reviewId: string) =>
      apiClient.post<ApiSuccess<unknown>>(`/customer/reviews/${reviewId}/withdraw`),

    report: (reviewId: string, data: CreateReviewReportPayload) =>
      apiClient.post<ApiSuccess<unknown>>(`/customer/reviews/${reviewId}/report`, data),

    getBookingReview: (bookingId: string) =>
      apiClient.get<ApiSuccess<unknown>>(`/customer/bookings/${bookingId}/review`),
  },

  // ---------------------------------------------------------------------------
  // OFFERS
  // ---------------------------------------------------------------------------

  offers: {
    list: () =>
      apiClient.get<ApiSuccess<unknown[]>>('/customer/offers'),

    get: (offerId: string) =>
      apiClient.get<ApiSuccess<unknown>>(`/customer/offers/${offerId}`),

    validate: (offerId: string, data: ValidateOfferPayload) =>
      apiClient.post<ApiSuccess<unknown>>(`/customer/offers/${offerId}/validate`, data),

    redeem: (offerId: string, data: RedeemOfferPayload, idempotencyKey?: string) =>
      apiClient.post<ApiSuccess<unknown>>(`/customer/offers/${offerId}/redeem`, data, { idempotencyKey }),
  },

  // ---------------------------------------------------------------------------
  // COUPONS
  // ---------------------------------------------------------------------------

  coupons: {
    validate: (data: ValidateCouponPayload) =>
      apiClient.post<ApiSuccess<unknown>>('/customer/coupons/validate', data),

    redeem: (data: RedeemCouponPayload, idempotencyKey?: string) =>
      apiClient.post<ApiSuccess<unknown>>('/customer/coupons/redeem', data, { idempotencyKey }),

    removeFromBooking: (bookingId: string) =>
      apiClient.post<ApiSuccess<unknown>>(`/customer/bookings/${bookingId}/coupon/remove`),
  },

  // ---------------------------------------------------------------------------
  // PAYMENTS
  // ---------------------------------------------------------------------------

  payments: {
    create: (bookingId: string, data: CreatePaymentPayload, idempotencyKey?: string) =>
      apiClient.post<ApiSuccess<unknown>>(`/customer/bookings/${bookingId}/payments`, data, { idempotencyKey }),

    list: (params?: QueryParams) =>
      apiClient.get<ApiPaginated<unknown>>('/customer/payments', { params }),

    getSummary: () =>
      apiClient.get<ApiSuccess<unknown>>('/customer/payments/summary'),

    get: (paymentId: string) =>
      apiClient.get<ApiSuccess<unknown>>(`/customer/payments/${paymentId}`),

    getBookingPayment: (bookingId: string) =>
      apiClient.get<ApiSuccess<unknown>>(`/customer/bookings/${bookingId}/payments`),

    process: (paymentId: string, data: ProcessPaymentPayload) =>
      apiClient.post<ApiSuccess<unknown>>(`/customer/payments/${paymentId}/process`, data),

    cancel: (paymentId: string) =>
      apiClient.post<ApiSuccess<unknown>>(`/customer/payments/${paymentId}/cancel`),
  },
};
