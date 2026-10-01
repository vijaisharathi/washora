import {
  AvailableDateItem,
  BookingTimeSlot,
  CustomerBookingDraft,
} from "@/types/customer/booking";
import {
  mockServiceItems,
  mockProviders,
  mockAddresses,
} from "@/mocks/customer/mockData";
import { customerProfileService } from "@/services/customerProfileService";
import { customerService } from "@/services/customerService";

const STORAGE_BOOKING_DRAFT = "washora_booking_draft";
let inMemoryDraft: CustomerBookingDraft | null = null;

const MOCK_SLOTS: BookingTimeSlot[] = [
  { id: "slot-1", label: "08:00 AM – 10:00 AM", period: "MORNING", status: "AVAILABLE" },
  { id: "slot-2", label: "10:00 AM – 12:00 PM", period: "MORNING", status: "AVAILABLE" },
  { id: "slot-3", label: "01:00 PM – 03:00 PM", period: "AFTERNOON", status: "FILLING_FAST" },
  { id: "slot-4", label: "04:00 PM – 06:00 PM", period: "EVENING", status: "AVAILABLE" },
  { id: "slot-5", label: "06:00 PM – 08:00 PM", period: "EVENING", status: "UNAVAILABLE" },
];

export interface IBookingService {
  getAvailableDates(): Promise<AvailableDateItem[]>;
  getAvailableSlots(dateIso: string): Promise<BookingTimeSlot[]>;
  getInitialDraft(params: {
    serviceId?: string;
    providerId?: string;
    variantId?: string;
  }): Promise<CustomerBookingDraft>;
  saveDraft(draft: CustomerBookingDraft): Promise<CustomerBookingDraft>;
  getSavedDraft(): Promise<CustomerBookingDraft | null>;
}

class BookingService implements IBookingService {
  async getAvailableDates(): Promise<AvailableDateItem[]> {
    await new Promise((res) => setTimeout(res, 150));
    const now = new Date();
    const dates: AvailableDateItem[] = [];

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (let i = 0; i < 4; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);

      const dayLabel = i === 0 ? "Today" : i === 1 ? "Tomorrow" : dayNames[d.getDay()];
      const dateFormatted = `${monthNames[d.getMonth()]} ${d.getDate()}`;
      const dateIso = d.toISOString().split("T")[0];

      dates.push({
        id: `date-${i}`,
        dayLabel,
        dateFormatted,
        dateIso,
        status: i === 2 ? "FULLY_BOOKED" : "AVAILABLE",
      });
    }

    return dates;
  }

  async getAvailableSlots(dateIso: string): Promise<BookingTimeSlot[]> {
    await new Promise((res) => setTimeout(res, 150));
    return MOCK_SLOTS;
  }

  async getInitialDraft(params: {
    serviceId?: string;
    providerId?: string;
    variantId?: string;
  }): Promise<CustomerBookingDraft> {
    await new Promise((res) => setTimeout(res, 100));

    let service = null;
    if (params.serviceId) {
      service = await customerService.getServiceItemById(params.serviceId);
    }
    if (!service) {
      service = mockServiceItems[0];
    }

    const provider = mockProviders.find((p) => p.id === params.providerId) || mockProviders[0];
    const variant = service.variants?.find((v) => v.id === params.variantId) || service.variants?.[0];
    const addresses = await customerProfileService.getAddresses();
    const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0] || mockAddresses[0];

    const quantity = 1;
    const basePrice = variant ? variant.price : service.basePrice;
    const estimatedServiceTotal = basePrice * quantity;

    const draft: CustomerBookingDraft = {
      serviceId: service.id,
      service,
      providerId: provider.id,
      provider,
      variantId: variant?.id,
      variant,
      quantity,
      selectedAddressId: defaultAddress?.id,
      selectedAddress: defaultAddress,
      pickupDate: "Tomorrow",
      pickupTimeSlotId: "slot-2",
      pickupTimeSlotLabel: "10:00 AM – 12:00 PM",
      specialInstructions: "Please call before arriving.",
      estimatedServiceTotal,
      pickupFee: 0,
      deliveryFee: 0,
      estimatedTotal: estimatedServiceTotal,
    };

    inMemoryDraft = draft;
    return draft;
  }

  async saveDraft(draft: CustomerBookingDraft): Promise<CustomerBookingDraft> {
    inMemoryDraft = draft;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_BOOKING_DRAFT, JSON.stringify(draft));
      } catch {
        // ignore
      }
    }
    return draft;
  }

  async getSavedDraft(): Promise<CustomerBookingDraft | null> {
    if (typeof window === "undefined") return inMemoryDraft;
    try {
      const stored = localStorage.getItem(STORAGE_BOOKING_DRAFT);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return inMemoryDraft;
  }
}

export const bookingService = new BookingService();
