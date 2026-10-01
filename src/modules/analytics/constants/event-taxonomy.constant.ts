/**
 * WASHORA C8 — Canonical Analytics Event Taxonomy
 * Strict taxonomy covering all 5 platform roles (Customer, Provider, Delivery, Operations, Admin)
 * and canonical event categories.
 */

export const AnalyticsEventCategory = {
  ACQUISITION: 'ACQUISITION',
  ENGAGEMENT: 'ENGAGEMENT',
  CONVERSION: 'CONVERSION',
  RETENTION: 'RETENTION',
  FINANCIAL: 'FINANCIAL',
  OPERATIONAL: 'OPERATIONAL',
  SYSTEM: 'SYSTEM',
} as const;

export type AnalyticsEventCategoryType =
  (typeof AnalyticsEventCategory)[keyof typeof AnalyticsEventCategory];

export const AnalyticsEventName = {
  // Customer Acquisition & Funnel
  CUSTOMER_APP_OPENED: 'customer.app.opened',
  CUSTOMER_SEARCH_PERFORMED: 'customer.search.performed',
  CUSTOMER_SERVICE_VIEWED: 'customer.service.viewed',
  CUSTOMER_PROVIDER_VIEWED: 'customer.provider.viewed',
  CUSTOMER_BOOKING_INITIATED: 'customer.booking.initiated',
  CUSTOMER_SCHEDULE_SELECTED: 'customer.schedule.selected',
  CUSTOMER_ADDRESS_SELECTED: 'customer.address.selected',
  CUSTOMER_CHECKOUT_VIEWED: 'customer.checkout.viewed',
  CUSTOMER_COUPON_APPLIED: 'customer.coupon.applied',
  CUSTOMER_PAYMENT_INITIATED: 'customer.payment.initiated',
  CUSTOMER_PAYMENT_COMPLETED: 'customer.payment.completed',
  CUSTOMER_BOOKING_CONFIRMED: 'customer.booking.confirmed',
  CUSTOMER_ORDER_TRACKED: 'customer.order.tracked',
  CUSTOMER_ORDER_CANCELLED: 'customer.order.cancelled',
  CUSTOMER_REVIEW_SUBMITTED: 'customer.review.submitted',
  CUSTOMER_REORDER_CLICKED: 'customer.reorder.clicked',
  CUSTOMER_SUPPORT_TICKET_CREATED: 'customer.support.ticket_created',

  // Provider Lifecycle & Operations
  PROVIDER_APP_OPENED: 'provider.app.opened',
  PROVIDER_ONBOARDING_STEP_COMPLETED: 'provider.onboarding.step_completed',
  PROVIDER_KYC_SUBMITTED: 'provider.kyc.submitted',
  PROVIDER_JOB_RECEIVED: 'provider.job.received',
  PROVIDER_JOB_ACCEPTED: 'provider.job.accepted',
  PROVIDER_JOB_REJECTED: 'provider.job.rejected',
  PROVIDER_PROCESSING_STARTED: 'provider.processing.started',
  PROVIDER_QUALITY_CHECKED: 'provider.quality_checked',
  PROVIDER_ORDER_COMPLETED: 'provider.order.completed',
  PROVIDER_EARNINGS_VIEWED: 'provider.earnings.viewed',
  PROVIDER_PAYOUT_REQUESTED: 'provider.payout.requested',

  // Delivery Partner Lifecycle & Fulfillment
  DELIVERY_APP_OPENED: 'delivery.app.opened',
  DELIVERY_JOB_OFFERED: 'delivery.job.offered',
  DELIVERY_JOB_ACCEPTED: 'delivery.job.accepted',
  DELIVERY_JOB_REJECTED: 'delivery.job.rejected',
  DELIVERY_PICKUP_ARRIVED: 'delivery.pickup.arrived',
  DELIVERY_PICKUP_CONFIRMED: 'delivery.pickup.confirmed',
  DELIVERY_DROPOFF_ARRIVED: 'delivery.dropoff.arrived',
  DELIVERY_PROOF_UPLOADED: 'delivery.proof.uploaded',
  DELIVERY_COMPLETED: 'delivery.completed',
  DELIVERY_FAILED: 'delivery.failed',
  DELIVERY_EARNINGS_VIEWED: 'delivery.earnings.viewed',

  // Operations & Admin
  ADMIN_SESSION_STARTED: 'admin.session.started',
  ADMIN_REPORT_ACCESSED: 'admin.report.accessed',
  ADMIN_REPORT_EXPORTED: 'admin.report.exported',
  ADMIN_DISPUTE_TRIAGED: 'admin.dispute.triaged',
  ADMIN_DISPUTE_RESOLVED: 'admin.dispute.resolved',
  ADMIN_REFUND_APPROVED: 'admin.refund.approved',
  ADMIN_SETTLEMENT_EXECUTED: 'admin.settlement.executed',
  ADMIN_EXPERIMENT_CREATED: 'admin.experiment.created',
  ADMIN_EXPERIMENT_STATUS_CHANGED: 'admin.experiment.status_changed',
  ADMIN_IMPROVEMENT_SUBMITTED: 'admin.improvement.submitted',
  ADMIN_IMPROVEMENT_STATUS_CHANGED: 'admin.improvement.status_changed',
} as const;

export type AnalyticsEventNameType =
  (typeof AnalyticsEventName)[keyof typeof AnalyticsEventName];

export const CANONICAL_FUNNEL_STEPS = [
  { step: 1, name: AnalyticsEventName.CUSTOMER_APP_OPENED, label: 'App Opened' },
  { step: 2, name: AnalyticsEventName.CUSTOMER_SERVICE_VIEWED, label: 'Service Viewed' },
  { step: 3, name: AnalyticsEventName.CUSTOMER_BOOKING_INITIATED, label: 'Booking Initiated' },
  { step: 4, name: AnalyticsEventName.CUSTOMER_CHECKOUT_VIEWED, label: 'Checkout Viewed' },
  { step: 5, name: AnalyticsEventName.CUSTOMER_PAYMENT_COMPLETED, label: 'Payment Completed' },
  { step: 6, name: AnalyticsEventName.CUSTOMER_BOOKING_CONFIRMED, label: 'Order Confirmed' },
] as const;
