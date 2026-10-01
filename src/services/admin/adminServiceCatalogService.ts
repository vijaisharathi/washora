import {
  Service,
  ServiceActivity,
  ServiceStatus,
  ServiceSummaryMetrics,
  ListServicesParams,
  ListServicesResult,
  CreateServiceFormValues,
  EditServiceFormValues,
  ALLOWED_SERVICE_STATUS_TRANSITIONS,
} from "@/types/admin";
import {
  getMockServicesByOrg,
  getMockServiceActivities,
  addMockServiceToStore,
  updateMockServiceInStore,
  updateMockServiceStatusInStore,
  addMockServiceActivity,
} from "@/mocks/admin/serviceCatalog.mock";
import { isLiveMode } from "@/lib/api/mode";
import { adminApi } from "@/features/admin/api/adminApi";

function mapBackendServiceToService(s: any): Service {
  return {
    id: s.id,
    organizationId: s.organizationId || "ORG-0001",
    name: s.name || "Laundry Service",
    category: s.category?.name || s.category || "Laundry",
    shortDescription: s.shortDescription || s.description?.slice(0, 80) || "",
    description: s.description || "",
    basePrice: Number(s.basePrice || 199),
    serviceFee: Number(s.serviceFee || 20),
    displayPrice: Number(s.basePrice || 199) + Number(s.serviceFee || 20),
    durationMinutes: s.durationMinutes || (s.turnaroundHours ? s.turnaroundHours * 60 : 1440),
    status: (s.isActive !== false && s.status !== "INACTIVE" ? "Active" : "Inactive") as any,
    minQuantity: s.minQuantity || 1,
    maxQuantity: s.maxQuantity || 50,
    createdAt: s.createdAt || new Date().toISOString(),
    updatedAt: s.updatedAt || new Date().toISOString(),
    totalBookings: s._count?.bookings ?? s.totalBookings ?? 0,
    activeBookings: s.activeBookings ?? 0,
    completedBookings: s.completedBookings ?? 0,
    cancelledBookings: s.cancelledBookings ?? 0,
    rating: Number(s.rating || 4.8),
    totalReviews: Number(s.totalReviews || 12),
  };
}

export interface IAdminServiceCatalogService {
  listServices(params: ListServicesParams): Promise<ListServicesResult>;
  getServiceById(organizationId: string, serviceId: string): Promise<Service | null>;
  createService(
    organizationId: string,
    payload: CreateServiceFormValues,
    performedBy?: string
  ): Promise<Service>;
  updateService(
    organizationId: string,
    serviceId: string,
    payload: EditServiceFormValues,
    performedBy?: string
  ): Promise<Service>;
  updateServiceStatus(
    organizationId: string,
    serviceId: string,
    newStatus: ServiceStatus,
    performedBy?: string,
    reason?: string
  ): Promise<Service>;
  getServiceActivity(organizationId: string, serviceId: string): Promise<ServiceActivity[]>;
  getServiceSummaryMetrics(organizationId: string): Promise<ServiceSummaryMetrics>;
}

class AdminServiceCatalogService implements IAdminServiceCatalogService {
  async listServices(params: ListServicesParams): Promise<ListServicesResult> {
    if (isLiveMode()) {
      const res = await adminApi.catalog.listServices({
        page: params.page,
        limit: params.pageSize,
        search: params.search,
        status: params.status && params.status !== "all" ? (params.status as string).toUpperCase() : undefined,
      });
      const services: Service[] = (res.data || []).map(mapBackendServiceToService);
      const meta = (res as any).meta || { page: params.page || 1, limit: params.pageSize || 10, total: services.length, totalPages: 1 };
      return {
        services,
        total: meta.total,
        page: meta.page,
        pageSize: meta.limit,
        totalPages: meta.totalPages || Math.ceil(meta.total / (meta.limit || 10)),
        metrics: {
          total: services.length,
          active: services.filter((s: Service) => s.status === "Active").length,
          inactive: services.filter((s: Service) => s.status === "Inactive").length,
          archived: services.filter((s: Service) => s.status === "Archived").length,
        },
      };
    }

    // Artificial mock network latency
    await new Promise((res) => setTimeout(res, 40));

    const {
      organizationId,
      search = "",
      status = "all",
      category = "all",
      priceRange = "all",
      duration = "all",
      sort = "updatedAt",
      sortDirection = "desc",
      page = 1,
      pageSize = 10,
    } = params;

    // 1. Strict organization scoping
    const orgServices = getMockServicesByOrg(organizationId);

    // Verified organization summary metrics (unfiltered)
    const metrics: ServiceSummaryMetrics = {
      total: orgServices.length,
      active: orgServices.filter((s) => s.status === "Active").length,
      inactive: orgServices.filter((s) => s.status === "Inactive").length,
      archived: orgServices.filter((s) => s.status === "Archived").length,
    };

    // 2. Filter dataset using AND semantics
    let filtered = orgServices.filter((s) => {
      // Full-text search
      if (search.trim()) {
        const term = search.toLowerCase().trim();
        const matchId = s.id.toLowerCase().includes(term);
        const matchName = s.name.toLowerCase().includes(term);
        const matchCat = s.category.toLowerCase().includes(term);
        const matchShort = s.shortDescription.toLowerCase().includes(term);
        const matchDesc = s.description.toLowerCase().includes(term);

        if (!matchId && !matchName && !matchCat && !matchShort && !matchDesc) {
          return false;
        }
      }

      // Status filter
      if (status !== "all" && s.status !== status) {
        return false;
      }

      // Category filter
      if (category !== "all" && s.category !== category) {
        return false;
      }

      // Price Range filter (displayPrice = basePrice + serviceFee)
      const displayPrice = s.basePrice + s.serviceFee;
      if (priceRange !== "all") {
        if (priceRange === "under_500" && displayPrice >= 500) return false;
        if (priceRange === "500_999" && (displayPrice < 500 || displayPrice > 999)) return false;
        if (priceRange === "1000_1999" && (displayPrice < 1000 || displayPrice > 1999)) return false;
        if (priceRange === "2000_plus" && displayPrice < 2000) return false;
      }

      // Duration filter
      if (duration !== "all") {
        if (duration === "under_1hr" && s.durationMinutes >= 60) return false;
        if (duration === "1_2hr" && (s.durationMinutes < 60 || s.durationMinutes > 120)) return false;
        if (duration === "2_3hr" && (s.durationMinutes <= 120 || s.durationMinutes > 180)) return false;
        if (duration === "3hr_plus" && s.durationMinutes <= 180) return false;
      }

      return true;
    });

    // 3. Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sort) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
        case "price":
        case "displayPrice":
          comparison =
            (a.displayPrice ?? a.basePrice + a.serviceFee) -
            (b.displayPrice ?? b.basePrice + b.serviceFee);
          break;
        case "basePrice":
          comparison = a.basePrice - b.basePrice;
          break;
        case "duration":
        case "durationMinutes":
          comparison = a.durationMinutes - b.durationMinutes;
          break;
        case "createdAt":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "updatedAt":
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case "totalBookings":
          comparison = a.totalBookings - b.totalBookings;
          break;
        case "rating":
          comparison = a.rating - b.rating;
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }

      return sortDirection === "desc" ? -comparison : comparison;
    });

    // 4. Pagination
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const startIndex = (safePage - 1) * pageSize;
    const paginatedServices = filtered.slice(startIndex, startIndex + pageSize);

    return {
      services: paginatedServices,
      total,
      page: safePage,
      pageSize,
      totalPages,
      metrics,
    };
  }

  async getServiceById(
    organizationId: string,
    serviceId: string
  ): Promise<Service | null> {
    if (isLiveMode()) {
      try {
        const res = await adminApi.catalog.getService(serviceId);
        return res.data ? mapBackendServiceToService(res.data) : null;
      } catch (err: any) {
        if (err?.status === 404 || err?.statusCode === 404) {
          return null;
        }
        throw err;
      }
    }

    await new Promise((res) => setTimeout(res, 30));

    const orgServices = getMockServicesByOrg(organizationId);

    // Direct match
    let found = orgServices.find((s) => s.id === serviceId);

    // Support backwards-compatible lookup for A7 booking reference format (e.g. "SRV-001" -> "SRV-0001")
    if (!found && serviceId.startsWith("SRV-")) {
      const numPart = serviceId.replace("SRV-", "");
      if (numPart.length < 4) {
        const paddedId = `SRV-${numPart.padStart(4, "0")}`;
        found = orgServices.find((s) => s.id === paddedId);
      }
    }

    if (!found) {
      return null;
    }

    return JSON.parse(JSON.stringify(found));
  }

  async createService(
    organizationId: string,
    payload: CreateServiceFormValues,
    performedBy: string = "Admin Operations"
  ): Promise<Service> {
    if (isLiveMode()) {
      const res = await adminApi.catalog.createService({
        name: payload.name,
        category: payload.category,
        description: payload.description,
        shortDescription: payload.shortDescription,
        basePrice: payload.basePrice,
        serviceFee: payload.serviceFee,
        durationMinutes: payload.durationMinutes,
        status: payload.status,
        minQuantity: payload.minQuantity,
        maxQuantity: payload.maxQuantity,
      });
      return mapBackendServiceToService(res.data);
    }

    await new Promise((res) => setTimeout(res, 50));

    const orgServices = getMockServicesByOrg(organizationId);

    // Generate deterministic sequential service ID
    let nextNum = 1;
    const prefix = organizationId === "ORG-0002" ? 2000 : 0;

    const existingNums = orgServices
      .map((s) => parseInt(s.id.replace("SRV-", ""), 10))
      .filter((n) => !isNaN(n));

    if (existingNums.length > 0) {
      nextNum = Math.max(...existingNums) + 1;
    } else {
      nextNum = prefix + 1;
    }

    const generatedId = `SRV-${String(nextNum).padStart(4, "0")}`;
    const now = new Date().toISOString();

    const newService: Service = {
      id: generatedId,
      organizationId,
      name: payload.name,
      category: payload.category,
      shortDescription: payload.shortDescription,
      description: payload.description,
      basePrice: payload.basePrice,
      serviceFee: payload.serviceFee,
      displayPrice: payload.basePrice + payload.serviceFee,
      durationMinutes: payload.durationMinutes,
      status: payload.status || "Active",
      minQuantity: payload.minQuantity,
      maxQuantity: payload.maxQuantity,
      createdAt: now,
      updatedAt: now,
      totalBookings: 0,
      activeBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      rating: 0,
      totalReviews: 0,
    };

    const saved = addMockServiceToStore(organizationId, newService);
    return JSON.parse(JSON.stringify(saved));
  }

  async updateService(
    organizationId: string,
    serviceId: string,
    payload: EditServiceFormValues,
    performedBy: string = "Admin Operations"
  ): Promise<Service> {
    if (isLiveMode()) {
      const res = await adminApi.catalog.updateService(serviceId, {
        name: payload.name,
        category: payload.category,
        description: payload.description,
        shortDescription: payload.shortDescription,
        basePrice: payload.basePrice,
        serviceFee: payload.serviceFee,
        durationMinutes: payload.durationMinutes,
        minQuantity: payload.minQuantity,
        maxQuantity: payload.maxQuantity,
      });
      return mapBackendServiceToService(res.data);
    }

    await new Promise((res) => setTimeout(res, 50));

    const orgServices = getMockServicesByOrg(organizationId);
    const existing = orgServices.find((s) => s.id === serviceId);
    if (!existing) {
      throw new Error(`Service ${serviceId} not found in organization ${organizationId}`);
    }

    const updatedService: Service = {
      ...existing,
      name: payload.name,
      category: payload.category,
      shortDescription: payload.shortDescription,
      description: payload.description,
      basePrice: payload.basePrice,
      serviceFee: payload.serviceFee,
      displayPrice: payload.basePrice + payload.serviceFee,
      durationMinutes: payload.durationMinutes,
      minQuantity: payload.minQuantity,
      maxQuantity: payload.maxQuantity,
      updatedAt: new Date().toISOString(),
    };

    const saved = updateMockServiceInStore(organizationId, updatedService);

    addMockServiceActivity({
      id: `ACT-${serviceId}-${Date.now()}`,
      serviceId,
      type: "service_updated",
      description: `Service specifications updated by ${performedBy}`,
      timestamp: new Date().toISOString(),
      performedBy,
    });

    return JSON.parse(JSON.stringify(saved));
  }

  async updateServiceStatus(
    organizationId: string,
    serviceId: string,
    newStatus: ServiceStatus,
    performedBy: string = "Admin Operations",
    reason?: string
  ): Promise<Service> {
    if (isLiveMode()) {
      if (newStatus === "Active") {
        const res = await adminApi.catalog.publishService(serviceId);
        return mapBackendServiceToService(res.data);
      } else {
        const res = await adminApi.catalog.unpublishService(serviceId);
        return mapBackendServiceToService(res.data);
      }
    }

    await new Promise((res) => setTimeout(res, 50));

    const orgServices = getMockServicesByOrg(organizationId);
    const existing = orgServices.find((s) => s.id === serviceId);
    if (!existing) {
      throw new Error(`Service ${serviceId} not found in organization ${organizationId}`);
    }

    const currentStatus = existing.status;
    const allowed = ALLOWED_SERVICE_STATUS_TRANSITIONS[currentStatus];
    if (!allowed.includes(newStatus)) {
      throw new Error(
        `Invalid status transition: Cannot transition from ${currentStatus} to ${newStatus}`
      );
    }

    const updated = updateMockServiceStatusInStore(
      organizationId,
      serviceId,
      newStatus,
      performedBy,
      reason
    );

    return JSON.parse(JSON.stringify(updated));
  }

  async getServiceActivity(
    organizationId: string,
    serviceId: string
  ): Promise<ServiceActivity[]> {
    await new Promise((res) => setTimeout(res, 30));

    const orgServices = getMockServicesByOrg(organizationId);
    const belongs = orgServices.some((s) => s.id === serviceId);
    if (!belongs) {
      return [];
    }

    const activities = getMockServiceActivities(serviceId);
    return [...activities].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async getServiceSummaryMetrics(
    organizationId: string
  ): Promise<ServiceSummaryMetrics> {
    if (isLiveMode()) {
      const res = await adminApi.catalog.listServices({ limit: 100 });
      const services = (res.data || []).map(mapBackendServiceToService);
      return {
        total: services.length,
        active: services.filter((s: Service) => s.status === "Active").length,
        inactive: services.filter((s: Service) => s.status === "Inactive").length,
        archived: services.filter((s: Service) => s.status === "Archived").length,
      };
    }

    await new Promise((res) => setTimeout(res, 20));

    const orgServices = getMockServicesByOrg(organizationId);
    return {
      total: orgServices.length,
      active: orgServices.filter((s) => s.status === "Active").length,
      inactive: orgServices.filter((s) => s.status === "Inactive").length,
      archived: orgServices.filter((s) => s.status === "Archived").length,
    };
  }
}

export const adminServiceCatalogService = new AdminServiceCatalogService();
