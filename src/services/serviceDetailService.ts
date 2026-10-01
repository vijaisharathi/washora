import { ServiceDetailData } from "@/types/customer/serviceDetail";
import {
  mockCategories,
  mockServiceItems,
  mockProviders,
} from "@/mocks/customer/mockData";
import { customerApi } from "@/features/customer/api/customerApi";
import { isLiveMode } from "@/lib/api";

const GALLERY_SAMPLES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCB8sBRYXGmkl4INCggMMYKwl-RQihHI2ub_LQUCoFZSeZeQp3cgVmx3AZEmzsLDixhwhcicWKrXxXgFGtyk_jS0NH0GK3dDfzluZJh_YvcZZt-AMoz4Zz552cZxtnf1agHX2H12wpuX2uNJ9QvNHI0wZYY6Nt0q5H2iLxpWAw29QKMt9CRsWP1WDqFtkeHPvwqLEKJNyPqf-HvnX9AFfVuBO5ezWPbqj-0JTnmu4jd9C0eM9TlULv5-A",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBO_rx8YQRdSi-ERNhuf3YIOxyUuIs2lFRN7RS6ijFSgmvOgiIN42wqn5tO_M3xRwhbi8VP72m46Wak0jWkv5q0Vg5S6Phx_OePL_8LOOWpBY7Anlhq7jAhM2jsQFpj-R8gXYfPc4Xtaayx_3ITHqUy_3Lc9DD2gbqbVKBx2Z1tGjNqUY3CubVIkurzMCMY4btEkk45Dc22pXSWO2ojXEzER7DJuSKVK5uJ5uIJvGvYvjp6-h5wm4G9sg",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBnUNH0YjsfvXrc7B-YBEa7oPQ2z3ceBXCzJAHjcYENN-a57ecK_fIOhHUYDGmfb89dQpwWRnsNqADCzcn36CR9vCYfTt2shRJOGsKfB4rnRfVE8iW8lYEria3-SfsIFc3hDGiBc5qqIzSnb50IuvKBp6Lo1xm5CKOxhvMnmnD3ezmDhsfksOD3WIdWU4hBO6WPMCQtAN3QJAAT8jari2I4vKbu3iI1zzSedaRp-bWQhE8dO7LT8KiONQ",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDYafz8W3nF4Kr1w_pxLgqMD1fSd2Edgt1IQBoZNAFsy-xxO-Q6dcXuPwbMoZXpiStWB5wb0Liq3GWCL3cQVaxNHOMIgJWwfoq1_05loaTsQP4zIkyqz7DmXFYdkJAmqDJSAwoTYmLhZG9skZNoYuE6u04DVC206_9c6UhShoXobQVCIk3ShZJtFcwvnntPSf9EfLsV2fFCQHpcmDfnW7uhuuqVo5YoKsgLZoA-TlckZkDIz9IAKuxmvg",
];

const inMemoryFavorites = new Set<string>();

export interface IServiceDetailService {
  getServiceDetailById(id: string): Promise<ServiceDetailData | null>;
  toggleFavoriteService(id: string): Promise<boolean>;
  isServiceFavorited(id: string): Promise<boolean>;
}

class ServiceDetailService implements IServiceDetailService {
  private getFavoritedSet(): Set<string> {
    if (typeof window === "undefined") return inMemoryFavorites;
    try {
      const stored = localStorage.getItem("washora_favorited_services");
      if (stored) return new Set(JSON.parse(stored));
    } catch {
      // ignore
    }
    return inMemoryFavorites;
  }

  private saveFavorites(set: Set<string>): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("washora_favorited_services", JSON.stringify(Array.from(set)));
      } catch {
        // ignore
      }
    }
  }

  async isServiceFavorited(id: string): Promise<boolean> {
    if (isLiveMode()) {
      try {
        const res = await customerApi.favorites.list();
        const items = Array.isArray(res.data) ? res.data : [];
        return (items as Array<{ serviceId?: string; id?: string }>).some(
          (item) => item.serviceId === id || item.id === id
        );
      } catch (err) {
        throw err;
      }
    }
    return this.getFavoritedSet().has(id);
  }

  async toggleFavoriteService(id: string): Promise<boolean> {
    if (isLiveMode()) {
      try {
        const currentlyFav = await this.isServiceFavorited(id);
        if (currentlyFav) {
          await customerApi.favorites.remove(id);
          const favs = this.getFavoritedSet();
          favs.delete(id);
          this.saveFavorites(favs);
          return false;
        } else {
          await customerApi.favorites.add(id);
          const favs = this.getFavoritedSet();
          favs.add(id);
          this.saveFavorites(favs);
          return true;
        }
      } catch (err) {
        throw err;
      }
    }

    const favs = this.getFavoritedSet();
    const willFav = !favs.has(id);
    if (willFav) favs.add(id);
    else favs.delete(id);
    this.saveFavorites(favs);
    return willFav;
  }

  async getServiceDetailById(id: string): Promise<ServiceDetailData | null> {
    if (isLiveMode()) {
      try {
        const [serviceRes, variantsRes, imagesRes] = await Promise.all([
          customerApi.catalog.getServiceById(id).catch(() => customerApi.catalog.getServiceBySlug(id)),
          customerApi.catalog.getServiceVariants(id).catch(() => ({ data: [] })),
          customerApi.catalog.getServiceImages(id).catch(() => ({ data: [] })),
        ]);

        const s = serviceRes.data as Record<string, unknown>;
        if (!s) return null;

        const rawVariants = Array.isArray(variantsRes.data)
          ? variantsRes.data
          : Array.isArray(s.variants)
          ? s.variants
          : [];

        const variants = (rawVariants as Record<string, unknown>[]).map((v) => ({
          id: String(v.id || ""),
          name: String(v.name || ""),
          price: Number(v.price) || 0,
          description: v.description ? String(v.description) : undefined,
          turnaroundHours: Number(v.turnaroundHours) || 24,
        }));

        const gallery = Array.isArray(imagesRes.data) && imagesRes.data.length > 0
          ? (imagesRes.data as Array<Record<string, unknown> | string>).map((img) =>
              typeof img === "string" ? img : String(img.imageUrl || img.url || "")
            ).filter(Boolean)
          : s.imageUrl
          ? [String(s.imageUrl), ...GALLERY_SAMPLES.slice(0, 3)]
          : GALLERY_SAMPLES;

        const categoryObj = s.category as Record<string, unknown> | undefined;

        return {
          id: String(s.id),
          categoryId: String(s.categoryId || ""),
          categoryName: String(categoryObj?.name || "Garment Care"),
          categorySlug: String(categoryObj?.slug || "garment-care"),
          name: String(s.name),
          description: String(s.description || ""),
          basePrice: Number(s.basePrice) || 99,
          unit: (s.unit as any) || "per item",
          variants,
          addons: Array.isArray(s.addons) ? s.addons : [],
          imageUrl: s.imageUrl ? String(s.imageUrl) : undefined,
          popular: s.popular !== false,
          rating: Number(s.rating) || 4.9,
          reviewCount: Number(s.reviewCount) || 128,
          turnaroundEstimate: String(s.turnaroundEstimate || "24–48 hrs"),
          pickupAvailable: true,
          deliveryAvailable: true,
          longDescription: String(
            s.longDescription ||
            `${s.description || ""} Our studio specialists follow certified multi-step care processes to inspect, deep clean, and protect every garment.`
          ),
          galleryImages: gallery,
          inclusions: Array.isArray(s.inclusions) && s.inclusions.length > 0
            ? (s.inclusions as string[])
            : [
                "Specialized non-toxic stain extraction",
                "Fabric density and stitch inspection",
                "Doorstep valet pickup & return",
                "Luxury garment protective hanger bag",
              ],
          exclusions: Array.isArray(s.exclusions) && s.exclusions.length > 0
            ? (s.exclusions as string[])
            : [
                "Heavy hardware replacement",
                "Leather re-crafting (available as add-on)",
              ],
          processSteps: Array.isArray(s.processSteps) && s.processSteps.length > 0
            ? (s.processSteps as ServiceDetailData["processSteps"])
            : [
                { step: 1, title: "Intake Inspection", description: "High-resolution fabric check and digital tagging." },
                { step: 2, title: "Specialized Treatment", description: "pH-balanced custom extraction process." },
                { step: 3, title: "Quality Check & Pack", description: "Multi-point inspection and luxury garment bagging." },
              ],
          faqs: Array.isArray(s.faqs) && s.faqs.length > 0
            ? (s.faqs as ServiceDetailData["faqs"])
            : [
                {
                  q: "How long does specialty garment treatment take?",
                  a: "Most services are completed within 24 to 48 hours from the time of pickup.",
                },
                {
                  q: "Are eco-friendly detergents safe for silk and lace?",
                  a: "Yes, all solvents used are pH-balanced, dermatologically tested, and safe for luxury fabrics.",
                },
              ],
          assignedProvider: (s.provider as any) || mockProviders[0],
          relatedServices: mockServiceItems.filter((item) => item.id !== s.id).slice(0, 3),
        };
      } catch (err) {
        throw err;
      }
    }
    await new Promise((res) => setTimeout(res, 50));

    const item = mockServiceItems.find((s) => s.id === id) || mockServiceItems[0];
    if (!item) return null;

    const category =
      mockCategories.find((c) => c.id === item.categoryId) || mockCategories[0];

    const provider = mockProviders[0];

    const related = mockServiceItems.filter((s) => s.id !== item.id).slice(0, 3);

    return {
      ...item,
      categoryName: category.name,
      categorySlug: category.slug,
      rating: 4.9,
      reviewCount: 340,
      turnaroundEstimate: "24–48 hrs",
      pickupAvailable: true,
      deliveryAvailable: true,
      longDescription: `${item.description} Our studio specialists follow certified multi-step care processes to inspect, deep clean, and protect every garment.`,
      galleryImages: item.imageUrl ? [item.imageUrl, ...GALLERY_SAMPLES.slice(0, 3)] : GALLERY_SAMPLES,
      inclusions: [
        "Specialized non-toxic stain extraction",
        "Fabric density and stitch inspection",
        "Doorstep valet pickup & return",
        "Luxury garment protective hanger bag",
      ],
      exclusions: [
        "Heavy hardware replacement",
        "Leather re-crafting (available as add-on)",
      ],
      processSteps: [
        { step: 1, title: "Intake Inspection", description: "High-resolution fabric check and digital tagging." },
        { step: 2, title: "Specialized Treatment", description: "pH-balanced custom extraction process." },
        { step: 3, title: "Quality Check & Pack", description: "Multi-point inspection and luxury garment bagging." },
      ],
      faqs: [
        {
          q: "How long does specialty garment treatment take?",
          a: "Most services are completed within 24 to 48 hours from the time of pickup.",
        },
        {
          q: "Are eco-friendly detergents safe for silk and lace?",
          a: "Yes, all solvents used are pH-balanced, dermatologically tested, and safe for luxury fabrics.",
        },
      ],
      assignedProvider: provider,
      relatedServices: related,
    };
  }
}

export const serviceDetailService = new ServiceDetailService();
