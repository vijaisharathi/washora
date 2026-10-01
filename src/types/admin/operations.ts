import { BookingOrder, BookingStatus } from "./booking";
import { Customer } from "./customer";
import { Provider } from "./provider";
import { DeliveryPartner } from "./deliveryPartner";
import { Service } from "./serviceCatalog";

/**
 * WASHORA ADMIN / OPERATIONS ASSIGNMENT & DISPATCH DOMAIN TYPES
 * Canonical data models, assignment lifecycle states, candidate eligibility models, and activity tracking.
 */

export const ASSIGNMENT_STATUSES = [
  "Unassigned",
  "Provider Assigned",
  "Ready for Service",
  "In Service",
  "Service Completed",
  "Delivery Assigned",
  "Completed",
  "Cancelled",
] as const;

export type AssignmentStatus = (typeof ASSIGNMENT_STATUSES)[number];

export type AssignmentType = "Provider" | "Delivery Partner";

export type WorkloadLevel = "Low" | "Medium" | "High";

export interface BookingAssignment {
  id: string; // e.g. "ASN-0001"
  organizationId: string; // e.g. "ORG-0001"
  bookingId: string; // references BookingOrder.id

  providerId?: string; // references Provider.id
  deliveryPartnerId?: string; // references DeliveryPartner.id

  providerAssignedAt?: string; // ISO date-time string
  deliveryPartnerAssignedAt?: string; // ISO date-time string

  status: AssignmentStatus;

  assignedBy?: string; // e.g. "admin-001" / "Operations Lead"

  createdAt: string; // ISO date-time string
  updatedAt: string; // ISO date-time string

  notes?: string;
}

export type AssignmentActivityType =
  | "provider_assigned"
  | "provider_reassigned"
  | "provider_unassigned"
  | "delivery_partner_assigned"
  | "delivery_partner_reassigned"
  | "delivery_partner_unassigned"
  | "assignment_marked_ready"
  | "operation_started"
  | "operation_completed"
  | "assignment_cancelled";

export interface AssignmentActivity {
  id: string;
  assignmentId: string;
  bookingId: string;
  type: AssignmentActivityType;
  timestamp: string; // ISO date-time
  performedBy: string;
  actorName?: string; // Alias for performedBy
  description: string;
  notes?: string; // Alias for description
  previousAssigneeId?: string;
  newAssigneeId?: string;
}

export type OperationalQueueTab =
  | "all"
  | "needs_assignment"
  | "provider_assigned"
  | "active_operations";

export const OPERATIONS_SORT_FIELDS = [
  "scheduledAt",
  "bookingNumber",
  "customer",
  "service",
  "provider",
  "deliveryPartner",
  "assignmentState",
  "createdAt",
  "updatedAt",
] as const;

export type OperationsSortField = (typeof OPERATIONS_SORT_FIELDS)[number];
export type OperationsSortDirection = "asc" | "desc";

export interface OperationsSummaryMetrics {
  needsAssignment: number;
  providerAssigned: number;
  deliveryPending: number;
  inProgress: number;
  completedToday: number;
  cancelledToday: number;
  total: number;
}

export interface OperationalBookingView {
  booking: BookingOrder;
  assignment: BookingAssignment;
  customer: Customer | null;
  provider: Provider | null;
  deliveryPartner: DeliveryPartner | null;
  service: Service | null;

  deliveryRequired: boolean;
  isDeliveryRequired: boolean; // Alias for UI components

  providerWorkload?: WorkloadLevel;
  deliveryWorkload?: WorkloadLevel;

  canAssignProvider: boolean;
  canReassignProvider: boolean;
  canUnassignProvider: boolean;

  canAssignDeliveryPartner: boolean;
  canReassignDeliveryPartner: boolean;
  canUnassignDeliveryPartner: boolean;

  activityCount?: number;
}

export interface CandidateProvider {
  provider: Provider;
  // Direct convenience properties
  id: string;
  name: string;
  rating: number;
  city: string;
  status: string;
  approvalStatus: string;
  serviceCategories: string[];
  areasServed: string[];

  activeBookingsCount: number;
  workload: WorkloadLevel;
  workloadLevel: WorkloadLevel; // Alias
  categoryMatch: boolean;
  cityMatch: boolean;
  areaMatch: boolean;
  isEligible: boolean;
  eligibilityReasons: string[];
}

export interface CandidateDeliveryPartner {
  deliveryPartner: DeliveryPartner;
  // Direct convenience properties
  id: string;
  name: string;
  rating: number;
  city: string;
  status: string;
  approvalStatus: string;
  vehicleType: string;
  vehicleNumber: string;
  phone: string;
  serviceAreas: string[];

  activeDeliveriesCount: number;
  workload: WorkloadLevel;
  workloadLevel: WorkloadLevel; // Alias
  cityMatch: boolean;
  areaMatch: boolean;
  isEligible: boolean;
  eligibilityReasons: string[];
}

export interface ListOperationsParams {
  organizationId: string;
  queueTab?: OperationalQueueTab;
  tab?: OperationalQueueTab; // URL query alias
  search?: string;
  assignmentStatus?: AssignmentStatus | "all" | "Delivery Pending";
  asnStatus?: AssignmentStatus | "all" | "Delivery Pending"; // URL query alias
  bookingStatus?: BookingStatus | "all";
  bkgStatus?: BookingStatus | "all"; // URL query alias
  category?: string | "all";
  city?: string | "all";
  providerId?: string | "all";
  deliveryPartnerId?: string | "all";
  date?: "all" | "today" | "tomorrow" | "next_7_days" | "past_7_days" | "past_30_days";
  sort?: OperationsSortField;
  sortBy?: OperationsSortField; // URL query alias
  sortDirection?: OperationsSortDirection;
  sortDir?: OperationsSortDirection; // URL query alias
  page?: number;
  pageSize?: number;
}

export interface ListOperationsResult {
  items: OperationalBookingView[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  metrics: OperationsSummaryMetrics;
}

/**
 * Check if a booking requires delivery partner coordination.
 * Deterministic rule: required exclusively for "Laundry" and "Appliance Cleaning".
 */
export function isDeliveryCoordinationRequired(serviceCategory: string): boolean {
  const normalized = serviceCategory.trim().toLowerCase();
  return (
    normalized === "laundry" ||
    normalized === "appliance cleaning" ||
    normalized === "wash & fold" ||
    normalized === "dry clean"
  );
}

/**
 * Determine workload level from active booking/delivery counts:
 * 0–2 = Low, 3–5 = Medium, 6+ = High.
 */
export function calculateWorkloadLevel(activeCount: number): WorkloadLevel {
  if (activeCount <= 2) return "Low";
  if (activeCount <= 5) return "Medium";
  return "High";
}
