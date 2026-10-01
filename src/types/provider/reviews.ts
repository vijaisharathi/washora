/**
 * Type definitions for WASHORA Service Provider Reviews & Ratings (P10)
 */

export interface ProviderRatingDistribution {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

export interface ProviderRatingSummary {
  providerId: string;
  averageRating: number; // e.g. 4.9
  totalReviews: number; // e.g. 1240
  verifiedBookingsCount: number;
  distribution: ProviderRatingDistribution;
}

export interface ProviderReviewResponse {
  responseText: string;
  respondedAt: string;
}

export interface ProviderReviewItem {
  id: string;
  providerId: string;
  orderId: string;
  orderNumber: string; // e.g. "QH-20260902-1041"
  serviceId: string;
  serviceName: string;
  customerName: string;
  customerAvatar?: string;
  isFirstTimeCustomer: boolean;
  rating: number; // 1 to 5
  reviewText: string;
  photos?: string[];
  reviewDate: string; // e.g. "2 days ago" or "September 2, 2026"
  isVerified: boolean;
  response?: ProviderReviewResponse;
  isReported?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderReviewFilters {
  starRating?: number; // 1-5 or undefined for all
  hasPhotos?: boolean;
  hasResponse?: boolean;
  sortBy?: "recent" | "highest" | "lowest";
}

export interface SubmitReviewResponsePayload {
  reviewId: string;
  responseText: string;
}

export interface ReportReviewPayload {
  reviewId: string;
  reason: string;
  details: string;
}
