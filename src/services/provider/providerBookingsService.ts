import {
  ProviderBookingItem,
  ProviderBookingStats,
  AcceptBookingPayload,
  DeclineBookingPayload,
  CancelBookingPayload,
} from "@/types/provider/bookings";
import { MOCK_PROVIDER_BOOKINGS } from "@/mocks/provider/bookings.mock";
import { providerApi } from "@/features/provider/api/providerApi";
import { isLiveMode } from "@/lib/api/mode";

const STORAGE_BOOKINGS_KEY = "washora_provider_bookings_store";

let inMemoryBookings: ProviderBookingItem[] = [...MOCK_PROVIDER_BOOKINGS];

export interface IProviderBookingsService {
  getBookings(providerId?: string): Promise<ProviderBookingItem[]>;
  getBookingById(id: string, providerId?: string): Promise<ProviderBookingItem | null>;
  acceptBooking(payload: AcceptBookingPayload, providerId?: string): Promise<ProviderBookingItem>;
  declineBooking(payload: DeclineBookingPayload, providerId?: string): Promise<ProviderBookingItem>;
  cancelBooking(payload: CancelBookingPayload, providerId?: string): Promise<ProviderBookingItem>;
  getBookingStats(providerId?: string): Promise<ProviderBookingStats>;
}

class ProviderBookingsService implements IProviderBookingsService {
  private async loadStoredBookings(): Promise<ProviderBookingItem[]> {
    if (typeof window === "undefined") return inMemoryBookings;
    try {
      const stored = localStorage.getItem(STORAGE_BOOKINGS_KEY);
      if (stored) {
        inMemoryBookings = JSON.parse(stored);
        return inMemoryBookings;
      }
    } catch {
      return inMemoryBookings;
    }
    return inMemoryBookings;
  }

  private persistBookings(bookings: ProviderBookingItem[]): void {
    inMemoryBookings = bookings;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(bookings));
      } catch {
        // ignore
      }
    }
  }

  async getBookings(providerId: string = "prov-1"): Promise<ProviderBookingItem[]> {
    if (isLiveMode()) {
      const res = await providerApi.bookings.getBookings();
      const raw = Array.isArray(res.data) ? res.data : (res as any).data?.items || [];

      return raw.map((b: any) => ({
        id: b.id,
        bookingNumber: b.bookingNumber || `BK-${b.id.slice(0, 8).toUpperCase()}`,
        providerId,
        customer: {
          id: b.customer?.id || b.customerId || "cust-1",
          name: b.customer?.fullName || b.customerName || "Customer",
          phone: b.customer?.phone || b.customerPhone || "+91 98765 43210",
          pickupAddress: b.deliveryAddressSnippet || b.pickupAddress || "Bengaluru",
          distanceKm: b.distanceKm ?? 2.5,
        },
        serviceId: b.serviceId || b.items?.[0]?.serviceId || "srv-101",
        serviceName: b.serviceName || b.items?.[0]?.serviceName || "Sneaker Deep Clean Spa",
        serviceCategory: b.serviceCategory || "shoes",
        itemsCount: b.itemCount || b.itemsCount || (b.items?.length) || 1,
        scheduledDate: b.scheduledDate || (b.scheduledPickupAt ? b.scheduledPickupAt.split("T")[0] : new Date().toISOString().split("T")[0]),
        scheduledTimeWindow: b.scheduledTimeWindow || "14:00 - 16:00",
        estimatedValue: Number(b.totalAmount || b.pricing?.total || 1200),
        careType: (b.careType || "Standard Care") as "Standard Care" | "Express Rush" | "Couture Spa",
        status: (b.status === "CONFIRMED"
          ? "CONFIRMED"
          : b.status === "DELIVERED" || b.status === "COMPLETED"
          ? "COMPLETED"
          : b.status === "CANCELLED"
          ? "CANCELLED"
          : b.status === "REJECTED"
          ? "REJECTED"
          : "PENDING") as ProviderBookingItem["status"],
        specialInstructions: b.specialInstructions || "",
        createdAt: b.createdAt || new Date().toISOString(),
        updatedAt: b.updatedAt || new Date().toISOString(),
      }));
    }

    await new Promise((res) => setTimeout(res, 50));
    const all = await this.loadStoredBookings();
    return all.filter((b) => b.providerId === providerId);
  }

  async getBookingById(id: string, providerId: string = "prov-1"): Promise<ProviderBookingItem | null> {
    if (isLiveMode()) {
      try {
        const res = await providerApi.bookings.getBookingById(id);
        const b = res.data;
        return {
          id: b.id,
          bookingNumber: b.bookingNumber || `BK-${b.id.slice(0, 8).toUpperCase()}`,
          providerId,
          customer: {
            id: (b.customer as any)?.id || "cust-1",
            name: b.customer?.fullName || "Customer",
            phone: b.customer?.phone || "+91 98765 43210",
            pickupAddress: b.addressSnapshot?.locality || "Indiranagar, Bengaluru",
            distanceKm: 2.4,
          },
          serviceId: b.items?.[0]?.id || "srv-101",
          serviceName: b.items?.[0]?.serviceName || "Sneaker Deep Clean Spa",
          serviceCategory: "shoes",
          itemsCount: b.items?.length || 1,
          scheduledDate: b.scheduledPickupAt ? b.scheduledPickupAt.split("T")[0] : new Date().toISOString().split("T")[0],
          scheduledTimeWindow: "14:00 - 16:00",
          estimatedValue: Number(b.pricing?.total || 1200),
          careType: "Express Rush",
          status: (b.status === "CONFIRMED"
            ? "CONFIRMED"
            : b.status === "DELIVERED" || b.status === "COMPLETED"
            ? "COMPLETED"
            : b.status === "CANCELLED"
            ? "CANCELLED"
            : b.status === "REJECTED"
            ? "REJECTED"
            : "PENDING") as ProviderBookingItem["status"],
          specialInstructions: b.specialInstructions || "",
          createdAt: b.createdAt,
          updatedAt: b.updatedAt,
        };
      } catch {
        return null;
      }
    }

    await new Promise((res) => setTimeout(res, 50));
    const all = await this.loadStoredBookings();
    return all.find((b) => b.id === id && b.providerId === providerId) || null;
  }

  async acceptBooking(
    payload: AcceptBookingPayload,
    providerId: string = "prov-1"
  ): Promise<ProviderBookingItem> {
    if (isLiveMode()) {
      try {
        await providerApi.assignments.acceptAssignment(payload.bookingId);
      } catch {
        // Direct booking acceptance if already assigned
      }
      const item = await this.getBookingById(payload.bookingId, providerId);
      if (item) {
        return { ...item, status: "CONFIRMED" };
      }
    }

    await new Promise((res) => setTimeout(res, 300));
    const all = await this.loadStoredBookings();
    const index = all.findIndex((b) => b.id === payload.bookingId && b.providerId === providerId);

    if (index === -1) {
      throw new Error(`Booking ${payload.bookingId} not found.`);
    }

    const updated: ProviderBookingItem = {
      ...all[index],
      status: "CONFIRMED",
      updatedAt: new Date().toISOString(),
    };

    all[index] = updated;
    this.persistBookings([...all]);
    return updated;
  }

  async declineBooking(
    payload: DeclineBookingPayload,
    providerId: string = "prov-1"
  ): Promise<ProviderBookingItem> {
    if (isLiveMode()) {
      try {
        await providerApi.assignments.rejectAssignment(payload.bookingId, payload.reason);
      } catch {
        // Direct booking rejection if already assigned
      }
      const item = await this.getBookingById(payload.bookingId, providerId);
      if (item) {
        return { ...item, status: "REJECTED" };
      }
    }

    await new Promise((res) => setTimeout(res, 300));
    const all = await this.loadStoredBookings();
    const index = all.findIndex((b) => b.id === payload.bookingId && b.providerId === providerId);

    if (index === -1) {
      throw new Error(`Booking ${payload.bookingId} not found.`);
    }

    const updated: ProviderBookingItem = {
      ...all[index],
      status: "REJECTED",
      declineReason: payload.reason + (payload.notes ? `: ${payload.notes}` : ""),
      updatedAt: new Date().toISOString(),
    };

    all[index] = updated;
    this.persistBookings([...all]);
    return updated;
  }

  async cancelBooking(
    payload: CancelBookingPayload,
    providerId: string = "prov-1"
  ): Promise<ProviderBookingItem> {
    await new Promise((res) => setTimeout(res, 300));
    const all = await this.loadStoredBookings();
    const index = all.findIndex((b) => b.id === payload.bookingId && b.providerId === providerId);

    if (index === -1) {
      throw new Error(`Booking ${payload.bookingId} not found.`);
    }

    const updated: ProviderBookingItem = {
      ...all[index],
      status: "CANCELLED",
      cancellationReason: payload.reason,
      updatedAt: new Date().toISOString(),
    };

    all[index] = updated;
    this.persistBookings([...all]);
    return updated;
  }

  async getBookingStats(providerId: string = "prov-1"): Promise<ProviderBookingStats> {
    const bookings = await this.getBookings(providerId);

    const newCount = bookings.filter((b) => b.status === "PENDING").length;
    const todayCount = bookings.filter((b) => b.status === "CONFIRMED").length;
    const inProgressCount = bookings.filter((b) => b.status === "CONFIRMED").length;
    const readyCount = bookings.filter((b) => b.status === "CONFIRMED").length;
    const completedCount = bookings.filter((b) => b.status === "COMPLETED").length;
    const cancelledCount = bookings.filter((b) => b.status === "CANCELLED" || b.status === "REJECTED").length;

    return {
      newCount,
      todayCount,
      inProgressCount,
      readyCount,
      completedCount,
      cancelledCount,
    };
  }
}

export const providerBookingsService = new ProviderBookingsService();
