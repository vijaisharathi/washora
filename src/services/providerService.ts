import {
  ProviderSummary,
} from "@/types/customer";
import {
  ProviderFilter,
  ProviderDetailData,
  ProviderDiscoveryData,
} from "@/types/customer/provider";
import { mockProviders, mockServiceItems } from "@/mocks/customer/mockData";
import { customerProfileService } from "@/services/customerProfileService";

const DETAILED_MOCK_PROVIDERS: ProviderDetailData[] = [
  {
    id: "prov-1",
    businessName: "LuxeCare Garment Studio",
    tagline: "Specialized in couture, suits & silk care",
    rating: 4.9,
    reviewCount: 1240,
    distanceKm: 1.2,
    estimatedHours: 24,
    isVerified: true,
    badge: "Elite Partner • 120+ jobs",
    priceRange: "₹₹₹",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDAcs0jqcsYAL67F1uKLTlaPZ9Uv_mBnQ9Twrl3txdLtLA1AWcMcOWjIS1FHiBBcYItnJMwaZWniuEpgvF-gndPbBnO9mMvrB6YmxKv9JXLdWbpQWnxCf9p0qRk9ylQbtiovoRqk74bzGGNUjSEHpcgcS7O1Y2TosQD3-Y069VOlo7Vd8kt0o9TsD673Il_3R-XXuU_o2WQh3brw_Gs40dGkM7ZkkqbxhJhs3onfuVUq4J0qepNxJdRVg",
    coverImageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA5lvdM4wej36t2k0NQN0LOxJPmbx8H8ggvUJyBwAnKzTSXhCwu1knMMC-z_1X1hsXlk_nv-iAKaDxbXo--PORca3CkzKXDBRqG-e_9nHfzOZm0k_y03vND9wl6r_OQUJ1Jc12I4_9wb8K5R9HyBwvDlLOqLM0Q9Uipe12Cd5jrmg7OHN3_-91rTl2b3agoF6r0KiQqHPPXZlkBjqZYYGauTsIqa-1lACpeRtm0b2iXJekpXnW8Spbciw",
    aboutText:
      "Professional care center specializing in footwear and luxury items since 2019. We utilize state-of-the-art cleaning technology, specialized perchloroethylene-free solvents, and eco-friendly solutions to restore your items to pristine condition.",
    yearsActive: 5,
    completedOrdersCount: "10k+",
    totalServicesCount: 18,
    isAvailableToday: true,
    pickupAvailable: true,
    deliveryAvailable: true,
    serviceAreas: ["Indiranagar", "Koramangala", "HSR Layout", "MG Road"],
    badges: ["Eco-friendly", "Pet-friendly", "Certified Master Cleaners", "100% Insured"],
    servicesOffered: mockServiceItems.slice(0, 4),
    recentReviews: [
      {
        id: "rev-1",
        authorName: "Sarah J.",
        avatarInitial: "S",
        rating: 5.0,
        date: "2 days ago",
        comment:
          "Incredible service! They brought my old Jordans back to life. Highly recommend the deep clean and suede restore.",
      },
      {
        id: "rev-2",
        authorName: "Mike T.",
        avatarInitial: "M",
        rating: 4.8,
        date: "1 week ago",
        comment:
          "Fast turnaround and excellent communication. The silk saree dry clean and leather conditioning is top notch.",
      },
    ],
  },
  {
    id: "prov-2",
    businessName: "CleanX Service Center",
    tagline: "High-precision sneaker restoration & fabric lab",
    rating: 4.8,
    reviewCount: 840,
    distanceKm: 2.1,
    estimatedHours: 24,
    isVerified: true,
    badge: "Verified Partner",
    priceRange: "₹₹",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBcA3SJXvrUuz9C9TnLHN7UNVBUDeQk4M__iGJiZdk5uOLl5oHHS4Q76pteQseaJiRt7M7IHdhvZ9qfBla_D12K2J0lkiQ-XzYOvOkzpDnbHB7984en6omBN2GKS0RB0C_ODCm-PIhh-dCbnDhxrLzv3c1tpjwSrPMuMenQkTeJeW-qXpQfeeVsHywSR_uG3dlVCZn3sg6fP1Z2juIQkJG4aYGqLWvCxKJ7ayMeCwoxzrg_BjcdPIwpVg",
    coverImageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA5lvdM4wej36t2k0NQN0LOxJPmbx8H8ggvUJyBwAnKzTSXhCwu1knMMC-z_1X1hsXlk_nv-iAKaDxbXo--PORca3CkzKXDBRqG-e_9nHfzOZm0k_y03vND9wl6r_OQUJ1Jc12I4_9wb8K5R9HyBwvDlLOqLM0Q9Uipe12Cd5jrmg7OHN3_-91rTl2b3agoF6r0KiQqHPPXZlkBjqZYYGauTsIqa-1lACpeRtm0b2iXJekpXnW8Spbciw",
    aboutText:
      "Advanced sneaker care and fabric hygiene studio equipped with UV-C decontamination tunnels and ultrasonic spot treatment tables.",
    yearsActive: 4,
    completedOrdersCount: "7.5k+",
    totalServicesCount: 12,
    isAvailableToday: true,
    pickupAvailable: true,
    deliveryAvailable: true,
    serviceAreas: ["Indiranagar", "Domlur", "Whitefield"],
    badges: ["Deep Clean Specialist", "Eco-friendly", "Express Turnaround"],
    servicesOffered: mockServiceItems.slice(0, 3),
    recentReviews: [
      {
        id: "rev-3",
        authorName: "Vikram R.",
        avatarInitial: "V",
        rating: 4.9,
        date: "3 days ago",
        comment:
          "My Yeezys looked brand new. Super prompt doorstep delivery and safe packaging.",
      },
    ],
  },
  {
    id: "prov-3",
    businessName: "Apex Leather & Shoe Lab",
    tagline: "Artisan handbag spa & bespoke leather restoration",
    rating: 5.0,
    reviewCount: 420,
    distanceKm: 2.8,
    estimatedHours: 48,
    isVerified: true,
    badge: "Top Rated Artisan",
    priceRange: "₹₹₹",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD92s7gZk4y3rleVHbRKTQat3KDsBx18j4N2luXxmMrdacdxbzhIcLAqSL_Rijb1abo7HVY-qgrWJzi6kBPODHDSp8DPqVEoflJt8bMb4_ea50uj8BQTUgjhnr8rSfOXAbxeG9fo6p-GKo72FFVlWKFbAiXhRMgzwZQcDNhf9cZ48SDNWSscj2iq71nqf-KigBDMTJQraKr9oU4_aEd7J6mO-O3yX6JqjamB0Cr3IirLnolx3MTf2GIVg",
    coverImageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA5lvdM4wej36t2k0NQN0LOxJPmbx8H8ggvUJyBwAnKzTSXhCwu1knMMC-z_1X1hsXlk_nv-iAKaDxbXo--PORca3CkzKXDBRqG-e_9nHfzOZm0k_y03vND9wl6r_OQUJ1Jc12I4_9wb8K5R9HyBwvDlLOqLM0Q9Uipe12Cd5jrmg7OHN3_-91rTl2b3agoF6r0KiQqHPPXZlkBjqZYYGauTsIqa-1lACpeRtm0b2iXJekpXnW8Spbciw",
    aboutText:
      "Dedicated bespoke leather repair workshop. Specializing in luxury handbag restoration, edge re-glazing, color re-dyeing, and premium shoe reconditioning.",
    yearsActive: 6,
    completedOrdersCount: "5k+",
    totalServicesCount: 8,
    isAvailableToday: true,
    pickupAvailable: true,
    deliveryAvailable: true,
    serviceAreas: ["Indiranagar", "CBD", "Lavelle Road", "Sadashivanagar"],
    badges: ["Luxury Specialist", "Master Craftsman", "Certified Organic"],
    servicesOffered: [mockServiceItems[1], mockServiceItems[2], mockServiceItems[5]],
    recentReviews: [
      {
        id: "rev-4",
        authorName: "Ananya P.",
        avatarInitial: "A",
        rating: 5.0,
        date: "4 days ago",
        comment:
          "Revived my vintage Louis Vuitton tote to near perfection. True master craftsmen!",
      },
    ],
  },
  {
    id: "prov-4",
    businessName: "SpeedySteam Express Hub",
    tagline: "Same-day priority turnaround for daily wardrobe",
    rating: 4.7,
    reviewCount: 950,
    distanceKm: 3.4,
    estimatedHours: 12,
    isVerified: true,
    badge: "24h Express",
    priceRange: "₹",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAIFM6VTr6TbgZYvtGjqgTVVYet2rKmVV_Bb6uwYlfoXTfzEFJU1DAOP6vabW6jBmzfBFD9a7pMk3vHC46iAItX9msdH7Bk6HwKFLpx0WnsdSaWs4IZGwv6hozqPe-JO7UdVIi6q3UgnI0ep0a6i1h758VN1Y9mxUeyt1Sc4DCWXTHc009G17R8lVHHylg6-yDZ8BLvtVIOcubNpfAB037pZCkMjStF5OdYFn4Vp4cc8XLGtK1A49l36w",
    coverImageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA5lvdM4wej36t2k0NQN0LOxJPmbx8H8ggvUJyBwAnKzTSXhCwu1knMMC-z_1X1hsXlk_nv-iAKaDxbXo--PORca3CkzKXDBRqG-e_9nHfzOZm0k_y03vND9wl6r_OQUJ1Jc12I4_9wb8K5R9HyBwvDlLOqLM0Q9Uipe12Cd5jrmg7OHN3_-91rTl2b3agoF6r0KiQqHPPXZlkBjqZYYGauTsIqa-1lACpeRtm0b2iXJekpXnW8Spbciw",
    aboutText:
      "High-throughput commercial laundry and steam pressing unit catering to corporate executives, daily essentials, and quick turnarounds.",
    yearsActive: 3,
    completedOrdersCount: "15k+",
    totalServicesCount: 14,
    isAvailableToday: true,
    pickupAvailable: true,
    deliveryAvailable: true,
    serviceAreas: ["Indiranagar", "Ulsoor", "MG Road"],
    badges: ["Express 12h", "Affordable", "High Volume"],
    servicesOffered: [mockServiceItems[0], mockServiceItems[3], mockServiceItems[4]],
    recentReviews: [
      {
        id: "rev-5",
        authorName: "Rahul K.",
        avatarInitial: "R",
        rating: 4.8,
        date: "5 days ago",
        comment:
          "Delivered in less than 12 hours before my flight. Perfectly crisp steam press.",
      },
    ],
  },
];

export interface IProviderService {
  getDiscoveryData(filter?: ProviderFilter): Promise<ProviderDiscoveryData>;
  getProviders(filter?: ProviderFilter): Promise<ProviderSummary[]>;
  getProviderById(id: string): Promise<ProviderDetailData | null>;
  toggleFavoriteProvider(id: string): Promise<boolean>;
  isProviderFavorited(id: string): Promise<boolean>;
}

class ProviderService implements IProviderService {
  private getFavoritedSet(): Set<string> {
    if (typeof window === "undefined") return new Set();
    try {
      const stored = localStorage.getItem("washora_favorited_providers");
      if (stored) return new Set(JSON.parse(stored));
    } catch {
      // ignore
    }
    return new Set();
  }

  async isProviderFavorited(id: string): Promise<boolean> {
    return this.getFavoritedSet().has(id);
  }

  async toggleFavoriteProvider(id: string): Promise<boolean> {
    const favs = this.getFavoritedSet();
    const willFav = !favs.has(id);
    if (willFav) favs.add(id);
    else favs.delete(id);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "washora_favorited_providers",
          JSON.stringify(Array.from(favs))
        );
      } catch {
        // ignore
      }
    }
    return willFav;
  }

  async getProviders(filter?: ProviderFilter): Promise<ProviderSummary[]> {
    await new Promise((res) => setTimeout(res, 200));

    let list: ProviderSummary[] = [...DETAILED_MOCK_PROVIDERS];

    if (filter?.query && filter.query.trim()) {
      const q = filter.query.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.businessName.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q)
      );
    }

    if (filter?.minRating) {
      list = list.filter((p) => p.rating >= filter.minRating!);
    }

    if (filter?.maxDistanceKm) {
      list = list.filter((p) => p.distanceKm <= filter.maxDistanceKm!);
    }

    if (filter?.verifiedOnly) {
      list = list.filter((p) => p.isVerified);
    }

    if (filter?.sortBy) {
      switch (filter.sortBy) {
        case "rating":
          list.sort((a, b) => b.rating - a.rating);
          break;
        case "distance":
          list.sort((a, b) => a.distanceKm - b.distanceKm);
          break;
        case "experience":
          list.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
          break;
        default:
          break;
      }
    }

    return list;
  }

  async getProviderById(id: string): Promise<ProviderDetailData | null> {
    await new Promise((res) => setTimeout(res, 250));
    const provider =
      DETAILED_MOCK_PROVIDERS.find((p) => p.id === id) || DETAILED_MOCK_PROVIDERS[0];
    return provider || null;
  }

  async getDiscoveryData(filter?: ProviderFilter): Promise<ProviderDiscoveryData> {
    const [providers, location] = await Promise.all([
      this.getProviders(filter),
      customerProfileService.getLocationPreference(),
    ]);

    return {
      providers,
      totalResults: providers.length,
      currentLocation: location,
    };
  }
}

export const providerService = new ProviderService();
