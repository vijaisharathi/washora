import {
  AdminSession,
  AdminLoginCredentials,
  AdminRole,
  AdminSystemStatusSummary,
  AdminOnboardingData,
  AdminUser,
  AdminProfile,
  Organization,
} from "@/types/admin";
import {
  MOCK_ADMIN_SESSION,
  MOCK_ADMIN_USER_1,
  MOCK_ADMIN_USER_2,
  MOCK_ADMIN_ONBOARDING_DRAFTS,
  MOCK_ADMIN_SYSTEM_STATUS,
  MOCK_ADMIN_PROFILES,
  MOCK_ORGANIZATIONS,
} from "@/mocks/admin/session.mock";
import { isLiveMode } from "@/lib/api/mode";
import { adminApi } from "@/features/admin/api/adminApi";
import { setTokens, clearTokens, getAccessToken, getRefreshToken, setOrganizationId } from "@/lib/api/token-store";

function mapBackendUserToAdminUser(user: any, orgId: string = "ORG-0001"): AdminUser {
  const isSuperAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  const mappedRole: AdminRole = isSuperAdmin ? "SUPER_ADMIN" : "OPERATIONS_MANAGER";
  return {
    id: user.id,
    name: user.fullName || user.email?.split("@")[0] || "Admin",
    email: user.email,
    role: mappedRole,
    avatarUrl: user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256",
    department: isSuperAdmin ? "Executive Leadership" : "Regional Operations & Logistics",
    assignedZones: ["South Mumbai Core", "Bandra-Kurla Complex", "Andheri West"],
    permissions: isSuperAdmin
      ? ["all", "admin.access", "ops.access", "financial.override", "audit.view"]
      : ["ops.access", "bookings.manage", "dispatch.manage", "tickets.manage", "reviews.moderate"],
    lastActive: new Date().toISOString(),
    onboardingCompleted: true,
    organizationId: orgId,
  };
}

const STORAGE_ADMIN_SESSION_KEY = "washora_admin_session_v1";
const STORAGE_ADMIN_ONBOARDING_PREFIX = "washora_admin_onboarding_";
const STORAGE_ADMIN_PROFILE_PREFIX = "washora_admin_profile_";
const STORAGE_ADMIN_ORG_PREFIX = "washora_admin_org_";

export interface IAdminAuthService {
  getSession(): Promise<AdminSession>;
  login(credentials: AdminLoginCredentials): Promise<AdminSession>;
  logout(): Promise<void>;
  switchRole(role: AdminRole): Promise<AdminSession>;
  getSystemStatus(): Promise<AdminSystemStatusSummary>;
  getOnboardingData(userId?: string): Promise<AdminOnboardingData>;
  saveOnboardingStep(
    userId: string,
    stepData: Partial<AdminOnboardingData>,
    nextStep?: number
  ): Promise<AdminOnboardingData>;
  completeOnboarding(
    userId: string,
    finalData: AdminOnboardingData
  ): Promise<AdminSession>;
  getProfile(userId?: string): Promise<AdminProfile>;
  updateProfile(
    userId: string,
    updates: Partial<AdminProfile>
  ): Promise<AdminProfile>;
  getOrganization(organizationId?: string): Promise<Organization>;
  updateOrganization(
    organizationId: string,
    updates: Partial<Organization>
  ): Promise<Organization>;
}

class AdminAuthService implements IAdminAuthService {
  private memorySession: AdminSession | null = null;
  private memoryOnboarding: Record<string, AdminOnboardingData> = {
    ...MOCK_ADMIN_ONBOARDING_DRAFTS,
  };
  private memoryUsers: Record<string, AdminUser> = {
    "admin-001": { ...MOCK_ADMIN_USER_1 },
    "admin-002": { ...MOCK_ADMIN_USER_2 },
  };
  private memoryProfiles: Record<string, AdminProfile> = {
    ...MOCK_ADMIN_PROFILES,
  };
  private memoryOrganizations: Record<string, Organization> = {
    ...MOCK_ORGANIZATIONS,
  };

  private getStoredSession(): AdminSession | null {
    if (this.memorySession) return this.memorySession;
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(STORAGE_ADMIN_SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private persistSession(session: AdminSession | null): void {
    this.memorySession = session;
    if (typeof window === "undefined") return;
    try {
      if (session) {
        localStorage.setItem(STORAGE_ADMIN_SESSION_KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(STORAGE_ADMIN_SESSION_KEY);
      }
    } catch {
      // ignore
    }
  }

  async getSession(): Promise<AdminSession> {
    if (isLiveMode()) {
      const token = getAccessToken();
      if (!token) {
        return {
          isAuthenticated: false,
          token: undefined,
          user: null,
          role: null,
          onboardingCompleted: false,
        };
      }
      try {
        const meRes = await adminApi.auth.getMe();
        const user = meRes.data;
        if (user.role !== "ADMIN" && user.role !== "OPERATIONS") {
          clearTokens();
          return {
            isAuthenticated: false,
            token: undefined,
            user: null,
            role: null,
            onboardingCompleted: false,
          };
        }
        const orgId = user.organizationId || "ORG-0001";
        setOrganizationId(orgId);
        const adminUser = mapBackendUserToAdminUser(user, orgId);
        const session: AdminSession = {
          isAuthenticated: true,
          token,
          userId: adminUser.id,
          user: adminUser,
          role: adminUser.role,
          onboardingCompleted: true,
          lastActive: new Date().toISOString(),
        };
        this.persistSession(session);
        return session;
      } catch {
        clearTokens();
        return {
          isAuthenticated: false,
          token: undefined,
          user: null,
          role: null,
          onboardingCompleted: false,
        };
      }
    }

    await new Promise((res) => setTimeout(res, 30));
    const stored = this.getStoredSession();
    if (stored) {
      return stored;
    }

    // Default mock session for development/demo (admin-001)
    const initialSession = {
      ...MOCK_ADMIN_SESSION,
      user: this.memoryUsers["admin-001"],
      onboardingCompleted: this.memoryUsers["admin-001"].onboardingCompleted,
    };
    this.persistSession(initialSession);
    return initialSession;
  }

  async login(credentials: AdminLoginCredentials): Promise<AdminSession> {
    if (isLiveMode()) {
      const res = await adminApi.auth.login({
        email: credentials.email,
        password: credentials.password,
      });
      const { user, tokens } = res.data;
      const role = user?.role;
      if (role !== "ADMIN" && role !== "OPERATIONS") {
        clearTokens();
        throw new Error("Access denied: Account does not have ADMIN or OPERATIONS role.");
      }
      setTokens({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
      });
      const orgId = user.organizationId || "ORG-0001";
      setOrganizationId(orgId);
      const adminUser = mapBackendUserToAdminUser(user, orgId);
      const session: AdminSession = {
        isAuthenticated: true,
        token: tokens.accessToken,
        userId: adminUser.id,
        user: adminUser,
        role: adminUser.role,
        onboardingCompleted: true,
        expiresAt: new Date(Date.now() + tokens.expiresIn * 1000).toISOString(),
        lastActive: new Date().toISOString(),
      };
      this.persistSession(session);
      return session;
    }

    await new Promise((res) => setTimeout(res, 80));

    const email = credentials.email.trim().toLowerCase();
    const password = credentials.password?.trim() || "";

    let matchedUser: AdminUser | null = null;

    if (
      (email === "admin@example.com" || email === "priyanshu.admin@washora.example.com") &&
      (password === "Admin@123" || password === "password123")
    ) {
      matchedUser = this.memoryUsers["admin-001"];
    } else if (
      (email === "ops@example.com" || email === "ananya.ops@washora.example.com") &&
      (password === "Admin@123" || password === "password123")
    ) {
      matchedUser = this.memoryUsers["admin-002"];
    } else if (credentials.role === "OPERATIONS_MANAGER" || email.includes("ops")) {
      if (password === "Admin@123" || password === "password123") {
        matchedUser = this.memoryUsers["admin-002"];
      }
    } else if (credentials.role === "SUPER_ADMIN" || email.includes("admin")) {
      if (password === "Admin@123" || password === "password123") {
        matchedUser = this.memoryUsers["admin-001"];
      }
    }

    if (!matchedUser) {
      throw new Error("Invalid email or password.");
    }

    const session: AdminSession = {
      isAuthenticated: true,
      token: `washora_admin_token_${Date.now()}`,
      userId: matchedUser.id,
      user: matchedUser,
      role: matchedUser.role,
      onboardingCompleted: matchedUser.onboardingCompleted,
      expiresAt: "2026-12-31T23:59:59Z",
      lastActive: new Date().toISOString(),
    };

    this.persistSession(session);
    return session;
  }

  async logout(): Promise<void> {
    if (isLiveMode()) {
      try {
        const rf = getRefreshToken();
        await adminApi.auth.logout(rf || undefined);
      } catch {
        // continue
      }
      clearTokens();
      this.memorySession = null;
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem(STORAGE_ADMIN_SESSION_KEY);
        } catch {
          // ignore
        }
      }
      return;
    }

    await new Promise((res) => setTimeout(res, 40));
    this.memorySession = null;
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_ADMIN_SESSION_KEY);
      } catch {
        // ignore
      }
    }
  }

  async switchRole(role: AdminRole): Promise<AdminSession> {
    await new Promise((res) => setTimeout(res, 40));

    let user = this.memoryUsers["admin-001"];
    if (role === "operations" || role === "OPERATIONS_MANAGER") {
      user = this.memoryUsers["admin-002"];
    }

    const current = await this.getSession();
    const updated: AdminSession = {
      ...current,
      role: user.role,
      userId: user.id,
      user,
      onboardingCompleted: user.onboardingCompleted,
      lastActive: new Date().toISOString(),
    };

    this.persistSession(updated);
    return updated;
  }

  async getOnboardingData(userId?: string): Promise<AdminOnboardingData> {
    await new Promise((res) => setTimeout(res, 40));
    const targetUserId = userId || (await this.getSession()).userId || "admin-001";

    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORAGE_ADMIN_ONBOARDING_PREFIX + targetUserId);
        if (raw) {
          return JSON.parse(raw);
        }
      } catch {
        // ignore
      }
    }

    if (this.memoryOnboarding[targetUserId]) {
      return this.memoryOnboarding[targetUserId];
    }

    const defaultData: AdminOnboardingData = {
      userId: targetUserId,
      fullName: "",
      workEmail: "",
      phone: "",
      organizationName: "WASHORA Technologies India Pvt Ltd",
      organizationEmail: "operations@washora.example.com",
      organizationPhone: "+91 80234 56789",
      organizationType: "washora",
      role: "administrator",
      primaryWorkArea: "platform-operations",
      preferredLanguage: "english",
      timezone: "Asia/Kolkata",
      currentStep: 1,
    };

    return defaultData;
  }

  async saveOnboardingStep(
    userId: string,
    stepData: Partial<AdminOnboardingData>,
    nextStep?: number
  ): Promise<AdminOnboardingData> {
    await new Promise((res) => setTimeout(res, 50));
    const current = await this.getOnboardingData(userId);
    const updated: AdminOnboardingData = {
      ...current,
      ...stepData,
      currentStep: nextStep !== undefined ? nextStep : current.currentStep,
    };

    this.memoryOnboarding[userId] = updated;

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          STORAGE_ADMIN_ONBOARDING_PREFIX + userId,
          JSON.stringify(updated)
        );
      } catch {
        // ignore
      }
    }

    return updated;
  }

  async completeOnboarding(
    userId: string,
    finalData: AdminOnboardingData
  ): Promise<AdminSession> {
    await new Promise((res) => setTimeout(res, 80));

    // 1. Save final onboarding snapshot
    await this.saveOnboardingStep(userId, finalData, 4);

    // 2. Update User in memory
    const user = this.memoryUsers[userId] || {
      id: userId,
      name: finalData.fullName,
      email: finalData.workEmail,
      role: finalData.role === "administrator" ? "admin" : "operations",
      avatarUrl: finalData.profileImage || "",
      department: "Operational Governance",
      assignedZones: ["ALL_ZONES"],
      permissions: ["*"],
      lastActive: new Date().toISOString(),
      onboardingCompleted: true,
      organizationId: userId === "admin-002" ? "ORG-0002" : "ORG-0001",
    };

    user.name = finalData.fullName || user.name;
    user.email = finalData.workEmail || user.email;
    user.avatarUrl = finalData.profileImage || user.avatarUrl;
    user.onboardingCompleted = true;
    this.memoryUsers[userId] = user;

    // 3. Update / Seed Canonical AdminProfile
    const orgId = user.organizationId || (userId === "admin-002" ? "ORG-0002" : "ORG-0001");
    const profile: AdminProfile = {
      id: userId === "admin-002" ? "ADM-0002" : "ADM-0001",
      userId,
      organizationId: orgId,
      fullName: finalData.fullName || user.name,
      workEmail: finalData.workEmail || user.email,
      phone: finalData.phone || "+91 98765 43210",
      profileImage: finalData.profileImage || user.avatarUrl,
      role: user.role,
      primaryWorkArea: finalData.primaryWorkArea || "platform-operations",
      preferredLanguage: finalData.preferredLanguage || "english",
      timezone: finalData.timezone || "Asia/Kolkata",
      status: "Active",
      createdAt: this.memoryProfiles[userId]?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.memoryProfiles[userId] = profile;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_ADMIN_PROFILE_PREFIX + userId, JSON.stringify(profile));
      } catch {
        // ignore
      }
    }

    // 4. Update / Seed Canonical Organization
    const currentOrg = this.memoryOrganizations[orgId] || {
      id: orgId,
      name: finalData.organizationName,
      email: finalData.organizationEmail,
      phone: finalData.organizationPhone,
      type: finalData.organizationType,
      status: "Active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedOrg: Organization = {
      ...currentOrg,
      name: finalData.organizationName || currentOrg.name,
      email: finalData.organizationEmail || currentOrg.email,
      phone: finalData.organizationPhone || currentOrg.phone,
      type: finalData.organizationType || currentOrg.type,
      updatedAt: new Date().toISOString(),
    };
    this.memoryOrganizations[orgId] = updatedOrg;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_ADMIN_ORG_PREFIX + orgId, JSON.stringify(updatedOrg));
      } catch {
        // ignore
      }
    }

    // 5. Update Session
    const currentSession = await this.getSession();
    const updatedSession: AdminSession = {
      ...currentSession,
      isAuthenticated: true,
      userId,
      user,
      onboardingCompleted: true,
      lastActive: new Date().toISOString(),
    };

    this.persistSession(updatedSession);
    return updatedSession;
  }

  async getProfile(userId?: string): Promise<AdminProfile> {
    await new Promise((res) => setTimeout(res, 40));
    const targetUserId = userId || (await this.getSession()).userId || "admin-001";

    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORAGE_ADMIN_PROFILE_PREFIX + targetUserId);
        if (raw) {
          return JSON.parse(raw);
        }
      } catch {
        // ignore
      }
    }

    if (this.memoryProfiles[targetUserId]) {
      return this.memoryProfiles[targetUserId];
    }

    // Fallback: create from user/onboarding
    const user = this.memoryUsers[targetUserId] || MOCK_ADMIN_USER_1;
    const orgId = user.organizationId || (targetUserId === "admin-002" ? "ORG-0002" : "ORG-0001");
    const fallbackProfile: AdminProfile = {
      id: targetUserId === "admin-002" ? "ADM-0002" : "ADM-0001",
      userId: targetUserId,
      organizationId: orgId,
      fullName: user.name,
      workEmail: user.email,
      phone: "+91 98765 43210",
      profileImage: user.avatarUrl,
      role: user.role,
      primaryWorkArea: "platform-operations",
      preferredLanguage: "english",
      timezone: "Asia/Kolkata",
      status: "Active",
      createdAt: "2025-01-15T09:00:00Z",
      updatedAt: new Date().toISOString(),
    };
    this.memoryProfiles[targetUserId] = fallbackProfile;
    return fallbackProfile;
  }

  async updateProfile(
    userId: string,
    updates: Partial<AdminProfile>
  ): Promise<AdminProfile> {
    await new Promise((res) => setTimeout(res, 60));
    const current = await this.getProfile(userId);

    // Protect immutable / authorization fields:
    // id, userId, organizationId, and role CANNOT be changed from profile edit.
    const updated: AdminProfile = {
      ...current,
      fullName: updates.fullName !== undefined ? updates.fullName.trim() : current.fullName,
      workEmail: updates.workEmail !== undefined ? updates.workEmail.trim() : current.workEmail,
      phone: updates.phone !== undefined ? updates.phone.trim() : current.phone,
      profileImage:
        updates.profileImage !== undefined ? updates.profileImage : current.profileImage,
      primaryWorkArea: updates.primaryWorkArea || current.primaryWorkArea,
      preferredLanguage: updates.preferredLanguage || current.preferredLanguage,
      timezone: updates.timezone || current.timezone,
      updatedAt: new Date().toISOString(),
    };

    this.memoryProfiles[userId] = updated;

    // Update user in memory & session if needed
    if (this.memoryUsers[userId]) {
      this.memoryUsers[userId] = {
        ...this.memoryUsers[userId],
        name: updated.fullName,
        email: updated.workEmail,
        avatarUrl: updated.profileImage || this.memoryUsers[userId].avatarUrl,
      };
    }

    const currentSession = this.getStoredSession();
    if (currentSession && (currentSession.userId === userId || currentSession.user?.id === userId)) {
      currentSession.user = {
        ...currentSession.user!,
        name: updated.fullName,
        email: updated.workEmail,
        avatarUrl: updated.profileImage || currentSession.user!.avatarUrl,
      };
      this.persistSession(currentSession);
    }

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          STORAGE_ADMIN_PROFILE_PREFIX + userId,
          JSON.stringify(updated)
        );
      } catch {
        // ignore
      }
    }

    return updated;
  }

  async getOrganization(organizationId?: string): Promise<Organization> {
    if (isLiveMode()) {
      const res = await adminApi.organization.get();
      const org = res.data;
      return {
        id: org.id || organizationId || "ORG-0001",
        name: org.name || "WASHORA Operations",
        email: org.contactEmail || org.email || "admin@washora.example.com",
        phone: org.contactPhone || org.phone || "+91 80234 56789",
        type: (org.type?.toLowerCase() as any) || "washora",
        status: (org.status === "ACTIVE" ? "Active" : org.status) as any || "Active",
        createdAt: org.createdAt || new Date().toISOString(),
        updatedAt: org.updatedAt || new Date().toISOString(),
      };
    }

    await new Promise((res) => setTimeout(res, 40));
    let targetOrgId = organizationId;

    if (!targetOrgId) {
      const session = await this.getSession();
      const profile = await this.getProfile(session.userId || "admin-001");
      targetOrgId = profile.organizationId || "ORG-0001";
    }

    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORAGE_ADMIN_ORG_PREFIX + targetOrgId);
        if (raw) {
          return JSON.parse(raw);
        }
      } catch {
        // ignore
      }
    }

    if (this.memoryOrganizations[targetOrgId]) {
      return this.memoryOrganizations[targetOrgId];
    }

    const fallbackOrg: Organization = {
      id: targetOrgId,
      name: "WASHORA Technologies India Pvt Ltd",
      email: "operations@washora.example.com",
      phone: "+91 80234 56789",
      type: "washora",
      status: "Active",
      createdAt: "2025-01-15T09:00:00Z",
      updatedAt: new Date().toISOString(),
    };
    this.memoryOrganizations[targetOrgId] = fallbackOrg;
    return fallbackOrg;
  }

  async updateOrganization(
    organizationId: string,
    updates: Partial<Organization>
  ): Promise<Organization> {
    if (isLiveMode()) {
      const res = await adminApi.organization.update({
        name: updates.name,
        contactEmail: updates.email,
        contactPhone: updates.phone,
      });
      const org = res.data;
      return {
        id: org.id || organizationId,
        name: org.name || updates.name || "WASHORA Operations",
        email: org.contactEmail || updates.email || "admin@washora.example.com",
        phone: org.contactPhone || updates.phone || "+91 80234 56789",
        type: updates.type || "washora",
        status: (org.status === "ACTIVE" ? "Active" : org.status) as any || "Active",
        createdAt: org.createdAt || new Date().toISOString(),
        updatedAt: org.updatedAt || new Date().toISOString(),
      };
    }

    await new Promise((res) => setTimeout(res, 60));
    const current = await this.getOrganization(organizationId);

    // Protect immutable metadata: id, status, createdAt cannot be modified by edit form
    const updated: Organization = {
      ...current,
      name: updates.name !== undefined ? updates.name.trim() : current.name,
      email: updates.email !== undefined ? updates.email.trim() : current.email,
      phone: updates.phone !== undefined ? updates.phone.trim() : current.phone,
      type: updates.type || current.type,
      updatedAt: new Date().toISOString(),
    };

    this.memoryOrganizations[organizationId] = updated;

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          STORAGE_ADMIN_ORG_PREFIX + organizationId,
          JSON.stringify(updated)
        );
      } catch {
        // ignore
      }
    }

    return updated;
  }

  async getSystemStatus(): Promise<AdminSystemStatusSummary> {
    await new Promise((res) => setTimeout(res, 30));
    return MOCK_ADMIN_SYSTEM_STATUS;
  }
}

export const adminAuthService = new AdminAuthService();
