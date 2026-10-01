import { ProviderSummary, ServiceItem, LocationPreference } from "./index";

export type ProviderSortOption =
  | "recommended"
  | "rating"
  | "distance"
  | "experience"
  | "price_asc";

export interface ProviderFilter {
  query?: string;
  category?: string;
  minRating?: number;
  maxDistanceKm?: number;
  verifiedOnly?: boolean;
  sortBy?: ProviderSortOption;
}

export interface ProviderReviewItem {
  id: string;
  authorName: string;
  avatarInitial: string;
  rating: number;
  date: string;
  comment: string;
}

export interface ProviderDetailData extends ProviderSummary {
  coverImageUrl: string;
  aboutText: string;
  yearsActive: number;
  completedOrdersCount: string;
  totalServicesCount: number;
  isAvailableToday: boolean;
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
  serviceAreas: string[];
  badges: string[];
  servicesOffered: ServiceItem[];
  recentReviews: ProviderReviewItem[];
}

export interface ProviderDiscoveryData {
  providers: ProviderSummary[];
  totalResults: number;
  currentLocation?: LocationPreference;
}
