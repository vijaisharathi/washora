import {
  FaqItemData,
  SupportCategoryOption,
  IssueCategoryOption,
  CreateSupportTicketPayload,
  SupportTicketData,
  IssueCategoryType,
} from "@/types/customer/support";
import { customerApi } from "@/features/customer/api/customerApi";
import { isLiveMode } from "@/lib/api";

const STORAGE_TICKETS_KEY = "washora_customer_support_tickets";

export const ISSUE_CATEGORIES: IssueCategoryOption[] = [
  { id: "service_quality", label: "Service Quality", iconName: "thumb_down" },
  { id: "damaged_item", label: "Damaged Item", iconName: "broken_image", isUrgent: true },
  { id: "missing_item", label: "Missing Item", iconName: "search_off" },
  { id: "wrong_item", label: "Wrong Item", iconName: "sync_problem" },
  { id: "pickup_issue", label: "Pickup Issue", iconName: "storefront" },
  { id: "delivery_issue", label: "Delivery Issue", iconName: "local_shipping" },
  { id: "payment_pricing", label: "Payment / Pricing", iconName: "payments" },
  { id: "provider_behaviour", label: "Provider Behaviour", iconName: "person_alert" },
];

export const SUPPORT_CATEGORIES: SupportCategoryOption[] = [
  { id: "orders", title: "Orders & Tracking", iconName: "receipt_long", description: "Pickup windows, turnaround, and status updates" },
  { id: "payments", title: "Payments & Refunds", iconName: "payments", description: "UPI, billing, coupons, and refund timeline" },
  { id: "care", title: "Garment Care", iconName: "dry_cleaning", description: "Fabric safety, detergent quality, and leather care" },
  { id: "valet", title: "Valet Logistics", iconName: "local_shipping", description: "Doorstep collection, address changes, and rescheduling" },
];

export const FAQS: FaqItemData[] = [
  {
    id: "faq-1",
    category: "orders",
    question: "How do I track my active care order?",
    answer: "You can track your order live from the 'My Orders' tab or by tapping 'Track Order' on your confirmation screen. We provide an 8-step live status timeline from pickup to final doorstep delivery.",
  },
  {
    id: "faq-2",
    category: "orders",
    question: "Can I reschedule or cancel my pickup?",
    answer: "Yes. You can reschedule or cancel for free anytime before your valet arrives for pickup. Tap 'Reschedule' or 'Cancel Order' on your live tracking page.",
  },
  {
    id: "faq-3",
    category: "care",
    question: "What garment care standards do partner studios follow?",
    answer: "All WASHORA partner studios are certified and use pH-neutral, eco-friendly solvents and premium textile care techniques specifically formulated for delicate silks, wools, and sneakers.",
  },
  {
    id: "faq-4",
    category: "payments",
    question: "When will I receive my refund if an order is cancelled?",
    answer: "Full refunds are credited directly to your original payment method within 3–5 business days after cancellation.",
  },
  {
    id: "faq-5",
    category: "valet",
    question: "What if I am unavailable during the pickup window?",
    answer: "Our care valet will call your verified phone number. If you are away, you can quickly reschedule your 2-hour window in the app with zero cancellation fee.",
  },
];

function mapTicket(t: Record<string, unknown>): SupportTicketData {
  const idStr = String(t.id || "");
  return {
    id: idStr,
    ticketNumber: String(t.ticketNumber || `TKT-${idStr.slice(0, 8).toUpperCase()}`),
    orderId: String(t.bookingId || t.orderId || "WSH-20260901-1024"),
    issueCategory: (String(t.category || "service_quality")) as IssueCategoryType,
    issueLabel: String(t.category || "Service Quality"),
    description: String(t.description || t.subject || ""),
    priority: (String(t.priority || "medium").toLowerCase() as "low" | "medium" | "high"),
    contactPreference: (String(t.contactPreference || "chat").toLowerCase() as "email" | "chat" | "phone"),
    status: (String(t.status || "OPEN")) as SupportTicketData["status"],
    createdAt: String(t.createdAt || new Date().toISOString()),
  };
}

export interface ISupportService {
  getFaqs(): Promise<FaqItemData[]>;
  getSupportCategories(): Promise<SupportCategoryOption[]>;
  getIssueCategories(): Promise<IssueCategoryOption[]>;
  createSupportTicket(payload: CreateSupportTicketPayload): Promise<SupportTicketData>;
  getUserTickets(): Promise<SupportTicketData[]>;
}

class SupportService implements ISupportService {
  async getFaqs(): Promise<FaqItemData[]> {
    await new Promise((res) => setTimeout(res, 50));
    return FAQS;
  }

  async getSupportCategories(): Promise<SupportCategoryOption[]> {
    await new Promise((res) => setTimeout(res, 50));
    return SUPPORT_CATEGORIES;
  }

  async getIssueCategories(): Promise<IssueCategoryOption[]> {
    await new Promise((res) => setTimeout(res, 50));
    return ISSUE_CATEGORIES;
  }

  async createSupportTicket(payload: CreateSupportTicketPayload): Promise<SupportTicketData> {
    if (isLiveMode()) {
      try {
        const categoryObj = ISSUE_CATEGORIES.find((c) => c.id === payload.issueCategory);
        const res = await customerApi.support.createTicket({
          category: payload.issueCategory,
          subject: categoryObj?.label || "Customer Support",
          description: payload.description,
          message: payload.description,
          priority: payload.priority?.toUpperCase() || "MEDIUM",
          bookingId: payload.orderId,
        });

        const created = mapTicket(res.data as Record<string, unknown>);
        if (typeof window !== "undefined") {
          try {
            const stored = localStorage.getItem(STORAGE_TICKETS_KEY);
            const existing: SupportTicketData[] = stored ? JSON.parse(stored) : [];
            localStorage.setItem(STORAGE_TICKETS_KEY, JSON.stringify([created, ...existing]));
          } catch {
            // ignore
          }
        }
        return created;
      } catch (err: unknown) {
        throw err;
      }
    }

    return this.createSupportTicketMock(payload);
  }

  private async createSupportTicketMock(payload: CreateSupportTicketPayload): Promise<SupportTicketData> {
    await new Promise((res) => setTimeout(res, 700));

    const categoryObj = ISSUE_CATEGORIES.find((c) => c.id === payload.issueCategory);

    const ticket: SupportTicketData = {
      id: `tkt-${Date.now()}`,
      ticketNumber: `TKT-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(100 + Math.random() * 900)}`,
      orderId: payload.orderId || "WSH-20260901-1024",
      issueCategory: payload.issueCategory,
      issueLabel: categoryObj?.label || "Service Quality",
      description: payload.description,
      priority: payload.priority,
      contactPreference: payload.contactPreference,
      status: "OPEN",
      createdAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_TICKETS_KEY);
        const existing: SupportTicketData[] = stored ? JSON.parse(stored) : [];
        localStorage.setItem(STORAGE_TICKETS_KEY, JSON.stringify([ticket, ...existing]));
      } catch {
        // ignore
      }
    }

    return ticket;
  }

  async getUserTickets(): Promise<SupportTicketData[]> {
    if (isLiveMode()) {
      try {
        const res = await customerApi.support.listTickets();
        const data = Array.isArray(res.data) ? res.data : [];
        return (data as Record<string, unknown>[]).map(mapTicket);
      } catch (err: unknown) {
        throw err;
      }
    }

    return this.getUserTicketsMock();
  }

  private async getUserTicketsMock(): Promise<SupportTicketData[]> {
    await new Promise((res) => setTimeout(res, 100));

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_TICKETS_KEY);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch {
        // ignore
      }
    }

    return [];
  }
}

export const supportService = new SupportService();
