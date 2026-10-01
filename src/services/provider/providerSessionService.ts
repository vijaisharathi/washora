import { ProviderProfileSummary, ProviderSession } from "@/types/provider";
import { MOCK_PROVIDER_PROFILE } from "@/mocks/provider/mockProviderData";
import { providerApi } from "@/features/provider/api/providerApi";
import { isLiveMode } from "@/lib/api/mode";
import { getAccessToken } from "@/lib/api/token-store";

const STORAGE_PROVIDER_SESSION_KEY = "washora_provider_session";
const STORAGE_PROVIDER_ONLINE_KEY = "washora_provider_is_online";

let inMemoryProviderProfile = { ...MOCK_PROVIDER_PROFILE };

export interface IProviderSessionService {
  getCurrentSession(): Promise<ProviderSession | null>;
  getProfileSummary(): Promise<ProviderProfileSummary>;
  toggleOnlineStatus(): Promise<boolean>;
}

class ProviderSessionService implements IProviderSessionService {
  async getCurrentSession(): Promise<ProviderSession | null> {
    if (isLiveMode()) {
      const token = getAccessToken();
      if (!token) return null;

      const profile = await this.getProfileSummary();
      return {
        token,
        provider: profile,
        expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
      };
    }

    await new Promise((res) => setTimeout(res, 50));
    const profile = await this.getProfileSummary();

    return {
      token: "prov_mock_jwt_token_2026_prod",
      provider: profile,
      expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
    };
  }

  async getProfileSummary(): Promise<ProviderProfileSummary> {
    if (isLiveMode()) {
      try {
        const res = await providerApi.profile.getProfile();
        const p = res.data;

        let isOnline = true;
        if (typeof window !== "undefined") {
          try {
            const storedOnline = localStorage.getItem(STORAGE_PROVIDER_ONLINE_KEY);
            if (storedOnline !== null) {
              isOnline = storedOnline === "true";
            }
          } catch {
            // ignore
          }
        }

        return {
          id: p.id,
          businessName: p.businessName || p.fullName || "Partner Studio",
          ownerName: p.fullName || "Studio Owner",
          email: p.email,
          phone: p.phone,
          avatarUrl: p.profileImageUrl || inMemoryProviderProfile.avatarUrl,
          tier: "VERIFIED_PRO",
          status: "ACTIVE",
          rating: Number(p.rating || 4.9),
          reviewCount: Number(p.totalReviews || 1240),
          completedOrdersCount: 120,
          memberSince: p.joinedAt || "2024-01-01T00:00:00.000Z",
          isOnline,
        };
      } catch {
        // fallback
      }
    }

    await new Promise((res) => setTimeout(res, 50));
    let isOnline = inMemoryProviderProfile.isOnline;

    if (typeof window !== "undefined") {
      try {
        const storedOnline = localStorage.getItem(STORAGE_PROVIDER_ONLINE_KEY);
        if (storedOnline !== null) {
          isOnline = storedOnline === "true";
        }
      } catch {
        // ignore
      }
    }

    return {
      ...inMemoryProviderProfile,
      isOnline,
    };
  }

  async toggleOnlineStatus(): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 150));
    const current = await this.getProfileSummary();
    const newStatus = !current.isOnline;

    inMemoryProviderProfile.isOnline = newStatus;

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_PROVIDER_ONLINE_KEY, String(newStatus));
      } catch {
        // ignore
      }
    }

    return newStatus;
  }
}

export const providerSessionService = new ProviderSessionService();
