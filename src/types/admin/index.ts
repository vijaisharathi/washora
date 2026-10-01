/**
 * WASHORA ADMIN / OPERATIONS DOMAIN TYPES
 * Canonical types for authentication, identity, onboarding, profile, organization, navigation, and role-based access.
 */

export type AdminRole =
  | "Administrator"
  | "Operations Manager"
  | "Operations Executive"
  | "admin"
  | "operations"
  | "SUPER_ADMIN"
  | "OPERATIONS_MANAGER"
  | "SUPPORT_LEAD";

export type AccountStatus = "Active" | "Inactive" | "Pending" | "Suspended";
export type OrganizationStatus = "Active" | "Inactive" | "Pending" | "Suspended";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatarUrl: string;
  department: string;
  assignedZones: string[];
  permissions: string[];
  lastActive: string;
  onboardingCompleted: boolean;
  organizationId: string;
}

export interface AdminSession {
  isAuthenticated: boolean;
  token?: string;
  userId?: string;
  user: AdminUser | null;
  role: AdminRole | null;
  onboardingCompleted: boolean;
  expiresAt?: string;
  lastActive?: string;
}

export interface AdminLoginCredentials {
  email: string;
  password?: string;
  securityPin?: string;
  role?: AdminRole;
}

export type AdminOrganizationType = "washora" | "partner" | "internal-operations";
export type AdminRoleSelection = "administrator" | "operations-manager" | "operations-executive";
export type AdminPrimaryWorkArea =
  | "customer-operations"
  | "provider-operations"
  | "delivery-operations"
  | "platform-operations";
export type AdminPreferredLanguage = "english" | "tamil";

export interface AdminOnboardingData {
  userId: string;
  fullName: string;
  workEmail: string;
  phone: string;
  profileImage?: string;

  organizationName: string;
  organizationEmail: string;
  organizationPhone: string;
  organizationType: AdminOrganizationType;

  role: AdminRoleSelection;
  primaryWorkArea: AdminPrimaryWorkArea;
  preferredLanguage: AdminPreferredLanguage;
  timezone: string;
  currentStep?: number;
}

export interface AdminProfile {
  id: string; // stable account ID e.g. "ADM-0001"
  userId: string; // links to AdminUser.id e.g. "admin-001"
  organizationId: string; // links to Organization.id e.g. "ORG-0001"
  fullName: string;
  workEmail: string;
  phone: string;
  profileImage?: string;
  role: AdminRole;
  primaryWorkArea: AdminPrimaryWorkArea;
  preferredLanguage: AdminPreferredLanguage;
  timezone: string;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string; // stable organization ID e.g. "ORG-0001"
  name: string;
  email: string;
  phone: string;
  type: AdminOrganizationType;
  status: OrganizationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminNavigationItem {
  title: string;
  href: string;
  iconName: string;
  badge?: string;
  badgeVariant?: "default" | "success" | "warning" | "info";
  disabled?: boolean;
  section: "MAIN" | "PLATFORM_OPERATIONS" | "SYSTEM";
  phase?: string;
}

export interface AdminSystemStatusSummary {
  gatewayStatus: "OPERATIONAL" | "DEGRADED" | "MAINTENANCE";
  activeHubsCount: number;
  assignedDispatchersCount: number;
  activeValetsOnline: number;
  version: string;
  environment: "sandbox" | "staging" | "production";
}

export * from "./dashboard";
export * from "./customer";
export * from "./provider";
export * from "./deliveryPartner";
export * from "./booking";
export * from "./serviceCatalog";
export * from "./operations";
export * from "./payment";
export * from "./review";
export * from "./notification";
export * from "./support";
export * from "./analytics";
export * from "./settings";

