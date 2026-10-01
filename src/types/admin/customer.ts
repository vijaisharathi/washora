import { z } from "zod";

/**
 * WASHORA ADMIN / OPERATIONS CUSTOMER MANAGEMENT DOMAIN TYPES
 * Canonical data models, filters, queries, metrics, and validation schemas.
 */

export type CustomerStatus = "active" | "inactive" | "suspended";

export interface Customer {
  id: string; // e.g. "CUS-0001"
  organizationId: string; // e.g. "ORG-0001"
  fullName: string;
  email: string;
  phone: string;
  profileImage?: string;
  status: CustomerStatus;
  city?: string;
  joinedAt: string; // ISO date string
  updatedAt: string; // ISO date string
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalSpend: number; // in INR (₹)
  lastBookingAt?: string; // ISO date string or undefined if 0 bookings
}

export type CustomerActivityType =
  | "booking_created"
  | "booking_completed"
  | "booking_cancelled"
  | "profile_updated"
  | "status_changed";

export interface CustomerActivity {
  id: string;
  customerId: string;
  type: CustomerActivityType;
  description: string;
  timestamp: string;
  status: string;
  actorName?: string;
}

export interface CustomerSummaryMetrics {
  totalCustomers: number;
  activeCustomers: number;
  newThisMonth: number;
  customersWithOrders: number;
  requiringAttention: number;
  activeRatePct: number;
  conversionRatePct: number;
}

export type CustomerBookingActivityFilter =
  | "all"
  | "none"
  | "1-5"
  | "6-20"
  | "20+";

export type CustomerSortField =
  | "name"
  | "joinedAt"
  | "lastBookingAt"
  | "totalBookings"
  | "totalSpend"
  | "status";

export type CustomerSortDirection = "asc" | "desc";

export interface ListCustomersParams {
  organizationId: string;
  search?: string;
  status?: CustomerStatus | "all";
  city?: string | "all";
  bookingActivity?: CustomerBookingActivityFilter;
  sort?: CustomerSortField;
  sortDirection?: CustomerSortDirection;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UpdateCustomerPayload {
  fullName: string;
  email: string;
  phone: string;
  city: string;
}

export interface UpdateCustomerStatusPayload {
  status: CustomerStatus;
  reason?: string;
}

/**
 * Validation schema for editing customer profile
 */
export const customerEditSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(
      /^(?:\+91|91)?[6789]\d{9}$/,
      "Please enter a valid Indian mobile number (e.g. +91 9876543210 or 9876543210)"
    ),
  city: z
    .string()
    .trim()
    .min(2, "City must be at least 2 characters")
    .max(50, "City cannot exceed 50 characters"),
});

export type CustomerEditFormData = z.infer<typeof customerEditSchema>;
