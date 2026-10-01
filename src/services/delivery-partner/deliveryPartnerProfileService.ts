import {
  DeliveryPartnerFullProfile,
  DeliveryPartnerStatus,
  UpdatePersonalInfoPayload,
  UpdateVehicleInfoPayload,
  UpdateShiftHubPayload,
  UpdateBankInfoPayload,
} from "@/types/delivery-partner";
import { MOCK_DELIVERY_PARTNER_FULL_PROFILE } from "@/mocks/delivery-partner/profile.mock";
import { deliveryPartnerAuthService } from "./deliveryPartnerAuthService";
import { deliveryPartnerApi } from "@/features/delivery-partner/api/deliveryPartnerApi";
import { isLiveMode } from "@/lib/api/mode";

const STORAGE_PROFILE_KEY = "washora_delivery_partner_full_profile";

let inMemoryFullProfile: DeliveryPartnerFullProfile = { ...MOCK_DELIVERY_PARTNER_FULL_PROFILE };

export interface IDeliveryPartnerProfileService {
  getFullProfile(): Promise<DeliveryPartnerFullProfile>;
  updatePersonalInfo(payload: UpdatePersonalInfoPayload): Promise<DeliveryPartnerFullProfile>;
  updateVehicleInfo(payload: UpdateVehicleInfoPayload): Promise<DeliveryPartnerFullProfile>;
  updateShiftHub(payload: UpdateShiftHubPayload): Promise<DeliveryPartnerFullProfile>;
  updateBankInfo(payload: UpdateBankInfoPayload): Promise<DeliveryPartnerFullProfile>;
}

class DeliveryPartnerProfileService implements IDeliveryPartnerProfileService {
  private async loadStoredProfile(): Promise<DeliveryPartnerFullProfile> {
    if (typeof window === "undefined") return inMemoryFullProfile;
    try {
      const stored = localStorage.getItem(STORAGE_PROFILE_KEY);
      if (stored) {
        inMemoryFullProfile = JSON.parse(stored);
        return inMemoryFullProfile;
      }
    } catch {
      return inMemoryFullProfile;
    }
    return inMemoryFullProfile;
  }

  private persistProfile(profile: DeliveryPartnerFullProfile): void {
    inMemoryFullProfile = profile;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profile));
      } catch {
        // ignore
      }
    }
  }

  async getFullProfile(): Promise<DeliveryPartnerFullProfile> {
    if (isLiveMode()) {
      const res = await deliveryPartnerApi.profile.getProfile();
      const p = res.data;
      const user = p.user;

      const fullProfile: DeliveryPartnerFullProfile = {
        id: p.id,
        name: user?.fullName || "Valet Partner",
        phone: user?.phone || "+91 98765 43210",
        email: user?.email || "valet@washora.example.com",
        avatarUrl: user?.avatarUrl,
        rating: p.ratingAvg ? Number(p.ratingAvg) : 4.85,
        totalDeliveries: p.activeDeliveriesCount ? Number(p.activeDeliveriesCount) : 0,
        acceptanceRate: 98,
        onTimeRate: 99,
        vehicleType: (p.vehicleType as any) || "SCOOTER",
        vehicleModel: "Hero Electric Optima",
        vehiclePlate: p.vehicleNumber || "KA-01-EQ-9042",
        status: (p.status as DeliveryPartnerStatus) || "ONLINE",
        isKycVerified: p.verificationStatus === "VERIFIED",
        city: "Bangalore",
        hubName: "Indiranagar Hub #04",
        joinedDate: p.createdAt || "2026-01-15",
        aadhaarOrDlNumber: p.licenseNumber || "DL-0420180019283",
        dob: "1994-08-12",
        address: "Flat 204, Green Glen Layout, Bellandur, Bangalore 560103",
        drivingLicenseNumber: p.licenseNumber || "DL-0420180019283",
        dlExpiryDate: "2032-05-18",
        preferredShift: "FLEXIBLE_FULL_DAY",
        serviceRadiusKm: 8,
        emergencyContactName: p.emergencyContactName || "Sunita Singh",
        emergencyContactPhone: p.emergencyContactPhone || "+91 98765 11223",
        accountHolderName: user?.fullName || "Vikram Singh",
        bankName: "HDFC Bank",
        accountNumber: "50100492810928",
        ifscCode: "HDFC0001234",
        upiId: "vikram.valet@okhdfcbank",
      };

      this.persistProfile(fullProfile);
      return fullProfile;
    }

    await new Promise((res) => setTimeout(res, 50));
    return this.loadStoredProfile();
  }

  async updatePersonalInfo(payload: UpdatePersonalInfoPayload): Promise<DeliveryPartnerFullProfile> {
    if (isLiveMode()) {
      await deliveryPartnerApi.profile.updateProfile({
        emergencyContactName: payload.emergencyContactName,
        emergencyContactPhone: payload.emergencyContactPhone,
      });

      const current = await this.getFullProfile();
      const updated: DeliveryPartnerFullProfile = {
        ...current,
        name: payload.name,
        phone: payload.phone,
        email: payload.email,
        address: payload.address,
        city: payload.city,
        emergencyContactName: payload.emergencyContactName,
        emergencyContactPhone: payload.emergencyContactPhone,
        avatarUrl: payload.avatarUrl || current.avatarUrl,
      };
      this.persistProfile(updated);
      return updated;
    }

    await new Promise((res) => setTimeout(res, 100));
    const current = await this.loadStoredProfile();
    const updated: DeliveryPartnerFullProfile = {
      ...current,
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      address: payload.address,
      city: payload.city,
      emergencyContactName: payload.emergencyContactName,
      emergencyContactPhone: payload.emergencyContactPhone,
      avatarUrl: payload.avatarUrl || current.avatarUrl,
    };

    this.persistProfile(updated);

    // Synchronize with auth session & onboarding draft
    const session = await deliveryPartnerAuthService.getSession();
    if (session.partner) {
      const updatedSessionPartner = {
        ...session.partner,
        name: updated.name,
        phone: updated.phone,
        email: updated.email,
        city: updated.city,
        avatarUrl: updated.avatarUrl,
      };
      deliveryPartnerAuthService["persistSession"]({
        ...session,
        partner: updatedSessionPartner,
      });
    }

    return updated;
  }

  async updateVehicleInfo(payload: UpdateVehicleInfoPayload): Promise<DeliveryPartnerFullProfile> {
    if (isLiveMode()) {
      await deliveryPartnerApi.profile.updateProfile({
        vehicleType: payload.vehicleType as any,
        vehicleNumber: payload.vehiclePlate,
        licenseNumber: payload.drivingLicenseNumber,
      });

      const current = await this.getFullProfile();
      const updated: DeliveryPartnerFullProfile = {
        ...current,
        vehicleType: payload.vehicleType,
        vehicleModel: payload.vehicleModel,
        vehiclePlate: payload.vehiclePlate,
        drivingLicenseNumber: payload.drivingLicenseNumber,
        dlExpiryDate: payload.dlExpiryDate,
      };
      this.persistProfile(updated);
      return updated;
    }

    await new Promise((res) => setTimeout(res, 100));
    const current = await this.loadStoredProfile();
    const updated: DeliveryPartnerFullProfile = {
      ...current,
      vehicleType: payload.vehicleType,
      vehicleModel: payload.vehicleModel,
      vehiclePlate: payload.vehiclePlate,
      drivingLicenseNumber: payload.drivingLicenseNumber,
      dlExpiryDate: payload.dlExpiryDate,
    };

    this.persistProfile(updated);

    // Synchronize with session
    const session = await deliveryPartnerAuthService.getSession();
    if (session.partner) {
      deliveryPartnerAuthService["persistSession"]({
        ...session,
        partner: {
          ...session.partner,
          vehicleType: updated.vehicleType,
          vehicleModel: updated.vehicleModel,
          vehiclePlate: updated.vehiclePlate,
        },
      });
    }

    return updated;
  }

  async updateShiftHub(payload: UpdateShiftHubPayload): Promise<DeliveryPartnerFullProfile> {
    await new Promise((res) => setTimeout(res, 100));
    const current = await this.loadStoredProfile();
    const updated: DeliveryPartnerFullProfile = {
      ...current,
      preferredShift: payload.preferredShift,
      hubName: payload.hubName,
      serviceRadiusKm: payload.serviceRadiusKm,
    };

    this.persistProfile(updated);

    // Synchronize with session
    const session = await deliveryPartnerAuthService.getSession();
    if (session.partner) {
      deliveryPartnerAuthService["persistSession"]({
        ...session,
        partner: {
          ...session.partner,
          hubName: updated.hubName,
        },
      });
    }

    return updated;
  }

  async updateBankInfo(payload: UpdateBankInfoPayload): Promise<DeliveryPartnerFullProfile> {
    await new Promise((res) => setTimeout(res, 100));
    const current = await this.loadStoredProfile();
    const updated: DeliveryPartnerFullProfile = {
      ...current,
      accountHolderName: payload.accountHolderName,
      bankName: payload.bankName,
      accountNumber: payload.accountNumber,
      ifscCode: payload.ifscCode,
      upiId: payload.upiId,
    };

    this.persistProfile(updated);
    return updated;
  }
}

export const deliveryPartnerProfileService = new DeliveryPartnerProfileService();
