import {
  CustomerProfile,
  CustomerAddress,
  AddressFormData,
  ProfileUpdatePayload,
  LocationPreference,
  AddressLabel,
} from "@/types/customer";
import { DEMO_PROFILE } from "@/mocks/customer/authMock";
import { mockAddresses as initialAddresses } from "@/mocks/customer/mockData";
import {
  customerApi,
  CustomerProfileData,
  CustomerAddressData,
} from "@/features/customer/api/customerApi";
import { isLiveMode } from "@/lib/api";

const PROFILE_STORAGE_KEY = "washora_customer_profile";
const ADDRESSES_STORAGE_KEY = "washora_customer_addresses";
const LOCATION_STORAGE_KEY = "washora_customer_location";

const DEFAULT_LOCATION: LocationPreference = {
  areaName: "Anna Nagar",
  city: "Chennai",
  pincode: "600040",
  latitude: 13.085,
  longitude: 80.21,
  servicesAvailableCount: 24,
  providersNearbyCount: 18,
};

const POPULAR_LOCATIONS: LocationPreference[] = [
  {
    areaName: "Anna Nagar",
    city: "Chennai",
    pincode: "600040",
    latitude: 13.085,
    longitude: 80.21,
    servicesAvailableCount: 24,
    providersNearbyCount: 18,
  },
  {
    areaName: "Indiranagar",
    city: "Bengaluru",
    pincode: "560038",
    latitude: 12.9784,
    longitude: 77.6408,
    servicesAvailableCount: 32,
    providersNearbyCount: 22,
  },
  {
    areaName: "Koramangala",
    city: "Bengaluru",
    pincode: "560034",
    latitude: 12.9352,
    longitude: 77.6245,
    servicesAvailableCount: 28,
    providersNearbyCount: 19,
  },
  {
    areaName: "T. Nagar",
    city: "Chennai",
    pincode: "600017",
    latitude: 13.0418,
    longitude: 80.2341,
    servicesAvailableCount: 26,
    providersNearbyCount: 16,
  },
  {
    areaName: "Bandra West",
    city: "Mumbai",
    pincode: "400050",
    latitude: 19.0596,
    longitude: 72.8295,
    servicesAvailableCount: 35,
    providersNearbyCount: 25,
  },
];

export interface ICustomerProfileService {
  getProfile(): Promise<CustomerProfile>;
  updateProfile(payload: ProfileUpdatePayload): Promise<CustomerProfile>;
  uploadProfileImage(imageUrl: string): Promise<string>;
  getAddresses(): Promise<CustomerAddress[]>;
  getAddressById(id: string): Promise<CustomerAddress | null>;
  createAddress(data: AddressFormData): Promise<CustomerAddress>;
  updateAddress(id: string, data: Partial<AddressFormData>): Promise<CustomerAddress>;
  deleteAddress(id: string): Promise<void>;
  setDefaultAddress(id: string): Promise<CustomerAddress>;
  getLocationPreference(): Promise<LocationPreference>;
  setLocationPreference(location: LocationPreference): Promise<LocationPreference>;
  searchLocations(query: string): Promise<LocationPreference[]>;
  detectCurrentLocation(): Promise<LocationPreference>;
}

function mapProfileData(data: CustomerProfileData): CustomerProfile {
  return {
    id: data.id,
    userId: data.id,
    name: data.fullName,
    email: data.email,
    phone: data.phone,
    avatarUrl: data.avatarUrl,
    isPhoneVerified: true,
    memberSince: "March 2024",
    tier: "Premium Member",
  };
}

function mapAddressData(data: CustomerAddressData): CustomerAddress {
  return {
    id: data.id,
    customerId: "cust-current",
    label: (data.tag as AddressLabel) || "Home",
    recipientName: data.recipientName || "Arjun Verma",
    phoneNumber: data.phoneNumber || "+91 98765 43210",
    streetAddress: data.addressLine1 || "",
    apartmentSuite: data.apartmentSuite || data.addressLine2,
    city: data.city || "",
    state: data.state,
    postalCode: data.postalCode || "",
    landmark: data.landmark,
    isDefault: data.isDefault,
    latitude: data.latitude,
    longitude: data.longitude,
  };
}

let inMemoryProfile: CustomerProfile = { ...DEMO_PROFILE, tier: "Premium Member" };
let inMemoryAddresses: CustomerAddress[] = [...initialAddresses];

class CustomerProfileService implements ICustomerProfileService {
  private getStoredProfile(): CustomerProfile {
    if (typeof window === "undefined") return inMemoryProfile;
    try {
      const data = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return inMemoryProfile;
  }

  private setStoredProfile(profile: CustomerProfile): void {
    inMemoryProfile = profile;
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // ignore
    }
  }

  private getStoredAddresses(): CustomerAddress[] {
    if (typeof window === "undefined") return inMemoryAddresses;
    try {
      const data = localStorage.getItem(ADDRESSES_STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return inMemoryAddresses;
  }

  private setStoredAddresses(addresses: CustomerAddress[]): void {
    inMemoryAddresses = addresses;
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(addresses));
    } catch {
      // ignore
    }
  }

  async getProfile(): Promise<CustomerProfile> {
    if (isLiveMode()) {
      const res = await customerApi.profile.get();
      const profile = mapProfileData(res.data);
      this.setStoredProfile(profile);
      return profile;
    }

    return this.getProfileMock();
  }

  private async getProfileMock(): Promise<CustomerProfile> {
    await new Promise((res) => setTimeout(res, 200));
    return this.getStoredProfile();
  }

  async updateProfile(payload: ProfileUpdatePayload): Promise<CustomerProfile> {
    if (isLiveMode()) {
      const res = await customerApi.profile.update({
        fullName: payload.name.trim(),
        phone: payload.phone?.trim(),
        avatarUrl: payload.avatarUrl,
      });
      const profile = mapProfileData(res.data);
      this.setStoredProfile(profile);
      return profile;
    }

    return this.updateProfileMock(payload);
  }

  private async updateProfileMock(payload: ProfileUpdatePayload): Promise<CustomerProfile> {
    await new Promise((res) => setTimeout(res, 400));
    const current = this.getStoredProfile();
    const updated: CustomerProfile = {
      ...current,
      name: payload.name.trim(),
      email: payload.email?.trim() || current.email,
      phone: payload.phone?.trim() || current.phone,
      avatarUrl: payload.avatarUrl !== undefined ? payload.avatarUrl : current.avatarUrl,
    };
    this.setStoredProfile(updated);
    return updated;
  }

  async uploadProfileImage(imageUrl: string): Promise<string> {
    await new Promise((res) => setTimeout(res, 300));
    const current = this.getStoredProfile();
    current.avatarUrl = imageUrl;
    this.setStoredProfile(current);
    return imageUrl;
  }

  async getAddresses(): Promise<CustomerAddress[]> {
    if (isLiveMode()) {
      const res = await customerApi.addresses.list();
      const list = res.data.map(mapAddressData);
      this.setStoredAddresses(list);
      return list;
    }

    return this.getAddressesMock();
  }

  private async getAddressesMock(): Promise<CustomerAddress[]> {
    await new Promise((res) => setTimeout(res, 200));
    return this.getStoredAddresses();
  }

  async getAddressById(id: string): Promise<CustomerAddress | null> {
    if (isLiveMode()) {
      const res = await customerApi.addresses.get(id);
      return mapAddressData(res.data);
    }

    return this.getAddressByIdMock(id);
  }

  private async getAddressByIdMock(id: string): Promise<CustomerAddress | null> {
    await new Promise((res) => setTimeout(res, 150));
    const list = this.getStoredAddresses();
    return list.find((a) => a.id === id) || null;
  }

  async createAddress(data: AddressFormData): Promise<CustomerAddress> {
    if (isLiveMode()) {
      const res = await customerApi.addresses.create({
        tag: data.label || "Home",
        recipientName: data.recipientName ? data.recipientName.trim() : undefined,
        phoneNumber: data.phoneNumber ? data.phoneNumber.trim() : undefined,
        addressLine1: data.streetAddress ? data.streetAddress.trim() : "",
        apartmentSuite: data.apartmentSuite ? data.apartmentSuite.trim() : undefined,
        landmark: data.landmark ? data.landmark.trim() : undefined,
        city: data.city ? data.city.trim() : "",
        state: data.state ? data.state.trim() : undefined,
        postalCode: data.postalCode ? data.postalCode.trim() : "",
        isDefault: data.isDefault || false,
      });
      const created = mapAddressData(res.data);
      const list = this.getStoredAddresses();
      this.setStoredAddresses([...list, created]);
      return created;
    }

    return this.createAddressMock(data);
  }

  private async createAddressMock(data: AddressFormData): Promise<CustomerAddress> {
    await new Promise((res) => setTimeout(res, 400));
    const list = this.getStoredAddresses();

    const newId = `addr_${Date.now()}`;
    const newAddress: CustomerAddress = {
      id: newId,
      customerId: "cust-demo-1",
      label: data.label || "Home",
      recipientName: data.recipientName ? data.recipientName.trim() : "Arjun Verma",
      phoneNumber: data.phoneNumber ? data.phoneNumber.trim() : "+91 98765 43210",
      apartmentSuite: data.apartmentSuite ? data.apartmentSuite.trim() : undefined,
      streetAddress: data.streetAddress ? data.streetAddress.trim() : "",
      landmark: data.landmark ? data.landmark.trim() : undefined,
      postalCode: data.postalCode ? data.postalCode.trim() : "560038",
      city: data.city ? data.city.trim() : "Bangalore",
      state: data.state ? data.state.trim() : "Karnataka",
      isDefault: data.isDefault || list.length === 0,
    };

    let updatedList = [...list];
    if (newAddress.isDefault) {
      updatedList = updatedList.map((addr) => ({ ...addr, isDefault: false }));
    }
    updatedList.push(newAddress);
    this.setStoredAddresses(updatedList);
    return newAddress;
  }

  async updateAddress(id: string, data: Partial<AddressFormData>): Promise<CustomerAddress> {
    if (isLiveMode()) {
      const payload: Partial<CustomerAddressData> = {};
      if (data.label) payload.tag = data.label;
      if (data.recipientName !== undefined) payload.recipientName = data.recipientName.trim();
      if (data.phoneNumber !== undefined) payload.phoneNumber = data.phoneNumber.trim();
      if (data.streetAddress !== undefined) payload.addressLine1 = data.streetAddress.trim();
      if (data.apartmentSuite !== undefined) payload.apartmentSuite = data.apartmentSuite.trim();
      if (data.landmark !== undefined) payload.landmark = data.landmark.trim();
      if (data.city !== undefined) payload.city = data.city.trim();
      if (data.state !== undefined) payload.state = data.state?.trim();
      if (data.postalCode !== undefined) payload.postalCode = data.postalCode.trim();
      if (data.isDefault !== undefined) payload.isDefault = data.isDefault;

      const res = await customerApi.addresses.update(id, payload);
      const updated = mapAddressData(res.data);
      const list = this.getStoredAddresses();
      this.setStoredAddresses(list.map((a) => (a.id === id ? updated : a)));
      return updated;
    }

    return this.updateAddressMock(id, data);
  }

  private async updateAddressMock(id: string, data: Partial<AddressFormData>): Promise<CustomerAddress> {
    await new Promise((res) => setTimeout(res, 400));
    const list = this.getStoredAddresses();
    const index = list.findIndex((a) => a.id === id);
    if (index === -1) throw new Error("Address not found");

    let updatedList = [...list];
    if (data.isDefault) {
      updatedList = updatedList.map((addr) => ({ ...addr, isDefault: false }));
    }

    const updated: CustomerAddress = {
      ...updatedList[index],
      ...data,
      recipientName: data.recipientName !== undefined ? data.recipientName.trim() : updatedList[index].recipientName,
      phoneNumber: data.phoneNumber !== undefined ? data.phoneNumber.trim() : updatedList[index].phoneNumber,
      streetAddress: data.streetAddress !== undefined ? data.streetAddress.trim() : updatedList[index].streetAddress,
      apartmentSuite: data.apartmentSuite !== undefined ? data.apartmentSuite?.trim() : updatedList[index].apartmentSuite,
      landmark: data.landmark !== undefined ? data.landmark?.trim() : updatedList[index].landmark,
      postalCode: data.postalCode !== undefined ? data.postalCode.trim() : updatedList[index].postalCode,
      city: data.city !== undefined ? data.city.trim() : updatedList[index].city,
      state: data.state !== undefined ? data.state?.trim() : updatedList[index].state,
      isDefault: data.isDefault !== undefined ? data.isDefault : updatedList[index].isDefault,
    };

    updatedList[index] = updated;
    this.setStoredAddresses(updatedList);
    return updated;
  }

  async deleteAddress(id: string): Promise<void> {
    if (isLiveMode()) {
      await customerApi.addresses.delete(id);
      const list = this.getStoredAddresses();
      const filtered = list.filter((a) => a.id !== id);
      this.setStoredAddresses(filtered);
      return;
    }

    return this.deleteAddressMock(id);
  }

  private async deleteAddressMock(id: string): Promise<void> {
    await new Promise((res) => setTimeout(res, 350));
    const list = this.getStoredAddresses();
    const wasDefault = list.find((a) => a.id === id)?.isDefault;
    let filtered = list.filter((a) => a.id !== id);

    if (wasDefault && filtered.length > 0) {
      filtered[0].isDefault = true;
    }

    this.setStoredAddresses(filtered);
  }

  async setDefaultAddress(id: string): Promise<CustomerAddress> {
    if (isLiveMode()) {
      const res = await customerApi.addresses.setDefault(id);
      const updated = mapAddressData(res.data);
      const list = this.getStoredAddresses();
      this.setStoredAddresses(list.map((a) => ({ ...a, isDefault: a.id === id })));
      return updated;
    }

    return this.setDefaultAddressMock(id);
  }

  private async setDefaultAddressMock(id: string): Promise<CustomerAddress> {
    await new Promise((res) => setTimeout(res, 250));
    const list = this.getStoredAddresses();
    const target = list.find((a) => a.id === id);
    if (!target) throw new Error("Address not found");

    const updatedList = list.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));

    this.setStoredAddresses(updatedList);
    return { ...target, isDefault: true };
  }

  async getLocationPreference(): Promise<LocationPreference> {
    if (typeof window === "undefined") return DEFAULT_LOCATION;
    try {
      const stored = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return DEFAULT_LOCATION;
  }

  async setLocationPreference(location: LocationPreference): Promise<LocationPreference> {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
      } catch {
        // ignore
      }
    }
    return location;
  }

  async searchLocations(query: string): Promise<LocationPreference[]> {
    await new Promise((res) => setTimeout(res, 200));
    const q = query.toLowerCase().trim();
    if (!q) return POPULAR_LOCATIONS;

    return POPULAR_LOCATIONS.filter(
      (loc) =>
        loc.areaName.toLowerCase().includes(q) ||
        loc.city.toLowerCase().includes(q) ||
        loc.pincode.includes(q)
    );
  }

  async detectCurrentLocation(): Promise<LocationPreference> {
    await new Promise((res) => setTimeout(res, 600));
    return DEFAULT_LOCATION;
  }
}

export const customerProfileService = new CustomerProfileService();
