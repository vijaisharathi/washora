import { z } from "zod";

/**
 * WASHORA ADMIN / OPERATIONS PROVIDER MANAGEMENT DOMAIN TYPES
 * Canonical data models, statuses, approval states, queries, metrics, and validation schemas.
 */

export type ProviderStatus = "active" | "inactive" | "suspended";

export type ProviderApprovalStatus = "pending" | "approved" | "rejected";

export const PROVIDER_SERVICE_CATEGORIES = [
  "Home Cleaning",
  "Deep Cleaning",
  "Kitchen Cleaning",
  "Bathroom Cleaning",
  "Sofa Cleaning",
  "Carpet Cleaning",
  "Laundry",
  "Appliance Cleaning",
] as const;

export type ProviderServiceCategory = (typeof PROVIDER_SERVICE_CATEGORIES)[number];

export interface Provider {
  id: string; // e.g. "PRO-0001"
  organizationId: string; // e.g. "ORG-0001"
  fullName: string;
  email: string;
  phone: string;
  profileImage?: string;
  businessName?: string;
  serviceCategories: string[];
  city: string;
  serviceAreas: string[];
  status: ProviderStatus;
  approvalStatus: ProviderApprovalStatus;
  joinedAt: string; // ISO date string
  updatedAt: string; // ISO date string
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  rating: number; // 0.0 to 5.0
  totalReviews: number;
  totalEarnings: number; // in INR (₹)
  lastActiveAt?: string; // ISO date string or undefined
}

export type ProviderActivityType =
  | "provider_registered"
  | "application_submitted"
  | "provider_approved"
  | "provider_rejected"
  | "provider_activated"
  | "provider_suspended"
  | "profile_updated"
  | "booking_completed";

export interface ProviderActivity {
  id: string;
  providerId: string;
  type: ProviderActivityType;
  description: string;
  timestamp: string;
  status: string;
  actorName?: string;
}

export interface ProviderSummaryMetrics {
  totalProviders: number;
  activeProviders: number;
  pendingReview: number;
  actionRequired: number;
  suspended: number;
  newThisMonth: number;
  activeRatePct: number;
  pendingReviewProviders: number;
  actionRequiredProviders: number;
  suspendedProviders: number;
}

export type ProviderRatingFilter =
  | "all"
  | "4.5+"
  | "4.0+"
  | "3.0+"
  | "below_3.0"
  | "unrated";

export type ProviderSortField =
  | "name"
  | "joinedAt"
  | "lastActive"
  | "totalBookings"
  | "rating"
  | "totalEarnings"
  | "status"
  | "approvalStatus";

export type ProviderSortDirection = "asc" | "desc";

export interface ListProvidersParams {
  organizationId: string;
  search?: string;
  status?: ProviderStatus | "all";
  approvalStatus?: ProviderApprovalStatus | "all";
  serviceCategory?: string | "all";
  city?: string | "all";
  rating?: ProviderRatingFilter;
  sort?: ProviderSortField;
  sortDirection?: ProviderSortDirection;
  page?: number;
  pageSize?: number;
}

export interface UpdateProviderPayload {
  fullName: string;
  email: string;
  phone: string;
  businessName?: string;
  city: string;
  serviceCategories: string[];
  serviceAreas: string[];
}

export interface UpdateProviderStatusPayload {
  status: ProviderStatus;
  reason?: string;
}

export interface UpdateProviderApprovalPayload {
  approvalStatus: "approved" | "rejected";
  reason?: string;
}

/**
 * Validation schema for editing provider profile
 */
export const providerEditSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Owner / Contact full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(
      /^(?:\+91[\s-]?)?[6789](?:[\s-]?\d){9}$/,
      "Please enter a valid Indian mobile number (e.g. +91 98765 43210 or 9876543210)"
    ),
  businessName: z
    .string()
    .trim()
    .max(120, "Business name cannot exceed 120 characters")
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .trim()
    .min(2, "City must be at least 2 characters")
    .max(50, "City cannot exceed 50 characters"),
  serviceCategories: z
    .array(z.string())
    .min(1, "Please select at least one service category"),
  serviceAreas: z
    .array(z.string())
    .min(1, "Please specify at least one operational service area / locality"),
});

export type ProviderEditFormData = z.infer<typeof providerEditSchema>;
