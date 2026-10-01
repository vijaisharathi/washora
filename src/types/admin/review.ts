import { z } from "zod";

/**
 * WASHORA ADMIN / OPERATIONS REVIEWS & MODERATION DOMAIN TYPES (A11)
 * Canonical models, statuses, moderation actions, rating distribution, and query parameters.
 */

export const REVIEW_STATUSES = [
  "Published",
  "Flagged",
  "Hidden",
  "Restored",
] as const;

export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export const MODERATION_REASONS = [
  "Spam",
  "Abusive Language",
  "Irrelevant Content",
  "Personal Information",
  "False Information",
  "Other",
] as const;

export type ModerationReason = (typeof MODERATION_REASONS)[number];

export const ALLOWED_MODERATION_TRANSITIONS: Record<ReviewStatus, readonly ReviewStatus[]> = {
  Published: ["Flagged", "Hidden"],
  Flagged: ["Hidden", "Published"],
  Hidden: ["Restored", "Hidden"],
  Restored: ["Flagged", "Hidden"],
};

export interface Review {
  id: string; // e.g. "REV-0001"
  organizationId: string; // e.g. "ORG-0001"

  bookingId: string; // references BookingOrder.id
  customerId: string; // references Customer.id
  providerId: string; // references Provider.id
  serviceId: string; // references Service.id

  rating: number; // integer 1 to 5
  title?: string;
  comment: string; // min 5, max 1000 characters

  status: ReviewStatus;

  createdAt: string; // ISO date-time string
  updatedAt: string; // ISO date-time string

  flaggedAt?: string;
  moderatedAt?: string;

  moderatedBy?: string;
  moderationReason?: ModerationReason;
  moderationNote?: string;
}

export type ModerationActivityType =
  | "Review Published"
  | "Review Flagged"
  | "Review Hidden"
  | "Review Restored";

export interface ReviewModerationActivity {
  id: string; // e.g. "RMOD-0001"
  reviewId: string;
  organizationId: string;

  type: ModerationActivityType;

  reason?: ModerationReason;
  note?: string;

  performedBy: string;
  timestamp: string;
}

export interface ReviewModerationNote {
  id: string; // e.g. "RNOTE-0001"
  reviewId: string;
  organizationId: string;
  note: string; // min 5, max 500 characters
  createdBy: string;
  createdAt: string;
}

export interface ReviewRatingDistribution {
  rating: number; // 1, 2, 3, 4, 5
  count: number;
  percentage: number; // 0 to 100 rounded
}

export interface ReviewSummaryMetrics {
  totalReviews: number;
  averageRating: number;
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  twoStarCount: number;
  oneStarCount: number;
  flaggedCount: number;
  hiddenCount: number;
  distribution: ReviewRatingDistribution[];
}

export interface ProviderRatingSummary {
  providerId: string;
  averageRating: number;
  totalReviews: number; // Only counting Published + Restored
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  twoStarCount: number;
  oneStarCount: number;
}

export interface ServiceRatingSummary {
  serviceId: string;
  averageRating: number;
  totalReviews: number; // Only counting Published + Restored
  distribution: ReviewRatingDistribution[];
}

export interface ListReviewsParams {
  organizationId: string;
  search?: string;
  rating?: number | "all";
  status?: ReviewStatus | "all";
  serviceCategory?: string | "all";
  providerId?: string | "all";
  datePreset?: "all" | "today" | "yesterday" | "last_7_days" | "last_30_days";
  sort?: "newest" | "oldest" | "highest_rating" | "lowest_rating" | "customer" | "provider" | "service";
  sortDirection?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface ListReviewsResult {
  reviews: Review[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ReviewDetailResult {
  review: Review;
  customer: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    totalReviewsCount: number;
  };
  provider: {
    id: string;
    fullName: string;
    businessName?: string;
    rating: number;
  };
  booking: {
    id: string;
    bookingNumber: string;
    scheduledAt: string;
    status: string;
    totalAmount: number;
  };
  service: {
    id: string;
    name: string;
    category: string;
  };
  activities: ReviewModerationActivity[];
  notes: ReviewModerationNote[];
  customerRecentReviews: Review[];
}

export const FlagReviewSchema = z.object({
  reason: z.enum(MODERATION_REASONS, {
    required_error: "Moderation reason is required",
  }),
  note: z.string().min(5, "Moderation note must be at least 5 characters"),
  moderatedBy: z.string().default("Admin Console"),
});

export type FlagReviewFormValues = z.infer<typeof FlagReviewSchema>;

export const AddModerationNoteSchema = z.object({
  note: z
    .string()
    .min(5, "Internal note must be at least 5 characters")
    .max(500, "Internal note cannot exceed 500 characters"),
  createdBy: z.string().default("Admin Console"),
});

export type AddModerationNoteFormValues = z.infer<typeof AddModerationNoteSchema>;
