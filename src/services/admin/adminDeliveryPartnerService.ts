import {
  DeliveryPartner,
  DeliveryPartnerActivity,
  DeliveryPartnerApprovalStatus,
  DeliveryPartnerStatus,
  DeliveryPartnerSummaryMetrics,
  ListDeliveryPartnersParams,
  PaginatedResult,
  UpdateDeliveryPartnerPayload,
  UpdateDeliveryPartnerStatusPayload,
  UpdateDeliveryPartnerApprovalPayload,
  VehicleType,
  VEHICLE_TYPES,
} from "@/types/admin";
import {
  getMockDeliveryPartnersByOrg,
  getMockDeliveryPartnerActivities,
  updateMockDeliveryPartnerInStore,
  addMockDeliveryPartnerActivity,
} from "@/mocks/admin/deliveryPartner.mock";
import { createMockNotificationInStore } from "@/mocks/admin/notification.mock";
import { isLiveMode } from "@/lib/api/mode";
import { adminApi } from "@/features/admin/api/adminApi";

function mapBackendPartnerToDeliveryPartner(p: any): DeliveryPartner {
  return {
    id: p.id,
    organizationId: p.organizationId || "ORG-0001",
    fullName: p.user?.fullName || "Valet Partner",
    email: p.user?.email || p.email || "",
    phone: p.user?.phone || p.phone || "",
    profileImage: p.user?.avatarUrl || p.avatarUrl,
    status: (p.status?.toLowerCase() as any) || "active",
    approvalStatus: (p.verificationStatus?.toLowerCase() === "verified" ? "approved" : (p.approvalStatus?.toLowerCase() || "approved")) as any,
    vehicleType: (p.vehicleType?.toLowerCase() as any) || "motorcycle",
    vehicleNumber: p.vehicleNumber || "MH 02 AB 1234",
    serviceAreas: ["South Mumbai", "Bandra", "Andheri"],
    city: p.city || "Mumbai",
    rating: Number(p.rating || 4.9),
    totalReviews: Number(p.totalReviews || 12),
    totalDeliveries: p._count?.assignments ?? p.totalDeliveries ?? 0,
    completedDeliveries: p.completedDeliveries ?? 0,
    cancelledDeliveries: p.cancelledDeliveries ?? 0,
    totalEarnings: Number(p.totalEarnings ?? 0),
    activeOrdersCount: p.activeDeliveriesCount ?? p.activeOrdersCount ?? 0,
    joinedAt: p.createdAt || new Date().toISOString(),
    updatedAt: p.updatedAt || new Date().toISOString(),
  };
}

export interface IAdminDeliveryPartnerService {
  listDeliveryPartners(
    params: ListDeliveryPartnersParams
  ): Promise<PaginatedResult<DeliveryPartner>>;
  getDeliveryPartnerById(
    organizationId: string,
    partnerId: string
  ): Promise<DeliveryPartner | null>;
  updateDeliveryPartner(
    organizationId: string,
    partnerId: string,
    payload: UpdateDeliveryPartnerPayload
  ): Promise<DeliveryPartner>;
  updateDeliveryPartnerApproval(
    organizationId: string,
    partnerId: string,
    payload: UpdateDeliveryPartnerApprovalPayload
  ): Promise<DeliveryPartner>;
  updateDeliveryPartnerStatus(
    organizationId: string,
    partnerId: string,
    payload: UpdateDeliveryPartnerStatusPayload
  ): Promise<DeliveryPartner>;
  getDeliveryPartnerActivity(
    organizationId: string,
    partnerId: string
  ): Promise<DeliveryPartnerActivity[]>;
  getDeliveryPartnerMetrics(
    organizationId: string
  ): Promise<DeliveryPartnerSummaryMetrics>;
  getDistinctCities(organizationId: string): Promise<string[]>;
  getDistinctVehicleTypes(organizationId: string): Promise<VehicleType[]>;
}

class AdminDeliveryPartnerService implements IAdminDeliveryPartnerService {
  async listDeliveryPartners(
    params: ListDeliveryPartnersParams
  ): Promise<PaginatedResult<DeliveryPartner>> {
    if (isLiveMode()) {
      const res = await adminApi.deliveryPartners.list({
        page: params.page,
        limit: params.pageSize,
        search: params.search,
        status: params.status !== "all" ? params.status : undefined,
      });
      const items = (res.data || []).map(mapBackendPartnerToDeliveryPartner);
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
      vehicleType = "all",
      city = "all",
      rating = "all",
      sort = "joinedAt",
      sortDirection = "desc",
      page = 1,
      pageSize = 10,
    } = params;

    // 1. Strictly resolve partners by organization ID (Zero cross-org leakage)
    const basePartners = getMockDeliveryPartnersByOrg(organizationId);

    // 2. Search filter (case-insensitive across name, email, phone, partner ID, and vehicle number)
    const normalizedSearch = search.trim().toLowerCase();
    let filtered = basePartners.filter((partner) => {
      if (!normalizedSearch) return true;
      const matchName = partner.fullName.toLowerCase().includes(normalizedSearch);
      const matchEmail = partner.email.toLowerCase().includes(normalizedSearch);
      const matchPhone = partner.phone.toLowerCase().includes(normalizedSearch);
      const matchId = partner.id.toLowerCase().includes(normalizedSearch);
      const matchVehicle = partner.vehicleNumber
        ? partner.vehicleNumber
            .toLowerCase()
            .replace(/[\s-]+/g, "")
            .includes(normalizedSearch.replace(/[\s-]+/g, ""))
        : false;
      return matchName || matchEmail || matchPhone || matchId || matchVehicle;
    });

    // 3. Operational Status filter
    if (status && status !== "all") {
      filtered = filtered.filter((p) => p.status === status);
    }

    // 4. Approval Status filter
    if (approvalStatus && approvalStatus !== "all") {
      filtered = filtered.filter((p) => p.approvalStatus === approvalStatus);
    }

    // 5. Vehicle Type filter
    if (vehicleType && vehicleType !== "all") {
      filtered = filtered.filter((p) => p.vehicleType === vehicleType);
    }

    // 6. City filter
    if (city && city !== "all") {
      filtered = filtered.filter((p) => p.city.toLowerCase() === city.toLowerCase());
    }

    // 7. Rating filter
    if (rating && rating !== "all") {
      filtered = filtered.filter((p) => {
        if (rating === "4.5+" || rating === "4.5") return p.rating >= 4.5;
        if (rating === "4.0+" || rating === "4.0") return p.rating >= 4.0;
        if (rating === "3.0+" || rating === "3.0") return p.rating >= 3.0;
        if (rating === "below_3.0")
          return p.rating > 0 && p.rating < 3.0 && p.totalReviews > 0;
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
        case "lastActive":
        case "lastActiveAt": {
          const timeA = a.lastActiveAt ? new Date(a.lastActiveAt).getTime() : 0;
          const timeB = b.lastActiveAt ? new Date(b.lastActiveAt).getTime() : 0;
          comparison = timeA - timeB;
          break;
        }
        case "vehicleType":
          comparison = a.vehicleType.localeCompare(b.vehicleType);
          break;
        case "city":
          comparison = a.city.localeCompare(b.city);
          break;
        case "totalDeliveries":
          comparison = a.totalDeliveries - b.totalDeliveries;
          break;
        case "rating":
          comparison = a.rating - b.rating;
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

  async getDeliveryPartnerById(
    organizationId: string,
    partnerId: string
  ): Promise<DeliveryPartner | null> {
    if (isLiveMode()) {
      try {
        const res = await adminApi.deliveryPartners.getById(partnerId);
        return mapBackendPartnerToDeliveryPartner(res.data);
      } catch {
        return null;
      }
    }

    await new Promise((res) => setTimeout(res, 30));

    // Direct-ID Isolation: Only search within the caller's organization store
    const partners = getMockDeliveryPartnersByOrg(organizationId);
    const partner = partners.find((p) => p.id === partnerId);

    // If partner doesn't exist or belongs to another organization, return null
    if (!partner || partner.organizationId !== organizationId) {
      return null;
    }

    return { ...partner };
  }

  async updateDeliveryPartner(
    organizationId: string,
    partnerId: string,
    payload: UpdateDeliveryPartnerPayload
  ): Promise<DeliveryPartner> {
    if (isLiveMode()) {
      const res = await adminApi.deliveryPartners.update(partnerId, {
        vehicleType: payload.vehicleType,
        vehicleNumber: payload.vehicleNumber,
        city: payload.city,
      });
      return mapBackendPartnerToDeliveryPartner(res.data);
    }

    await new Promise((res) => setTimeout(res, 50));

    const partner = await this.getDeliveryPartnerById(organizationId, partnerId);
    if (!partner) {
      throw new Error(
        `Delivery partner ${partnerId} not found in organization ${organizationId}`
      );
    }

    const updatedPartner: DeliveryPartner = {
      ...partner,
      fullName: payload.fullName !== undefined ? payload.fullName.trim() : partner.fullName,
      email: payload.email !== undefined ? payload.email.trim() : partner.email,
      phone: payload.phone !== undefined ? payload.phone.trim() : partner.phone,
      vehicleType: payload.vehicleType || partner.vehicleType,
      vehicleNumber:
        payload.vehicleNumber !== undefined
          ? payload.vehicleNumber.trim().toUpperCase()
          : partner.vehicleNumber,
      city: payload.city !== undefined ? payload.city.trim() : partner.city,
      serviceAreas: payload.serviceAreas ? [...payload.serviceAreas] : [...partner.serviceAreas],
      updatedAt: "2026-09-06T12:00:00Z",
    };

    updateMockDeliveryPartnerInStore(organizationId, updatedPartner);

    addMockDeliveryPartnerActivity(partnerId, {
      id: `ACT-${Date.now()}`,
      partnerId,
      type: "profile_updated",
      description: `Delivery partner profile updated by administrator (Name: ${updatedPartner.fullName}, Vehicle: ${updatedPartner.vehicleNumber}).`,
      timestamp: "2026-09-06T12:00:00Z",
      status: "SUCCESS",
      actorName: "Admin Console",
    });

    return { ...updatedPartner };
  }

  async updateDeliveryPartnerApproval(
    organizationId: string,
    partnerId: string,
    payload: UpdateDeliveryPartnerApprovalPayload
  ): Promise<DeliveryPartner> {
    if (isLiveMode()) {
      const res = await adminApi.deliveryPartners.verify(partnerId, payload.approvalStatus === "approved");
      return mapBackendPartnerToDeliveryPartner(res.data);
    }

    await new Promise((res) => setTimeout(res, 50));

    const partner = await this.getDeliveryPartnerById(organizationId, partnerId);
    if (!partner) {
      throw new Error(
        `Delivery partner ${partnerId} not found in organization ${organizationId}`
      );
    }

    const prevApproval = partner.approvalStatus;
    const newApproval: DeliveryPartnerApprovalStatus = payload.approvalStatus;

    // Consequence logic:
    // If approving a partner, their operational status becomes "active"
    // If rejecting a partner, their operational status becomes "inactive"
    let newStatus: DeliveryPartnerStatus = partner.status;
    if (newApproval === "approved") {
      newStatus = "active";
    } else if (newApproval === "rejected") {
      newStatus = "inactive";
    }

    const updatedPartner: DeliveryPartner = {
      ...partner,
      approvalStatus: newApproval,
      status: newStatus,
      updatedAt: "2026-09-06T12:00:00Z",
    };

    updateMockDeliveryPartnerInStore(organizationId, updatedPartner);

    const auditReason = payload.reason?.trim() ? ` Reason: ${payload.reason.trim()}` : "";
    addMockDeliveryPartnerActivity(partnerId, {
      id: `ACT-${Date.now()}`,
      partnerId,
      type: newApproval === "approved" ? "partner_approved" : "partner_rejected",
      description: `Partner verification changed from ${prevApproval.toUpperCase()} to ${newApproval.toUpperCase()}.${auditReason}`,
      timestamp: "2026-09-06T12:00:00Z",
      status: newApproval.toUpperCase(),
      actorName: "Admin Console",
    });

    createMockNotificationInStore({
      organizationId,
      type: "Delivery Partner",
      priority: newApproval === "approved" ? "Normal" : "High",
      title: `Delivery Partner ${updatedPartner.fullName} ${newApproval}`,
      message: `Verification for valet ${updatedPartner.fullName} (${partnerId}) changed to ${newApproval}.${auditReason}`,
      relatedEntityType: "Delivery Partner",
      relatedEntityId: partnerId,
      actionRoute: `/admin/delivery-partners/${partnerId}`,
      actorName: "Admin Console",
    });

    return { ...updatedPartner };
  }

  async updateDeliveryPartnerStatus(
    organizationId: string,
    partnerId: string,
    payload: UpdateDeliveryPartnerStatusPayload
  ): Promise<DeliveryPartner> {
    if (isLiveMode()) {
      const res = await adminApi.deliveryPartners.update(partnerId, {
        status: payload.status.toUpperCase(),
        reason: payload.reason,
      });
      return mapBackendPartnerToDeliveryPartner(res.data);
    }

    await new Promise((res) => setTimeout(res, 50));

    const partner = await this.getDeliveryPartnerById(organizationId, partnerId);
    if (!partner) {
      throw new Error(
        `Delivery partner ${partnerId} not found in organization ${organizationId}`
      );
    }

    const previousStatus = partner.status;
    const newStatus: DeliveryPartnerStatus = payload.status;

    const updatedPartner: DeliveryPartner = {
      ...partner,
      status: newStatus,
      isOnline: newStatus === "active" ? (partner.isOnline ?? true) : false,
      updatedAt: "2026-09-06T12:00:00Z",
    };

    updateMockDeliveryPartnerInStore(organizationId, updatedPartner);

    const auditReason = payload.reason?.trim() ? ` Reason: ${payload.reason.trim()}` : "";
    const activityType =
      newStatus === "active"
        ? "partner_activated"
        : newStatus === "suspended"
        ? "partner_suspended"
        : "profile_updated";

    addMockDeliveryPartnerActivity(partnerId, {
      id: `ACT-${Date.now()}`,
      partnerId,
      type: activityType,
      description: `Operational status changed from ${previousStatus.toUpperCase()} to ${newStatus.toUpperCase()}.${auditReason}`,
      timestamp: "2026-09-06T12:00:00Z",
      status: newStatus.toUpperCase(),
      actorName: "Admin Console",
    });

    createMockNotificationInStore({
      organizationId,
      type: "Delivery Partner",
      priority: newStatus === "suspended" ? "High" : "Normal",
      title: `Delivery Partner ${updatedPartner.fullName} status: ${newStatus}`,
      message: `Operational status for valet ${updatedPartner.fullName} is now ${newStatus}.${auditReason}`,
      relatedEntityType: "Delivery Partner",
      relatedEntityId: partnerId,
      actionRoute: `/admin/delivery-partners/${partnerId}`,
      actorName: "Admin Console",
    });

    return { ...updatedPartner };
  }

  async getDeliveryPartnerActivity(
    organizationId: string,
    partnerId: string
  ): Promise<DeliveryPartnerActivity[]> {
    await new Promise((res) => setTimeout(res, 30));

    const partner = await this.getDeliveryPartnerById(organizationId, partnerId);
    if (!partner) {
      return [];
    }

    return getMockDeliveryPartnerActivities(partnerId);
  }

  async getDeliveryPartnerMetrics(
    organizationId: string
  ): Promise<DeliveryPartnerSummaryMetrics> {
    await new Promise((res) => setTimeout(res, 30));

    const partners = getMockDeliveryPartnersByOrg(organizationId);
    const totalPartners = partners.length;
    const activePartners = partners.filter((p) => p.status === "active").length;
    const onlinePartners = partners.filter(
      (p) => p.status === "active" && p.lastActiveAt
    ).length;
    const pendingReviewPartners = partners.filter(
      (p) => p.approvalStatus === "pending"
    ).length;
    const actionRequiredPartners = partners.filter(
      (p) => p.approvalStatus === "pending" || p.status === "suspended"
    ).length;
    const suspendedPartners = partners.filter(
      (p) => p.status === "suspended"
    ).length;

    // Partners registered in the last 60 days
    const newThisMonth = partners.filter((p) => {
      const joinDate = new Date(p.joinedAt);
      return joinDate >= new Date("2026-07-01");
    }).length;

    const activeRatePct =
      totalPartners > 0 ? Math.round((activePartners / totalPartners) * 100) : 0;

    return {
      totalPartners,
      activePartners,
      onlinePartners,
      pendingReviewPartners,
      actionRequiredPartners,
      suspendedPartners,
      newThisMonth,
      activeRatePct,
    };
  }

  async getDistinctCities(organizationId: string): Promise<string[]> {
    const partners = getMockDeliveryPartnersByOrg(organizationId);
    const citiesSet = new Set<string>();
    partners.forEach((p) => {
      if (p.city && p.city.trim()) {
        citiesSet.add(p.city.trim());
      }
    });
    return Array.from(citiesSet).sort();
  }

  async getDistinctVehicleTypes(organizationId: string): Promise<VehicleType[]> {
    const partners = getMockDeliveryPartnersByOrg(organizationId);
    const typeSet = new Set<VehicleType>(VEHICLE_TYPES);
    partners.forEach((p) => {
      if (p.vehicleType) {
        typeSet.add(p.vehicleType);
      }
    });
    return Array.from(typeSet);
  }
}

export const adminDeliveryPartnerService = new AdminDeliveryPartnerService();
