/**
 * Type definitions for WASHORA Service Provider Booking Management (P6)
 */

export type ProviderBookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";

export interface BookingCustomerSnapshot {
  id: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  pickupAddress: string;
  distanceKm?: number;
}

export interface ProviderBookingItem {
  id: string;
  bookingNumber: string; // e.g. "QH-20260902-1041"
  providerId: string;
  customer: BookingCustomerSnapshot;
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  itemsCount: number;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTimeWindow: string; // e.g. "14:00 - 16:00"
  estimatedValue: number; // in INR (₹)
  careType: "Standard Care" | "Express Rush" | "Couture Spa";
  status: ProviderBookingStatus;
  specialInstructions?: string;
  declineReason?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderBookingStats {
  newCount: number;
  todayCount: number;
  inProgressCount: number;
  readyCount: number;
  completedCount: number;
  cancelledCount: number;
}

export interface AcceptBookingPayload {
  bookingId: string;
}

export interface DeclineBookingPayload {
  bookingId: string;
  reason: string;
  notes?: string;
}

export interface CancelBookingPayload {
  bookingId: string;
  reason: string;
}
