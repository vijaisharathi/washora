import {
  ProviderPickupItem,
  ProviderPickupStats,
  AssignPartnerPayload,
  ToggleHandoverChecklistPayload,
  ConfirmHandoverPayload,
  ReportHandoverIssuePayload,
  DeliveryPartnerSnapshot,
} from "@/types/provider/pickups";
import {
  MOCK_PROVIDER_PICKUPS,
  MOCK_AVAILABLE_PARTNERS,
} from "@/mocks/provider/pickups.mock";

const STORAGE_PICKUPS_KEY = "washora_provider_pickups_store";

let inMemoryPickups: ProviderPickupItem[] = [...MOCK_PROVIDER_PICKUPS];

export interface IProviderPickupsService {
  getPickups(providerId?: string): Promise<ProviderPickupItem[]>;
  getPickupById(id: string, providerId?: string): Promise<ProviderPickupItem | null>;
  getAvailablePartners(): Promise<DeliveryPartnerSnapshot[]>;
  assignPartner(payload: AssignPartnerPayload, providerId?: string): Promise<ProviderPickupItem>;
  toggleChecklist(
    payload: ToggleHandoverChecklistPayload,
    providerId?: string
  ): Promise<ProviderPickupItem>;
  confirmHandover(
    payload: ConfirmHandoverPayload,
    providerId?: string
  ): Promise<ProviderPickupItem>;
  reportIssue(
    payload: ReportHandoverIssuePayload,
    providerId?: string
  ): Promise<ProviderPickupItem>;
  getPickupStats(providerId?: string): Promise<ProviderPickupStats>;
}

class ProviderPickupsService implements IProviderPickupsService {
  private async loadStoredPickups(): Promise<ProviderPickupItem[]> {
    if (typeof window === "undefined") return inMemoryPickups;
    try {
      const stored = localStorage.getItem(STORAGE_PICKUPS_KEY);
      if (stored) {
        inMemoryPickups = JSON.parse(stored);
        return inMemoryPickups;
      }
    } catch {
      return inMemoryPickups;
    }
    return inMemoryPickups;
  }

  private persistPickups(pickups: ProviderPickupItem[]): void {
    inMemoryPickups = pickups;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_PICKUPS_KEY, JSON.stringify(pickups));
      } catch {
        // ignore
      }
    }
  }

  async getPickups(providerId: string = "prov-1"): Promise<ProviderPickupItem[]> {
    await new Promise((res) => setTimeout(res, 50));
    const all = await this.loadStoredPickups();
    return all.filter((p) => p.providerId === providerId);
  }

  async getPickupById(id: string, providerId: string = "prov-1"): Promise<ProviderPickupItem | null> {
    await new Promise((res) => setTimeout(res, 50));
    const all = await this.loadStoredPickups();
    return (
      all.find((p) => (p.id === id || p.pickupNumber === id) && p.providerId === providerId) || null
    );
  }

  async getAvailablePartners(): Promise<DeliveryPartnerSnapshot[]> {
    await new Promise((res) => setTimeout(res, 50));
    return MOCK_AVAILABLE_PARTNERS;
  }

  async assignPartner(
    payload: AssignPartnerPayload,
    providerId: string = "prov-1"
  ): Promise<ProviderPickupItem> {
    await new Promise((res) => setTimeout(res, 250));
    const all = await this.loadStoredPickups();
    const index = all.findIndex((p) => p.id === payload.pickupId && p.providerId === providerId);

    if (index === -1) {
      throw new Error(`Pickup ${payload.pickupId} not found.`);
    }

    const partner = MOCK_AVAILABLE_PARTNERS.find((p) => p.id === payload.partnerId) || {
      id: payload.partnerId,
      name: "Assigned Valet",
      phone: "+91 99999 00000",
      vehicleType: "Electric Scooter",
      arrivalEtaMinutes: 10,
    };

    const updated: ProviderPickupItem = {
      ...all[index],
      status: "PARTNER_ASSIGNED",
      partner,
      updatedAt: new Date().toISOString(),
    };

    all[index] = updated;
    this.persistPickups([...all]);
    return updated;
  }

  async toggleChecklist(
    payload: ToggleHandoverChecklistPayload,
    providerId: string = "prov-1"
  ): Promise<ProviderPickupItem> {
    await new Promise((res) => setTimeout(res, 100));
    const all = await this.loadStoredPickups();
    const index = all.findIndex((p) => p.id === payload.pickupId && p.providerId === providerId);

    if (index === -1) {
      throw new Error(`Pickup ${payload.pickupId} not found.`);
    }

    const pickup = all[index];
    const updatedChecklist = {
      ...pickup.checklist,
      [payload.key]: !pickup.checklist[payload.key],
    };

    const updated: ProviderPickupItem = {
      ...pickup,
      checklist: updatedChecklist,
      updatedAt: new Date().toISOString(),
    };

    all[index] = updated;
    this.persistPickups([...all]);
    return updated;
  }

  async confirmHandover(
    payload: ConfirmHandoverPayload,
    providerId: string = "prov-1"
  ): Promise<ProviderPickupItem> {
    await new Promise((res) => setTimeout(res, 300));
    const all = await this.loadStoredPickups();
    const index = all.findIndex((p) => p.id === payload.pickupId && p.providerId === providerId);

    if (index === -1) {
      throw new Error(`Pickup ${payload.pickupId} not found.`);
    }

    const pickup = all[index];

    // Check verification OTP code if provided
    if (
      payload.verificationCode &&
      pickup.verificationOtp &&
      payload.verificationCode !== pickup.verificationOtp
    ) {
      throw new Error("Invalid Handover PIN / OTP. Please re-enter.");
    }

    // Idempotent safeguard
    if (pickup.status === "HANDED_OVER") {
      return pickup;
    }

    const updated: ProviderPickupItem = {
      ...pickup,
      status: "HANDED_OVER",
      checklist: {
        itemCountVerified: true,
        packageSealed: true,
        stagingAreaReady: true,
      },
      handedOverAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      updatedAt: new Date().toISOString(),
    };

    all[index] = updated;
    this.persistPickups([...all]);
    return updated;
  }

  async reportIssue(
    payload: ReportHandoverIssuePayload,
    providerId: string = "prov-1"
  ): Promise<ProviderPickupItem> {
    await new Promise((res) => setTimeout(res, 250));
    const all = await this.loadStoredPickups();
    const index = all.findIndex((p) => p.id === payload.pickupId && p.providerId === providerId);

    if (index === -1) {
      throw new Error(`Pickup ${payload.pickupId} not found.`);
    }

    const updated: ProviderPickupItem = {
      ...all[index],
      status: "FAILED",
      issueReport: {
        reason: payload.reason,
        details: payload.details,
        reportedAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    };

    all[index] = updated;
    this.persistPickups([...all]);
    return updated;
  }

  async getPickupStats(providerId: string = "prov-1"): Promise<ProviderPickupStats> {
    const list = await this.getPickups(providerId);

    return {
      awaitingAssignmentCount: list.filter((p) => p.status === "AWAITING_ASSIGNMENT").length,
      assignedEnRouteCount: list.filter((p) => p.status === "PARTNER_ASSIGNED").length,
      readyForHandoverCount: list.filter((p) => p.status === "PARTNER_ARRIVED").length,
      handedOverCount: list.filter((p) => p.status === "HANDED_OVER").length,
      totalCount: list.length,
    };
  }
}

export const providerPickupsService = new ProviderPickupsService();
