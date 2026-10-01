import {
  ServiceCategory,
  ServiceItem,
} from "@/types/customer";
import {
  ServiceDiscoveryFilter,
  ServiceDiscoveryData,
} from "@/types/customer/services";
import { customerService } from "@/services/customerService";
import { customerProfileService } from "@/services/customerProfileService";

const STORAGE_RECENT_SEARCHES = "washora_recent_searches";
let inMemoryRecentSearches = ["Sneaker Cleaning", "Car Wash"];

const POPULAR_SEARCHES = [
  "Shoe Cleaning",
  "Dry Cleaning",
  "Silk Saree",
  "Car Wash",
  "Leather Bag",
  "Helmet Sanitization",
];

export interface IServiceDiscoveryService {
  getDiscoveryData(filter?: ServiceDiscoveryFilter): Promise<ServiceDiscoveryData>;
  getCategories(): Promise<ServiceCategory[]>;
  getCategoryBySlug(slug: string): Promise<ServiceCategory | null>;
  getServiceItems(filter?: ServiceDiscoveryFilter & { searchQuery?: string }): Promise<ServiceItem[]>;
  getRecentSearches(): Promise<string[]>;
  addRecentSearch(query: string): Promise<string[]>;
  clearRecentSearches(): Promise<void>;
}

class ServiceDiscoveryService implements IServiceDiscoveryService {
  private getStoredRecentSearches(): string[] {
    if (typeof window === "undefined") return inMemoryRecentSearches;
    try {
      const stored = localStorage.getItem(STORAGE_RECENT_SEARCHES);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return inMemoryRecentSearches;
  }

  async getRecentSearches(): Promise<string[]> {
    return this.getStoredRecentSearches();
  }

  async addRecentSearch(query: string): Promise<string[]> {
    const clean = query.trim();
    if (!clean) return this.getStoredRecentSearches();

    const current = this.getStoredRecentSearches();
    const filtered = current.filter((q) => q.toLowerCase() !== clean.toLowerCase());
    const updated = [clean, ...filtered].slice(0, 5);
    inMemoryRecentSearches = updated;

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_RECENT_SEARCHES, JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
    return updated;
  }

  async clearRecentSearches(): Promise<void> {
    inMemoryRecentSearches = [];
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_RECENT_SEARCHES);
      } catch {
        // ignore
      }
    }
  }

  async getCategories(): Promise<ServiceCategory[]> {
    return customerService.getCategories();
  }

  async getCategoryBySlug(slug: string): Promise<ServiceCategory | null> {
    return customerService.getCategoryBySlug(slug);
  }

  async getServiceItems(filter?: ServiceDiscoveryFilter & { searchQuery?: string }): Promise<ServiceItem[]> {
    const categorySlug =
      filter?.categorySlug && filter.categorySlug !== "all"
        ? filter.categorySlug
        : undefined;

    const query = filter?.searchQuery || filter?.query;

    let items = await customerService.getServiceItems({
      categorySlug,
      query,
    });

    if (filter?.minPrice !== undefined) {
      items = items.filter((i) => i.basePrice >= (filter.minPrice || 0));
    }

    if (filter?.maxPrice !== undefined) {
      items = items.filter((i) => i.basePrice <= (filter.maxPrice || 99999));
    }

    // Sorting
    if (filter?.sortBy) {
      switch (filter.sortBy) {
        case "price_asc":
          items.sort((a, b) => a.basePrice - b.basePrice);
          break;
        case "price_desc":
          items.sort((a, b) => b.basePrice - a.basePrice);
          break;
        case "rating":
          items.sort((a, b) => (b.variants.length || 0) - (a.variants.length || 0));
          break;
        default:
          break;
      }
    }

    return items;
  }

  async getDiscoveryData(filter?: ServiceDiscoveryFilter): Promise<ServiceDiscoveryData> {
    const [categories, items, recentSearches, location] = await Promise.all([
      this.getCategories(),
      this.getServiceItems(filter),
      this.getRecentSearches(),
      customerProfileService.getLocationPreference(),
    ]);

    return {
      categories,
      services: items,
      totalResults: items.length,
      recentSearches,
      popularSearches: POPULAR_SEARCHES,
      currentLocation: location,
    };
  }
}

export const serviceDiscoveryService = new ServiceDiscoveryService();
