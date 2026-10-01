import {
  ProviderAccountOverview,
  ProviderSecuritySession,
  ProviderAccountPreferences,
} from "@/types/provider/settings";

export const MOCK_PROVIDER_ACCOUNT_OVERVIEW: ProviderAccountOverview = {
  id: "prov-1",
  name: "Arun Kumar",
  businessName: "LuxeCare Garment Studio LLP",
  email: "arun.kumar@luxecare.in",
  phone: "+91 98765 43210",
  avatarUrl:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60",
  isVerified: true,
  joinedDate: "Sept 2023",
  status: "ACTIVE",
};

export const MOCK_PROVIDER_SESSIONS: ProviderSecuritySession[] = [
  {
    id: "sess-1",
    device: "Studio Workshop Terminal (MacBook Pro)",
    browser: "Chrome 128 (macOS)",
    ipAddress: "103.21.124.5",
    location: "Indiranagar, Bengaluru, India",
    isCurrent: true,
    lastActive: "Active now",
  },
  {
    id: "sess-2",
    device: "Partner Mobile App (iPhone 15 Pro)",
    browser: "Safari Mobile (iOS 17)",
    ipAddress: "49.207.201.88",
    location: "Bengaluru, India",
    isCurrent: false,
    lastActive: "Yesterday, 8:20 PM",
  },
];

export const MOCK_PROVIDER_SETTINGS_PREFERENCES: ProviderAccountPreferences = {
  language: "English (India)",
  timezone: "Asia/Kolkata (IST - UTC+5:30)",
  currency: "INR (₹)",
  autoAcceptBookings: true,
};
