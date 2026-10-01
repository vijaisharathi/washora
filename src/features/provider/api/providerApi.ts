/**
 * Provider domain API functions consuming the central apiClient.
 * Maps to all provider-facing NestJS controllers:
 *   - AuthController (/api/v1/auth)
 *   - ProviderController (/api/v1/provider)
 *   - ProviderBookingController (/api/v1/provider/bookings)
 *   - ProviderAssignmentController (/api/v1/provider/assignments)
 *   - ProviderEarningController (/api/v1/provider)
 *   - ProviderReviewController (/api/v1/provider/reviews)
 *   - ProviderNotificationController (/api/v1/provider/notifications)
 *   - ProviderSupportController (/api/v1/provider)
 *   - CatalogController (/api/v1/catalog)
 */

import { apiClient } from '@/lib/api/client';
import type { ApiSuccess, ApiPaginated, QueryParams } from '@/lib/api/types';

// =============================================================================
// AUTH TYPES
// =============================================================================

export interface AuthLoginPayload {
  identifier?: string;
  email?: string;
  password: string;
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

export interface ChangePasswordPayload {
  currentPassword?: string;
  oldPassword?: string;
  newPassword: string;
}

// =============================================================================
// PROVIDER PROFILE TYPES
// =============================================================================

export interface ProviderProfileResponse {
  id: string;
  fullName: string;
  businessName: string | null;
  email: string;
  phone: string;
  description: string | null;
  city: string;
  address: string | null;
  profileImageUrl: string | null;
  coverImageUrl: string | null;
  status: string;
  approvalStatus: string;
  rating: number;
  totalReviews: number;
  joinedAt: string;
  updatedAt: string;
}

export interface UpdateProviderProfilePayload {
  fullName?: string;
  businessName?: string;
  description?: string;
  phone?: string;
  city?: string;
  address?: string;
  profileImageUrl?: string;
  coverImageUrl?: string;
}

// =============================================================================
// PROVIDER SERVICES & CATALOG TYPES
// =============================================================================

export interface ProviderServiceResponse {
  id: string;
  providerId: string;
  catalogServiceId: string;
  serviceName: string;
  categoryName: string;
  customPrice: number | null;
  basePrice: number;
  isActive: boolean;
  customTurnaroundHours: number | null;
  description?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ConfigureProviderServicePayload {
  catalogServiceId: string;
  customPrice?: number;
  isActive?: boolean;
  customTurnaroundHours?: number;
}

export interface UpdateProviderServicePayload {
  customPrice?: number;
  isActive?: boolean;
  customTurnaroundHours?: number;
}

export interface CatalogCategoryResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  isActive: boolean;
  servicesCount?: number;
}

export interface CatalogServiceResponse {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  turnaroundHours: number;
  isActive: boolean;
  variants?: CatalogServiceVariantResponse[];
  images?: CatalogServiceImageResponse[];
}

export interface CatalogServiceVariantResponse {
  id: string;
  serviceId: string;
  name: string;
  priceDelta: number;
  description?: string;
  isActive: boolean;
}

export interface CatalogServiceImageResponse {
  id: string;
  serviceId: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
}

// =============================================================================
// SERVICE AREAS TYPES
// =============================================================================

export interface ProviderServiceAreaResponse {
  id: string;
  providerId: string;
  postalCode: string;
  locality?: string;
  city: string;
  state?: string;
  radiusKm?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceAreaPayload {
  postalCode: string;
  locality?: string;
  city: string;
  state?: string;
  radiusKm?: number;
  isActive?: boolean;
}

export interface UpdateServiceAreaPayload {
  locality?: string;
  radiusKm?: number;
  isActive?: boolean;
}

// =============================================================================
// AVAILABILITY SCHEDULE TYPES
// =============================================================================

export interface ProviderAvailabilityResponse {
  id: string;
  providerId: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  openTime: string;  // "08:00"
  closeTime: string; // "20:00"
  maxCapacityPerHour?: number;
  isClosed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertAvailabilityPayload {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  maxCapacityPerHour?: number;
  isClosed?: boolean;
}

export interface UpdateAvailabilityPayload {
  openTime?: string;
  closeTime?: string;
  maxCapacityPerHour?: number;
  isClosed?: boolean;
}

// =============================================================================
// COMPLIANCE DOCUMENTS TYPES
// =============================================================================

export interface ProviderDocumentResponse {
  id: string;
  providerId: string;
  documentType: string;
  documentNumber?: string;
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  verificationStatus: string;
  rejectionReason?: string;
  uploadedAt: string;
  verifiedAt?: string;
}

export interface SubmitProviderDocumentPayload {
  documentType: string;
  documentNumber?: string;
  fileUrl: string;
  fileName: string;
  fileSize?: number;
}

// =============================================================================
// BOOKINGS & ASSIGNMENTS TYPES
// =============================================================================

export interface ProviderBookingItemResponse {
  id: string;
  bookingNumber: string;
  status: string;
  serviceCategory: string;
  itemCount: number;
  totalAmount: number;
  scheduledPickupAt: string;
  scheduledDeliveryAt: string;
  customerName: string;
  customerPhone?: string;
  deliveryAddressSnippet?: string;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderBookingDetailResponse {
  id: string;
  bookingNumber: string;
  status: string;
  customer: {
    fullName: string;
    phone: string;
  };
  addressSnapshot?: {
    city: string;
    locality?: string;
    postalCode?: string;
  };
  scheduledPickupAt: string;
  scheduledDeliveryAt: string;
  specialInstructions?: string;
  items: Array<{
    id: string;
    serviceName: string;
    variantName?: string;
    quantity: number;
    price: number;
    specialInstructions?: string;
  }>;
  pricing: {
    subtotal: number;
    taxes: number;
    total: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BookingStatusHistoryResponse {
  id: string;
  bookingId: string;
  status: string;
  comment?: string;
  actorType: string;
  createdAt: string;
}

export interface BookingNoteResponse {
  id: string;
  bookingId: string;
  note: string;
  isInternal: boolean;
  createdByName?: string;
  createdAt: string;
}

export interface ProviderAssignmentResponse {
  id: string;
  bookingId: string;
  bookingNumber: string;
  status: string; // OFFERED, ACCEPTED, REJECTED, EXPIRED, CANCELLED
  customerName: string;
  itemCount: number;
  scheduledPickupAt: string;
  offeredAt: string;
  acceptedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  expiresAt?: string;
}

export interface AssignmentHistoryResponse {
  id: string;
  assignmentId: string;
  action: string;
  performedByRole: string;
  reason?: string;
  createdAt: string;
}

// =============================================================================
// EARNINGS & FINANCIALS TYPES
// =============================================================================

export interface ProviderEarningsSummaryResponse {
  totalEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  withdrawnAmount: number;
  completedJobsCount: number;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
}

export interface ProviderEarningItemResponse {
  id: string;
  bookingId?: string;
  bookingNumber?: string;
  grossAmount: number;
  commissionAmount: number;
  netEarning: number;
  status: string; // PENDING, CLEARED, PAID_OUT, CANCELLED
  serviceName?: string;
  earnedAt: string;
  clearedAt?: string;
}

export interface EarningTransactionResponse {
  id: string;
  earningId: string;
  transactionType: string;
  amount: number;
  description: string;
  balanceAfter: number;
  createdAt: string;
}

// =============================================================================
// REVIEWS TYPES
// =============================================================================

export interface ProviderReviewResponse {
  id: string;
  bookingId: string;
  customerName: string;
  rating: number;
  comment: string;
  tags?: string[];
  responseText?: string;
  respondedAt?: string;
  createdAt: string;
  serviceName?: string;
}

export interface ProviderReviewSummaryResponse {
  averageRating: number;
  totalReviews: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

// =============================================================================
// NOTIFICATIONS TYPES
// =============================================================================

export interface ProviderNotificationResponse {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  isArchived: boolean;
  createdAt: string;
}

export interface ProviderNotificationPreferencesResponse {
  email: boolean;
  sms: boolean;
  push: boolean;
  orderUpdates: boolean;
  systemAlerts: boolean;
  marketing: boolean;
}

// =============================================================================
// SUPPORT & DISPUTES TYPES
// =============================================================================

export interface ProviderSupportTicketResponse {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  priority: string;
  status: string; // OPEN, IN_PROGRESS, RESOLVED, CLOSED
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderSupportMessageResponse {
  id: string;
  ticketId: string;
  senderRole: string;
  senderName: string;
  message: string;
  attachments?: string[];
  createdAt: string;
}

export interface CreateProviderSupportTicketPayload {
  subject: string;
  category: string;
  priority?: string;
  message: string;
}

export interface ProviderDisputeResponse {
  id: string;
  disputeNumber: string;
  bookingId: string;
  reason: string;
  description: string;
  status: string; // OPEN, UNDER_REVIEW, EVIDENCE_REQUIRED, RESOLVED, CLOSED
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderDisputeMessageResponse {
  id: string;
  disputeId: string;
  senderRole: string;
  senderName: string;
  message: string;
  createdAt: string;
}

export interface CreateProviderDisputePayload {
  bookingId: string;
  reason: string;
  description: string;
  evidenceUrls?: string[];
}

export interface CreateProviderEvidencePayload {
  fileUrl: string;
  fileName: string;
  fileType: string;
  description?: string;
}

export interface DisputeEvidenceResponse {
  id: string;
  disputeId: string;
  fileUrl: string;
  fileName: string;
  description?: string;
  uploadedByRole: string;
  createdAt: string;
}

// =============================================================================
// PROVIDER API CLIENT OBJECT
// =============================================================================

export const providerApi = {
  // ---------------------------------------------------------------------------
  // 1. AUTH
  // ---------------------------------------------------------------------------
  auth: {
    login: (payload: AuthLoginPayload) =>
      apiClient.post<ApiSuccess<AuthLoginResponse>>('/auth/login', {
        email: payload.email || payload.identifier,
        password: payload.password,
      }),

    logout: () =>
      apiClient.post<ApiSuccess<{ message: string }>>('/auth/logout'),

    logoutAll: () =>
      apiClient.post<ApiSuccess<{ message: string }>>('/auth/logout-all'),

    getMe: () =>
      apiClient.get<ApiSuccess<AuthUserResponse>>('/auth/me'),

    getSessions: () =>
      apiClient.get<ApiSuccess<AuthSessionResponse[]>>('/auth/sessions'),

    revokeSession: (sessionId: string) =>
      apiClient.post<ApiSuccess<{ message: string }>>(`/auth/sessions/${sessionId}/revoke`),

    changePassword: (payload: ChangePasswordPayload) =>
      apiClient.post<ApiSuccess<{ message: string }>>('/auth/change-password', payload),

    verifyEmail: (token: string) =>
      apiClient.post<ApiSuccess<{ message: string }>>('/auth/verify-email', { token }),

    resendVerification: (email: string) =>
      apiClient.post<ApiSuccess<{ message: string }>>('/auth/resend-verification', { email }),

    forgotPassword: (email: string) =>
      apiClient.post<ApiSuccess<{ message: string }>>('/auth/forgot-password', { email }),

    resetPassword: (payload: { token: string; newPassword: string }) =>
      apiClient.post<ApiSuccess<{ message: string }>>('/auth/reset-password', payload),
  },

  // ---------------------------------------------------------------------------
  // 2. PROFILE
  // ---------------------------------------------------------------------------
  profile: {
    getProfile: () =>
      apiClient.get<ApiSuccess<ProviderProfileResponse>>('/provider/profile'),

    updateProfile: (data: UpdateProviderProfilePayload) =>
      apiClient.patch<ApiSuccess<ProviderProfileResponse>>('/provider/profile', data),
  },

  // ---------------------------------------------------------------------------
  // 3. SERVICES & CANONICAL CATALOG READS
  // ---------------------------------------------------------------------------
  services: {
    getServices: (params?: QueryParams) =>
      apiClient.get<ApiSuccess<ProviderServiceResponse[]> | ApiPaginated<ProviderServiceResponse>>(
        '/provider/services',
        { params }
      ),

    getService: (serviceIdentifier: string) =>
      apiClient.get<ApiSuccess<ProviderServiceResponse>>(`/provider/services/${serviceIdentifier}`),

    configureService: (serviceIdentifier: string, dto: ConfigureProviderServicePayload) =>
      apiClient.post<ApiSuccess<ProviderServiceResponse>>(`/provider/services/${serviceIdentifier}`, dto),

    updateService: (serviceIdentifier: string, dto: UpdateProviderServicePayload) =>
      apiClient.patch<ApiSuccess<ProviderServiceResponse>>(`/provider/services/${serviceIdentifier}`, dto),

    deleteService: (serviceIdentifier: string) =>
      apiClient.delete<ApiSuccess<{ success: boolean; message: string }>>(
        `/provider/services/${serviceIdentifier}`
      ),
  },

  catalog: {
    getCategories: (params?: QueryParams) =>
      apiClient.get<ApiPaginated<CatalogCategoryResponse>>('/catalog/categories', { params }),

    getCategoryById: (id: string) =>
      apiClient.get<ApiSuccess<CatalogCategoryResponse>>(`/catalog/categories/${id}`),

    getServices: (params?: QueryParams) =>
      apiClient.get<ApiPaginated<CatalogServiceResponse>>('/catalog/services', { params }),

    getServiceById: (id: string) =>
      apiClient.get<ApiSuccess<CatalogServiceResponse>>(`/catalog/services/${id}`),

    getVariants: (serviceId: string) =>
      apiClient.get<ApiSuccess<CatalogServiceVariantResponse[]>>(`/catalog/services/${serviceId}/variants`),

    getImages: (serviceId: string) =>
      apiClient.get<ApiSuccess<CatalogServiceImageResponse[]>>(`/catalog/services/${serviceId}/images`),
  },

  // ---------------------------------------------------------------------------
  // 4. SERVICE AREAS
  // ---------------------------------------------------------------------------
  serviceAreas: {
    getServiceAreas: (params?: QueryParams) =>
      apiClient.get<ApiSuccess<ProviderServiceAreaResponse[]> | ApiPaginated<ProviderServiceAreaResponse>>(
        '/provider/areas',
        { params }
      ),

    createServiceArea: (dto: CreateServiceAreaPayload) =>
      apiClient.post<ApiSuccess<ProviderServiceAreaResponse>>('/provider/areas', dto),

    getServiceArea: (areaId: string) =>
      apiClient.get<ApiSuccess<ProviderServiceAreaResponse>>(`/provider/areas/${areaId}`),

    updateServiceArea: (areaId: string, dto: UpdateServiceAreaPayload) =>
      apiClient.patch<ApiSuccess<ProviderServiceAreaResponse>>(`/provider/areas/${areaId}`, dto),

    deleteServiceArea: (areaId: string) =>
      apiClient.delete<ApiSuccess<{ success: boolean; message: string }>>(`/provider/areas/${areaId}`),
  },

  // ---------------------------------------------------------------------------
  // 5. AVAILABILITY SCHEDULE
  // ---------------------------------------------------------------------------
  availability: {
    getAvailability: () =>
      apiClient.get<ApiSuccess<ProviderAvailabilityResponse[]>>('/provider/availability'),

    upsertAvailability: (dto: UpsertAvailabilityPayload) =>
      apiClient.put<ApiSuccess<ProviderAvailabilityResponse>>('/provider/availability', dto),

    updateAvailability: (availabilityId: string, dto: UpdateAvailabilityPayload) =>
      apiClient.patch<ApiSuccess<ProviderAvailabilityResponse>>(
        `/provider/availability/${availabilityId}`,
        dto
      ),

    deleteAvailability: (availabilityId: string) =>
      apiClient.delete<ApiSuccess<{ success: boolean; message: string }>>(
        `/provider/availability/${availabilityId}`
      ),
  },

  // ---------------------------------------------------------------------------
  // 6. COMPLIANCE & VERIFICATION DOCUMENTS
  // ---------------------------------------------------------------------------
  documents: {
    getDocuments: (params?: QueryParams) =>
      apiClient.get<ApiSuccess<ProviderDocumentResponse[]> | ApiPaginated<ProviderDocumentResponse>>(
        '/provider/documents',
        { params }
      ),

    submitDocument: (dto: SubmitProviderDocumentPayload) =>
      apiClient.post<ApiSuccess<ProviderDocumentResponse>>('/provider/documents', dto),

    getDocument: (documentId: string) =>
      apiClient.get<ApiSuccess<ProviderDocumentResponse>>(`/provider/documents/${documentId}`),

    deleteDocument: (documentId: string) =>
      apiClient.delete<ApiSuccess<{ success: boolean; message: string }>>(
        `/provider/documents/${documentId}`
      ),
  },

  // ---------------------------------------------------------------------------
  // 7. BOOKINGS
  // ---------------------------------------------------------------------------
  bookings: {
    getBookings: (params?: QueryParams) =>
      apiClient.get<ApiPaginated<ProviderBookingItemResponse>>('/provider/bookings', { params }),

    getBookingById: (bookingId: string) =>
      apiClient.get<ApiSuccess<ProviderBookingDetailResponse>>(`/provider/bookings/${bookingId}`),

    getStatusHistory: (bookingId: string) =>
      apiClient.get<ApiSuccess<BookingStatusHistoryResponse[]>>(
        `/provider/bookings/${bookingId}/status-history`
      ),

    getNotes: (bookingId: string) =>
      apiClient.get<ApiSuccess<BookingNoteResponse[]>>(`/provider/bookings/${bookingId}/notes`),
  },

  // ---------------------------------------------------------------------------
  // 8. ASSIGNMENTS
  // ---------------------------------------------------------------------------
  assignments: {
    getAssignments: (params?: QueryParams) =>
      apiClient.get<ApiSuccess<ProviderAssignmentResponse[]> | ApiPaginated<ProviderAssignmentResponse>>(
        '/provider/assignments',
        { params }
      ),

    getAssignment: (assignmentId: string) =>
      apiClient.get<ApiSuccess<ProviderAssignmentResponse>>(`/provider/assignments/${assignmentId}`),

    acceptAssignment: (assignmentId: string) =>
      apiClient.post<ApiSuccess<ProviderAssignmentResponse>>(
        `/provider/assignments/${assignmentId}/accept`
      ),

    rejectAssignment: (assignmentId: string, reason: string) =>
      apiClient.post<ApiSuccess<ProviderAssignmentResponse>>(
        `/provider/assignments/${assignmentId}/reject`,
        { reason }
      ),

    getHistory: (assignmentId: string) =>
      apiClient.get<ApiSuccess<AssignmentHistoryResponse[]>>(
        `/provider/assignments/${assignmentId}/history`
      ),
  },

  // ---------------------------------------------------------------------------
  // 9. EARNINGS
  // ---------------------------------------------------------------------------
  earnings: {
    getEarnings: (params?: QueryParams) =>
      apiClient.get<ApiPaginated<ProviderEarningItemResponse>>('/provider/earnings', { params }),

    getSummary: () =>
      apiClient.get<ApiSuccess<ProviderEarningsSummaryResponse>>('/provider/earnings/summary'),

    getEarningById: (earningId: string) =>
      apiClient.get<ApiSuccess<ProviderEarningItemResponse>>(`/provider/earnings/${earningId}`),

    getTransactions: (earningId: string) =>
      apiClient.get<ApiSuccess<EarningTransactionResponse[]>>(
        `/provider/earnings/${earningId}/transactions`
      ),
  },

  // ---------------------------------------------------------------------------
  // 10. REVIEWS
  // ---------------------------------------------------------------------------
  reviews: {
    getMyReviews: (params?: QueryParams) =>
      apiClient.get<ApiPaginated<ProviderReviewResponse>>('/provider/reviews', { params }),

    getMySummary: () =>
      apiClient.get<ApiSuccess<ProviderReviewSummaryResponse>>('/provider/reviews/summary'),

    getMyReview: (reviewId: string) =>
      apiClient.get<ApiSuccess<ProviderReviewResponse>>(`/provider/reviews/${reviewId}`),

    createResponse: (reviewId: string, responseText: string) =>
      apiClient.post<ApiSuccess<{ id: string; responseText: string; respondedAt: string }>>(
        `/provider/reviews/${reviewId}/response`,
        { responseText }
      ),

    updateResponse: (reviewId: string, responseText: string) =>
      apiClient.patch<ApiSuccess<{ id: string; responseText: string; respondedAt: string }>>(
        `/provider/reviews/${reviewId}/response`,
        { responseText }
      ),
  },

  // ---------------------------------------------------------------------------
  // 11. NOTIFICATIONS
  // ---------------------------------------------------------------------------
  notifications: {
    list: (params?: QueryParams) =>
      apiClient.get<ApiPaginated<ProviderNotificationResponse>>('/provider/notifications', { params }),

    unreadCount: () =>
      apiClient.get<ApiSuccess<{ unreadCount: number }>>('/provider/notifications/unread-count'),

    markRead: (id: string) =>
      apiClient.patch<ApiSuccess<ProviderNotificationResponse>>(`/provider/notifications/${id}/read`),

    markAllRead: () =>
      apiClient.post<ApiSuccess<{ count: number }>>('/provider/notifications/read-all'),

    archive: (id: string) =>
      apiClient.patch<ApiSuccess<ProviderNotificationResponse>>(`/provider/notifications/${id}/archive`),

    getPreferences: () =>
      apiClient.get<ApiSuccess<ProviderNotificationPreferencesResponse>>(
        '/provider/notifications/preferences'
      ),

    updatePreferences: (dto: Partial<ProviderNotificationPreferencesResponse>) =>
      apiClient.patch<ApiSuccess<ProviderNotificationPreferencesResponse>>(
        '/provider/notifications/preferences',
        dto
      ),
  },

  // ---------------------------------------------------------------------------
  // 12. SUPPORT & DISPUTES
  // ---------------------------------------------------------------------------
  support: {
    createTicket: (dto: CreateProviderSupportTicketPayload) =>
      apiClient.post<ApiSuccess<ProviderSupportTicketResponse>>('/provider/support/tickets', dto),

    listTickets: (params?: QueryParams) =>
      apiClient.get<ApiPaginated<ProviderSupportTicketResponse>>('/provider/support/tickets', { params }),

    getTicket: (ticketId: string) =>
      apiClient.get<ApiSuccess<ProviderSupportTicketResponse>>(`/provider/support/tickets/${ticketId}`),

    addTicketMessage: (ticketId: string, message: string) =>
      apiClient.post<ApiSuccess<ProviderSupportMessageResponse>>(
        `/provider/support/tickets/${ticketId}/messages`,
        { message }
      ),

    listTicketMessages: (ticketId: string) =>
      apiClient.get<ApiSuccess<ProviderSupportMessageResponse[]>>(
        `/provider/support/tickets/${ticketId}/messages`
      ),

    reopenTicket: (ticketId: string) =>
      apiClient.post<ApiSuccess<ProviderSupportTicketResponse>>(
        `/provider/support/tickets/${ticketId}/reopen`
      ),
  },

  disputes: {
    createDispute: (dto: CreateProviderDisputePayload) =>
      apiClient.post<ApiSuccess<ProviderDisputeResponse>>('/provider/disputes', dto),

    listDisputes: (params?: QueryParams) =>
      apiClient.get<ApiPaginated<ProviderDisputeResponse>>('/provider/disputes', { params }),

    getDispute: (disputeId: string) =>
      apiClient.get<ApiSuccess<ProviderDisputeResponse>>(`/provider/disputes/${disputeId}`),

    addDisputeMessage: (disputeId: string, message: string) =>
      apiClient.post<ApiSuccess<ProviderDisputeMessageResponse>>(
        `/provider/disputes/${disputeId}/messages`,
        { message }
      ),

    listDisputeMessages: (disputeId: string) =>
      apiClient.get<ApiSuccess<ProviderDisputeMessageResponse[]>>(
        `/provider/disputes/${disputeId}/messages`
      ),

    submitEvidence: (disputeId: string, dto: CreateProviderEvidencePayload) =>
      apiClient.post<ApiSuccess<DisputeEvidenceResponse>>(
        `/provider/disputes/${disputeId}/evidence`,
        dto
      ),

    listEvidence: (disputeId: string) =>
      apiClient.get<ApiSuccess<DisputeEvidenceResponse[]>>(
        `/provider/disputes/${disputeId}/evidence`
      ),

    reopenDispute: (disputeId: string) =>
      apiClient.post<ApiSuccess<ProviderDisputeResponse>>(`/provider/disputes/${disputeId}/reopen`),
  },
};
