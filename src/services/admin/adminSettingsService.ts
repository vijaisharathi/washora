import {
  AdminAccount,
  CanonicalAdminRole,
  PrimaryWorkArea,
  PreferredLanguage,
  TimeZone,
  DateFormatOption,
  TimeFormatOption,
  SystemPreferences,
  NotificationPreferences,
  AdminSessionRecord,
  OrganizationSettings,
  OrganizationMember,
  RolePermissionSet,
  ALL_ADMIN_PERMISSIONS,
  AccountSettingsFormData,
  PreferencesSettingsFormData,
  NotificationPreferencesFormData,
  ChangePasswordFormData,
  OrganizationSettingsFormData,
  AddMemberFormData,
  EditMemberFormData,
} from "@/types/admin";
import {
  MOCK_ORGANIZATION_MEMBERS,
  MOCK_ADMIN_SESSIONS,
  MOCK_SYSTEM_PREFERENCES,
  MOCK_NOTIFICATION_PREFERENCES,
  MOCK_ROLE_PERMISSION_SETS,
} from "@/mocks/admin/settings.mock";
import { adminAuthService } from "./adminAuthService";
import { isLiveMode } from "@/lib/api/mode";
import { adminApi } from "@/features/admin/api/adminApi";

export interface MembersFilterParams {
  search?: string;
  role?: string;
  workArea?: string;
  status?: string;
  sortBy?: "name" | "joinedAt" | "lastActiveAt" | "role" | "status";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface PaginatedMembersResult {
  members: OrganizationMember[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SecurityOverview {
  passwordStatus: "Set" | "Requires Update";
  lastPasswordUpdate: string;
  activeSessions: AdminSessionRecord[];
}

export interface SettingsOverviewSummary {
  account: AdminAccount;
  preferences: SystemPreferences;
  notificationPreferences: NotificationPreferences;
  organization: OrganizationSettings;
  security: SecurityOverview;
  memberCounts: {
    total: number;
    active: number;
    pending: number;
    inactiveOrSuspended: number;
  };
}

class AdminSettingsService {
  private memoryMembers: OrganizationMember[] = [...MOCK_ORGANIZATION_MEMBERS];
  private memorySessions: AdminSessionRecord[] = [...MOCK_ADMIN_SESSIONS];
  private memoryPreferences: Record<string, SystemPreferences> = {
    ...MOCK_SYSTEM_PREFERENCES,
  };
  private memoryNotificationPreferences: Record<string, NotificationPreferences> = {
    ...MOCK_NOTIFICATION_PREFERENCES,
  };
  private memoryPasswords: Record<string, { hash: string; lastUpdated: string }> = {
    "admin-001": { hash: "Admin@123", lastUpdated: "2026-08-15T10:00:00Z" },
    "admin-002": { hash: "Admin@123", lastUpdated: "2026-08-20T14:30:00Z" },
  };

  /**
   * Normalize various role string representations into canonical AdminRole
   */
  public normalizeRole(roleString?: string | null): CanonicalAdminRole {
    if (!roleString) return "Administrator";
    const lower = roleString.toLowerCase().replace(/[-_]/g, " ");
    if (lower.includes("super") || lower === "admin" || lower.includes("administrator")) {
      return "Administrator";
    }
    if (lower.includes("manager")) {
      return "Operations Manager";
    }
    if (lower.includes("executive") || lower.includes("lead") || lower.includes("operations")) {
      return "Operations Executive";
    }
    return "Administrator";
  }

  /**
   * Normalize work area strings
   */
  public normalizeWorkArea(areaString?: string | null): PrimaryWorkArea {
    if (!areaString) return "Platform Operations";
    const lower = areaString.toLowerCase().replace(/[-_]/g, " ");
    if (lower.includes("customer")) return "Customer Operations";
    if (lower.includes("provider")) return "Provider Operations";
    if (lower.includes("delivery")) return "Delivery Operations";
    return "Platform Operations";
  }

  /* -------------------------------------------------------------------------- */
  /*                            ACCOUNT MANAGEMENT                              */
  /* -------------------------------------------------------------------------- */

  async getAccount(userId: string = "admin-001"): Promise<AdminAccount> {
    await new Promise((r) => setTimeout(r, 20));
    const profile = await adminAuthService.getProfile(userId);
    const org = await adminAuthService.getOrganization(profile.organizationId);

    return {
      id: profile.id,
      organizationId: profile.organizationId || org.id,
      fullName: profile.fullName,
      email: profile.workEmail,
      phone: profile.phone,
      profileImage: profile.profileImage,
      role: this.normalizeRole(profile.role),
      primaryWorkArea: this.normalizeWorkArea(profile.primaryWorkArea),
      preferredLanguage: (profile.preferredLanguage === "tamil" ? "Tamil" : "English") as PreferredLanguage,
      timezone: "Asia/Kolkata",
      status: (profile.status as any) || "Active",
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      lastLoginAt: "2026-09-10T16:45:00Z",
    };
  }

  async updateAccount(
    userId: string = "admin-001",
    data: AccountSettingsFormData & { profileImage?: string }
  ): Promise<AdminAccount> {
    await new Promise((r) => setTimeout(r, 40));
    
    // Sync with canonical A2 AdminProfile store
    await adminAuthService.updateProfile(userId, {
      fullName: data.fullName,
      workEmail: data.email,
      phone: data.phone,
      primaryWorkArea: data.primaryWorkArea.toLowerCase().replace(/\s+/g, "-") as any,
      preferredLanguage: data.preferredLanguage.toLowerCase() as any,
      timezone: data.timezone,
      ...(data.profileImage !== undefined ? { profileImage: data.profileImage } : {}),
      updatedAt: new Date().toISOString(),
    });

    // Also update member record if present
    const memberIdx = this.memoryMembers.findIndex(
      (m) => m.email === data.email || m.id === "ADM-0001"
    );
    if (memberIdx !== -1) {
      this.memoryMembers[memberIdx] = {
        ...this.memoryMembers[memberIdx],
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        primaryWorkArea: data.primaryWorkArea,
      };
    }

    return this.getAccount(userId);
  }

  /* -------------------------------------------------------------------------- */
  /*                         SYSTEM & USER PREFERENCES                          */
  /* -------------------------------------------------------------------------- */

  async getPreferences(userId: string = "admin-001"): Promise<SystemPreferences> {
    await new Promise((r) => setTimeout(r, 20));
    if (!this.memoryPreferences[userId]) {
      this.memoryPreferences[userId] = {
        userId,
        preferredLanguage: "English",
        timezone: "Asia/Kolkata",
        dateFormat: "DD/MM/YYYY",
        timeFormat: "12-hour",
        updatedAt: new Date().toISOString(),
      };
    }
    return { ...this.memoryPreferences[userId] };
  }

  async updatePreferences(
    userId: string = "admin-001",
    data: PreferencesSettingsFormData
  ): Promise<SystemPreferences> {
    await new Promise((r) => setTimeout(r, 30));
    this.memoryPreferences[userId] = {
      userId,
      preferredLanguage: data.preferredLanguage as PreferredLanguage,
      timezone: data.timezone as TimeZone,
      dateFormat: data.dateFormat as DateFormatOption,
      timeFormat: data.timeFormat as TimeFormatOption,
      updatedAt: new Date().toISOString(),
    };
    return { ...this.memoryPreferences[userId] };
  }

  /* -------------------------------------------------------------------------- */
  /*                          NOTIFICATION PREFERENCES                          */
  /* -------------------------------------------------------------------------- */

  async getNotificationPreferences(
    userId: string = "admin-001",
    organizationId: string = "ORG-0001"
  ): Promise<NotificationPreferences> {
    await new Promise((r) => setTimeout(r, 20));
    if (!this.memoryNotificationPreferences[userId]) {
      this.memoryNotificationPreferences[userId] = {
        userId,
        organizationId,
        booking: true,
        assignment: true,
        payment: true,
        review: true,
        provider: true,
        deliveryPartner: true,
        customer: true,
        service: true,
        system: true,
        updatedAt: new Date().toISOString(),
      };
    }
    return { ...this.memoryNotificationPreferences[userId] };
  }

  async updateNotificationPreferences(
    userId: string = "admin-001",
    organizationId: string = "ORG-0001",
    data: NotificationPreferencesFormData
  ): Promise<NotificationPreferences> {
    await new Promise((r) => setTimeout(r, 30));
    this.memoryNotificationPreferences[userId] = {
      userId,
      organizationId,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return { ...this.memoryNotificationPreferences[userId] };
  }

  async resetNotificationPreferences(
    userId: string = "admin-001",
    organizationId: string = "ORG-0001"
  ): Promise<NotificationPreferences> {
    await new Promise((r) => setTimeout(r, 30));
    this.memoryNotificationPreferences[userId] = {
      userId,
      organizationId,
      booking: true,
      assignment: true,
      payment: true,
      review: true,
      provider: true,
      deliveryPartner: true,
      customer: true,
      service: true,
      system: true,
      updatedAt: new Date().toISOString(),
    };
    return { ...this.memoryNotificationPreferences[userId] };
  }

  /* -------------------------------------------------------------------------- */
  /*                           SECURITY & SESSIONS                              */
  /* -------------------------------------------------------------------------- */

  async getSecurityOverview(
    userId: string = "admin-001",
    organizationId: string = "ORG-0001"
  ): Promise<SecurityOverview> {
    await new Promise((r) => setTimeout(r, 20));
    const pass = this.memoryPasswords[userId] || {
      hash: "Admin@123",
      lastUpdated: "2026-08-15T10:00:00Z",
    };
    const sessions = this.memorySessions.filter(
      (s) => s.userId === userId && s.organizationId === organizationId
    );

    return {
      passwordStatus: "Set",
      lastPasswordUpdate: pass.lastUpdated,
      activeSessions: sessions,
    };
  }

  async changePassword(
    userId: string = "admin-001",
    data: ChangePasswordFormData
  ): Promise<{ success: boolean; message: string }> {
    await new Promise((r) => setTimeout(r, 50));
    const currentStored = this.memoryPasswords[userId]?.hash || "Admin@123";

    if (data.currentPassword !== currentStored) {
      throw new Error("Current password is incorrect. (Mock default is Admin@123)");
    }

    this.memoryPasswords[userId] = {
      hash: data.newPassword,
      lastUpdated: new Date().toISOString(),
    };

    return {
      success: true,
      message: "Password updated successfully.",
    };
  }

  async signOutOtherSessions(
    userId: string = "admin-001",
    organizationId: string = "ORG-0001"
  ): Promise<AdminSessionRecord[]> {
    await new Promise((r) => setTimeout(r, 40));
    this.memorySessions = this.memorySessions.filter(
      (s) => s.userId !== userId || s.isCurrent
    );
    return this.memorySessions.filter(
      (s) => s.userId === userId && s.organizationId === organizationId
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                            ORGANIZATION SETTINGS                           */
  /* -------------------------------------------------------------------------- */

  async getOrganizationSettings(
    organizationId: string = "ORG-0001"
  ): Promise<OrganizationSettings> {
    await new Promise((r) => setTimeout(r, 20));
    const org = await adminAuthService.getOrganization(organizationId);

    const typeMapping: Record<string, "WASHORA" | "Partner Organization" | "Internal Operations"> = {
      washora: "WASHORA",
      partner: "Partner Organization",
      "internal-operations": "Internal Operations",
    };

    return {
      organizationId: org.id,
      organizationName: org.name,
      organizationEmail: org.email,
      organizationPhone: org.phone,
      organizationType: typeMapping[org.type] || "WASHORA",
      organizationStatus: org.status as any,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
    };
  }

  async updateOrganizationSettings(
    organizationId: string = "ORG-0001",
    data: OrganizationSettingsFormData
  ): Promise<OrganizationSettings> {
    await new Promise((r) => setTimeout(r, 40));

    const reverseType: Record<string, any> = {
      WASHORA: "washora",
      "Partner Organization": "partner",
      "Internal Operations": "internal-operations",
    };

    await adminAuthService.updateOrganization(organizationId, {
      name: data.organizationName,
      email: data.organizationEmail,
      phone: data.organizationPhone,
      type: reverseType[data.organizationType] || "washora",
      updatedAt: new Date().toISOString(),
    });

    return this.getOrganizationSettings(organizationId);
  }

  /* -------------------------------------------------------------------------- */
  /*                          ORGANIZATION MEMBERS CRUD                         */
  /* -------------------------------------------------------------------------- */

  async getMembers(
    organizationId: string = "ORG-0001",
    params: MembersFilterParams = {}
  ): Promise<PaginatedMembersResult> {
    if (isLiveMode()) {
      const res = await adminApi.members.list({
        page: params.page,
        limit: params.limit,
        search: params.search,
      });
      const members: OrganizationMember[] = (res.data || []).map((m: any) => ({
        id: m.id,
        organizationId: m.organizationId || organizationId,
        fullName: m.fullName || m.user?.fullName || "Staff Member",
        email: m.email || m.user?.email || "staff@washora.com",
        phone: m.phone || m.user?.phone || "+91 98765 00000",
        role: (m.role || "Administrator") as CanonicalAdminRole,
        primaryWorkArea: (m.primaryWorkArea || "Operations & Dispatch") as PrimaryWorkArea,
        status: (m.status || "Active") as any,
        joinedAt: m.createdAt || m.joinedAt || new Date().toISOString(),
        lastActiveAt: m.lastActiveAt,
      }));
      const meta = (res as any).meta || { page: params.page || 1, limit: params.limit || 10, total: members.length, totalPages: 1 };
      return {
        members,
        total: meta.total,
        page: meta.page,
        limit: meta.limit,
        totalPages: meta.totalPages || Math.ceil(meta.total / (meta.limit || 10)),
      };
    }

    await new Promise((r) => setTimeout(r, 30));

    // Strict multi-tenant isolation by organizationId
    let filtered = this.memoryMembers.filter(
      (m) => m.organizationId === organizationId
    );

    // Search query
    if (params.search?.trim()) {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(
        (m) =>
          m.id.toLowerCase().includes(q) ||
          m.fullName.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.phone.includes(q)
      );
    }

    // Role filter
    if (params.role && params.role !== "ALL") {
      filtered = filtered.filter((m) => m.role === params.role);
    }

    // Work Area filter
    if (params.workArea && params.workArea !== "ALL") {
      filtered = filtered.filter((m) => m.primaryWorkArea === params.workArea);
    }

    // Status filter
    if (params.status && params.status !== "ALL") {
      filtered = filtered.filter((m) => m.status === params.status);
    }

    // Sorting
    const sortBy = params.sortBy || "joinedAt";
    const sortOrder = params.sortOrder || "desc";

    filtered.sort((a, b) => {
      const key = sortBy === "name" ? "fullName" : sortBy;
      let valA: any = a[key as keyof OrganizationMember] || "";
      let valB: any = b[key as keyof OrganizationMember] || "";
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    // Pagination
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, params.limit || 10);
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return {
      members: paginated,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getMemberById(
    organizationId: string = "ORG-0001",
    memberId: string
  ): Promise<OrganizationMember | null> {
    if (isLiveMode()) {
      try {
        const res = await adminApi.members.getById(memberId);
        if (!res.data) return null;
        const m = res.data;
        return {
          id: m.id,
          organizationId: m.organizationId || organizationId,
          fullName: m.fullName || m.user?.fullName || "Staff Member",
          email: m.email || m.user?.email || "staff@washora.com",
          phone: m.phone || m.user?.phone || "+91 98765 00000",
          role: (m.role || "Administrator") as CanonicalAdminRole,
          primaryWorkArea: (m.primaryWorkArea || "Operations & Dispatch") as PrimaryWorkArea,
          status: (m.status || "Active") as any,
          joinedAt: m.createdAt || m.joinedAt || new Date().toISOString(),
          lastActiveAt: m.lastActiveAt,
        };
      } catch (err: any) {
        if (err?.status === 404 || err?.statusCode === 404) return null;
        throw err;
      }
    }

    await new Promise((r) => setTimeout(r, 20));
    const member = this.memoryMembers.find(
      (m) => m.organizationId === organizationId && m.id === memberId
    );
    return member ? { ...member } : null;
  }

  async createMember(
    organizationId: string = "ORG-0001",
    data: AddMemberFormData
  ): Promise<OrganizationMember> {
    if (isLiveMode()) {
      await adminApi.members.create({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        role: data.role,
        primaryWorkArea: data.primaryWorkArea,
      });
      return {
        id: `ADM-${Date.now()}`,
        organizationId,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        role: data.role as CanonicalAdminRole,
        primaryWorkArea: data.primaryWorkArea as PrimaryWorkArea,
        status: (data.status || "Active") as any,
        joinedAt: new Date().toISOString(),
        lastActiveAt: undefined,
      };
    }

    await new Promise((r) => setTimeout(r, 40));

    // Next ID generation
    const highestNum = this.memoryMembers.reduce((max, m) => {
      const num = parseInt(m.id.replace(/\D/g, ""), 10);
      return isNaN(num) ? max : Math.max(max, num);
    }, 18);

    const nextId = `ADM-${String(highestNum + 1).padStart(4, "0")}`;

    const newMember: OrganizationMember = {
      id: nextId,
      organizationId,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      role: data.role as CanonicalAdminRole,
      primaryWorkArea: data.primaryWorkArea as PrimaryWorkArea,
      status: data.status as any,
      joinedAt: new Date().toISOString(),
      lastActiveAt: undefined,
    };

    this.memoryMembers.unshift(newMember);
    return { ...newMember };
  }

  async updateMember(
    organizationId: string = "ORG-0001",
    memberId: string,
    data: EditMemberFormData
  ): Promise<OrganizationMember> {
    if (isLiveMode()) {
      await adminApi.members.update(memberId, {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        role: data.role,
        primaryWorkArea: data.primaryWorkArea,
      });
      return {
        id: memberId,
        organizationId,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        role: data.role as CanonicalAdminRole,
        primaryWorkArea: data.primaryWorkArea as PrimaryWorkArea,
        status: (data.status || "Active") as any,
        joinedAt: new Date().toISOString(),
        lastActiveAt: undefined,
      };
    }

    await new Promise((r) => setTimeout(r, 40));

    const idx = this.memoryMembers.findIndex(
      (m) => m.organizationId === organizationId && m.id === memberId
    );

    if (idx === -1) {
      throw new Error(`Member ${memberId} not found in organization ${organizationId}.`);
    }

    this.memoryMembers[idx] = {
      ...this.memoryMembers[idx],
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      role: data.role as CanonicalAdminRole,
      primaryWorkArea: data.primaryWorkArea as PrimaryWorkArea,
      status: data.status as any,
    };

    return { ...this.memoryMembers[idx] };
  }

  async updateMemberStatus(
    organizationId: string = "ORG-0001",
    memberId: string,
    newStatus: "Active" | "Inactive" | "Pending" | "Suspended"
  ): Promise<OrganizationMember> {
    await new Promise((r) => setTimeout(r, 40));

    const idx = this.memoryMembers.findIndex(
      (m) => m.organizationId === organizationId && m.id === memberId
    );

    if (idx === -1) {
      throw new Error(`Member ${memberId} not found.`);
    }

    this.memoryMembers[idx] = {
      ...this.memoryMembers[idx],
      status: newStatus,
    };

    return { ...this.memoryMembers[idx] };
  }

  /* -------------------------------------------------------------------------- */
  /*                            ROLES & PERMISSIONS                             */
  /* -------------------------------------------------------------------------- */

  getRolePermissionSets(): Record<CanonicalAdminRole, RolePermissionSet> {
    return MOCK_ROLE_PERMISSION_SETS;
  }

  getAllPermissionDefinitions() {
    return ALL_ADMIN_PERMISSIONS;
  }

  hasPermission(role: string | null | undefined, permission: string): boolean {
    if (!role) return false;
    const normalized = this.normalizeRole(role);
    const roleSet = MOCK_ROLE_PERMISSION_SETS[normalized];
    return roleSet?.permissions.includes(permission) || false;
  }

  getPermissionsForRole(role: string | null | undefined): string[] {
    if (!role) return [];
    const normalized = this.normalizeRole(role);
    return MOCK_ROLE_PERMISSION_SETS[normalized]?.permissions || [];
  }

  /* -------------------------------------------------------------------------- */
  /*                          SETTINGS OVERVIEW SUMMARY                         */
  /* -------------------------------------------------------------------------- */

  async getSettingsOverview(
    userId: string = "admin-001",
    organizationId: string = "ORG-0001"
  ): Promise<SettingsOverviewSummary> {
    const [account, preferences, notificationPreferences, organization, security, membersResult] =
      await Promise.all([
        this.getAccount(userId),
        this.getPreferences(userId),
        this.getNotificationPreferences(userId, organizationId),
        this.getOrganizationSettings(organizationId),
        this.getSecurityOverview(userId, organizationId),
        this.getMembers(organizationId, { limit: 100 }),
      ]);

    const active = membersResult.members.filter((m) => m.status === "Active").length;
    const pending = membersResult.members.filter((m) => m.status === "Pending").length;
    const inactiveOrSuspended = membersResult.members.filter(
      (m) => m.status === "Inactive" || m.status === "Suspended"
    ).length;

    return {
      account,
      preferences,
      notificationPreferences,
      organization,
      security,
      memberCounts: {
        total: membersResult.total,
        active,
        pending,
        inactiveOrSuspended,
      },
    };
  }
}

export const adminSettingsService = new AdminSettingsService();
