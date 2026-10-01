import {
  Provider,
  ProviderActivity,
  ProviderApprovalStatus,
  ProviderStatus,
  ProviderSummaryMetrics,
  ListProvidersParams,
  PaginatedResult,
  UpdateProviderPayload,
  UpdateProviderStatusPayload,
  UpdateProviderApprovalPayload,
  PROVIDER_SERVICE_CATEGORIES,
} from "@/types/admin";
import {
  getMockProvidersByOrg,
  getMockProviderActivities,
  updateMockProviderInStore,
  addMockProviderActivity,
} from "@/mocks/admin/provider.mock";
import { createMockNotificationInStore } from "@/mocks/admin/notification.mock";
import { isLiveMode } from "@/lib/api/mode";
import { adminApi } from "@/features/admin/api/adminApi";

function mapBackendProviderToProvider(p: any): Provider {
  return {
    id: p.id,
    organizationId: p.organizationId || "ORG-0001",
    fullName: p.user?.fullName || p.businessName || "Provider Partner",
    businessName: p.businessName || p.user?.fullName || "Washora Partner Workshop",
    email: p.user?.email || p.email || "",
    phone: p.user?.phone || p.phone || "",
    profileImage: p.user?.avatarUrl || p.avatarUrl,
    status: (p.status?.toLowerCase() as any) || "active",
    approvalStatus: (p.verificationStatus?.toLowerCase() === "verified" ? "approved" : (p.approvalStatus?.toLowerCase() || "approved")) as any,
    serviceCategories: ["Wash & Fold", "Dry Cleaning", "Steam Ironing"],
    serviceAreas: ["South Mumbai", "Bandra", "Andheri"],
    city: p.city || "Mumbai",
    rating: Number(p.rating || 4.8),
    totalReviews: Number(p.totalReviews || 24),
    joinedAt: p.createdAt || new Date().toISOString(),
    updatedAt: p.updatedAt || new Date().toISOString(),
    totalBookings: p._count?.bookings ?? p.totalBookings ?? 0,
    completedBookings: p.completedBookings ?? 0,
    cancelledBookings: p.cancelledBookings ?? 0,
    totalEarnings: Number(p.totalEarnings ?? 0),
  };
}

export interface IAdminProviderService {
  listProviders(params: ListProvidersParams): Promise<PaginatedResult<Provider>>;
  getProviderById(organizationId: string, providerId: string): Promise<Provider | null>;
  updateProvider(
    organizationId: string,
    providerId: string,
    payload: UpdateProviderPayload
  ): Promise<Provider>;
  updateProviderApproval(
    organizationId: string,
    providerId: string,
    payload: UpdateProviderApprovalPayload
  ): Promise<Provider>;
  updateProviderStatus(
    organizationId: string,
    providerId: string,
    payload: UpdateProviderStatusPayload
  ): Promise<Provider>;
  getProviderActivity(
    organizationId: string,
    providerId: string
  ): Promise<ProviderActivity[]>;
  getProviderMetrics(organizationId: string): Promise<ProviderSummaryMetrics>;
  getDistinctCities(organizationId: string): Promise<string[]>;
  getAvailableServiceCategories(organizationId: string): Promise<string[]>;
}

class AdminProviderService implements IAdminProviderService {
  async listProviders(
    params: ListProvidersParams
  ): Promise<PaginatedResult<Provider>> {
    if (isLiveMode()) {
      const res = await adminApi.providers.list({
        page: params.page,
        limit: params.pageSize,
        search: params.search,
        status: params.status !== "all" ? params.status : undefined,
      });
      const items = (res.data || []).map(mapBackendProviderToProvider);
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
      approvalStatus = "all",
      serviceCategory = "all",
      city = "all",
      rating = "all",
      sort = "joinedAt",
      sortDirection = "desc",
      page = 1,
      pageSize = 10,
    } = params;

    // 1. Strictly resolve providers by organization ID (Zero cross-org leakage)
    const baseProviders = getMockProvidersByOrg(organizationId);

    // 2. Search filter (case-insensitive across name, business name, email, phone, and provider ID)
    const normalizedSearch = search.trim().toLowerCase();
    let filtered = baseProviders.filter((provider) => {
      if (!normalizedSearch) return true;
      const matchName = provider.fullName.toLowerCase().includes(normalizedSearch);
      const matchBusiness = provider.businessName?.toLowerCase().includes(normalizedSearch) || false;
      const matchEmail = provider.email.toLowerCase().includes(normalizedSearch);
      const matchPhone = provider.phone.toLowerCase().includes(normalizedSearch);
      const matchId = provider.id.toLowerCase().includes(normalizedSearch);
      return matchName || matchBusiness || matchEmail || matchPhone || matchId;
    });

    // 3. Status filter
    if (status && status !== "all") {
      filtered = filtered.filter((p) => p.status === status);
    }

    // 4. Approval Status filter
    if (approvalStatus && approvalStatus !== "all") {
      filtered = filtered.filter((p) => p.approvalStatus === approvalStatus);
    }

    // 5. Service Category filter
    if (serviceCategory && serviceCategory !== "all") {
      filtered = filtered.filter((p) =>
        p.serviceCategories.some(
          (cat) => cat.toLowerCase() === serviceCategory.toLowerCase()
        )
      );
    }

    // 6. City filter
    if (city && city !== "all") {
      filtered = filtered.filter((p) => p.city.toLowerCase() === city.toLowerCase());
    }

    // 7. Rating filter
    if (rating && rating !== "all") {
      filtered = filtered.filter((p) => {
        if (rating === "4.5+") return p.rating >= 4.5;
        if (rating === "4.0+") return p.rating >= 4.0;
        if (rating === "3.0+") return p.rating >= 3.0;
        if (rating === "unrated") return p.rating === 0 || p.totalReviews === 0;
        return true;
      });
    }

    // 8. Stable Sorting
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sort) {
        case "name":
          comparison = a.fullName.localeCompare(b.fullName);
          break;
        case "joinedAt":
          comparison = new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
          break;
        case "rating":
          comparison = a.rating - b.rating;
          break;
        case "totalBookings":
          comparison = a.totalBookings - b.totalBookings;
          break;
        case "totalEarnings":
          comparison = a.totalEarnings - b.totalEarnings;
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "approvalStatus":
          comparison = a.approvalStatus.localeCompare(b.approvalStatus);
          break;
        default:
          comparison = 0;
      }

      return sortDirection === "desc" ? -comparison : comparison;
    });

    // 9. Pagination
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

  async getProviderById(
    organizationId: string,
    providerId: string
  ): Promise<Provider | null> {
    if (isLiveMode()) {
      try {
        const res = await adminApi.providers.getById(providerId);
        return mapBackendProviderToProvider(res.data);
      } catch {
        return null;
      }
    }

    await new Promise((res) => setTimeout(res, 30));

    // Direct-ID Isolation: Only search within the caller's organization store
    const providers = getMockProvidersByOrg(organizationId);
    const provider = providers.find((p) => p.id === providerId);

    // If provider doesn't exist or belongs to another organization, return null
    if (!provider || provider.organizationId !== organizationId) {
      return null;
    }

    return { ...provider };
  }

  async updateProvider(
    organizationId: string,
    providerId: string,
    payload: UpdateProviderPayload
  ): Promise<Provider> {
    if (isLiveMode()) {
      const res = await adminApi.providers.update(providerId, {
        businessName: payload.businessName,
        city: payload.city,
      });
      return mapBackendProviderToProvider(res.data);
    }

    await new Promise((res) => setTimeout(res, 50));

    const provider = await this.getProviderById(organizationId, providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not found in organization ${organizationId}`);
    }

    const updatedProvider: Provider = {
      ...provider,
      fullName: payload.fullName.trim(),
      email: payload.email.trim(),
      phone: payload.phone.trim(),
      businessName: payload.businessName?.trim() || undefined,
      city: payload.city.trim(),
      serviceCategories: [...payload.serviceCategories],
      serviceAreas: [...payload.serviceAreas],
      updatedAt: "2026-09-06T11:00:00Z",
    };

    updateMockProviderInStore(organizationId, updatedProvider);

    addMockProviderActivity(providerId, {
      id: `ACT-${Date.now()}`,
      providerId,
      type: "profile_updated",
      description: `Provider profile details updated by administrator (Name: ${updatedProvider.fullName}, Business: ${updatedProvider.businessName || "N/A"}).`,
      timestamp: "2026-09-06T11:00:00Z",
      status: "SUCCESS",
      actorName: "Admin Console",
    });

    return { ...updatedProvider };
  }

  async updateProviderApproval(
    organizationId: string,
    providerId: string,
    payload: UpdateProviderApprovalPayload
  ): Promise<Provider> {
    if (isLiveMode()) {
      const res = await adminApi.providers.verify(providerId, payload.approvalStatus === "approved");
      return mapBackendProviderToProvider(res.data);
    }

    await new Promise((res) => setTimeout(res, 50));

    const provider = await this.getProviderById(organizationId, providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not found in organization ${organizationId}`);
    }

    const prevApproval = provider.approvalStatus;
    const newApproval: ProviderApprovalStatus = payload.approvalStatus;

    // Consequence logic:
    // If approving a provider, their operational status becomes "active"
    // If rejecting a provider, their operational status becomes "inactive"
    let newStatus: ProviderStatus = provider.status;
    if (newApproval === "approved") {
      newStatus = "active";
    } else if (newApproval === "rejected") {
      newStatus = "inactive";
    }

    const updatedProvider: Provider = {
      ...provider,
      approvalStatus: newApproval,
      status: newStatus,
      updatedAt: "2026-09-06T11:00:00Z",
    };

    updateMockProviderInStore(organizationId, updatedProvider);

    const auditReason = payload.reason?.trim() ? ` Reason: ${payload.reason.trim()}` : "";
    addMockProviderActivity(providerId, {
      id: `ACT-${Date.now()}`,
      providerId,
      type: newApproval === "approved" ? "provider_approved" : "provider_rejected",
      description: `Provider approval changed from ${prevApproval.toUpperCase()} to ${newApproval.toUpperCase()}.${auditReason}`,
      timestamp: "2026-09-06T11:00:00Z",
      status: newApproval.toUpperCase(),
      actorName: "Admin Console",
    });

    createMockNotificationInStore({
      organizationId,
      type: "Provider",
      priority: newApproval === "approved" ? "Normal" : "High",
      title: `Provider ${updatedProvider.fullName} ${newApproval}`,
      message: `Provider ${updatedProvider.fullName} (${updatedProvider.businessName || providerId}) has been ${newApproval}.${auditReason}`,
      relatedEntityType: "Provider",
      relatedEntityId: providerId,
      actionRoute: `/admin/providers/${providerId}`,
      actorName: "Admin Console",
    });

    return { ...updatedProvider };
  }

  async updateProviderStatus(
    organizationId: string,
    providerId: string,
    payload: UpdateProviderStatusPayload
  ): Promise<Provider> {
    if (isLiveMode()) {
      const res = await adminApi.providers.update(providerId, {
        status: payload.status.toUpperCase(),
        reason: payload.reason,
      });
      return mapBackendProviderToProvider(res.data);
    }

    await new Promise((res) => setTimeout(res, 50));

    const provider = await this.getProviderById(organizationId, providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not found in organization ${organizationId}`);
    }

    const previousStatus = provider.status;
    const newStatus: ProviderStatus = payload.status;

    const updatedProvider: Provider = {
      ...provider,
      status: newStatus,
      updatedAt: "2026-09-06T11:00:00Z",
    };

    updateMockProviderInStore(organizationId, updatedProvider);

    const auditReason = payload.reason?.trim() ? ` Reason: ${payload.reason.trim()}` : "";
    const activityType =
      newStatus === "active"
        ? "provider_activated"
        : newStatus === "suspended"
        ? "provider_suspended"
        : "profile_updated";

    addMockProviderActivity(providerId, {
      id: `ACT-${Date.now()}`,
      providerId,
      type: activityType,
      description: `Operational status changed from ${previousStatus.toUpperCase()} to ${newStatus.toUpperCase()}.${auditReason}`,
      timestamp: "2026-09-06T11:00:00Z",
      status: newStatus.toUpperCase(),
      actorName: "Admin Console",
    });

    createMockNotificationInStore({
      organizationId,
      type: "Provider",
      priority: newStatus === "suspended" ? "High" : "Normal",
      title: `Provider ${updatedProvider.fullName} status: ${newStatus}`,
      message: `Operational status for provider ${updatedProvider.fullName} is now ${newStatus}.${auditReason}`,
      relatedEntityType: "Provider",
      relatedEntityId: providerId,
      actionRoute: `/admin/providers/${providerId}`,
      actorName: "Admin Console",
    });

    return { ...updatedProvider };
  }

  async getProviderActivity(
    organizationId: string,
    providerId: string
  ): Promise<ProviderActivity[]> {
    await new Promise((res) => setTimeout(res, 30));

    const provider = await this.getProviderById(organizationId, providerId);
    if (!provider) {
      return [];
    }

    return getMockProviderActivities(providerId);
  }

  async getProviderMetrics(
    organizationId: string
  ): Promise<ProviderSummaryMetrics> {
    await new Promise((res) => setTimeout(res, 30));

    const providers = getMockProvidersByOrg(organizationId);
    const totalProviders = providers.length;
    const activeProviders = providers.filter((p) => p.status === "active").length;
    const pendingReviewProviders = providers.filter(
      (p) => p.approvalStatus === "pending"
    ).length;
    const actionRequiredProviders = providers.filter(
      (p) => p.approvalStatus === "pending" || p.status === "suspended"
    ).length;
    const suspendedProviders = providers.filter(
      (p) => p.status === "suspended"
    ).length;

    // Providers registered in the last 60 days
    const newThisMonth = providers.filter((p) => {
      const joinDate = new Date(p.joinedAt);
      return joinDate >= new Date("2026-07-01");
    }).length;

    const activeRatePct =
      totalProviders > 0 ? Math.round((activeProviders / totalProviders) * 100) : 0;
    
    const approvedCount = providers.filter((p) => p.approvalStatus === "approved").length;
    const approvalRatePct =
      totalProviders > 0 ? Math.round((approvedCount / totalProviders) * 100) : 0;

    return {
      totalProviders,
      activeProviders,
      pendingReview: pendingReviewProviders,
      pendingReviewProviders,
      actionRequired: actionRequiredProviders,
      actionRequiredProviders,
      suspended: suspendedProviders,
      suspendedProviders,
      newThisMonth,
      activeRatePct,
    };
  }

  async getDistinctCities(organizationId: string): Promise<string[]> {
    const providers = getMockProvidersByOrg(organizationId);
    const citiesSet = new Set<string>();
    providers.forEach((p) => {
      if (p.city && p.city.trim()) {
        citiesSet.add(p.city.trim());
      }
    });
    return Array.from(citiesSet).sort();
  }

  async getAvailableServiceCategories(organizationId: string): Promise<string[]> {
    const providers = getMockProvidersByOrg(organizationId);
    const categorySet = new Set<string>(PROVIDER_SERVICE_CATEGORIES);
    providers.forEach((p) => {
      p.serviceCategories.forEach((c) => {
        if (c && c.trim()) categorySet.add(c.trim());
      });
    });
    return Array.from(categorySet).sort();
  }
}

export const adminProviderService = new AdminProviderService();
