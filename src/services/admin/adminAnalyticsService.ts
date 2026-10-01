import {
  AnalyticsFilter,
  AnalyticsKPI,
  AnalyticsTimePoint,
  AnalyticsBreakdownItem,
  ReportOverviewData,
  RevenueReportData,
  BookingsReportData,
  CustomersReportData,
  ProvidersReportData,
  DeliveryPartnersReportData,
  ServicesReportData,
  OperationsReportData,
  ReviewsReportData,
  ReportDateRange,
} from "@/types/admin/analytics";
import { getMockBookingsByOrg } from "@/mocks/admin/booking.mock";
import { getMockCustomersByOrg } from "@/mocks/admin/customer.mock";
import { getMockProvidersByOrg } from "@/mocks/admin/provider.mock";
import { getMockDeliveryPartnersByOrg } from "@/mocks/admin/deliveryPartner.mock";
import { getMockServicesByOrg } from "@/mocks/admin/serviceCatalog.mock";
import { getMockAssignmentsByOrg } from "@/mocks/admin/operations.mock";
import {
  getMockPaymentsByOrg,
  getMockTransactionsByOrg,
  getMockRefundsByOrg,
  getMockEarningsByOrg,
} from "@/mocks/admin/payment.mock";
import { getMockReviewsByOrg } from "@/mocks/admin/review.mock";
import { isLiveMode } from "@/lib/api/mode";
import { adminApi } from "@/features/admin/api/adminApi";

/**
 * Format currency in Indian Rupees
 */
export function formatINR(val: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(val));
}

/**
 * Format numbers with Indian comma separation
 */
export function formatCount(val: number): string {
  return new Intl.NumberFormat("en-IN").format(val);
}

/**
 * Format percentages
 */
export function formatPercent(val: number): string {
  return `${Number(val.toFixed(1))}%`;
}

/**
 * Helper to compute KPI change percent and trend
 */
function createKpi(
  id: string,
  label: string,
  current: number,
  previous: number,
  formatter: (v: number) => string = formatCount,
  isInverse: boolean = false // e.g. for cancellation rate, down is good
): AnalyticsKPI {
  const diff = current - previous;
  let changePercent = 0;
  if (previous > 0) {
    changePercent = Number(((diff / previous) * 100).toFixed(1));
  } else if (current > 0) {
    changePercent = 100;
  }

  let trend: "up" | "down" | "neutral" = "neutral";
  if (changePercent > 0) {
    trend = isInverse ? "down" : "up";
  } else if (changePercent < 0) {
    trend = isInverse ? "up" : "down";
  }

  return {
    id,
    label,
    value: current,
    formattedValue: formatter(current),
    previousValue: previous,
    changePercent,
    trend,
  };
}

/**
 * Helper to get date boundaries based on dateRange preset or custom dates
 * Uses a baseline reference date of 2026-09-10 (the current simulated environment time)
 */
export function resolveDateWindows(filter: AnalyticsFilter): {
  currentStart: Date;
  currentEnd: Date;
  prevStart: Date;
  prevEnd: Date;
} {
  // Reference baseline
  const now = new Date("2026-09-10T23:59:59.999Z");

  let currentStart = new Date(now);
  let currentEnd = new Date(now);
  let prevStart = new Date(now);
  let prevEnd = new Date(now);

  const range = filter.dateRange;

  if (range === "today") {
    currentStart.setUTCHours(0, 0, 0, 0);
    currentEnd.setUTCHours(23, 59, 59, 999);

    prevStart.setUTCDate(prevStart.getUTCDate() - 1);
    prevStart.setUTCHours(0, 0, 0, 0);
    prevEnd.setUTCDate(prevEnd.getUTCDate() - 1);
    prevEnd.setUTCHours(23, 59, 59, 999);
  } else if (range === "yesterday") {
    currentStart.setUTCDate(currentStart.getUTCDate() - 1);
    currentStart.setUTCHours(0, 0, 0, 0);
    currentEnd.setUTCDate(currentEnd.getUTCDate() - 1);
    currentEnd.setUTCHours(23, 59, 59, 999);

    prevStart.setUTCDate(prevStart.getUTCDate() - 2);
    prevStart.setUTCHours(0, 0, 0, 0);
    prevEnd.setUTCDate(prevEnd.getUTCDate() - 2);
    prevEnd.setUTCHours(23, 59, 59, 999);
  } else if (range === "last7Days") {
    currentStart.setUTCDate(currentStart.getUTCDate() - 6);
    currentStart.setUTCHours(0, 0, 0, 0);

    const span = 7 * 24 * 60 * 60 * 1000;
    prevEnd = new Date(currentStart.getTime() - 1);
    prevStart = new Date(prevEnd.getTime() - span + 1);
  } else if (range === "last30Days") {
    currentStart.setUTCDate(currentStart.getUTCDate() - 29);
    currentStart.setUTCHours(0, 0, 0, 0);

    const span = 30 * 24 * 60 * 60 * 1000;
    prevEnd = new Date(currentStart.getTime() - 1);
    prevStart = new Date(prevEnd.getTime() - span + 1);
  } else if (range === "thisMonth") {
    currentStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
    prevStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1, 0, 0, 0));
    prevEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0, 23, 59, 59, 999));
  } else if (range === "lastMonth") {
    currentStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1, 0, 0, 0));
    currentEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0, 23, 59, 59, 999));
    prevStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 2, 1, 0, 0, 0));
    prevEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 0, 23, 59, 59, 999));
  } else if (range === "thisYear") {
    currentStart = new Date(Date.UTC(now.getUTCFullYear(), 0, 1, 0, 0, 0));
    prevStart = new Date(Date.UTC(now.getUTCFullYear() - 1, 0, 1, 0, 0, 0));
    prevEnd = new Date(Date.UTC(now.getUTCFullYear() - 1, 11, 31, 23, 59, 59, 999));
  } else {
    // Custom
    currentStart = new Date(`${filter.startDate}T00:00:00.000Z`);
    currentEnd = new Date(`${filter.endDate}T23:59:59.999Z`);
    const duration = currentEnd.getTime() - currentStart.getTime();
    prevEnd = new Date(currentStart.getTime() - 1);
    prevStart = new Date(prevEnd.getTime() - duration);
  }

  return { currentStart, currentEnd, prevStart, prevEnd };
}

/**
 * Filter items by date and optional global filters
 */
function isDateInRange(dateStr: string, start: Date, end: Date): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return d >= start && d <= end;
}

/**
 * ADMIN ANALYTICS CALCULATION SERVICE
 */
export class AdminAnalyticsService {
  /**
   * Get Available Filter Options for Organization
   */
  async getFilterOptions(organizationId: string) {
    const bookings = getMockBookingsByOrg(organizationId);
    const providers = getMockProvidersByOrg(organizationId);
    const partners = getMockDeliveryPartnersByOrg(organizationId);
    const services = getMockServicesByOrg(organizationId);

    const cities = Array.from(new Set(bookings.map((b) => b.address.city).filter(Boolean)));
    const categories = Array.from(new Set(services.map((s) => s.category).filter(Boolean)));

    return {
      cities,
      categories,
      providers: providers.map((p) => ({ id: p.id, name: p.fullName || p.businessName || "Facility" })),
      deliveryPartners: partners.map((dp) => ({ id: dp.id, name: dp.fullName })),
      services: services.map((s) => ({ id: s.id, name: s.name, category: s.category })),
    };
  }

  /**
   * 1. Overview Report Data
   */
  async getOverviewReport(filter: AnalyticsFilter): Promise<ReportOverviewData> {
    const { currentStart, currentEnd, prevStart, prevEnd } = resolveDateWindows(filter);
    const orgId = filter.organizationId;

    const bookings = getMockBookingsByOrg(orgId);
    const customers = getMockCustomersByOrg(orgId);
    const providers = getMockProvidersByOrg(orgId);
    const deliveryPartners = getMockDeliveryPartnersByOrg(orgId);
    const payments = getMockPaymentsByOrg(orgId);
    const refunds = getMockRefundsByOrg(orgId);
    const reviews = getMockReviewsByOrg(orgId);
    const services = getMockServicesByOrg(orgId);

    // Apply global filters
    const matchFilter = (b: { city?: string; category?: string; providerId?: string; serviceId?: string }) => {
      if (filter.city && filter.city !== "all" && b.city !== filter.city) return false;
      if (filter.serviceCategory && filter.serviceCategory !== "all" && b.category !== filter.serviceCategory) return false;
      if (filter.providerId && filter.providerId !== "all" && b.providerId !== filter.providerId) return false;
      if (filter.serviceId && filter.serviceId !== "all" && b.serviceId !== filter.serviceId) return false;
      return true;
    };

    // Current & Prev Bookings
    const currentBookings = bookings.filter(
      (b) => isDateInRange(b.createdAt, currentStart, currentEnd) &&
        matchFilter({ city: b.address.city, category: b.serviceCategory, providerId: b.providerId, serviceId: b.serviceId })
    );
    const prevBookings = bookings.filter(
      (b) => isDateInRange(b.createdAt, prevStart, prevEnd) &&
        matchFilter({ city: b.address.city, category: b.serviceCategory, providerId: b.providerId, serviceId: b.serviceId })
    );

    // Current & Prev Payments / Refunds
    const isCompletedPayment = (p: { status: string }) =>
      p.status === "Paid" || p.status === "Partially Refunded" || p.status === "Refunded";

    const currentCompletedPayments = payments
      .filter((p) => isCompletedPayment(p) && isDateInRange(p.createdAt, currentStart, currentEnd))
      .reduce((sum, p) => sum + p.paidAmount, 0);
    const prevCompletedPayments = payments
      .filter((p) => isCompletedPayment(p) && isDateInRange(p.createdAt, prevStart, prevEnd))
      .reduce((sum, p) => sum + p.paidAmount, 0);

    const currentCompletedRefunds = refunds
      .filter((r) => r.status === "Completed" && isDateInRange(r.requestedAt || r.processedAt || "", currentStart, currentEnd))
      .reduce((sum, r) => sum + r.amount, 0);
    const prevCompletedRefunds = refunds
      .filter((r) => r.status === "Completed" && isDateInRange(r.requestedAt || r.processedAt || "", prevStart, prevEnd))
      .reduce((sum, r) => sum + r.amount, 0);

    const currentNetRevenue = currentCompletedPayments - currentCompletedRefunds;
    const prevNetRevenue = prevCompletedPayments - prevCompletedRefunds;

    // Completed & Cancelled Bookings
    const currentCompleted = currentBookings.filter((b) => b.status === "completed").length;
    const prevCompleted = prevBookings.filter((b) => b.status === "completed").length;

    const currentCancelled = currentBookings.filter((b) => b.status === "cancelled").length;
    const prevCancelled = prevBookings.filter((b) => b.status === "cancelled").length;

    const currentCancelRate = currentBookings.length > 0 ? (currentCancelled / currentBookings.length) * 100 : 0;
    const prevCancelRate = prevBookings.length > 0 ? (prevCancelled / prevBookings.length) * 100 : 0;

    // Customers, Providers, DP
    const totalCustomersCount = customers.length;
    const activeProvidersCount = providers.filter((p) => p.status === "active").length;
    const activeDPCount = deliveryPartners.filter((dp) => dp.status === "active").length;

    // Valid Reviews (Published & Restored only)
    const validReviews = reviews.filter((r) => r.status === "Published" || r.status === "Restored");
    const avgRating = validReviews.length > 0
      ? Number((validReviews.reduce((sum, r) => sum + r.rating, 0) / validReviews.length).toFixed(1))
      : 5.0;

    // Time Series Trend (Generate 7-10 timeline points across window)
    const revenueBookingTrend: AnalyticsTimePoint[] = [
      { date: "2026-09-01", label: "01 Sep", value: Math.round(currentNetRevenue * 0.12), secondaryValue: Math.max(1, Math.round(currentBookings.length * 0.1)) },
      { date: "2026-09-02", label: "02 Sep", value: Math.round(currentNetRevenue * 0.18), secondaryValue: Math.max(2, Math.round(currentBookings.length * 0.15)) },
      { date: "2026-09-03", label: "03 Sep", value: Math.round(currentNetRevenue * 0.14), secondaryValue: Math.max(1, Math.round(currentBookings.length * 0.12)) },
      { date: "2026-09-04", label: "04 Sep", value: Math.round(currentNetRevenue * 0.22), secondaryValue: Math.max(2, Math.round(currentBookings.length * 0.18)) },
      { date: "2026-09-05", label: "05 Sep", value: Math.round(currentNetRevenue * 0.28), secondaryValue: Math.max(3, Math.round(currentBookings.length * 0.22)) },
      { date: "2026-09-06", label: "06 Sep", value: Math.round(currentNetRevenue * 0.35), secondaryValue: Math.max(4, Math.round(currentBookings.length * 0.28)) },
      { date: "2026-09-07", label: "07 Sep", value: Math.round(currentNetRevenue * 0.42), secondaryValue: Math.max(4, Math.round(currentBookings.length * 0.32)) },
      { date: "2026-09-08", label: "08 Sep", value: Math.round(currentNetRevenue * 0.65), secondaryValue: Math.max(6, Math.round(currentBookings.length * 0.5)) },
      { date: "2026-09-09", label: "09 Sep", value: Math.round(currentNetRevenue * 0.82), secondaryValue: Math.max(8, Math.round(currentBookings.length * 0.7)) },
      { date: "2026-09-10", label: "10 Sep", value: currentNetRevenue, secondaryValue: currentBookings.length },
    ];

    // Category Distribution
    const categoryMap = new Map<string, number>();
    currentBookings.forEach((b) => {
      categoryMap.set(b.serviceCategory, (categoryMap.get(b.serviceCategory) || 0) + 1);
    });
    if (categoryMap.size === 0) {
      categoryMap.set("Wash & Fold", 12);
      categoryMap.set("Dry Cleaning", 8);
      categoryMap.set("Steam Ironing", 6);
      categoryMap.set("Shoe Care", 4);
    }
    const totalCatCount = Array.from(categoryMap.values()).reduce((a, b) => a + b, 0);
    const categoryDistribution: AnalyticsBreakdownItem[] = Array.from(categoryMap.entries()).map(([label, count], idx) => ({
      id: `cat-${idx}`,
      label,
      value: count,
      formattedValue: `${count} bookings`,
      percentage: Number(((count / totalCatCount) * 100).toFixed(1)),
    }));

    // Operational Funnel
    const totalB = Math.max(currentBookings.length, 25);
    const confirmedB = Math.max(currentBookings.filter((b) => b.status !== "pending").length, 22);
    const inProgressB = Math.max(currentBookings.filter((b) => b.status === "in_progress" || b.status === "completed").length, 18);
    const completedB = Math.max(currentCompleted, 15);

    const operationalFunnel = [
      { stage: "Booking Created", count: totalB, percentage: 100, dropoffRate: 0 },
      { stage: "Provider Assigned", count: confirmedB, percentage: Number(((confirmedB / totalB) * 100).toFixed(1)), dropoffRate: Number((((totalB - confirmedB) / totalB) * 100).toFixed(1)) },
      { stage: "Processing In-Hub", count: inProgressB, percentage: Number(((inProgressB / totalB) * 100).toFixed(1)), dropoffRate: Number((((confirmedB - inProgressB) / totalB) * 100).toFixed(1)) },
      { stage: "Delivered & Completed", count: completedB, percentage: Number(((completedB / totalB) * 100).toFixed(1)), dropoffRate: Number((((inProgressB - completedB) / totalB) * 100).toFixed(1)) },
    ];

    // Top Providers
    const topProviders = providers.slice(0, 4).map((p) => ({
      id: p.id,
      name: p.fullName || p.businessName || "Facility",
      rating: p.rating,
      completedBookings: p.completedBookings,
      earnings: p.totalEarnings,
    }));

    // Top Services
    const topServices = services.slice(0, 4).map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      bookings: 24,
      revenue: s.basePrice * 24,
    }));

    return {
      kpis: {
        totalRevenue: createKpi("kpi-revenue", "Total Revenue", currentNetRevenue, prevNetRevenue, formatINR),
        totalBookings: createKpi("kpi-bookings", "Total Bookings", currentBookings.length, prevBookings.length, formatCount),
        completedBookings: createKpi("kpi-completed", "Completed Bookings", currentCompleted, prevCompleted, formatCount),
        cancellationRate: createKpi("kpi-cancel-rate", "Cancellation Rate", currentCancelRate, prevCancelRate, formatPercent, true),
        totalCustomers: createKpi("kpi-customers", "Total Customers", totalCustomersCount, Math.round(totalCustomersCount * 0.9), formatCount),
        activeProviders: createKpi("kpi-providers", "Active Providers", activeProvidersCount, Math.round(activeProvidersCount * 0.95), formatCount),
        activeDeliveryPartners: createKpi("kpi-dp", "Active Delivery Partners", activeDPCount, Math.round(activeDPCount * 0.95), formatCount),
        averageRating: createKpi("kpi-rating", "Average Rating", avgRating, 4.7, (v) => `${v.toFixed(1)} ★`),
      },
      revenueBookingTrend,
      categoryDistribution,
      operationalFunnel,
      topProviders,
      topServices,
    };
  }

  /**
   * 2. Revenue Report Data
   */
  async getRevenueReport(filter: AnalyticsFilter): Promise<RevenueReportData> {
    if (isLiveMode()) {
      try {
        await adminApi.reports.revenue({ dateRange: filter.dateRange });
      } catch (e) {
        // continue
      }
    }

    const { currentStart, currentEnd, prevStart, prevEnd } = resolveDateWindows(filter);
    const orgId = filter.organizationId;

    const payments = getMockPaymentsByOrg(orgId);
    const refunds = getMockRefundsByOrg(orgId);
    const earnings = getMockEarningsByOrg(orgId);

    const isCompletedPayment = (p: { status: string }) =>
      p.status === "Paid" || p.status === "Partially Refunded" || p.status === "Refunded";

    const currentCompletedPayments = payments.filter((p) => isCompletedPayment(p) && isDateInRange(p.createdAt, currentStart, currentEnd));
    const prevCompletedPayments = payments.filter((p) => isCompletedPayment(p) && isDateInRange(p.createdAt, prevStart, prevEnd));

    const currentRefunds = refunds.filter((r) => r.status === "Completed" && isDateInRange(r.requestedAt || r.processedAt || "", currentStart, currentEnd));
    const prevRefunds = refunds.filter((r) => r.status === "Completed" && isDateInRange(r.requestedAt || r.processedAt || "", prevStart, prevEnd));

    const currentPaidRev = currentCompletedPayments.reduce((sum, p) => sum + p.paidAmount, 0);
    const prevPaidRev = prevCompletedPayments.reduce((sum, p) => sum + p.paidAmount, 0);

    const currentRefundedAmt = currentRefunds.reduce((sum, r) => sum + r.amount, 0);
    const prevRefundedAmt = prevRefunds.reduce((sum, r) => sum + r.amount, 0);

    const currentNetRev = currentPaidRev - currentRefundedAmt;
    const prevNetRev = prevPaidRev - prevRefundedAmt;

    const currentProviderEarnings = earnings.filter((e) => e.recipientType === "Provider").reduce((sum, e) => sum + e.netAmount, 0) || Math.round(currentNetRev * 0.7);
    const prevProviderEarnings = Math.round(prevNetRev * 0.7);

    const currentDPEarnings = earnings.filter((e) => e.recipientType === "Delivery Partner").reduce((sum, e) => sum + e.netAmount, 0) || Math.round(currentNetRev * 0.15);
    const prevDPEarnings = Math.round(prevNetRev * 0.15);

    const currentPlatformRev = currentNetRev - currentProviderEarnings - currentDPEarnings;
    const prevPlatformRev = prevNetRev - prevProviderEarnings - prevDPEarnings;

    const revenueTrend: AnalyticsTimePoint[] = [
      { date: "2026-09-01", label: "01 Sep", value: Math.round(currentPaidRev * 0.1), secondaryValue: Math.round(currentRefundedAmt * 0.05), tertiaryValue: Math.round(currentNetRev * 0.1) },
      { date: "2026-09-02", label: "02 Sep", value: Math.round(currentPaidRev * 0.15), secondaryValue: Math.round(currentRefundedAmt * 0.1), tertiaryValue: Math.round(currentNetRev * 0.15) },
      { date: "2026-09-03", label: "03 Sep", value: Math.round(currentPaidRev * 0.22), secondaryValue: Math.round(currentRefundedAmt * 0.15), tertiaryValue: Math.round(currentNetRev * 0.22) },
      { date: "2026-09-04", label: "04 Sep", value: Math.round(currentPaidRev * 0.35), secondaryValue: Math.round(currentRefundedAmt * 0.2), tertiaryValue: Math.round(currentNetRev * 0.35) },
      { date: "2026-09-05", label: "05 Sep", value: Math.round(currentPaidRev * 0.5), secondaryValue: Math.round(currentRefundedAmt * 0.4), tertiaryValue: Math.round(currentNetRev * 0.5) },
      { date: "2026-09-06", label: "06 Sep", value: Math.round(currentPaidRev * 0.65), secondaryValue: Math.round(currentRefundedAmt * 0.5), tertiaryValue: Math.round(currentNetRev * 0.65) },
      { date: "2026-09-07", label: "07 Sep", value: Math.round(currentPaidRev * 0.78), secondaryValue: Math.round(currentRefundedAmt * 0.7), tertiaryValue: Math.round(currentNetRev * 0.78) },
      { date: "2026-09-08", label: "08 Sep", value: Math.round(currentPaidRev * 0.88), secondaryValue: Math.round(currentRefundedAmt * 0.85), tertiaryValue: Math.round(currentNetRev * 0.88) },
      { date: "2026-09-09", label: "09 Sep", value: Math.round(currentPaidRev * 0.95), secondaryValue: Math.round(currentRefundedAmt * 0.9), tertiaryValue: Math.round(currentNetRev * 0.95) },
      { date: "2026-09-10", label: "10 Sep", value: currentPaidRev, secondaryValue: currentRefundedAmt, tertiaryValue: currentNetRev },
    ];

    const revenueBreakdown: AnalyticsBreakdownItem[] = [
      { id: "rb-provider", label: "Provider Payouts", value: currentProviderEarnings, formattedValue: formatINR(currentProviderEarnings), percentage: 70 },
      { id: "rb-delivery", label: "Delivery Partner Payouts", value: currentDPEarnings, formattedValue: formatINR(currentDPEarnings), percentage: 15 },
      { id: "rb-platform", label: "Net Platform Margin", value: Math.max(0, currentPlatformRev), formattedValue: formatINR(Math.max(0, currentPlatformRev)), percentage: 15 },
    ];

    const dailyFinancials = revenueTrend.map((pt) => {
      const paymentsVal = pt.value;
      const refundsVal = pt.secondaryValue || 0;
      const net = paymentsVal - refundsVal;
      const prov = Math.round(net * 0.7);
      const dp = Math.round(net * 0.15);
      const plat = net - prov - dp;
      return {
        date: pt.date,
        label: pt.label,
        payments: paymentsVal,
        refunds: refundsVal,
        netRevenue: net,
        providerEarnings: prov,
        deliveryEarnings: dp,
        platformRevenue: plat,
      };
    });

    return {
      kpis: {
        totalRevenue: createKpi("rev-total", "Net Realized Revenue", currentNetRev, prevNetRev, formatINR),
        paidRevenue: createKpi("rev-paid", "Customer Payments", currentPaidRev, prevPaidRev, formatINR),
        refundedAmount: createKpi("rev-refunded", "Refunded Amount", currentRefundedAmt, prevRefundedAmt, formatINR, true),
        providerEarnings: createKpi("rev-provider", "Provider Earnings", currentProviderEarnings, prevProviderEarnings, formatINR),
        deliveryPartnerEarnings: createKpi("rev-dp", "Delivery Partner Earnings", currentDPEarnings, prevDPEarnings, formatINR),
        platformRevenue: createKpi("rev-platform", "Platform Net Revenue", currentPlatformRev, prevPlatformRev, formatINR),
      },
      revenueTrend,
      revenueBreakdown,
      dailyFinancials,
    };
  }

  /**
   * 3. Booking Report Data
   */
  async getBookingsReport(filter: AnalyticsFilter): Promise<BookingsReportData> {
    if (isLiveMode()) {
      try {
        await adminApi.reports.bookings({ dateRange: filter.dateRange });
      } catch (e) {
        // continue
      }
    }

    const { currentStart, currentEnd, prevStart, prevEnd } = resolveDateWindows(filter);
    const orgId = filter.organizationId;
    const bookings = getMockBookingsByOrg(orgId);

    const currentB = bookings.filter((b) => isDateInRange(b.createdAt, currentStart, currentEnd));
    const prevB = bookings.filter((b) => isDateInRange(b.createdAt, prevStart, prevEnd));

    const countByStatus = (arr: typeof bookings, st: string) => arr.filter((b) => b.status === st).length;

    const currentPending = countByStatus(currentB, "pending");
    const prevPending = countByStatus(prevB, "pending");

    const currentConfirmed = countByStatus(currentB, "confirmed");
    const prevConfirmed = countByStatus(prevB, "confirmed");

    const currentInProgress = countByStatus(currentB, "in_progress");
    const prevInProgress = countByStatus(prevB, "in_progress");

    const currentCompleted = countByStatus(currentB, "completed");
    const prevCompleted = countByStatus(prevB, "completed");

    const currentCancelled = countByStatus(currentB, "cancelled");
    const prevCancelled = countByStatus(prevB, "cancelled");

    const totalCurrent = currentB.length;
    const totalPrev = prevB.length;

    const currentCompRate = totalCurrent > 0 ? (currentCompleted / totalCurrent) * 100 : 0;
    const prevCompRate = totalPrev > 0 ? (prevCompleted / totalPrev) * 100 : 0;

    const currentCancRate = totalCurrent > 0 ? (currentCancelled / totalCurrent) * 100 : 0;
    const prevCancRate = totalPrev > 0 ? (prevCancelled / totalPrev) * 100 : 0;

    const statusDistribution: AnalyticsBreakdownItem[] = [
      { id: "st-completed", label: "Completed", value: currentCompleted, formattedValue: `${currentCompleted} orders`, percentage: totalCurrent > 0 ? Number(((currentCompleted / totalCurrent) * 100).toFixed(1)) : 0, color: "#10B981" },
      { id: "st-in-progress", label: "In Progress", value: currentInProgress, formattedValue: `${currentInProgress} orders`, percentage: totalCurrent > 0 ? Number(((currentInProgress / totalCurrent) * 100).toFixed(1)) : 0, color: "#3B82F6" },
      { id: "st-confirmed", label: "Confirmed", value: currentConfirmed, formattedValue: `${currentConfirmed} orders`, percentage: totalCurrent > 0 ? Number(((currentConfirmed / totalCurrent) * 100).toFixed(1)) : 0, color: "#8B5CF6" },
      { id: "st-pending", label: "Pending", value: currentPending, formattedValue: `${currentPending} orders`, percentage: totalCurrent > 0 ? Number(((currentPending / totalCurrent) * 100).toFixed(1)) : 0, color: "#F59E0B" },
      { id: "st-cancelled", label: "Cancelled", value: currentCancelled, formattedValue: `${currentCancelled} orders`, percentage: totalCurrent > 0 ? Number(((currentCancelled / totalCurrent) * 100).toFixed(1)) : 0, color: "#EF4444" },
    ];

    // City distribution
    const cityMap = new Map<string, number>();
    currentB.forEach((b) => cityMap.set(b.address.city, (cityMap.get(b.address.city) || 0) + 1));
    const cityDistribution = Array.from(cityMap.entries()).map(([label, val], idx) => ({
      id: `city-${idx}`,
      label,
      value: val,
      formattedValue: `${val} bookings`,
      percentage: totalCurrent > 0 ? Number(((val / totalCurrent) * 100).toFixed(1)) : 0,
    }));

    // Category distribution
    const catMap = new Map<string, number>();
    currentB.forEach((b) => catMap.set(b.serviceCategory, (catMap.get(b.serviceCategory) || 0) + 1));
    const categoryDistribution = Array.from(catMap.entries()).map(([label, val], idx) => ({
      id: `cat-${idx}`,
      label,
      value: val,
      formattedValue: `${val} bookings`,
      percentage: totalCurrent > 0 ? Number(((val / totalCurrent) * 100).toFixed(1)) : 0,
    }));

    const bookingVolumeTrend: AnalyticsTimePoint[] = [
      { date: "2026-09-01", label: "01 Sep", value: Math.max(1, Math.round(totalCurrent * 0.1)) },
      { date: "2026-09-02", label: "02 Sep", value: Math.max(2, Math.round(totalCurrent * 0.15)) },
      { date: "2026-09-03", label: "03 Sep", value: Math.max(2, Math.round(totalCurrent * 0.2)) },
      { date: "2026-09-04", label: "04 Sep", value: Math.max(3, Math.round(totalCurrent * 0.35)) },
      { date: "2026-09-05", label: "05 Sep", value: Math.max(4, Math.round(totalCurrent * 0.5)) },
      { date: "2026-09-06", label: "06 Sep", value: Math.max(5, Math.round(totalCurrent * 0.65)) },
      { date: "2026-09-07", label: "07 Sep", value: Math.max(6, Math.round(totalCurrent * 0.78)) },
      { date: "2026-09-08", label: "08 Sep", value: Math.max(7, Math.round(totalCurrent * 0.88)) },
      { date: "2026-09-09", label: "09 Sep", value: Math.max(8, Math.round(totalCurrent * 0.95)) },
      { date: "2026-09-10", label: "10 Sep", value: totalCurrent },
    ];

    const dailyBookings = bookingVolumeTrend.map((pt) => {
      const tot = pt.value;
      const comp = Math.round(tot * 0.7);
      const canc = Math.round(tot * 0.1);
      return {
        date: pt.date,
        label: pt.label,
        total: tot,
        completed: comp,
        cancelled: canc,
        completionRate: tot > 0 ? Number(((comp / tot) * 100).toFixed(1)) : 0,
        cancellationRate: tot > 0 ? Number(((canc / tot) * 100).toFixed(1)) : 0,
      };
    });

    return {
      kpis: {
        totalBookings: createKpi("bkg-total", "Total Bookings", totalCurrent, totalPrev, formatCount),
        pending: createKpi("bkg-pending", "Pending Orders", currentPending, prevPending, formatCount),
        confirmed: createKpi("bkg-confirmed", "Confirmed Orders", currentConfirmed, prevConfirmed, formatCount),
        inProgress: createKpi("bkg-progress", "In Progress", currentInProgress, prevInProgress, formatCount),
        completed: createKpi("bkg-completed", "Completed Orders", currentCompleted, prevCompleted, formatCount),
        cancelled: createKpi("bkg-cancelled", "Cancelled Orders", currentCancelled, prevCancelled, formatCount, true),
        completionRate: createKpi("bkg-comp-rate", "Completion Rate", currentCompRate, prevCompRate, formatPercent),
        cancellationRate: createKpi("bkg-canc-rate", "Cancellation Rate", currentCancRate, prevCancRate, formatPercent, true),
      },
      bookingVolumeTrend,
      statusDistribution,
      categoryDistribution,
      cityDistribution,
      dailyBookings,
    };
  }

  /**
   * 4. Customer Report Data
   */
  async getCustomersReport(filter: AnalyticsFilter): Promise<CustomersReportData> {
    if (isLiveMode()) {
      try {
        await adminApi.reports.customers({ dateRange: filter.dateRange });
      } catch (e) {
        // continue
      }
    }

    const { currentStart, currentEnd } = resolveDateWindows(filter);
    const orgId = filter.organizationId;
    const customers = getMockCustomersByOrg(orgId);

    const totalCust = customers.length;
    const newCust = customers.filter((c) => isDateInRange(c.joinedAt, currentStart, currentEnd)).length || Math.round(totalCust * 0.3);
    const activeCust = customers.filter((c) => c.status === "active").length;
    const withCompleted = customers.filter((c) => c.completedBookings > 0).length;

    const totalBookingsCount = customers.reduce((sum, c) => sum + c.totalBookings, 0);
    const avgBookingsPerCustomer = totalCust > 0 ? Number((totalBookingsCount / totalCust).toFixed(1)) : 0;

    const totalSpendAll = customers.reduce((sum, c) => sum + c.totalSpend, 0);
    const avgCustomerSpend = totalCust > 0 ? Math.round(totalSpendAll / totalCust) : 0;

    const newCustomersTrend: AnalyticsTimePoint[] = [
      { date: "2026-09-01", label: "01 Sep", value: Math.max(1, Math.round(newCust * 0.1)) },
      { date: "2026-09-03", label: "03 Sep", value: Math.max(2, Math.round(newCust * 0.3)) },
      { date: "2026-09-05", label: "05 Sep", value: Math.max(3, Math.round(newCust * 0.5)) },
      { date: "2026-09-07", label: "07 Sep", value: Math.max(5, Math.round(newCust * 0.75)) },
      { date: "2026-09-10", label: "10 Sep", value: newCust },
    ];

    const cityMap = new Map<string, number>();
    customers.forEach((c) => cityMap.set(c.city || "Chennai", (cityMap.get(c.city || "Chennai") || 0) + 1));
    const cityDistribution = Array.from(cityMap.entries()).map(([label, val], idx) => ({
      id: `ccity-${idx}`,
      label,
      value: val,
      formattedValue: `${val} users`,
      percentage: Number(((val / totalCust) * 100).toFixed(1)),
    }));

    const frequencyDistribution: AnalyticsBreakdownItem[] = [
      { id: "freq-1", label: "1 Booking", value: customers.filter((c) => c.totalBookings === 1).length || 5, percentage: 25 },
      { id: "freq-2-3", label: "2–3 Bookings", value: customers.filter((c) => c.totalBookings >= 2 && c.totalBookings <= 3).length || 8, percentage: 38 },
      { id: "freq-4-5", label: "4–5 Bookings", value: customers.filter((c) => c.totalBookings >= 4 && c.totalBookings <= 5).length || 5, percentage: 22 },
      { id: "freq-6plus", label: "6+ Bookings", value: customers.filter((c) => c.totalBookings >= 6).length || 3, percentage: 15 },
    ];

    const topCustomers = customers.slice(0, 10).map((c) => ({
      id: c.id,
      name: c.fullName,
      email: c.email,
      city: c.city || "Chennai",
      totalBookings: c.totalBookings,
      completedBookings: c.completedBookings,
      totalSpend: c.totalSpend,
      lastBookingDate: c.lastBookingAt || c.joinedAt || "2026-09-01T00:00:00Z",
    }));

    return {
      kpis: {
        totalCustomers: createKpi("cust-total", "Total Customers", totalCust, Math.round(totalCust * 0.9), formatCount),
        newCustomers: createKpi("cust-new", "New Registrations", newCust, Math.round(newCust * 0.8), formatCount),
        activeCustomers: createKpi("cust-active", "Active Customers", activeCust, Math.round(activeCust * 0.9), formatCount),
        customersWithCompletedBookings: createKpi("cust-completed", "Completed Order Users", withCompleted, Math.round(withCompleted * 0.9), formatCount),
        averageBookingsPerCustomer: createKpi("cust-avg-bkg", "Avg Bookings / User", avgBookingsPerCustomer, 2.8, (v) => `${v.toFixed(1)} orders`),
        averageCustomerSpend: createKpi("cust-avg-spend", "Avg Customer LTV", avgCustomerSpend, Math.round(avgCustomerSpend * 0.95), formatINR),
      },
      newCustomersTrend,
      cityDistribution,
      frequencyDistribution,
      topCustomers,
    };
  }

  /**
   * 5. Provider Report Data
   */
  async getProvidersReport(filter: AnalyticsFilter): Promise<ProvidersReportData> {
    if (isLiveMode()) {
      try {
        await adminApi.reports.providers();
      } catch (e) {
        // continue
      }
    }

    const orgId = filter.organizationId;
    const providers = getMockProvidersByOrg(orgId);

    const totalProv = providers.length;
    const activeProv = providers.filter((p) => p.status === "active").length;
    const approvedProv = providers.filter((p) => p.approvalStatus === "approved").length;
    const pendingProv = providers.filter((p) => p.approvalStatus === "pending").length;
    const suspendedProv = providers.filter((p) => p.status === "suspended").length;

    const avgRating = totalProv > 0 ? Number((providers.reduce((sum, p) => sum + p.rating, 0) / totalProv).toFixed(1)) : 4.8;
    const totalCompleted = providers.reduce((sum, p) => sum + p.completedBookings, 0);
    const avgCompleted = totalProv > 0 ? Number((totalCompleted / totalProv).toFixed(1)) : 0;

    const providerActivityTrend: AnalyticsTimePoint[] = [
      { date: "2026-09-01", label: "01 Sep", value: Math.round(totalProv * 0.8) },
      { date: "2026-09-05", label: "05 Sep", value: Math.round(totalProv * 0.9) },
      { date: "2026-09-10", label: "10 Sep", value: totalProv },
    ];

    const cityMap = new Map<string, number>();
    providers.forEach((p) => cityMap.set(p.city, (cityMap.get(p.city) || 0) + 1));
    const cityDistribution = Array.from(cityMap.entries()).map(([label, val], idx) => ({
      id: `pcity-${idx}`,
      label,
      value: val,
      percentage: Number(((val / totalProv) * 100).toFixed(1)),
    }));

    const catMap = new Map<string, number>();
    providers.forEach((p) => {
      p.serviceCategories.forEach((cat) => catMap.set(cat, (catMap.get(cat) || 0) + 1));
    });
    const categoryDistribution = Array.from(catMap.entries()).map(([label, val], idx) => ({
      id: `pcat-${idx}`,
      label,
      value: val,
      percentage: Number(((val / totalProv) * 100).toFixed(1)),
    }));

    const ratingDistribution: AnalyticsBreakdownItem[] = [
      { id: "pr-5", label: "4.8 - 5.0 ★", value: providers.filter((p) => p.rating >= 4.8).length || 8, percentage: 55, color: "#10B981" },
      { id: "pr-4", label: "4.5 - 4.7 ★", value: providers.filter((p) => p.rating >= 4.5 && p.rating < 4.8).length || 4, percentage: 30, color: "#3B82F6" },
      { id: "pr-3", label: "4.0 - 4.4 ★", value: providers.filter((p) => p.rating >= 4.0 && p.rating < 4.5).length || 2, percentage: 10, color: "#F59E0B" },
      { id: "pr-below", label: "Below 4.0 ★", value: providers.filter((p) => p.rating < 4.0).length || 1, percentage: 5, color: "#EF4444" },
    ];

    const topProviders = providers.map((p) => ({
      id: p.id,
      name: p.fullName || p.businessName || "Facility",
      businessName: p.businessName || p.fullName,
      city: p.city,
      category: p.serviceCategories[0] || "General Laundry",
      completedBookings: p.completedBookings,
      cancellationCount: p.cancelledBookings,
      rating: p.rating,
      reviewsCount: p.totalReviews,
      earnings: p.totalEarnings,
      lastActive: p.lastActiveAt || p.updatedAt,
    }));

    return {
      kpis: {
        totalProviders: createKpi("prov-total", "Total Providers", totalProv, Math.round(totalProv * 0.9), formatCount),
        activeProviders: createKpi("prov-active", "Active Facilities", activeProv, Math.round(activeProv * 0.95), formatCount),
        approvedProviders: createKpi("prov-approved", "Verified Providers", approvedProv, Math.round(approvedProv * 0.95), formatCount),
        pendingApproval: createKpi("prov-pending", "Pending KYC Verification", pendingProv, 2, formatCount),
        suspendedProviders: createKpi("prov-suspended", "Suspended Accounts", suspendedProv, 0, formatCount, true),
        averageProviderRating: createKpi("prov-avg-rating", "Average Provider Score", avgRating, 4.7, (v) => `${v.toFixed(1)} ★`),
        averageCompletedBookings: createKpi("prov-avg-orders", "Avg Orders / Provider", avgCompleted, 18, (v) => `${v.toFixed(1)} orders`),
      },
      providerActivityTrend,
      cityDistribution,
      categoryDistribution,
      ratingDistribution,
      topProviders,
    };
  }

  /**
   * 6. Delivery Partner Report Data
   */
  async getDeliveryPartnersReport(filter: AnalyticsFilter): Promise<DeliveryPartnersReportData> {
    const orgId = filter.organizationId;
    const partners = getMockDeliveryPartnersByOrg(orgId);

    const totalPartners = partners.length;
    const activePartners = partners.filter((dp) => dp.status === "active").length;
    const approvedPartners = partners.filter((dp) => dp.approvalStatus === "approved").length;
    const pendingApproval = partners.filter((dp) => dp.approvalStatus === "pending").length;
    const suspendedPartners = partners.filter((dp) => dp.status === "suspended").length;

    const totalDeliveries = partners.reduce((sum, dp) => sum + dp.completedDeliveries + dp.cancelledDeliveries, 0);
    const completedDeliveries = partners.reduce((sum, dp) => sum + dp.completedDeliveries, 0);
    const cancelledDeliveries = partners.reduce((sum, dp) => sum + dp.cancelledDeliveries, 0);

    const avgRating = totalPartners > 0 ? Number((partners.reduce((sum, dp) => sum + dp.rating, 0) / totalPartners).toFixed(1)) : 4.8;
    const totalEarnings = partners.reduce((sum, dp) => sum + dp.totalEarnings, 0);

    const deliveriesTrend: AnalyticsTimePoint[] = [
      { date: "2026-09-01", label: "01 Sep", value: Math.round(completedDeliveries * 0.1) },
      { date: "2026-09-04", label: "04 Sep", value: Math.round(completedDeliveries * 0.35) },
      { date: "2026-09-07", label: "07 Sep", value: Math.round(completedDeliveries * 0.7) },
      { date: "2026-09-10", label: "10 Sep", value: completedDeliveries },
    ];

    const cityMap = new Map<string, number>();
    partners.forEach((dp) => cityMap.set(dp.city, (cityMap.get(dp.city) || 0) + 1));
    const cityDistribution = Array.from(cityMap.entries()).map(([label, val], idx) => ({
      id: `dpcity-${idx}`,
      label,
      value: val,
      percentage: Number(((val / totalPartners) * 100).toFixed(1)),
    }));

    const vehicleMap = new Map<string, number>();
    partners.forEach((dp) => vehicleMap.set(dp.vehicleType, (vehicleMap.get(dp.vehicleType) || 0) + 1));
    const vehicleDistribution = Array.from(vehicleMap.entries()).map(([label, val], idx) => ({
      id: `dpveh-${idx}`,
      label: label.toUpperCase(),
      value: val,
      percentage: Number(((val / totalPartners) * 100).toFixed(1)),
    }));

    const statusDistribution: AnalyticsBreakdownItem[] = [
      { id: "dp-comp", label: "Completed Deliveries", value: completedDeliveries, percentage: totalDeliveries > 0 ? Number(((completedDeliveries / totalDeliveries) * 100).toFixed(1)) : 0, color: "#10B981" },
      { id: "dp-canc", label: "Cancelled Trips", value: cancelledDeliveries, percentage: totalDeliveries > 0 ? Number(((cancelledDeliveries / totalDeliveries) * 100).toFixed(1)) : 0, color: "#EF4444" },
    ];

    const topPartners = partners.map((dp) => ({
      id: dp.id,
      name: dp.fullName,
      city: dp.city,
      vehicleType: dp.vehicleType,
      completedDeliveries: dp.completedDeliveries,
      cancelledDeliveries: dp.cancelledDeliveries,
      rating: dp.rating,
      earnings: dp.totalEarnings,
      lastActive: dp.lastActiveAt || dp.updatedAt,
    }));

    return {
      kpis: {
        totalPartners: createKpi("dp-total", "Fleet Size", totalPartners, Math.round(totalPartners * 0.9), formatCount),
        activePartners: createKpi("dp-active", "Active Valets", activePartners, Math.round(activePartners * 0.95), formatCount),
        approvedPartners: createKpi("dp-approved", "Verified Partners", approvedPartners, Math.round(approvedPartners * 0.95), formatCount),
        pendingApproval: createKpi("dp-pending", "Pending Onboarding", pendingApproval, 2, formatCount),
        suspendedPartners: createKpi("dp-suspended", "Suspended Valets", suspendedPartners, 0, formatCount, true),
        totalDeliveries: createKpi("dp-total-trips", "Total Assigned Trips", totalDeliveries, Math.round(totalDeliveries * 0.85), formatCount),
        completedDeliveries: createKpi("dp-comp-trips", "Completed Deliveries", completedDeliveries, Math.round(completedDeliveries * 0.85), formatCount),
        cancelledDeliveries: createKpi("dp-canc-trips", "Failed / Cancelled Trips", cancelledDeliveries, 1, formatCount, true),
        averageRating: createKpi("dp-avg-rating", "Average Delivery Rating", avgRating, 4.8, (v) => `${v.toFixed(1)} ★`),
        totalEarnings: createKpi("dp-earnings", "Partner Payout Turnover", totalEarnings, Math.round(totalEarnings * 0.9), formatINR),
      },
      deliveriesTrend,
      cityDistribution,
      vehicleDistribution,
      statusDistribution,
      topPartners,
    };
  }

  /**
   * 7. Service Report Data
   */
  async getServicesReport(filter: AnalyticsFilter): Promise<ServicesReportData> {
    const orgId = filter.organizationId;
    const services = getMockServicesByOrg(orgId);
    const bookings = getMockBookingsByOrg(orgId);

    const totalServices = services.length;
    const activeServices = services.filter((s) => s.status === "Active").length;
    const inactiveServices = services.filter((s) => s.status === "Inactive").length;
    const archivedServices = services.filter((s) => s.status === "Archived").length;

    const totalBookingsCount = bookings.length;
    const mostBooked = services[0]?.name || "Premium Wash & Fold";
    const highestRated = services[1]?.name || "Express Dry Cleaning";

    const catMap = new Map<string, number>();
    services.forEach((s) => catMap.set(s.category, (catMap.get(s.category) || 0) + 1));
    const categoryBookingsDistribution = Array.from(catMap.entries()).map(([label, val], idx) => ({
      id: `scat-${idx}`,
      label,
      value: val * 8,
      percentage: Number(((val / totalServices) * 100).toFixed(1)),
    }));

    const categoryRevenueDistribution = Array.from(catMap.entries()).map(([label, val], idx) => ({
      id: `srev-${idx}`,
      label,
      value: val * 4500,
      formattedValue: formatINR(val * 4500),
      percentage: Number(((val / totalServices) * 100).toFixed(1)),
    }));

    const servicePopularityTrend: AnalyticsTimePoint[] = [
      { date: "2026-09-01", label: "01 Sep", value: 12 },
      { date: "2026-09-05", label: "05 Sep", value: 24 },
      { date: "2026-09-10", label: "10 Sep", value: totalBookingsCount },
    ];

    const ratingDistribution: AnalyticsBreakdownItem[] = [
      { id: "sr-5", label: "5.0 ★", value: 6, percentage: 50, color: "#10B981" },
      { id: "sr-4", label: "4.8 ★", value: 4, percentage: 35, color: "#3B82F6" },
      { id: "sr-3", label: "4.5 ★", value: 2, percentage: 15, color: "#F59E0B" },
    ];

    const topServices = services.map((s, idx) => {
      const bCount = (12 - idx) * 3 || 10;
      const comp = Math.round(bCount * 0.85);
      const canc = Math.round(bCount * 0.05);
      return {
        id: s.id,
        name: s.name,
        category: s.category,
        basePrice: s.basePrice,
        totalBookings: bCount,
        completed: comp,
        cancelled: canc,
        rating: 4.8,
        revenue: s.basePrice * bCount,
      };
    });

    return {
      kpis: {
        totalServices: createKpi("srv-total", "Total Catalog Items", totalServices, totalServices, formatCount),
        activeServices: createKpi("srv-active", "Active Services", activeServices, activeServices, formatCount),
        inactiveServices: createKpi("srv-inactive", "Paused Catalog Items", inactiveServices, inactiveServices, formatCount),
        archivedServices: createKpi("srv-archived", "Archived Services", archivedServices, 0, formatCount),
        totalBookings: createKpi("srv-bkg", "Catalog Order Volume", totalBookingsCount, Math.round(totalBookingsCount * 0.9), formatCount),
        mostBookedServiceName: mostBooked,
        highestRatedServiceName: highestRated,
      },
      categoryBookingsDistribution,
      categoryRevenueDistribution,
      servicePopularityTrend,
      ratingDistribution,
      topServices,
    };
  }

  /**
   * 8. Operations Report Data
   */
  async getOperationsReport(filter: AnalyticsFilter): Promise<OperationsReportData> {
    const orgId = filter.organizationId;
    const assignments = getMockAssignmentsByOrg(orgId);
    const providers = getMockProvidersByOrg(orgId);
    const deliveryPartners = getMockDeliveryPartnersByOrg(orgId);

    const needsAssignment = assignments.filter((a) => !a.providerId || !a.deliveryPartnerId).length || 4;
    const providerAssigned = assignments.filter((a) => Boolean(a.providerId)).length || 18;
    const deliveryPending = assignments.filter((a) => !a.deliveryPartnerId).length || 3;
    const inProgress = assignments.filter((a) => Boolean(a.providerId) && Boolean(a.deliveryPartnerId)).length || 15;
    const completedToday = 12;
    const cancelledToday = 1;

    const providerAssignmentRate = assignments.length > 0 ? Number(((providerAssigned / assignments.length) * 100).toFixed(1)) : 92.5;
    const deliveryAssignmentRate = assignments.length > 0 ? Number((((assignments.length - deliveryPending) / assignments.length) * 100).toFixed(1)) : 88.0;

    const assignmentStatusTrend: AnalyticsTimePoint[] = [
      { date: "2026-09-01", label: "01 Sep", value: 14, secondaryValue: 2 },
      { date: "2026-09-05", label: "05 Sep", value: 18, secondaryValue: 3 },
      { date: "2026-09-10", label: "10 Sep", value: 22, secondaryValue: 1 },
    ];

    const operationalFunnel = [
      { stage: "Orders Placed", count: 35, percentage: 100, description: "Total customer bookings queued for processing" },
      { stage: "Provider Accepted", count: 32, percentage: 91.4, description: "Facility capacity confirmed" },
      { stage: "Valet Dispatched", count: 29, percentage: 82.8, description: "Pickup underway or in transit" },
      { stage: "Order Completed", count: 26, percentage: 74.3, description: "Cleaned, inspected and returned" },
    ];

    // Workload thresholds: 0-2 (Low), 3-5 (Medium), 6+ (High)
    const providerWorkload = [
      { workloadLevel: "Low (0-2)" as const, providerCount: Math.round(providers.length * 0.5) || 4, percentage: 50 },
      { workloadLevel: "Medium (3-5)" as const, providerCount: Math.round(providers.length * 0.35) || 3, percentage: 35 },
      { workloadLevel: "High (6+)" as const, providerCount: Math.round(providers.length * 0.15) || 1, percentage: 15 },
    ];

    const deliveryPartnerWorkload = [
      { workloadLevel: "Low (0-2)" as const, partnerCount: Math.round(deliveryPartners.length * 0.45) || 4, percentage: 45 },
      { workloadLevel: "Medium (3-5)" as const, partnerCount: Math.round(deliveryPartners.length * 0.4) || 4, percentage: 40 },
      { workloadLevel: "High (6+)" as const, partnerCount: Math.round(deliveryPartners.length * 0.15) || 2, percentage: 15 },
    ];

    return {
      kpis: {
        needsAssignment: createKpi("ops-needs-assign", "Action Needed / Unassigned", needsAssignment, 6, formatCount, true),
        providerAssigned: createKpi("ops-prov-assigned", "Provider Active Orders", providerAssigned, 16, formatCount),
        deliveryPending: createKpi("ops-dp-pending", "Valet Pending Queue", deliveryPending, 4, formatCount, true),
        inProgress: createKpi("ops-in-progress", "Active Hub Processing", inProgress, 14, formatCount),
        completedToday: createKpi("ops-comp-today", "Turnaround Today", completedToday, 10, formatCount),
        cancelledToday: createKpi("ops-canc-today", "Dropouts Today", cancelledToday, 2, formatCount, true),
        providerAssignmentRate: createKpi("ops-prov-rate", "Facility Fill Rate", providerAssignmentRate, 90.0, formatPercent),
        deliveryAssignmentRate: createKpi("ops-dp-rate", "Logistics Dispatch Rate", deliveryAssignmentRate, 85.0, formatPercent),
      },
      assignmentStatusTrend,
      operationalFunnel,
      providerWorkload,
      deliveryPartnerWorkload,
    };
  }

  /**
   * 9. Review & Rating Report Data
   */
  async getReviewsReport(filter: AnalyticsFilter): Promise<ReviewsReportData> {
    const orgId = filter.organizationId;
    const reviews = getMockReviewsByOrg(orgId);

    const totalReviews = reviews.length;
    // CRITICAL: Only Published and Restored contribute to customer-facing rating
    const validReviews = reviews.filter((r) => r.status === "Published" || r.status === "Restored");
    const avgRating = validReviews.length > 0
      ? Number((validReviews.reduce((sum, r) => sum + r.rating, 0) / validReviews.length).toFixed(1))
      : 4.8;

    const fiveStar = validReviews.filter((r) => r.rating === 5).length;
    const fourStar = validReviews.filter((r) => r.rating === 4).length;
    const threeStar = validReviews.filter((r) => r.rating === 3).length;
    const twoStar = validReviews.filter((r) => r.rating === 2).length;
    const oneStar = validReviews.filter((r) => r.rating === 1).length;

    const publishedCount = reviews.filter((r) => r.status === "Published" || r.status === "Restored").length;
    const flaggedCount = reviews.filter((r) => r.status === "Flagged").length;
    const hiddenCount = reviews.filter((r) => r.status === "Hidden").length;

    const ratingDistribution: AnalyticsBreakdownItem[] = [
      { id: "rd-5", label: "5 Stars", value: fiveStar, percentage: validReviews.length > 0 ? Number(((fiveStar / validReviews.length) * 100).toFixed(1)) : 0, color: "#10B981" },
      { id: "rd-4", label: "4 Stars", value: fourStar, percentage: validReviews.length > 0 ? Number(((fourStar / validReviews.length) * 100).toFixed(1)) : 0, color: "#3B82F6" },
      { id: "rd-3", label: "3 Stars", value: threeStar, percentage: validReviews.length > 0 ? Number(((threeStar / validReviews.length) * 100).toFixed(1)) : 0, color: "#F59E0B" },
      { id: "rd-2", label: "2 Stars", value: twoStar, percentage: validReviews.length > 0 ? Number(((twoStar / validReviews.length) * 100).toFixed(1)) : 0, color: "#FB923C" },
      { id: "rd-1", label: "1 Star", value: oneStar, percentage: validReviews.length > 0 ? Number(((oneStar / validReviews.length) * 100).toFixed(1)) : 0, color: "#EF4444" },
    ];

    const reviewsTrend: AnalyticsTimePoint[] = [
      { date: "2026-09-01", label: "01 Sep", value: Math.max(1, Math.round(totalReviews * 0.1)) },
      { date: "2026-09-04", label: "04 Sep", value: Math.max(2, Math.round(totalReviews * 0.35)) },
      { date: "2026-09-07", label: "07 Sep", value: Math.max(3, Math.round(totalReviews * 0.7)) },
      { date: "2026-09-10", label: "10 Sep", value: totalReviews },
    ];

    const averageRatingTrend: AnalyticsTimePoint[] = [
      { date: "2026-09-01", label: "01 Sep", value: 4.7 },
      { date: "2026-09-04", label: "04 Sep", value: 4.8 },
      { date: "2026-09-07", label: "07 Sep", value: 4.75 },
      { date: "2026-09-10", label: "10 Sep", value: avgRating },
    ];

    const bookings = getMockBookingsByOrg(orgId);
    const customers = getMockCustomersByOrg(orgId);
    const providers = getMockProvidersByOrg(orgId);
    const services = getMockServicesByOrg(orgId);

    const catReviewsMap = new Map<string, number>();
    validReviews.forEach((r) => {
      const s = services.find((item) => item.id === r.serviceId);
      const cat = s?.category || "Home Cleaning";
      catReviewsMap.set(cat, (catReviewsMap.get(cat) || 0) + 1);
    });
    const categoryReviewsDistribution = Array.from(catReviewsMap.entries()).map(([label, val], idx) => ({
      id: `crev-${idx}`,
      label,
      value: val,
      percentage: validReviews.length > 0 ? Number(((val / validReviews.length) * 100).toFixed(1)) : 0,
    }));

    const recentReviewsBreakdown = reviews.slice(0, 10).map((r) => {
      const b = bookings.find((item) => item.id === r.bookingId);
      const c = customers.find((item) => item.id === r.customerId);
      const p = providers.find((item) => item.id === r.providerId);
      return {
        id: r.id,
        bookingNumber: b?.bookingNumber || r.bookingId,
        customerName: c?.fullName || "Customer",
        providerName: p?.fullName || p?.businessName || "Facility",
        rating: r.rating,
        status: r.status,
        comment: r.comment,
        createdAt: r.createdAt,
      };
    });

    return {
      kpis: {
        totalReviews: createKpi("rev-total-count", "Total Feedback Records", totalReviews, Math.round(totalReviews * 0.9), formatCount),
        averageRating: createKpi("rev-avg-score", "Customer Sentiment Index", avgRating, 4.7, (v) => `${v.toFixed(1)} ★`),
        fiveStar: createKpi("rev-5star", "5-Star Ratings", fiveStar, Math.round(fiveStar * 0.9), formatCount),
        fourStar: createKpi("rev-4star", "4-Star Ratings", fourStar, Math.round(fourStar * 0.9), formatCount),
        threeStar: createKpi("rev-3star", "3-Star Ratings", threeStar, 2, formatCount),
        twoStar: createKpi("rev-2star", "2-Star Ratings", twoStar, 1, formatCount, true),
        oneStar: createKpi("rev-1star", "1-Star Ratings", oneStar, 0, formatCount, true),
        publishedCount: createKpi("rev-pub", "Publicly Active Reviews", publishedCount, Math.round(publishedCount * 0.9), formatCount),
        flaggedCount: createKpi("rev-flagged", "Flagged for Moderation", flaggedCount, 2, formatCount, true),
        hiddenCount: createKpi("rev-hidden", "Suppressed / Hidden", hiddenCount, 1, formatCount, true),
      },
      ratingDistribution,
      reviewsTrend,
      averageRatingTrend,
      categoryReviewsDistribution,
      recentReviewsBreakdown,
    };
  }
}

export const adminAnalyticsService = new AdminAnalyticsService();
