import {
  DeliveryPartnerReview,
  DeliveryPartnerReviewsSummary,
  ReviewFilterParams,
} from "@/types/delivery-partner";
import {
  MOCK_REVIEWS,
  MOCK_REVIEWS_SUMMARY,
} from "@/mocks/delivery-partner/reviews.mock";
import { deliveryPartnerAuthService } from "./deliveryPartnerAuthService";
import { deliveryPartnerProfileService } from "./deliveryPartnerProfileService";
import { isLiveMode } from "@/lib/api/mode";

const STORAGE_REVIEWS_KEY = "washora_delivery_partner_reviews";

export interface IDeliveryPartnerReviewsService {
  getReviewsSummary(): Promise<DeliveryPartnerReviewsSummary>;
  getReviews(filter?: ReviewFilterParams): Promise<DeliveryPartnerReview[]>;
  getReviewById(id: string): Promise<DeliveryPartnerReview | null>;
}

class DeliveryPartnerReviewsService implements IDeliveryPartnerReviewsService {
  private memoryReviews: DeliveryPartnerReview[] | null = null;

  private loadReviews(): DeliveryPartnerReview[] {
    if (this.memoryReviews) return this.memoryReviews;
    if (typeof window !== "undefined") {
      try {
        const val = localStorage.getItem(STORAGE_REVIEWS_KEY);
        if (val) {
          this.memoryReviews = JSON.parse(val);
          return this.memoryReviews!;
        }
      } catch {
        // ignore
      }
    }
    this.memoryReviews = [...MOCK_REVIEWS];
    return this.memoryReviews;
  }

  async getReviewsSummary(): Promise<DeliveryPartnerReviewsSummary> {
    await new Promise((res) => setTimeout(res, 50));
    const session = await deliveryPartnerAuthService.getSession();
    const currentPartnerId = session.partner?.id || "dp-1";

    let averageRating = MOCK_REVIEWS_SUMMARY.averageRating;
    if (isLiveMode()) {
      try {
        const profile = await deliveryPartnerProfileService.getFullProfile();
        averageRating = profile.rating || averageRating;
      } catch {
        // use fallback
      }
    }

    const partnerReviews = this.loadReviews().filter((r) => r.partnerId === currentPartnerId);

    return {
      ...MOCK_REVIEWS_SUMMARY,
      averageRating,
      reviews: partnerReviews,
    };
  }

  async getReviews(filter?: ReviewFilterParams): Promise<DeliveryPartnerReview[]> {
    await new Promise((res) => setTimeout(res, 50));
    const session = await deliveryPartnerAuthService.getSession();
    const currentPartnerId = session.partner?.id || "dp-1";

    let reviews = this.loadReviews().filter((r) => r.partnerId === currentPartnerId);

    if (filter?.rating && filter.rating !== "ALL") {
      if (filter.rating === "5") reviews = reviews.filter((r) => r.rating === 5);
      else if (filter.rating === "4") reviews = reviews.filter((r) => r.rating === 4);
      else if (filter.rating === "3") reviews = reviews.filter((r) => r.rating === 3);
      else if (filter.rating === "LOW") reviews = reviews.filter((r) => r.rating <= 2);
    }

    if (filter?.searchQuery && filter.searchQuery.trim()) {
      const q = filter.searchQuery.toLowerCase().trim();
      reviews = reviews.filter(
        (r) =>
          r.customerName.toLowerCase().includes(q) ||
          r.comment.toLowerCase().includes(q) ||
          r.orderId.toLowerCase().includes(q) ||
          r.compliments.some((c) => c.toLowerCase().includes(q))
      );
    }

    if (filter?.sortBy) {
      if (filter.sortBy === "HIGHEST_RATED") {
        reviews.sort((a, b) => b.rating - a.rating);
      } else if (filter.sortBy === "LOWEST_RATED") {
        reviews.sort((a, b) => a.rating - b.rating);
      } else {
        reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
    }

    return reviews;
  }

  async getReviewById(id: string): Promise<DeliveryPartnerReview | null> {
    await new Promise((res) => setTimeout(res, 50));
    const session = await deliveryPartnerAuthService.getSession();
    const currentPartnerId = session.partner?.id || "dp-1";

    const reviews = this.loadReviews().filter((r) => r.partnerId === currentPartnerId);
    return reviews.find((r) => r.id === id || r.orderId === id || r.taskId === id) || null;
  }
}

export const deliveryPartnerReviewsService = new DeliveryPartnerReviewsService();
