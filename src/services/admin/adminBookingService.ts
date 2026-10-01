import {
  BookingOrder,
  BookingActivity,
  BookingStatus,
  BookingSummaryMetrics,
  ListBookingsParams,
  ListBookingsResult,
  BookingEditFormValues,
  ALLOWED_STATUS_TRANSITIONS,
} from "@/types/admin";
import {
  getMockBookingsByOrg,
  getMockBookingActivities,
  updateMockBookingInStore,
  updateMockBookingStatusInStore,
  addMockBookingActivity,
} from "@/mocks/admin/booking.mock";
import { getMockCustomersByOrg } from "@/mocks/admin/customer.mock";
import { getMockProvidersByOrg } from "@/mocks/admin/provider.mock";
import { createMockNotificationInStore } from "@/mocks/admin/notification.mock";
import { isLiveMode } from "@/lib/api/mode";
import { adminApi } from "@/features/admin/api/adminApi";

function mapBackendBookingToBookingOrder(b: any): BookingOrder {
  const statusMap: Record<string, BookingStatus> = {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    IN_PROGRESS: "in_progress",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
  };
  const status: BookingStatus = statusMap[b.status] || (b.status?.toLowerCase() as BookingStatus) || "pending";
  return {
    id: b.id,
    organizationId: b.organizationId || "ORG-0001",
    bookingNumber: b.bookingNumber || `BK-${b.id?.slice(0, 6).toUpperCase()}`,
    createdAt: b.createdAt || new Date().toISOString(),
    updatedAt: b.updatedAt || new Date().toISOString(),
    scheduledAt: b.scheduledDate ? `${b.scheduledDate}T${b.timeSlot || "10:00:00"}Z` : (b.scheduledAt || new Date().toISOString()),
    status,
    serviceId: b.serviceId || "SRV-001",
    serviceName: b.service?.name || b.serviceName || "Wash & Fold",
    serviceCategory: b.service?.category?.name || b.serviceCategory || "Laundry",
    customerId: b.customerId || "CUS-001",
    providerId: b.providerId || b.assignments?.[0]?.providerId || "PRO-0001",
    address: {
      addressLine1: b.pickupAddress?.addressLine1 || b.deliveryAddress?.addressLine1 || b.address?.addressLine1 || "123 Main Street",
      addressLine2: b.pickupAddress?.addressLine2 || b.deliveryAddress?.addressLine2,
      area: b.pickupAddress?.area || b.deliveryAddress?.area || "Bandra West",
      city: b.pickupAddress?.city || b.deliveryAddress?.city || "Mumbai",
      state: "Maharashtra",
      postalCode: b.pickupAddress?.postalCode || b.deliveryAddress?.postalCode || "400050",
      landmark: b.pickupAddress?.landmark || b.deliveryAddress?.landmark,
    },
    quantity: b.quantity || b.items?.length || 1,
    subtotal: Number(b.subtotal ?? b.totalAmount ?? 0),
    serviceFee: Number(b.serviceFee ?? 0),
    totalAmount: Number(b.totalAmount ?? 0),
    customerNotes: b.notes || b.customerNotes,
    lastUpdatedBy: b.lastUpdatedBy,
  };
}

export interface IAdminBookingService {
  listBookings(params: ListBookingsParams): Promise<ListBookingsResult>;
  getBookingById(organizationId: string, bookingId: string): Promise<BookingOrder | null>;
  updateBooking(
    organizationId: string,
    bookingId: string,
    payload: BookingEditFormValues,
    actorName?: string
  ): Promise<BookingOrder>;
  updateBookingStatus(
    organizationId: string,
    bookingId: string,
    newStatus: BookingStatus,
    actorName?: string,
    reason?: string
  ): Promise<BookingOrder>;
  getBookingActivity(organizationId: string, bookingId: string): Promise<BookingActivity[]>;
  getBookingSummaryMetrics(organizationId: string): Promise<BookingSummaryMetrics>;
}

class AdminBookingService implements IAdminBookingService {
  async listBookings(params: ListBookingsParams): Promise<ListBookingsResult> {
    if (isLiveMode()) {
      const res = await adminApi.bookings.list({
        page: params.page,
        limit: params.pageSize,
        search: params.search,
        status: params.status && params.status !== "all" ? (params.status as string).toUpperCase() : undefined,
      });
      const bookings = (res.data || []).map(mapBackendBookingToBookingOrder);
      const meta = res.meta || { page: params.page || 1, limit: params.pageSize || 10, total: bookings.length, totalPages: 1 };
      const mRes = await adminApi.dashboard.getMetrics().catch(() => ({ data: {} }));
      const m = mRes.data || {};
      return {
        bookings,
        total: meta.total,
        page: meta.page,
        pageSize: meta.limit,
        totalPages: meta.totalPages || Math.ceil(meta.total / (meta.limit || 10)),
        metrics: {
          total: m.totalBookings ?? bookings.length,
          pending: m.pendingBookings ?? 0,
          confirmed: m.activeBookings ?? 0,
          inProgress: m.activeBookings ?? 0,
          completed: m.completedBookings ?? 0,
          cancelled: m.cancelledBookings ?? 0,
        },
        availableCities: ["Mumbai", "Thane", "Navi Mumbai"],
        availableCategories: ["Laundry", "Dry Cleaning", "Steam Ironing"],
        availableProviders: [],
        availableCustomers: [],
      };
    }

    // Artificial mock network latency
    await new Promise((res) => setTimeout(res, 40));

    const {
      organizationId,
      search = "",
      status = "all",
      date = "all",
      serviceCategory = "all",
      city = "all",
      providerId = "all",
      customerId = "all",
      sort = "scheduledAt",
      sortDirection = "desc",
      page = 1,
      pageSize = 10,
    } = params;

    // 1. Strict organization scoping
    const orgBookings = getMockBookingsByOrg(organizationId);

    // Resolve customer and provider lookup maps for search and filtering
    const orgCustomers = getMockCustomersByOrg(organizationId);
    const orgProviders = getMockProvidersByOrg(organizationId);

    const customerMap = new Map(orgCustomers.map((c) => [c.id, c]));
    const providerMap = new Map(orgProviders.map((p) => [p.id, p]));

    // Calculate verified organization-wide metrics (unfiltered)
    const metrics: BookingSummaryMetrics = {
      total: orgBookings.length,
      pending: orgBookings.filter((b) => b.status === "pending").length,
      confirmed: orgBookings.filter((b) => b.status === "confirmed").length,
      inProgress: orgBookings.filter((b) => b.status === "in_progress").length,
      completed: orgBookings.filter((b) => b.status === "completed").length,
      cancelled: orgBookings.filter((b) => b.status === "cancelled").length,
    };

    // Available filter option lists (scoped to organization)
    const availableCities = Array.from(new Set(orgBookings.map((b) => b.address.city))).sort();
    const availableCategories = Array.from(
      new Set(orgBookings.map((b) => b.serviceCategory))
    ).sort();

    const availableProviders = Array.from(
      new Set(orgBookings.map((b) => b.providerId))
    )
      .map((pId) => {
        const p = providerMap.get(pId);
        return { id: pId, name: p ? (p.businessName || p.fullName) : pId };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    const availableCustomers = Array.from(
      new Set(orgBookings.map((b) => b.customerId))
    )
      .map((cId) => {
        const c = customerMap.get(cId);
        return { id: cId, name: c ? c.fullName : cId };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    // 2. Filter dataset using AND semantics
    let filtered = orgBookings.filter((b) => {
      // Search term
      if (search.trim()) {
        const term = search.toLowerCase().trim();
        const customer = customerMap.get(b.customerId);
        const provider = providerMap.get(b.providerId);

        const matchId = b.id.toLowerCase().includes(term);
        const matchNumber = b.bookingNumber.toLowerCase().includes(term);
        const matchService = b.serviceName.toLowerCase().includes(term);
        const matchCity = b.address.city.toLowerCase().includes(term);
        const matchCustomerName = customer ? customer.fullName.toLowerCase().includes(term) : false;
        const matchCustomerEmail = customer ? customer.email.toLowerCase().includes(term) : false;
        const matchProviderName = provider
          ? ((provider.businessName ? provider.businessName.toLowerCase().includes(term) : false) ||
             provider.fullName.toLowerCase().includes(term))
          : false;

        if (
          !matchId &&
          !matchNumber &&
          !matchService &&
          !matchCity &&
          !matchCustomerName &&
          !matchCustomerEmail &&
          !matchProviderName
        ) {
          return false;
        }
      }

      // Status filter
      if (status !== "all" && b.status !== status) {
        return false;
      }

      // Date preset filter (deterministic based on anchor date: 2026-09-06)
      if (date !== "all") {
        const scheduledTime = new Date(b.scheduledAt).getTime();
        // Anchor day boundary: 2026-09-06 00:00:00 UTC
        const todayStart = new Date("2026-09-06T00:00:00Z").getTime();
        const todayEnd = new Date("2026-09-06T23:59:59Z").getTime();
        const tomorrowStart = new Date("2026-09-07T00:00:00Z").getTime();
        const tomorrowEnd = new Date("2026-09-07T23:59:59Z").getTime();
        const next7DaysEnd = new Date("2026-09-13T23:59:59Z").getTime();
        const past7DaysStart = new Date("2026-08-30T00:00:00Z").getTime();
        const past30DaysStart = new Date("2026-08-07T00:00:00Z").getTime();

        if (date === "today") {
          if (scheduledTime < todayStart || scheduledTime > todayEnd) return false;
        } else if (date === "tomorrow") {
          if (scheduledTime < tomorrowStart || scheduledTime > tomorrowEnd) return false;
        } else if (date === "next_7_days") {
          if (scheduledTime < todayStart || scheduledTime > next7DaysEnd) return false;
        } else if (date === "past_7_days") {
          if (scheduledTime < past7DaysStart || scheduledTime > todayEnd) return false;
        } else if (date === "past_30_days") {
          if (scheduledTime < past30DaysStart || scheduledTime > todayEnd) return false;
        }
      }

      // Service category filter
      if (serviceCategory !== "all" && b.serviceCategory !== serviceCategory) {
        return false;
      }

      // City filter
      if (city !== "all" && b.address.city !== city) {
        return false;
      }

      // Provider filter
      if (providerId !== "all" && b.providerId !== providerId) {
        return false;
      }

      // Customer filter
      if (customerId !== "all" && b.customerId !== customerId) {
        return false;
      }

      return true;
    });

    // 3. Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sort) {
        case "bookingNumber":
          comparison = a.bookingNumber.localeCompare(b.bookingNumber);
          break;
        case "createdAt":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "scheduledAt":
          comparison = new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
          break;
        case "totalAmount":
          comparison = a.totalAmount - b.totalAmount;
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "serviceName":
          comparison = a.serviceName.localeCompare(b.serviceName);
          break;
        case "customerName": {
          const custA = customerMap.get(a.customerId)?.fullName || "";
          const custB = customerMap.get(b.customerId)?.fullName || "";
          comparison = custA.localeCompare(custB);
          break;
        }
        case "providerName": {
          const provA = providerMap.get(a.providerId)?.fullName || "";
          const provB = providerMap.get(b.providerId)?.fullName || "";
          comparison = provA.localeCompare(provB);
          break;
        }
        default:
          comparison = new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
      }

      return sortDirection === "desc" ? -comparison : comparison;
    });

    // 4. Pagination
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const startIndex = (safePage - 1) * pageSize;
    const paginatedBookings = filtered.slice(startIndex, startIndex + pageSize);

    return {
      bookings: paginatedBookings,
      total,
      page: safePage,
      pageSize,
      totalPages,
      metrics,
      availableCities,
      availableCategories,
      availableProviders,
      availableCustomers,
    };
  }

  async getBookingById(
    organizationId: string,
    bookingId: string
  ): Promise<BookingOrder | null> {
    if (isLiveMode()) {
      try {
        const res = await adminApi.bookings.getById(bookingId);
        return mapBackendBookingToBookingOrder(res.data);
      } catch {
        return null;
      }
    }

    await new Promise((res) => setTimeout(res, 30));

    // Scoped strictly to organization. Direct cross-org lookup returns null!
    const orgBookings = getMockBookingsByOrg(organizationId);
    const booking = orgBookings.find((b) => b.id === bookingId);
    if (!booking) {
      return null;
    }
    return JSON.parse(JSON.stringify(booking));
  }

  async updateBooking(
    organizationId: string,
    bookingId: string,
    payload: BookingEditFormValues,
    actorName: string = "Admin Operations"
  ): Promise<BookingOrder> {
    if (isLiveMode()) {
      if (payload.scheduledDate && payload.scheduledTime) {
        await adminApi.bookings.reschedule(bookingId, {
          date: payload.scheduledDate,
          timeSlot: payload.scheduledTime,
          reason: "Rescheduled by administrator",
        });
      }
      if (payload.customerNotes) {
        await adminApi.bookings.createNote(bookingId, {
          note: payload.customerNotes,
          isInternal: false,
        });
      }
      const res = await adminApi.bookings.getById(bookingId);
      return mapBackendBookingToBookingOrder(res.data);
    }

    await new Promise((res) => setTimeout(res, 50));

    const orgBookings = getMockBookingsByOrg(organizationId);
    const existing = orgBookings.find((b) => b.id === bookingId);
    if (!existing) {
      throw new Error(`Booking ${bookingId} not found in organization ${organizationId}`);
    }

    // Combine scheduled date and time into ISO string
    const scheduledAt = new Date(
      `${payload.scheduledDate}T${payload.scheduledTime}:00Z`
    ).toISOString();

    const updatedBooking: BookingOrder = {
      ...existing,
      scheduledAt,
      quantity: payload.quantity,
      address: {
        addressLine1: payload.addressLine1,
        addressLine2: payload.addressLine2,
        area: payload.area,
        city: payload.city,
        state: payload.state,
        postalCode: payload.postalCode,
        landmark: payload.landmark,
      },
      customerNotes: payload.customerNotes || undefined,
      lastUpdatedBy: actorName,
    };

    const saved = updateMockBookingInStore(organizationId, updatedBooking);

    // Audit activity record
    addMockBookingActivity({
      id: `ACT-${bookingId}-${Date.now()}`,
      bookingId,
      type: "booking_updated",
      description: `Booking updated by ${actorName}: Schedule updated to ${payload.scheduledDate} ${payload.scheduledTime}, quantity ${payload.quantity}`,
      timestamp: new Date().toISOString(),
      actorName,
      status: saved.status,
    });

    return JSON.parse(JSON.stringify(saved));
  }

  async updateBookingStatus(
    organizationId: string,
    bookingId: string,
    newStatus: BookingStatus,
    actorName: string = "Admin Operations",
    reason?: string
  ): Promise<BookingOrder> {
    if (isLiveMode()) {
      if (newStatus === "cancelled") {
        const res = await adminApi.bookings.cancel(bookingId, {
          reason: reason || "Cancelled by administrator",
        });
        return mapBackendBookingToBookingOrder(res.data);
      }
      const res = await adminApi.bookings.getById(bookingId);
      return mapBackendBookingToBookingOrder(res.data);
    }

    await new Promise((res) => setTimeout(res, 50));

    const orgBookings = getMockBookingsByOrg(organizationId);
    const existing = orgBookings.find((b) => b.id === bookingId);
    if (!existing) {
      throw new Error(`Booking ${bookingId} not found in organization ${organizationId}`);
    }

    const currentStatus = existing.status;
    const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus];
    if (!allowed.includes(newStatus)) {
      throw new Error(
        `Invalid status transition: Cannot transition from ${currentStatus} to ${newStatus}`
      );
    }

    const updated = updateMockBookingStatusInStore(
      organizationId,
      bookingId,
      newStatus,
      actorName,
      reason
    );

    createMockNotificationInStore({
      organizationId,
      type: "Booking",
      priority: newStatus === "cancelled" ? "High" : newStatus === "completed" ? "Normal" : "Normal",
      title: `Booking ${updated.bookingNumber} ${newStatus}`,
      message: `Booking ${updated.bookingNumber} transitioned to ${newStatus}.${reason ? ` Reason: ${reason}` : ""}`,
      relatedEntityType: "Booking",
      relatedEntityId: bookingId,
      actionRoute: `/admin/bookings/${bookingId}`,
      actorName,
    });

    return JSON.parse(JSON.stringify(updated));
  }

  async getBookingActivity(
    organizationId: string,
    bookingId: string
  ): Promise<BookingActivity[]> {
    if (isLiveMode()) {
      try {
        const res = await adminApi.bookings.getStatusHistory(bookingId);
        return (res.data || []).map((h: any) => ({
          id: h.id || `ACT-${Date.now()}`,
          bookingId,
          type: "status_change",
          fromStatus: h.fromStatus?.toLowerCase(),
          toStatus: h.toStatus?.toLowerCase(),
          description: h.reason || `Status updated to ${h.toStatus}`,
          timestamp: h.createdAt || new Date().toISOString(),
          actorName: h.changedBy || "Operations Staff",
        }));
      } catch {
        return [];
      }
    }

    await new Promise((res) => setTimeout(res, 30));

    // Confirm booking belongs to organization first
    const orgBookings = getMockBookingsByOrg(organizationId);
    const belongs = orgBookings.some((b) => b.id === bookingId);
    if (!belongs) {
      return [];
    }

    const activities = getMockBookingActivities(bookingId);
    // Return sorted newest first
    return [...activities].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async getBookingSummaryMetrics(
    organizationId: string
  ): Promise<BookingSummaryMetrics> {
    if (isLiveMode()) {
      const res = await adminApi.dashboard.getMetrics().catch(() => ({ data: {} }));
      const m = res.data || {};
      return {
        total: m.totalBookings ?? 0,
        pending: m.pendingBookings ?? 0,
        confirmed: m.activeBookings ?? 0,
        inProgress: m.activeBookings ?? 0,
        completed: m.completedBookings ?? 0,
        cancelled: m.cancelledBookings ?? 0,
      };
    }

    await new Promise((res) => setTimeout(res, 20));

    const orgBookings = getMockBookingsByOrg(organizationId);
    return {
      total: orgBookings.length,
      pending: orgBookings.filter((b) => b.status === "pending").length,
      confirmed: orgBookings.filter((b) => b.status === "confirmed").length,
      inProgress: orgBookings.filter((b) => b.status === "in_progress").length,
      completed: orgBookings.filter((b) => b.status === "completed").length,
      cancelled: orgBookings.filter((b) => b.status === "cancelled").length,
    };
  }
}

export const adminBookingService = new AdminBookingService();
