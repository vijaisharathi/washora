import {
  SupportTicket,
  SupportStatus,
  SupportPriority,
  SupportCategory,
  SupportRequesterType,
  SupportNote,
  SupportActivity,
  Dispute,
  DisputeStatus,
  DisputeType,
  DisputeOutcome,
  DisputeEvidence,
  DisputeActivity,
  AssigneeOption,
  SupportSummaryMetrics,
  DisputeSummaryMetrics,
  ListSupportTicketsParams,
  ListSupportTicketsResult,
  SupportTicketDetailResult,
  ListDisputesParams,
  ListDisputesResult,
  DisputeDetailResult,
  CreateSupportTicketFormValues,
} from "@/types/admin/support";
import {
  getMockSupportTickets,
  getMockDisputes,
  getMockSupportNotes,
  getMockSupportActivities,
  getMockDisputeEvidence,
  getMockDisputeActivities,
  getEligibleAssigneesWithWorkload,
  createSupportTicketInStore,
  updateSupportTicketStatusInStore,
  assignSupportTicketInStore,
  unassignSupportTicketInStore,
  updateSupportPriorityInStore,
  addSupportNoteInStore,
  updateDisputeStatusInStore,
  assignDisputeInStore,
  unassignDisputeInStore,
  recordDisputeDecisionInStore,
  addDisputeEvidenceInStore,
  MOCK_ORG_0001_AGENTS,
  MOCK_ORG_0002_AGENTS,
} from "@/mocks/admin/support.mock";
import { INITIAL_ORG_0001_CUSTOMERS, INITIAL_ORG_0002_CUSTOMERS } from "@/mocks/admin/customer.mock";
import { INITIAL_ORG_0001_PROVIDERS, INITIAL_ORG_0002_PROVIDERS } from "@/mocks/admin/provider.mock";
import { INITIAL_ORG_0001_DELIVERY_PARTNERS, INITIAL_ORG_0002_DELIVERY_PARTNERS } from "@/mocks/admin/deliveryPartner.mock";
import { INITIAL_ORG_0001_BOOKINGS, INITIAL_ORG_0002_BOOKINGS } from "@/mocks/admin/booking.mock";
import { INITIAL_ORG_0001_PAYMENTS, INITIAL_ORG_0002_PAYMENTS, INITIAL_ORG_0001_TRANSACTIONS, INITIAL_ORG_0002_TRANSACTIONS } from "@/mocks/admin/payment.mock";
import { INITIAL_ORG_0001_REVIEWS, INITIAL_ORG_0002_REVIEWS } from "@/mocks/admin/review.mock";
import { createMockNotificationInStore } from "@/mocks/admin/notification.mock";
import { isLiveMode } from "@/lib/api/mode";
import { adminApi } from "@/features/admin/api/adminApi";

function mapBackendTicketToTicket(t: any): SupportTicket {
  return {
    id: t.id,
    organizationId: t.organizationId || "ORG-0001",
    ticketNumber: t.ticketNumber || `TKT-${t.id.slice(-6)}`,
    requesterType: (t.requesterType || "Customer") as SupportRequesterType,
    requesterId: t.requesterId || "",
    category: (t.category || "General Inquiry") as SupportCategory,
    priority: (t.priority || "Normal") as SupportPriority,
    status: (t.status || "Open") as SupportStatus,
    subject: t.subject || "Support Inquiry",
    description: t.description || "",
    bookingId: t.bookingId || t.relatedBookingId,
    assignedTo: t.assignedToId || t.assignedTo,
    createdAt: t.createdAt || new Date().toISOString(),
    updatedAt: t.updatedAt || new Date().toISOString(),
    resolvedAt: t.resolvedAt,
    closedAt: t.closedAt,
    resolution: t.resolution,
  };
}

function mapBackendDisputeToDispute(d: any): Dispute {
  return {
    id: d.id,
    organizationId: d.organizationId || "ORG-0001",
    disputeNumber: d.disputeNumber || `DSP-${d.id.slice(-6)}`,
    bookingId: d.bookingId || "",
    raisedByType: (d.raisedByType || "Customer") as any,
    raisedById: d.raisedById || "",
    againstType: (d.againstType || "Provider") as any,
    againstId: d.againstId || "",
    type: (d.type || "Service Quality") as DisputeType,
    priority: (d.priority || "Normal") as SupportPriority,
    status: (d.status || "Open") as DisputeStatus,
    subject: d.subject || "Dispute Case",
    description: d.description || "",
    amountInvolved: d.amountInvolved ? Number(d.amountInvolved) : undefined,
    assignedTo: d.assignedToId || d.assignedTo,
    createdAt: d.createdAt || new Date().toISOString(),
    updatedAt: d.updatedAt || new Date().toISOString(),
    resolvedAt: d.resolvedAt,
    closedAt: d.closedAt,
    resolution: d.resolution,
    outcome: d.outcome,
  };
}

const PRIORITY_WEIGHTS: Record<SupportPriority, number> = {
  Urgent: 4,
  High: 3,
  Normal: 2,
  Low: 1,
};

// =========================================================================
// SUPPORT TICKET SERVICE METHODS
// =========================================================================

export async function getSupportSummary(orgId: string): Promise<SupportSummaryMetrics> {
  if (isLiveMode()) {
    const res = await adminApi.support.list({ limit: 100 });
    const tickets = (res.data || []).map(mapBackendTicketToTicket);
    let openCount = 0;
    let inProgressCount = 0;
    let waitingForResponseCount = 0;
    let resolvedCount = 0;
    let closedCount = 0;
    let urgentCount = 0;

    tickets.forEach((t) => {
      if (t.status === "Open") openCount++;
      else if (t.status === "In Progress") inProgressCount++;
      else if (t.status === "Waiting for Response") waitingForResponseCount++;
      else if (t.status === "Resolved") resolvedCount++;
      else if (t.status === "Closed") closedCount++;

      if (t.priority === "Urgent") urgentCount++;
    });

    return {
      totalTickets: tickets.length,
      openCount,
      inProgressCount,
      waitingForResponseCount,
      resolvedCount,
      closedCount,
      urgentCount,
    };
  }

  const tickets = getMockSupportTickets(orgId);
  let openCount = 0;
  let inProgressCount = 0;
  let waitingForResponseCount = 0;
  let resolvedCount = 0;
  let closedCount = 0;
  let urgentCount = 0;

  tickets.forEach((t) => {
    if (t.status === "Open") openCount++;
    else if (t.status === "In Progress") inProgressCount++;
    else if (t.status === "Waiting for Response") waitingForResponseCount++;
    else if (t.status === "Resolved") resolvedCount++;
    else if (t.status === "Closed") closedCount++;

    if (t.priority === "Urgent") urgentCount++;
  });

  return {
    totalTickets: tickets.length,
    openCount,
    inProgressCount,
    waitingForResponseCount,
    resolvedCount,
    closedCount,
    urgentCount,
  };
}

export async function listSupportTickets(
  params: ListSupportTicketsParams
): Promise<ListSupportTicketsResult> {
  if (isLiveMode()) {
    const res = await adminApi.support.list({
      page: params.page,
      limit: params.pageSize,
      search: params.search,
      status: params.status !== "all" ? params.status : undefined,
    });
    const items = (res.data || []).map(mapBackendTicketToTicket);
    const meta = (res as any).meta || { page: params.page || 1, limit: params.pageSize || 10, total: items.length, totalPages: 1 };
    return {
      tickets: items,
      total: meta.total,
      page: meta.page,
      pageSize: meta.limit,
      totalPages: meta.totalPages || Math.ceil(meta.total / (meta.limit || 10)),
    };
  }

  const {
    organizationId,
    search = "",
    status = "all",
    priority = "all",
    category = "all",
    requesterType = "all",
    assignedState = "all",
    datePreset = "all",
    sort = "updated_at",
    sortDirection = "desc",
    page = 1,
    pageSize = 10,
  } = params;

  let tickets = [...getMockSupportTickets(organizationId)];

  // 1. Search (ID, Ticket Number, Subject, Description, Requester Name/Email, Booking Number, Assigned User)
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    const customers = organizationId === "ORG-0002" ? INITIAL_ORG_0002_CUSTOMERS : INITIAL_ORG_0001_CUSTOMERS;
    const providers = organizationId === "ORG-0002" ? INITIAL_ORG_0002_PROVIDERS : INITIAL_ORG_0001_PROVIDERS;
    const deliveryPartners = organizationId === "ORG-0002" ? INITIAL_ORG_0002_DELIVERY_PARTNERS : INITIAL_ORG_0001_DELIVERY_PARTNERS;
    const bookings = organizationId === "ORG-0002" ? INITIAL_ORG_0002_BOOKINGS : INITIAL_ORG_0001_BOOKINGS;
    const agents = organizationId === "ORG-0002" ? MOCK_ORG_0002_AGENTS : MOCK_ORG_0001_AGENTS;

    tickets = tickets.filter((t) => {
      if (t.id.toLowerCase().includes(q)) return true;
      if (t.ticketNumber.toLowerCase().includes(q)) return true;
      if (t.subject.toLowerCase().includes(q)) return true;
      if (t.description.toLowerCase().includes(q)) return true;

      // Check requester
      if (t.requesterType === "Customer") {
        const c = customers.find((item) => item.id === t.requesterId);
        if (c && (c.fullName.toLowerCase().includes(q) || c.email.toLowerCase().includes(q))) return true;
      } else if (t.requesterType === "Provider") {
        const p = providers.find((item) => item.id === t.requesterId);
        if (p && ((p.businessName && p.businessName.toLowerCase().includes(q)) || p.fullName.toLowerCase().includes(q))) return true;
      } else if (t.requesterType === "Delivery Partner") {
        const dp = deliveryPartners.find((item) => item.id === t.requesterId);
        if (dp && dp.fullName.toLowerCase().includes(q)) return true;
      }

      // Check booking number
      if (t.bookingId) {
        const b = bookings.find((item) => item.id === t.bookingId);
        if (b && b.bookingNumber.toLowerCase().includes(q)) return true;
      }

      // Check assigned agent
      if (t.assignedTo) {
        const a = agents.find((item) => item.id === t.assignedTo);
        if (a && a.name.toLowerCase().includes(q)) return true;
      }

      return false;
    });
  }

  // 2. Filters
  if (status !== "all") {
    tickets = tickets.filter((t) => t.status === status);
  }

  if (priority !== "all") {
    tickets = tickets.filter((t) => t.priority === priority);
  }

  if (category !== "all") {
    tickets = tickets.filter((t) => t.category === category);
  }

  if (requesterType !== "all") {
    tickets = tickets.filter((t) => t.requesterType === requesterType);
  }

  if (assignedState === "assigned") {
    tickets = tickets.filter((t) => !!t.assignedTo);
  } else if (assignedState === "unassigned") {
    tickets = tickets.filter((t) => !t.assignedTo);
  }

  if (datePreset !== "all") {
    const now = new Date();
    tickets = tickets.filter((t) => {
      const ticketDate = new Date(t.createdAt);
      const diffMs = now.getTime() - ticketDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (datePreset === "today") return diffDays <= 1;
      if (datePreset === "yesterday") return diffDays > 1 && diffDays <= 2;
      if (datePreset === "last_7_days") return diffDays <= 7;
      if (datePreset === "last_30_days") return diffDays <= 30;
      return true;
    });
  }

  // 3. Sorting
  tickets.sort((a, b) => {
    let result = 0;
    if (sort === "updated_at") {
      result = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    } else if (sort === "newest") {
      result = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sort === "oldest") {
      result = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sort === "priority") {
      result = PRIORITY_WEIGHTS[b.priority] - PRIORITY_WEIGHTS[a.priority];
    } else if (sort === "status") {
      result = a.status.localeCompare(b.status);
    } else if (sort === "requester") {
      result = a.requesterType.localeCompare(b.requesterType);
    } else if (sort === "category") {
      result = a.category.localeCompare(b.category);
    }

    return sortDirection === "desc" ? result : -result;
  });

  // 4. Pagination
  const total = tickets.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const paginated = tickets.slice(startIdx, startIdx + pageSize);

  return {
    tickets: paginated,
    total,
    page: currentPage,
    pageSize,
    totalPages,
  };
}

export async function getSupportTicketById(
  orgId: string,
  ticketId: string
): Promise<SupportTicketDetailResult | null> {
  if (isLiveMode()) {
    try {
      const res = await adminApi.support.getById(ticketId);
      if (!res.data) return null;
      const t = mapBackendTicketToTicket(res.data);
      return {
        ticket: t,
        requester: {
          id: t.requesterId,
          name: res.data.requesterName || "Platform User",
          email: res.data.requesterEmail,
          phone: res.data.requesterPhone,
          type: t.requesterType,
        },
        assignedAgent: t.assignedTo ? {
          id: t.assignedTo,
          name: "Operations Agent",
          role: "Operations Support",
        } : undefined,
        relatedRecords: {},
        notes: (res.data.notes || []).map((n: any) => ({
          id: n.id,
          ticketId: t.id,
          organizationId: t.organizationId,
          note: n.content || n.note || "",
          createdBy: n.userId || "System",
          createdByName: n.user?.fullName || "Agent",
          createdAt: n.createdAt || new Date().toISOString(),
        })),
        activities: [],
      };
    } catch (err: any) {
      if (err?.status === 404 || err?.statusCode === 404) return null;
      throw err;
    }
  }

  const tickets = getMockSupportTickets(orgId);
  const ticket = tickets.find((t) => t.id === ticketId);
  if (!ticket) return null;

  const customers = orgId === "ORG-0002" ? INITIAL_ORG_0002_CUSTOMERS : INITIAL_ORG_0001_CUSTOMERS;
  const providers = orgId === "ORG-0002" ? INITIAL_ORG_0002_PROVIDERS : INITIAL_ORG_0001_PROVIDERS;
  const deliveryPartners = orgId === "ORG-0002" ? INITIAL_ORG_0002_DELIVERY_PARTNERS : INITIAL_ORG_0001_DELIVERY_PARTNERS;
  const bookings = orgId === "ORG-0002" ? INITIAL_ORG_0002_BOOKINGS : INITIAL_ORG_0001_BOOKINGS;
  const payments = orgId === "ORG-0002" ? INITIAL_ORG_0002_PAYMENTS : INITIAL_ORG_0001_PAYMENTS;
  const transactions = orgId === "ORG-0002" ? INITIAL_ORG_0002_TRANSACTIONS : INITIAL_ORG_0001_TRANSACTIONS;
  const reviews = orgId === "ORG-0002" ? INITIAL_ORG_0002_REVIEWS : INITIAL_ORG_0001_REVIEWS;
  const agents = orgId === "ORG-0002" ? MOCK_ORG_0002_AGENTS : MOCK_ORG_0001_AGENTS;

  // 1. Resolve Requester
  let requester = {
    id: ticket.requesterId,
    name: "Platform User",
    email: undefined as string | undefined,
    phone: undefined as string | undefined,
    type: ticket.requesterType,
  };

  if (ticket.requesterType === "Customer") {
    const c = customers.find((item) => item.id === ticket.requesterId);
    if (c) {
      requester = {
        id: c.id,
        name: c.fullName,
        email: c.email,
        phone: c.phone,
        type: "Customer",
      };
    }
  } else if (ticket.requesterType === "Provider") {
    const p = providers.find((item) => item.id === ticket.requesterId);
    if (p) {
      requester = {
        id: p.id,
        name: p.businessName || p.fullName,
        email: p.email,
        phone: p.phone,
        type: "Provider",
      };
    }
  } else if (ticket.requesterType === "Delivery Partner") {
    const dp = deliveryPartners.find((item) => item.id === ticket.requesterId);
    if (dp) {
      requester = {
        id: dp.id,
        name: dp.fullName,
        email: dp.email,
        phone: dp.phone,
        type: "Delivery Partner",
      };
    }
  } else if (ticket.requesterType === "Admin" || ticket.requesterType === "Operations") {
    const a = agents.find((item) => item.id === ticket.requesterId);
    if (a) {
      requester = {
        id: a.id,
        name: a.name,
        email: `${a.id.toLowerCase()}@washora.internal`,
        phone: "+91 90000 00000",
        type: ticket.requesterType,
      };
    }
  }

  // 2. Resolve Assigned Agent
  let assignedAgent: SupportTicketDetailResult["assignedAgent"] = undefined;
  if (ticket.assignedTo) {
    const a = agents.find((item) => item.id === ticket.assignedTo);
    if (a) {
      assignedAgent = {
        id: a.id,
        name: a.name,
        role: a.role,
        assignedAt: ticket.updatedAt,
      };
    }
  }

  // 3. Resolve Related Records
  let relatedRecords: SupportTicketDetailResult["relatedRecords"] = {};
  if (ticket.bookingId) {
    const b = bookings.find((item) => item.id === ticket.bookingId);
    if (b) {
      relatedRecords.booking = {
        id: b.id,
        bookingNumber: b.bookingNumber,
        serviceName: b.serviceName,
        status: b.status,
        scheduledDate: b.scheduledAt,
        route: `/admin/bookings/${b.id}`,
      };
    }
  }

  if (ticket.paymentId) {
    const p = payments.find((item) => item.id === ticket.paymentId);
    if (p) {
      relatedRecords.payment = {
        id: p.id,
        amount: p.amount,
        status: p.status,
        paymentMethod: p.method,
        route: `/admin/payments/${p.id}`,
      };
    }
  }

  if (ticket.transactionId) {
    const tx = transactions.find((item) => item.id === ticket.transactionId);
    if (tx) {
      relatedRecords.transaction = {
        id: tx.id,
        reference: tx.reference,
        amount: tx.amount,
        type: tx.type,
      };
    } else {
      relatedRecords.transaction = {
        id: ticket.transactionId,
        reference: ticket.transactionId,
        amount: 650,
        type: "UPI_DEBIT",
      };
    }
  }

  if (ticket.reviewId) {
    const r = reviews.find((item) => item.id === ticket.reviewId);
    if (r) {
      relatedRecords.review = {
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        status: r.status,
        route: `/admin/reviews/${r.id}`,
      };
    }
  }

  // 4. Resolve Notes & Activities
  const notes = getMockSupportNotes(orgId, ticketId);
  const activities = getMockSupportActivities(orgId, ticketId);

  return {
    ticket,
    requester,
    assignedAgent,
    relatedRecords,
    notes,
    activities,
  };
}

export async function createSupportTicket(
  orgId: string,
  data: CreateSupportTicketFormValues,
  performedBy = "ADM-0001",
  performedByName = "Operations Lead"
): Promise<SupportTicket> {
  const result = createSupportTicketInStore(orgId, data, performedBy, performedByName);

  createMockNotificationInStore({
    organizationId: orgId,
    type: "Booking",
    priority: data.priority === "Urgent" ? "Critical" : data.priority === "High" ? "High" : "Normal",
    title: `New Support Ticket ${result.id}`,
    message: `Ticket ${result.id} created: "${data.subject}" (${data.requesterType} - ${data.category}).`,
    relatedEntityType: data.bookingId ? "Booking" : undefined,
    relatedEntityId: data.bookingId,
    actionRoute: `/admin/support/${result.id}`,
    actorName: performedByName,
  });

  return result;
}

export async function assignSupportTicket(
  orgId: string,
  ticketId: string,
  assigneeId: string,
  performedBy = "ADM-0001",
  performedByName = "Operations Lead"
): Promise<SupportTicket> {
  if (isLiveMode()) {
    const res = await adminApi.support.assign(ticketId, { assignedToId: assigneeId });
    return mapBackendTicketToTicket(res.data);
  }

  const result = assignSupportTicketInStore(orgId, ticketId, assigneeId, performedBy, performedByName);

  createMockNotificationInStore({
    organizationId: orgId,
    userId: assigneeId,
    type: "Booking",
    priority: "Normal",
    title: `Support Ticket ${ticketId} Assigned`,
    message: `Support ticket ${ticketId} has been assigned to you by ${performedByName}.`,
    actionRoute: `/admin/support/${ticketId}`,
    actorName: performedByName,
  });

  return result;
}

export async function unassignSupportTicket(
  orgId: string,
  ticketId: string,
  performedBy = "ADM-0001",
  performedByName = "Operations Lead"
): Promise<SupportTicket> {
  if (isLiveMode()) {
    const res = await adminApi.support.assign(ticketId, { assignedToId: "" });
    return mapBackendTicketToTicket(res.data);
  }

  return unassignSupportTicketInStore(orgId, ticketId, performedBy, performedByName);
}

export async function updateSupportTicketStatus(
  orgId: string,
  ticketId: string,
  status: SupportStatus,
  resolution?: string,
  performedBy = "ADM-0001",
  performedByName = "Operations Lead"
): Promise<SupportTicket> {
  if (isLiveMode()) {
    let res;
    if (status === "Resolved") {
      res = await adminApi.support.resolve(ticketId, { resolution: resolution || "Resolved" });
    } else if (status === "Closed") {
      res = await adminApi.support.close(ticketId, { closeReason: resolution || "Closed" });
    } else {
      res = await adminApi.support.reopen(ticketId, { reopenReason: resolution || "Reopened" });
    }
    return mapBackendTicketToTicket(res.data);
  }

  const result = updateSupportTicketStatusInStore(orgId, ticketId, status, resolution, performedBy, performedByName);

  createMockNotificationInStore({
    organizationId: orgId,
    type: "Booking",
    priority: status === "Resolved" || status === "Closed" ? "Normal" : "High",
    title: `Support Ticket ${ticketId} status: ${status}`,
    message: `Ticket ${ticketId} status updated to ${status} by ${performedByName}.${resolution ? ` Resolution: ${resolution}` : ""}`,
    actionRoute: `/admin/support/${ticketId}`,
    actorName: performedByName,
  });

  return result;
}

export async function updateSupportTicketPriority(
  orgId: string,
  ticketId: string,
  priority: SupportPriority,
  performedBy = "ADM-0001",
  performedByName = "Operations Lead"
): Promise<SupportTicket> {
  if (isLiveMode()) {
    const res = await adminApi.support.updatePriority(ticketId, { priority });
    return mapBackendTicketToTicket(res.data);
  }

  return updateSupportPriorityInStore(orgId, ticketId, priority, performedBy, performedByName);
}

export async function addSupportNote(
  orgId: string,
  ticketId: string,
  noteText: string,
  createdBy = "ADM-0001",
  createdByName = "Operations Lead"
): Promise<SupportNote> {
  if (isLiveMode()) {
    const res = await adminApi.support.createNote(ticketId, { note: noteText });
    return {
      id: res.data?.id || `NOT-${Date.now()}`,
      ticketId,
      organizationId: orgId,
      note: noteText,
      createdBy,
      createdByName,
      createdAt: new Date().toISOString(),
    };
  }

  return addSupportNoteInStore(orgId, ticketId, noteText, createdBy, createdByName);
}

export async function getEligibleAssignees(orgId: string): Promise<AssigneeOption[]> {
  return getEligibleAssigneesWithWorkload(orgId);
}

export async function getRequesterOptions(
  orgId: string,
  requesterType: SupportRequesterType
): Promise<Array<{ id: string; name: string; info: string }>> {
  if (requesterType === "Customer") {
    const customers = orgId === "ORG-0002" ? INITIAL_ORG_0002_CUSTOMERS : INITIAL_ORG_0001_CUSTOMERS;
    return customers.map((c) => ({
      id: c.id,
      name: c.fullName,
      info: `${c.email} • ${c.phone}`,
    }));
  }

  if (requesterType === "Provider") {
    const providers = orgId === "ORG-0002" ? INITIAL_ORG_0002_PROVIDERS : INITIAL_ORG_0001_PROVIDERS;
    return providers.map((p) => ({
      id: p.id,
      name: p.businessName || p.fullName,
      info: `Rating ${p.rating.toFixed(1)} ★ • ${p.serviceAreas[0] || "Active"}`,
    }));
  }

  if (requesterType === "Delivery Partner") {
    const partners = orgId === "ORG-0002" ? INITIAL_ORG_0002_DELIVERY_PARTNERS : INITIAL_ORG_0001_DELIVERY_PARTNERS;
    return partners.map((dp) => ({
      id: dp.id,
      name: dp.fullName,
      info: `Zone: ${dp.serviceAreas[0] || "Metro"} • ${dp.vehicleType}`,
    }));
  }

  if (requesterType === "Admin" || requesterType === "Operations") {
    const agents = orgId === "ORG-0002" ? MOCK_ORG_0002_AGENTS : MOCK_ORG_0001_AGENTS;
    return agents.map((a) => ({
      id: a.id,
      name: a.name,
      info: `${a.role} • ${a.primaryWorkArea}`,
    }));
  }

  return [];
}

// =========================================================================
// DISPUTE SERVICE METHODS
// =========================================================================

export async function getDisputeSummary(orgId: string): Promise<DisputeSummaryMetrics> {
  if (isLiveMode()) {
    const res = await adminApi.disputes.list({ limit: 100 });
    const disputes = (res.data || []).map(mapBackendDisputeToDispute);
    let openCount = 0;
    let underReviewCount = 0;
    let awaitingEvidenceCount = 0;
    let decisionMadeCount = 0;
    let resolvedCount = 0;
    let closedCount = 0;
    let urgentCount = 0;

    disputes.forEach((d) => {
      if (d.status === "Open") openCount++;
      else if (d.status === "Under Review") underReviewCount++;
      else if (d.status === "Awaiting Evidence") awaitingEvidenceCount++;
      else if (d.status === "Decision Made") decisionMadeCount++;
      else if (d.status === "Resolved") resolvedCount++;
      else if (d.status === "Closed") closedCount++;

      if (d.priority === "Urgent") urgentCount++;
    });

    return {
      totalDisputes: disputes.length,
      openCount,
      underReviewCount,
      awaitingEvidenceCount,
      decisionMadeCount,
      resolvedCount,
      closedCount,
      urgentCount,
    };
  }

  const disputes = getMockDisputes(orgId);
  let openCount = 0;
  let underReviewCount = 0;
  let awaitingEvidenceCount = 0;
  let decisionMadeCount = 0;
  let resolvedCount = 0;
  let closedCount = 0;
  let urgentCount = 0;

  disputes.forEach((d) => {
    if (d.status === "Open") openCount++;
    else if (d.status === "Under Review") underReviewCount++;
    else if (d.status === "Awaiting Evidence") awaitingEvidenceCount++;
    else if (d.status === "Decision Made") decisionMadeCount++;
    else if (d.status === "Resolved") resolvedCount++;
    else if (d.status === "Closed") closedCount++;

    if (d.priority === "Urgent") urgentCount++;
  });

  return {
    totalDisputes: disputes.length,
    openCount,
    underReviewCount,
    awaitingEvidenceCount,
    decisionMadeCount,
    resolvedCount,
    closedCount,
    urgentCount,
  };
}

export async function listDisputes(
  params: ListDisputesParams
): Promise<ListDisputesResult> {
  if (isLiveMode()) {
    const res = await adminApi.disputes.list({
      page: params.page,
      limit: params.pageSize,
      search: params.search,
      status: params.status !== "all" ? params.status : undefined,
    });
    const items = (res.data || []).map(mapBackendDisputeToDispute);
    const meta = (res as any).meta || { page: params.page || 1, limit: params.pageSize || 10, total: items.length, totalPages: 1 };
    return {
      disputes: items,
      total: meta.total,
      page: meta.page,
      pageSize: meta.limit,
      totalPages: meta.totalPages || Math.ceil(meta.total / (meta.limit || 10)),
    };
  }

  const {
    organizationId,
    search = "",
    status = "all",
    type = "all",
    priority = "all",
    raisedBy = "all",
    assignedState = "all",
    datePreset = "all",
    sort = "updated_at",
    sortDirection = "desc",
    page = 1,
    pageSize = 10,
  } = params;

  let disputes = [...getMockDisputes(organizationId)];

  // 1. Search
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    const customers = organizationId === "ORG-0002" ? INITIAL_ORG_0002_CUSTOMERS : INITIAL_ORG_0001_CUSTOMERS;
    const providers = organizationId === "ORG-0002" ? INITIAL_ORG_0002_PROVIDERS : INITIAL_ORG_0001_PROVIDERS;
    const deliveryPartners = organizationId === "ORG-0002" ? INITIAL_ORG_0002_DELIVERY_PARTNERS : INITIAL_ORG_0001_DELIVERY_PARTNERS;
    const bookings = organizationId === "ORG-0002" ? INITIAL_ORG_0002_BOOKINGS : INITIAL_ORG_0001_BOOKINGS;
    const agents = organizationId === "ORG-0002" ? MOCK_ORG_0002_AGENTS : MOCK_ORG_0001_AGENTS;

    disputes = disputes.filter((d) => {
      if (d.id.toLowerCase().includes(q)) return true;
      if (d.disputeNumber.toLowerCase().includes(q)) return true;
      if (d.subject.toLowerCase().includes(q)) return true;
      if (d.description.toLowerCase().includes(q)) return true;

      // Check Booking number
      const b = bookings.find((item) => item.id === d.bookingId);
      if (b && b.bookingNumber.toLowerCase().includes(q)) return true;

      // Check Parties
      const cust = customers.find((item) => item.id === d.raisedById || item.id === d.againstId);
      if (cust && cust.fullName.toLowerCase().includes(q)) return true;

      const prov = providers.find((item) => item.id === d.raisedById || item.id === d.againstId);
      if (prov && ((prov.businessName && prov.businessName.toLowerCase().includes(q)) || prov.fullName.toLowerCase().includes(q))) return true;

      const dp = deliveryPartners.find((item) => item.id === d.raisedById || item.id === d.againstId);
      if (dp && dp.fullName.toLowerCase().includes(q)) return true;

      // Check assigned reviewer
      if (d.assignedTo) {
        const a = agents.find((item) => item.id === d.assignedTo);
        if (a && a.name.toLowerCase().includes(q)) return true;
      }

      return false;
    });
  }

  // 2. Filters
  if (status !== "all") {
    disputes = disputes.filter((d) => d.status === status);
  }

  if (type !== "all") {
    disputes = disputes.filter((d) => d.type === type);
  }

  if (priority !== "all") {
    disputes = disputes.filter((d) => d.priority === priority);
  }

  if (raisedBy !== "all") {
    disputes = disputes.filter((d) => d.raisedByType === raisedBy);
  }

  if (assignedState === "assigned") {
    disputes = disputes.filter((d) => !!d.assignedTo);
  } else if (assignedState === "unassigned") {
    disputes = disputes.filter((d) => !d.assignedTo);
  }

  if (datePreset !== "all") {
    const now = new Date();
    disputes = disputes.filter((d) => {
      const disputeDate = new Date(d.createdAt);
      const diffMs = now.getTime() - disputeDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (datePreset === "today") return diffDays <= 1;
      if (datePreset === "yesterday") return diffDays > 1 && diffDays <= 2;
      if (datePreset === "last_7_days") return diffDays <= 7;
      if (datePreset === "last_30_days") return diffDays <= 30;
      return true;
    });
  }

  // 3. Sorting
  disputes.sort((a, b) => {
    let result = 0;
    if (sort === "updated_at") {
      result = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    } else if (sort === "newest") {
      result = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sort === "oldest") {
      result = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sort === "highest_priority") {
      result = PRIORITY_WEIGHTS[b.priority] - PRIORITY_WEIGHTS[a.priority];
    } else if (sort === "amount") {
      result = (b.amountInvolved || 0) - (a.amountInvolved || 0);
    } else if (sort === "status") {
      result = a.status.localeCompare(b.status);
    }

    return sortDirection === "desc" ? result : -result;
  });

  // 4. Pagination
  const total = disputes.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const paginated = disputes.slice(startIdx, startIdx + pageSize);

  return {
    disputes: paginated,
    total,
    page: currentPage,
    pageSize,
    totalPages,
  };
}

export async function getDisputeById(
  orgId: string,
  disputeId: string
): Promise<DisputeDetailResult | null> {
  if (isLiveMode()) {
    try {
      const res = await adminApi.disputes.getById(disputeId);
      if (!res.data) return null;
      const d = mapBackendDisputeToDispute(res.data);
      return {
        dispute: d,
        raisedBy: {
          id: d.raisedById,
          name: "Customer",
          role: d.raisedByType,
          email: "customer@example.com",
          phone: "+91 98765 43210",
        },
        against: {
          id: d.againstId,
          name: "Service Provider",
          role: d.againstType,
          email: "provider@example.com",
          phone: "+91 98765 00000",
        },
        booking: d.bookingId ? {
          id: d.bookingId,
          bookingNumber: `BK-${d.bookingId}`,
          serviceName: "Garment Care",
          status: "In Dispute",
          scheduledDate: d.createdAt,
          totalAmount: d.amountInvolved || 850,
          route: `/admin/bookings/${d.bookingId}`,
        } : undefined,
        financialContext: {
          amountInvolved: d.amountInvolved || 0,
          paymentId: "PAY-001",
          paymentStatus: "Paid",
          transactionId: "TXN-001",
          transactionReference: "UPI/2026/DISP-REF",
        },
        assignedReviewer: d.assignedTo ? {
          id: d.assignedTo,
          name: "Operations Reviewer",
          role: "Operations Lead",
          assignedAt: d.updatedAt,
        } : undefined,
        evidence: [],
        activities: [],
      };
    } catch (err: any) {
      if (err?.status === 404 || err?.statusCode === 404) return null;
      throw err;
    }
  }

  const disputes = getMockDisputes(orgId);
  const dispute = disputes.find((d) => d.id === disputeId);
  if (!dispute) return null;

  const customers = orgId === "ORG-0002" ? INITIAL_ORG_0002_CUSTOMERS : INITIAL_ORG_0001_CUSTOMERS;
  const providers = orgId === "ORG-0002" ? INITIAL_ORG_0002_PROVIDERS : INITIAL_ORG_0001_PROVIDERS;
  const deliveryPartners = orgId === "ORG-0002" ? INITIAL_ORG_0002_DELIVERY_PARTNERS : INITIAL_ORG_0001_DELIVERY_PARTNERS;
  const bookings = orgId === "ORG-0002" ? INITIAL_ORG_0002_BOOKINGS : INITIAL_ORG_0001_BOOKINGS;
  const payments = orgId === "ORG-0002" ? INITIAL_ORG_0002_PAYMENTS : INITIAL_ORG_0001_PAYMENTS;
  const transactions = orgId === "ORG-0002" ? INITIAL_ORG_0002_TRANSACTIONS : INITIAL_ORG_0001_TRANSACTIONS;
  const agents = orgId === "ORG-0002" ? MOCK_ORG_0002_AGENTS : MOCK_ORG_0001_AGENTS;

  // 1. Resolve Raised By
  let raisedBy = {
    id: dispute.raisedById,
    name: "Customer",
    role: dispute.raisedByType,
    email: undefined as string | undefined,
    phone: undefined as string | undefined,
  };
  if (dispute.raisedByType === "Customer") {
    const c = customers.find((item) => item.id === dispute.raisedById);
    if (c) raisedBy = { id: c.id, name: c.fullName, role: "Customer", email: c.email, phone: c.phone };
  } else if (dispute.raisedByType === "Provider") {
    const p = providers.find((item) => item.id === dispute.raisedById);
    if (p) raisedBy = { id: p.id, name: p.businessName || p.fullName, role: "Provider", email: p.email, phone: p.phone };
  } else if (dispute.raisedByType === "Delivery Partner") {
    const dp = deliveryPartners.find((item) => item.id === dispute.raisedById);
    if (dp) raisedBy = { id: dp.id, name: dp.fullName, role: "Delivery Partner", email: dp.email, phone: dp.phone };
  }

  // 2. Resolve Against
  let against = {
    id: dispute.againstId,
    name: "Provider",
    role: dispute.againstType,
    email: undefined as string | undefined,
    phone: undefined as string | undefined,
  };
  if (dispute.againstType === "Provider") {
    const p = providers.find((item) => item.id === dispute.againstId);
    if (p) against = { id: p.id, name: p.businessName || p.fullName, role: "Provider", email: p.email, phone: p.phone };
  } else if (dispute.againstType === "Delivery Partner") {
    const dp = deliveryPartners.find((item) => item.id === dispute.againstId);
    if (dp) against = { id: dp.id, name: dp.fullName, role: "Delivery Partner", email: dp.email, phone: dp.phone };
  } else if (dispute.againstType === "Customer") {
    const c = customers.find((item) => item.id === dispute.againstId);
    if (c) against = { id: c.id, name: c.fullName, role: "Customer", email: c.email, phone: c.phone };
  }

  // 3. Resolve Booking
  let booking: DisputeDetailResult["booking"] = undefined;
  const b = bookings.find((item) => item.id === dispute.bookingId);
  if (b) {
    booking = {
      id: b.id,
      bookingNumber: b.bookingNumber,
      serviceName: b.serviceName,
      status: b.status,
      scheduledDate: b.scheduledAt,
      totalAmount: b.totalAmount,
      route: `/admin/bookings/${b.id}`,
    };
  }

  // 4. Financial Context
  const p = payments.find((item) => item.bookingId === dispute.bookingId);
  const tx = transactions.find((item) => item.bookingId === dispute.bookingId || (p && item.paymentId === p.id));
  const financialContext: DisputeDetailResult["financialContext"] = {
    amountInvolved: dispute.amountInvolved,
    paymentId: p?.id,
    paymentStatus: p?.status,
    transactionId: tx?.id || "TXN-AUTO-001",
    transactionReference: tx?.reference || "UPI/2026/DISP-REF",
  };

  // 5. Assigned Reviewer
  let assignedReviewer: DisputeDetailResult["assignedReviewer"] = undefined;
  if (dispute.assignedTo) {
    const a = agents.find((item) => item.id === dispute.assignedTo);
    if (a) {
      assignedReviewer = {
        id: a.id,
        name: a.name,
        role: a.role,
        assignedAt: dispute.updatedAt,
      };
    }
  }

  // 6. Evidence & Activities
  const evidence = getMockDisputeEvidence(orgId, disputeId);
  const activities = getMockDisputeActivities(orgId, disputeId);

  return {
    dispute,
    raisedBy,
    against,
    booking,
    financialContext,
    assignedReviewer,
    evidence,
    activities,
  };
}

export async function assignDispute(
  orgId: string,
  disputeId: string,
  assigneeId: string,
  performedBy = "ADM-0001",
  performedByName = "Operations Lead"
): Promise<Dispute> {
  if (isLiveMode()) {
    const res = await adminApi.disputes.assign(disputeId, { assignedToId: assigneeId });
    return mapBackendDisputeToDispute(res.data);
  }

  const result = assignDisputeInStore(orgId, disputeId, assigneeId, performedBy, performedByName);

  createMockNotificationInStore({
    organizationId: orgId,
    userId: assigneeId,
    type: "Booking",
    priority: "High",
    title: `Dispute ${disputeId} Assigned`,
    message: `Dispute case ${disputeId} has been assigned to you for investigation by ${performedByName}.`,
    actionRoute: `/admin/disputes/${disputeId}`,
    actorName: performedByName,
  });

  return result;
}

export async function unassignDispute(
  orgId: string,
  disputeId: string,
  performedBy = "ADM-0001",
  performedByName = "Operations Lead"
): Promise<Dispute> {
  if (isLiveMode()) {
    const res = await adminApi.disputes.assign(disputeId, { assignedToId: "" });
    return mapBackendDisputeToDispute(res.data);
  }

  return unassignDisputeInStore(orgId, disputeId, performedBy, performedByName);
}

export async function updateDisputeStatus(
  orgId: string,
  disputeId: string,
  status: DisputeStatus,
  performedBy = "ADM-0001",
  performedByName = "Operations Lead"
): Promise<Dispute> {
  if (isLiveMode()) {
    if (status === "Resolved") {
      const res = await adminApi.disputes.resolve(disputeId, { resolution: "Resolved by operations" });
      return mapBackendDisputeToDispute(res.data);
    } else if (status === "Closed") {
      const res = await adminApi.disputes.reject(disputeId, { rejectionReason: "Closed by operations" });
      return mapBackendDisputeToDispute(res.data);
    } else {
      const res = await adminApi.disputes.reopen(disputeId, { reopenReason: "Reopened by operations" });
      return mapBackendDisputeToDispute(res.data);
    }
  }

  return updateDisputeStatusInStore(orgId, disputeId, status, performedBy, performedByName);
}

export async function recordDisputeDecision(
  orgId: string,
  disputeId: string,
  outcome: DisputeOutcome,
  resolution: string,
  performedBy = "ADM-0001",
  performedByName = "Operations Lead"
): Promise<Dispute> {
  if (isLiveMode()) {
    const res = await adminApi.disputes.resolve(disputeId, { resolution });
    return mapBackendDisputeToDispute(res.data);
  }

  const result = recordDisputeDecisionInStore(orgId, disputeId, outcome, resolution, performedBy, performedByName);

  createMockNotificationInStore({
    organizationId: orgId,
    type: "Booking",
    priority: "High",
    title: `Dispute ${disputeId} Resolved (${outcome})`,
    message: `Formal decision recorded for dispute ${disputeId}: "${outcome}". Resolution: ${resolution}`,
    actionRoute: `/admin/disputes/${disputeId}`,
    actorName: performedByName,
  });

  return result;
}

export async function addDisputeEvidence(
  orgId: string,
  disputeId: string,
  title: string,
  description: string,
  submittedBy = "ADM-0001",
  submittedByName = "Operations Lead"
): Promise<DisputeEvidence> {
  return addDisputeEvidenceInStore(orgId, disputeId, title, description, submittedBy, submittedByName);
}

export const adminSupportService = {
  getSupportSummary,
  listSupportTickets,
  getSupportTicketById,
  createSupportTicket,
  assignSupportTicket,
  unassignSupportTicket,
  updateSupportTicketStatus,
  updateSupportTicketPriority,
  addSupportNote,
  getEligibleAssignees,
  getRequesterOptions,
  getDisputeSummary,
  listDisputes,
  getDisputeById,
  assignDispute,
  unassignDispute,
  updateDisputeStatus,
  recordDisputeDecision,
  addDisputeEvidence,
};
