import { z } from "zod";
import {
  NotificationPreferences,
  NotificationPreferencesSchema,
} from "./notification";

export type { NotificationPreferences };
export { NotificationPreferencesSchema };

/**
 * Canonical Admin Roles
 */
export type CanonicalAdminRole =
  | "Administrator"
  | "Operations Manager"
  | "Operations Executive";

export type AdminRole = CanonicalAdminRole;

/**
 * Primary Work Area
 */
export type PrimaryWorkArea =
  | "Customer Operations"
  | "Provider Operations"
  | "Delivery Operations"
  | "Platform Operations";

/**
 * Account Status
 */
export type AccountStatus = "Active" | "Inactive" | "Pending" | "Suspended";

/**
 * Preferred Language & Timezone
 */
export type PreferredLanguage = "English" | "Tamil";
export type TimeZone = "Asia/Kolkata";
export type DateFormatOption = "DD/MM/YYYY" | "MM/DD/YYYY";
export type TimeFormatOption = "12-hour" | "24-hour";

/**
 * Canonical Admin Account
 */
export interface AdminAccount {
  id: string;
  organizationId: string;
  fullName: string;
  email: string;
  phone: string;
  profileImage?: string;
  role: CanonicalAdminRole;
  primaryWorkArea: PrimaryWorkArea;
  preferredLanguage: PreferredLanguage;
  timezone: TimeZone;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

/**
 * System & Formatting Preferences
 */
export interface SystemPreferences {
  userId: string;
  preferredLanguage: PreferredLanguage;
  timezone: TimeZone;
  dateFormat: DateFormatOption;
  timeFormat: TimeFormatOption;
  updatedAt: string;
}

/**
 * Active Mock Admin Session
 */
export interface AdminSessionRecord {
  id: string;
  userId: string;
  organizationId: string;
  deviceName: string;
  browser: string;
  lastActiveAt: string;
  ipAddressMasked: string;
  isCurrent: boolean;
  status: "Active" | "Expired";
}

/**
 * Organization Settings
 */
export interface OrganizationSettings {
  organizationId: string;
  organizationName: string;
  organizationEmail: string;
  organizationPhone: string;
  organizationType:
    | "WASHORA"
    | "Partner Organization"
    | "Internal Operations";
  organizationStatus: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Organization Member
 */
export interface OrganizationMember {
  id: string;
  organizationId: string;
  fullName: string;
  email: string;
  phone: string;
  role: CanonicalAdminRole;
  primaryWorkArea: PrimaryWorkArea;
  status: AccountStatus;
  joinedAt: string;
  lastActiveAt?: string;
}

/**
 * Permission Definition
 */
export interface PermissionDefinition {
  id: string;
  label: string;
  category:
    | "Core & Dashboard"
    | "Customer Management"
    | "Provider Management"
    | "Delivery Logistics"
    | "Bookings & Orders"
    | "Services & Catalog"
    | "Operations & Dispatch"
    | "Financials & Payments"
    | "Quality & Moderation"
    | "Communications"
    | "Support & Disputes"
    | "Reports & BI"
    | "Governance & Settings";
  description: string;
}

/**
 * Role Permission Set
 */
export interface RolePermissionSet {
  role: CanonicalAdminRole;
  description: string;
  permissions: string[];
}

/**
 * All 28 Canonical Typed Permissions
 */
export const ALL_ADMIN_PERMISSIONS: PermissionDefinition[] = [
  // Core & Dashboard
  {
    id: "View Dashboard",
    label: "View Dashboard",
    category: "Core & Dashboard",
    description: "Access executive operations dashboard and core performance KPIs",
  },
  // Customer Management
  {
    id: "View Customers",
    label: "View Customers",
    category: "Customer Management",
    description: "Browse registered customer directory and view profiles",
  },
  {
    id: "Manage Customers",
    label: "Manage Customers",
    category: "Customer Management",
    description: "Edit customer status, manage loyalty credits and tags",
  },
  // Provider Management
  {
    id: "View Providers",
    label: "View Providers",
    category: "Provider Management",
    description: "Browse facility partners and view capacity metrics",
  },
  {
    id: "Manage Providers",
    label: "Manage Providers",
    category: "Provider Management",
    description: "Approve/reject KYC applications and edit provider profiles",
  },
  // Delivery Logistics
  {
    id: "View Delivery Partners",
    label: "View Delivery Partners",
    category: "Delivery Logistics",
    description: "View delivery courier fleet and active duty status",
  },
  {
    id: "Manage Delivery Partners",
    label: "Manage Delivery Partners",
    category: "Delivery Logistics",
    description: "Approve valet onboarding and manage fleet status",
  },
  // Bookings & Orders
  {
    id: "View Bookings",
    label: "View Bookings",
    category: "Bookings & Orders",
    description: "View customer orders and track fulfillment progress",
  },
  {
    id: "Manage Bookings",
    label: "Manage Bookings",
    category: "Bookings & Orders",
    description: "Cancel orders, modify schedules, and update order statuses",
  },
  // Services & Catalog
  {
    id: "View Services",
    label: "View Services",
    category: "Services & Catalog",
    description: "Browse marketplace service offerings and pricing tiers",
  },
  {
    id: "Manage Services",
    label: "Manage Services",
    category: "Services & Catalog",
    description: "Create, edit, pause, and archive catalog services",
  },
  // Operations & Dispatch
  {
    id: "View Operations",
    label: "View Operations",
    category: "Operations & Dispatch",
    description: "Monitor live facility workloads and courier dispatch queues",
  },
  {
    id: "Manage Assignments",
    label: "Manage Assignments",
    category: "Operations & Dispatch",
    description: "Manually reassign facilities and override courier dispatches",
  },
  // Financials & Payments
  {
    id: "View Payments",
    label: "View Payments",
    category: "Financials & Payments",
    description: "View transaction ledgers, provider payouts, and valet earnings",
  },
  {
    id: "Manage Refunds",
    label: "Manage Refunds",
    category: "Financials & Payments",
    description: "Initiate and approve customer refunds and settlement adjustments",
  },
  // Quality & Moderation
  {
    id: "View Reviews",
    label: "View Reviews",
    category: "Quality & Moderation",
    description: "Browse customer service reviews and facility ratings",
  },
  {
    id: "Moderate Reviews",
    label: "Moderate Reviews",
    category: "Quality & Moderation",
    description: "Flag, hide, restore, and add moderation notes to reviews",
  },
  // Communications
  {
    id: "View Notifications",
    label: "View Notifications",
    category: "Communications",
    description: "Read platform alerts and dispatch announcements",
  },
  {
    id: "Manage Communications",
    label: "Manage Communications",
    category: "Communications",
    description: "Compose internal broadcasts and manage operational drafts",
  },
  // Support & Disputes
  {
    id: "View Support",
    label: "View Support",
    category: "Support & Disputes",
    description: "View customer and partner customer support tickets",
  },
  {
    id: "Manage Support",
    label: "Manage Support",
    category: "Support & Disputes",
    description: "Assign tickets, update ticket statuses, and resolve issues",
  },
  {
    id: "View Disputes",
    label: "View Disputes",
    category: "Support & Disputes",
    description: "Review escalated order disputes and audit evidence files",
  },
  {
    id: "Manage Disputes",
    label: "Manage Disputes",
    category: "Support & Disputes",
    description: "Record binding arbitration decisions and issue dispute remedies",
  },
  // Reports & BI
  {
    id: "View Reports",
    label: "View Reports",
    category: "Reports & BI",
    description: "Analyze financial revenue, booking volumes, and operational analytics",
  },
  // Governance & Settings
  {
    id: "Manage Organization",
    label: "Manage Organization",
    category: "Governance & Settings",
    description: "Edit legal organization profile and business contact details",
  },
  {
    id: "Manage Members",
    label: "Manage Members",
    category: "Governance & Settings",
    description: "Invite new admin personnel and manage staff access status",
  },
  {
    id: "Manage Roles",
    label: "Manage Roles",
    category: "Governance & Settings",
    description: "Inspect enterprise role permission matrix and assignments",
  },
  {
    id: "Manage Account Settings",
    label: "Manage Account Settings",
    category: "Governance & Settings",
    description: "Update personal admin profile, timezone, and security credentials",
  },
];

/* -------------------------------------------------------------------------- */
/*                                ZOD SCHEMAS                                 */
/* -------------------------------------------------------------------------- */

export const AccountSettingsSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters.")
    .max(80, "Full name cannot exceed 80 characters."),
  email: z
    .string()
    .email("Enter a valid email address.")
    .min(1, "Email is required."),
  phone: z
    .string()
    .min(1, "Phone number is required.")
    .regex(
      /^(?:\+91|91)?[6-9]\d{9}$/,
      "Enter a valid 10-digit Indian mobile number."
    ),
  primaryWorkArea: z.enum([
    "Customer Operations",
    "Provider Operations",
    "Delivery Operations",
    "Platform Operations",
  ], {
    required_error: "Primary work area is required.",
  }),
  preferredLanguage: z.enum(["English", "Tamil"]),
  timezone: z.literal("Asia/Kolkata"),
});

export type AccountSettingsFormData = z.infer<typeof AccountSettingsSchema>;

export const PreferencesSettingsSchema = z.object({
  preferredLanguage: z.enum(["English", "Tamil"]),
  timezone: z.literal("Asia/Kolkata"),
  dateFormat: z.enum(["DD/MM/YYYY", "MM/DD/YYYY"]),
  timeFormat: z.enum(["12-hour", "24-hour"]),
});

export type PreferencesSettingsFormData = z.infer<typeof PreferencesSettingsSchema>;

export type NotificationPreferencesFormData = z.infer<typeof NotificationPreferencesSchema>;

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters.")
      .regex(/[A-Z]/, "New password must contain at least one uppercase letter.")
      .regex(/[a-z]/, "New password must contain at least one lowercase letter.")
      .regex(/[0-9]/, "New password must contain at least one number."),
    confirmPassword: z.string().min(1, "Confirm password is required."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type ChangePasswordFormData = z.infer<typeof ChangePasswordSchema>;

export const OrganizationSettingsSchema = z.object({
  organizationName: z
    .string()
    .min(2, "Organization name must be at least 2 characters.")
    .max(120, "Organization name cannot exceed 120 characters."),
  organizationEmail: z
    .string()
    .email("Enter a valid organization email address.")
    .min(1, "Organization email is required."),
  organizationPhone: z
    .string()
    .min(1, "Organization phone is required.")
    .regex(
      /^(?:\+91|91)?[6-9]\d{9}$|^[0-9\s\-+()]{7,15}$/,
      "Enter a valid organization phone number."
    ),
  organizationType: z.enum([
    "WASHORA",
    "Partner Organization",
    "Internal Operations",
  ], {
    required_error: "Organization type is required.",
  }),
});

export type OrganizationSettingsFormData = z.infer<typeof OrganizationSettingsSchema>;

export const AddMemberSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters.")
    .max(80, "Full name cannot exceed 80 characters."),
  email: z
    .string()
    .email("Enter a valid email address.")
    .min(1, "Email is required."),
  phone: z
    .string()
    .min(1, "Phone number is required.")
    .regex(
      /^(?:\+91|91)?[6-9]\d{9}$/,
      "Enter a valid 10-digit Indian mobile number."
    ),
  role: z.enum([
    "Administrator",
    "Operations Manager",
    "Operations Executive",
  ], {
    required_error: "Role is required.",
  }),
  primaryWorkArea: z.enum([
    "Customer Operations",
    "Provider Operations",
    "Delivery Operations",
    "Platform Operations",
  ], {
    required_error: "Primary work area is required.",
  }),
  status: z.enum(["Active", "Inactive", "Pending", "Suspended"]).default("Pending"),
});

export type AddMemberFormData = z.infer<typeof AddMemberSchema>;

export const EditMemberSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters.")
    .max(80, "Full name cannot exceed 80 characters."),
  email: z
    .string()
    .email("Enter a valid email address.")
    .min(1, "Email is required."),
  phone: z
    .string()
    .min(1, "Phone number is required.")
    .regex(
      /^(?:\+91|91)?[6-9]\d{9}$/,
      "Enter a valid 10-digit Indian mobile number."
    ),
  role: z.enum([
    "Administrator",
    "Operations Manager",
    "Operations Executive",
  ]),
  primaryWorkArea: z.enum([
    "Customer Operations",
    "Provider Operations",
    "Delivery Operations",
    "Platform Operations",
  ]),
  status: z.enum(["Active", "Inactive", "Pending", "Suspended"]),
});

export type EditMemberFormData = z.infer<typeof EditMemberSchema>;
