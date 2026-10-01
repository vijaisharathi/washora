import {
  ProviderAvailabilityData,
  UpdateWorkingHoursPayload,
  UpdateCapacityPayload,
  AddBlackoutDatePayload,
  BlackoutDateItem,
} from "@/types/provider/availability";
import { MOCK_PROVIDER_AVAILABILITY } from "@/mocks/provider/availability.mock";
import { providerApi } from "@/features/provider/api/providerApi";
import { isLiveMode } from "@/lib/api/mode";

const STORAGE_AVAILABILITY_KEY = "washora_provider_availability_config";

let inMemoryAvailability: ProviderAvailabilityData = { ...MOCK_PROVIDER_AVAILABILITY };

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
const DAY_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

export interface IProviderAvailabilityService {
  getAvailability(providerId?: string): Promise<ProviderAvailabilityData>;
  toggleOverallAvailability(providerId?: string): Promise<boolean>;
  updateWorkingHours(payload: UpdateWorkingHoursPayload, providerId?: string): Promise<ProviderAvailabilityData>;
  updateCapacity(payload: UpdateCapacityPayload, providerId?: string): Promise<ProviderAvailabilityData>;
  addBlackoutDate(payload: AddBlackoutDatePayload, providerId?: string): Promise<ProviderAvailabilityData>;
  removeBlackoutDate(blackoutId: string, providerId?: string): Promise<ProviderAvailabilityData>;
}

class ProviderAvailabilityService implements IProviderAvailabilityService {
  private async loadData(): Promise<ProviderAvailabilityData> {
    if (typeof window === "undefined") return inMemoryAvailability;
    try {
      const stored = localStorage.getItem(STORAGE_AVAILABILITY_KEY);
      if (stored) {
        inMemoryAvailability = JSON.parse(stored);
        return inMemoryAvailability;
      }
    } catch {
      return inMemoryAvailability;
    }
    return inMemoryAvailability;
  }

  private persistData(data: ProviderAvailabilityData): void {
    inMemoryAvailability = data;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_AVAILABILITY_KEY, JSON.stringify(data));
      } catch {
        // ignore
      }
    }
  }

  async getAvailability(providerId: string = "prov-1"): Promise<ProviderAvailabilityData> {
    if (isLiveMode()) {
      const res = await providerApi.availability.getAvailability();
      const rawDays = res.data || [];

      const weeklySchedule = { ...MOCK_PROVIDER_AVAILABILITY.weeklySchedule };
      rawDays.forEach((found) => {
        const dayKey = DAY_KEYS[found.dayOfWeek];
        if (dayKey && weeklySchedule[dayKey]) {
          weeklySchedule[dayKey] = {
            ...weeklySchedule[dayKey],
            isOpen: !found.isClosed,
            slots: [
              {
                id: `${dayKey}-1`,
                startTime: found.openTime || "09:00",
                endTime: found.closeTime || "19:00",
              },
            ],
          };
        }
      });

      const data: ProviderAvailabilityData = {
        ...MOCK_PROVIDER_AVAILABILITY,
        providerId,
        weeklySchedule,
        lastUpdated: new Date().toISOString(),
      };
      inMemoryAvailability = data;
      return data;
    }

    await new Promise((res) => setTimeout(res, 50));
    const data = await this.loadData();
    return { ...data, providerId };
  }

  async toggleOverallAvailability(providerId: string = "prov-1"): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 150));
    const data = await this.getAvailability(providerId);
    const updated: ProviderAvailabilityData = {
      ...data,
      isOverallActive: !data.isOverallActive,
      lastUpdated: new Date().toISOString(),
    };
    this.persistData(updated);
    return updated.isOverallActive;
  }

  async updateWorkingHours(
    payload: UpdateWorkingHoursPayload,
    providerId: string = "prov-1"
  ): Promise<ProviderAvailabilityData> {
    if (isLiveMode()) {
      for (const [key, item] of Object.entries(payload.weeklySchedule)) {
        const dayIdx = DAY_KEYS.indexOf(key as any);
        if (dayIdx >= 0) {
          const slot = item.slots[0] || { startTime: "09:00", endTime: "19:00" };
          await providerApi.availability.upsertAvailability({
            dayOfWeek: dayIdx,
            openTime: slot.startTime,
            closeTime: slot.endTime,
            maxCapacityPerHour: 15,
            isClosed: !item.isOpen,
          });
        }
      }
      return this.getAvailability(providerId);
    }

    await new Promise((res) => setTimeout(res, 300));
    const data = await this.loadData();
    const updated: ProviderAvailabilityData = {
      ...data,
      weeklySchedule: payload.weeklySchedule,
      lastUpdated: new Date().toISOString(),
    };
    this.persistData(updated);
    return updated;
  }

  async updateCapacity(
    payload: UpdateCapacityPayload,
    providerId: string = "prov-1"
  ): Promise<ProviderAvailabilityData> {
    await new Promise((res) => setTimeout(res, 300));
    const data = await this.loadData();
    const updated: ProviderAvailabilityData = {
      ...data,
      capacity: payload.capacity,
      lastUpdated: new Date().toISOString(),
    };
    this.persistData(updated);
    return updated;
  }

  async addBlackoutDate(
    payload: AddBlackoutDatePayload,
    providerId: string = "prov-1"
  ): Promise<ProviderAvailabilityData> {
    await new Promise((res) => setTimeout(res, 200));
    const data = await this.getAvailability(providerId);

    const newBlackout: BlackoutDateItem = {
      id: `blk_${Date.now()}`,
      date: payload.date,
      reason: payload.reason,
      isAllDay: payload.isAllDay ?? true,
      customHours: payload.customHours,
    };

    const updated: ProviderAvailabilityData = {
      ...data,
      blackoutDates: [...data.blackoutDates, newBlackout],
      lastUpdated: new Date().toISOString(),
    };
    this.persistData(updated);
    return updated;
  }

  async removeBlackoutDate(
    blackoutId: string,
    providerId: string = "prov-1"
  ): Promise<ProviderAvailabilityData> {
    await new Promise((res) => setTimeout(res, 200));
    const data = await this.getAvailability(providerId);

    const updated: ProviderAvailabilityData = {
      ...data,
      blackoutDates: data.blackoutDates.filter((b) => b.id !== blackoutId),
      lastUpdated: new Date().toISOString(),
    };
    this.persistData(updated);
    return updated;
  }
}

export const providerAvailabilityService = new ProviderAvailabilityService();
