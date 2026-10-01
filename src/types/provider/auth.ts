/**
 * Type definitions for WASHORA Service Provider Authentication & Onboarding (P1)
 */

export interface ProviderCredentials {
  identifier: string; // Email or Phone
  password?: string;
  rememberMe?: boolean;
}

export interface ProviderRegisterPayload {
  category: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  password?: string;
  confirmPassword?: string;
  acceptTerms: boolean;
}

export interface ProviderAuthResponse {
  token: string;
  providerId: string;
  businessName: string;
  email: string;
  phone: string;
  onboardingStatus: ProviderOnboardingStage;
}

export type ProviderOnboardingStage =
  | "NOT_STARTED"
  | "BUSINESS_INFO"
  | "STUDIO_LOCATION"
  | "SERVICE_CAPABILITIES"
  | "DOCUMENTS_UPLOAD"
  | "REVIEW_PENDING"
  | "UNDER_VERIFICATION"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED";

export interface ProviderBusinessInfoData {
  businessName: string;
  legalEntityName: string;
  businessCategory: string;
  gstNumber?: string;
  panNumber: string;
  businessType: "proprietorship" | "partnership" | "llp" | "private_limited";
  establishedYear: string;
}

export interface ProviderStudioLocationData {
  streetAddress: string;
  buildingSuite?: string;
  locality: string;
  city: string;
  state: string;
  postalCode: string;
  coverageRadiusKm: number;
  latitude?: number;
  longitude?: number;
}

export interface ProviderServiceCapabilitiesData {
  primarySpecialties: string[];
  turnaroundSlaHours: number;
  dailyCapacityUnits: number;
  workingDays: string[];
  workingHoursStart: string;
  workingHoursEnd: string;
  pickupDropAvailable: boolean;
}

export interface ProviderUploadedDoc {
  id: string;
  docType: "gst_certificate" | "trade_license" | "owner_id" | "storefront_photo";
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  status: "UPLOADED" | "VERIFIED" | "REJECTED";
}

export interface ProviderOnboardingDraft {
  step: number;
  businessInfo: ProviderBusinessInfoData;
  location: ProviderStudioLocationData;
  capabilities: ProviderServiceCapabilitiesData;
  documents: ProviderUploadedDoc[];
  isSubmitted: boolean;
}

export interface ProviderOnboardingStatusData {
  applicationNumber: string;
  businessName: string;
  submittedAt: string;
  stage: ProviderOnboardingStage;
  estimatedReviewHours: number;
  verifiedItems: { label: string; isComplete: boolean }[];
  contactSupportPhone: string;
}
