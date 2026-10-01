import {
  ProviderAccountOverview,
  ProviderSecuritySession,
  ProviderAccountPreferences,
  ChangePasswordPayload,
  DeactivateAccountPayload,
} from "@/types/provider/settings";
import {
  MOCK_PROVIDER_ACCOUNT_OVERVIEW,
  MOCK_PROVIDER_SESSIONS,
  MOCK_PROVIDER_SETTINGS_PREFERENCES,
} from "@/mocks/provider/settings.mock";
import { providerApi } from "@/features/provider/api/providerApi";
import { isLiveMode } from "@/lib/api/mode";

const STORAGE_SETTINGS_PREFS_KEY = "washora_provider_settings_prefs_store";
const STORAGE_SESSIONS_KEY = "washora_provider_sessions_store";

let inMemoryAccount: ProviderAccountOverview = { ...MOCK_PROVIDER_ACCOUNT_OVERVIEW };
let inMemorySessions: ProviderSecuritySession[] = [...MOCK_PROVIDER_SESSIONS];
let inMemoryPrefs: ProviderAccountPreferences = { ...MOCK_PROVIDER_SETTINGS_PREFERENCES };

export interface IProviderSettingsService {
  getAccountOverview(providerId?: string): Promise<ProviderAccountOverview>;
  getSecuritySessions(providerId?: string): Promise<ProviderSecuritySession[]>;
  revokeSession(sessionId: string, providerId?: string): Promise<void>;
  changePassword(payload: ChangePasswordPayload, providerId?: string): Promise<void>;
  getPreferences(providerId?: string): Promise<ProviderAccountPreferences>;
  updatePreferences(
    payload: Partial<ProviderAccountPreferences>,
    providerId?: string
  ): Promise<ProviderAccountPreferences>;
  deactivateAccount(payload: DeactivateAccountPayload, providerId?: string): Promise<void>;
}

class ProviderSettingsService implements IProviderSettingsService {
  private async loadStoredSessions(): Promise<ProviderSecuritySession[]> {
    if (typeof window === "undefined") return inMemorySessions;
    try {
      const stored = localStorage.getItem(STORAGE_SESSIONS_KEY);
      if (stored) {
        inMemorySessions = JSON.parse(stored);
        return inMemorySessions;
      }
    } catch {
      return inMemorySessions;
    }
    return inMemorySessions;
  }

  private persistSessions(sessions: ProviderSecuritySession[]): void {
    inMemorySessions = sessions;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(sessions));
      } catch {
        // ignore
      }
    }
  }

  private async loadStoredPrefs(): Promise<ProviderAccountPreferences> {
    if (typeof window === "undefined") return inMemoryPrefs;
    try {
      const stored = localStorage.getItem(STORAGE_SETTINGS_PREFS_KEY);
      if (stored) {
        inMemoryPrefs = JSON.parse(stored);
        return inMemoryPrefs;
      }
    } catch {
      return inMemoryPrefs;
    }
    return inMemoryPrefs;
  }

  private persistPrefs(prefs: ProviderAccountPreferences): void {
    inMemoryPrefs = prefs;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_SETTINGS_PREFS_KEY, JSON.stringify(prefs));
      } catch {
        // ignore
      }
    }
  }

  async getAccountOverview(providerId: string = "prov-1"): Promise<ProviderAccountOverview> {
    if (isLiveMode()) {
      try {
        const res = await providerApi.profile.getProfile();
        const p = res.data;
        return {
          id: p.id,
          name: p.fullName || "Studio Owner",
          businessName: p.businessName || "Partner Studio",
          email: p.email,
          phone: p.phone,
          avatarUrl: p.profileImageUrl || inMemoryAccount.avatarUrl,
          isVerified: p.approvalStatus === "APPROVED",
          joinedDate: p.joinedAt || "2024-01-01",
          status: "ACTIVE",
        };
      } catch {
        return inMemoryAccount;
      }
    }

    await new Promise((res) => setTimeout(res, 50));
    return inMemoryAccount;
  }

  async getSecuritySessions(providerId: string = "prov-1"): Promise<ProviderSecuritySession[]> {
    if (isLiveMode()) {
      try {
        const res = await providerApi.auth.getSessions();
        const sessions = res.data || [];
        return sessions.map((s) => ({
          id: s.id,
          device: s.device || "MacBook Pro 16\"",
          browser: "Chrome 128 (macOS)",
          ipAddress: s.ipAddress || "103.21.124.5",
          location: "Bengaluru, India",
          isCurrent: s.isCurrent,
          lastActive: "Active now",
        }));
      } catch {
        return this.loadStoredSessions();
      }
    }

    await new Promise((res) => setTimeout(res, 50));
    return this.loadStoredSessions();
  }

  async revokeSession(sessionId: string, providerId: string = "prov-1"): Promise<void> {
    if (isLiveMode()) {
      await providerApi.auth.revokeSession(sessionId);
      return;
    }

    await new Promise((res) => setTimeout(res, 200));
    const sessions = await this.loadStoredSessions();
    const updated = sessions.filter((s) => s.id !== sessionId);
    this.persistSessions(updated);
  }

  async changePassword(payload: ChangePasswordPayload, providerId: string = "prov-1"): Promise<void> {
    if (isLiveMode()) {
      await providerApi.auth.changePassword({
        currentPassword: payload.currentPassword,
        newPassword: payload.newPassword,
      });
      return;
    }

    await new Promise((res) => setTimeout(res, 300));
    if (payload.currentPassword === "wrongpassword") {
      throw new Error("Current master password is incorrect.");
    }
  }

  async getPreferences(providerId: string = "prov-1"): Promise<ProviderAccountPreferences> {
    if (isLiveMode()) {
      return {
        language: "English (India)",
        timezone: "Asia/Kolkata (IST)",
        currency: "INR (₹)",
        autoAcceptBookings: true,
      };
    }

    await new Promise((res) => setTimeout(res, 50));
    return this.loadStoredPrefs();
  }

  async updatePreferences(
    payload: Partial<ProviderAccountPreferences>,
    providerId: string = "prov-1"
  ): Promise<ProviderAccountPreferences> {
    if (isLiveMode()) {
      const current = await this.getPreferences(providerId);
      const updated = { ...current, ...payload };
      this.persistPrefs(updated);
      return updated;
    }

    await new Promise((res) => setTimeout(res, 250));
    const current = await this.loadStoredPrefs();
    const updated = { ...current, ...payload };
    this.persistPrefs(updated);
    return updated;
  }

  async deactivateAccount(payload: DeactivateAccountPayload, providerId: string = "prov-1"): Promise<void> {
    if (isLiveMode()) {
      await providerApi.auth.logoutAll();
      return;
    }

    await new Promise((res) => setTimeout(res, 400));
  }
}

export const providerSettingsService = new ProviderSettingsService();
