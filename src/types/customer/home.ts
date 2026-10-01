import {
  ServiceCategory,
  ServiceItem,
  ProviderSummary,
  Order,
  LocationPreference,
} from "./index";

export interface HomePromotion {
  id: string;
  title: string;
  subtitle: string;
  code: string;
  discountBadge: string;
  ctaText: string;
  ctaUrl: string;
  imageUrl?: string;
  gradient: string;
}

export interface HomeData {
  greeting: string;
  customerName?: string;
  currentLocation: LocationPreference;
  promotions: HomePromotion[];
  categories: ServiceCategory[];
  activeOrder?: Order | null;
  featuredServices: ServiceItem[];
  recommendedProviders: ProviderSummary[];
}
