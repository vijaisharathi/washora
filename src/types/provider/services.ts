/**
 * Type definitions for WASHORA Service Provider Service Management (P4)
 */

export type ProviderServiceCategory =
  | "laundry"
  | "shoes"
  | "bags"
  | "helmets"
  | "vehicles";

export type ProviderServiceStatus = "ACTIVE" | "INACTIVE";

export interface ProviderServiceItem {
  id: string;
  providerId: string;
  name: string;
  category: ProviderServiceCategory;
  description: string;
  price: number; // Base price in INR (₹)
  durationMinutes: number; // e.g. 45 mins care cycle
  turnaroundHours: number; // SLA commitment: 12, 24, 48, 72
  status: ProviderServiceStatus;
  imageUrl?: string;
  iconName: string;
  tags: string[];
  isPopular?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProviderServicePayload {
  name: string;
  category: ProviderServiceCategory;
  description: string;
  price: number;
  durationMinutes: number;
  turnaroundHours: number;
  status: ProviderServiceStatus;
  iconName?: string;
  imageUrl?: string;
  tags?: string[];
}

export interface UpdateProviderServicePayload extends Partial<CreateProviderServicePayload> {}

export interface ProviderServiceStats {
  totalServices: number;
  activeServices: number;
  inactiveServices: number;
  averagePrice: number;
}
