import {
  BookingAssignment,
  OperationalBookingView,
  CandidateProvider,
  CandidateDeliveryPartner,
  OperationsSummaryMetrics,
  ListOperationsParams,
  ListOperationsResult,
  calculateWorkloadLevel,
  isDeliveryCoordinationRequired,
  AssignmentActivity,
} from "@/types/admin/operations";
import { getMockBookingsByOrg } from "@/mocks/admin/booking.mock";
import { getMockCustomersByOrg } from "@/mocks/admin/customer.mock";
import { getMockProvidersByOrg } from "@/mocks/admin/provider.mock";
import { getMockDeliveryPartnersByOrg } from "@/mocks/admin/deliveryPartner.mock";
import { getMockServicesByOrg } from "@/mocks/admin/serviceCatalog.mock";
import {
  getMockAssignmentsByOrg,
  getMockAssignmentByBookingId,
  getMockAssignmentActivities,
  assignProviderInStore,
  reassignProviderInStore,
  unassignProviderInStore,
  assignDeliveryPartnerInStore,
  reassignDeliveryPartnerInStore,
  unassignDeliveryPartnerInStore,
} from "@/mocks/admin/operations.mock";
import { createMockNotificationInStore } from "@/mocks/admin/notification.mock";
import { isLiveMode } from "@/lib/api/mode";
import { adminApi } from "@/features/admin/api/adminApi";

function resolveOrgAndBookingId(
  arg1: string,
  arg2?: string
): { organizationId: string; bookingId: string } {
  if (arg1.startsWith("ORG-")) {
    return { organizationId: arg1, bookingId: arg2 || "" };
  }
  const bookingId = arg1;
  if (arg2 && arg2.startsWith("ORG-")) {
    return { organizationId: arg2, bookingId };
  }

  // Auto-detect organization from booking id
  const org2Bookings = getMockBookingsByOrg("ORG-0002");
  if (org2Bookings.some((b) => b.id === bookingId)) {
    return { organizationId: "ORG-0002", bookingId };
  }
  return { organizationId: "ORG-0001", bookingId };
}

export interface IAdminOperationsService {
  listOperationalBookings(params: ListOperationsParams): Promise<ListOperationsResult>;
  getOperationalBookingDetail(
    organizationIdOrBookingId: string,
    bookingIdOrOrgId?: string
  ): Promise<OperationalBookingView | null>;
  getEligibleProviders(
    organizationIdOrBookingId: string,
    bookingIdOrOrgId?: string
  ): Promise<CandidateProvider[]>;
  getEligibleDeliveryPartners(
    organizationIdOrBookingId: string,
    bookingIdOrOrgId?: string
  ): Promise<CandidateDeliveryPartner[]>;
  assignProvider(
    arg1: string,
    arg2: string,
    arg3?: string,
    arg4?: string,
    arg5?: string
  ): Promise<BookingAssignment>;
  reassignProvider(
    arg1: string,
    arg2: string,
    arg3?: string,
    arg4?: string,
    arg5?: string
  ): Promise<BookingAssignment>;
  unassignProvider(
    arg1: string,
    arg2?: string,
    arg3?: string,
    arg4?: string
  ): Promise<BookingAssignment>;
  assignDeliveryPartner(
    arg1: string,
    arg2: string,
    arg3?: string,
    arg4?: string,
    arg5?: string
  ): Promise<BookingAssignment>;
  reassignDeliveryPartner(
    arg1: string,
    arg2: string,
    arg3?: string,
    arg4?: string,
    arg5?: string
  ): Promise<BookingAssignment>;
  unassignDeliveryPartner(
    arg1: string,
    arg2?: string,
    arg3?: string,
    arg4?: string
  ): Promise<BookingAssignment>;
  getAssignmentActivities(
    organizationIdOrBookingId: string,
    bookingIdOrOrgId?: string
  ): Promise<AssignmentActivity[]>;
}

class AdminOperationsService implements IAdminOperationsService {
  async listOperationalBookings(
    params: ListOperationsParams
  ): Promise<ListOperationsResult> {
    await new Promise((res) => setTimeout(res, 40));

    const {
      organizationId,
      search = "",
      category = "all",
      city = "all",
      providerId = "all",
      deliveryPartnerId = "all",
      date = "all",
      page = 1,
      pageSize = 10,
    } = params;

    const queueTab = params.queueTab || params.tab || "all";
    const assignmentStatus = params.assignmentStatus || params.asnStatus || "all";
    const bookingStatus = params.bookingStatus || params.bkgStatus || "all";
    const sort = params.sort || params.sortBy || "scheduledAt";
    const sortDirection = params.sortDirection || params.sortDir || "asc";

    // 1. Load canonical datasets for organization
    const bookings = getMockBookingsByOrg(organizationId);
    const customers = getMockCustomersByOrg(organizationId);
    const providers = getMockProvidersByOrg(organizationId);
    const deliveryPartners = getMockDeliveryPartnersByOrg(organizationId);
    const services = getMockServicesByOrg(organizationId);
    const assignments = getMockAssignmentsByOrg(organizationId);

    // Build fast lookup maps
    const customerMap = new Map(customers.map((c) => [c.id, c]));
    const providerMap = new Map(providers.map((p) => [p.id, p]));
    const deliveryMap = new Map(deliveryPartners.map((d) => [d.id, d]));
    const serviceMap = new Map(services.map((s) => [s.id, s]));
    const assignmentMap = new Map(assignments.map((a) => [a.bookingId, a]));

    // Calculate active workloads across organization
    const providerActiveCounts = new Map<string, number>();
    const deliveryActiveCounts = new Map<string, number>();

    bookings.forEach((bkg) => {
      if (bkg.status === "confirmed" || bkg.status === "in_progress") {
        const asn = assignmentMap.get(bkg.id);
        const pId = asn?.providerId || bkg.providerId;
        if (pId) {
          providerActiveCounts.set(pId, (providerActiveCounts.get(pId) || 0) + 1);
        }
        if (asn?.deliveryPartnerId) {
          deliveryActiveCounts.set(
            asn.deliveryPartnerId,
            (deliveryActiveCounts.get(asn.deliveryPartnerId) || 0) + 1
          );
        }
      }
    });

    // 2. Resolve aggregated OperationalBookingView items
    const allItems: OperationalBookingView[] = bookings.map((bkg) => {
      const asn =
        assignmentMap.get(bkg.id) ||
        ({
          id: `ASN-${bkg.id}`,
          organizationId,
          bookingId: bkg.id,
          status: "Unassigned",
          createdAt: bkg.createdAt,
          updatedAt: bkg.updatedAt,
        } as BookingAssignment);

      const pId = asn.providerId || bkg.providerId;
      const resolvedProvider = pId ? providerMap.get(pId) || null : null;
      const resolvedDelivery = asn.deliveryPartnerId ? deliveryMap.get(asn.deliveryPartnerId) || null : null;
      const resolvedCustomer = customerMap.get(bkg.customerId) || null;
      const resolvedService = serviceMap.get(bkg.serviceId) || null;

      const deliveryRequired = isDeliveryCoordinationRequired(bkg.serviceCategory);

      const pWorkload = resolvedProvider
        ? calculateWorkloadLevel(providerActiveCounts.get(resolvedProvider.id) || 0)
        : undefined;

      const dWorkload = resolvedDelivery
        ? calculateWorkloadLevel(deliveryActiveCounts.get(resolvedDelivery.id) || 0)
        : undefined;

      const isConfirmed = bkg.status === "confirmed";
      const isInProgress = bkg.status === "in_progress";
      const isCompleted = bkg.status === "completed";
      const isCancelled = bkg.status === "cancelled";

      // Permission guards
      const canAssignProvider = isConfirmed && !asn.providerId;
      const canReassignProvider = isConfirmed && !!asn.providerId;
      const canUnassignProvider = isConfirmed && !!asn.providerId;

      const canAssignDeliveryPartner =
        deliveryRequired && (isConfirmed || isInProgress) && !asn.deliveryPartnerId;
      const canReassignDeliveryPartner =
        deliveryRequired && (isConfirmed || isInProgress) && !!asn.deliveryPartnerId;
      const canUnassignDeliveryPartner =
        deliveryRequired && !isCompleted && !isCancelled && !!asn.deliveryPartnerId;

      return {
        booking: bkg,
        assignment: asn,
        customer: resolvedCustomer,
        provider: resolvedProvider,
        deliveryPartner: resolvedDelivery,
        service: resolvedService,
        deliveryRequired,
        isDeliveryRequired: deliveryRequired,
        providerWorkload: pWorkload,
        deliveryWorkload: dWorkload,
        canAssignProvider,
        canReassignProvider,
        canUnassignProvider,
        canAssignDeliveryPartner,
        canReassignDeliveryPartner,
        canUnassignDeliveryPartner,
        activityCount: getMockAssignmentActivities(bkg.id).length,
      };
    });

    // 3. Calculate OperationsSummaryMetrics from all items
    const todayStr = new Date().toISOString().split("T")[0];

    const metrics: OperationsSummaryMetrics = {
      needsAssignment: allItems.filter(
        (i) =>
          i.booking.status === "confirmed" &&
          (!i.assignment.providerId || (i.deliveryRequired && !i.assignment.deliveryPartnerId))
      ).length,
      providerAssigned: allItems.filter(
        (i) =>
          i.booking.status === "confirmed" &&
          !!i.assignment.providerId &&
          (!i.deliveryRequired || !i.assignment.deliveryPartnerId)
      ).length,
      deliveryPending: allItems.filter(
        (i) =>
          (i.booking.status === "confirmed" || i.booking.status === "in_progress") &&
          i.deliveryRequired &&
          !!i.assignment.providerId &&
          !i.assignment.deliveryPartnerId
      ).length,
      inProgress: allItems.filter((i) => i.booking.status === "in_progress").length,
      completedToday: allItems.filter(
        (i) =>
          i.booking.status === "completed" &&
          i.booking.updatedAt.startsWith(todayStr)
      ).length,
      cancelledToday: allItems.filter(
        (i) =>
          i.booking.status === "cancelled" &&
          i.booking.updatedAt.startsWith(todayStr)
      ).length,
      total: allItems.length,
    };

    // 4. Apply Filters (AND semantics)
    const filtered = allItems.filter((item) => {
      const bkg = item.booking;
      const asn = item.assignment;

      // Queue Tab Filter
      if (queueTab === "needs_assignment") {
        if (
          bkg.status !== "confirmed" ||
          (asn.providerId && (!item.deliveryRequired || asn.deliveryPartnerId))
        ) {
          return false;
        }
      } else if (queueTab === "provider_assigned") {
        if (
          bkg.status !== "confirmed" ||
          !asn.providerId
        ) {
          return false;
        }
      } else if (queueTab === "active_operations") {
        if (bkg.status !== "in_progress") return false;
      }

      // Assignment State Filter
      if (assignmentStatus !== "all") {
        if (assignmentStatus === "Delivery Pending") {
          const isPendingDelivery =
            item.deliveryRequired &&
            (bkg.status === "confirmed" || bkg.status === "in_progress") &&
            asn.providerId &&
            !asn.deliveryPartnerId;
          if (!isPendingDelivery) return false;
        } else if ((assignmentStatus as string) === "Needs Assignment") {
          if (
            bkg.status !== "confirmed" ||
            (asn.providerId && (!item.deliveryRequired || asn.deliveryPartnerId))
          ) {
            return false;
          }
        } else if (asn.status !== assignmentStatus) {
          return false;
        }
      }

      // Booking Status Filter
      if (bookingStatus !== "all" && bkg.status !== bookingStatus) {
        return false;
      }

      // Category Filter
      if (category !== "all" && bkg.serviceCategory.toLowerCase() !== category.toLowerCase()) {
        return false;
      }

      // City Filter
      if (city !== "all" && bkg.address.city.toLowerCase() !== city.toLowerCase()) {
        return false;
      }

      // Provider Filter
      if (providerId !== "all") {
        if (providerId === "unassigned") {
          if (asn.providerId) return false;
        } else if (asn.providerId !== providerId) {
          return false;
        }
      }

      // Delivery Partner Filter
      if (deliveryPartnerId !== "all") {
        if (deliveryPartnerId === "unassigned") {
          if (asn.deliveryPartnerId) return false;
        } else if (asn.deliveryPartnerId !== deliveryPartnerId) {
          return false;
        }
      }

      // Date Preset Filter
      if (date !== "all") {
        const schedTime = new Date(bkg.scheduledAt).getTime();
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const oneDay = 24 * 60 * 60 * 1000;

        if (date === "today") {
          if (schedTime < startOfToday || schedTime >= startOfToday + oneDay) return false;
        } else if (date === "tomorrow") {
          if (schedTime < startOfToday + oneDay || schedTime >= startOfToday + 2 * oneDay) {
            return false;
          }
        } else if (date === "next_7_days") {
          if (schedTime < startOfToday || schedTime > startOfToday + 7 * oneDay) return false;
        } else if (date === "past_7_days") {
          if (schedTime > startOfToday + oneDay || schedTime < startOfToday - 7 * oneDay) {
            return false;
          }
        } else if (date === "past_30_days") {
          if (schedTime > startOfToday + oneDay || schedTime < startOfToday - 30 * oneDay) {
            return false;
          }
        }
      }

      // Search Filter
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const bkgIdMatch = bkg.id.toLowerCase().includes(q);
        const bkgNumberMatch = bkg.bookingNumber?.toLowerCase().includes(q);
        const custNameMatch = item.customer?.fullName.toLowerCase().includes(q);
        const custEmailMatch = item.customer?.email?.toLowerCase().includes(q);
        const custPhoneMatch = item.customer?.phone.toLowerCase().includes(q);
        const serviceNameMatch = bkg.serviceName.toLowerCase().includes(q);
        const provNameMatch = item.provider?.fullName.toLowerCase().includes(q);
        const delivNameMatch = item.deliveryPartner?.fullName.toLowerCase().includes(q);
        const areaMatch = bkg.address.area.toLowerCase().includes(q);
        const cityMatch = bkg.address.city.toLowerCase().includes(q);

        if (
          !bkgIdMatch &&
          !bkgNumberMatch &&
          !custNameMatch &&
          !custEmailMatch &&
          !custPhoneMatch &&
          !serviceNameMatch &&
          !provNameMatch &&
          !delivNameMatch &&
          !areaMatch &&
          !cityMatch
        ) {
          return false;
        }
      }

      return true;
    });

    // 5. Multi-field Sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sort as string) {
        case "bookingId":
        case "bookingNumber":
          comparison = a.booking.id.localeCompare(b.booking.id);
          break;
        case "customer":
        case "customerName":
          const cNameA = a.customer?.fullName || "";
          const cNameB = b.customer?.fullName || "";
          comparison = cNameA.localeCompare(cNameB);
          break;
        case "service":
          comparison = a.booking.serviceName.localeCompare(b.booking.serviceName);
          break;
        case "provider":
        case "providerName":
          const pNameA = a.provider?.fullName || "ZZZ";
          const pNameB = b.provider?.fullName || "ZZZ";
          comparison = pNameA.localeCompare(pNameB);
          break;
        case "deliveryPartner":
        case "deliveryPartnerName":
          const dNameA = a.deliveryPartner?.fullName || "ZZZ";
          const dNameB = b.deliveryPartner?.fullName || "ZZZ";
          comparison = dNameA.localeCompare(dNameB);
          break;
        case "assignmentStatus":
        case "assignmentState":
          comparison = a.assignment.status.localeCompare(b.assignment.status);
          break;
        case "createdAt":
          comparison =
            new Date(a.booking.createdAt).getTime() -
            new Date(b.booking.createdAt).getTime();
          break;
        case "updatedAt":
          comparison =
            new Date(a.booking.updatedAt).getTime() -
            new Date(b.booking.updatedAt).getTime();
          break;
        default:
          comparison =
            new Date(a.booking.scheduledAt).getTime() -
            new Date(b.booking.scheduledAt).getTime();
      }

      return sortDirection === "desc" ? -comparison : comparison;
    });

    // 6. Pagination
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const startIndex = (safePage - 1) * pageSize;
    const items = filtered.slice(startIndex, startIndex + pageSize);

    return {
      items,
      total,
      page: safePage,
      pageSize,
      totalPages,
      metrics,
    };
  }

  async getOperationalBookingDetail(
    organizationIdOrBookingId: string,
    bookingIdOrOrgId?: string
  ): Promise<OperationalBookingView | null> {
    await new Promise((res) => setTimeout(res, 30));

    const { organizationId, bookingId } = resolveOrgAndBookingId(
      organizationIdOrBookingId,
      bookingIdOrOrgId
    );

    const bookings = getMockBookingsByOrg(organizationId);
    const bkg = bookings.find((b) => b.id === bookingId);
    if (!bkg) return null;

    const customers = getMockCustomersByOrg(organizationId);
    const providers = getMockProvidersByOrg(organizationId);
    const deliveryPartners = getMockDeliveryPartnersByOrg(organizationId);
    const services = getMockServicesByOrg(organizationId);
    const asn =
      getMockAssignmentByBookingId(organizationId, bookingId) ||
      ({
        id: `ASN-${bkg.id}`,
        organizationId,
        bookingId: bkg.id,
        providerId: bkg.providerId,
        status: "Unassigned",
        createdAt: bkg.createdAt,
        updatedAt: bkg.updatedAt,
      } as BookingAssignment);

    const resolvedCustomer = customers.find((c) => c.id === bkg.customerId) || null;
    const pId = asn.providerId || bkg.providerId;
    const resolvedProvider = (pId && providers.find((p) => p.id === pId)) || null;
    const resolvedDelivery =
      (asn.deliveryPartnerId && deliveryPartners.find((d) => d.id === asn.deliveryPartnerId)) ||
      null;
    const resolvedService = services.find((s) => s.id === bkg.serviceId) || null;

    const deliveryRequired = isDeliveryCoordinationRequired(bkg.serviceCategory);

    // Active counts
    let providerActiveCount = 0;
    if (resolvedProvider) {
      providerActiveCount = bookings.filter(
        (b) =>
          (b.status === "confirmed" || b.status === "in_progress") &&
          (b.providerId === resolvedProvider.id ||
            getMockAssignmentByBookingId(organizationId, b.id)?.providerId === resolvedProvider.id)
      ).length;
    }

    let deliveryActiveCount = 0;
    if (resolvedDelivery) {
      deliveryActiveCount = bookings.filter(
        (b) =>
          (b.status === "confirmed" || b.status === "in_progress") &&
          getMockAssignmentByBookingId(organizationId, b.id)?.deliveryPartnerId === resolvedDelivery.id
      ).length;
    }

    const isConfirmed = bkg.status === "confirmed";
    const isInProgress = bkg.status === "in_progress";
    const isCompleted = bkg.status === "completed";
    const isCancelled = bkg.status === "cancelled";

    return {
      booking: bkg,
      assignment: asn,
      customer: resolvedCustomer,
      provider: resolvedProvider,
      deliveryPartner: resolvedDelivery,
      service: resolvedService,
      deliveryRequired,
      isDeliveryRequired: deliveryRequired,
      providerWorkload: resolvedProvider
        ? calculateWorkloadLevel(providerActiveCount)
        : undefined,
      deliveryWorkload: resolvedDelivery
        ? calculateWorkloadLevel(deliveryActiveCount)
        : undefined,
      canAssignProvider: isConfirmed && !asn.providerId,
      canReassignProvider: isConfirmed && !!asn.providerId,
      canUnassignProvider: isConfirmed && !!asn.providerId,
      canAssignDeliveryPartner:
        deliveryRequired && (isConfirmed || isInProgress) && !asn.deliveryPartnerId,
      canReassignDeliveryPartner:
        deliveryRequired && (isConfirmed || isInProgress) && !!asn.deliveryPartnerId,
      canUnassignDeliveryPartner:
        deliveryRequired && !isCompleted && !isCancelled && !!asn.deliveryPartnerId,
      activityCount: getMockAssignmentActivities(bkg.id).length,
    };
  }

  async getEligibleProviders(
    organizationIdOrBookingId: string,
    bookingIdOrOrgId?: string
  ): Promise<CandidateProvider[]> {
    await new Promise((res) => setTimeout(res, 30));

    const { organizationId, bookingId } = resolveOrgAndBookingId(
      organizationIdOrBookingId,
      bookingIdOrOrgId
    );

    const bookings = getMockBookingsByOrg(organizationId);
    const bkg = bookings.find((b) => b.id === bookingId);
    if (!bkg) return [];

    const allProviders = getMockProvidersByOrg(organizationId);

    // Count active assignments per provider in org
    const providerCounts = new Map<string, number>();
    bookings.forEach((b) => {
      if (b.status === "confirmed" || b.status === "in_progress") {
        const asn = getMockAssignmentByBookingId(organizationId, b.id);
        const pId = asn?.providerId || b.providerId;
        if (pId) {
          providerCounts.set(pId, (providerCounts.get(pId) || 0) + 1);
        }
      }
    });

    const candidates: CandidateProvider[] = allProviders
      .filter((p) => {
        // Must match organization
        if (p.organizationId !== organizationId) return false;
        // Must be Active
        if (p.status !== "active") return false;
        // Must be Approved
        if (p.approvalStatus !== "approved") return false;

        // Must support booking service category
        const catMatch = p.serviceCategories.some(
          (c) =>
            c.toLowerCase() === bkg.serviceCategory.toLowerCase() ||
            (bkg.serviceCategory.toLowerCase().includes("wash") && c.toLowerCase().includes("laundry")) ||
            (bkg.serviceCategory.toLowerCase().includes("laundry") && c.toLowerCase().includes("wash")) ||
            (bkg.serviceCategory.toLowerCase().includes("clean") && c.toLowerCase().includes("clean"))
        );
        if (!catMatch) return false;

        // Must operate in booking city
        if (p.city.toLowerCase() !== bkg.address.city.toLowerCase()) return false;

        return true;
      })
      .map((p) => {
        const activeCount = providerCounts.get(p.id) || 0;
        const workload = calculateWorkloadLevel(activeCount);
        const categoryMatch = true;
        const cityMatch = true;
        const areaMatch = p.serviceAreas.some(
          (a) =>
            a.toLowerCase().includes(bkg.address.area.toLowerCase()) ||
            bkg.address.area.toLowerCase().includes(a.toLowerCase())
        );

        const reasons: string[] = [
          "Active & Verified Provider",
          `Certified in ${bkg.serviceCategory}`,
          `Operates in ${bkg.address.city}`,
        ];
        if (areaMatch) {
          reasons.push(`Direct coverage for ${bkg.address.area}`);
        }
        reasons.push(`Current workload: ${workload} (${activeCount} active orders)`);

        return {
          provider: p,
          id: p.id,
          name: p.fullName,
          rating: p.rating,
          city: p.city,
          status: p.status,
          approvalStatus: p.approvalStatus,
          serviceCategories: p.serviceCategories,
          areasServed: p.serviceAreas,
          activeBookingsCount: activeCount,
          workload,
          workloadLevel: workload,
          categoryMatch,
          cityMatch,
          areaMatch,
          isEligible: true,
          eligibilityReasons: reasons,
        };
      });

    // Prioritization: Area match first, then Workload (Low > Medium > High), then Rating
    const workloadWeight: Record<string, number> = { Low: 1, Medium: 2, High: 3 };
    candidates.sort((a, b) => {
      if (a.areaMatch !== b.areaMatch) {
        return a.areaMatch ? -1 : 1;
      }
      if (workloadWeight[a.workload] !== workloadWeight[b.workload]) {
        return workloadWeight[a.workload] - workloadWeight[b.workload];
      }
      return b.provider.rating - a.provider.rating;
    });

    return candidates;
  }

  async getEligibleDeliveryPartners(
    organizationIdOrBookingId: string,
    bookingIdOrOrgId?: string
  ): Promise<CandidateDeliveryPartner[]> {
    await new Promise((res) => setTimeout(res, 30));

    const { organizationId, bookingId } = resolveOrgAndBookingId(
      organizationIdOrBookingId,
      bookingIdOrOrgId
    );

    const bookings = getMockBookingsByOrg(organizationId);
    const bkg = bookings.find((b) => b.id === bookingId);
    if (!bkg) return [];

    const allPartners = getMockDeliveryPartnersByOrg(organizationId);

    // Count active deliveries per partner in org
    const partnerCounts = new Map<string, number>();
    bookings.forEach((b) => {
      if (b.status === "confirmed" || b.status === "in_progress") {
        const asn = getMockAssignmentByBookingId(organizationId, b.id);
        if (asn?.deliveryPartnerId) {
          partnerCounts.set(
            asn.deliveryPartnerId,
            (partnerCounts.get(asn.deliveryPartnerId) || 0) + 1
          );
        }
      }
    });

    const candidates: CandidateDeliveryPartner[] = allPartners
      .filter((d) => {
        if (d.organizationId !== organizationId) return false;
        if (d.status !== "active") return false;
        if (d.approvalStatus !== "approved") return false;

        // City matching
        if (d.city.toLowerCase() !== bkg.address.city.toLowerCase()) return false;

        return true;
      })
      .map((d) => {
        const activeCount = partnerCounts.get(d.id) || 0;
        const workload = calculateWorkloadLevel(activeCount);
        const cityMatch = true;
        const areaMatch = d.serviceAreas.some(
          (a) =>
            a.toLowerCase().includes(bkg.address.area.toLowerCase()) ||
            bkg.address.area.toLowerCase().includes(a.toLowerCase())
        );

        const reasons: string[] = [
          "Active & Verified Valet",
          `Operates in ${bkg.address.city}`,
          `Vehicle: ${d.vehicleType.toUpperCase()} (${d.vehicleNumber})`,
        ];
        if (areaMatch) {
          reasons.push(`Direct zone coverage for ${bkg.address.area}`);
        }
        reasons.push(`Workload: ${workload} (${activeCount} active deliveries)`);

        return {
          deliveryPartner: d,
          id: d.id,
          name: d.fullName,
          rating: d.rating,
          city: d.city,
          status: d.status,
          approvalStatus: d.approvalStatus,
          vehicleType: d.vehicleType,
          vehicleNumber: d.vehicleNumber,
          phone: d.phone,
          serviceAreas: d.serviceAreas,
          activeDeliveriesCount: activeCount,
          workload,
          workloadLevel: workload,
          cityMatch,
          areaMatch,
          isEligible: true,
          eligibilityReasons: reasons,
        };
      });

    const workloadWeight: Record<string, number> = { Low: 1, Medium: 2, High: 3 };
    candidates.sort((a, b) => {
      if (a.areaMatch !== b.areaMatch) {
        return a.areaMatch ? -1 : 1;
      }
      if (workloadWeight[a.workload] !== workloadWeight[b.workload]) {
        return workloadWeight[a.workload] - workloadWeight[b.workload];
      }
      return b.deliveryPartner.rating - a.deliveryPartner.rating;
    });

    return candidates;
  }

  async assignProvider(
    arg1: string,
    arg2: string,
    arg3?: string,
    arg4?: string,
    arg5?: string
  ): Promise<BookingAssignment> {
    let organizationId = "ORG-0001";
    let bookingId = "";
    let providerId = "";
    let assignedBy = "Admin Operations";
    let notes: string | undefined = undefined;

    if (arg1.startsWith("ORG-")) {
      organizationId = arg1;
      bookingId = arg2;
      providerId = arg3 || "";
      assignedBy = arg4 || "Admin Operations";
      notes = arg5;
    } else {
      bookingId = arg1;
      organizationId = resolveOrgAndBookingId(bookingId).organizationId;
      providerId = arg2;
      assignedBy = arg3 || "Admin Operations";
      notes = arg4;
    }

    if (isLiveMode()) {
      const res = await adminApi.assignments.reassign(bookingId, {
        providerId,
        reason: notes || "Assigned by operations lead",
      });
      const data = res.data;
      return {
        id: data.id || `ASN-${bookingId}`,
        organizationId,
        bookingId,
        providerId: data.providerId || providerId,
        status: data.status || "Assigned",
        assignedBy,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      } as any;
    }

    await new Promise((res) => setTimeout(res, 40));

    const bookings = getMockBookingsByOrg(organizationId);
    const bkg = bookings.find((b) => b.id === bookingId);
    if (!bkg) {
      throw new Error(`Booking ${bookingId} not found in organization ${organizationId}`);
    }

    if (bkg.status !== "confirmed") {
      throw new Error(
        `Cannot assign provider: Booking is in ${bkg.status} state. Only Confirmed bookings can be assigned.`
      );
    }

    const providers = getMockProvidersByOrg(organizationId);
    const provider = providers.find((p) => p.id === providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not found or belongs to another organization`);
    }
    if (provider.status !== "active" || provider.approvalStatus !== "approved") {
      throw new Error(`Provider ${providerId} is not active and approved for operations`);
    }

    const result = assignProviderInStore(organizationId, bookingId, providerId, assignedBy, notes);

    createMockNotificationInStore({
      organizationId,
      type: "Assignment",
      priority: "Normal",
      title: `Provider assigned to ${bookingId}`,
      message: `Provider ${provider.fullName} (${provider.businessName || providerId}) was assigned to booking ${bookingId} by ${assignedBy}.`,
      relatedEntityType: "Assignment",
      relatedEntityId: bookingId,
      actionRoute: `/admin/operations/${bookingId}`,
      actorName: assignedBy,
    });

    return result;
  }

  async reassignProvider(
    arg1: string,
    arg2: string,
    arg3?: string,
    arg4?: string,
    arg5?: string
  ): Promise<BookingAssignment> {
    let organizationId = "ORG-0001";
    let bookingId = "";
    let newProviderId = "";
    let assignedBy = "Admin Operations";
    let notes: string | undefined = undefined;

    if (arg1.startsWith("ORG-")) {
      organizationId = arg1;
      bookingId = arg2;
      newProviderId = arg3 || "";
      assignedBy = arg4 || "Admin Operations";
      notes = arg5;
    } else {
      bookingId = arg1;
      organizationId = resolveOrgAndBookingId(bookingId).organizationId;
      newProviderId = arg2;
      assignedBy = arg3 || "Admin Operations";
      notes = arg4;
    }

    if (isLiveMode()) {
      const res = await adminApi.assignments.reassign(bookingId, {
        providerId: newProviderId,
        reason: notes || "Reassigned by operations lead",
      });
      const data = res.data;
      return {
        id: data.id || `ASN-${bookingId}`,
        organizationId,
        bookingId,
        providerId: data.providerId || newProviderId,
        status: data.status || "Assigned",
        assignedBy,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      } as any;
    }

    await new Promise((res) => setTimeout(res, 40));

    const bookings = getMockBookingsByOrg(organizationId);
    const bkg = bookings.find((b) => b.id === bookingId);
    if (!bkg) {
      throw new Error(`Booking ${bookingId} not found in organization ${organizationId}`);
    }

    // Provider reassignment is locked once in_progress, completed, or cancelled
    if (bkg.status !== "confirmed") {
      throw new Error(
        `Cannot reassign provider: Booking is in ${bkg.status} state. Provider reassignment is locked once service is in progress or finished.`
      );
    }

    const providers = getMockProvidersByOrg(organizationId);
    const provider = providers.find((p) => p.id === newProviderId);
    if (!provider) {
      throw new Error(`Provider ${newProviderId} not found or belongs to another organization`);
    }
    if (provider.status !== "active" || provider.approvalStatus !== "approved") {
      throw new Error(`Provider ${newProviderId} is not active and approved for operations`);
    }

    const result = reassignProviderInStore(organizationId, bookingId, newProviderId, assignedBy, notes);

    createMockNotificationInStore({
      organizationId,
      type: "Assignment",
      priority: "Normal",
      title: `Provider reassigned for ${bookingId}`,
      message: `Booking ${bookingId} was reassigned to provider ${provider.fullName} (${provider.businessName || newProviderId}) by ${assignedBy}.`,
      relatedEntityType: "Assignment",
      relatedEntityId: bookingId,
      actionRoute: `/admin/operations/${bookingId}`,
      actorName: assignedBy,
    });

    return result;
  }

  async unassignProvider(
    arg1: string,
    arg2?: string,
    arg3?: string,
    arg4?: string
  ): Promise<BookingAssignment> {
    let organizationId = "ORG-0001";
    let bookingId = "";
    let assignedBy = "Admin Operations";
    let notes: string | undefined = undefined;

    if (arg1.startsWith("ORG-")) {
      organizationId = arg1;
      bookingId = arg2 || "";
      assignedBy = arg3 || "Admin Operations";
      notes = arg4;
    } else {
      bookingId = arg1;
      organizationId = resolveOrgAndBookingId(bookingId).organizationId;
      assignedBy = arg2 || "Admin Operations";
      notes = arg3;
    }

    if (isLiveMode()) {
      const res = await adminApi.assignments.cancel(bookingId, {
        reason: notes || "Unassigned by operations lead",
      });
      const data = res.data;
      return {
        id: data.id || `ASN-${bookingId}`,
        organizationId,
        bookingId,
        providerId: undefined,
        status: "Unassigned",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as any;
    }

    await new Promise((res) => setTimeout(res, 40));

    const bookings = getMockBookingsByOrg(organizationId);
    const bkg = bookings.find((b) => b.id === bookingId);
    if (!bkg) {
      throw new Error(`Booking ${bookingId} not found in organization ${organizationId}`);
    }

    if (bkg.status !== "confirmed") {
      throw new Error(`Cannot unassign provider: Booking is in ${bkg.status} state.`);
    }

    return unassignProviderInStore(organizationId, bookingId, assignedBy, notes);
  }

  async assignDeliveryPartner(
    arg1: string,
    arg2: string,
    arg3?: string,
    arg4?: string,
    arg5?: string
  ): Promise<BookingAssignment> {
    let organizationId = "ORG-0001";
    let bookingId = "";
    let deliveryPartnerId = "";
    let assignedBy = "Admin Operations";
    let notes: string | undefined = undefined;

    if (arg1.startsWith("ORG-")) {
      organizationId = arg1;
      bookingId = arg2;
      deliveryPartnerId = arg3 || "";
      assignedBy = arg4 || "Admin Operations";
      notes = arg5;
    } else {
      bookingId = arg1;
      organizationId = resolveOrgAndBookingId(bookingId).organizationId;
      deliveryPartnerId = arg2;
      assignedBy = arg3 || "Admin Operations";
      notes = arg4;
    }

    if (isLiveMode()) {
      const res = await adminApi.assignments.reassign(bookingId, {
        deliveryPartnerId,
        reason: notes || "Valet assigned by operations",
      });
      const data = res.data;
      return {
        id: data.id || `ASN-${bookingId}`,
        organizationId,
        bookingId,
        deliveryPartnerId: data.deliveryPartnerId || deliveryPartnerId,
        status: data.status || "Assigned",
        assignedBy,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      } as any;
    }

    await new Promise((res) => setTimeout(res, 40));

    const bookings = getMockBookingsByOrg(organizationId);
    const bkg = bookings.find((b) => b.id === bookingId);
    if (!bkg) {
      throw new Error(`Booking ${bookingId} not found in organization ${organizationId}`);
    }

    if (!isDeliveryCoordinationRequired(bkg.serviceCategory)) {
      throw new Error(
        `Delivery partner assignment not required for category ${bkg.serviceCategory}`
      );
    }

    const partners = getMockDeliveryPartnersByOrg(organizationId);
    const partner = partners.find((d) => d.id === deliveryPartnerId);
    if (!partner) {
      throw new Error(`Delivery partner ${deliveryPartnerId} not found in organization`);
    }
    if (partner.status !== "active" || partner.approvalStatus !== "approved") {
      throw new Error(`Delivery partner ${deliveryPartnerId} is not active and approved`);
    }

    const result = assignDeliveryPartnerInStore(
      organizationId,
      bookingId,
      deliveryPartnerId,
      assignedBy,
      notes
    );

    createMockNotificationInStore({
      organizationId,
      type: "Assignment",
      priority: "Normal",
      title: `Valet assigned to ${bookingId}`,
      message: `Valet partner ${partner.fullName} (${deliveryPartnerId}) was assigned to booking ${bookingId} by ${assignedBy}.`,
      relatedEntityType: "Assignment",
      relatedEntityId: bookingId,
      actionRoute: `/admin/operations/${bookingId}`,
      actorName: assignedBy,
    });

    return result;
  }

  async reassignDeliveryPartner(
    arg1: string,
    arg2: string,
    arg3?: string,
    arg4?: string,
    arg5?: string
  ): Promise<BookingAssignment> {
    let organizationId = "ORG-0001";
    let bookingId = "";
    let newDeliveryPartnerId = "";
    let assignedBy = "Admin Operations";
    let notes: string | undefined = undefined;

    if (arg1.startsWith("ORG-")) {
      organizationId = arg1;
      bookingId = arg2;
      newDeliveryPartnerId = arg3 || "";
      assignedBy = arg4 || "Admin Operations";
      notes = arg5;
    } else {
      bookingId = arg1;
      organizationId = resolveOrgAndBookingId(bookingId).organizationId;
      newDeliveryPartnerId = arg2;
      assignedBy = arg3 || "Admin Operations";
      notes = arg4;
    }

    if (isLiveMode()) {
      const res = await adminApi.assignments.reassign(bookingId, {
        deliveryPartnerId: newDeliveryPartnerId,
        reason: notes || "Valet reassigned by operations",
      });
      const data = res.data;
      return {
        id: data.id || `ASN-${bookingId}`,
        organizationId,
        bookingId,
        deliveryPartnerId: data.deliveryPartnerId || newDeliveryPartnerId,
        status: data.status || "Assigned",
        assignedBy,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      } as any;
    }

    await new Promise((res) => setTimeout(res, 40));

    const bookings = getMockBookingsByOrg(organizationId);
    const bkg = bookings.find((b) => b.id === bookingId);
    if (!bkg) {
      throw new Error(`Booking ${bookingId} not found in organization ${organizationId}`);
    }

    if (bkg.status === "completed" || bkg.status === "cancelled") {
      throw new Error(`Cannot reassign delivery partner: Booking is ${bkg.status}`);
    }

    const partners = getMockDeliveryPartnersByOrg(organizationId);
    const partner = partners.find((d) => d.id === newDeliveryPartnerId);
    if (!partner) {
      throw new Error(`Delivery partner ${newDeliveryPartnerId} not found in organization`);
    }
    if (partner.status !== "active" || partner.approvalStatus !== "approved") {
      throw new Error(`Delivery partner ${newDeliveryPartnerId} is not active and approved`);
    }

    const result = reassignDeliveryPartnerInStore(
      organizationId,
      bookingId,
      newDeliveryPartnerId,
      assignedBy,
      notes
    );

    createMockNotificationInStore({
      organizationId,
      type: "Assignment",
      priority: "Normal",
      title: `Valet reassigned for ${bookingId}`,
      message: `Booking ${bookingId} valet was reassigned to ${partner.fullName} (${newDeliveryPartnerId}) by ${assignedBy}.`,
      relatedEntityType: "Assignment",
      relatedEntityId: bookingId,
      actionRoute: `/admin/operations/${bookingId}`,
      actorName: assignedBy,
    });

    return result;
  }

  async unassignDeliveryPartner(
    arg1: string,
    arg2?: string,
    arg3?: string,
    arg4?: string
  ): Promise<BookingAssignment> {
    let organizationId = "ORG-0001";
    let bookingId = "";
    let assignedBy = "Admin Operations";
    let notes: string | undefined = undefined;

    if (arg1.startsWith("ORG-")) {
      organizationId = arg1;
      bookingId = arg2 || "";
      assignedBy = arg3 || "Admin Operations";
      notes = arg4;
    } else {
      bookingId = arg1;
      organizationId = resolveOrgAndBookingId(bookingId).organizationId;
      assignedBy = arg2 || "Admin Operations";
      notes = arg3;
    }

    if (isLiveMode()) {
      const res = await adminApi.assignments.cancel(bookingId, {
        reason: notes || "Valet unassigned by operations",
      });
      const data = res.data;
      return {
        id: data.id || `ASN-${bookingId}`,
        organizationId,
        bookingId,
        deliveryPartnerId: undefined,
        status: "Unassigned",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as any;
    }

    await new Promise((res) => setTimeout(res, 40));

    const bookings = getMockBookingsByOrg(organizationId);
    const bkg = bookings.find((b) => b.id === bookingId);
    if (!bkg) {
      throw new Error(`Booking ${bookingId} not found in organization ${organizationId}`);
    }

    if (bkg.status === "completed") {
      throw new Error(`Cannot unassign delivery partner: Booking is completed`);
    }

    return unassignDeliveryPartnerInStore(organizationId, bookingId, assignedBy, notes);
  }

  async getAssignmentActivities(
    organizationIdOrBookingId: string,
    bookingIdOrOrgId?: string
  ): Promise<AssignmentActivity[]> {
    await new Promise((res) => setTimeout(res, 20));

    const { organizationId, bookingId } = resolveOrgAndBookingId(
      organizationIdOrBookingId,
      bookingIdOrOrgId
    );

    const bookings = getMockBookingsByOrg(organizationId);
    const bkg = bookings.find((b) => b.id === bookingId);
    if (!bkg) return [];

    return getMockAssignmentActivities(bookingId);
  }
}

export const adminOperationsService = new AdminOperationsService();
