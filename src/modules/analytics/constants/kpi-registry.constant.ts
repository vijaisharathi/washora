/**
 * WASHORA C8 — Canonical KPI Registry & Definitions
 * Canonical definitions, mathematical formulas, domain sources, and calculation rules.
 * All financial metrics MUST be calculated from canonical domain models, never behavioral telemetry.
 */

export interface KpiDefinition {
  id: string;
  name: string;
  category: 'FINANCIAL' | 'CONVERSION' | 'OPERATIONAL' | 'PROVIDER' | 'DELIVERY' | 'GROWTH';
  formula: string;
  sourceDomain: string;
  unit: 'CURRENCY' | 'PERCENTAGE' | 'COUNT' | 'DURATION_MINUTES' | 'RATIO';
  description: string;
}

export const KPI_REGISTRY: Record<string, KpiDefinition> = {
  GMV: {
    id: 'GMV',
    name: 'Gross Merchandise Value',
    category: 'FINANCIAL',
    formula: 'SUM(Payment.amount WHERE status = COMPLETED)',
    sourceDomain: 'financial.Payment',
    unit: 'CURRENCY',
    description: 'Total transactional volume collected from completed customer payments.',
  },
  NET_REVENUE: {
    id: 'NET_REVENUE',
    name: 'Net Platform Revenue',
    category: 'FINANCIAL',
    formula: 'SUM(Payment.amount WHERE status = COMPLETED) - SUM(Refund.amount WHERE status = COMPLETED)',
    sourceDomain: 'financial.Payment, financial.Refund',
    unit: 'CURRENCY',
    description: 'Net platform revenue after subtracting processed customer refunds.',
  },
  CUSTOMER_AOV: {
    id: 'CUSTOMER_AOV',
    name: 'Average Order Value',
    category: 'FINANCIAL',
    formula: 'SUM(Booking.finalAmount WHERE status != CANCELLED) / COUNT(Booking WHERE status != CANCELLED)',
    sourceDomain: 'booking.Booking',
    unit: 'CURRENCY',
    description: 'Average spending per valid non-cancelled customer booking.',
  },
  CUSTOMER_REPEAT_RATE: {
    id: 'CUSTOMER_REPEAT_RATE',
    name: 'Customer Repeat Rate',
    category: 'GROWTH',
    formula: '(COUNT(Customers with >= 2 completed bookings) / COUNT(Customers with >= 1 completed booking)) * 100',
    sourceDomain: 'booking.Booking',
    unit: 'PERCENTAGE',
    description: 'Percentage of transacting customers who placed two or more completed orders.',
  },
  FUNNEL_CONVERSION_RATE: {
    id: 'FUNNEL_CONVERSION_RATE',
    name: 'End-to-End Booking Conversion Rate',
    category: 'CONVERSION',
    formula: '(COUNT(customer.booking.confirmed) / COUNT(customer.app.opened)) * 100',
    sourceDomain: 'analytics.AnalyticsEvent',
    unit: 'PERCENTAGE',
    description: 'Conversion percentage from session start to confirmed booking.',
  },
  PROVIDER_ACCEPTANCE_RATE: {
    id: 'PROVIDER_ACCEPTANCE_RATE',
    name: 'Provider Job Acceptance Rate',
    category: 'PROVIDER',
    formula: '(COUNT(Assignment WHERE status IN [ACCEPTED, COMPLETED]) / COUNT(Assignment WHERE type = PROVIDER)) * 100',
    sourceDomain: 'operations.Assignment',
    unit: 'PERCENTAGE',
    description: 'Percentage of dispatch job offers accepted by service providers.',
  },
  PROVIDER_SLA_COMPLIANCE: {
    id: 'PROVIDER_SLA_COMPLIANCE',
    name: 'Provider SLA Compliance Rate',
    category: 'PROVIDER',
    formula: '(COUNT(Booking WHERE actualCompletionTime <= scheduledSlotEnd) / COUNT(Booking WHERE status = COMPLETED)) * 100',
    sourceDomain: 'booking.Booking',
    unit: 'PERCENTAGE',
    description: 'Percentage of orders finished within the scheduled delivery window.',
  },
  DELIVERY_ON_TIME_RATE: {
    id: 'DELIVERY_ON_TIME_RATE',
    name: 'Delivery Partner On-Time Rate',
    category: 'DELIVERY',
    formula: '(COUNT(DeliveryJob WHERE completedAt <= targetTime) / COUNT(DeliveryJob WHERE status = DELIVERED)) * 100',
    sourceDomain: 'operations.Assignment',
    unit: 'PERCENTAGE',
    description: 'Percentage of pickup and delivery legs completed within expected dispatch schedule.',
  },
  DELIVERY_FAILURE_RATE: {
    id: 'DELIVERY_FAILURE_RATE',
    name: 'Delivery Partner Failure Rate',
    category: 'DELIVERY',
    formula: '(COUNT(Assignment WHERE status = FAILED) / COUNT(Assignment WHERE type = DELIVERY_PARTNER)) * 100',
    sourceDomain: 'operations.Assignment',
    unit: 'PERCENTAGE',
    description: 'Percentage of delivery legs that resulted in failed execution or customer absence.',
  },
  CUSTOMER_CHURN_RATE_30D: {
    id: 'CUSTOMER_CHURN_RATE_30D',
    name: '30-Day Customer Churn Rate',
    category: 'GROWTH',
    formula: '(COUNT(Customers with last booking > 30 days ago) / COUNT(Total Active Customers 30 days ago)) * 100',
    sourceDomain: 'booking.Booking',
    unit: 'PERCENTAGE',
    description: 'Share of previously active customers who have not ordered in the trailing 30 days.',
  },
};
