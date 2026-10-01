import {
  DisputeOutcome,
  DisputeParticipantType,
  DisputeStatus,
  DisputeType,
  SupportCategory,
  SupportPriority,
  SupportRequesterType,
  SupportStatus,
} from '@prisma/client';

export {
  SupportCategory,
  SupportPriority,
  SupportStatus,
  SupportRequesterType,
  DisputeType,
  DisputeStatus,
  DisputeOutcome,
  DisputeParticipantType,
};

// ============================================================================
// STATE MACHINES & TRANSITION VALIDATION
// ============================================================================

export const SUPPORT_STATUS_TRANSITIONS: Record<SupportStatus, SupportStatus[]> = {
  [SupportStatus.OPEN]: [
    SupportStatus.IN_PROGRESS,
    SupportStatus.ESCALATED,
    SupportStatus.RESOLVED,
  ],
  [SupportStatus.IN_PROGRESS]: [
    SupportStatus.WAITING_FOR_CUSTOMER,
    SupportStatus.WAITING_FOR_PROVIDER,
    SupportStatus.WAITING_FOR_DELIVERY_PARTNER,
    SupportStatus.WAITING_ON_CUSTOMER,
    SupportStatus.WAITING_ON_PROVIDER,
    SupportStatus.ESCALATED,
    SupportStatus.RESOLVED,
  ],
  [SupportStatus.WAITING_FOR_CUSTOMER]: [SupportStatus.IN_PROGRESS],
  [SupportStatus.WAITING_FOR_PROVIDER]: [SupportStatus.IN_PROGRESS],
  [SupportStatus.WAITING_FOR_DELIVERY_PARTNER]: [SupportStatus.IN_PROGRESS],
  [SupportStatus.WAITING_ON_CUSTOMER]: [SupportStatus.IN_PROGRESS],
  [SupportStatus.WAITING_ON_PROVIDER]: [SupportStatus.IN_PROGRESS],
  [SupportStatus.ESCALATED]: [
    SupportStatus.IN_PROGRESS,
    SupportStatus.RESOLVED,
  ],
  [SupportStatus.RESOLVED]: [
    SupportStatus.CLOSED,
    SupportStatus.REOPENED,
  ],
  [SupportStatus.CLOSED]: [
    SupportStatus.REOPENED,
  ],
  [SupportStatus.REOPENED]: [
    SupportStatus.IN_PROGRESS,
  ],
};

export const DISPUTE_STATUS_TRANSITIONS: Record<DisputeStatus, DisputeStatus[]> = {
  [DisputeStatus.OPEN]: [
    DisputeStatus.UNDER_REVIEW,
    DisputeStatus.ESCALATED,
  ],
  [DisputeStatus.UNDER_REVIEW]: [
    DisputeStatus.WAITING_FOR_CUSTOMER,
    DisputeStatus.WAITING_FOR_PROVIDER,
    DisputeStatus.WAITING_FOR_DELIVERY_PARTNER,
    DisputeStatus.EVIDENCE_REQUESTED,
    DisputeStatus.DECISION_PENDING,
    DisputeStatus.ESCALATED,
    DisputeStatus.RESOLVED,
    DisputeStatus.REJECTED,
  ],
  [DisputeStatus.WAITING_FOR_CUSTOMER]: [DisputeStatus.UNDER_REVIEW],
  [DisputeStatus.WAITING_FOR_PROVIDER]: [DisputeStatus.UNDER_REVIEW],
  [DisputeStatus.WAITING_FOR_DELIVERY_PARTNER]: [DisputeStatus.UNDER_REVIEW],
  [DisputeStatus.EVIDENCE_REQUESTED]: [DisputeStatus.UNDER_REVIEW],
  [DisputeStatus.DECISION_PENDING]: [
    DisputeStatus.UNDER_REVIEW,
    DisputeStatus.RESOLVED,
    DisputeStatus.REJECTED,
  ],
  [DisputeStatus.ESCALATED]: [
    DisputeStatus.UNDER_REVIEW,
    DisputeStatus.RESOLVED,
    DisputeStatus.REJECTED,
  ],
  [DisputeStatus.RESOLVED]: [
    DisputeStatus.CLOSED,
    DisputeStatus.REOPENED,
  ],
  [DisputeStatus.REJECTED]: [
    DisputeStatus.CLOSED,
    DisputeStatus.REOPENED,
  ],
  [DisputeStatus.CLOSED]: [
    DisputeStatus.REOPENED,
  ],
  [DisputeStatus.REOPENED]: [
    DisputeStatus.UNDER_REVIEW,
  ],
};

export function isValidSupportTransition(
  current: SupportStatus,
  target: SupportStatus,
): boolean {
  if (current === target) return true;
  const allowed = SUPPORT_STATUS_TRANSITIONS[current] || [];
  return allowed.includes(target);
}

export function isValidDisputeTransition(
  current: DisputeStatus,
  target: DisputeStatus,
): boolean {
  if (current === target) return true;
  const allowed = DISPUTE_STATUS_TRANSITIONS[current] || [];
  return allowed.includes(target);
}

// ============================================================================
// CONSTANTS & ENUMS
// ============================================================================

export const EVIDENCE_TYPES = [
  'PHOTO',
  'VIDEO',
  'DOCUMENT',
  'RECEIPT',
  'SCREENSHOT',
  'OTHER',
] as const;
export type EvidenceType = (typeof EVIDENCE_TYPES)[number];

export const ALLOWED_EVIDENCE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'video/mp4',
] as const;

export const MAX_EVIDENCE_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export enum EvidenceStatus {
  SUBMITTED = 'SUBMITTED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export const RESOLUTION_TYPES = [
  'NO_ACTION',
  'FULL_REFUND',
  'PARTIAL_REFUND',
  'SERVICE_REDO',
  'CREDIT',
  'PROVIDER_WARNING',
  'CUSTOMER_WARNING',
  'DELIVERY_CORRECTION',
  'OTHER',
] as const;
export type DisputeResolutionType = (typeof RESOLUTION_TYPES)[number];

export const SUPPORT_TICKET_ACTIVITIES = [
  'TICKET_CREATED',
  'MESSAGE_ADDED',
  'NOTE_ADDED',
  'ASSIGNED',
  'UNASSIGNED',
  'PRIORITY_CHANGED',
  'STATUS_CHANGED',
  'ESCALATED',
  'RESOLVED',
  'CLOSED',
  'REOPENED',
] as const;

export const DISPUTE_ACTIVITIES = [
  'DISPUTE_CREATED',
  'STATUS_CHANGED',
  'ASSIGNED',
  'UNASSIGNED',
  'MESSAGE_ADDED',
  'EVIDENCE_SUBMITTED',
  'EVIDENCE_ACCEPTED',
  'EVIDENCE_REJECTED',
  'INVESTIGATION_STARTED',
  'RESPONSE_REQUESTED',
  'ESCALATED',
  'RESOLVED',
  'REJECTED',
  'REOPENED',
] as const;

// ============================================================================
// ERROR CODES
// ============================================================================

export enum SupportErrorCode {
  SUPPORT_TICKET_NOT_FOUND = 'SUPPORT_TICKET_NOT_FOUND',
  SUPPORT_TICKET_ACCESS_DENIED = 'SUPPORT_TICKET_ACCESS_DENIED',
  SUPPORT_TICKET_INVALID_STATE = 'SUPPORT_TICKET_INVALID_STATE',
  SUPPORT_TICKET_NOT_REOPENABLE = 'SUPPORT_TICKET_NOT_REOPENABLE',
  SUPPORT_ASSIGNMENT_INVALID = 'SUPPORT_ASSIGNMENT_INVALID',
  SUPPORT_ASSIGNEE_INVALID = 'SUPPORT_ASSIGNEE_INVALID',
  SUPPORT_RESOLUTION_REQUIRED = 'SUPPORT_RESOLUTION_REQUIRED',
  SUPPORT_ESCALATION_REASON_REQUIRED = 'SUPPORT_ESCALATION_REASON_REQUIRED',
  SUPPORT_MESSAGE_NOT_ALLOWED = 'SUPPORT_MESSAGE_NOT_ALLOWED',
  SUPPORT_INTERNAL_MESSAGE_ACCESS_DENIED = 'SUPPORT_INTERNAL_MESSAGE_ACCESS_DENIED',

  DISPUTE_NOT_FOUND = 'DISPUTE_NOT_FOUND',
  DISPUTE_ACCESS_DENIED = 'DISPUTE_ACCESS_DENIED',
  DISPUTE_NOT_ELIGIBLE = 'DISPUTE_NOT_ELIGIBLE',
  DISPUTE_ALREADY_EXISTS = 'DISPUTE_ALREADY_EXISTS',
  DISPUTE_INVALID_STATE = 'DISPUTE_INVALID_STATE',
  DISPUTE_RESOLUTION_REQUIRED = 'DISPUTE_RESOLUTION_REQUIRED',
  DISPUTE_ESCALATION_REASON_REQUIRED = 'DISPUTE_ESCALATION_REASON_REQUIRED',

  DISPUTE_EVIDENCE_NOT_FOUND = 'DISPUTE_EVIDENCE_NOT_FOUND',
  DISPUTE_EVIDENCE_ACCESS_DENIED = 'DISPUTE_EVIDENCE_ACCESS_DENIED',
  DISPUTE_EVIDENCE_INVALID = 'DISPUTE_EVIDENCE_INVALID',
  DISPUTE_EVIDENCE_TOO_LARGE = 'DISPUTE_EVIDENCE_TOO_LARGE',
  DISPUTE_EVIDENCE_TYPE_NOT_ALLOWED = 'DISPUTE_EVIDENCE_TYPE_NOT_ALLOWED',
  DISPUTE_EVIDENCE_REVIEW_REQUIRED = 'DISPUTE_EVIDENCE_REVIEW_REQUIRED',

  FINANCIAL_RESOLUTION_FAILED = 'FINANCIAL_RESOLUTION_FAILED',
  FINANCIAL_RESOLUTION_NOT_ALLOWED = 'FINANCIAL_RESOLUTION_NOT_ALLOWED',

  TENANT_MISMATCH = 'TENANT_MISMATCH',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

// ============================================================================
// AUDIT ACTIONS
// ============================================================================

export enum SupportAuditAction {
  SUPPORT_TICKET_CREATED = 'SUPPORT_TICKET_CREATED',
  SUPPORT_MESSAGE_CREATED = 'SUPPORT_MESSAGE_CREATED',
  SUPPORT_NOTE_CREATED = 'SUPPORT_NOTE_CREATED',
  SUPPORT_ASSIGNED = 'SUPPORT_ASSIGNED',
  SUPPORT_UNASSIGNED = 'SUPPORT_UNASSIGNED',
  SUPPORT_PRIORITY_CHANGED = 'SUPPORT_PRIORITY_CHANGED',
  SUPPORT_ESCALATED = 'SUPPORT_ESCALATED',
  SUPPORT_RESOLVED = 'SUPPORT_RESOLVED',
  SUPPORT_CLOSED = 'SUPPORT_CLOSED',
  SUPPORT_REOPENED = 'SUPPORT_REOPENED',
  SUPPORT_DISPUTE_CREATED = 'SUPPORT_DISPUTE_CREATED',

  DISPUTE_CREATED = 'DISPUTE_CREATED',
  DISPUTE_MESSAGE_CREATED = 'DISPUTE_MESSAGE_CREATED',
  DISPUTE_ASSIGNED = 'DISPUTE_ASSIGNED',
  DISPUTE_UNASSIGNED = 'DISPUTE_UNASSIGNED',
  DISPUTE_PRIORITY_CHANGED = 'DISPUTE_PRIORITY_CHANGED',
  DISPUTE_INVESTIGATION_STARTED = 'DISPUTE_INVESTIGATION_STARTED',
  DISPUTE_ESCALATED = 'DISPUTE_ESCALATED',
  DISPUTE_RESOLVED = 'DISPUTE_RESOLVED',
  DISPUTE_REJECTED = 'DISPUTE_REJECTED',
  DISPUTE_REOPENED = 'DISPUTE_REOPENED',

  DISPUTE_EVIDENCE_SUBMITTED = 'DISPUTE_EVIDENCE_SUBMITTED',
  DISPUTE_EVIDENCE_ACCEPTED = 'DISPUTE_EVIDENCE_ACCEPTED',
  DISPUTE_EVIDENCE_REJECTED = 'DISPUTE_EVIDENCE_REJECTED',

  SUPPORT_ACCESS_DENIED = 'SUPPORT_ACCESS_DENIED',
  DISPUTE_ACCESS_DENIED = 'DISPUTE_ACCESS_DENIED',
}
