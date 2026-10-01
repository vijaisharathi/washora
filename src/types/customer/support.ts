export interface FaqItemData {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export interface SupportCategoryOption {
  id: string;
  title: string;
  iconName: string;
  description: string;
}

export type IssueCategoryType =
  | "service_quality"
  | "damaged_item"
  | "missing_item"
  | "wrong_item"
  | "pickup_issue"
  | "delivery_issue"
  | "payment_pricing"
  | "provider_behaviour";

export interface IssueCategoryOption {
  id: IssueCategoryType;
  label: string;
  iconName: string;
  isUrgent?: boolean;
}

export interface CreateSupportTicketPayload {
  orderId?: string;
  issueCategory: IssueCategoryType;
  description: string;
  priority: "low" | "medium" | "high";
  contactPreference: "email" | "chat" | "phone";
  hasAttachment?: boolean;
}

export interface SupportTicketData {
  id: string;
  ticketNumber: string;
  orderId?: string;
  issueCategory: IssueCategoryType;
  issueLabel: string;
  description: string;
  priority: "low" | "medium" | "high";
  contactPreference: "email" | "chat" | "phone";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  createdAt: string;
}
