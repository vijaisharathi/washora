/**
 * Type definitions for WASHORA Service Provider Account & Settings (P13)
 */

export type ProviderAccountStatus = "ACTIVE" | "PENDING" | "SUSPENDED" | "INACTIVE";

export interface ProviderAccountOverview {
  id: string;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  isVerified: boolean;
  joinedDate: string;
  status: ProviderAccountStatus;
}

export interface ProviderSecuritySession {
  id: string;
  device: string; // e.g. "MacBook Pro 16\""
  browser: string; // e.g. "Chrome 128 (macOS)"
  ipAddress: string; // e.g. "103.21.124.5"
  location: string; // e.g. "Bengaluru, India"
  isCurrent: boolean;
  lastActive: string; // e.g. "Active now" or "Yesterday, 8:20 PM"
}

export interface ProviderAccountPreferences {
  language: string; // "English (India)"
  timezone: string; // "Asia/Kolkata (IST)"
  currency: string; // "INR (₹)"
  autoAcceptBookings: boolean;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface DeactivateAccountPayload {
  reason: string;
  confirmationText: string;
}
