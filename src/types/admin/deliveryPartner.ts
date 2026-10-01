import { z } from "zod";

/**
 * WASHORA ADMIN / OPERATIONS DELIVERY PARTNER DOMAIN TYPES
 * Canonical data models, statuses, approval states, vehicle types, queries, metrics, and validation schemas.
 */

export const VEHICLE_TYPES = [
  "bike",
  "scooter",
  "electric_bike",
  "three_wheeler",
  "van",
] as const;

export type VehicleType = (typeof VEHICLE_TYPES)[number];

export type DeliveryPartnerStatus = "active" | "inactive" | "suspended";

export type DeliveryPartnerApprovalStatus = "pending" | "approved" | "rejected";

export interface DeliveryPartner {
  id: string; // e.g. "DLP-0001"
  organizationId: string; // e.g. "ORG-0001"
  fullName: string;
  email: string;
  phone: string;
  profileImage?: string;
  vehicleType: VehicleType;
  vehicleNumber: string; // e.g. "TN 01 AB 1234"
  city: string;
  serviceAreas: string[];
  status: DeliveryPartnerStatus;
  approvalStatus: DeliveryPartnerApprovalStatus;
  joinedAt: string; // ISO date string
  updatedAt: string; // ISO date string
  totalDeliveries: number;
  completedDeliveries: number;
  cancelledDeliveries: number;
  rating: number; // 0.0 to 5.0
  totalReviews: number;
  totalEarnings: number; // in INR (₹)
  lastActiveAt?: string; // ISO date string or undefined
  drivingLicenseNumber?: string;
  isOnline?: boolean;
  activeOrdersCount?: number;
  emergencyContact?: { name: string; relation: string; phone: string };
}

export type DeliveryPartnerActivityType =
  | "partner_registered"
  | "application_submitted"
  | "partner_approved"
  | "partner_rejected"
  | "partner_activated"
  | "partner_suspended"
  | "profile_updated"
  | "delivery_completed";

export interface DeliveryPartnerActivity {
  id: string;
  partnerId: string;
  type: DeliveryPartnerActivityType;
  description: string;
  timestamp: string;
  status: string;
  actorName?: string;
}

export interface DeliveryPartnerSummaryMetrics {
  totalPartners: number;
  activePartners: number;
  onlinePartners: number;
  pendingReviewPartners: number;
  actionRequiredPartners: number;
  suspendedPartners: number;
  newThisMonth: number;
  activeRatePct: number;
}

export type DeliveryPartnerRatingFilter =
  | "all"
  | "4.5+"
  | "4.0+"
  | "3.0+"
  | "4.5"
  | "4.0"
  | "3.0"
  | "below_3.0"
  | "unrated";

export type DeliveryPartnerSortField =
  | "name"
  | "joinedAt"
  | "lastActive"
  | "lastActiveAt"
  | "vehicleType"
  | "city"
  | "totalDeliveries"
  | "rating"
  | "totalEarnings"
  | "status"
  | "approvalStatus";

export type DeliveryPartnerSortDirection = "asc" | "desc";

export interface ListDeliveryPartnersParams {
  organizationId: string;
  search?: string;
  status?: DeliveryPartnerStatus | "all";
  approvalStatus?: DeliveryPartnerApprovalStatus | "all";
  vehicleType?: VehicleType | "all";
  city?: string | "all";
  rating?: DeliveryPartnerRatingFilter;
  sort?: DeliveryPartnerSortField;
  sortDirection?: DeliveryPartnerSortDirection;
  page?: number;
  pageSize?: number;
}

export interface UpdateDeliveryPartnerPayload {
  fullName?: string;
  email?: string;
  phone?: string;
  vehicleType?: VehicleType;
  vehicleNumber?: string;
  city?: string;
  serviceAreas?: string[];
}

export interface UpdateDeliveryPartnerStatusPayload {
  status: DeliveryPartnerStatus;
  reason?: string;
}

export interface UpdateDeliveryPartnerApprovalPayload {
  approvalStatus: "approved" | "rejected";
  reason?: string;
}

/**
 * Practical frontend validation schema for Indian vehicle registration formats:
 * Accepts formats like: "TN01AB1234", "TN 01 AB 1234", "DL 03 C 5678", "KA 05 MN 9999", etc.
 */
export const INDIAN_VEHICLE_REG_REGEX =
  /^[A-Z]{2}[\s-]?[0-9]{1,2}[\s-]?(?:[A-Z]{1,3}[\s-]?)?[0-9]{1,4}$/i;

/**
 * Validation schema for editing delivery partner profile
 */
export const deliveryPartnerEditSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Partner full name must be at least 2 characters")
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
  vehicleType: z.enum(VEHICLE_TYPES, {
    errorMap: () => ({ message: "Please select a valid vehicle type" }),
  }),
  vehicleNumber: z
    .string()
    .trim()
    .min(5, "Vehicle number must be at least 5 characters")
    .max(20, "Vehicle number cannot exceed 20 characters")
    .regex(
      INDIAN_VEHICLE_REG_REGEX,
      "Please enter a valid Indian vehicle registration number (e.g. TN 01 AB 1234)"
    ),
  city: z
    .string()
    .trim()
    .min(2, "City must be at least 2 characters")
    .max(50, "City cannot exceed 50 characters"),
  serviceAreas: z
    .array(z.string())
    .min(1, "Please specify at least one operational delivery area / zone"),
});

export type DeliveryPartnerEditFormData = z.infer<typeof deliveryPartnerEditSchema>;
