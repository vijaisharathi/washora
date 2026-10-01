import {
  BookingAssignment,
  AssignmentStatus,
  AssignmentActivity,
  isDeliveryCoordinationRequired,
} from "@/types/admin/operations";
import {
  INITIAL_ORG_0001_BOOKINGS,
  INITIAL_ORG_0002_BOOKINGS,
  updateMockBookingInStore,
  getMockBookingsByOrg,
} from "./booking.mock";

/**
 * DETERMINISTIC MOCK REPOSITORY FOR WASHORA ASSIGNMENTS & OPERATIONS
 * Scoped strictly by Organization ID.
 * ORG-0001: Maps to all 35 canonical bookings (ASN-0001 to ASN-0035)
 * ORG-0002: Maps to all 18 canonical bookings (ASN-2001 to ASN-2018)
 */

function generateInitialAssignments(): {
  org1: BookingAssignment[];
  org2: BookingAssignment[];
  activities: Record<string, AssignmentActivity[]>;
} {
  const activities: Record<string, AssignmentActivity[]> = {};

  // Delivery partner pools for deterministic assignment
  const org1DeliveryPool = ["DLP-0001", "DLP-0002", "DLP-0003", "DLP-0004", "DLP-0005"];
  const org2DeliveryPool = ["DLP-2001", "DLP-2002", "DLP-2003"];

  const org1: BookingAssignment[] = INITIAL_ORG_0001_BOOKINGS.map((bkg, idx) => {
    const asnId = `ASN-${String(idx + 1).padStart(4, "0")}`;
    const deliveryReq = isDeliveryCoordinationRequired(bkg.serviceCategory);

    let status: AssignmentStatus = "Unassigned";
    let providerId: string | undefined = undefined;
    let deliveryPartnerId: string | undefined = undefined;
    let providerAssignedAt: string | undefined = undefined;
    let deliveryPartnerAssignedAt: string | undefined = undefined;

    const bkgActivities: AssignmentActivity[] = [];

    // Deterministic distribution based on booking status & index
    if (bkg.status === "pending") {
      status = "Unassigned";
    } else if (bkg.status === "cancelled") {
      status = "Cancelled";
      providerId = bkg.providerId || "PRO-0001";
      providerAssignedAt = bkg.createdAt;
      bkgActivities.push({
        id: `ACT-ASN-${bkg.id}-01`,
        assignmentId: asnId,
        bookingId: bkg.id,
        type: "assignment_cancelled",
        timestamp: bkg.updatedAt,
        performedBy: "Operations Administrator",
        description: "Booking cancelled prior to service dispatch.",
      });
    } else if (bkg.status === "completed") {
      status = "Completed";
      providerId = bkg.providerId;
      providerAssignedAt = bkg.createdAt;
      if (deliveryReq) {
        deliveryPartnerId = org1DeliveryPool[idx % org1DeliveryPool.length];
        deliveryPartnerAssignedAt = bkg.createdAt;
      }
      bkgActivities.push({
        id: `ACT-ASN-${bkg.id}-01`,
        assignmentId: asnId,
        bookingId: bkg.id,
        type: "operation_completed",
        timestamp: bkg.updatedAt,
        performedBy: "Operations Dispatch",
        description: "Service completed and verified.",
      });
    } else if (bkg.status === "in_progress") {
      status = "In Service";
      providerId = bkg.providerId;
      providerAssignedAt = bkg.createdAt;
      if (deliveryReq) {
        deliveryPartnerId = org1DeliveryPool[idx % org1DeliveryPool.length];
        deliveryPartnerAssignedAt = bkg.createdAt;
      }
      bkgActivities.push({
        id: `ACT-ASN-${bkg.id}-01`,
        assignmentId: asnId,
        bookingId: bkg.id,
        type: "operation_started",
        timestamp: bkg.updatedAt,
        performedBy: "Operations Dispatch",
        description: "Partner began processing service order.",
      });
    } else if (bkg.status === "confirmed") {
      // Create rich operational variation for confirmed bookings
      if (idx % 3 === 0) {
        // Needs Assignment: no provider assigned
        status = "Unassigned";
        providerId = undefined;
      } else if (idx % 3 === 1) {
        // Provider Assigned, but if delivery required and not assigned => Delivery Pending
        providerId = bkg.providerId || "PRO-0001";
        providerAssignedAt = bkg.updatedAt;
        if (deliveryReq) {
          status = "Provider Assigned"; // Needs delivery partner
          deliveryPartnerId = undefined;
        } else {
          status = "Ready for Service"; // No delivery needed
        }
        bkgActivities.push({
          id: `ACT-ASN-${bkg.id}-01`,
          assignmentId: asnId,
          bookingId: bkg.id,
          type: "provider_assigned",
          timestamp: bkg.updatedAt,
          performedBy: "Operations Lead",
          description: `Assigned primary service provider ${providerId}`,
          newAssigneeId: providerId,
        });
      } else {
        // Ready for Service: provider + delivery partner (if required)
        providerId = bkg.providerId || "PRO-0002";
        providerAssignedAt = bkg.updatedAt;
        if (deliveryReq) {
          deliveryPartnerId = org1DeliveryPool[idx % org1DeliveryPool.length];
          deliveryPartnerAssignedAt = bkg.updatedAt;
        }
        status = "Ready for Service";
        bkgActivities.push({
          id: `ACT-ASN-${bkg.id}-01`,
          assignmentId: asnId,
          bookingId: bkg.id,
          type: "assignment_marked_ready",
          timestamp: bkg.updatedAt,
          performedBy: "Operations Lead",
          description: "All resources assigned. Booking marked Ready for Service.",
        });
      }
    }

    activities[bkg.id] = bkgActivities;

    return {
      id: asnId,
      organizationId: "ORG-0001",
      bookingId: bkg.id,
      providerId,
      deliveryPartnerId,
      providerAssignedAt,
      deliveryPartnerAssignedAt,
      status,
      assignedBy: providerId ? "Operations Lead" : undefined,
      createdAt: bkg.createdAt,
      updatedAt: bkg.updatedAt,
      notes: bkg.customerNotes,
    };
  });

  const org2: BookingAssignment[] = INITIAL_ORG_0002_BOOKINGS.map((bkg, idx) => {
    const asnId = `ASN-${String(2001 + idx)}`;
    const deliveryReq = isDeliveryCoordinationRequired(bkg.serviceCategory);

    let status: AssignmentStatus = "Unassigned";
    let providerId: string | undefined = undefined;
    let deliveryPartnerId: string | undefined = undefined;
    let providerAssignedAt: string | undefined = undefined;
    let deliveryPartnerAssignedAt: string | undefined = undefined;

    const bkgActivities: AssignmentActivity[] = [];

    if (bkg.status === "completed") {
      status = "Completed";
      providerId = bkg.providerId;
      providerAssignedAt = bkg.createdAt;
      if (deliveryReq) {
        deliveryPartnerId = org2DeliveryPool[idx % org2DeliveryPool.length];
        deliveryPartnerAssignedAt = bkg.createdAt;
      }
    } else if (bkg.status === "in_progress") {
      status = "In Service";
      providerId = bkg.providerId;
      providerAssignedAt = bkg.createdAt;
      if (deliveryReq) {
        deliveryPartnerId = org2DeliveryPool[idx % org2DeliveryPool.length];
        deliveryPartnerAssignedAt = bkg.createdAt;
      }
    } else if (bkg.status === "cancelled") {
      status = "Cancelled";
      providerId = bkg.providerId;
    } else if (bkg.status === "confirmed") {
      if (idx % 2 === 0) {
        status = "Unassigned";
      } else {
        providerId = bkg.providerId;
        providerAssignedAt = bkg.updatedAt;
        if (deliveryReq) {
          status = "Provider Assigned";
        } else {
          status = "Ready for Service";
        }
      }
    }

    activities[bkg.id] = bkgActivities;

    return {
      id: asnId,
      organizationId: "ORG-0002",
      bookingId: bkg.id,
      providerId,
      deliveryPartnerId,
      providerAssignedAt,
      deliveryPartnerAssignedAt,
      status,
      assignedBy: providerId ? "Operations Lead" : undefined,
      createdAt: bkg.createdAt,
      updatedAt: bkg.updatedAt,
      notes: bkg.customerNotes,
    };
  });

  return { org1, org2, activities };
}

const INITIAL_DATA = generateInitialAssignments();

let org0001AssignmentsStore: BookingAssignment[] = JSON.parse(
  JSON.stringify(INITIAL_DATA.org1)
);
let org0002AssignmentsStore: BookingAssignment[] = JSON.parse(
  JSON.stringify(INITIAL_DATA.org2)
);
let assignmentActivitiesStore: Record<string, AssignmentActivity[]> = JSON.parse(
  JSON.stringify(INITIAL_DATA.activities)
);

export function getMockAssignmentsByOrg(
  organizationId: string = "ORG-0001"
): BookingAssignment[] {
  if (organizationId === "ORG-0002") {
    return org0002AssignmentsStore;
  }
  return org0001AssignmentsStore;
}

export function getMockAssignmentByBookingId(
  organizationId: string,
  bookingId: string
): BookingAssignment | null {
  const store = getMockAssignmentsByOrg(organizationId);
  const found = store.find((a) => a.bookingId === bookingId);
  if (!found) return null;
  return JSON.parse(JSON.stringify(found));
}

export function getMockAssignmentActivities(
  bookingId: string
): AssignmentActivity[] {
  return assignmentActivitiesStore[bookingId] || [];
}

export function addMockAssignmentActivity(activity: AssignmentActivity): void {
  if (!assignmentActivitiesStore[activity.bookingId]) {
    assignmentActivitiesStore[activity.bookingId] = [];
  }
  assignmentActivitiesStore[activity.bookingId].unshift(activity);
}

/**
 * Assign a provider to a booking assignment.
 */
export function assignProviderInStore(
  organizationId: string,
  bookingId: string,
  providerId: string,
  assignedBy: string = "Admin Operations",
  notes?: string
): BookingAssignment {
  const store =
    organizationId === "ORG-0002"
      ? org0002AssignmentsStore
      : org0001AssignmentsStore;

  const index = store.findIndex((a) => a.bookingId === bookingId);
  if (index === -1) {
    throw new Error(`Assignment not found for booking ${bookingId}`);
  }

  const assignment = store[index];
  const now = new Date().toISOString();

  // Determine new assignment status
  let newStatus: AssignmentStatus = "Provider Assigned";
  // If delivery partner is already assigned or not required, mark Ready for Service
  if (assignment.deliveryPartnerId) {
    newStatus = "Ready for Service";
  }

  const updated: BookingAssignment = {
    ...assignment,
    providerId,
    providerAssignedAt: now,
    status: newStatus,
    assignedBy,
    updatedAt: now,
    notes: notes || assignment.notes,
  };

  store[index] = updated;

  // Add activity
  addMockAssignmentActivity({
    id: `ACT-ASN-${bookingId}-${Date.now()}`,
    assignmentId: assignment.id,
    bookingId,
    type: "provider_assigned",
    timestamp: now,
    performedBy: assignedBy,
    actorName: assignedBy,
    description: notes || `Assigned provider ${providerId}`,
    notes: notes || `Assigned provider ${providerId}`,
    newAssigneeId: providerId,
  });

  // Sync BookingOrder.providerId in booking store
  try {
    const bkg = getMockBookingsByOrg(organizationId).find((b) => b.id === bookingId);
    if (bkg) {
      updateMockBookingInStore(organizationId, {
        ...bkg,
        providerId,
        lastUpdatedBy: assignedBy,
      });
    }
  } catch {
    // Ignore if not loaded
  }

  return JSON.parse(JSON.stringify(updated));
}

/**
 * Reassign a provider to a booking assignment.
 */
export function reassignProviderInStore(
  organizationId: string,
  bookingId: string,
  newProviderId: string,
  assignedBy: string = "Admin Operations",
  notes?: string
): BookingAssignment {
  const store =
    organizationId === "ORG-0002"
      ? org0002AssignmentsStore
      : org0001AssignmentsStore;

  const index = store.findIndex((a) => a.bookingId === bookingId);
  if (index === -1) {
    throw new Error(`Assignment not found for booking ${bookingId}`);
  }

  const assignment = store[index];
  const oldProviderId = assignment.providerId;
  const now = new Date().toISOString();

  const updated: BookingAssignment = {
    ...assignment,
    providerId: newProviderId,
    providerAssignedAt: now,
    assignedBy,
    updatedAt: now,
    notes: notes || assignment.notes,
  };

  store[index] = updated;

  // Add activity
  addMockAssignmentActivity({
    id: `ACT-ASN-${bookingId}-${Date.now()}`,
    assignmentId: assignment.id,
    bookingId,
    type: "provider_reassigned",
    timestamp: now,
    performedBy: assignedBy,
    actorName: assignedBy,
    description: notes || `Reassigned provider from ${oldProviderId || "Unassigned"} to ${newProviderId}`,
    notes: notes || `Reassigned provider from ${oldProviderId || "Unassigned"} to ${newProviderId}`,
    previousAssigneeId: oldProviderId,
    newAssigneeId: newProviderId,
  });

  // Sync BookingOrder.providerId
  try {
    const bkg = getMockBookingsByOrg(organizationId).find((b) => b.id === bookingId);
    if (bkg) {
      updateMockBookingInStore(organizationId, {
        ...bkg,
        providerId: newProviderId,
        lastUpdatedBy: assignedBy,
      });
    }
  } catch {
    // Ignore if not loaded
  }

  return JSON.parse(JSON.stringify(updated));
}

/**
 * Unassign a provider from a booking assignment.
 */
export function unassignProviderInStore(
  organizationId: string,
  bookingId: string,
  assignedBy: string = "Admin Operations",
  notes?: string
): BookingAssignment {
  const store =
    organizationId === "ORG-0002"
      ? org0002AssignmentsStore
      : org0001AssignmentsStore;

  const index = store.findIndex((a) => a.bookingId === bookingId);
  if (index === -1) {
    throw new Error(`Assignment not found for booking ${bookingId}`);
  }

  const assignment = store[index];
  const oldProviderId = assignment.providerId;
  const now = new Date().toISOString();

  const updated: BookingAssignment = {
    ...assignment,
    providerId: undefined,
    providerAssignedAt: undefined,
    status: "Unassigned",
    assignedBy,
    updatedAt: now,
    notes: notes || assignment.notes,
  };

  store[index] = updated;

  addMockAssignmentActivity({
    id: `ACT-ASN-${bookingId}-${Date.now()}`,
    assignmentId: assignment.id,
    bookingId,
    type: "provider_unassigned",
    timestamp: now,
    performedBy: assignedBy,
    actorName: assignedBy,
    description: notes || `Unassigned provider ${oldProviderId || "N/A"}`,
    notes: notes || `Unassigned provider ${oldProviderId || "N/A"}`,
    previousAssigneeId: oldProviderId,
  });

  // Clear BookingOrder.providerId
  try {
    const bkg = getMockBookingsByOrg(organizationId).find((b) => b.id === bookingId);
    if (bkg) {
      updateMockBookingInStore(organizationId, {
        ...bkg,
        providerId: "",
        lastUpdatedBy: assignedBy,
      });
    }
  } catch {
    // Ignore if not loaded
  }

  return JSON.parse(JSON.stringify(updated));
}

/**
 * Assign a delivery partner to a booking assignment.
 */
export function assignDeliveryPartnerInStore(
  organizationId: string,
  bookingId: string,
  deliveryPartnerId: string,
  assignedBy: string = "Admin Operations",
  notes?: string
): BookingAssignment {
  const store =
    organizationId === "ORG-0002"
      ? org0002AssignmentsStore
      : org0001AssignmentsStore;

  const index = store.findIndex((a) => a.bookingId === bookingId);
  if (index === -1) {
    throw new Error(`Assignment not found for booking ${bookingId}`);
  }

  const assignment = store[index];
  const now = new Date().toISOString();

  let newStatus: AssignmentStatus = "Delivery Assigned";
  if (assignment.providerId) {
    newStatus = "Ready for Service";
  }

  const updated: BookingAssignment = {
    ...assignment,
    deliveryPartnerId,
    deliveryPartnerAssignedAt: now,
    status: newStatus,
    assignedBy,
    updatedAt: now,
    notes: notes || assignment.notes,
  };

  store[index] = updated;

  addMockAssignmentActivity({
    id: `ACT-ASN-${bookingId}-${Date.now()}`,
    assignmentId: assignment.id,
    bookingId,
    type: "delivery_partner_assigned",
    timestamp: now,
    performedBy: assignedBy,
    actorName: assignedBy,
    description: notes || `Assigned delivery partner ${deliveryPartnerId}`,
    notes: notes || `Assigned delivery partner ${deliveryPartnerId}`,
    newAssigneeId: deliveryPartnerId,
  });

  return JSON.parse(JSON.stringify(updated));
}

/**
 * Reassign a delivery partner to a booking assignment.
 */
export function reassignDeliveryPartnerInStore(
  organizationId: string,
  bookingId: string,
  newDeliveryPartnerId: string,
  assignedBy: string = "Admin Operations",
  notes?: string
): BookingAssignment {
  const store =
    organizationId === "ORG-0002"
      ? org0002AssignmentsStore
      : org0001AssignmentsStore;

  const index = store.findIndex((a) => a.bookingId === bookingId);
  if (index === -1) {
    throw new Error(`Assignment not found for booking ${bookingId}`);
  }

  const assignment = store[index];
  const oldPartnerId = assignment.deliveryPartnerId;
  const now = new Date().toISOString();

  const updated: BookingAssignment = {
    ...assignment,
    deliveryPartnerId: newDeliveryPartnerId,
    deliveryPartnerAssignedAt: now,
    assignedBy,
    updatedAt: now,
    notes: notes || assignment.notes,
  };

  store[index] = updated;

  addMockAssignmentActivity({
    id: `ACT-ASN-${bookingId}-${Date.now()}`,
    assignmentId: assignment.id,
    bookingId,
    type: "delivery_partner_reassigned",
    timestamp: now,
    performedBy: assignedBy,
    actorName: assignedBy,
    description: notes || `Reassigned delivery partner from ${oldPartnerId || "Unassigned"} to ${newDeliveryPartnerId}`,
    notes: notes || `Reassigned delivery partner from ${oldPartnerId || "Unassigned"} to ${newDeliveryPartnerId}`,
    previousAssigneeId: oldPartnerId,
    newAssigneeId: newDeliveryPartnerId,
  });

  return JSON.parse(JSON.stringify(updated));
}

/**
 * Unassign a delivery partner from a booking assignment.
 */
export function unassignDeliveryPartnerInStore(
  organizationId: string,
  bookingId: string,
  assignedBy: string = "Admin Operations",
  notes?: string
): BookingAssignment {
  const store =
    organizationId === "ORG-0002"
      ? org0002AssignmentsStore
      : org0001AssignmentsStore;

  const index = store.findIndex((a) => a.bookingId === bookingId);
  if (index === -1) {
    throw new Error(`Assignment not found for booking ${bookingId}`);
  }

  const assignment = store[index];
  const oldPartnerId = assignment.deliveryPartnerId;
  const now = new Date().toISOString();

  let newStatus: AssignmentStatus = "Unassigned";
  if (assignment.providerId) {
    newStatus = "Provider Assigned";
  }

  const updated: BookingAssignment = {
    ...assignment,
    deliveryPartnerId: undefined,
    deliveryPartnerAssignedAt: undefined,
    status: newStatus,
    assignedBy,
    updatedAt: now,
    notes: notes || assignment.notes,
  };

  store[index] = updated;

  addMockAssignmentActivity({
    id: `ACT-ASN-${bookingId}-${Date.now()}`,
    assignmentId: assignment.id,
    bookingId,
    type: "delivery_partner_unassigned",
    timestamp: now,
    performedBy: assignedBy,
    actorName: assignedBy,
    description: notes || `Unassigned delivery partner ${oldPartnerId || "N/A"}`,
    notes: notes || `Unassigned delivery partner ${oldPartnerId || "N/A"}`,
    previousAssigneeId: oldPartnerId,
  });

  return JSON.parse(JSON.stringify(updated));
}

/**
 * Reset mock stores for test isolation.
 */
export function resetMockOperationsStores(): void {
  const fresh = generateInitialAssignments();
  org0001AssignmentsStore = JSON.parse(JSON.stringify(fresh.org1));
  org0002AssignmentsStore = JSON.parse(JSON.stringify(fresh.org2));
  assignmentActivitiesStore = JSON.parse(JSON.stringify(fresh.activities));
}
