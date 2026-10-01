import {
  Customer,
  CustomerActivity,
  CustomerStatus,
  CustomerSummaryMetrics,
  ListCustomersParams,
  PaginatedResult,
  UpdateCustomerPayload,
} from "@/types/admin";
import {
  getMockCustomersByOrg,
  getMockCustomerActivities,
  updateMockCustomerInStore,
  addMockCustomerActivity,
} from "@/mocks/admin/customer.mock";
import { isLiveMode } from "@/lib/api/mode";
import { adminApi } from "@/features/admin/api/adminApi";

function mapBackendCustomerToCustomer(c: any): Customer {
  return {
    id: c.id,
    organizationId: c.organizationId || "ORG-0001",
    fullName: c.user?.fullName || c.fullName || "Customer",
    email: c.user?.email || c.email || "",
    phone: c.user?.phone || c.phone || "",
    profileImage: c.user?.avatarUrl || c.avatarUrl,
    status: (c.status?.toLowerCase() as CustomerStatus) || "active",
    city: c.city || "Mumbai",
    joinedAt: c.createdAt || new Date().toISOString(),
    updatedAt: c.updatedAt || new Date().toISOString(),
    totalBookings: c._count?.bookings ?? c.totalBookings ?? 0,
    completedBookings: c.completedBookings ?? 0,
    cancelledBookings: c.cancelledBookings ?? 0,
    totalSpend: Number(c.totalSpend ?? 0),
    lastBookingAt: c.lastBookingAt,
  };
}

export interface IAdminCustomerService {
  listCustomers(params: ListCustomersParams): Promise<PaginatedResult<Customer>>;
  getCustomerById(organizationId: string, customerId: string): Promise<Customer | null>;
  updateCustomer(
    organizationId: string,
    customerId: string,
    payload: UpdateCustomerPayload
  ): Promise<Customer>;
  updateCustomerStatus(
    organizationId: string,
    customerId: string,
    status: CustomerStatus,
    reason?: string
  ): Promise<Customer>;
  getCustomerActivity(
    organizationId: string,
    customerId: string
  ): Promise<CustomerActivity[]>;
  getCustomerMetrics(organizationId: string): Promise<CustomerSummaryMetrics>;
  getDistinctCities(organizationId: string): Promise<string[]>;
}

class AdminCustomerService implements IAdminCustomerService {
  async listCustomers(
    params: ListCustomersParams
  ): Promise<PaginatedResult<Customer>> {
    if (isLiveMode()) {
      const res = await adminApi.customers.list({
        page: params.page,
        limit: params.pageSize,
        search: params.search,
        status: params.status !== "all" ? params.status : undefined,
      });
      const items = (res.data || []).map(mapBackendCustomerToCustomer);
      const meta = res.meta || { page: params.page || 1, limit: params.pageSize || 10, total: items.length, totalPages: 1 };
      return {
        items,
        total: meta.total,
        page: meta.page,
        pageSize: meta.limit,
        totalPages: meta.totalPages || Math.ceil(meta.total / (meta.limit || 10)),
      };
    }

    await new Promise((res) => setTimeout(res, 40));

    const {
      organizationId,
      search = "",
      status = "all",
      city = "all",
      bookingActivity = "all",
      sort = "joinedAt",
      sortDirection = "desc",
      page = 1,
      pageSize = 10,
    } = params;

    // 1. Strictly resolve customers by organization ID (Zero cross-org leakage)
    const baseCustomers = getMockCustomersByOrg(organizationId);

    // 2. Search filter (case-insensitive across name, email, phone, and customer ID)
    const normalizedSearch = search.trim().toLowerCase();
    let filtered = baseCustomers.filter((customer) => {
      if (!normalizedSearch) return true;
      const matchName = customer.fullName.toLowerCase().includes(normalizedSearch);
      const matchEmail = customer.email.toLowerCase().includes(normalizedSearch);
      const matchPhone = customer.phone.toLowerCase().includes(normalizedSearch);
      const matchId = customer.id.toLowerCase().includes(normalizedSearch);
      return matchName || matchEmail || matchPhone || matchId;
    });

    // 3. Status filter
    if (status && status !== "all") {
      filtered = filtered.filter((c) => c.status === status);
    }

    // 4. City filter
    if (city && city !== "all") {
      filtered = filtered.filter((c) => c.city === city);
    }

    // 5. Booking Activity filter
    if (bookingActivity && bookingActivity !== "all") {
      filtered = filtered.filter((c) => {
        if (bookingActivity === "none") return c.totalBookings === 0;
        if (bookingActivity === "1-5") return c.totalBookings >= 1 && c.totalBookings <= 5;
        if (bookingActivity === "6-20") return c.totalBookings >= 6 && c.totalBookings <= 20;
        if (bookingActivity === "20+") return c.totalBookings > 20;
        return true;
      });
    }

    // 6. Stable Sorting
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sort) {
        case "name":
          comparison = a.fullName.localeCompare(b.fullName);
          break;
        case "joinedAt":
          comparison = new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
          break;
        case "lastBookingAt": {
          const timeA = a.lastBookingAt ? new Date(a.lastBookingAt).getTime() : 0;
          const timeB = b.lastBookingAt ? new Date(b.lastBookingAt).getTime() : 0;
          comparison = timeA - timeB;
          break;
        }
        case "totalBookings":
          comparison = a.totalBookings - b.totalBookings;
          break;
        case "totalSpend":
          comparison = a.totalSpend - b.totalSpend;
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = 0;
      }

      return sortDirection === "desc" ? -comparison : comparison;
    });

    // 7. Pagination
    const total = sorted.length;
    const safePageSize = Math.max(1, pageSize);
    const totalPages = Math.max(1, Math.ceil(total / safePageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const startIndex = (safePage - 1) * safePageSize;
    const paginatedItems = sorted.slice(startIndex, startIndex + safePageSize);

    return {
      items: paginatedItems,
      total,
      page: safePage,
      pageSize: safePageSize,
      totalPages,
    };
  }

  async getCustomerById(
    organizationId: string,
    customerId: string
  ): Promise<Customer | null> {
    if (isLiveMode()) {
      try {
        const res = await adminApi.customers.getById(customerId);
        return mapBackendCustomerToCustomer(res.data);
      } catch {
        return null;
      }
    }

    await new Promise((res) => setTimeout(res, 30));

    // Direct-ID Isolation: Only search within the caller's organization store
    const customers = getMockCustomersByOrg(organizationId);
    const customer = customers.find((c) => c.id === customerId);

    // If customer doesn't exist or belongs to another organization, return null
    if (!customer || customer.organizationId !== organizationId) {
      return null;
    }

    return { ...customer };
  }

  async updateCustomer(
    organizationId: string,
    customerId: string,
    payload: UpdateCustomerPayload
  ): Promise<Customer> {
    if (isLiveMode()) {
      const res = await adminApi.customers.update(customerId, {
        fullName: payload.fullName,
        city: payload.city,
      });
      return mapBackendCustomerToCustomer(res.data);
    }

    await new Promise((res) => setTimeout(res, 50));

    const customer = await this.getCustomerById(organizationId, customerId);
    if (!customer) {
      throw new Error(`Customer ${customerId} not found in organization ${organizationId}`);
    }

    const updatedCustomer: Customer = {
      ...customer,
      fullName: payload.fullName.trim(),
      email: payload.email.trim(),
      phone: payload.phone.trim(),
      city: payload.city.trim(),
      updatedAt: "2026-09-06T11:00:00Z",
    };

    updateMockCustomerInStore(organizationId, updatedCustomer);

    addMockCustomerActivity(customerId, {
      id: `ACT-${Date.now()}`,
      customerId,
      type: "profile_updated",
      description: `Customer contact details updated (Name: ${updatedCustomer.fullName}, City: ${updatedCustomer.city}).`,
      timestamp: "2026-09-06T11:00:00Z",
      status: "SUCCESS",
      actorName: "Admin Console",
    });

    return { ...updatedCustomer };
  }

  async updateCustomerStatus(
    organizationId: string,
    customerId: string,
    status: CustomerStatus,
    reason?: string
  ): Promise<Customer> {
    if (isLiveMode()) {
      const res = await adminApi.customers.update(customerId, {
        status: status.toUpperCase(),
        reason,
      });
      return mapBackendCustomerToCustomer(res.data);
    }

    await new Promise((res) => setTimeout(res, 50));

    const customer = await this.getCustomerById(organizationId, customerId);
    if (!customer) {
      throw new Error(`Customer ${customerId} not found in organization ${organizationId}`);
    }

    const previousStatus = customer.status;
    const updatedCustomer: Customer = {
      ...customer,
      status,
      updatedAt: "2026-09-06T11:00:00Z",
    };

    updateMockCustomerInStore(organizationId, updatedCustomer);

    const auditReason = reason?.trim() ? ` Reason: ${reason.trim()}` : "";
    addMockCustomerActivity(customerId, {
      id: `ACT-${Date.now()}`,
      customerId,
      type: "status_changed",
      description: `Status changed from ${previousStatus.toUpperCase()} to ${status.toUpperCase()}.${auditReason}`,
      timestamp: "2026-09-06T11:00:00Z",
      status: status.toUpperCase(),
      actorName: "Admin Console",
    });

    return { ...updatedCustomer };
  }

  async getCustomerActivity(
    organizationId: string,
    customerId: string
  ): Promise<CustomerActivity[]> {
    await new Promise((res) => setTimeout(res, 30));

    const customer = await this.getCustomerById(organizationId, customerId);
    if (!customer) {
      return [];
    }

    return getMockCustomerActivities(customerId);
  }

  async getCustomerMetrics(
    organizationId: string
  ): Promise<CustomerSummaryMetrics> {
    await new Promise((res) => setTimeout(res, 30));

    const customers = getMockCustomersByOrg(organizationId);
    const total = customers.length;
    const active = customers.filter((c) => c.status === "active").length;
    const withOrders = customers.filter((c) => c.totalBookings > 0).length;
    const requiringAttention = customers.filter(
      (c) => c.status === "suspended" || (c.status === "active" && c.totalBookings === 0)
    ).length;

    // Derived deterministic stats
    const newThisMonth = Math.round(total * 0.15) || 1;
    const activeRatePct = total > 0 ? Math.round((active / total) * 100) : 0;
    const conversionRatePct = total > 0 ? Math.round((withOrders / total) * 100) : 0;

    return {
      totalCustomers: total,
      activeCustomers: active,
      newThisMonth,
      customersWithOrders: withOrders,
      requiringAttention,
      activeRatePct,
      conversionRatePct,
    };
  }

  async getDistinctCities(organizationId: string): Promise<string[]> {
    const customers = getMockCustomersByOrg(organizationId);
    const citiesSet = new Set<string>();
    customers.forEach((c) => {
      if (c.city && c.city.trim()) {
        citiesSet.add(c.city.trim());
      }
    });
    return Array.from(citiesSet).sort();
  }
}

export const adminCustomerService = new AdminCustomerService();
