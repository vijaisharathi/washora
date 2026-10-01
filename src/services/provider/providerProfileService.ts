import {
  ProviderFullProfile,
  ProviderBusinessIdentity,
  ProviderContactInfo,
  ProviderBusinessAddress,
  ProviderOperatingHoursConfig,
  ProviderServiceAreaConfig,
} from "@/types/provider/profile";
import { MOCK_PROVIDER_FULL_PROFILE } from "@/mocks/provider/profile.mock";
import { providerApi } from "@/features/provider/api/providerApi";
import { isLiveMode } from "@/lib/api/mode";

const STORAGE_PROVIDER_FULL_PROFILE_KEY = "washora_provider_full_profile";

let inMemoryFullProfile: ProviderFullProfile = { ...MOCK_PROVIDER_FULL_PROFILE };

export interface IProviderProfileService {
  getFullProfile(): Promise<ProviderFullProfile>;
  updateBusinessIdentity(identity: Partial<ProviderBusinessIdentity>): Promise<ProviderFullProfile>;
  updateContactInfo(contact: Partial<ProviderContactInfo>): Promise<ProviderFullProfile>;
  updateBusinessAddress(address: Partial<ProviderBusinessAddress>): Promise<ProviderFullProfile>;
  updateOperatingHours(hours: Partial<ProviderOperatingHoursConfig>): Promise<ProviderFullProfile>;
  updateServiceArea(area: Partial<ProviderServiceAreaConfig>): Promise<ProviderFullProfile>;
  uploadLogo(file: File): Promise<{ logoUrl: string }>;
  uploadCoverPhoto(file: File): Promise<{ coverPhotoUrl: string }>;
}

class ProviderProfileService implements IProviderProfileService {
  async getFullProfile(): Promise<ProviderFullProfile> {
    if (isLiveMode()) {
      const res = await providerApi.profile.getProfile();
      const p = res.data;

      const profile: ProviderFullProfile = {
        ...MOCK_PROVIDER_FULL_PROFILE,
        id: p.id,
        identity: {
          ...MOCK_PROVIDER_FULL_PROFILE.identity,
          businessName: p.businessName || p.fullName || "Partner Studio",
          legalEntityName: p.businessName || p.fullName || "Partner Studio LLP",
          description: p.description || MOCK_PROVIDER_FULL_PROFILE.identity.description,
          logoUrl: p.profileImageUrl || MOCK_PROVIDER_FULL_PROFILE.identity.logoUrl,
          coverPhotoUrl: p.coverImageUrl || MOCK_PROVIDER_FULL_PROFILE.identity.coverPhotoUrl,
        },
        contact: {
          ...MOCK_PROVIDER_FULL_PROFILE.contact,
          primaryEmail: p.email,
          primaryPhone: p.phone,
        },
        address: {
          ...MOCK_PROVIDER_FULL_PROFILE.address,
          addressLine1: p.address || MOCK_PROVIDER_FULL_PROFILE.address.addressLine1,
          city: p.city || "Bangalore",
        },
        updatedAt: p.updatedAt,
      };

      inMemoryFullProfile = profile;
      return profile;
    }

    await new Promise((res) => setTimeout(res, 50));
    if (typeof window === "undefined") return inMemoryFullProfile;
    try {
      const stored = localStorage.getItem(STORAGE_PROVIDER_FULL_PROFILE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      return inMemoryFullProfile;
    }
    return inMemoryFullProfile;
  }

  private async persistProfile(profile: ProviderFullProfile): Promise<ProviderFullProfile> {
    inMemoryFullProfile = profile;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_PROVIDER_FULL_PROFILE_KEY, JSON.stringify(profile));
      } catch {
        // ignore
      }
    }
    return profile;
  }

  async updateBusinessIdentity(identity: Partial<ProviderBusinessIdentity>): Promise<ProviderFullProfile> {
    if (isLiveMode()) {
      await providerApi.profile.updateProfile({
        businessName: identity.businessName,
        description: identity.description,
        profileImageUrl: identity.logoUrl,
        coverImageUrl: identity.coverPhotoUrl,
      });
      return this.getFullProfile();
    }

    await new Promise((res) => setTimeout(res, 400));
    const current = await this.getFullProfile();
    const updated: ProviderFullProfile = {
      ...current,
      identity: { ...current.identity, ...identity },
      updatedAt: new Date().toISOString(),
    };
    return this.persistProfile(updated);
  }

  async updateContactInfo(contact: Partial<ProviderContactInfo>): Promise<ProviderFullProfile> {
    if (isLiveMode()) {
      await providerApi.profile.updateProfile({
        phone: contact.primaryPhone,
      });
      return this.getFullProfile();
    }

    await new Promise((res) => setTimeout(res, 400));
    const current = await this.getFullProfile();
    const updated: ProviderFullProfile = {
      ...current,
      contact: { ...current.contact, ...contact },
      updatedAt: new Date().toISOString(),
    };
    return this.persistProfile(updated);
  }

  async updateBusinessAddress(address: Partial<ProviderBusinessAddress>): Promise<ProviderFullProfile> {
    if (isLiveMode()) {
      await providerApi.profile.updateProfile({
        address: address.addressLine1,
        city: address.city,
      });
      return this.getFullProfile();
    }

    await new Promise((res) => setTimeout(res, 400));
    const current = await this.getFullProfile();
    const updated: ProviderFullProfile = {
      ...current,
      address: { ...current.address, ...address },
      updatedAt: new Date().toISOString(),
    };
    return this.persistProfile(updated);
  }

  async updateOperatingHours(hours: Partial<ProviderOperatingHoursConfig>): Promise<ProviderFullProfile> {
    if (isLiveMode()) {
      const current = await this.getFullProfile();
      const updated: ProviderFullProfile = {
        ...current,
        operatingHours: { ...current.operatingHours, ...hours },
        updatedAt: new Date().toISOString(),
      };
      return this.persistProfile(updated);
    }

    await new Promise((res) => setTimeout(res, 400));
    const current = await this.getFullProfile();
    const updated: ProviderFullProfile = {
      ...current,
      operatingHours: { ...current.operatingHours, ...hours },
      updatedAt: new Date().toISOString(),
    };
    return this.persistProfile(updated);
  }

  async updateServiceArea(area: Partial<ProviderServiceAreaConfig>): Promise<ProviderFullProfile> {
    if (isLiveMode()) {
      const current = await this.getFullProfile();
      const updated: ProviderFullProfile = {
        ...current,
        serviceArea: { ...current.serviceArea, ...area },
        updatedAt: new Date().toISOString(),
      };
      return this.persistProfile(updated);
    }

    await new Promise((res) => setTimeout(res, 400));
    const current = await this.getFullProfile();
    const updated: ProviderFullProfile = {
      ...current,
      serviceArea: { ...current.serviceArea, ...area },
      updatedAt: new Date().toISOString(),
    };
    return this.persistProfile(updated);
  }

  async uploadLogo(file: File): Promise<{ logoUrl: string }> {
    if (isLiveMode()) {
      const mockUploadedUrl = `https://storage.washora.com/studios/logos/${file.name}`;
      await providerApi.profile.updateProfile({ profileImageUrl: mockUploadedUrl });
      return { logoUrl: mockUploadedUrl };
    }

    await new Promise((res) => setTimeout(res, 600));
    const logoUrl = URL.createObjectURL(file);
    await this.updateBusinessIdentity({ logoUrl });
    return { logoUrl };
  }

  async uploadCoverPhoto(file: File): Promise<{ coverPhotoUrl: string }> {
    if (isLiveMode()) {
      const mockUploadedUrl = `https://storage.washora.com/studios/covers/${file.name}`;
      await providerApi.profile.updateProfile({ coverImageUrl: mockUploadedUrl });
      return { coverPhotoUrl: mockUploadedUrl };
    }

    await new Promise((res) => setTimeout(res, 600));
    const coverPhotoUrl = URL.createObjectURL(file);
    await this.updateBusinessIdentity({ coverPhotoUrl });
    return { coverPhotoUrl };
  }
}

export const providerProfileService = new ProviderProfileService();
