/**
 * Delivery Partner domain API functions consuming the central apiClient.
 * Maps to all delivery partner-facing NestJS controllers:
 *   - AuthController (/api/v1/auth)
 *   - DeliveryPartnerController (/api/v1/delivery-partner)
 *   - DeliveryPartnerAssignmentController (/api/v1/delivery-partner/assignments)
 *   - DeliveryPartnerEarningController (/api/v1/delivery-partner/earnings)
 *   - DeliveryPartnerNotificationController (/api/v1/delivery-partner/notifications)
 *   - DeliveryPartnerSupportController (/api/v1/delivery-partner/support & /disputes)
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

export interface AuthChangePasswordPayload {
  currentPassword?: string;
  oldPassword?: string;
  newPassword?: string;
}

// =============================================================================
// DELIVERY PARTNER PROFILE TYPES
// =============================================================================

export interface DeliveryPartnerProfileResponse {
  id: string;
  userId: string;
  fullName?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  status: string;
  isKycVerified?: boolean;
  verificationStatus?: string;
  vehicleType?: string;
  vehicleModel?: string;
  vehiclePlate?: string;
  vehicleNumber?: string;
  drivingLicenseNumber?: string;
  licenseNumber?: string;
  dlExpiryDate?: string;
  rating?: number;
  ratingAvg?: string;
  totalDeliveries?: number;
  totalTrips?: number;
  activeDeliveriesCount?: number;
  completedTripsCount?: number;
  cancelledTripsCount?: number;
  onTimeRate?: number;
  acceptanceRate?: number;
  completionRate?: number;
  city?: string;
  hubName?: string;
  preferredShift?: string;
  serviceRadiusKm?: number;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  accountHolderName?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  joinedDate?: string;
  currentLatitude?: number;
  currentLongitude?: number;
  user?: AuthUserResponse;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateDeliveryPartnerProfilePayload {
  fullName?: string;
  phone?: string;
  email?: string;
  avatarUrl?: string;
  vehicleType?: string;
  vehicleModel?: string;
  vehiclePlate?: string;
  vehicleNumber?: string;
  drivingLicenseNumber?: string;
  licenseNumber?: string;
  dlExpiryDate?: string;
  status?: string;
  city?: string;
  hubName?: string;
  preferredShift?: string;
  serviceRadiusKm?: number;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  accountHolderName?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  currentLatitude?: number;
  currentLongitude?: number;
}

// =============================================================================
// SERVICE AREAS TYPES
// =============================================================================

export interface DeliveryPartnerServiceAreaResponse {
  id: string;
  deliveryPartnerId: string;
  postalCode: string;
  city: string;
  areaName?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeliveryServiceAreaPayload {
  postalCode: string;
  city: string;
  areaName?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
}

export interface UpdateDeliveryServiceAreaPayload {
  areaName?: string;
  radiusKm?: number;
  isActive?: boolean;
}

// =============================================================================
// AVAILABILITY TYPES
// =============================================================================

export interface DeliveryPartnerAvailabilityResponse {
  id: string;
  deliveryPartnerId: string;
  dayOfWeek: number; // 0=Sunday, 1=Monday...
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "18:00"
  isAvailable: boolean;
  maxOrdersPerShift?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeliveryAvailabilityPayload {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable?: boolean;
  maxOrdersPerShift?: number;
}

export interface UpdateDeliveryAvailabilityPayload {
  startTime?: string;
  endTime?: string;
  isAvailable?: boolean;
  maxOrdersPerShift?: number;
}

// =============================================================================
// COMPLIANCE DOCUMENTS TYPES
// =============================================================================

export interface DeliveryPartnerDocumentResponse {
  id: string;
  deliveryPartnerId: string;
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

export interface SubmitDeliveryDocumentPayload {
  documentType: string;
  documentNumber?: string;
  fileUrl: string;
  fileName: string;
  fileSize?: number;
}

// =============================================================================
// ASSIGNMENTS & TASKS TYPES
// =============================================================================

export interface DeliveryPartnerAssignmentResponse {
  id: string;
  publicId: string;
  bookingId: string;
  bookingNumber: string;
  type: string;
  status: string; // OFFERED, ASSIGNED, ACCEPTED, REJECTED, EXPIRED, CANCELLED
  scheduledAt: string;
  assignedAt: string;
  acceptedAt?: string;
  area: string;
  city: string;
  itemsCount?: number;
  notes?: string;
  totalPackageCount?: number;
  address?: {
    recipientName: string;
    recipientPhone: string;
    addressLine1: string;
    addressLine2?: string | null;
    area: string;
    city: string;
    postalCode: string;
    latitude?: string | null;
    longitude?: string | null;
  };
  schedule?: {
    pickupDate: string;
    pickupTimeSlot: string;
    specialInstructions?: string | null;
  };
  history?: Array<{
    id: string;
    assignmentId: string;
    action: string;
    actorUserId?: string | null;
    details?: string | null;
    createdAt: string;
  }>;
}

export interface RejectDeliveryAssignmentPayload {
  reason?: string;
}

// =============================================================================
// EARNINGS TYPES
// =============================================================================

export interface DeliveryPartnerEarningsSummaryResponse {
  totalEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  pendingSettlementAmount?: number;
  settledAmount: number;
  completedTripsCount: number;
  todayEarnings?: number;
  thisWeekEarnings?: number;
  thisMonthEarnings?: number;
  currency?: string;
}

export interface DeliveryPartnerEarningItemResponse {
  id: string;
  assignmentId?: string;
  bookingNumber?: string;
  basePay: number;
  distancePay?: number;
  incentiveAmount?: number;
  tipAmount?: number;
  totalAmount: number;
  status: string; // SETTLED, PENDING_SETTLEMENT, PROCESSING
  earnedAt: string;
  settledAt?: string;
}

export interface DeliveryEarningTransactionResponse {
  id: string;
  earningId: string;
  transactionType: string;
  amount: number;
  description?: string;
  createdAt: string;
}

// =============================================================================
// NOTIFICATIONS TYPES
// =============================================================================

export interface DeliveryPartnerNotificationResponse {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  isArchived: boolean;
  createdAt: string;
}

export interface DeliveryPartnerNotificationPreferencesResponse {
  push: boolean;
  email: boolean;
  sms: boolean;
  bookingUpdatesPush?: boolean;
  bookingUpdatesSms?: boolean;
  marketingPush?: boolean;
  taskAlerts?: boolean;
  scheduleUpdates?: boolean;
  earningsUpdates?: boolean;
}

// =============================================================================
// SUPPORT & DISPUTES TYPES
// =============================================================================

export interface DeliverySupportTicketResponse {
  id: string;
  ticketNumber: string;
  category: string;
  priority: string;
  status: string;
  subject: string;
  description: string;
  relatedOrderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeliverySupportTicketPayload {
  category: string;
  priority?: string;
  subject: string;
  description: string;
  relatedOrderId?: string;
}

export interface DeliverySupportMessageResponse {
  id: string;
  ticketId: string;
  senderType: string;
  senderName: string;
  message: string;
  createdAt: string;
}

export interface DeliveryDisputeResponse {
  id: string;
  disputeNumber: string;
  bookingId?: string;
  reason: string;
  claimedAmount?: number;
  status: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeliveryDisputePayload {
  bookingId?: string;
  reason: string;
  claimedAmount?: number;
  description?: string;
}

export interface DeliveryDisputeMessageResponse {
  id: string;
  disputeId: string;
  senderType: string;
  senderName: string;
  message: string;
  createdAt: string;
}

export interface DeliveryDisputeEvidenceResponse {
  id: string;
  disputeId: string;
  fileUrl: string;
  fileName: string;
  fileType?: string;
  notes?: string;
  uploadedAt: string;
}

export interface CreateDeliveryDisputeEvidencePayload {
  fileUrl: string;
  fileName: string;
  notes?: string;
}

// =============================================================================
// CATALOG TYPES (Canonical reads)
// =============================================================================

export interface CatalogCategoryResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface CatalogServiceResponse {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  basePrice: number;
  turnaroundHours: number;
  isActive: boolean;
}

export interface CatalogVariantResponse {
  id: string;
  serviceId: string;
  name: string;
  priceModifier: number;
  turnaroundModifierHours: number;
  isActive: boolean;
}

// =============================================================================
// DELIVERY PARTNER API CLIENT IMPLEMENTATION
// =============================================================================

export const deliveryPartnerApi = {
  // ---------------------------------------------------------------------------
  // 1. AUTH
  // ---------------------------------------------------------------------------
  auth: {
    login: (dto: AuthLoginPayload) =>
      apiClient.post<ApiSuccess<{ user: AuthUserResponse } & AuthTokensResponse>>(
        '/auth/login',
        dto
      ),

    register: (dto: Record<string, unknown>) =>
      apiClient.post<ApiSuccess<{ user: AuthUserResponse } & AuthTokensResponse>>(
        '/auth/register',
        { ...dto, role: 'DELIVERY_PARTNER' }
      ),

    getMe: () => apiClient.get<ApiSuccess<AuthUserResponse>>('/auth/me'),

    getSessions: () =>
      apiClient.get<ApiSuccess<AuthSessionItemResponse[]>>('/auth/sessions'),

    revokeSession: (sessionId: string) =>
      apiClient.post<ApiSuccess<{ message: string }>>(
        `/auth/sessions/${sessionId}/revoke`
      ),

    changePassword: (dto: AuthChangePasswordPayload) =>
      apiClient.post<ApiSuccess<{ message: string }>>(
        '/auth/change-password',
        dto
      ),

    forgotPassword: (emailOrPhone: string) =>
      apiClient.post<ApiSuccess<{ message: string }>>(
        '/auth/forgot-password',
        { identifier: emailOrPhone }
      ),

    resetPassword: (dto: { token: string; newPassword?: string }) =>
      apiClient.post<ApiSuccess<{ message: string }>>(
        '/auth/reset-password',
        dto
      ),

    verifyEmail: (token: string) =>
      apiClient.post<ApiSuccess<{ message: string }>>(
        '/auth/verify-email',
        { token }
      ),

    resendVerification: (email: string) =>
      apiClient.post<ApiSuccess<{ message: string }>>(
        '/auth/resend-verification',
        { email }
      ),

    logout: () => apiClient.post<ApiSuccess<{ message: string }>>('/auth/logout'),

    logoutAll: () =>
      apiClient.post<ApiSuccess<{ message: string }>>('/auth/logout-all'),
  },

  // ---------------------------------------------------------------------------
  // 2. PROFILE
  // ---------------------------------------------------------------------------
  profile: {
    getProfile: () =>
      apiClient.get<ApiSuccess<DeliveryPartnerProfileResponse>>(
        '/delivery-partner/profile'
      ),

    updateProfile: (dto: UpdateDeliveryPartnerProfilePayload) =>
      apiClient.patch<ApiSuccess<DeliveryPartnerProfileResponse>>(
        '/delivery-partner/profile',
        dto
      ),
  },

  // ---------------------------------------------------------------------------
  // 3. SERVICE AREAS
  // ---------------------------------------------------------------------------
  serviceAreas: {
    list: (params?: QueryParams) =>
      apiClient.get<ApiPaginated<DeliveryPartnerServiceAreaResponse> | ApiSuccess<DeliveryPartnerServiceAreaResponse[]>>(
        '/delivery-partner/service-areas',
        { params }
      ),

    create: (dto: CreateDeliveryServiceAreaPayload) =>
      apiClient.post<ApiSuccess<DeliveryPartnerServiceAreaResponse>>(
        '/delivery-partner/service-areas',
        dto
      ),

    getById: (areaId: string) =>
      apiClient.get<ApiSuccess<DeliveryPartnerServiceAreaResponse>>(
        `/delivery-partner/service-areas/${areaId}`
      ),

    update: (areaId: string, dto: UpdateDeliveryServiceAreaPayload) =>
      apiClient.patch<ApiSuccess<DeliveryPartnerServiceAreaResponse>>(
        `/delivery-partner/service-areas/${areaId}`,
        dto
      ),

    delete: (areaId: string) =>
      apiClient.delete<ApiSuccess<{ success: boolean; message: string }>>(
        `/delivery-partner/service-areas/${areaId}`
      ),
  },

  // ---------------------------------------------------------------------------
  // 4. AVAILABILITY
  // ---------------------------------------------------------------------------
  availability: {
    getAvailability: () =>
      apiClient.get<ApiSuccess<DeliveryPartnerAvailabilityResponse[]>>(
        '/delivery-partner/availability'
      ),

    createAvailability: (dto: CreateDeliveryAvailabilityPayload) =>
      apiClient.post<ApiSuccess<DeliveryPartnerAvailabilityResponse>>(
        '/delivery-partner/availability',
        dto
      ),

    updateAvailability: (availabilityId: string, dto: UpdateDeliveryAvailabilityPayload) =>
      apiClient.patch<ApiSuccess<DeliveryPartnerAvailabilityResponse>>(
        `/delivery-partner/availability/${availabilityId}`,
        dto
      ),

    deleteAvailability: (availabilityId: string) =>
      apiClient.delete<ApiSuccess<{ success: boolean; message: string }>>(
        `/delivery-partner/availability/${availabilityId}`
      ),
  },

  // ---------------------------------------------------------------------------
  // 5. DOCUMENTS
  // ---------------------------------------------------------------------------
  documents: {
    list: (params?: QueryParams) =>
      apiClient.get<ApiPaginated<DeliveryPartnerDocumentResponse> | ApiSuccess<DeliveryPartnerDocumentResponse[]>>(
        '/delivery-partner/documents',
        { params }
      ),

    submit: (dto: SubmitDeliveryDocumentPayload) =>
      apiClient.post<ApiSuccess<DeliveryPartnerDocumentResponse>>(
        '/delivery-partner/documents',
        dto
      ),

    getById: (documentId: string) =>
      apiClient.get<ApiSuccess<DeliveryPartnerDocumentResponse>>(
        `/delivery-partner/documents/${documentId}`
      ),

    delete: (documentId: string) =>
      apiClient.delete<ApiSuccess<{ success: boolean; message: string }>>(
        `/delivery-partner/documents/${documentId}`
      ),
  },

  // ---------------------------------------------------------------------------
  // 6. ASSIGNMENTS / TASKS
  // ---------------------------------------------------------------------------
  assignments: {
    list: (params?: QueryParams) =>
      apiClient.get<ApiPaginated<DeliveryPartnerAssignmentResponse> | ApiSuccess<DeliveryPartnerAssignmentResponse[]>>(
        '/delivery-partner/assignments',
        { params }
      ),

    getById: (assignmentId: string) =>
      apiClient.get<ApiSuccess<DeliveryPartnerAssignmentResponse>>(
        `/delivery-partner/assignments/${assignmentId}`
      ),

    accept: (assignmentId: string) =>
      apiClient.post<ApiSuccess<DeliveryPartnerAssignmentResponse>>(
        `/delivery-partner/assignments/${assignmentId}/accept`
      ),

    reject: (assignmentId: string, reason: string) =>
      apiClient.post<ApiSuccess<DeliveryPartnerAssignmentResponse>>(
        `/delivery-partner/assignments/${assignmentId}/reject`,
        { reason }
      ),

    getHistory: (assignmentId: string) =>
      apiClient.get<ApiSuccess<Array<{
        id: string;
        assignmentId: string;
        action: string;
        actorUserId?: string | null;
        details?: string | null;
        createdAt: string;
      }>>>(`/delivery-partner/assignments/${assignmentId}/history`),
  },

  // ---------------------------------------------------------------------------
  // 7. EARNINGS
  // ---------------------------------------------------------------------------
  earnings: {
    getEarnings: (params?: QueryParams) =>
      apiClient.get<ApiPaginated<DeliveryPartnerEarningItemResponse>>(
        '/delivery-partner/earnings',
        { params }
      ),

    getSummary: () =>
      apiClient.get<ApiSuccess<DeliveryPartnerEarningsSummaryResponse>>(
        '/delivery-partner/earnings/summary'
      ),

    getEarningById: (earningId: string) =>
      apiClient.get<ApiSuccess<DeliveryPartnerEarningItemResponse>>(
        `/delivery-partner/earnings/${earningId}`
      ),

    getTransactions: (earningId: string) =>
      apiClient.get<ApiSuccess<DeliveryEarningTransactionResponse[]>>(
        `/delivery-partner/earnings/${earningId}/transactions`
      ),
  },

  // ---------------------------------------------------------------------------
  // 8. NOTIFICATIONS
  // ---------------------------------------------------------------------------
  notifications: {
    list: (params?: QueryParams) =>
      apiClient.get<ApiPaginated<DeliveryPartnerNotificationResponse>>(
        '/delivery-partner/notifications',
        { params }
      ),

    unreadCount: () =>
      apiClient.get<ApiSuccess<{ unreadCount: number }>>(
        '/delivery-partner/notifications/unread-count'
      ),

    markRead: (id: string) =>
      apiClient.patch<ApiSuccess<DeliveryPartnerNotificationResponse>>(
        `/delivery-partner/notifications/${id}/read`
      ),

    markAllRead: () =>
      apiClient.post<ApiSuccess<{ count: number }>>(
        '/delivery-partner/notifications/read-all'
      ),

    archive: (id: string) =>
      apiClient.patch<ApiSuccess<DeliveryPartnerNotificationResponse>>(
        `/delivery-partner/notifications/${id}/archive`
      ),

    getPreferences: () =>
      apiClient.get<ApiSuccess<DeliveryPartnerNotificationPreferencesResponse>>(
        '/delivery-partner/notifications/preferences'
      ),

    updatePreferences: (dto: Partial<DeliveryPartnerNotificationPreferencesResponse>) =>
      apiClient.patch<ApiSuccess<DeliveryPartnerNotificationPreferencesResponse>>(
        '/delivery-partner/notifications/preferences',
        dto
      ),
  },

  // ---------------------------------------------------------------------------
  // 9. SUPPORT & DISPUTES
  // ---------------------------------------------------------------------------
  support: {
    createTicket: (dto: CreateDeliverySupportTicketPayload) =>
      apiClient.post<ApiSuccess<DeliverySupportTicketResponse>>(
        '/delivery-partner/support/tickets',
        dto
      ),

    listTickets: (params?: QueryParams) =>
      apiClient.get<ApiPaginated<DeliverySupportTicketResponse>>(
        '/delivery-partner/support/tickets',
        { params }
      ),

    getTicket: (ticketId: string) =>
      apiClient.get<ApiSuccess<DeliverySupportTicketResponse>>(
        `/delivery-partner/support/tickets/${ticketId}`
      ),

    addTicketMessage: (ticketId: string, payload: string | { message?: string; content?: string }) => {
      const message = typeof payload === 'string' ? payload : (payload.message || payload.content || '');
      return apiClient.post<ApiSuccess<DeliverySupportMessageResponse>>(
        `/delivery-partner/support/tickets/${ticketId}/messages`,
        { message }
      );
    },

    listTicketMessages: (ticketId: string) =>
      apiClient.get<ApiSuccess<DeliverySupportMessageResponse[]>>(
        `/delivery-partner/support/tickets/${ticketId}/messages`
      ),

    reopenTicket: (ticketId: string) =>
      apiClient.post<ApiSuccess<DeliverySupportTicketResponse>>(
        `/delivery-partner/support/tickets/${ticketId}/reopen`
      ),
  },

  disputes: {
    createDispute: (dto: CreateDeliveryDisputePayload) =>
      apiClient.post<ApiSuccess<DeliveryDisputeResponse>>(
        '/delivery-partner/disputes',
        dto
      ),

    listDisputes: (params?: QueryParams) =>
      apiClient.get<ApiPaginated<DeliveryDisputeResponse>>(
        '/delivery-partner/disputes',
        { params }
      ),

    getDispute: (disputeId: string) =>
      apiClient.get<ApiSuccess<DeliveryDisputeResponse>>(
        `/delivery-partner/disputes/${disputeId}`
      ),

    addDisputeMessage: (disputeId: string, message: string) =>
      apiClient.post<ApiSuccess<DeliveryDisputeMessageResponse>>(
        `/delivery-partner/disputes/${disputeId}/messages`,
        { message }
      ),

    listDisputeMessages: (disputeId: string) =>
      apiClient.get<ApiSuccess<DeliveryDisputeMessageResponse[]>>(
        `/delivery-partner/disputes/${disputeId}/messages`
      ),

    submitEvidence: (disputeId: string, dto: CreateDeliveryDisputeEvidencePayload) =>
      apiClient.post<ApiSuccess<DeliveryDisputeEvidenceResponse>>(
        `/delivery-partner/disputes/${disputeId}/evidence`,
        dto
      ),

    listEvidence: (disputeId: string) =>
      apiClient.get<ApiSuccess<DeliveryDisputeEvidenceResponse[]>>(
        `/delivery-partner/disputes/${disputeId}/evidence`
      ),

    reopenDispute: (disputeId: string) =>
      apiClient.post<ApiSuccess<DeliveryDisputeResponse>>(
        `/delivery-partner/disputes/${disputeId}/reopen`
      ),
  },

  // ---------------------------------------------------------------------------
  // 10. CATALOG READS
  // ---------------------------------------------------------------------------
  catalog: {
    getCategories: () =>
      apiClient.get<ApiSuccess<CatalogCategoryResponse[]>>('/catalog/categories'),

    getCategory: (categoryId: string) =>
      apiClient.get<ApiSuccess<CatalogCategoryResponse>>(`/catalog/categories/${categoryId}`),

    getServices: (params?: QueryParams) =>
      apiClient.get<ApiPaginated<CatalogServiceResponse> | ApiSuccess<CatalogServiceResponse[]>>(
        '/catalog/services',
        { params }
      ),

    getService: (serviceId: string) =>
      apiClient.get<ApiSuccess<CatalogServiceResponse>>(`/catalog/services/${serviceId}`),

    getVariants: (serviceId: string) =>
      apiClient.get<ApiSuccess<CatalogVariantResponse[]>>(
        `/catalog/services/${serviceId}/variants`
      ),
  },
};
