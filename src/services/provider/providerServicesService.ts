import {
  ProviderServiceItem,
  CreateProviderServicePayload,
  UpdateProviderServicePayload,
  ProviderServiceStats,
  ProviderServiceCategory,
} from "@/types/provider/services";
import { MOCK_PROVIDER_SERVICES } from "@/mocks/provider/services.mock";
import { providerApi } from "@/features/provider/api/providerApi";
import { isLiveMode } from "@/lib/api/mode";

const STORAGE_PROVIDER_SERVICES_KEY = "washora_provider_services_catalog";

let inMemoryServices: ProviderServiceItem[] = [...MOCK_PROVIDER_SERVICES];

export interface IProviderServicesService {
  getServices(providerId?: string): Promise<ProviderServiceItem[]>;
  getServiceById(id: string): Promise<ProviderServiceItem | null>;
  createService(payload: CreateProviderServicePayload, providerId?: string): Promise<ProviderServiceItem>;
  updateService(id: string, payload: UpdateProviderServicePayload): Promise<ProviderServiceItem>;
  toggleServiceStatus(id: string): Promise<ProviderServiceItem>;
  deleteService(id: string): Promise<boolean>;
  getServiceStats(providerId?: string): Promise<ProviderServiceStats>;
}

class ProviderServicesService implements IProviderServicesService {
  private toServiceCategory(cat: string): ProviderServiceCategory {
    const c = (cat || "").toLowerCase();
    if (c.includes("shoe") || c.includes("sneaker")) return "shoes";
    if (c.includes("bag")) return "bags";
    if (c.includes("helmet")) return "helmets";
    if (c.includes("vehicle")) return "vehicles";
    return "laundry";
  }

  private getCategoryDefaultIcon(category: string): string {
    const cat = category.toLowerCase();
    if (cat.includes("dry") || cat.includes("couture")) return "dry_cleaning";
    if (cat.includes("shoe") || cat.includes("sneaker")) return "footwear";
    if (cat.includes("leather") || cat.includes("suede")) return "styler";
    if (cat.includes("iron") || cat.includes("press")) return "iron";
    return "local_laundry_service";
  }

  private getCategoryDefaultTag(category: string): string {
    const cat = category.toLowerCase();
    if (cat.includes("dry")) return "Solvent Care";
    if (cat.includes("shoe")) return "Footwear Spa";
    if (cat.includes("silk")) return "Delicates";
    return "Standard Care";
  }

  private async loadStoredServices(): Promise<ProviderServiceItem[]> {
    if (typeof window === "undefined") return inMemoryServices;
    try {
      const stored = localStorage.getItem(STORAGE_PROVIDER_SERVICES_KEY);
      if (stored) {
        inMemoryServices = JSON.parse(stored);
        return inMemoryServices;
      }
    } catch {
      return inMemoryServices;
    }
    return inMemoryServices;
  }

  private persistServices(services: ProviderServiceItem[]): void {
    inMemoryServices = services;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_PROVIDER_SERVICES_KEY, JSON.stringify(services));
      } catch {
        // ignore
      }
    }
  }

  async getServices(providerId: string = "prov-1"): Promise<ProviderServiceItem[]> {
    if (isLiveMode()) {
      const res = await providerApi.services.getServices();
      const rawList = Array.isArray(res.data) ? res.data : (res as any).data?.items || [];

      return rawList.map((s: any) => ({
        id: s.id,
        providerId: s.providerId || providerId,
        name: s.serviceName || s.name,
        category: this.toServiceCategory(s.categoryName || s.category || ""),
        description: s.description || "Certified care studio processing",
        price: s.customPrice !== null && s.customPrice !== undefined ? Number(s.customPrice) : Number(s.basePrice || 450),
        durationMinutes: 60,
        turnaroundHours: s.customTurnaroundHours || 24,
        status: (s.isActive !== false ? "ACTIVE" : "INACTIVE") as ProviderServiceItem["status"],
        iconName: this.getCategoryDefaultIcon(s.categoryName || s.category || ""),
        tags: s.tags || [this.getCategoryDefaultTag(s.categoryName || s.category || "")],
        isPopular: false,
        createdAt: s.createdAt || new Date().toISOString(),
        updatedAt: s.updatedAt || new Date().toISOString(),
      }));
    }

    await new Promise((res) => setTimeout(res, 50));
    const all = await this.loadStoredServices();
    return all.filter((s) => s.providerId === providerId);
  }

  async getServiceById(id: string): Promise<ProviderServiceItem | null> {
    if (isLiveMode()) {
      try {
        const res = await providerApi.services.getService(id);
        const s = res.data;
        return {
          id: s.id,
          providerId: s.providerId,
          name: s.serviceName,
          category: this.toServiceCategory(s.categoryName),
          description: s.description || "Studio service offering",
          price: s.customPrice !== null && s.customPrice !== undefined ? Number(s.customPrice) : Number(s.basePrice),
          durationMinutes: 60,
          turnaroundHours: s.customTurnaroundHours || 24,
          status: s.isActive ? "ACTIVE" : "INACTIVE",
          iconName: this.getCategoryDefaultIcon(s.categoryName),
          tags: s.tags || [this.getCategoryDefaultTag(s.categoryName)],
          isPopular: false,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
        };
      } catch {
        return null;
      }
    }

    await new Promise((res) => setTimeout(res, 50));
    const all = await this.loadStoredServices();
    return all.find((s) => s.id === id) || null;
  }

  async createService(
    payload: CreateProviderServicePayload,
    providerId: string = "prov-1"
  ): Promise<ProviderServiceItem> {
    if (isLiveMode()) {
      const res = await providerApi.services.configureService(payload.name, {
        catalogServiceId: payload.name,
        customPrice: payload.price,
        customTurnaroundHours: payload.turnaroundHours,
        isActive: payload.status !== "INACTIVE",
      });
      const s = res.data;
      return {
        id: s.id,
        providerId: s.providerId || providerId,
        name: s.serviceName,
        category: this.toServiceCategory(s.categoryName),
        description: payload.description,
        price: s.customPrice ? Number(s.customPrice) : payload.price,
        durationMinutes: payload.durationMinutes,
        turnaroundHours: payload.turnaroundHours,
        status: s.isActive ? "ACTIVE" : "INACTIVE",
        iconName: payload.iconName || this.getCategoryDefaultIcon(payload.category),
        imageUrl: payload.imageUrl,
        tags: payload.tags || [this.getCategoryDefaultTag(payload.category)],
        isPopular: false,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      };
    }

    await new Promise((res) => setTimeout(res, 350));
    const all = await this.loadStoredServices();

    const newService: ProviderServiceItem = {
      id: `srv-${Date.now()}`,
      providerId,
      name: payload.name,
      category: payload.category,
      description: payload.description,
      price: payload.price,
      durationMinutes: payload.durationMinutes,
      turnaroundHours: payload.turnaroundHours,
      status: payload.status || "ACTIVE",
      iconName: payload.iconName || this.getCategoryDefaultIcon(payload.category),
      imageUrl: payload.imageUrl,
      tags: payload.tags || [this.getCategoryDefaultTag(payload.category)],
      isPopular: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newService, ...all];
    this.persistServices(updated);
    return newService;
  }

  async updateService(id: string, payload: UpdateProviderServicePayload): Promise<ProviderServiceItem> {
    if (isLiveMode()) {
      const res = await providerApi.services.updateService(id, {
        customPrice: payload.price,
        customTurnaroundHours: payload.turnaroundHours,
        isActive: payload.status !== undefined ? payload.status === "ACTIVE" : undefined,
      });
      const s = res.data;
      return {
        id: s.id,
        providerId: s.providerId,
        name: s.serviceName,
        category: this.toServiceCategory(s.categoryName),
        description: payload.description || "Updated service offering",
        price: s.customPrice ? Number(s.customPrice) : Number(s.basePrice),
        durationMinutes: payload.durationMinutes || 60,
        turnaroundHours: s.customTurnaroundHours || payload.turnaroundHours || 24,
        status: s.isActive ? "ACTIVE" : "INACTIVE",
        iconName: this.getCategoryDefaultIcon(s.categoryName),
        imageUrl: payload.imageUrl,
        tags: payload.tags || [this.getCategoryDefaultTag(s.categoryName)],
        isPopular: false,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      };
    }

    await new Promise((res) => setTimeout(res, 350));
    const all = await this.loadStoredServices();
    const index = all.findIndex((s) => s.id === id);

    if (index === -1) {
      throw new Error(`Service with ID ${id} not found.`);
    }

    const updatedService: ProviderServiceItem = {
      ...all[index],
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    all[index] = updatedService;
    this.persistServices([...all]);
    return updatedService;
  }

  async toggleServiceStatus(id: string): Promise<ProviderServiceItem> {
    const current = await this.getServiceById(id);
    if (!current) {
      throw new Error(`Service with ID ${id} not found.`);
    }

    const nextStatus = current.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    return this.updateService(id, { status: nextStatus });
  }

  async deleteService(id: string): Promise<boolean> {
    if (isLiveMode()) {
      await providerApi.services.deleteService(id);
      return true;
    }

    await new Promise((res) => setTimeout(res, 300));
    const all = await this.loadStoredServices();
    const filtered = all.filter((s) => s.id !== id);
    this.persistServices(filtered);
    return true;
  }

  async getServiceStats(providerId: string = "prov-1"): Promise<ProviderServiceStats> {
    const services = await this.getServices(providerId);

    const totalServices = services.length;
    const activeServices = services.filter((s) => s.status === "ACTIVE").length;
    const inactiveServices = services.filter((s) => s.status === "INACTIVE").length;

    const totalPrice = services.reduce((sum, s) => sum + s.price, 0);
    const averagePrice = totalServices > 0 ? Math.round(totalPrice / totalServices) : 0;

    return {
      totalServices,
      activeServices,
      inactiveServices,
      averagePrice,
    };
  }
}

export const providerServicesService = new ProviderServicesService();
