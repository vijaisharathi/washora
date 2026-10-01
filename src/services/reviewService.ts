import {
  CustomerReviewData,
  SubmitReviewPayload,
} from "@/types/customer/review";
import { orderLifecycleService } from "@/services/orderLifecycleService";
import { customerApi } from "@/features/customer/api/customerApi";
import { isLiveMode } from "@/lib/api";

const STORAGE_REVIEWS_KEY = "washora_customer_reviews";
const inMemoryReviews: Record<string, CustomerReviewData> = {};

export const RATING_LABELS: Record<number, string> = {
  1: "Very Poor",
  2: "Poor",
  3: "Okay",
  4: "Good",
  5: "Excellent",
};

export const QUICK_SUGGESTION_TAGS = [
  "Great quality",
  "Fast service",
  "Friendly provider",
  "Good value",
  "Careful handling",
  "Easy pickup",
  "Clean finish",
];

function mapReview(r: Record<string, unknown>, fallbackOrderId: string): CustomerReviewData {
  const rating = Number(r.rating) || 5;
  return {
    id: String(r.id || ""),
    orderId: String(r.bookingId || r.orderId || fallbackOrderId),
    serviceName: String(r.serviceName || "Care Service"),
    providerName: String(r.providerName || "WASHORA Studio Partner"),
    rating,
    ratingLabel: RATING_LABELS[rating] || "Good",
    comment: String(r.comment || "Excellent service"),
    tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
    createdAt: String(r.createdAt || new Date().toISOString()),
  };
}

export interface IReviewService {
  getReview(orderId: string): Promise<CustomerReviewData | null>;
  submitReview(payload: SubmitReviewPayload): Promise<CustomerReviewData>;
}

class ReviewService implements IReviewService {
  async getReview(orderId: string): Promise<CustomerReviewData | null> {
    if (isLiveMode()) {
      try {
        const res = await customerApi.reviews.getBookingReview(orderId);
        if (res.data) {
          return mapReview(res.data as Record<string, unknown>, orderId);
        }
        return null;
      } catch (err: unknown) {
        throw err;
      }
    }

    return this.getReviewMock(orderId);
  }

  private async getReviewMock(orderId: string): Promise<CustomerReviewData | null> {
    await new Promise((res) => setTimeout(res, 50));

    if (inMemoryReviews[orderId]) {
      return inMemoryReviews[orderId];
    }

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(`${STORAGE_REVIEWS_KEY}_${orderId}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          inMemoryReviews[orderId] = parsed;
          return parsed;
        }
      } catch {
        // ignore
      }
    }

    return null;
  }

  async submitReview(payload: SubmitReviewPayload): Promise<CustomerReviewData> {
    if (isLiveMode()) {
      try {
        const res = await customerApi.reviews.create({
          bookingId: payload.orderId,
          rating: payload.rating,
          comment: payload.comment,
          tags: payload.tags,
        });

        const created = mapReview(res.data as Record<string, unknown>, payload.orderId);
        inMemoryReviews[payload.orderId] = created;
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(
              `${STORAGE_REVIEWS_KEY}_${payload.orderId}`,
              JSON.stringify(created)
            );
          } catch {
            // ignore
          }
        }
        return created;
      } catch (err: unknown) {
        throw err;
      }
    }

    return this.submitReviewMock(payload);
  }

  private async submitReviewMock(payload: SubmitReviewPayload): Promise<CustomerReviewData> {
    await new Promise((res) => setTimeout(res, 500));

    const order = await orderLifecycleService.getOrderTracking(payload.orderId);

    const review: CustomerReviewData = {
      id: `rev-${Date.now()}`,
      orderId: payload.orderId,
      serviceName: order.serviceName,
      providerName: order.providerName,
      rating: payload.rating,
      ratingLabel: RATING_LABELS[payload.rating] || "Good",
      comment: payload.comment || "Excellent quality",
      tags: payload.tags || [],
      createdAt: new Date().toISOString(),
    };

    inMemoryReviews[payload.orderId] = review;

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          `${STORAGE_REVIEWS_KEY}_${payload.orderId}`,
          JSON.stringify(review)
        );
      } catch {
        // ignore
      }
    }

    return review;
  }
}

export const reviewService = new ReviewService();
