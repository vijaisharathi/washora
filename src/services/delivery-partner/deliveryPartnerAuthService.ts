import {
  DeliveryPartnerProfile,
  DeliveryPartnerSession,
  DeliveryPartnerStatus,
  DeliveryPartnerAuthCredentials,
  DeliveryPartnerRegisterPayload,
  DeliveryPartnerOnboardingDraft,
  DeliveryPartnerOnboardingStatus,
} from "@/types/delivery-partner";
import { MOCK_DELIVERY_PARTNER_SESSION } from "@/mocks/delivery-partner/session.mock";
import {
  MOCK_DELIVERY_PARTNER_ONBOARDING_DRAFT,
  MOCK_DELIVERY_PARTNER_ONBOARDING_STATUS,
} from "@/mocks/delivery-partner/onboarding.mock";
import { deliveryPartnerApi } from "@/features/delivery-partner/api/deliveryPartnerApi";
import { isLiveMode } from "@/lib/api/mode";
import { setTokens, clearTokens, setOrganizationId, getAccessToken } from "@/lib/api/token-store";

const STORAGE_SESSION_KEY = "washora_delivery_partner_session";
const STORAGE_ONBOARDING_KEY = "washora_delivery_partner_onboarding_draft";
const STORAGE_STATUS_KEY = "washora_delivery_partner_onboarding_status";

let inMemorySession: DeliveryPartnerSession = { ...MOCK_DELIVERY_PARTNER_SESSION };
let inMemoryOnboardingDraft: DeliveryPartnerOnboardingDraft = { ...MOCK_DELIVERY_PARTNER_ONBOARDING_DRAFT };
let inMemoryOnboardingStatus: DeliveryPartnerOnboardingStatus = { ...MOCK_DELIVERY_PARTNER_ONBOARDING_STATUS };

function mapBackendToPartnerProfile(user: any, profile?: any): DeliveryPartnerProfile {
  return {
    id: profile?.id || user?.id || "dp-1",
    name: user?.fullName || "Valet Partner",
    phone: user?.phone || "+91 98765 43210",
    email: user?.email || "partner@washora.example.com",
    avatarUrl: user?.avatarUrl,
    rating: profile?.ratingAvg ? Number(profile.ratingAvg) : 4.85,
    totalDeliveries: profile?.activeDeliveriesCount ? Number(profile.activeDeliveriesCount) : 42,
    acceptanceRate: 98,
    onTimeRate: 99,
    vehicleType: profile?.vehicleType || "SCOOTER",
    vehicleModel: "Hero Electric Optima",
    vehiclePlate: profile?.vehicleNumber || "KA-01-EQ-9042",
    status: (profile?.status as DeliveryPartnerStatus) || "ONLINE",
    isKycVerified: profile?.verificationStatus === "VERIFIED",
    city: "Bangalore",
    hubName: "Indiranagar Hub #04",
    joinedDate: profile?.createdAt || "2026-01-15",
  };
}

export interface IDeliveryPartnerAuthService {
  getSession(): Promise<DeliveryPartnerSession>;
  getProfile(): Promise<DeliveryPartnerProfile | null>;
  login(credentials: DeliveryPartnerAuthCredentials): Promise<DeliveryPartnerSession>;
  register(payload: DeliveryPartnerRegisterPayload): Promise<{ success: boolean; tempToken: string }>;
  verifyPhone(payload: { phone: string; otp: string }): Promise<DeliveryPartnerSession>;
  forgotPassword(identifier: string): Promise<{ success: boolean; message: string }>;
  resetPassword(payload: { newPassword: string; token: string }): Promise<{ success: boolean }>;
  updateStatus(status: DeliveryPartnerStatus): Promise<DeliveryPartnerProfile>;
  logout(): Promise<void>;
  restoreSession(): Promise<DeliveryPartnerSession>;
  getOnboardingDraft(): Promise<DeliveryPartnerOnboardingDraft>;
  saveOnboardingDraft(draft: Partial<DeliveryPartnerOnboardingDraft>): Promise<DeliveryPartnerOnboardingDraft>;
  submitOnboarding(draft: DeliveryPartnerOnboardingDraft): Promise<DeliveryPartnerOnboardingStatus>;
  getOnboardingStatus(): Promise<DeliveryPartnerOnboardingStatus>;
}

class DeliveryPartnerAuthService implements IDeliveryPartnerAuthService {
  private async loadStoredSession(): Promise<DeliveryPartnerSession> {
    if (typeof window === "undefined") return inMemorySession;
    try {
      const stored = localStorage.getItem(STORAGE_SESSION_KEY);
      if (stored) {
        inMemorySession = JSON.parse(stored);
        return inMemorySession;
      }
    } catch {
      return inMemorySession;
    }
    return inMemorySession;
  }

  private persistSession(session: DeliveryPartnerSession): void {
    inMemorySession = session;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
      } catch {
        // ignore
      }
    }
  }

  async getSession(): Promise<DeliveryPartnerSession> {
    if (isLiveMode()) {
      const token = getAccessToken();
      if (!token) {
        return {
          isAuthenticated: false,
          token: null,
          partner: null,
          expiresAt: null,
          lastActive: new Date().toISOString(),
        };
      }

      try {
        const meRes = await deliveryPartnerApi.auth.getMe();
        const user = meRes.data;

        let profile: any = null;
        try {
          const profileRes = await deliveryPartnerApi.profile.getProfile();
          profile = profileRes.data;
        } catch {
          // Profile may not be fully initialized yet
        }

        const partner = mapBackendToPartnerProfile(user, profile);
        const session: DeliveryPartnerSession = {
          isAuthenticated: true,
          token,
          partner,
          expiresAt: null,
          lastActive: new Date().toISOString(),
          onboardingStage: profile?.verificationStatus === "VERIFIED" ? "APPROVED" : "UNDER_VERIFICATION",
        };
        this.persistSession(session);
        return session;
      } catch {
        clearTokens();
        return {
          isAuthenticated: false,
          token: null,
          partner: null,
          expiresAt: null,
          lastActive: new Date().toISOString(),
        };
      }
    }

    await new Promise((res) => setTimeout(res, 30));
    return this.loadStoredSession();
  }

  async getProfile(): Promise<DeliveryPartnerProfile | null> {
    const session = await this.getSession();
    return session.partner;
  }

  async login(credentials: DeliveryPartnerAuthCredentials): Promise<DeliveryPartnerSession> {
    if (isLiveMode()) {
      const email = credentials.identifier.includes("@") ? credentials.identifier : credentials.identifier;
      const res = await deliveryPartnerApi.auth.login({
        email,
        password: credentials.password || "",
      });

      const { user, accessToken, refreshToken, expiresIn } = res.data;

      // Verify role is DELIVERY_PARTNER (Rule 4 & 23)
      let role = user?.role;
      try {
        const meRes = await deliveryPartnerApi.auth.getMe();
        if (meRes.data?.role) {
          role = meRes.data.role;
        }
      } catch {
        // Fallback to login user role
      }

      if (role && role !== "DELIVERY_PARTNER") {
        clearTokens();
        throw new Error("Access denied: Account is not a registered delivery partner.");
      }

      setTokens({
        accessToken,
        refreshToken,
        expiresIn,
      });

      setOrganizationId("ORG-0001");

      let profile: any = null;
      try {
        const profileRes = await deliveryPartnerApi.profile.getProfile();
        profile = profileRes.data;
      } catch {
        // Continue if profile is being set up
      }

      const partner = mapBackendToPartnerProfile(user, profile);
      const session: DeliveryPartnerSession = {
        isAuthenticated: true,
        token: accessToken,
        partner,
        expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
        lastActive: new Date().toISOString(),
        onboardingStage: profile?.verificationStatus === "VERIFIED" ? "APPROVED" : "UNDER_VERIFICATION",
      };

      this.persistSession(session);
      return session;
    }

    // Mock Mode
    await new Promise((res) => setTimeout(res, 120));

    const id = credentials.identifier.trim().toLowerCase();
    if (
      id === "valet@washora.example.com" ||
      id === "+919876543210" ||
      id === "9876543210" ||
      id === "vikram.valet@washora.example.com"
    ) {
      const session: DeliveryPartnerSession = {
        isAuthenticated: true,
        token: "washora_mock_dp_jwt_token_88492048",
        partner: MOCK_DELIVERY_PARTNER_SESSION.partner,
        expiresAt: "2026-12-31T23:59:59Z",
        lastActive: new Date().toISOString(),
        onboardingStage: "APPROVED",
      };
      this.persistSession(session);
      return session;
    }

    if (credentials.password && credentials.password.length >= 6) {
      const session: DeliveryPartnerSession = {
        isAuthenticated: true,
        token: "washora_mock_dp_jwt_token_88492048",
        partner: {
          ...MOCK_DELIVERY_PARTNER_SESSION.partner!,
          email: id.includes("@") ? id : MOCK_DELIVERY_PARTNER_SESSION.partner!.email,
          phone: !id.includes("@") ? id : MOCK_DELIVERY_PARTNER_SESSION.partner!.phone,
        },
        expiresAt: "2026-12-31T23:59:59Z",
        lastActive: new Date().toISOString(),
        onboardingStage: "APPROVED",
      };
      this.persistSession(session);
      return session;
    }

    throw new Error("Invalid mobile number/email or incorrect password.");
  }

  async register(payload: DeliveryPartnerRegisterPayload): Promise<{ success: boolean; tempToken: string }> {
    if (isLiveMode()) {
      const res = await deliveryPartnerApi.auth.register({
        email: payload.email,
        password: payload.password || "SecureValetPass123!",
        fullName: payload.fullName,
        phone: payload.phone,
        role: "DELIVERY_PARTNER",
      });

      return {
        success: true,
        tempToken: res.data?.accessToken || "live_dp_temp_token",
      };
    }

    await new Promise((res) => setTimeout(res, 120));
    return {
      success: true,
      tempToken: "washora_temp_dp_reg_token_9918",
    };
  }

  async verifyPhone(payload: { phone: string; otp: string }): Promise<DeliveryPartnerSession> {
    if (isLiveMode()) {
      return this.getSession();
    }

    await new Promise((res) => setTimeout(res, 100));
    if (payload.otp !== "123456" && payload.otp.length !== 6) {
      throw new Error("Invalid OTP code. Please enter 123456.");
    }

    const session: DeliveryPartnerSession = {
      isAuthenticated: true,
      token: "washora_mock_dp_jwt_token_88492048",
      partner: MOCK_DELIVERY_PARTNER_SESSION.partner,
      expiresAt: "2026-12-31T23:59:59Z",
      lastActive: new Date().toISOString(),
      onboardingStage: "UNDER_VERIFICATION",
    };
    this.persistSession(session);
    return session;
  }

  async forgotPassword(identifier: string): Promise<{ success: boolean; message: string }> {
    if (isLiveMode()) {
      await deliveryPartnerApi.auth.forgotPassword(identifier);
      return {
        success: true,
        message: `Password reset verification link dispatched to ${identifier}`,
      };
    }

    await new Promise((res) => setTimeout(res, 100));
    return {
      success: true,
      message: `Password reset verification link dispatched to ${identifier}`,
    };
  }

  async resetPassword(payload: { newPassword: string; token: string }): Promise<{ success: boolean }> {
    if (isLiveMode()) {
      await deliveryPartnerApi.auth.resetPassword(payload);
      return { success: true };
    }

    await new Promise((res) => setTimeout(res, 100));
    return { success: true };
  }

  async updateStatus(status: DeliveryPartnerStatus): Promise<DeliveryPartnerProfile> {
    if (isLiveMode()) {
      const backendStatusMap: Record<DeliveryPartnerStatus, string> = {
        ONLINE: "ONLINE",
        OFFLINE: "OFFLINE",
        BUSY: "ON_DELIVERY",
        ON_DELIVERY: "ON_DELIVERY",
        ON_BREAK: "BREAK",
        SUSPENDED: "SUSPENDED",
      };

      const res = await deliveryPartnerApi.profile.updateProfile({
        status: (backendStatusMap[status] || status) as any,
      });

      const current = await this.getSession();
      const updated = mapBackendToPartnerProfile(current.partner, res.data);
      this.persistSession({
        ...current,
        partner: updated,
      });
      return updated;
    }

    await new Promise((res) => setTimeout(res, 50));
    const session = await this.loadStoredSession();
    if (!session.partner) {
      throw new Error("No active delivery partner profile found.");
    }

    const updatedPartner: DeliveryPartnerProfile = {
      ...session.partner,
      status,
    };

    const updatedSession: DeliveryPartnerSession = {
      ...session,
      partner: updatedPartner,
      lastActive: new Date().toISOString(),
    };

    this.persistSession(updatedSession);
    return updatedPartner;
  }

  async logout(): Promise<void> {
    if (isLiveMode()) {
      try {
        await deliveryPartnerApi.auth.logout();
      } catch {
        // ignore logout errors on client teardown
      }
      clearTokens();
    }

    const emptySession: DeliveryPartnerSession = {
      isAuthenticated: false,
      token: null,
      partner: null,
      expiresAt: null,
      lastActive: new Date().toISOString(),
    };
    this.persistSession(emptySession);
  }

  async restoreSession(): Promise<DeliveryPartnerSession> {
    if (isLiveMode()) {
      return this.getSession();
    }

    await new Promise((res) => setTimeout(res, 50));
    const session: DeliveryPartnerSession = {
      ...MOCK_DELIVERY_PARTNER_SESSION,
      lastActive: new Date().toISOString(),
    };
    this.persistSession(session);
    return session;
  }

  async getOnboardingDraft(): Promise<DeliveryPartnerOnboardingDraft> {
    await new Promise((res) => setTimeout(res, 50));
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_ONBOARDING_KEY);
        if (stored) {
          inMemoryOnboardingDraft = JSON.parse(stored);
          return inMemoryOnboardingDraft;
        }
      } catch {
        return inMemoryOnboardingDraft;
      }
    }
    return inMemoryOnboardingDraft;
  }

  async saveOnboardingDraft(draft: Partial<DeliveryPartnerOnboardingDraft>): Promise<DeliveryPartnerOnboardingDraft> {
    await new Promise((res) => setTimeout(res, 60));
    const current = await this.getOnboardingDraft();
    const updated: DeliveryPartnerOnboardingDraft = {
      ...current,
      ...draft,
      personalInfo: { ...current.personalInfo, ...(draft.personalInfo || {}) },
      vehicleInfo: { ...current.vehicleInfo, ...(draft.vehicleInfo || {}) },
      shiftInfo: { ...current.shiftInfo, ...(draft.shiftInfo || {}) },
      bankInfo: { ...current.bankInfo, ...(draft.bankInfo || {}) },
    };

    inMemoryOnboardingDraft = updated;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_ONBOARDING_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
    return updated;
  }

  async submitOnboarding(draft: DeliveryPartnerOnboardingDraft): Promise<DeliveryPartnerOnboardingStatus> {
    if (isLiveMode()) {
      // Update profile with submitted details
      try {
        await deliveryPartnerApi.profile.updateProfile({
          vehicleType: draft.vehicleInfo.vehicleType as any,
          vehicleNumber: draft.vehicleInfo.vehiclePlate,
          licenseNumber: draft.vehicleInfo.drivingLicenseNumber,
          emergencyContactName: draft.shiftInfo.emergencyContactName,
          emergencyContactPhone: draft.shiftInfo.emergencyContactPhone,
        });
      } catch {
        // Continue if partial update succeeds
      }

      const status: DeliveryPartnerOnboardingStatus = {
        stage: "UNDER_VERIFICATION",
        submittedAt: new Date().toISOString(),
        estimatedReviewHours: 12,
        assignedHub: draft.shiftInfo.hubName || "Indiranagar Hub #04",
        reviewerNotes: "Application received. Verification in progress.",
      };

      inMemoryOnboardingStatus = status;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_STATUS_KEY, JSON.stringify(status));
        } catch {
          // ignore
        }
      }
      return status;
    }

    await new Promise((res) => setTimeout(res, 150));
    const status: DeliveryPartnerOnboardingStatus = {
      stage: "UNDER_VERIFICATION",
      submittedAt: new Date().toISOString(),
      estimatedReviewHours: 12,
      assignedHub: draft.shiftInfo.hubName || "Indiranagar Hub #04",
      reviewerNotes: "Application received. Verification in progress.",
    };

    inMemoryOnboardingStatus = status;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_STATUS_KEY, JSON.stringify(status));
      } catch {
        // ignore
      }
    }

    await this.saveOnboardingDraft({ ...draft, stage: "UNDER_VERIFICATION", submittedAt: status.submittedAt });
    return status;
  }

  async getOnboardingStatus(): Promise<DeliveryPartnerOnboardingStatus> {
    if (isLiveMode()) {
      try {
        const res = await deliveryPartnerApi.profile.getProfile();
        const profile = res.data;
        const stage = profile.verificationStatus === "VERIFIED"
          ? "APPROVED"
          : profile.verificationStatus === "REJECTED"
            ? "REJECTED"
            : "UNDER_VERIFICATION";

        return {
          stage,
          submittedAt: profile.createdAt,
          estimatedReviewHours: 12,
          assignedHub: "Indiranagar Hub #04",
          reviewerNotes: profile.verificationStatus === "PENDING" ? "Verification in progress" : undefined,
        };
      } catch {
        // Fallback to local status if profile not found
      }
    }

    await new Promise((res) => setTimeout(res, 50));
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_STATUS_KEY);
        if (stored) {
          inMemoryOnboardingStatus = JSON.parse(stored);
          return inMemoryOnboardingStatus;
        }
      } catch {
        return inMemoryOnboardingStatus;
      }
    }
    return inMemoryOnboardingStatus;
  }
}

export const deliveryPartnerAuthService = new DeliveryPartnerAuthService();
