import {
  ProviderRatingSummary,
  ProviderReviewItem,
  ProviderReviewFilters,
  SubmitReviewResponsePayload,
  ReportReviewPayload,
} from "@/types/provider/reviews";
import {
  MOCK_PROVIDER_RATING_SUMMARY,
  MOCK_PROVIDER_REVIEWS,
} from "@/mocks/provider/reviews.mock";
import { providerApi } from "@/features/provider/api/providerApi";
import { isLiveMode } from "@/lib/api/mode";

const STORAGE_REVIEWS_KEY = "washora_provider_reviews_store";

let inMemoryReviews: ProviderReviewItem[] = [...MOCK_PROVIDER_REVIEWS];

export interface IProviderReviewsService {
  getRatingSummary(providerId?: string): Promise<ProviderRatingSummary>;
  getReviews(filters?: ProviderReviewFilters, providerId?: string): Promise<ProviderReviewItem[]>;
  getReviewById(reviewId: string, providerId?: string): Promise<ProviderReviewItem | null>;
  submitResponse(
    payload: SubmitReviewResponsePayload,
    providerId?: string
  ): Promise<ProviderReviewItem>;
  reportReview(payload: ReportReviewPayload, providerId?: string): Promise<ProviderReviewItem>;
}

class ProviderReviewsService implements IProviderReviewsService {
  private async loadStoredReviews(): Promise<ProviderReviewItem[]> {
    if (typeof window === "undefined") return inMemoryReviews;
    try {
      const stored = localStorage.getItem(STORAGE_REVIEWS_KEY);
      if (stored) {
        inMemoryReviews = JSON.parse(stored);
        return inMemoryReviews;
      }
    } catch {
      return inMemoryReviews;
    }
    return inMemoryReviews;
  }

  private persistReviews(reviews: ProviderReviewItem[]): void {
    inMemoryReviews = reviews;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_REVIEWS_KEY, JSON.stringify(reviews));
      } catch {
        // ignore
      }
    }
  }

  async getRatingSummary(providerId: string = "prov-1"): Promise<ProviderRatingSummary> {
    if (isLiveMode()) {
      const res = await providerApi.reviews.getMySummary();
      const s = res.data;
      const dist = s.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      const total = s.totalReviews || 0;

      return {
        providerId,
        averageRating: Number(s.averageRating || 4.9),
        totalReviews: total,
        verifiedBookingsCount: total,
        distribution: {
          5: dist[5] || 0,
          4: dist[4] || 0,
          3: dist[3] || 0,
          2: dist[2] || 0,
          1: dist[1] || 0,
        },
      };
    }

    await new Promise((res) => setTimeout(res, 50));
    return MOCK_PROVIDER_RATING_SUMMARY;
  }

  async getReviews(
    filters?: ProviderReviewFilters,
    providerId: string = "prov-1"
  ): Promise<ProviderReviewItem[]> {
    if (isLiveMode()) {
      const res = await providerApi.reviews.getMyReviews();
      const raw = Array.isArray(res.data) ? res.data : (res as any).data?.items || [];

      return raw.map((r: any) => ({
        id: r.id,
        providerId,
        orderId: r.bookingId || "ord-1",
        orderNumber: `QH-${r.id.slice(0, 8).toUpperCase()}`,
        serviceId: "srv-1",
        serviceName: r.serviceName || "Couture Garment Care",
        customerName: r.customerName || "Customer",
        customerAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(r.customerName || "Customer")}`,
        isFirstTimeCustomer: false,
        rating: Number(r.rating || 5),
        reviewText: r.comment || "Great garment care service.",
        reviewDate: r.createdAt || new Date().toISOString(),
        isVerified: true,
        response: r.responseText
          ? {
              responseText: r.responseText,
              respondedAt: r.respondedAt || new Date().toISOString(),
            }
          : undefined,
        createdAt: r.createdAt || new Date().toISOString(),
        updatedAt: r.updatedAt || new Date().toISOString(),
      }));
    }

    await new Promise((res) => setTimeout(res, 50));
    const all = await this.loadStoredReviews();

    let filtered = all;
    if (filters?.starRating) {
      filtered = filtered.filter((r) => Math.floor(r.rating) === filters.starRating);
    }

    if (filters?.hasResponse !== undefined) {
      filtered = filtered.filter((r) => (filters.hasResponse ? !!r.response : !r.response));
    }

    return filtered;
  }

  async getReviewById(reviewId: string, providerId: string = "prov-1"): Promise<ProviderReviewItem | null> {
    if (isLiveMode()) {
      try {
        const res = await providerApi.reviews.getMyReview(reviewId);
        const r = res.data;
        return {
          id: r.id,
          providerId,
          orderId: r.bookingId,
          orderNumber: `QH-${r.id.slice(0, 8).toUpperCase()}`,
          serviceId: "srv-1",
          serviceName: r.serviceName || "Garment Care",
          customerName: r.customerName,
          customerAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(r.customerName)}`,
          isFirstTimeCustomer: false,
          rating: Number(r.rating),
          reviewText: r.comment,
          reviewDate: r.createdAt,
          isVerified: true,
          response: r.responseText
            ? {
                responseText: r.responseText,
                respondedAt: r.respondedAt || new Date().toISOString(),
              }
            : undefined,
          createdAt: r.createdAt,
          updatedAt: (r as any).updatedAt || r.createdAt,
        };
      } catch {
        return null;
      }
    }

    await new Promise((res) => setTimeout(res, 50));
    const all = await this.loadStoredReviews();
    return all.find((r) => r.id === reviewId) || null;
  }

  async submitResponse(
    payload: SubmitReviewResponsePayload,
    providerId: string = "prov-1"
  ): Promise<ProviderReviewItem> {
    if (isLiveMode()) {
      await providerApi.reviews.createResponse(payload.reviewId, payload.responseText);
      const item = await this.getReviewById(payload.reviewId, providerId);
      if (item) {
        return {
          ...item,
          response: {
            responseText: payload.responseText,
            respondedAt: new Date().toISOString(),
          },
        };
      }
    }

    await new Promise((res) => setTimeout(res, 350));
    const all = await this.loadStoredReviews();
    const index = all.findIndex((r) => r.id === payload.reviewId);

    if (index === -1) {
      throw new Error(`Review ${payload.reviewId} not found.`);
    }

    const updated: ProviderReviewItem = {
      ...all[index],
      response: {
        responseText: payload.responseText,
        respondedAt: new Date().toISOString(),
      },
    };

    all[index] = updated;
    this.persistReviews([...all]);
    return updated;
  }

  async reportReview(
    payload: ReportReviewPayload,
    providerId: string = "prov-1"
  ): Promise<ProviderReviewItem> {
    await new Promise((res) => setTimeout(res, 300));
    const all = await this.loadStoredReviews();
    const index = all.findIndex((r) => r.id === payload.reviewId);

    if (index === -1) {
      throw new Error(`Review ${payload.reviewId} not found.`);
    }

    return all[index];
  }
}

export const providerReviewsService = new ProviderReviewsService();
