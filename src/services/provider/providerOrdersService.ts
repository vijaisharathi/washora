import {
  ProviderOrderItem,
  ProviderOrderStatus,
  ProviderOrderStats,
  AdvanceOrderStagePayload,
  ToggleChecklistStepPayload,
  AddOrderNotePayload,
  ReportOrderIssuePayload,
} from "@/types/provider/orders";
import { MOCK_PROVIDER_ORDERS } from "@/mocks/provider/orders.mock";
import { providerApi } from "@/features/provider/api/providerApi";
import { isLiveMode } from "@/lib/api/mode";

const STORAGE_ORDERS_KEY = "washora_provider_orders_processing_store";

let inMemoryOrders: ProviderOrderItem[] = [...MOCK_PROVIDER_ORDERS];

export interface IProviderOrdersService {
  getOrders(providerId?: string): Promise<ProviderOrderItem[]>;
  getOrderById(id: string, providerId?: string): Promise<ProviderOrderItem | null>;
  advanceOrderStage(payload: AdvanceOrderStagePayload, providerId?: string): Promise<ProviderOrderItem>;
  toggleChecklistStep(payload: ToggleChecklistStepPayload, providerId?: string): Promise<ProviderOrderItem>;
  addOrderNote(payload: AddOrderNotePayload, providerId?: string): Promise<ProviderOrderItem>;
  reportOrderIssue(payload: ReportOrderIssuePayload, providerId?: string): Promise<ProviderOrderItem>;
  getOrderStats(providerId?: string): Promise<ProviderOrderStats>;
}

class ProviderOrdersService implements IProviderOrdersService {
  private async loadStoredOrders(): Promise<ProviderOrderItem[]> {
    if (typeof window === "undefined") return inMemoryOrders;
    try {
      const stored = localStorage.getItem(STORAGE_ORDERS_KEY);
      if (stored) {
        inMemoryOrders = JSON.parse(stored);
        return inMemoryOrders;
      }
    } catch {
      return inMemoryOrders;
    }
    return inMemoryOrders;
  }

  private persistOrders(orders: ProviderOrderItem[]): void {
    inMemoryOrders = orders;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
      } catch {
        // ignore
      }
    }
  }

  async getOrders(providerId: string = "prov-1"): Promise<ProviderOrderItem[]> {
    if (isLiveMode()) {
      const res = await providerApi.bookings.getBookings();
      const raw = Array.isArray(res.data) ? res.data : (res as any).data?.items || [];

      return raw.map((b: any) => ({
        id: b.id,
        orderNumber: b.bookingNumber || `WSH-${b.id.slice(0, 8).toUpperCase()}`,
        bookingId: b.id,
        providerId,
        customer: {
          id: b.customer?.id || "c-1",
          name: b.customerName || b.customer?.fullName || "Customer",
          phone: b.customerPhone || b.customer?.phone || "+91 98765 43210",
          pickupAddress: b.deliveryAddressSnippet || "Bangalore, India",
        },
        serviceId: "srv-1",
        serviceName: b.serviceCategory || "Couture Garment Care",
        serviceCategory: "Dry Cleaning",
        itemsCount: b.itemCount || 3,
        careType: "Standard Care",
        status: (b.status === "PICKED_UP"
          ? "INTAKE_INSPECTION"
          : b.status === "IN_PROCESS"
          ? "HYDROCARBON_CARE"
          : b.status === "CLEANED"
          ? "QUALITY_CHECK"
          : b.status === "OUT_FOR_DELIVERY" || b.status === "DELIVERED"
          ? "READY_VALET"
          : "INTAKE_INSPECTION") as ProviderOrderStatus,
        progressPercent: b.status === "DELIVERED" ? 100 : b.status === "CLEANED" ? 85 : 45,
        startedAt: b.createdAt || new Date().toISOString(),
        expectedCompletion: b.scheduledDeliveryAt || new Date(Date.now() + 86400000).toISOString(),
        checklist: [
          { id: "c1", title: "Inspection", description: "Inspect seams", isCompleted: true },
          { id: "c2", title: "Pre-Treatment", description: "Spot-treat stains", isCompleted: true },
          { id: "c3", title: "Cleaning", description: "Hydrocarbon care", isCompleted: false },
          { id: "c4", title: "Finishing", description: "Steam and lint removal", isCompleted: false },
          { id: "c5", title: "QA Tagging", description: "Master Cleaners QA tag", isCompleted: false },
        ],
        itemPhotos: [],
        price: Number(b.totalAmount || 1200),
        createdAt: b.createdAt || new Date().toISOString(),
        updatedAt: b.updatedAt || new Date().toISOString(),
      }));
    }

    await new Promise((res) => setTimeout(res, 50));
    const all = await this.loadStoredOrders();
    return all.filter((o) => o.providerId === providerId);
  }

  async getOrderById(id: string, providerId: string = "prov-1"): Promise<ProviderOrderItem | null> {
    if (isLiveMode()) {
      try {
        const res = await providerApi.bookings.getBookingById(id);
        const b = res.data;
        return {
          id: b.id,
          orderNumber: b.bookingNumber || `WSH-${b.id.slice(0, 8).toUpperCase()}`,
          bookingId: b.id,
          providerId,
          customer: {
            id: "c-1",
            name: b.customer?.fullName || "Customer",
            phone: b.customer?.phone || "+91 98765 43210",
            pickupAddress: b.addressSnapshot?.locality || "Bangalore, India",
          },
          serviceId: "srv-1",
          serviceName: b.items?.[0]?.serviceName || "Garment Care",
          serviceCategory: "Dry Cleaning",
          itemsCount: b.items?.length || 1,
          careType: "Standard Care",
          status: "HYDROCARBON_CARE",
          progressPercent: 50,
          startedAt: b.createdAt,
          expectedCompletion: b.scheduledDeliveryAt,
          checklist: [
            { id: "c1", title: "Inspection", description: "Inspect seams", isCompleted: true },
            { id: "c2", title: "Pre-Treatment", description: "Spot-treat stains", isCompleted: true },
            { id: "c3", title: "Cleaning", description: "Hydrocarbon care", isCompleted: false },
            { id: "c4", title: "Finishing", description: "Steam and lint removal", isCompleted: false },
            { id: "c5", title: "QA Tagging", description: "Master Cleaners QA tag", isCompleted: false },
          ],
          itemPhotos: [],
          price: Number(b.pricing?.total || 1200),
          createdAt: b.createdAt,
          updatedAt: b.updatedAt,
        };
      } catch {
        return null;
      }
    }

    await new Promise((res) => setTimeout(res, 50));
    const all = await this.loadStoredOrders();
    return all.find((o) => (o.id === id || o.orderNumber === id) && o.providerId === providerId) || null;
  }

  async advanceOrderStage(
    payload: AdvanceOrderStagePayload,
    providerId: string = "prov-1"
  ): Promise<ProviderOrderItem> {
    await new Promise((res) => setTimeout(res, 250));
    const all = await this.loadStoredOrders();
    const index = all.findIndex((o) => o.id === payload.orderId && o.providerId === providerId);

    if (index === -1) {
      throw new Error(`Order ${payload.orderId} not found.`);
    }

    const currentOrder = all[index];
    const newProgress =
      payload.nextStatus === "INTAKE_INSPECTION"
        ? 20
        : payload.nextStatus === "HYDROCARBON_CARE"
        ? 50
        : payload.nextStatus === "STEAM_DEODORIZE"
        ? 75
        : payload.nextStatus === "QUALITY_CHECK"
        ? 90
        : 100;

    const updated: ProviderOrderItem = {
      ...currentOrder,
      status: payload.nextStatus,
      progressPercent: newProgress,
      updatedAt: new Date().toISOString(),
    };

    all[index] = updated;
    this.persistOrders([...all]);
    return updated;
  }

  async toggleChecklistStep(
    payload: ToggleChecklistStepPayload,
    providerId: string = "prov-1"
  ): Promise<ProviderOrderItem> {
    await new Promise((res) => setTimeout(res, 150));
    const all = await this.loadStoredOrders();
    const index = all.findIndex((o) => o.id === payload.orderId && o.providerId === providerId);

    if (index === -1) {
      throw new Error(`Order ${payload.orderId} not found.`);
    }

    const order = all[index];
    const updatedChecklist = order.checklist.map((c) =>
      c.id === payload.stepId ? { ...c, isCompleted: !c.isCompleted } : c
    );

    const updated: ProviderOrderItem = {
      ...order,
      checklist: updatedChecklist,
      updatedAt: new Date().toISOString(),
    };

    all[index] = updated;
    this.persistOrders([...all]);
    return updated;
  }

  async addOrderNote(
    payload: AddOrderNotePayload,
    providerId: string = "prov-1"
  ): Promise<ProviderOrderItem> {
    await new Promise((res) => setTimeout(res, 200));
    const all = await this.loadStoredOrders();
    const index = all.findIndex((o) => o.id === payload.orderId && o.providerId === providerId);

    if (index === -1) {
      throw new Error(`Order ${payload.orderId} not found.`);
    }

    const order = all[index];
    const updated: ProviderOrderItem = {
      ...order,
      providerNotes: payload.note,
      updatedAt: new Date().toISOString(),
    };

    all[index] = updated;
    this.persistOrders([...all]);
    return updated;
  }

  async reportOrderIssue(
    payload: ReportOrderIssuePayload,
    providerId: string = "prov-1"
  ): Promise<ProviderOrderItem> {
    await new Promise((res) => setTimeout(res, 250));
    const all = await this.loadStoredOrders();
    const index = all.findIndex((o) => o.id === payload.orderId && o.providerId === providerId);

    if (index === -1) {
      throw new Error(`Order ${payload.orderId} not found.`);
    }

    const order = all[index];
    const issueReport = {
      reason: payload.reason,
      details: payload.details,
      reportedAt: new Date().toISOString(),
      severity: payload.severity || "MEDIUM",
    };

    const updated: ProviderOrderItem = {
      ...order,
      issueReport,
      updatedAt: new Date().toISOString(),
    };

    all[index] = updated;
    this.persistOrders([...all]);
    return updated;
  }

  async getOrderStats(providerId: string = "prov-1"): Promise<ProviderOrderStats> {
    const orders = await this.getOrders(providerId);

    return {
      inIntakeCount: orders.filter((o) => o.status === "INTAKE_INSPECTION").length,
      inCareCount: orders.filter((o) => o.status === "HYDROCARBON_CARE" || o.status === "STEAM_DEODORIZE").length,
      inQualityCount: orders.filter((o) => o.status === "QUALITY_CHECK").length,
      readyValetCount: orders.filter((o) => o.status === "READY_VALET").length,
      totalActiveCount: orders.filter((o) => o.status !== "READY_VALET").length,
    };
  }
}

export const providerOrdersService = new ProviderOrdersService();
