/**
 * Type definitions for WASHORA Service Provider Support (P12)
 */

export type ProviderSupportStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type ProviderSupportPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type ProviderSupportCategory =
  | "PAYMENTS"
  | "ORDERS"
  | "BOOKINGS"
  | "ONBOARDING"
  | "TECH";

export interface ProviderSupportMessage {
  id: string;
  senderRole: "PROVIDER" | "SUPPORT_AGENT";
  senderName: string;
  text: string;
  timestamp: string; // e.g. "Sep 2, 09:41 AM"
  createdAt: string;
}

export interface ProviderSupportTicket {
  id: string;
  ticketNumber: string; // e.g. "SUP-20260902-0184"
  providerId: string;
  subject: string;
  description: string;
  category: ProviderSupportCategory;
  priority: ProviderSupportPriority;
  status: ProviderSupportStatus;
  entityId?: string; // e.g. "ord-1042" or "po-43"
  entityType?: "ORDER" | "BOOKING" | "PAYOUT" | "GENERAL";
  messages: ProviderSupportMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ProviderFaqItem {
  id: string;
  category: ProviderSupportCategory;
  question: string;
  answer: string;
}

export interface CreateSupportTicketPayload {
  subject: string;
  description: string;
  category: ProviderSupportCategory;
  priority: ProviderSupportPriority;
  entityId?: string;
  entityType?: "ORDER" | "BOOKING" | "PAYOUT" | "GENERAL";
}

export interface AddTicketMessagePayload {
  ticketId: string;
  messageText: string;
}
