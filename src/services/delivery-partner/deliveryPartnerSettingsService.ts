import {
  DeliveryPartnerPreferences,
  DeliveryPartnerSecuritySettings,
  UpdatePreferencesPayload,
  ChangePasswordPayload,
} from "@/types/delivery-partner";
import {
  MOCK_PREFERENCES,
  MOCK_SECURITY_SETTINGS,
} from "@/mocks/delivery-partner/settings.mock";
import { deliveryPartnerAuthService } from "./deliveryPartnerAuthService";
import { deliveryPartnerApi } from "@/features/delivery-partner/api/deliveryPartnerApi";
import { isLiveMode } from "@/lib/api/mode";

const STORAGE_PREFS_KEY = "washora_delivery_partner_preferences";
const STORAGE_SECURITY_KEY = "washora_delivery_partner_security";

export interface IDeliveryPartnerSettingsService {
  getPreferences(): Promise<DeliveryPartnerPreferences>;
  updatePreferences(payload: UpdatePreferencesPayload): Promise<DeliveryPartnerPreferences>;
  getSecuritySettings(): Promise<DeliveryPartnerSecuritySettings>;
  changePassword(payload: ChangePasswordPayload): Promise<boolean>;
  deactivateAccount(reason: string): Promise<boolean>;
}

class DeliveryPartnerSettingsService implements IDeliveryPartnerSettingsService {
  private memoryPreferences: DeliveryPartnerPreferences | null = null;
  private memorySecurity: DeliveryPartnerSecuritySettings | null = null;

  private loadPreferences(): DeliveryPartnerPreferences {
    if (this.memoryPreferences) return this.memoryPreferences;
    if (typeof window !== "undefined") {
      try {
        const val = localStorage.getItem(STORAGE_PREFS_KEY);
        if (val) {
          this.memoryPreferences = JSON.parse(val);
          return this.memoryPreferences!;
        }
      } catch {
        // ignore
      }
    }
    this.memoryPreferences = { ...MOCK_PREFERENCES };
    return this.memoryPreferences;
  }

  private persistPreferences(prefs: DeliveryPartnerPreferences) {
    this.memoryPreferences = prefs;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_PREFS_KEY, JSON.stringify(prefs));
      } catch {
        // ignore
      }
    }
  }

  private loadSecurity(): DeliveryPartnerSecuritySettings {
    if (this.memorySecurity) return this.memorySecurity;
    if (typeof window !== "undefined") {
      try {
        const val = localStorage.getItem(STORAGE_SECURITY_KEY);
        if (val) {
          this.memorySecurity = JSON.parse(val);
          return this.memorySecurity!;
        }
      } catch {
        // ignore
      }
    }
    this.memorySecurity = { ...MOCK_SECURITY_SETTINGS };
    return this.memorySecurity;
  }

  private persistSecurity(sec: DeliveryPartnerSecuritySettings) {
    this.memorySecurity = sec;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_SECURITY_KEY, JSON.stringify(sec));
      } catch {
        // ignore
      }
    }
  }

  async getPreferences(): Promise<DeliveryPartnerPreferences> {
    if (isLiveMode()) {
      const session = await deliveryPartnerAuthService.getSession();
      const currentPartnerId = session.partner?.id || "dp-1";

      try {
        await deliveryPartnerApi.notifications.getPreferences();
        const prefs: DeliveryPartnerPreferences = {
          partnerId: currentPartnerId,
          navigationApp: "GOOGLE_MAPS",
          language: "en-IN",
          audioChimeEnabled: true,
          autoAcceptPriorityOrders: true,
          highContrastMode: false,
          vibrationFeedback: true,
        };
        this.persistPreferences(prefs);
        return prefs;
      } catch {
        // fallback to memory
      }
    }

    await new Promise((res) => setTimeout(res, 30));
    const session = await deliveryPartnerAuthService.getSession();
    const currentPartnerId = session.partner?.id || "dp-1";

    const prefs = this.loadPreferences();
    return { ...prefs, partnerId: currentPartnerId };
  }

  async updatePreferences(payload: UpdatePreferencesPayload): Promise<DeliveryPartnerPreferences> {
    if (isLiveMode()) {
      try {
        await deliveryPartnerApi.notifications.updatePreferences({
          taskAlerts: payload.autoAcceptPriorityOrders,
        });
      } catch {
        // continue
      }
    }

    await new Promise((res) => setTimeout(res, 60));
    const current = this.loadPreferences();
    const updated: DeliveryPartnerPreferences = {
      ...current,
      ...payload,
    };
    this.persistPreferences(updated);
    return updated;
  }

  async getSecuritySettings(): Promise<DeliveryPartnerSecuritySettings> {
    await new Promise((res) => setTimeout(res, 30));
    return this.loadSecurity();
  }

  async changePassword(payload: ChangePasswordPayload): Promise<boolean> {
    if (isLiveMode()) {
      await deliveryPartnerApi.auth.changePassword({
        oldPassword: payload.currentPassword,
        newPassword: payload.newPassword,
      });
      return true;
    }

    await new Promise((res) => setTimeout(res, 100));
    if (payload.currentPassword === "wrongpassword") {
      throw new Error("Incorrect current password.");
    }
    return true;
  }

  async deactivateAccount(reason: string): Promise<boolean> {
    if (isLiveMode()) {
      try {
        await deliveryPartnerApi.auth.logout();
      } catch {
        // ignore
      }
      return true;
    }

    await new Promise((res) => setTimeout(res, 100));
    return true;
  }
}

export const deliveryPartnerSettingsService = new DeliveryPartnerSettingsService();
