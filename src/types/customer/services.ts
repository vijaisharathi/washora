import { ServiceCategory, ServiceItem, LocationPreference } from "./index";

export type ServiceSortOption =
  | "relevance"
  | "price_asc"
  | "price_desc"
  | "rating"
  | "duration";

export interface ServiceDiscoveryFilter {
  categorySlug?: string;
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  maxDurationMins?: number;
  serviceType?: string;
  sortBy?: ServiceSortOption;
}

export interface ServiceSearchSuggestion {
  id: string;
  label: string;
  type: "recent" | "popular" | "category";
  query: string;
}

export interface ServiceDiscoveryData {
  categories: ServiceCategory[];
  services: ServiceItem[];
  totalResults: number;
  recentSearches: string[];
  popularSearches: string[];
  currentLocation?: LocationPreference;
}
