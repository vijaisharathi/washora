import {
  AdminUser,
  AdminSession,
  AdminSystemStatusSummary,
  AdminOnboardingData,
  AdminProfile,
  Organization,
} from "@/types/admin";

export const MOCK_ADMIN_USER_1: AdminUser = {
  id: "admin-001",
  name: "Priyanshu Roy",
  email: "admin@example.com",
  role: "admin",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  department: "Platform Operations & Governance",
  assignedZones: ["ALL_ZONES", "BLR_SOUTH", "BLR_EAST", "BLR_NORTH"],
  permissions: ["*"],
  lastActive: "2026-09-03T17:15:00Z",
  onboardingCompleted: true,
  organizationId: "ORG-0001",
};

export const MOCK_ADMIN_USER_2: AdminUser = {
  id: "admin-002",
  name: "Ananya Sen",
  email: "ops@example.com",
  role: "operations",
  avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
  department: "Hub Dispatch & Valet Logistics",
  assignedZones: ["BLR_EAST_INDIRANAGAR", "BLR_WHITEFIELD", "BLR_KORAMANGALA"],
  permissions: ["orders:read", "orders:dispatch", "providers:manage", "valets:manage"],
  lastActive: "2026-09-03T17:10:00Z",
  onboardingCompleted: false,
  organizationId: "ORG-0002",
};

// Aliases for backward compatibility
export const MOCK_SUPER_ADMIN_USER: AdminUser = MOCK_ADMIN_USER_1;
export const MOCK_OPERATIONS_MANAGER_USER: AdminUser = MOCK_ADMIN_USER_2;

export const MOCK_ADMIN_SESSION: AdminSession = {
  isAuthenticated: true,
  token: "washora_mock_admin_jwt_token_9918231",
  userId: "admin-001",
  user: MOCK_ADMIN_USER_1,
  role: "admin",
  onboardingCompleted: true,
  expiresAt: "2026-12-31T23:59:59Z",
  lastActive: "2026-09-03T17:20:00Z",
};

export const MOCK_ORGANIZATIONS: Record<string, Organization> = {
  "ORG-0001": {
    id: "ORG-0001",
    name: "WASHORA Technologies India Pvt Ltd",
    email: "ops-governance@washora.example.com",
    phone: "+91 80234 56780",
    type: "washora",
    status: "Active",
    createdAt: "2025-01-15T09:00:00Z",
    updatedAt: "2026-09-01T10:00:00Z",
  },
  "ORG-0002": {
    id: "ORG-0002",
    name: "WASHORA Central Logistics",
    email: "hub-dispatch@washora.example.com",
    phone: "+91 80234 56781",
    type: "internal-operations",
    status: "Active",
    createdAt: "2025-06-20T11:30:00Z",
    updatedAt: "2026-09-02T14:15:00Z",
  },
};

export const MOCK_ADMIN_PROFILES: Record<string, AdminProfile> = {
  "admin-001": {
    id: "ADM-0001",
    userId: "admin-001",
    organizationId: "ORG-0001",
    fullName: "Priyanshu Roy",
    workEmail: "admin@example.com",
    phone: "+91 98765 43210",
    profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    role: "admin",
    primaryWorkArea: "platform-operations",
    preferredLanguage: "english",
    timezone: "Asia/Kolkata",
    status: "Active",
    createdAt: "2025-01-15T09:00:00Z",
    updatedAt: "2026-09-03T17:15:00Z",
  },
  "admin-002": {
    id: "ADM-0002",
    userId: "admin-002",
    organizationId: "ORG-0002",
    fullName: "Ananya Sen",
    workEmail: "ops@example.com",
    phone: "+91 98765 88990",
    profileImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
    role: "operations",
    primaryWorkArea: "delivery-operations",
    preferredLanguage: "english",
    timezone: "Asia/Kolkata",
    status: "Active",
    createdAt: "2025-06-20T11:30:00Z",
    updatedAt: "2026-09-03T17:10:00Z",
  },
};

export const MOCK_ADMIN_ONBOARDING_DRAFTS: Record<string, AdminOnboardingData> = {
  "admin-001": {
    userId: "admin-001",
    fullName: "Priyanshu Roy",
    workEmail: "admin@example.com",
    phone: "+91 98765 43210",
    profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    organizationName: "WASHORA Technologies India Pvt Ltd",
    organizationEmail: "ops-governance@washora.example.com",
    organizationPhone: "+91 80234 56780",
    organizationType: "washora",
    role: "administrator",
    primaryWorkArea: "platform-operations",
    preferredLanguage: "english",
    timezone: "Asia/Kolkata",
    currentStep: 4,
  },
  "admin-002": {
    userId: "admin-002",
    fullName: "Ananya Sen",
    workEmail: "ops@example.com",
    phone: "+91 98765 88990",
    profileImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
    organizationName: "WASHORA Central Logistics",
    organizationEmail: "hub-dispatch@washora.example.com",
    organizationPhone: "+91 80234 56781",
    organizationType: "internal-operations",
    role: "operations-manager",
    primaryWorkArea: "delivery-operations",
    preferredLanguage: "english",
    timezone: "Asia/Kolkata",
    currentStep: 1,
  },
};

export const MOCK_ADMIN_SYSTEM_STATUS: AdminSystemStatusSummary = {
  gatewayStatus: "OPERATIONAL",
  activeHubsCount: 6,
  assignedDispatchersCount: 14,
  activeValetsOnline: 42,
  version: "v2.8.0-admin-core",
  environment: "production",
};
