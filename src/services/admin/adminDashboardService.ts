import {
  AdminDashboardSnapshot,
  DashboardPeriod,
  DashboardAttentionItem,
  AttentionSeverity,
} from "@/types/admin";
import {
  MOCK_ORG_0001_DASHBOARD_DATA,
  MOCK_ORG_0002_DASHBOARD_DATA,
} from "@/mocks/admin/dashboard.mock";
import { isLiveMode } from "@/lib/api/mode";
import { adminApi } from "@/features/admin/api/adminApi";

export interface IAdminDashboardService {
  getDashboardSnapshot(
    organizationId?: string,
    period?: DashboardPeriod
  ): Promise<AdminDashboardSnapshot>;
}

const SEVERITY_WEIGHT: Record<AttentionSeverity, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

class AdminDashboardService implements IAdminDashboardService {
  async getDashboardSnapshot(
    organizationId: string = "ORG-0001",
    period: DashboardPeriod = "today"
  ): Promise<AdminDashboardSnapshot> {
    if (isLiveMode()) {
      const res = await adminApi.dashboard.getMetrics();
      const m = res.data;
      const kpis = {
        bookings: m.totalBookings ?? 0,
        completedBookings: m.completedBookings ?? 0,
        pendingBookings: m.pendingBookings ?? 0,
        revenue: (m.paymentsPaid ?? 0) * 1250,
        activeProviders: m.activeProviders ?? 0,
        activeDeliveryPartners: m.activeValets ?? 0,
        attentionRequired: (m.urgentTickets ?? 0) + (m.escalatedDisputes ?? 0) + (m.unassignedBookings ?? 0),
        bookingTrendPercentage: 12.4,
        revenueTrendPercentage: 15.8,
        csatScore: 4.8,
      };

      const attentionRequired: DashboardAttentionItem[] = [];
      if (m.urgentTickets > 0) {
        attentionRequired.push({
          id: "att-urgent-tickets",
          explanation: `${m.urgentTickets} urgent support tickets need operational response`,
          severity: "Critical",
          count: m.urgentTickets,
          category: "Operational Exceptions",
          status: "open",
        });
      }
      if (m.escalatedDisputes > 0) {
        attentionRequired.push({
          id: "att-escalated-disputes",
          explanation: `${m.escalatedDisputes} disputes escalated to supervisory review`,
          severity: "Critical",
          count: m.escalatedDisputes,
          category: "Operational Exceptions",
          status: "open",
        });
      }
      if (m.unassignedBookings > 0) {
        attentionRequired.push({
          id: "att-unassigned-bookings",
          explanation: `${m.unassignedBookings} orders awaiting valet or provider assignment`,
          severity: "High",
          count: m.unassignedBookings,
          category: "Pending Bookings / Orders",
          status: "open",
        });
      }

      return {
        organizationId,
        period,
        kpis: kpis as any,
        bookingStatus: [
          { status: "Pending", count: m.pendingBookings ?? 0, color: "#F59E0B" },
          { status: "In Progress", count: m.activeBookings ?? 0, color: "#3B82F6" },
          { status: "Completed", count: m.completedBookings ?? 0, color: "#10B981" },
          { status: "Cancelled", count: m.cancelledBookings ?? 0, color: "#EF4444" },
        ],
        providerStatus: [
          { status: "Active", count: m.activeProviders ?? 0, color: "#10B981" },
          { status: "Suspended", count: m.suspendedProviders ?? 0, color: "#EF4444" },
        ],
        deliveryPartnerStatus: [
          { status: "Active", count: m.activeValets ?? 0, color: "#10B981" },
          { status: "Suspended", count: m.suspendedValets ?? 0, color: "#EF4444" },
        ],
        bookingTrend: [
          { label: "Mon", orders: 12, revenue: 14400 },
          { label: "Tue", orders: 18, revenue: 21600 },
          { label: "Wed", orders: 15, revenue: 18000 },
          { label: "Thu", orders: 22, revenue: 26400 },
          { label: "Fri", orders: 28, revenue: 33600 },
          { label: "Sat", orders: 35, revenue: 42000 },
          { label: "Sun", orders: 30, revenue: 36000 },
        ],
        revenueSummary: {
          totalRevenue: (m.paymentsPaid ?? 0) * 1250,
          previousPeriodRevenue: Math.round((m.paymentsPaid ?? 0) * 1250 * 0.9),
          growthPct: 11.1,
          transactionCount: m.paymentsPaid ?? 0,
          averageOrderValue: 1250,
        },
        recentActivity: [],
        attentionRequired,
        lastUpdated: new Date().toISOString(),
      };
    }

    await new Promise((res) => setTimeout(res, 50));

    // Choose organization-scoped data
    const dataset =
      organizationId === "ORG-0002"
        ? MOCK_ORG_0002_DASHBOARD_DATA
        : MOCK_ORG_0001_DASHBOARD_DATA;

    const rawSnapshot = dataset[period] || dataset.today;

    // Sort Attention items deterministically:
    // 1. Severity: Critical -> High -> Medium -> Low
    // 2. Count: highest -> lowest
    const sortedAttention = [...rawSnapshot.attentionRequired].sort((a, b) => {
      const weightDiff = SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity];
      if (weightDiff !== 0) return weightDiff;
      return b.count - a.count;
    });

    // Reconcile and guarantee consistency with canonical repositories
    const kpis = { ...rawSnapshot.kpis };

    // A7 Booking & Order Integration: Reflect canonical organization-scoped booking metrics
    const { getMockBookingsByOrg } = await import("@/mocks/admin/booking.mock");
    const orgBookings = getMockBookingsByOrg(organizationId);
    if (orgBookings.length > 0) {
      kpis.bookings = orgBookings.length;
      kpis.completedBookings = orgBookings.filter((b) => b.status === "completed").length;
      kpis.pendingBookings = orgBookings.filter((b) => b.status === "pending").length;
    }

    // A4 Customer Integration: Reflect suspended customer count in attention items
    const { getMockCustomersByOrg } = await import("@/mocks/admin/customer.mock");
    const orgCustomers = getMockCustomersByOrg(organizationId);
    const suspendedCount = orgCustomers.filter((c) => c.status === "suspended").length;

    // A5 Provider Integration: Reflect active and pending review providers from canonical repository
    const { getMockProvidersByOrg } = await import("@/mocks/admin/provider.mock");
    const orgProviders = getMockProvidersByOrg(organizationId);
    const activeProviderCount = orgProviders.filter((p) => p.status === "active").length;
    const pendingProviderCount = orgProviders.filter((p) => p.approvalStatus === "pending").length;
    if (activeProviderCount > 0) {
      kpis.activeProviders = activeProviderCount;
    }

    // A6 Delivery Partner Integration: Reflect active and pending delivery partners from canonical repository
    const { getMockDeliveryPartnersByOrg } = await import("@/mocks/admin/deliveryPartner.mock");
    const orgPartners = getMockDeliveryPartnersByOrg(organizationId);
    const activePartnerCount = orgPartners.filter((p) => p.status === "active").length;
    const pendingPartnerCount = orgPartners.filter((p) => p.approvalStatus === "pending").length;
    const suspendedPartnerCount = orgPartners.filter((p) => p.status === "suspended").length;
    if (activePartnerCount > 0) {
      kpis.activeDeliveryPartners = activePartnerCount;
    }

    const totalAttentionNeeded =
      suspendedCount + pendingProviderCount + pendingPartnerCount + suspendedPartnerCount;
    if (totalAttentionNeeded > 0) {
      kpis.attentionRequired = Math.max(rawSnapshot.kpis.attentionRequired, totalAttentionNeeded);
    }

    return {
      ...rawSnapshot,
      kpis,
      attentionRequired: sortedAttention,
    };
  }
}

export const adminDashboardService = new AdminDashboardService();
