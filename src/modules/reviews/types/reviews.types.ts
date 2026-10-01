/**
 * ============================================================================
 * WASHORA Phase B12: Reviews & Moderation Domain Types & Constants
 * ============================================================================
 */

import {
  ReviewModerationAction,
  ReviewModerationReason,
  ReviewReportReason,
  ReviewReportStatus,
  ReviewStatus,
} from '@prisma/client';

export {
  ReviewStatus,
  ReviewModerationAction,
  ReviewReportStatus,
  ReviewReportReason,
  ReviewModerationReason,
};

/**
 * Standardized B12 Error Codes
 */
export const ReviewsErrorCode = {
  REVIEW_NOT_FOUND: 'REVIEW_NOT_FOUND',
  REVIEW_NOT_ELIGIBLE: 'REVIEW_NOT_ELIGIBLE',
  REVIEW_ALREADY_EXISTS: 'REVIEW_ALREADY_EXISTS',
  REVIEW_NOT_EDITABLE: 'REVIEW_NOT_EDITABLE',
  REVIEW_NOT_WITHDRAWABLE: 'REVIEW_NOT_WITHDRAWABLE',
  REVIEW_INVALID_STATE: 'REVIEW_INVALID_STATE',
  REVIEW_MODERATION_REASON_REQUIRED: 'REVIEW_MODERATION_REASON_REQUIRED',

  INVALID_RATING: 'INVALID_RATING',
  INVALID_REVIEW_CONTENT: 'INVALID_REVIEW_CONTENT',

  PROVIDER_REVIEW_ACCESS_DENIED: 'PROVIDER_REVIEW_ACCESS_DENIED',
  REVIEW_MODERATION_ACCESS_DENIED: 'REVIEW_MODERATION_ACCESS_DENIED',
  REVIEW_ACCESS_DENIED: 'REVIEW_ACCESS_DENIED',

  REVIEW_REPORT_NOT_FOUND: 'REVIEW_REPORT_NOT_FOUND',
  REVIEW_REPORT_ALREADY_EXISTS: 'REVIEW_REPORT_ALREADY_EXISTS',
  REVIEW_REPORT_NOT_ALLOWED: 'REVIEW_REPORT_NOT_ALLOWED',
  REVIEW_REPORT_INVALID_STATE: 'REVIEW_REPORT_INVALID_STATE',
  REVIEW_REPORT_REASON_REQUIRED: 'REVIEW_REPORT_REASON_REQUIRED',

  REVIEW_RESPONSE_NOT_ALLOWED: 'REVIEW_RESPONSE_NOT_ALLOWED',
  REVIEW_RESPONSE_ALREADY_EXISTS: 'REVIEW_RESPONSE_ALREADY_EXISTS',
  REVIEW_RESPONSE_NOT_FOUND: 'REVIEW_RESPONSE_NOT_FOUND',

  IDEMPOTENCY_KEY_CONFLICT: 'IDEMPOTENCY_KEY_CONFLICT',
  TENANT_MISMATCH: 'TENANT_MISMATCH',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

export type ReviewsErrorCodeType =
  (typeof ReviewsErrorCode)[keyof typeof ReviewsErrorCode];

/**
 * Audit Event Action Names
 */
export const ReviewAuditEvent = {
  REVIEW_CREATED: 'REVIEW_CREATED',
  REVIEW_EDITED: 'REVIEW_EDITED',
  REVIEW_WITHDRAWN: 'REVIEW_WITHDRAWN',

  REVIEW_PUBLISHED: 'REVIEW_PUBLISHED',
  REVIEW_HIDDEN: 'REVIEW_HIDDEN',
  REVIEW_REJECTED: 'REVIEW_REJECTED',
  REVIEW_RESTORED: 'REVIEW_RESTORED',

  REVIEW_REPORTED: 'REVIEW_REPORTED',
  REVIEW_REPORT_REVIEW_STARTED: 'REVIEW_REPORT_REVIEW_STARTED',
  REVIEW_REPORT_RESOLVED: 'REVIEW_REPORT_RESOLVED',
  REVIEW_REPORT_DISMISSED: 'REVIEW_REPORT_DISMISSED',

  REVIEW_RESPONSE_CREATED: 'REVIEW_RESPONSE_CREATED',
  REVIEW_RESPONSE_UPDATED: 'REVIEW_RESPONSE_UPDATED',
  REVIEW_RESPONSE_DELETED: 'REVIEW_RESPONSE_DELETED',

  REVIEW_ACCESS_DENIED: 'REVIEW_ACCESS_DENIED',
  REVIEW_MODERATION_ACCESS_DENIED: 'REVIEW_MODERATION_ACCESS_DENIED',
} as const;

export type ReviewAuditEventType =
  (typeof ReviewAuditEvent)[keyof typeof ReviewAuditEvent];

/**
 * Validation Constraints
 */
export const REVIEW_VALIDATION = {
  TITLE_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 120,
  COMMENT_MIN_LENGTH: 10,
  COMMENT_MAX_LENGTH: 2000,
  RESPONSE_MIN_LENGTH: 3,
  RESPONSE_MAX_LENGTH: 1000,
  MODERATION_REASON_MIN_LENGTH: 3,
  MODERATION_REASON_MAX_LENGTH: 500,
  REPORT_DESCRIPTION_MAX_LENGTH: 1000,
  REPORT_RESOLUTION_NOTE_MIN_LENGTH: 3,
  REPORT_RESOLUTION_NOTE_MAX_LENGTH: 1000,
  ALLOWED_RATINGS: [1, 2, 3, 4, 5] as const,
};

/**
 * Valid Status Transition Maps
 */
export const ALLOWED_REVIEW_TRANSITIONS: Record<ReviewStatus, ReviewStatus[]> = {
  [ReviewStatus.PENDING]: [
    ReviewStatus.PUBLISHED,
    ReviewStatus.HIDDEN,
    ReviewStatus.REJECTED,
    ReviewStatus.WITHDRAWN,
  ],
  [ReviewStatus.PUBLISHED]: [
    ReviewStatus.HIDDEN,
    ReviewStatus.WITHDRAWN,
    ReviewStatus.PENDING, // When customer edits published review
  ],
  [ReviewStatus.HIDDEN]: [
    ReviewStatus.PUBLISHED,
    ReviewStatus.REJECTED,
  ],
  [ReviewStatus.RESTORED]: [
    ReviewStatus.HIDDEN,
    ReviewStatus.WITHDRAWN,
  ],
  [ReviewStatus.FLAGGED]: [
    ReviewStatus.PUBLISHED,
    ReviewStatus.HIDDEN,
    ReviewStatus.REJECTED,
  ],
  [ReviewStatus.REJECTED]: [], // Terminal via standard endpoints
  [ReviewStatus.WITHDRAWN]: [], // Terminal via standard endpoints
};

/**
 * Allowed Report Transitions
 */
export const ALLOWED_REPORT_TRANSITIONS: Record<
  ReviewReportStatus,
  ReviewReportStatus[]
> = {
  [ReviewReportStatus.OPEN]: [
    ReviewReportStatus.UNDER_REVIEW,
    ReviewReportStatus.RESOLVED,
    ReviewReportStatus.DISMISSED,
  ],
  [ReviewReportStatus.UNDER_REVIEW]: [
    ReviewReportStatus.RESOLVED,
    ReviewReportStatus.DISMISSED,
  ],
  [ReviewReportStatus.RESOLVED]: [],
  [ReviewReportStatus.DISMISSED]: [],
};
