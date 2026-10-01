/**
 * Type definitions for WASHORA Service Provider Profile & Business Setup (P2)
 */

export interface ProviderContactInfo {
  primaryEmail: string;
  supportEmail: string;
  primaryPhone: string;
  emergencyHotline?: string;
  websiteUrl?: string;
}

export interface ProviderBusinessIdentity {
  businessName: string;
  legalEntityName: string;
  businessCategory: string;
  entityType: "proprietorship" | "partnership" | "llp" | "private_limited";
  gstin?: string;
  panNumber: string;
  establishedYear: string;
  description: string;
  logoUrl?: string;
  coverPhotoUrl?: string;
}

export interface ProviderBusinessAddress {
  addressLine1: string;
  addressLine2?: string;
  locality: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  landmark?: string;
  latitude: number;
  longitude: number;
}

export interface ProviderDayOperatingHours {
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  isOpen: boolean;
  openTime: string; // e.g. "08:00 AM"
  closeTime: string; // e.g. "08:00 PM"
}

export interface ProviderOperatingHoursConfig {
  schedule: ProviderDayOperatingHours[];
  turnaroundSlaHours: number; // 12, 24, 48, 72
  acceptingEmergencyRush: boolean;
}

export interface ProviderServiceAreaConfig {
  coverageRadiusKm: number; // 1 - 25 km
  servicedPostalCodes: string[];
  servicedLocalities: string[];
  expressPickupAvailable: boolean;
}

export interface ProviderVerificationStatusInfo {
  overallProgressPercent: number;
  isKycVerified: boolean;
  isBankVerified: boolean;
  isStorefrontVerified: boolean;
  isTradeLicenseVerified: boolean;
  statusBadge: "ACTIVE_VERIFIED" | "UNDER_REVIEW" | "ACTION_REQUIRED";
}

export interface ProviderFullProfile {
  id: string;
  providerCode: string;
  identity: ProviderBusinessIdentity;
  contact: ProviderContactInfo;
  address: ProviderBusinessAddress;
  operatingHours: ProviderOperatingHoursConfig;
  serviceArea: ProviderServiceAreaConfig;
  verification: ProviderVerificationStatusInfo;
  updatedAt: string;
}
