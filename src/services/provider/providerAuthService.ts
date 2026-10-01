import {
  ProviderCredentials,
  ProviderRegisterPayload,
  ProviderAuthResponse,
  ProviderOnboardingDraft,
  ProviderOnboardingStatusData,
  ProviderUploadedDoc,
} from "@/types/provider/auth";
import { providerApi } from "@/features/provider/api/providerApi";
import { isLiveMode } from "@/lib/api/mode";
import { setTokens, clearTokens, setOrganizationId, getAccessToken } from "@/lib/api/token-store";

const STORAGE_PROVIDER_AUTH_KEY = "washora_provider_auth_session";
const STORAGE_PROVIDER_ONBOARDING_KEY = "washora_provider_onboarding_draft";

const DEFAULT_ONBOARDING_DRAFT: ProviderOnboardingDraft = {
  step: 1,
  businessInfo: {
    businessName: "LuxeCare Garment Studio",
    legalEntityName: "LuxeCare Care Services LLP",
    businessCategory: "laundry",
    gstNumber: "29AABCU9603R1ZM",
    panNumber: "AABCU9603R",
    businessType: "llp",
    establishedYear: "2021",
  },
  location: {
    streetAddress: "Shop 14, Ground Floor, 100ft Road",
    buildingSuite: "Indiranagar Galleria",
    locality: "Indiranagar",
    city: "Bangalore",
    state: "Karnataka",
    postalCode: "560038",
    coverageRadiusKm: 8,
  },
  capabilities: {
    primarySpecialties: ["Couture Dry Cleaning", "Sneaker Deep Clean", "Silk Spa"],
    turnaroundSlaHours: 24,
    dailyCapacityUnits: 60,
    workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    workingHoursStart: "08:00 AM",
    workingHoursEnd: "08:00 PM",
    pickupDropAvailable: true,
  },
  documents: [
    {
      id: "doc-1",
      docType: "gst_certificate",
      fileName: "gstin_certificate_luxecare.pdf",
      fileSize: "1.4 MB",
      uploadedAt: "2026-09-01T10:00:00Z",
      status: "VERIFIED",
    },
    {
      id: "doc-2",
      docType: "trade_license",
      fileName: "bbmp_trade_license_2026.pdf",
      fileSize: "2.1 MB",
      uploadedAt: "2026-09-01T10:05:00Z",
      status: "VERIFIED",
    },
  ],
  isSubmitted: false,
};

let inMemoryAuthSession: ProviderAuthResponse | null = {
  token: "prov_mock_jwt_token_2026_prod",
  providerId: "prov-1",
  businessName: "LuxeCare Garment Studio",
  email: "partner@luxecare.example.com",
  phone: "+91 98401 23456",
  onboardingStatus: "APPROVED",
};

let inMemoryOnboardingDraft: ProviderOnboardingDraft = { ...DEFAULT_ONBOARDING_DRAFT };

export interface IProviderAuthService {
  login(credentials: ProviderCredentials): Promise<ProviderAuthResponse>;
  register(payload: ProviderRegisterPayload): Promise<{ tempToken: string; phone: string }>;
  verifyPhoneOtp(phone: string, otp: string): Promise<ProviderAuthResponse>;
  requestPasswordReset(identifier: string): Promise<{ success: boolean; message: string }>;
  resetPassword(newPassword: string): Promise<{ success: boolean }>;
  logout(): Promise<void>;
  getCurrentAuthSession(): Promise<ProviderAuthResponse | null>;
  getOnboardingDraft(): Promise<ProviderOnboardingDraft>;
  saveOnboardingDraft(draft: Partial<ProviderOnboardingDraft>): Promise<ProviderOnboardingDraft>;
  uploadDocument(docType: ProviderUploadedDoc["docType"], file: File): Promise<ProviderUploadedDoc>;
  submitOnboarding(): Promise<ProviderOnboardingStatusData>;
  getOnboardingStatus(): Promise<ProviderOnboardingStatusData>;
}

class ProviderAuthService implements IProviderAuthService {
  async login(credentials: ProviderCredentials): Promise<ProviderAuthResponse> {
    if (isLiveMode()) {
      const email = credentials.identifier.includes("@") ? credentials.identifier : credentials.identifier;
      const res = await providerApi.auth.login({
        email,
        password: credentials.password || "",
      });

      const { user, accessToken, refreshToken, expiresIn } = res.data;

      // Verify that the authenticated role is PROVIDER (Rule 4 & 23)
      let role = user?.role;
      try {
        const meRes = await providerApi.auth.getMe();
        if (meRes.data?.role) {
          role = meRes.data.role;
        }
      } catch {
        // use login user role
      }

      if (role && role !== "PROVIDER") {
        clearTokens();
        throw new Error("Access denied: Account is not a registered provider studio.");
      }

      setTokens({
        accessToken,
        refreshToken,
        expiresIn,
      });

      // Default organization context for multi-tenant isolation
      setOrganizationId("ORG-0001");

      const session: ProviderAuthResponse = {
        token: accessToken,
        providerId: user.id,
        businessName: user.fullName || "Partner Studio",
        email: user.email,
        phone: user.phone || "+91 98401 23456",
        onboardingStatus: "APPROVED",
      };

      inMemoryAuthSession = session;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_PROVIDER_AUTH_KEY, JSON.stringify(session));
        } catch {
          // ignore
        }
      }

      return session;
    }

    // Mock mode
    await new Promise((res) => setTimeout(res, 500));

    if (credentials.identifier === "error@example.com" || credentials.identifier === "error") {
      throw new Error("Invalid partner email/mobile or incorrect password.");
    }

    const session: ProviderAuthResponse = {
      token: `prov_jwt_${Date.now()}`,
      providerId: "prov-1",
      businessName: "LuxeCare Garment Studio",
      email: credentials.identifier.includes("@") ? credentials.identifier : "partner@luxecare.example.com",
      phone: !credentials.identifier.includes("@") ? credentials.identifier : "+91 98401 23456",
      onboardingStatus: "APPROVED",
    };

    inMemoryAuthSession = session;

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_PROVIDER_AUTH_KEY, JSON.stringify(session));
      } catch {
        // ignore
      }
    }

    return session;
  }

  async register(payload: ProviderRegisterPayload): Promise<{ tempToken: string; phone: string }> {
    if (isLiveMode()) {
      if (payload.email === "exists@example.com") {
        throw new Error("A partner studio with this email address already exists.");
      }
      const tempToken = `prov_temp_${Date.now()}`;
      inMemoryOnboardingDraft.businessInfo.businessName = payload.businessName;
      inMemoryOnboardingDraft.businessInfo.businessCategory = payload.category;
      return { tempToken, phone: payload.phone };
    }

    await new Promise((res) => setTimeout(res, 600));

    if (payload.email === "exists@example.com") {
      throw new Error("A partner studio with this email address already exists.");
    }

    const tempToken = `prov_temp_${Date.now()}`;
    inMemoryOnboardingDraft.businessInfo.businessName = payload.businessName;
    inMemoryOnboardingDraft.businessInfo.businessCategory = payload.category;

    return { tempToken, phone: payload.phone };
  }

  async verifyPhoneOtp(phone: string, otp: string): Promise<ProviderAuthResponse> {
    await new Promise((res) => setTimeout(res, 500));

    if (otp !== "123456" && otp !== "000000") {
      throw new Error("Invalid verification OTP. Please enter 123456 in development.");
    }

    const session: ProviderAuthResponse = {
      token: `prov_jwt_${Date.now()}`,
      providerId: `prov_${Date.now()}`,
      businessName: inMemoryOnboardingDraft.businessInfo.businessName || "New Partner Studio",
      email: "partner.new@example.com",
      phone,
      onboardingStatus: "BUSINESS_INFO",
    };

    inMemoryAuthSession = session;

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_PROVIDER_AUTH_KEY, JSON.stringify(session));
      } catch {
        // ignore
      }
    }

    return session;
  }

  async requestPasswordReset(identifier: string): Promise<{ success: boolean; message: string }> {
    if (isLiveMode()) {
      const email = identifier.includes("@") ? identifier : `${identifier}@example.com`;
      await providerApi.auth.forgotPassword(email);
      return {
        success: true,
        message: `Password reset instructions have been dispatched to ${identifier}.`,
      };
    }

    await new Promise((res) => setTimeout(res, 400));
    return {
      success: true,
      message: `Password reset instructions have been dispatched to ${identifier}.`,
    };
  }

  async resetPassword(newPassword: string): Promise<{ success: boolean }> {
    if (isLiveMode()) {
      await providerApi.auth.resetPassword({ token: "sample_token", newPassword });
      return { success: true };
    }

    await new Promise((res) => setTimeout(res, 500));
    return { success: true };
  }

  async logout(): Promise<void> {
    if (isLiveMode()) {
      try {
        await providerApi.auth.logout();
      } catch {
        // ignore logout errors to ensure clean state
      }
      clearTokens();
    }

    inMemoryAuthSession = null;
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_PROVIDER_AUTH_KEY);
      } catch {
        // ignore
      }
    }
  }

  async getCurrentAuthSession(): Promise<ProviderAuthResponse | null> {
    if (isLiveMode()) {
      const token = getAccessToken();
      if (!token) return null;

      try {
        const meRes = await providerApi.auth.getMe();
        const user = meRes.data;

        if (user.role !== "PROVIDER") {
          clearTokens();
          return null;
        }

        const session: ProviderAuthResponse = {
          token,
          providerId: user.id,
          businessName: user.fullName || "Partner Studio",
          email: user.email,
          phone: user.phone || "+91 98401 23456",
          onboardingStatus: "APPROVED",
        };
        inMemoryAuthSession = session;
        return session;
      } catch {
        return null;
      }
    }

    if (typeof window === "undefined") return inMemoryAuthSession;
    try {
      const stored = localStorage.getItem(STORAGE_PROVIDER_AUTH_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      return inMemoryAuthSession;
    }
    return inMemoryAuthSession;
  }

  async getOnboardingDraft(): Promise<ProviderOnboardingDraft> {
    await new Promise((res) => setTimeout(res, 50));
    if (typeof window === "undefined") return inMemoryOnboardingDraft;
    try {
      const stored = localStorage.getItem(STORAGE_PROVIDER_ONBOARDING_KEY);
      if (stored) {
        inMemoryOnboardingDraft = JSON.parse(stored);
        return inMemoryOnboardingDraft;
      }
    } catch {
      return inMemoryOnboardingDraft;
    }
    return inMemoryOnboardingDraft;
  }

  async saveOnboardingDraft(
    draft: Partial<ProviderOnboardingDraft>
  ): Promise<ProviderOnboardingDraft> {
    await new Promise((res) => setTimeout(res, 200));
    const merged = { ...inMemoryOnboardingDraft, ...draft };
    inMemoryOnboardingDraft = merged;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_PROVIDER_ONBOARDING_KEY, JSON.stringify(merged));
      } catch {
        // ignore
      }
    }
    return merged;
  }

  async uploadDocument(
    docType: ProviderUploadedDoc["docType"],
    file: File
  ): Promise<ProviderUploadedDoc> {
    if (isLiveMode()) {
      const res = await providerApi.documents.submitDocument({
        documentType: docType.toUpperCase(),
        fileName: file.name,
        fileUrl: `https://storage.washora.com/documents/${file.name}`,
        fileSize: file.size,
      });

      const doc = res.data;
      const uploaded: ProviderUploadedDoc = {
        id: doc.id,
        docType,
        fileName: doc.fileName,
        fileSize: doc.fileSize ? `${(doc.fileSize / (1024 * 1024)).toFixed(1)} MB` : "1.0 MB",
        uploadedAt: doc.uploadedAt,
        status: (doc.verificationStatus as ProviderUploadedDoc["status"]) || "PENDING",
      };

      inMemoryOnboardingDraft.documents = [
        ...inMemoryOnboardingDraft.documents.filter((d) => d.docType !== docType),
        uploaded,
      ];
      await this.saveOnboardingDraft(inMemoryOnboardingDraft);
      return uploaded;
    }

    await new Promise((res) => setTimeout(res, 500));
    const uploaded: ProviderUploadedDoc = {
      id: `doc_${Date.now()}`,
      docType,
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadedAt: new Date().toISOString(),
      status: "UPLOADED",
    };

    inMemoryOnboardingDraft.documents = [
      ...inMemoryOnboardingDraft.documents.filter((d) => d.docType !== docType),
      uploaded,
    ];
    await this.saveOnboardingDraft(inMemoryOnboardingDraft);
    return uploaded;
  }

  async submitOnboarding(): Promise<ProviderOnboardingStatusData> {
    await new Promise((res) => setTimeout(res, 600));
    inMemoryOnboardingDraft.isSubmitted = true;
    await this.saveOnboardingDraft(inMemoryOnboardingDraft);

    return {
      stage: "UNDER_VERIFICATION",
      submittedAt: new Date().toISOString(),
      businessName: inMemoryOnboardingDraft.businessInfo.businessName || "Your Studio",
      applicationNumber: `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      estimatedReviewHours: 48,
      verifiedItems: [
        { label: "Business Details", isComplete: true },
        { label: "Studio Location", isComplete: true },
        { label: "Tax Certificates", isComplete: false },
      ],
      contactSupportPhone: "+1 (800) 555-0199",
    };
  }

  async getOnboardingStatus(): Promise<ProviderOnboardingStatusData> {
    await new Promise((res) => setTimeout(res, 100));
    const draft = await this.getOnboardingDraft();

    if (!draft.isSubmitted) {
      return {
        stage: "BUSINESS_INFO",
        businessName: draft.businessInfo.businessName || "Your Studio",
        submittedAt: new Date().toISOString(),
        applicationNumber: "APP-DRAFT",
        estimatedReviewHours: 48,
        verifiedItems: [],
        contactSupportPhone: "+1 (800) 555-0199",
      };
    }

    return {
      stage: "UNDER_VERIFICATION",
      submittedAt: "2026-09-02T14:30:00Z",
      businessName: draft.businessInfo.businessName || "LuxeCare Garment Studio",
      applicationNumber: "APP-2026-8842",
      estimatedReviewHours: 24,
      verifiedItems: [
        { label: "Business Details", isComplete: true },
        { label: "Studio Location", isComplete: true },
        { label: "Tax Certificates", isComplete: true },
      ],
      contactSupportPhone: "+1 (800) 555-0199",
    };
  }
}

export const providerAuthService = new ProviderAuthService();
