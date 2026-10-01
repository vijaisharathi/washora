import { HomeData, HomePromotion } from "@/types/customer/home";
import { Order } from "@/types/customer";
import { customerProfileService } from "@/services/customerProfileService";
import { customerService } from "@/services/customerService";
import { mockProviders } from "@/mocks/customer/mockData";

const PROMOTIONS: HomePromotion[] = [
  {
    id: "promo-1",
    title: "Care for Everything You Own.",
    subtitle: "From silk sarees and sneakers to motorcycle jackets — book trusted care services near you.",
    code: "WASHORA20",
    discountBadge: "20% OFF FIRST CARE",
    ctaText: "Explore Services",
    ctaUrl: "/customer/services",
    gradient: "from-primary-container/30 via-surface-container to-surface-container-low",
  },
  {
    id: "promo-2",
    title: "Monsoon Sneaker Deep Restoration",
    subtitle: "Complete stain extraction, ultrasonic sole sanitization, and waterproof nanocoating.",
    code: "SNEAKERFIX",
    discountBadge: "FLAT ₹150 OFF",
    ctaText: "Book Shoe Care",
    ctaUrl: "/customer/services?category=shoe-sneaker-care",
    gradient: "from-blue-900/30 via-surface-container to-surface-container-low",
  },
];

export interface IHomeService {
  getHomeData(): Promise<HomeData>;
}

class HomeService implements IHomeService {
  async getHomeData(): Promise<HomeData> {
    const [profile, location, categories, orders, services] = await Promise.all([
      customerProfileService.getProfile(),
      customerProfileService.getLocationPreference(),
      customerService.getCategories(),
      customerService.getOrders(),
      customerService.getServiceItems(),
    ]);

    const activeOrder: Order | undefined = orders.find(
      (o: Order) => o.status !== "DELIVERED" && o.status !== "CANCELLED"
    );

    return {
      greeting: "Hello, " + (profile.name?.split(" ")[0] || "there"),
      customerName: profile.name,
      currentLocation: location,
      promotions: PROMOTIONS,
      categories,
      activeOrder: activeOrder || null,
      featuredServices: services.slice(0, 6),
      recommendedProviders: mockProviders.slice(0, 4),
    };
  }
}

export const homeService = new HomeService();
