/**
 * WASHORA Operations & Assignment Domain Types & Error Codes (Phase B9)
 */

export enum AssignmentErrorCode {
  ASSIGNMENT_NOT_FOUND = 'ASSIGNMENT_NOT_FOUND',
  ASSIGNMENT_ACCESS_DENIED = 'ASSIGNMENT_ACCESS_DENIED',
  ASSIGNMENT_INVALID = 'ASSIGNMENT_INVALID',
  ASSIGNMENT_STATUS_INVALID = 'ASSIGNMENT_STATUS_INVALID',
  ASSIGNMENT_ALREADY_EXISTS = 'ASSIGNMENT_ALREADY_EXISTS',
  ASSIGNMENT_CONFLICT = 'ASSIGNMENT_CONFLICT',
  ASSIGNMENT_NOT_ACCEPTABLE = 'ASSIGNMENT_NOT_ACCEPTABLE',
  ASSIGNMENT_NOT_REJECTABLE = 'ASSIGNMENT_NOT_REJECTABLE',
  ASSIGNMENT_NOT_CANCELLABLE = 'ASSIGNMENT_NOT_CANCELLABLE',
  REASSIGNMENT_NOT_ALLOWED = 'REASSIGNMENT_NOT_ALLOWED',

  BOOKING_NOT_FOUND = 'BOOKING_NOT_FOUND',
  BOOKING_NOT_ASSIGNABLE = 'BOOKING_NOT_ASSIGNABLE',

  PROVIDER_NOT_FOUND = 'PROVIDER_NOT_FOUND',
  PROVIDER_INACTIVE = 'PROVIDER_INACTIVE',
  PROVIDER_NOT_ELIGIBLE = 'PROVIDER_NOT_ELIGIBLE',
  PROVIDER_SERVICE_NOT_SUPPORTED = 'PROVIDER_SERVICE_NOT_SUPPORTED',
  PROVIDER_OUTSIDE_SERVICE_AREA = 'PROVIDER_OUTSIDE_SERVICE_AREA',
  PROVIDER_UNAVAILABLE = 'PROVIDER_UNAVAILABLE',
  PROVIDER_CAPACITY_EXCEEDED = 'PROVIDER_CAPACITY_EXCEEDED',
  PROVIDER_SCHEDULE_CONFLICT = 'PROVIDER_SCHEDULE_CONFLICT',

  DELIVERY_PARTNER_NOT_FOUND = 'DELIVERY_PARTNER_NOT_FOUND',
  DELIVERY_PARTNER_INACTIVE = 'DELIVERY_PARTNER_INACTIVE',
  DELIVERY_PARTNER_NOT_ELIGIBLE = 'DELIVERY_PARTNER_NOT_ELIGIBLE',
  DELIVERY_PARTNER_OUTSIDE_SERVICE_AREA = 'DELIVERY_PARTNER_OUTSIDE_SERVICE_AREA',
  DELIVERY_PARTNER_UNAVAILABLE = 'DELIVERY_PARTNER_UNAVAILABLE',
  DELIVERY_PARTNER_SCHEDULE_CONFLICT = 'DELIVERY_PARTNER_SCHEDULE_CONFLICT',

  IDEMPOTENCY_CONFLICT = 'IDEMPOTENCY_CONFLICT',
  FORBIDDEN = 'FORBIDDEN',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export enum AssignmentAuditEventType {
  ASSIGNMENT_CREATED = 'ASSIGNMENT_CREATED',
  ASSIGNMENT_OFFERED = 'ASSIGNMENT_OFFERED',
  ASSIGNMENT_ACCEPTED = 'ASSIGNMENT_ACCEPTED',
  ASSIGNMENT_REJECTED = 'ASSIGNMENT_REJECTED',
  ASSIGNMENT_CANCELLED = 'ASSIGNMENT_CANCELLED',
  ASSIGNMENT_REASSIGNED = 'ASSIGNMENT_REASSIGNED',
  ASSIGNMENT_STATUS_CHANGED = 'ASSIGNMENT_STATUS_CHANGED',
}

export interface ParsedTimeWindow {
  startMinutes: number; // e.g. 10:00 -> 600
  endMinutes: number;   // e.g. 12:00 -> 720
}

export interface EligibilityResult {
  isEligible: boolean;
  errorCode?: AssignmentErrorCode;
  reason?: string;
  details?: Record<string, any>;
}

export interface CandidateProviderEvaluation {
  id: string;
  name: string;
  rating: number;
  city: string;
  status: string;
  approvalStatus: string;
  serviceCategories: string[];
  areasServed: string[];
  activeBookingsCount: number;
  workload: 'Low' | 'Medium' | 'High';
  categoryMatch: boolean;
  cityMatch: boolean;
  areaMatch: boolean;
  isEligible: boolean;
  eligibilityReasons: string[];
}

export interface CandidateDeliveryPartnerEvaluation {
  id: string;
  name: string;
  rating: number;
  city: string;
  status: string;
  approvalStatus: string;
  areasServed: string[];
  activeDeliveriesCount: number;
  workload: 'Low' | 'Medium' | 'High';
  vehicleType: string;
  cityMatch: boolean;
  areaMatch: boolean;
  isEligible: boolean;
  eligibilityReasons: string[];
}
