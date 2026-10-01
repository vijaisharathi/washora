import { CustomerAddress, ServiceItem, ProviderSummary, ServiceVariant } from "./index";

export interface AvailableDateItem {
  id: string;
  dayLabel: string; // e.g. "Today", "Tomorrow", "Wed", "Thu"
  dateFormatted: string; // e.g. "Aug 31", "Sep 1"
  dateIso: string;
  status: "AVAILABLE" | "SELECTED" | "FULLY_BOOKED";
}

export interface BookingTimeSlot {
  id: string;
  label: string; // e.g. "10:00 AM – 12:00 PM"
  period: "MORNING" | "AFTERNOON" | "EVENING";
  status: "AVAILABLE" | "FILLING_FAST" | "UNAVAILABLE";
}

export interface CustomerBookingDraft {
  serviceId: string;
  service?: ServiceItem;
  providerId?: string;
  provider?: ProviderSummary;
  variantId?: string;
  variant?: ServiceVariant;
  quantity: number;
  selectedAddressId?: string;
  selectedAddress?: CustomerAddress;
  pickupDate?: string;
  pickupTimeSlotId?: string;
  pickupTimeSlotLabel?: string;
  specialInstructions?: string;
  estimatedServiceTotal: number;
  pickupFee: number;
  deliveryFee: number;
  estimatedTotal: number;
}
