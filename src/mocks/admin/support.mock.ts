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
  AgentWorkloadLevel,
} from "@/types/admin/support";
import { INITIAL_ORG_0001_CUSTOMERS, INITIAL_ORG_0002_CUSTOMERS } from "./customer.mock";
import { INITIAL_ORG_0001_PROVIDERS, INITIAL_ORG_0002_PROVIDERS } from "./provider.mock";
import { INITIAL_ORG_0001_DELIVERY_PARTNERS, INITIAL_ORG_0002_DELIVERY_PARTNERS } from "./deliveryPartner.mock";
import { INITIAL_ORG_0001_BOOKINGS, INITIAL_ORG_0002_BOOKINGS } from "./booking.mock";
import { INITIAL_ORG_0001_PAYMENTS, INITIAL_ORG_0002_PAYMENTS, INITIAL_ORG_0001_TRANSACTIONS, INITIAL_ORG_0002_TRANSACTIONS } from "./payment.mock";
import { INITIAL_ORG_0001_REVIEWS, INITIAL_ORG_0002_REVIEWS } from "./review.mock";

/**
 * HELPER: ISO timestamp generator for deterministic past dates
 */
function getIsoTimestamp(daysAgo: number, hoursAgo = 0, minsAgo = 0): string {
  const base = new Date("2026-09-10T12:00:00.000Z");
  base.setDate(base.getDate() - daysAgo);
  base.setHours(base.getHours() - hoursAgo);
  base.setMinutes(base.getMinutes() - minsAgo);
  return base.toISOString();
}

/**
 * MOCK ADMIN & OPERATIONS USERS FOR CASE ASSIGNMENT
 */
export const MOCK_ORG_0001_AGENTS = [
  { id: "ADM-0001", name: "Aarav Sharma", role: "Admin" as const, primaryWorkArea: "Operations & Escalations" },
  { id: "ADM-0002", name: "Rahul Verma", role: "Operations" as const, primaryWorkArea: "Booking & Quality Issues" },
  { id: "ADM-0003", name: "Priya Nair", role: "Operations" as const, primaryWorkArea: "Delivery & Partner Escalations" },
  { id: "ADM-0004", name: "Deepak Patel", role: "Operations" as const, primaryWorkArea: "Payment & Financial Disputes" },
];

export const MOCK_ORG_0002_AGENTS = [
  { id: "ADM-0005", name: "Ananya Iyer", role: "Admin" as const, primaryWorkArea: "Regional Operations" },
  { id: "ADM-0006", name: "Vikram Malhotra", role: "Operations" as const, primaryWorkArea: "Customer Support Desk" },
  { id: "ADM-0007", name: "Meera Krishnan", role: "Operations" as const, primaryWorkArea: "Merchant & Fleet Support" },
];

/**
 * DETERMINISTIC SUPPORT TICKETS (ORG-0001: 44, ORG-0002: 24 -> Total 68)
 */
const TICKET_TEMPLATES: Array<{
  category: SupportCategory;
  priority: SupportPriority;
  status: SupportStatus;
  subject: string;
  description: string;
  hasBooking?: boolean;
  hasPayment?: boolean;
  hasReview?: boolean;
  requesterType: SupportRequesterType;
}> = [
  {
    category: "Booking Issue",
    priority: "Urgent",
    status: "In Progress",
    subject: "Express wash pickup valet arrived 45 mins past window",
    description: "Customer requested priority assistance as their airport departure is tomorrow morning. Valet was delayed due to heavy rain in Anna Nagar.",
    hasBooking: true,
    hasPayment: true,
    requesterType: "Customer",
  },
  {
    category: "Provider Issue",
    priority: "High",
    status: "Open",
    subject: "Silk garment care instructions not acknowledged by workshop",
    description: "Customer handed over 2 pure silk sarees with explicit cold dry-clean instructions. Needs urgent workshop supervisor confirmation before batch wash.",
    hasBooking: true,
    requesterType: "Customer",
  },
  {
    category: "Delivery Issue",
    priority: "Normal",
    status: "Waiting for Response",
    subject: "Incorrect delivery address pin code in Kilpauk",
    description: "Delivery partner reported destination gate number mismatch. Reached out to customer phone for precise landmark confirmation.",
    hasBooking: true,
    requesterType: "Delivery Partner",
  },
  {
    category: "Payment Issue",
    priority: "Urgent",
    status: "Open",
    subject: "UPI amount deducted twice for booking payment",
    description: "Customer bank statement shows 2 x ₹640 debits for order. Gateway transaction ID captured and verification with finance ledger requested.",
    hasBooking: true,
    hasPayment: true,
    requesterType: "Customer",
  },
  {
    category: "Service Issue",
    priority: "High",
    status: "Resolved",
    subject: "Stain removal surcharge clarification on wool coat",
    description: "Provider flagged stubborn grease marks requiring specialized solvent treatment. Customer approved additional service charge.",
    hasBooking: true,
    requesterType: "Provider",
  },
  {
    category: "Account Issue",
    priority: "Normal",
    status: "Closed",
    subject: "GST invoice request for corporate expense reimbursement",
    description: "Corporate customer requested itemized tax invoices for all August 2026 bookings. PDF summaries generated and dispatched.",
    requesterType: "Customer",
  },
  {
    category: "Technical Issue",
    priority: "Low",
    status: "Resolved",
    subject: "OTP verification delay during late-night dropoff confirmation",
    description: "Partner experienced 2-minute SMS gateway latency during dropoff scan. Fallback PIN utilized successfully.",
    requesterType: "Delivery Partner",
  },
  {
    category: "General",
    priority: "Normal",
    status: "In Progress",
    subject: "Inquiry regarding seasonal woolens bulk storage program",
    description: "Customer inquired about 30-day moth-proof sealed packaging package for winter coats. Operations shared seasonal brochure.",
    requesterType: "Customer",
  },
  {
    category: "Booking Issue",
    priority: "High",
    status: "Open",
    subject: "Reschedule request for Sunday morning slot",
    description: "Customer will be out of station on Saturday. Requested slot shift to Sunday 9:00 AM without cancellation fee.",
    hasBooking: true,
    requesterType: "Customer",
  },
  {
    category: "Provider Issue",
    priority: "Urgent",
    status: "In Progress",
    subject: "Workshop capacity threshold exceeded due to steam boiler maintenance",
    description: "Provider reported one steam press unit down for 4 hours. Requested temporary rerouting of express laundry batches to Hub B.",
    requesterType: "Provider",
  },
  {
    category: "Payment Issue",
    priority: "Normal",
    status: "Resolved",
    subject: "Refund status for cancelled shoe laundry add-on",
    description: "Add-on service was cancelled prior to item pickup. Refund of ₹350 processed back to original UPI account.",
    hasBooking: true,
    hasPayment: true,
    requesterType: "Customer",
  },
  {
    category: "Delivery Issue",
    priority: "Low",
    status: "Closed",
    subject: "Delivery bag zipper replacement request",
    description: "Partner requested replacement insulated delivery kit bag due to broken waterproof seal. Replacement issued at central hub.",
    requesterType: "Delivery Partner",
  },
];

export const INITIAL_ORG_0001_SUPPORT_TICKETS: SupportTicket[] = Array.from({ length: 44 }).map((_, idx) => {
  const idNum = idx + 1;
  const ticketId = `TKT-${String(idNum).padStart(4, "0")}`;
  const ticketNumber = `SUP-2026-${String(idNum).padStart(6, "0")}`;
  const tpl = TICKET_TEMPLATES[idx % TICKET_TEMPLATES.length];

  const cust = INITIAL_ORG_0001_CUSTOMERS[idx % INITIAL_ORG_0001_CUSTOMERS.length];
  const prov = INITIAL_ORG_0001_PROVIDERS[idx % INITIAL_ORG_0001_PROVIDERS.length];
  const dp = INITIAL_ORG_0001_DELIVERY_PARTNERS[idx % INITIAL_ORG_0001_DELIVERY_PARTNERS.length];
  const booking = INITIAL_ORG_0001_BOOKINGS[idx % INITIAL_ORG_0001_BOOKINGS.length];
  const payment = INITIAL_ORG_0001_PAYMENTS[idx % INITIAL_ORG_0001_PAYMENTS.length];
  const review = INITIAL_ORG_0001_REVIEWS[idx % INITIAL_ORG_0001_REVIEWS.length];

  let requesterId = cust.id;
  if (tpl.requesterType === "Provider") requesterId = prov.id;
  else if (tpl.requesterType === "Delivery Partner") requesterId = dp.id;
  else if (tpl.requesterType === "Admin") requesterId = "ADM-0001";
  else if (tpl.requesterType === "Operations") requesterId = "ADM-0002";

  const isAssigned = idx % 5 !== 0;
  const agent = MOCK_ORG_0001_AGENTS[idx % MOCK_ORG_0001_AGENTS.length];

  const daysAgo = (idx * 2) % 28 + 1;
  const createdAt = getIsoTimestamp(daysAgo, (idx * 3) % 12, (idx * 7) % 50);
  const updatedAt = getIsoTimestamp(Math.max(0, daysAgo - 1), (idx * 2) % 8, (idx * 5) % 40);
  const isResolved = tpl.status === "Resolved" || tpl.status === "Closed";
  const isClosed = tpl.status === "Closed";

  return {
    id: ticketId,
    organizationId: "ORG-0001",
    ticketNumber,
    requesterType: tpl.requesterType,
    requesterId,
    category: tpl.category,
    priority: tpl.priority,
    status: tpl.status,
    subject: `${tpl.subject} (#${idNum})`,
    description: tpl.description,
    bookingId: tpl.hasBooking ? booking.id : undefined,
    paymentId: tpl.hasPayment ? payment.id : undefined,
    transactionId: tpl.hasPayment ? `TXN-ORG1-${String(idx + 101).padStart(5, "0")}` : undefined,
    reviewId: idx % 6 === 0 ? review.id : undefined,
    assignedTo: isAssigned ? agent.id : undefined,
    createdAt,
    updatedAt,
    resolvedAt: isResolved ? getIsoTimestamp(Math.max(0, daysAgo - 1), 2) : undefined,
    closedAt: isClosed ? getIsoTimestamp(Math.max(0, daysAgo - 2), 1) : undefined,
    resolution: isResolved ? "Issue investigated and resolved per operational SLA standards. Case details verified with customer and service partner." : undefined,
  };
});

export const INITIAL_ORG_0002_SUPPORT_TICKETS: SupportTicket[] = Array.from({ length: 24 }).map((_, idx) => {
  const idNum = 45 + idx;
  const ticketId = `TKT-${String(idNum).padStart(4, "0")}`;
  const ticketNumber = `SUP-2026-${String(idNum).padStart(6, "0")}`;
  const tpl = TICKET_TEMPLATES[(idx + 3) % TICKET_TEMPLATES.length];

  const cust = INITIAL_ORG_0002_CUSTOMERS[idx % INITIAL_ORG_0002_CUSTOMERS.length];
  const prov = INITIAL_ORG_0002_PROVIDERS[idx % INITIAL_ORG_0002_PROVIDERS.length];
  const dp = INITIAL_ORG_0002_DELIVERY_PARTNERS[idx % INITIAL_ORG_0002_DELIVERY_PARTNERS.length];
  const booking = INITIAL_ORG_0002_BOOKINGS[idx % INITIAL_ORG_0002_BOOKINGS.length];
  const payment = INITIAL_ORG_0002_PAYMENTS[idx % INITIAL_ORG_0002_PAYMENTS.length];

  let requesterId = cust.id;
  if (tpl.requesterType === "Provider") requesterId = prov.id;
  else if (tpl.requesterType === "Delivery Partner") requesterId = dp.id;
  else if (tpl.requesterType === "Admin") requesterId = "ADM-0005";
  else if (tpl.requesterType === "Operations") requesterId = "ADM-0006";

  const isAssigned = idx % 4 !== 0;
  const agent = MOCK_ORG_0002_AGENTS[idx % MOCK_ORG_0002_AGENTS.length];

  const daysAgo = (idx * 2) % 20 + 1;
  const createdAt = getIsoTimestamp(daysAgo, 4, 15);
  const updatedAt = getIsoTimestamp(Math.max(0, daysAgo - 1), 2, 10);
  const isResolved = tpl.status === "Resolved" || tpl.status === "Closed";
  const isClosed = tpl.status === "Closed";

  return {
    id: ticketId,
    organizationId: "ORG-0002",
    ticketNumber,
    requesterType: tpl.requesterType,
    requesterId,
    category: tpl.category,
    priority: tpl.priority,
    status: tpl.status,
    subject: `[Coimbatore Hub] ${tpl.subject} (#${idNum})`,
    description: tpl.description,
    bookingId: tpl.hasBooking ? booking.id : undefined,
    paymentId: tpl.hasPayment ? payment.id : undefined,
    transactionId: tpl.hasPayment ? `TXN-ORG2-${String(idx + 201).padStart(5, "0")}` : undefined,
    assignedTo: isAssigned ? agent.id : undefined,
    createdAt,
    updatedAt,
    resolvedAt: isResolved ? getIsoTimestamp(Math.max(0, daysAgo - 1), 1) : undefined,
    closedAt: isClosed ? getIsoTimestamp(Math.max(0, daysAgo - 2), 1) : undefined,
    resolution: isResolved ? "Regional support team contacted the customer and resolved the inquiry." : undefined,
  };
});

/**
 * DETERMINISTIC DISPUTES (ORG-0001: 24, ORG-0002: 14 -> Total 38)
 */
const DISPUTE_TEMPLATES: Array<{
  type: DisputeType;
  priority: SupportPriority;
  status: DisputeStatus;
  subject: string;
  description: string;
  raisedByType: "Customer" | "Provider" | "Delivery Partner";
  againstType: "Customer" | "Provider" | "Delivery Partner";
  amount: number;
  outcome?: DisputeOutcome;
}> = [
  {
    type: "Service Quality",
    priority: "High",
    status: "Under Review",
    subject: "Color bleeding on premium cotton formal shirt",
    description: "Customer states that white shirt was washed alongside dark fabrics resulting in dye stains. Photographic inspection required with merchant.",
    raisedByType: "Customer",
    againstType: "Provider",
    amount: 1200,
  },
  {
    type: "Cancellation Dispute",
    priority: "Urgent",
    status: "Awaiting Evidence",
    subject: "Cancellation fee charged after valet arrived 1 hour late",
    description: "Customer cancelled because valet missed the scheduled pickup window by 65 minutes. Delivery timestamp logs requested from GPS audit.",
    raisedByType: "Customer",
    againstType: "Delivery Partner",
    amount: 150,
  },
  {
    type: "Payment Dispute",
    priority: "Normal",
    status: "Decision Made",
    subject: "Weight discrepancy on 12kg bulk laundry bundle",
    description: "Customer booked 8kg package but workshop weighed 12.4kg on calibrated digital scale and applied surplus weight charge.",
    raisedByType: "Customer",
    againstType: "Provider",
    amount: 320,
    outcome: "Partially Resolved",
  },
  {
    type: "Delivery Issue",
    priority: "High",
    status: "Resolved",
    subject: "Garment package left at reception without OTP confirmation",
    description: "Customer reported package delivered to apartment building guard without handover call or OTP. Security logs validated delivery safely.",
    raisedByType: "Customer",
    againstType: "Delivery Partner",
    amount: 450,
    outcome: "No Action Required",
  },
  {
    type: "Provider Conduct",
    priority: "Urgent",
    status: "Open",
    subject: "Refusal to honor steam press guarantee on blazer",
    description: "Provider returned un-pressed wool blazer stating label was illegible. Customer claims garment care tags were fully intact.",
    raisedByType: "Customer",
    againstType: "Provider",
    amount: 600,
  },
  {
    type: "Booking Issue",
    priority: "Normal",
    status: "Closed",
    subject: "Double slot booking due to browser refresh during checkout",
    description: "Customer created 2 identical bookings within 30 seconds. One booking cancelled and full refund granted immediately.",
    raisedByType: "Customer",
    againstType: "Provider",
    amount: 850,
    outcome: "Customer Favored",
  },
  {
    type: "Service Quality",
    priority: "Urgent",
    status: "Under Review",
    subject: "Lost designer silk scarf during batch dry cleaning",
    description: "Provider tagged 5 items at intake but customer inventory list lists 6 items. CCTV intake footage requested for review.",
    raisedByType: "Customer",
    againstType: "Provider",
    amount: 3500,
  },
  {
    type: "Delivery Issue",
    priority: "Normal",
    status: "Resolved",
    subject: "Rain damage on outer laundry bag packaging",
    description: "Delivery partner was caught in torrential thunderstorm. Outer packaging wet but clothes inside water-sealed pouch were unharmed.",
    raisedByType: "Customer",
    againstType: "Delivery Partner",
    amount: 200,
    outcome: "Customer Favored",
  },
];

export const INITIAL_ORG_0001_DISPUTES: Dispute[] = Array.from({ length: 24 }).map((_, idx) => {
  const idNum = idx + 1;
  const disputeId = `DSP-${String(idNum).padStart(4, "0")}`;
  const disputeNumber = `DIS-2026-${String(idNum).padStart(6, "0")}`;
  const tpl = DISPUTE_TEMPLATES[idx % DISPUTE_TEMPLATES.length];

  const cust = INITIAL_ORG_0001_CUSTOMERS[idx % INITIAL_ORG_0001_CUSTOMERS.length];
  const prov = INITIAL_ORG_0001_PROVIDERS[idx % INITIAL_ORG_0001_PROVIDERS.length];
  const dp = INITIAL_ORG_0001_DELIVERY_PARTNERS[idx % INITIAL_ORG_0001_DELIVERY_PARTNERS.length];
  const booking = INITIAL_ORG_0001_BOOKINGS[idx % INITIAL_ORG_0001_BOOKINGS.length];

  const raisedById = tpl.raisedByType === "Customer" ? cust.id : tpl.raisedByType === "Provider" ? prov.id : dp.id;
  const againstId = tpl.againstType === "Provider" ? prov.id : tpl.againstType === "Delivery Partner" ? dp.id : cust.id;

  const isAssigned = idx % 4 !== 0;
  const agent = MOCK_ORG_0001_AGENTS[idx % MOCK_ORG_0001_AGENTS.length];

  const daysAgo = (idx * 3) % 25 + 1;
  const createdAt = getIsoTimestamp(daysAgo, (idx * 2) % 10, 20);
  const updatedAt = getIsoTimestamp(Math.max(0, daysAgo - 1), 3, 30);
  const isResolved = tpl.status === "Resolved" || tpl.status === "Closed";
  const isClosed = tpl.status === "Closed";

  return {
    id: disputeId,
    organizationId: "ORG-0001",
    disputeNumber,
    bookingId: booking.id,
    raisedByType: tpl.raisedByType,
    raisedById,
    againstType: tpl.againstType,
    againstId,
    type: tpl.type,
    priority: tpl.priority,
    status: tpl.status,
    subject: `${tpl.subject} (#${idNum})`,
    description: tpl.description,
    amountInvolved: tpl.amount,
    assignedTo: isAssigned ? agent.id : undefined,
    outcome: tpl.outcome,
    resolution: isResolved ? "Comprehensive dispute review completed with both parties. Decision recorded and verified." : undefined,
    createdAt,
    updatedAt,
    resolvedAt: isResolved ? getIsoTimestamp(Math.max(0, daysAgo - 1), 2) : undefined,
    closedAt: isClosed ? getIsoTimestamp(Math.max(0, daysAgo - 2), 1) : undefined,
  };
});

export const INITIAL_ORG_0002_DISPUTES: Dispute[] = Array.from({ length: 14 }).map((_, idx) => {
  const idNum = 25 + idx;
  const disputeId = `DSP-${String(idNum).padStart(4, "0")}`;
  const disputeNumber = `DIS-2026-${String(idNum).padStart(6, "0")}`;
  const tpl = DISPUTE_TEMPLATES[(idx + 2) % DISPUTE_TEMPLATES.length];

  const cust = INITIAL_ORG_0002_CUSTOMERS[idx % INITIAL_ORG_0002_CUSTOMERS.length];
  const prov = INITIAL_ORG_0002_PROVIDERS[idx % INITIAL_ORG_0002_PROVIDERS.length];
  const dp = INITIAL_ORG_0002_DELIVERY_PARTNERS[idx % INITIAL_ORG_0002_DELIVERY_PARTNERS.length];
  const booking = INITIAL_ORG_0002_BOOKINGS[idx % INITIAL_ORG_0002_BOOKINGS.length];

  const raisedById = tpl.raisedByType === "Customer" ? cust.id : tpl.raisedByType === "Provider" ? prov.id : dp.id;
  const againstId = tpl.againstType === "Provider" ? prov.id : tpl.againstType === "Delivery Partner" ? dp.id : cust.id;

  const isAssigned = idx % 3 !== 0;
  const agent = MOCK_ORG_0002_AGENTS[idx % MOCK_ORG_0002_AGENTS.length];

  const daysAgo = (idx * 2) % 18 + 1;
  const createdAt = getIsoTimestamp(daysAgo, 5, 10);
  const updatedAt = getIsoTimestamp(Math.max(0, daysAgo - 1), 1, 40);
  const isResolved = tpl.status === "Resolved" || tpl.status === "Closed";
  const isClosed = tpl.status === "Closed";

  return {
    id: disputeId,
    organizationId: "ORG-0002",
    disputeNumber,
    bookingId: booking.id,
    raisedByType: tpl.raisedByType,
    raisedById,
    againstType: tpl.againstType,
    againstId,
    type: tpl.type,
    priority: tpl.priority,
    status: tpl.status,
    subject: `[Coimbatore Dispute] ${tpl.subject} (#${idNum})`,
    description: tpl.description,
    amountInvolved: tpl.amount,
    assignedTo: isAssigned ? agent.id : undefined,
    outcome: tpl.outcome,
    resolution: isResolved ? "Regional operations case review closed." : undefined,
    createdAt,
    updatedAt,
    resolvedAt: isResolved ? getIsoTimestamp(Math.max(0, daysAgo - 1), 1) : undefined,
    closedAt: isClosed ? getIsoTimestamp(Math.max(0, daysAgo - 2), 1) : undefined,
  };
});

/**
 * INITIAL MOCK INTERNAL NOTES FOR TICKETS
 */
export const INITIAL_SUPPORT_NOTES: SupportNote[] = [
  {
    id: "NOT-0001",
    ticketId: "TKT-0001",
    organizationId: "ORG-0001",
    note: "Spoke with Anna Nagar dispatch. Rider had a flat tyre; backup rider DLP-0003 took over batch at 10:45 AM.",
    createdBy: "ADM-0001",
    createdByName: "Aarav Sharma (Admin)",
    createdAt: getIsoTimestamp(1, 4, 30),
  },
  {
    id: "NOT-0002",
    ticketId: "TKT-0001",
    organizationId: "ORG-0001",
    note: "Customer notified via phone. Courtesy express delivery slot allocated for return delivery.",
    createdBy: "ADM-0002",
    createdByName: "Rahul Verma (Operations)",
    createdAt: getIsoTimestamp(1, 3, 10),
  },
  {
    id: "NOT-0003",
    ticketId: "TKT-0004",
    organizationId: "ORG-0001",
    note: "Verified gateway response code with payment provider. Second transaction marked for automatic 24-hour reversal.",
    createdBy: "ADM-0004",
    createdByName: "Deepak Patel (Finance Ops)",
    createdAt: getIsoTimestamp(2, 6, 0),
  },
];

/**
 * INITIAL MOCK EVIDENCE FOR DISPUTES
 */
export const INITIAL_DISPUTE_EVIDENCE: DisputeEvidence[] = [
  {
    id: "EVD-0001",
    disputeId: "DSP-0001",
    organizationId: "ORG-0001",
    title: "Customer Photos of Stained Collar & Cuffs",
    description: "Uploaded high-resolution photos showing dark blue tint bleeding into white cotton fabric weave.",
    submittedBy: "USR-C001",
    submittedByName: "Pooja Sundaram (Customer)",
    submittedAt: getIsoTimestamp(3, 8),
  },
  {
    id: "EVD-0002",
    disputeId: "DSP-0001",
    organizationId: "ORG-0001",
    title: "Workshop Intake Video & Digital Log",
    description: "Intake checklist shows item was recorded under standard wash instead of separate delicates stream.",
    submittedBy: "PRV-001",
    submittedByName: "Supreme Cleaners (Provider Supervisor)",
    submittedAt: getIsoTimestamp(2, 5),
  },
  {
    id: "EVD-0003",
    disputeId: "DSP-0002",
    organizationId: "ORG-0001",
    title: "GPS Telemetry & Arrival Timestamp Audit",
    description: "System GPS logs corroborate valet arrived outside pickup geofence at 11:05 AM vs scheduled 10:00 AM.",
    submittedBy: "ADM-0003",
    submittedByName: "Priya Nair (Operations Lead)",
    submittedAt: getIsoTimestamp(4, 2),
  },
];

/**
 * INITIAL ACTIVITIES
 */
export const INITIAL_SUPPORT_ACTIVITIES: SupportActivity[] = [
  {
    id: "ACT-0001",
    organizationId: "ORG-0001",
    ticketId: "TKT-0001",
    type: "Ticket Created",
    performedBy: "USR-C001",
    performedByName: "Pooja Sundaram",
    timestamp: getIsoTimestamp(2, 10),
    description: "Support ticket submitted via customer mobile portal.",
  },
  {
    id: "ACT-0002",
    organizationId: "ORG-0001",
    ticketId: "TKT-0001",
    type: "Ticket Assigned",
    performedBy: "ADM-0001",
    performedByName: "Aarav Sharma",
    timestamp: getIsoTimestamp(2, 9, 30),
    description: "Ticket assigned to Rahul Verma (Operations).",
  },
  {
    id: "ACT-0003",
    organizationId: "ORG-0001",
    ticketId: "TKT-0001",
    type: "Status Changed",
    performedBy: "ADM-0002",
    performedByName: "Rahul Verma",
    timestamp: getIsoTimestamp(1, 5),
    description: "Ticket status changed from Open to In Progress.",
  },
];

export const INITIAL_DISPUTE_ACTIVITIES: DisputeActivity[] = [
  {
    id: "DACT-0001",
    organizationId: "ORG-0001",
    disputeId: "DSP-0001",
    type: "Dispute Created",
    performedBy: "USR-C001",
    performedByName: "Pooja Sundaram",
    timestamp: getIsoTimestamp(4, 12),
    description: "Dispute case filed for Service Quality on formal shirt.",
  },
  {
    id: "DACT-0002",
    organizationId: "ORG-0001",
    disputeId: "DSP-0001",
    type: "Dispute Assigned",
    performedBy: "ADM-0001",
    performedByName: "Aarav Sharma",
    timestamp: getIsoTimestamp(4, 11),
    description: "Dispute assigned to Rahul Verma for investigation.",
  },
  {
    id: "DACT-0003",
    organizationId: "ORG-0001",
    disputeId: "DSP-0001",
    type: "Evidence Added",
    performedBy: "USR-C001",
    performedByName: "Pooja Sundaram",
    timestamp: getIsoTimestamp(3, 8),
    description: "Customer photos of stained collar & cuffs added to case file.",
  },
  {
    id: "DACT-0004",
    organizationId: "ORG-0001",
    disputeId: "DSP-0001",
    type: "Status Changed",
    performedBy: "ADM-0002",
    performedByName: "Rahul Verma",
    timestamp: getIsoTimestamp(3, 6),
    description: "Dispute moved to Under Review.",
  },
];

// =========================================================================
// IN-MEMORY MUTABLE REPOSITORIES
// =========================================================================

let mockSupportTicketsStore: SupportTicket[] = [
  ...INITIAL_ORG_0001_SUPPORT_TICKETS,
  ...INITIAL_ORG_0002_SUPPORT_TICKETS,
];

let mockDisputesStore: Dispute[] = [
  ...INITIAL_ORG_0001_DISPUTES,
  ...INITIAL_ORG_0002_DISPUTES,
];

let mockSupportNotesStore: SupportNote[] = [...INITIAL_SUPPORT_NOTES];
let mockDisputeEvidenceStore: DisputeEvidence[] = [...INITIAL_DISPUTE_EVIDENCE];
let mockSupportActivitiesStore: SupportActivity[] = [...INITIAL_SUPPORT_ACTIVITIES];
let mockDisputeActivitiesStore: DisputeActivity[] = [...INITIAL_DISPUTE_ACTIVITIES];

let nextTicketSeq = 69;
let nextDisputeSeq = 39;
let nextNoteSeq = 4;
let nextEvidenceSeq = 4;
let nextActivitySeq = 5;

// =========================================================================
// STORE GETTERS & MUTATORS
// =========================================================================

export function getMockSupportTickets(orgId: string): SupportTicket[] {
  return mockSupportTicketsStore.filter((t) => t.organizationId === orgId);
}

export function getMockDisputes(orgId: string): Dispute[] {
  return mockDisputesStore.filter((d) => d.organizationId === orgId);
}

export function getMockSupportNotes(orgId: string, ticketId: string): SupportNote[] {
  return mockSupportNotesStore
    .filter((n) => n.organizationId === orgId && n.ticketId === ticketId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getMockSupportActivities(orgId: string, ticketId: string): SupportActivity[] {
  return mockSupportActivitiesStore
    .filter((a) => a.organizationId === orgId && a.ticketId === ticketId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getMockDisputeEvidence(orgId: string, disputeId: string): DisputeEvidence[] {
  return mockDisputeEvidenceStore
    .filter((e) => e.organizationId === orgId && e.disputeId === disputeId)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}

export function getMockDisputeActivities(orgId: string, disputeId: string): DisputeActivity[] {
  return mockDisputeActivitiesStore
    .filter((a) => a.organizationId === orgId && a.disputeId === disputeId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Calculates active tickets per agent and computes workload levels:
 * 0–5 = Low
 * 6–10 = Medium
 * 11+ = High
 */
export function getEligibleAssigneesWithWorkload(orgId: string): AssigneeOption[] {
  const agents = orgId === "ORG-0002" ? MOCK_ORG_0002_AGENTS : MOCK_ORG_0001_AGENTS;
  const orgTickets = mockSupportTicketsStore.filter((t) => t.organizationId === orgId);

  return agents.map((agent) => {
    const activeTicketCount = orgTickets.filter(
      (t) =>
        t.assignedTo === agent.id &&
        (t.status === "Open" || t.status === "In Progress" || t.status === "Waiting for Response")
    ).length;

    let workloadLevel: AgentWorkloadLevel = "Low";
    if (activeTicketCount >= 11) workloadLevel = "High";
    else if (activeTicketCount >= 6) workloadLevel = "Medium";

    return {
      id: agent.id,
      name: agent.name,
      role: agent.role,
      primaryWorkArea: agent.primaryWorkArea,
      activeTicketCount,
      workloadLevel,
    };
  });
}

/**
 * CREATE SUPPORT TICKET
 */
export function createSupportTicketInStore(
  orgId: string,
  data: {
    requesterType: SupportRequesterType;
    requesterId: string;
    category: SupportCategory;
    priority: SupportPriority;
    subject: string;
    description: string;
    bookingId?: string;
    paymentId?: string;
    transactionId?: string;
    reviewId?: string;
  },
  performedBy = "ADM-0001",
  performedByName = "Operations Lead"
): SupportTicket {
  const seq = nextTicketSeq++;
  const ticketId = `TKT-${String(seq).padStart(4, "0")}`;
  const ticketNumber = `SUP-2026-${String(seq).padStart(6, "0")}`;
  const now = new Date().toISOString();

  const newTicket: SupportTicket = {
    id: ticketId,
    organizationId: orgId,
    ticketNumber,
    requesterType: data.requesterType,
    requesterId: data.requesterId,
    category: data.category,
    priority: data.priority,
    status: "Open",
    subject: data.subject.trim(),
    description: data.description.trim(),
    bookingId: data.bookingId || undefined,
    paymentId: data.paymentId || undefined,
    transactionId: data.transactionId || undefined,
    reviewId: data.reviewId || undefined,
    createdAt: now,
    updatedAt: now,
  };

  mockSupportTicketsStore.unshift(newTicket);

  // Add creation activity
  mockSupportActivitiesStore.push({
    id: `ACT-${String(nextActivitySeq++).padStart(4, "0")}`,
    organizationId: orgId,
    ticketId,
    type: "Ticket Created",
    performedBy,
    performedByName,
    timestamp: now,
    description: `Support ticket created for ${data.category}.`,
  });

  return newTicket;
}

/**
 * SUPPORT STATUS LIFECYCLE TRANSITION VALIDATOR & MUTATOR
 * Allowed transitions:
 * Open → In Progress, Closed
 * In Progress → Waiting for Response, Resolved, Closed
 * Waiting for Response → In Progress, Resolved, Closed
 * Resolved → Closed
 * Closed → Closed (terminal, no reopen)
 */
export function updateSupportTicketStatusInStore(
  orgId: string,
  ticketId: string,
  newStatus: SupportStatus,
  resolution?: string,
  performedBy = "ADM-0001",
  performedByName = "Operations Lead"
): SupportTicket {
  const index = mockSupportTicketsStore.findIndex(
    (t) => t.id === ticketId && t.organizationId === orgId
  );
  if (index === -1) {
    throw new Error(`Support ticket ${ticketId} not found in organization ${orgId}`);
  }

  const current = mockSupportTicketsStore[index];
  const oldStatus = current.status;

  if (oldStatus === "Closed" && newStatus !== "Closed") {
    throw new Error("Closed tickets cannot be reopened.");
  }

  const validTransitions: Record<SupportStatus, SupportStatus[]> = {
    Open: ["In Progress", "Closed"],
    "In Progress": ["Waiting for Response", "Resolved", "Closed"],
    "Waiting for Response": ["In Progress", "Resolved", "Closed"],
    Resolved: ["Closed"],
    Closed: ["Closed"],
  };

  if (!validTransitions[oldStatus]?.includes(newStatus)) {
    throw new Error(`Invalid status transition from ${oldStatus} to ${newStatus}.`);
  }

  const now = new Date().toISOString();
  const updated: SupportTicket = {
    ...current,
    status: newStatus,
    updatedAt: now,
    resolvedAt: newStatus === "Resolved" ? now : current.resolvedAt,
    closedAt: newStatus === "Closed" ? now : current.closedAt,
    resolution: resolution?.trim() || current.resolution,
  };

  mockSupportTicketsStore[index] = updated;

  // Record Activity
  let activityType: SupportActivity["type"] = "Status Changed";
  if (newStatus === "Resolved") activityType = "Ticket Resolved";
  else if (newStatus === "Closed") activityType = "Ticket Closed";

  mockSupportActivitiesStore.push({
    id: `ACT-${String(nextActivitySeq++).padStart(4, "0")}`,
    organizationId: orgId,
    ticketId,
    type: activityType,
    performedBy,
    performedByName,
    timestamp: now,
    description: resolution
      ? `Status changed to ${newStatus}. Resolution: "${resolution.slice(0, 80)}..."`
      : `Status changed from ${oldStatus} to ${newStatus}.`,
  });

  return updated;
}

/**
 * ASSIGN / REASSIGN SUPPORT TICKET
 */
export function assignSupportTicketInStore(
  orgId: string,
  ticketId: string,
  assigneeId: string,
  performedBy = "ADM-0001",
  performedByName = "Operations Lead"
): SupportTicket {
  const index = mockSupportTicketsStore.findIndex(
    (t) => t.id === ticketId && t.organizationId === orgId
  );
  if (index === -1) {
    throw new Error(`Support ticket ${ticketId} not found in organization ${orgId}`);
  }

  const current = mockSupportTicketsStore[index];
  if (current.status === "Resolved" || current.status === "Closed") {
    throw new Error(`Cannot assign a ${current.status} ticket.`);
  }

  const agents = orgId === "ORG-0002" ? MOCK_ORG_0002_AGENTS : MOCK_ORG_0001_AGENTS;
  const targetAgent = agents.find((a) => a.id === assigneeId);
  if (!targetAgent) {
    throw new Error(`Invalid assignee ${assigneeId} for organization ${orgId}`);
  }

  const isReassignment = !!current.assignedTo;
  const now = new Date().toISOString();

  const updated: SupportTicket = {
    ...current,
    assignedTo: assigneeId,
    updatedAt: now,
  };

  mockSupportTicketsStore[index] = updated;

  mockSupportActivitiesStore.push({
    id: `ACT-${String(nextActivitySeq++).padStart(4, "0")}`,
    organizationId: orgId,
    ticketId,
    type: isReassignment ? "Ticket Reassigned" : "Ticket Assigned",
    performedBy,
    performedByName,
    timestamp: now,
    description: isReassignment
      ? `Ticket reassigned from ${current.assignedTo} to ${targetAgent.name} (${targetAgent.role}).`
      : `Ticket assigned to ${targetAgent.name} (${targetAgent.role}).`,
  });

  return updated;
}

/**
 * UNASSIGN SUPPORT TICKET
 */
export function unassignSupportTicketInStore(
  orgId: string,
  ticketId: string,
  performedBy = "ADM-0001",
  performedByName = "Operations Lead"
): SupportTicket {
  const index = mockSupportTicketsStore.findIndex(
    (t) => t.id === ticketId && t.organizationId === orgId
  );
  if (index === -1) {
    throw new Error(`Support ticket ${ticketId} not found in organization ${orgId}`);
  }

  const current = mockSupportTicketsStore[index];
  if (current.status === "Resolved" || current.status === "Closed") {
    throw new Error(`Cannot unassign a ${current.status} ticket.`);
  }

  const prevAssignee = current.assignedTo;
  const now = new Date().toISOString();

  const updated: SupportTicket = {
    ...current,
    assignedTo: undefined,
    updatedAt: now,
  };

  mockSupportTicketsStore[index] = updated;

  mockSupportActivitiesStore.push({
    id: `ACT-${String(nextActivitySeq++).padStart(4, "0")}`,
    organizationId: orgId,
    ticketId,
    type: "Ticket Unassigned",
    performedBy,
    performedByName,
    timestamp: now,
    description: `Ticket unassigned from ${prevAssignee || "agent"}.`,
  });

  return updated;
}

/**
 * UPDATE SUPPORT PRIORITY
 */
export function updateSupportPriorityInStore(
  orgId: string,
  ticketId: string,
  priority: SupportPriority,
  performedBy = "ADM-0001",
  performedByName = "Operations Lead"
): SupportTicket {
  const index = mockSupportTicketsStore.findIndex(
    (t) => t.id === ticketId && t.organizationId === orgId
  );
  if (index === -1) {
    throw new Error(`Support ticket ${ticketId} not found in organization ${orgId}`);
  }

  const current = mockSupportTicketsStore[index];
  const now = new Date().toISOString();

  const updated: SupportTicket = {
    ...current,
    priority,
    updatedAt: now,
  };

  mockSupportTicketsStore[index] = updated;

  mockSupportActivitiesStore.push({
    id: `ACT-${String(nextActivitySeq++).padStart(4, "0")}`,
    organizationId: orgId,
    ticketId,
    type: "Priority Changed",
    performedBy,
    performedByName,
    timestamp: now,
    description: `Priority updated from ${current.priority} to ${priority}.`,
  });

  return updated;
}

/**
 * ADD INTERNAL SUPPORT NOTE
 */
export function addSupportNoteInStore(
  orgId: string,
  ticketId: string,
  noteText: string,
  createdBy = "ADM-0001",
  createdByName = "Operations Lead"
): SupportNote {
  const noteId = `NOT-${String(nextNoteSeq++).padStart(4, "0")}`;
  const now = new Date().toISOString();

  const newNote: SupportNote = {
    id: noteId,
    ticketId,
    organizationId: orgId,
    note: noteText.trim(),
    createdBy,
    createdByName,
    createdAt: now,
  };

  mockSupportNotesStore.unshift(newNote);

  mockSupportActivitiesStore.push({
    id: `ACT-${String(nextActivitySeq++).padStart(4, "0")}`,
    organizationId: orgId,
    ticketId,
    type: "Note Added",
    performedBy: createdBy,
    performedByName: createdByName,
    timestamp: now,
    description: `Internal note added: "${noteText.slice(0, 60)}..."`,
  });

  return newNote;
}

/**
 * DISPUTE STATUS LIFECYCLE MUTATOR
 * Allowed transitions:
 * Open → Under Review, Closed
 * Under Review → Awaiting Evidence, Decision Made, Closed
 * Awaiting Evidence → Under Review, Decision Made, Closed
 * Decision Made → Resolved, Closed
 * Resolved → Closed
 * Closed → Closed (terminal)
 */
export function updateDisputeStatusInStore(
  orgId: string,
  disputeId: string,
  newStatus: DisputeStatus,
  performedBy = "ADM-0001",
  performedByName = "Operations Lead"
): Dispute {
  const index = mockDisputesStore.findIndex(
    (d) => d.id === disputeId && d.organizationId === orgId
  );
  if (index === -1) {
    throw new Error(`Dispute ${disputeId} not found in organization ${orgId}`);
  }

  const current = mockDisputesStore[index];
  const oldStatus = current.status;

  if (oldStatus === "Closed" && newStatus !== "Closed") {
    throw new Error("Closed disputes cannot be reopened.");
  }

  const validTransitions: Record<DisputeStatus, DisputeStatus[]> = {
    Open: ["Under Review", "Closed"],
    "Under Review": ["Awaiting Evidence", "Decision Made", "Closed"],
    "Awaiting Evidence": ["Under Review", "Decision Made", "Closed"],
    "Decision Made": ["Resolved", "Closed"],
    Resolved: ["Closed"],
    Closed: ["Closed"],
  };

  if (!validTransitions[oldStatus]?.includes(newStatus)) {
    throw new Error(`Invalid dispute status transition from ${oldStatus} to ${newStatus}.`);
  }

  const now = new Date().toISOString();
  const updated: Dispute = {
    ...current,
    status: newStatus,
    updatedAt: now,
    resolvedAt: newStatus === "Resolved" ? now : current.resolvedAt,
    closedAt: newStatus === "Closed" ? now : current.closedAt,
  };

  mockDisputesStore[index] = updated;

  let activityType: DisputeActivity["type"] = "Status Changed";
  if (newStatus === "Resolved") activityType = "Dispute Resolved";
  else if (newStatus === "Closed") activityType = "Dispute Closed";

  mockDisputeActivitiesStore.push({
    id: `DACT-${String(nextActivitySeq++).padStart(4, "0")}`,
    organizationId: orgId,
    disputeId,
    type: activityType,
    performedBy,
    performedByName,
    timestamp: now,
    description: `Dispute status changed from ${oldStatus} to ${newStatus}.`,
  });

  return updated;
}

/**
 * ASSIGN / REASSIGN DISPUTE
 */
export function assignDisputeInStore(
  orgId: string,
  disputeId: string,
  assigneeId: string,
  performedBy = "ADM-0001",
  performedByName = "Operations Lead"
): Dispute {
  const index = mockDisputesStore.findIndex(
    (d) => d.id === disputeId && d.organizationId === orgId
  );
  if (index === -1) {
    throw new Error(`Dispute ${disputeId} not found in organization ${orgId}`);
  }

  const current = mockDisputesStore[index];
  if (current.status === "Resolved" || current.status === "Closed") {
    throw new Error(`Cannot assign a ${current.status} dispute.`);
  }

  const agents = orgId === "ORG-0002" ? MOCK_ORG_0002_AGENTS : MOCK_ORG_0001_AGENTS;
  const targetAgent = agents.find((a) => a.id === assigneeId);
  if (!targetAgent) {
    throw new Error(`Invalid assignee ${assigneeId} for organization ${orgId}`);
  }

  const isReassignment = !!current.assignedTo;
  const now = new Date().toISOString();

  const updated: Dispute = {
    ...current,
    assignedTo: assigneeId,
    updatedAt: now,
  };

  mockDisputesStore[index] = updated;

  mockDisputeActivitiesStore.push({
    id: `DACT-${String(nextActivitySeq++).padStart(4, "0")}`,
    organizationId: orgId,
    disputeId,
    type: isReassignment ? "Dispute Reassigned" : "Dispute Assigned",
    performedBy,
    performedByName,
    timestamp: now,
    description: isReassignment
      ? `Dispute reassigned from ${current.assignedTo} to ${targetAgent.name} (${targetAgent.role}).`
      : `Dispute assigned to ${targetAgent.name} (${targetAgent.role}).`,
  });

  return updated;
}

/**
 * UNASSIGN DISPUTE
 */
export function unassignDisputeInStore(
  orgId: string,
  disputeId: string,
  performedBy = "ADM-0001",
  performedByName = "Operations Lead"
): Dispute {
  const index = mockDisputesStore.findIndex(
    (d) => d.id === disputeId && d.organizationId === orgId
  );
  if (index === -1) {
    throw new Error(`Dispute ${disputeId} not found in organization ${orgId}`);
  }

  const current = mockDisputesStore[index];
  if (current.status === "Resolved" || current.status === "Closed") {
    throw new Error(`Cannot unassign a ${current.status} dispute.`);
  }

  const prevAssignee = current.assignedTo;
  const now = new Date().toISOString();

  const updated: Dispute = {
    ...current,
    assignedTo: undefined,
    updatedAt: now,
  };

  mockDisputesStore[index] = updated;

  mockDisputeActivitiesStore.push({
    id: `DACT-${String(nextActivitySeq++).padStart(4, "0")}`,
    organizationId: orgId,
    disputeId,
    type: "Dispute Unassigned",
    performedBy,
    performedByName,
    timestamp: now,
    description: `Dispute unassigned from ${prevAssignee || "reviewer"}.`,
  });

  return updated;
}

/**
 * RECORD DISPUTE DECISION
 */
export function recordDisputeDecisionInStore(
  orgId: string,
  disputeId: string,
  outcome: DisputeOutcome,
  resolution: string,
  performedBy = "ADM-0001",
  performedByName = "Operations Lead"
): Dispute {
  const index = mockDisputesStore.findIndex(
    (d) => d.id === disputeId && d.organizationId === orgId
  );
  if (index === -1) {
    throw new Error(`Dispute ${disputeId} not found in organization ${orgId}`);
  }

  const current = mockDisputesStore[index];
  const now = new Date().toISOString();

  const updated: Dispute = {
    ...current,
    status: "Decision Made",
    outcome,
    resolution: resolution.trim(),
    updatedAt: now,
  };

  mockDisputesStore[index] = updated;

  mockDisputeActivitiesStore.push({
    id: `DACT-${String(nextActivitySeq++).padStart(4, "0")}`,
    organizationId: orgId,
    disputeId,
    type: "Decision Recorded",
    performedBy,
    performedByName,
    timestamp: now,
    description: `Decision recorded: "${outcome}". Resolution notes: "${resolution.slice(0, 80)}..."`,
  });

  return updated;
}

/**
 * ADD DISPUTE EVIDENCE
 */
export function addDisputeEvidenceInStore(
  orgId: string,
  disputeId: string,
  title: string,
  description: string,
  submittedBy = "ADM-0001",
  submittedByName = "Operations Lead"
): DisputeEvidence {
  const evidenceId = `EVD-${String(nextEvidenceSeq++).padStart(4, "0")}`;
  const now = new Date().toISOString();

  const newEvidence: DisputeEvidence = {
    id: evidenceId,
    disputeId,
    organizationId: orgId,
    title: title.trim(),
    description: description.trim(),
    submittedBy,
    submittedByName,
    submittedAt: now,
  };

  mockDisputeEvidenceStore.unshift(newEvidence);

  mockDisputeActivitiesStore.push({
    id: `DACT-${String(nextActivitySeq++).padStart(4, "0")}`,
    organizationId: orgId,
    disputeId,
    type: "Evidence Added",
    performedBy: submittedBy,
    performedByName: submittedByName,
    timestamp: now,
    description: `Evidence added: "${title}".`,
  });

  return newEvidence;
}
