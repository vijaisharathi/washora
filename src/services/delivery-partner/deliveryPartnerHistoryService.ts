import {
  DeliveryHistoryRecord,
  DeliveryHistorySummary,
  HistoryFilterParams,
  TaskType,
  DeliveryHistoryOutcome,
} from "@/types/delivery-partner";
import {
  MOCK_DELIVERY_HISTORY,
  MOCK_HISTORY_SUMMARY,
} from "@/mocks/delivery-partner/history.mock";
import { deliveryPartnerAuthService } from "./deliveryPartnerAuthService";
import { deliveryPartnerApi } from "@/features/delivery-partner/api/deliveryPartnerApi";
import { isLiveMode } from "@/lib/api/mode";

const STORAGE_HISTORY_KEY = "washora_delivery_partner_history";

export interface IDeliveryPartnerHistoryService {
  getHistorySummary(): Promise<DeliveryHistorySummary>;
  getHistoryRecords(filter?: HistoryFilterParams): Promise<DeliveryHistoryRecord[]>;
  getHistoryRecordById(id: string): Promise<DeliveryHistoryRecord | null>;
}

class DeliveryPartnerHistoryService implements IDeliveryPartnerHistoryService {
  private memoryRecords: DeliveryHistoryRecord[] | null = null;

  private loadRecords(): DeliveryHistoryRecord[] {
    if (this.memoryRecords) return this.memoryRecords;
    if (typeof window !== "undefined") {
      try {
        const val = localStorage.getItem(STORAGE_HISTORY_KEY);
        if (val) {
          this.memoryRecords = JSON.parse(val);
          return this.memoryRecords!;
        }
      } catch {
        // ignore
      }
    }
    this.memoryRecords = [...MOCK_DELIVERY_HISTORY];
    return this.memoryRecords;
  }

  async getHistorySummary(): Promise<DeliveryHistorySummary> {
    await new Promise((res) => setTimeout(res, 50));
    const session = await deliveryPartnerAuthService.getSession();
    const currentPartnerId = session.partner?.id || "dp-1";

    const records = await this.getHistoryRecords();

    return {
      ...MOCK_HISTORY_SUMMARY,
      totalCompletedTrips: records.length,
      records,
    };
  }

  async getHistoryRecords(filter?: HistoryFilterParams): Promise<DeliveryHistoryRecord[]> {
    const session = await deliveryPartnerAuthService.getSession();
    const currentPartnerId = session.partner?.id || "dp-1";

    if (isLiveMode()) {
      try {
        const res = await deliveryPartnerApi.assignments.list({ status: "COMPLETED" });
        const items: any[] = Array.isArray(res.data) ? res.data : [];
        if (items.length > 0) {
          const liveRecords: DeliveryHistoryRecord[] = items.map((item: any) => ({
            id: item.publicId || item.id,
            partnerId: currentPartnerId,
            taskId: item.publicId || item.id,
            orderId: item.bookingNumber || item.bookingId || "BK-0000",
            type: (item.type === "PROVIDER_TRANSFER" ? "HUB_TRANSFER" : item.type) as TaskType,
            outcome: "DELIVERED" as DeliveryHistoryOutcome,
            customerName: item.address?.recipientName || "Valued Customer",
            customerPhone: item.address?.recipientPhone || "+91 98765 43210",
            pickupAddress: item.address?.formattedAddress || "Bangalore",
            deliveryAddress: item.address?.formattedAddress || "Bangalore",
            completedAt: new Date().toISOString(),
            packageCount: item.totalPackageCount || 1,
            itemsList: ["Garment Package", "Laundry Pouch"],
            distanceKm: 3.8,
            earnedAmount: 85,
            securitySealCode: "WASH-TAG-01",
            verificationMethod: "OTP Handover",
            timeline: [],
          }));
          return liveRecords;
        }
      } catch {
        // Fallback to memory
      }
    }

    await new Promise((res) => setTimeout(res, 50));
    let records = this.loadRecords().filter((r) => r.partnerId === currentPartnerId);

    if (filter?.outcome && filter.outcome !== "ALL") {
      records = records.filter((r) => r.outcome === filter.outcome);
    }

    if (filter?.searchQuery && filter.searchQuery.trim()) {
      const q = filter.searchQuery.toLowerCase().trim();
      records = records.filter(
        (r) =>
          r.orderId.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q) ||
          r.pickupAddress.toLowerCase().includes(q) ||
          r.deliveryAddress.toLowerCase().includes(q) ||
          (r.securitySealCode && r.securitySealCode.toLowerCase().includes(q))
      );
    }

    return records;
  }

  async getHistoryRecordById(id: string): Promise<DeliveryHistoryRecord | null> {
    const records = await this.getHistoryRecords();
    return records.find((r) => r.id === id || r.taskId === id || r.orderId === id) || null;
  }
}

export const deliveryPartnerHistoryService = new DeliveryPartnerHistoryService();
