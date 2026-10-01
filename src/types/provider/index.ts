/**
 * Foundational Types for WASHORA Service Provider Frontend (P0)
 */

export type ProviderAccountStatus =
  | "PENDING_ONBOARDING"
  | "KYC_SUBMITTED"
  | "UNDER_VERIFICATION"
  | "ACTIVE"
  | "SUSPENDED"
  | "OFFLINE";

export type ProviderTier = "STANDARD" | "VERIFIED_PRO" | "ELITE_PARTNER";

export interface ProviderProfileSummary {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  tier: ProviderTier;
  status: ProviderAccountStatus;
  isOnline: boolean;
  rating: number;
  reviewCount: number;
  completedOrdersCount: number;
  memberSince: string;
}

export interface ProviderSession {
  token: string;
  provider: ProviderProfileSummary;
  expiresAt: string;
}

export interface ProviderNavigationItem {
  label: string;
  href: string;
  icon: string;
  badge?: string | number;
  isExact?: boolean;
}

export interface ProviderStatSummary {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  iconName: string;
}
