/**
 * WASHORA ADMIN / OPERATIONS DASHBOARD DOMAIN TYPES
 * Aggregated models for KPIs, workload trends, operational status, revenue, and alerts.
 */

export type DashboardPeriod = "today" | "last_7_days" | "last_30_days";

export interface DashboardKpis {
  totalCustomers: number;
  activeProviders: number;
  activeDeliveryPartners: number;
  bookings: number;
  pendingBookings: number;
  completedBookings: number;
  revenue: number;
  attentionRequired: number;
  customersTrendPct: number;
  providersTrendPct: number;
  deliveryTrendPct: number;
  bookingsTrendPct: number;
  revenueTrendPct: number;
}

export interface BookingStatusSummary {
  status: "Pending" | "Confirmed" | "In Progress" | "Completed" | "Cancelled";
  count: number;
  color: string;
}

export interface ProviderStatusSummary {
  status: "Active" | "Inactive" | "Pending" | "Suspended";
  count: number;
  color: string;
}

export interface DeliveryPartnerStatusSummary {
  status: "Active" | "Inactive" | "Pending" | "Suspended";
  count: number;
  color: string;
}

export interface DashboardTrendPoint {
  label: string;
  orders: number;
  revenue: number;
}

export interface RevenueSummary {
  totalRevenue: number;
  previousPeriodRevenue: number;
  growthPct: number;
  transactionCount: number;
  averageOrderValue: number;
}

export type DashboardActivityType =
  | "booking_created"
  | "booking_completed"
  | "provider_status"
  | "delivery_partner_active"
  | "payment_recorded"
  | "booking_cancelled";

export interface DashboardActivity {
  id: string;
  type: DashboardActivityType;
  description: string;
  timestamp: string;
  timeAgo: string;
  status: "success" | "warning" | "info" | "critical";
  relatedEntityId: string;
  actor: string;
}

export type AttentionSeverity = "Critical" | "High" | "Medium" | "Low";

export interface DashboardAttentionItem {
  id: string;
  category:
    | "Pending Bookings / Orders"
    | "Pending Provider Approvals"
    | "Pending Delivery Partner Approvals"
    | "Operational Exceptions"
    | "Cancelled / Failed Operations";
  count: number;
  severity: AttentionSeverity;
  explanation: string;
  status: "open" | "investigating" | "resolved";
}

export interface AdminDashboardSnapshot {
  organizationId: string;
  period: DashboardPeriod;
  kpis: DashboardKpis;
  bookingStatus: BookingStatusSummary[];
  providerStatus: ProviderStatusSummary[];
  deliveryPartnerStatus: DeliveryPartnerStatusSummary[];
  bookingTrend: DashboardTrendPoint[];
  revenueSummary: RevenueSummary;
  recentActivity: DashboardActivity[];
  attentionRequired: DashboardAttentionItem[];
  lastUpdated: string;
}
