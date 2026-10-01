import { z } from "zod";

/**
 * CANONICAL SUPPORT TICKET DOMAIN TYPES (A13)
 */

export const SUPPORT_STATUSES = [
  "Open",
  "In Progress",
  "Waiting for Response",
  "Resolved",
  "Closed",
] as const;
export type SupportStatus = (typeof SUPPORT_STATUSES)[number];

export const SUPPORT_PRIORITIES = [
  "Low",
  "Normal",
  "High",
  "Urgent",
] as const;
export type SupportPriority = (typeof SUPPORT_PRIORITIES)[number];

export const SUPPORT_CATEGORIES = [
  "Booking Issue",
  "Provider Issue",
  "Delivery Issue",
  "Payment Issue",
  "Service Issue",
  "Account Issue",
  "Technical Issue",
  "General",
] as const;
export type SupportCategory = (typeof SUPPORT_CATEGORIES)[number];

export const SUPPORT_REQUESTER_TYPES = [
  "Customer",
  "Provider",
  "Delivery Partner",
  "Admin",
  "Operations",
] as const;
export type SupportRequesterType = (typeof SUPPORT_REQUESTER_TYPES)[number];

export interface SupportTicket {
  id: string;
  organizationId: string;

  ticketNumber: string;

  requesterType: SupportRequesterType;
  requesterId: string;

  category: SupportCategory;
  priority: SupportPriority;
  status: SupportStatus;

  subject: string;
  description: string;

  bookingId?: string;
  paymentId?: string;
  transactionId?: string;
  reviewId?: string;

  assignedTo?: string; // Admin / Operations user ID

  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;

  resolution?: string;
}

export interface SupportNote {
  id: string;
  ticketId: string;
  organizationId: string;

  note: string;

  createdBy: string;
  createdByName: string;
  createdAt: string;
}

export type SupportActivityType =
  | "Ticket Created"
  | "Ticket Assigned"
  | "Ticket Reassigned"
  | "Ticket Unassigned"
  | "Status Changed"
  | "Priority Changed"
  | "Note Added"
  | "Ticket Resolved"
  | "Ticket Closed";

export interface SupportActivity {
  id: string;
  organizationId: string;
  ticketId: string;

  type: SupportActivityType;
  performedBy: string;
  performedByName: string;
  timestamp: string;

  description: string;
}

/**
 * CANONICAL DISPUTE DOMAIN TYPES (A13)
 */

export const DISPUTE_STATUSES = [
  "Open",
  "Under Review",
  "Awaiting Evidence",
  "Decision Made",
  "Resolved",
  "Closed",
] as const;
export type DisputeStatus = (typeof DISPUTE_STATUSES)[number];

export const DISPUTE_TYPES = [
  "Service Quality",
  "Booking Issue",
  "Payment Dispute",
  "Provider Conduct",
  "Delivery Issue",
  "Cancellation Dispute",
  "Other",
] as const;
export type DisputeType = (typeof DISPUTE_TYPES)[number];

export const DISPUTE_OUTCOMES = [
  "Customer Favored",
  "Provider Favored",
  "Delivery Partner Favored",
  "Partially Resolved",
  "No Action Required",
] as const;
export type DisputeOutcome = (typeof DISPUTE_OUTCOMES)[number];

export interface Dispute {
  id: string;
  organizationId: string;

  disputeNumber: string;

  bookingId: string;

  raisedByType: "Customer" | "Provider" | "Delivery Partner";
  raisedById: string;

  againstType: "Customer" | "Provider" | "Delivery Partner";
  againstId: string;

  type: DisputeType;
  priority: SupportPriority;
  status: DisputeStatus;

  subject: string;
  description: string;

  amountInvolved?: number;

  assignedTo?: string; // Admin / Operations user ID

  outcome?: DisputeOutcome;
  resolution?: string;

  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
}

export interface DisputeEvidence {
  id: string;
  disputeId: string;
  organizationId: string;

  title: string;
  description: string;

  submittedBy: string;
  submittedByName: string;
  submittedAt: string;
}

export type DisputeActivityType =
  | "Dispute Created"
  | "Dispute Assigned"
  | "Dispute Reassigned"
  | "Dispute Unassigned"
  | "Status Changed"
  | "Evidence Added"
  | "Decision Recorded"
  | "Dispute Resolved"
  | "Dispute Closed";

export interface DisputeActivity {
  id: string;
  organizationId: string;
  disputeId: string;

  type: DisputeActivityType;
  performedBy: string;
  performedByName: string;
  timestamp: string;

  description: string;
}

/**
 * WORKLOAD & ASSIGNEE TYPES
 */
export type AgentWorkloadLevel = "Low" | "Medium" | "High";

export interface AssigneeOption {
  id: string;
  name: string;
  role: "Admin" | "Operations";
  primaryWorkArea: string;
  activeTicketCount: number;
  workloadLevel: AgentWorkloadLevel;
}

/**
 * SUMMARY METRICS
 */
export interface SupportSummaryMetrics {
  totalTickets: number;
  openCount: number;
  inProgressCount: number;
  waitingForResponseCount: number;
  resolvedCount: number;
  closedCount: number;
  urgentCount: number;
}

export interface DisputeSummaryMetrics {
  totalDisputes: number;
  openCount: number;
  underReviewCount: number;
  awaitingEvidenceCount: number;
  decisionMadeCount: number;
  resolvedCount: number;
  closedCount: number;
  urgentCount: number;
}

/**
 * QUERY PARAMS & RESULTS
 */
export interface ListSupportTicketsParams {
  organizationId: string;
  search?: string;
  status?: SupportStatus | "all";
  priority?: SupportPriority | "all";
  category?: SupportCategory | "all";
  requesterType?: SupportRequesterType | "all";
  assignedState?: "all" | "assigned" | "unassigned";
  datePreset?: "all" | "today" | "yesterday" | "last_7_days" | "last_30_days";
  sort?: "newest" | "oldest" | "priority" | "status" | "requester" | "category" | "updated_at";
  sortDirection?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface ListSupportTicketsResult {
  tickets: SupportTicket[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SupportTicketDetailResult {
  ticket: SupportTicket;
  requester: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    type: SupportRequesterType;
  };
  assignedAgent?: {
    id: string;
    name: string;
    role: string;
    assignedAt?: string;
  };
  relatedRecords?: {
    booking?: {
      id: string;
      bookingNumber: string;
      serviceName: string;
      status: string;
      scheduledDate: string;
      route: string;
    };
    payment?: {
      id: string;
      amount: number;
      status: string;
      paymentMethod: string;
      route?: string;
    };
    transaction?: {
      id: string;
      reference: string;
      amount: number;
      type: string;
    };
    review?: {
      id: string;
      rating: number;
      comment: string;
      status: string;
      route: string;
    };
  };
  notes: SupportNote[];
  activities: SupportActivity[];
}

export interface ListDisputesParams {
  organizationId: string;
  search?: string;
  status?: DisputeStatus | "all";
  type?: DisputeType | "all";
  priority?: SupportPriority | "all";
  raisedBy?: "all" | "Customer" | "Provider" | "Delivery Partner";
  assignedState?: "all" | "assigned" | "unassigned";
  datePreset?: "all" | "today" | "yesterday" | "last_7_days" | "last_30_days";
  sort?: "newest" | "oldest" | "highest_priority" | "amount" | "status" | "updated_at";
  sortDirection?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface ListDisputesResult {
  disputes: Dispute[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DisputeDetailResult {
  dispute: Dispute;
  raisedBy: {
    id: string;
    name: string;
    role: string;
    email?: string;
    phone?: string;
  };
  against: {
    id: string;
    name: string;
    role: string;
    email?: string;
    phone?: string;
  };
  booking?: {
    id: string;
    bookingNumber: string;
    serviceName: string;
    status: string;
    scheduledDate: string;
    totalAmount: number;
    route: string;
  };
  financialContext?: {
    amountInvolved?: number;
    paymentId?: string;
    paymentStatus?: string;
    transactionId?: string;
    transactionReference?: string;
  };
  assignedReviewer?: {
    id: string;
    name: string;
    role: string;
    assignedAt?: string;
  };
  evidence: DisputeEvidence[];
  activities: DisputeActivity[];
}

/**
 * ZOD VALIDATION SCHEMAS
 */

export const CreateSupportTicketSchema = z.object({
  requesterType: z.enum(SUPPORT_REQUESTER_TYPES, {
    required_error: "Requester type is required.",
  }),
  requesterId: z.string({
    required_error: "Select a requester.",
  }).min(1, "Select a requester."),
  category: z.enum(SUPPORT_CATEGORIES, {
    required_error: "Support category is required.",
  }),
  priority: z.enum(SUPPORT_PRIORITIES, {
    required_error: "Support priority is required.",
  }).default("Normal"),
  subject: z
    .string({ required_error: "Subject is required." })
    .min(5, "Subject must be at least 5 characters.")
    .max(150, "Subject cannot exceed 150 characters."),
  description: z
    .string({ required_error: "Description is required." })
    .min(10, "Description must be at least 10 characters.")
    .max(2000, "Description cannot exceed 2000 characters."),
  bookingId: z.string().optional(),
  paymentId: z.string().optional(),
  transactionId: z.string().optional(),
  reviewId: z.string().optional(),
});

export type CreateSupportTicketFormValues = z.infer<typeof CreateSupportTicketSchema>;

export const AddSupportNoteSchema = z.object({
  note: z
    .string({ required_error: "Note text is required." })
    .min(5, "Note must be at least 5 characters.")
    .max(500, "Note cannot exceed 500 characters."),
});

export type AddSupportNoteFormValues = z.infer<typeof AddSupportNoteSchema>;

export const ResolveSupportTicketSchema = z.object({
  resolution: z
    .string({ required_error: "Resolution is required." })
    .min(10, "Resolution must be at least 10 characters.")
    .max(1000, "Resolution cannot exceed 1000 characters."),
});

export type ResolveSupportTicketFormValues = z.infer<typeof ResolveSupportTicketSchema>;

export const DisputeDecisionSchema = z.object({
  outcome: z.enum(DISPUTE_OUTCOMES, {
    required_error: "Dispute outcome is required.",
  }),
  resolution: z
    .string({ required_error: "Dispute resolution is required." })
    .min(10, "Dispute resolution must be at least 10 characters.")
    .max(1000, "Dispute resolution cannot exceed 1000 characters."),
});

export type DisputeDecisionFormValues = z.infer<typeof DisputeDecisionSchema>;

export const AddDisputeEvidenceSchema = z.object({
  title: z
    .string({ required_error: "Evidence title is required." })
    .min(3, "Evidence title must be at least 3 characters.")
    .max(120, "Evidence title cannot exceed 120 characters."),
  description: z
    .string({ required_error: "Evidence description is required." })
    .min(10, "Evidence description must be at least 10 characters.")
    .max(1000, "Evidence description cannot exceed 1000 characters."),
});

export type AddDisputeEvidenceFormValues = z.infer<typeof AddDisputeEvidenceSchema>;

export const AssignSupportSchema = z.object({
  assigneeId: z.string().min(1, "Select an assignee."),
});

export type AssignSupportFormValues = z.infer<typeof AssignSupportSchema>;
