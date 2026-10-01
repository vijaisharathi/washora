import { z } from "zod";

/**
 * WASHORA ADMIN / OPERATIONS SERVICE & CATALOG DOMAIN TYPES
 * Canonical data models, controlled categories, lifecycle statuses, query params, summary metrics, and Zod schemas.
 */

export const SERVICE_STATUSES = ["Active", "Inactive", "Archived"] as const;
export type ServiceStatus = (typeof SERVICE_STATUSES)[number];

export const SERVICE_CATEGORIES = [
  "Home Cleaning",
  "Deep Cleaning",
  "Kitchen Cleaning",
  "Bathroom Cleaning",
  "Sofa Cleaning",
  "Carpet Cleaning",
  "Laundry",
  "Appliance Cleaning",
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

export const ALLOWED_SERVICE_STATUS_TRANSITIONS: Record<
  ServiceStatus,
  readonly ServiceStatus[]
> = {
  Active: ["Inactive", "Archived"],
  Inactive: ["Active", "Archived"],
  Archived: [], // Terminal in A8
};

export const PRICE_RANGE_PRESETS = [
  "all",
  "under_500",
  "500_999",
  "1000_1999",
  "2000_plus",
] as const;

export type PriceRangePreset = (typeof PRICE_RANGE_PRESETS)[number];

export const DURATION_PRESETS = [
  "all",
  "under_1hr",
  "1_2hr",
  "2_3hr",
  "3hr_plus",
] as const;

export type DurationPreset = (typeof DURATION_PRESETS)[number];

export const SERVICE_SORT_FIELDS = [
  "name",
  "category",
  "price",
  "basePrice",
  "displayPrice",
  "duration",
  "durationMinutes",
  "createdAt",
  "updatedAt",
  "totalBookings",
  "rating",
  "status",
] as const;

export type ServiceSortField = (typeof SERVICE_SORT_FIELDS)[number];
export type ServiceSortDirection = "asc" | "desc";

export interface Service {
  id: string; // e.g. "SRV-0001"
  organizationId: string; // e.g. "ORG-0001"

  name: string;
  category: ServiceCategory;

  shortDescription: string;
  description: string;

  basePrice: number; // in INR (₹)
  serviceFee: number; // in INR (₹)
  displayPrice?: number; // computed: basePrice + serviceFee

  durationMinutes: number; // in minutes >= 15

  status: ServiceStatus;

  imageUrl?: string;

  minQuantity: number;
  maxQuantity: number;

  createdAt: string; // ISO date-time
  updatedAt: string; // ISO date-time

  totalBookings: number;
  activeBookings?: number;
  completedBookings: number;
  cancelledBookings: number;

  rating: number; // 0.0 - 5.0
  totalReviews: number;

  lastBookedAt?: string;
}

export type ServiceActivityType =
  | "service_created"
  | "service_updated"
  | "service_activated"
  | "service_deactivated"
  | "service_archived";

export interface ServiceActivity {
  id: string;
  serviceId: string;
  type: ServiceActivityType;
  timestamp: string; // ISO date-time
  performedBy: string;
  description: string;
  action?: string;
  details?: string;
  actorName?: string;
}

export interface ServiceSummaryMetrics {
  total: number;
  active: number;
  inactive: number;
  archived: number;
}

export interface ListServicesParams {
  organizationId: string;
  search?: string;
  status?: ServiceStatus | "all";
  category?: ServiceCategory | "all";
  priceRange?: PriceRangePreset;
  duration?: DurationPreset;
  sort?: ServiceSortField;
  sortDirection?: ServiceSortDirection;
  page?: number;
  pageSize?: number;
}

export interface ListServicesResult {
  services: Service[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  metrics: ServiceSummaryMetrics;
}

/**
 * Zod validation schema for Create Service
 */
export const createServiceBaseSchema = z.object({
  name: z
    .string({ required_error: "Service name is required." })
    .trim()
    .min(1, "Service name is required.")
    .min(2, "Service name must be at least 2 characters."),
  category: z.enum(SERVICE_CATEGORIES, {
    errorMap: () => ({ message: "Service category is required." }),
  }),
  shortDescription: z
    .string({ required_error: "Short description is required." })
    .trim()
    .min(1, "Short description is required.")
    .min(10, "Short description must be at least 10 characters."),
  description: z
    .string({ required_error: "Description is required." })
    .trim()
    .min(1, "Description is required.")
    .min(20, "Description must be at least 20 characters."),
  basePrice: z
    .number({ invalid_type_error: "Base price must be greater than ₹0." })
    .positive("Base price must be greater than ₹0."),
  serviceFee: z
    .number({ invalid_type_error: "Service fee cannot be negative." })
    .min(0, "Service fee cannot be negative."),
  durationMinutes: z
    .number({ invalid_type_error: "Duration must be at least 15 minutes." })
    .int("Duration must be a whole number in minutes.")
    .min(15, "Duration must be at least 15 minutes."),
  minQuantity: z
    .number({ invalid_type_error: "Minimum quantity must be at least 1." })
    .int("Minimum quantity must be a whole number.")
    .min(1, "Minimum quantity must be at least 1."),
  maxQuantity: z
    .number({
      invalid_type_error:
        "Maximum quantity must be greater than or equal to minimum quantity.",
    })
    .int("Maximum quantity must be a whole number."),
  status: z.enum(["Active", "Inactive"]).default("Active"),
});

export const createServiceSchema = createServiceBaseSchema.refine(
  (data) => data.maxQuantity >= data.minQuantity,
  {
    message: "Maximum quantity must be greater than or equal to minimum quantity.",
    path: ["maxQuantity"],
  }
);

export type CreateServiceFormValues = z.infer<typeof createServiceBaseSchema>;

/**
 * Zod validation schema for Edit Service
 */
export const editServiceBaseSchema = createServiceBaseSchema.omit({ status: true });

export const editServiceSchema = editServiceBaseSchema.refine(
  (data) => data.maxQuantity >= data.minQuantity,
  {
    message: "Maximum quantity must be greater than or equal to minimum quantity.",
    path: ["maxQuantity"],
  }
);

export type EditServiceFormValues = z.infer<typeof editServiceBaseSchema>;

/**
 * Human readable duration formatter
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} mins`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return hours === 1 ? "1 hour" : `${hours} hours`;
  }
  return `${hours} hr ${remainingMinutes} min`;
}
