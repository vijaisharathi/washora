/**
 * Foundational Types for WASHORA Service Provider Dashboard (P3)
 */

export interface ProviderDashboardSummary {
  todayOrdersCount: number;
  pendingInspectionCount: number;
  inProcessingCount: number;
  readyForValetCount: number;
  todayEstimatedRevenue: number;
  averageTurnaroundHours: number;
  qualityRating: number;
  completionRatePercent: number;
}

export interface ProviderOrderPipelineStage {
  id: string;
  label: string;
  count: number;
  icon: string;
  isComplete: boolean;
  isActive: boolean;
}

export interface ProviderUrgentAction {
  id: string;
  title: string;
  count: number;
  actionLabel: string;
  href: string;
  severity: "urgent" | "warning" | "info";
  iconName: string;
}

export interface ProviderScheduleItem {
  id: string;
  orderNumber: string;
  customerName: string;
  serviceCategory: string;
  itemsCount: number;
  timeWindow: string;
  careType: "Standard Care" | "Express Rush" | "Couture Spa";
  status: "NEW_PICKUP" | "IN_INSPECTION" | "IN_PROCESSING" | "READY_VALET" | "DISPATCHED";
}

export interface ProviderRecentActivity {
  id: string;
  type: "ORDER_INTAKE" | "INSPECTION_PASSED" | "CARE_PROCESSING" | "VALET_DISPATCHED" | "PAYOUT_CREDITED" | "REVIEW_RECEIVED";
  title: string;
  subtitle: string;
  timestamp: string;
  badgeText?: string;
  badgeVariant?: "primary" | "success" | "warning" | "neutral";
}

export interface Provider7DayRevenuePoint {
  day: string; // "Mon", "Tue", etc.
  revenue: number;
  orders: number;
}

export interface ProviderDashboardData {
  summary: ProviderDashboardSummary;
  pipeline: ProviderOrderPipelineStage[];
  urgentActions: ProviderUrgentAction[];
  todaySchedule: ProviderScheduleItem[];
  recentActivities: ProviderRecentActivity[];
  weeklyRevenue: Provider7DayRevenuePoint[];
  lastRefreshed: string;
}
