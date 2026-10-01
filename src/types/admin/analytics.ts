import { z } from "zod";

/**
 * REPORT DATE RANGE PRESETS
 */
export type ReportDateRange =
  | "today"
  | "yesterday"
  | "last7Days"
  | "last30Days"
  | "thisMonth"
  | "lastMonth"
  | "thisYear"
  | "custom";

export const REPORT_DATE_RANGES: { label: string; value: ReportDateRange }[] = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 Days", value: "last7Days" },
  { label: "Last 30 Days", value: "last30Days" },
  { label: "This Month", value: "thisMonth" },
  { label: "Last Month", value: "lastMonth" },
  { label: "This Year", value: "thisYear" },
  { label: "Custom Range", value: "custom" },
];

/**
 * GLOBAL ANALYTICS FILTER
 */
export interface AnalyticsFilter {
  organizationId: string;
  dateRange: ReportDateRange;
  startDate: string; // ISO date string YYYY-MM-DD
  endDate: string;   // ISO date string YYYY-MM-DD
  city?: string;
  serviceCategory?: string;
  providerId?: string;
  deliveryPartnerId?: string;
  serviceId?: string;
}

export const AnalyticsFilterSchema = z.object({
  organizationId: z.string().min(1),
  dateRange: z.enum([
    "today",
    "yesterday",
    "last7Days",
    "last30Days",
    "thisMonth",
    "lastMonth",
    "thisYear",
    "custom",
  ]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  city: z.string().optional(),
  serviceCategory: z.string().optional(),
  providerId: z.string().optional(),
  deliveryPartnerId: z.string().optional(),
  serviceId: z.string().optional(),
}).refine(
  (data) => {
    if (data.dateRange === "custom") {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  },
  {
    message: "Start date cannot be after end date",
    path: ["startDate"],
  }
);

/**
 * CORE KPI INTERFACE
 */
export interface AnalyticsKPI {
  id: string;
  label: string;
  value: number;
  formattedValue: string;
  previousValue?: number;
  changePercent?: number; // e.g. +14.2 or -5.1
  trend?: "up" | "down" | "neutral";
  description?: string;
}

/**
 * TIME SERIES POINT
 */
export interface AnalyticsTimePoint {
  date: string; // "2026-09-01"
  label: string; // "01 Sep"
  value: number;
  secondaryValue?: number;
  tertiaryValue?: number;
}

/**
 * BREAKDOWN / DISTRIBUTION ITEM
 */
export interface AnalyticsBreakdownItem {
  id: string;
  label: string;
  value: number;
  formattedValue?: string;
  percentage: number;
  color?: string;
}

/**
 * REPORT SUMMARY OVERVIEW
 */
export interface ReportSummary {
  totalRevenue: number;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalCustomers: number;
  activeProviders: number;
  activeDeliveryPartners: number;
  averageRating: number;
}

/**
 * 1. OVERVIEW REPORT DATA
 */
export interface ReportOverviewData {
  kpis: {
    totalRevenue: AnalyticsKPI;
    totalBookings: AnalyticsKPI;
    completedBookings: AnalyticsKPI;
    cancellationRate: AnalyticsKPI;
    totalCustomers: AnalyticsKPI;
    activeProviders: AnalyticsKPI;
    activeDeliveryPartners: AnalyticsKPI;
    averageRating: AnalyticsKPI;
  };
  revenueBookingTrend: AnalyticsTimePoint[];
  categoryDistribution: AnalyticsBreakdownItem[];
  operationalFunnel: {
    stage: string;
    count: number;
    percentage: number;
    dropoffRate: number;
  }[];
  topProviders: {
    id: string;
    name: string;
    rating: number;
    completedBookings: number;
    earnings: number;
  }[];
  topServices: {
    id: string;
    name: string;
    category: string;
    bookings: number;
    revenue: number;
  }[];
}

/**
 * 2. REVENUE REPORT DATA
 */
export interface RevenueReportData {
  kpis: {
    totalRevenue: AnalyticsKPI;
    paidRevenue: AnalyticsKPI;
    refundedAmount: AnalyticsKPI;
    providerEarnings: AnalyticsKPI;
    deliveryPartnerEarnings: AnalyticsKPI;
    platformRevenue: AnalyticsKPI;
  };
  revenueTrend: AnalyticsTimePoint[]; // value = payments, secondaryValue = refunds, tertiaryValue = net
  revenueBreakdown: AnalyticsBreakdownItem[];
  dailyFinancials: {
    date: string;
    label: string;
    payments: number;
    refunds: number;
    netRevenue: number;
    providerEarnings: number;
    deliveryEarnings: number;
    platformRevenue: number;
  }[];
}

/**
 * 3. BOOKING REPORT DATA
 */
export interface BookingsReportData {
  kpis: {
    totalBookings: AnalyticsKPI;
    pending: AnalyticsKPI;
    confirmed: AnalyticsKPI;
    inProgress: AnalyticsKPI;
    completed: AnalyticsKPI;
    cancelled: AnalyticsKPI;
    completionRate: AnalyticsKPI;
    cancellationRate: AnalyticsKPI;
  };
  bookingVolumeTrend: AnalyticsTimePoint[];
  statusDistribution: AnalyticsBreakdownItem[];
  categoryDistribution: AnalyticsBreakdownItem[];
  cityDistribution: AnalyticsBreakdownItem[];
  dailyBookings: {
    date: string;
    label: string;
    total: number;
    completed: number;
    cancelled: number;
    completionRate: number;
    cancellationRate: number;
  }[];
}

/**
 * 4. CUSTOMER REPORT DATA
 */
export interface CustomersReportData {
  kpis: {
    totalCustomers: AnalyticsKPI;
    newCustomers: AnalyticsKPI;
    activeCustomers: AnalyticsKPI;
    customersWithCompletedBookings: AnalyticsKPI;
    averageBookingsPerCustomer: AnalyticsKPI;
    averageCustomerSpend: AnalyticsKPI;
  };
  newCustomersTrend: AnalyticsTimePoint[];
  cityDistribution: AnalyticsBreakdownItem[];
  frequencyDistribution: AnalyticsBreakdownItem[];
  topCustomers: {
    id: string;
    name: string;
    email: string;
    city: string;
    totalBookings: number;
    completedBookings: number;
    totalSpend: number;
    lastBookingDate: string;
  }[];
}

/**
 * 5. PROVIDER REPORT DATA
 */
export interface ProvidersReportData {
  kpis: {
    totalProviders: AnalyticsKPI;
    activeProviders: AnalyticsKPI;
    approvedProviders: AnalyticsKPI;
    pendingApproval: AnalyticsKPI;
    suspendedProviders: AnalyticsKPI;
    averageProviderRating: AnalyticsKPI;
    averageCompletedBookings: AnalyticsKPI;
  };
  providerActivityTrend: AnalyticsTimePoint[];
  cityDistribution: AnalyticsBreakdownItem[];
  categoryDistribution: AnalyticsBreakdownItem[];
  ratingDistribution: AnalyticsBreakdownItem[];
  topProviders: {
    id: string;
    name: string;
    businessName: string;
    city: string;
    category: string;
    completedBookings: number;
    cancellationCount: number;
    rating: number;
    reviewsCount: number;
    earnings: number;
    lastActive: string;
  }[];
}

/**
 * 6. DELIVERY PARTNER REPORT DATA
 */
export interface DeliveryPartnersReportData {
  kpis: {
    totalPartners: AnalyticsKPI;
    activePartners: AnalyticsKPI;
    approvedPartners: AnalyticsKPI;
    pendingApproval: AnalyticsKPI;
    suspendedPartners: AnalyticsKPI;
    totalDeliveries: AnalyticsKPI;
    completedDeliveries: AnalyticsKPI;
    cancelledDeliveries: AnalyticsKPI;
    averageRating: AnalyticsKPI;
    totalEarnings: AnalyticsKPI;
  };
  deliveriesTrend: AnalyticsTimePoint[];
  cityDistribution: AnalyticsBreakdownItem[];
  vehicleDistribution: AnalyticsBreakdownItem[];
  statusDistribution: AnalyticsBreakdownItem[];
  topPartners: {
    id: string;
    name: string;
    city: string;
    vehicleType: string;
    completedDeliveries: number;
    cancelledDeliveries: number;
    rating: number;
    earnings: number;
    lastActive: string;
  }[];
}

/**
 * 7. SERVICE REPORT DATA
 */
export interface ServicesReportData {
  kpis: {
    totalServices: AnalyticsKPI;
    activeServices: AnalyticsKPI;
    inactiveServices: AnalyticsKPI;
    archivedServices: AnalyticsKPI;
    totalBookings: AnalyticsKPI;
    mostBookedServiceName: string;
    highestRatedServiceName: string;
  };
  categoryBookingsDistribution: AnalyticsBreakdownItem[];
  categoryRevenueDistribution: AnalyticsBreakdownItem[];
  servicePopularityTrend: AnalyticsTimePoint[];
  ratingDistribution: AnalyticsBreakdownItem[];
  topServices: {
    id: string;
    name: string;
    category: string;
    basePrice: number;
    totalBookings: number;
    completed: number;
    cancelled: number;
    rating: number;
    revenue: number;
  }[];
}

/**
 * 8. OPERATIONS REPORT DATA
 */
export interface OperationsReportData {
  kpis: {
    needsAssignment: AnalyticsKPI;
    providerAssigned: AnalyticsKPI;
    deliveryPending: AnalyticsKPI;
    inProgress: AnalyticsKPI;
    completedToday: AnalyticsKPI;
    cancelledToday: AnalyticsKPI;
    providerAssignmentRate: AnalyticsKPI;
    deliveryAssignmentRate: AnalyticsKPI;
  };
  assignmentStatusTrend: AnalyticsTimePoint[];
  operationalFunnel: {
    stage: string;
    count: number;
    percentage: number;
    description: string;
  }[];
  providerWorkload: {
    workloadLevel: "Low (0-2)" | "Medium (3-5)" | "High (6+)";
    providerCount: number;
    percentage: number;
  }[];
  deliveryPartnerWorkload: {
    workloadLevel: "Low (0-2)" | "Medium (3-5)" | "High (6+)";
    partnerCount: number;
    percentage: number;
  }[];
}

/**
 * 9. REVIEW & RATING REPORT DATA
 */
export interface ReviewsReportData {
  kpis: {
    totalReviews: AnalyticsKPI;
    averageRating: AnalyticsKPI;
    fiveStar: AnalyticsKPI;
    fourStar: AnalyticsKPI;
    threeStar: AnalyticsKPI;
    twoStar: AnalyticsKPI;
    oneStar: AnalyticsKPI;
    publishedCount: AnalyticsKPI;
    flaggedCount: AnalyticsKPI;
    hiddenCount: AnalyticsKPI;
  };
  ratingDistribution: AnalyticsBreakdownItem[];
  reviewsTrend: AnalyticsTimePoint[];
  averageRatingTrend: AnalyticsTimePoint[];
  categoryReviewsDistribution: AnalyticsBreakdownItem[];
  recentReviewsBreakdown: {
    id: string;
    bookingNumber: string;
    customerName: string;
    providerName: string;
    rating: number;
    status: string;
    comment: string;
    createdAt: string;
  }[];
}
