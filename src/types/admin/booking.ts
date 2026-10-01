import { z } from "zod";

/**
 * WASHORA ADMIN / OPERATIONS BOOKING & ORDER DOMAIN TYPES
 * Canonical data models, lifecycle statuses, address models, queries, summary metrics, and validation schemas.
 */

export const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const ALLOWED_STATUS_TRANSITIONS: Record<BookingStatus, readonly BookingStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["in_progress", "cancelled"],
  in_progress: ["completed", "cancelled"],
  completed: [], // Terminal state
  cancelled: [], // Terminal state
};

export const BOOKING_DATE_PRESETS = [
  "all",
  "today",
  "tomorrow",
  "next_7_days",
  "past_7_days",
  "past_30_days",
] as const;

export type BookingDatePreset = (typeof BOOKING_DATE_PRESETS)[number];

export const BOOKING_SORT_FIELDS = [
  "bookingNumber",
  "createdAt",
  "scheduledAt",
  "customerName",
  "providerName",
  "serviceName",
  "totalAmount",
  "status",
] as const;

export type BookingSortField = (typeof BOOKING_SORT_FIELDS)[number];
export type BookingSortDirection = "asc" | "desc";

export interface BookingAddress {
  addressLine1: string;
  addressLine2?: string;
  area: string;
  city: string;
  state: string;
  postalCode: string;
  landmark?: string;
}

export interface BookingServiceReference {
  id: string;
  name: string;
  category: string;
}

export interface BookingOrder {
  id: string; // e.g. "BKG-000001"
  organizationId: string; // e.g. "ORG-0001"
  customerId: string; // references Customer
  providerId: string; // references Provider
  serviceId: string; // references Service
  bookingNumber: string; // e.g. "WAS-2026-000001"
  scheduledAt: string; // ISO date-time string
  createdAt: string; // ISO date-time string
  updatedAt: string; // ISO date-time string
  status: BookingStatus;
  address: BookingAddress;
  serviceName: string;
  serviceCategory: string;
  quantity: number; // >= 1
  subtotal: number; // in INR (₹)
  serviceFee: number; // in INR (₹)
  totalAmount: number; // subtotal + serviceFee
  customerNotes?: string;
  lastUpdatedBy?: string;
}

export type BookingActivityType =
  | "booking_created"
  | "booking_confirmed"
  | "booking_started"
  | "booking_completed"
  | "booking_cancelled"
  | "booking_updated";

export interface BookingActivity {
  id: string;
  bookingId: string;
  type: BookingActivityType;
  description: string;
  timestamp: string; // ISO string
  actorName?: string;
  status?: BookingStatus;
}

export interface BookingSummaryMetrics {
  total: number;
  pending: number;
  confirmed: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

export interface ListBookingsParams {
  organizationId: string;
  search?: string;
  status?: BookingStatus | "all";
  date?: BookingDatePreset;
  serviceCategory?: string;
  city?: string;
  providerId?: string;
  customerId?: string;
  sort?: BookingSortField;
  sortDirection?: BookingSortDirection;
  page?: number;
  pageSize?: number;
}

export interface ListBookingsResult {
  bookings: BookingOrder[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  metrics: BookingSummaryMetrics;
  availableCities: string[];
  availableCategories: string[];
  availableProviders: { id: string; name: string }[];
  availableCustomers: { id: string; name: string }[];
}

/**
 * Zod schema for editing operationally safe booking fields
 */
export const bookingEditSchema = z.object({
  scheduledDate: z
    .string()
    .min(1, "Scheduled date is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD"),
  scheduledTime: z
    .string()
    .min(1, "Scheduled time is required")
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format must be HH:MM (24-hour)"),
  quantity: z
    .number({ invalid_type_error: "Quantity must be a number" })
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1"),
  addressLine1: z
    .string()
    .trim()
    .min(3, "Address line 1 must be at least 3 characters")
    .max(100, "Address line 1 is too long"),
  addressLine2: z.string().trim().max(100, "Address line 2 is too long").optional(),
  area: z
    .string()
    .trim()
    .min(2, "Area must be at least 2 characters")
    .max(50, "Area is too long"),
  city: z
    .string()
    .trim()
    .min(2, "City must be at least 2 characters")
    .max(50, "City is too long"),
  state: z
    .string()
    .trim()
    .min(2, "State must be at least 2 characters")
    .max(50, "State is too long"),
  postalCode: z
    .string()
    .trim()
    .regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit Indian PIN code (e.g. 600001)"),
  landmark: z.string().trim().max(80, "Landmark is too long").optional(),
  customerNotes: z
    .string()
    .trim()
    .max(500, "Customer notes must not exceed 500 characters")
    .optional(),
});

export type BookingEditFormValues = z.infer<typeof bookingEditSchema>;
