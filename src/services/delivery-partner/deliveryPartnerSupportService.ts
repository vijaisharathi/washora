import {
  SupportTicket,
  SupportFaqItem,
  CreateSupportTicketPayload,
  ReplySupportTicketPayload,
  SupportMessage,
  SupportCategory,
  NotificationPriority,
  SupportTicketStatus,
} from "@/types/delivery-partner";
import {
  MOCK_SUPPORT_FAQS,
  MOCK_SUPPORT_TICKETS,
} from "@/mocks/delivery-partner/support.mock";
import { deliveryPartnerAuthService } from "./deliveryPartnerAuthService";
import { deliveryPartnerApi } from "@/features/delivery-partner/api/deliveryPartnerApi";
import { isLiveMode } from "@/lib/api/mode";

const STORAGE_TICKETS_KEY = "washora_delivery_partner_support_tickets";

function mapBackendTicket(t: any, partnerId: string, messagesList: any[] = []): SupportTicket {
  const messages: SupportMessage[] = (messagesList.length > 0 ? messagesList : (t.messages || [])).map((m: any) => ({
    id: m.id,
    senderType: m.senderRole === "DELIVERY_PARTNER" ? "VALET_PARTNER" : "SUPPORT_OPERATIONS",
    senderName: m.senderName || (m.senderRole === "DELIVERY_PARTNER" ? "You" : "Support Operations"),
    message: m.content || m.message || "",
    timestamp: m.createdAt || new Date().toISOString(),
    attachmentUrl: m.attachmentUrl,
  }));

  return {
    id: t.id,
    ticketNumber: t.ticketNumber || `TKT-${t.id.slice(0, 8).toUpperCase()}`,
    partnerId: t.userId || partnerId,
    category: (t.category as SupportCategory) || "OTHER",
    priority: (t.priority as NotificationPriority) || "NORMAL",
    status: (t.status as SupportTicketStatus) || "OPEN",
    subject: t.subject || "Support Inquiry",
    description: t.description || "",
    relatedOrderId: t.relatedBookingId,
    createdAt: t.createdAt || new Date().toISOString(),
    updatedAt: t.updatedAt || new Date().toISOString(),
    messages,
  };
}

export interface IDeliveryPartnerSupportService {
  getFaqs(searchQuery?: string): Promise<SupportFaqItem[]>;
  getTickets(): Promise<SupportTicket[]>;
  getTicketById(id: string): Promise<SupportTicket | null>;
  createTicket(payload: CreateSupportTicketPayload): Promise<SupportTicket>;
  replyTicket(payload: ReplySupportTicketPayload): Promise<SupportTicket>;
}

class DeliveryPartnerSupportService implements IDeliveryPartnerSupportService {
  private memoryTickets: SupportTicket[] | null = null;

  private loadTickets(): SupportTicket[] {
    if (this.memoryTickets) return this.memoryTickets;
    if (typeof window !== "undefined") {
      try {
        const val = localStorage.getItem(STORAGE_TICKETS_KEY);
        if (val) {
          this.memoryTickets = JSON.parse(val);
          return this.memoryTickets!;
        }
      } catch {
        // ignore
      }
    }
    this.memoryTickets = [...MOCK_SUPPORT_TICKETS];
    return this.memoryTickets;
  }

  private persistTickets(tickets: SupportTicket[]) {
    this.memoryTickets = tickets;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_TICKETS_KEY, JSON.stringify(tickets));
      } catch {
        // ignore
      }
    }
  }

  async getFaqs(searchQuery?: string): Promise<SupportFaqItem[]> {
    await new Promise((res) => setTimeout(res, 30));
    if (!searchQuery || !searchQuery.trim()) return MOCK_SUPPORT_FAQS;

    const q = searchQuery.toLowerCase().trim();
    return MOCK_SUPPORT_FAQS.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
    );
  }

  async getTickets(): Promise<SupportTicket[]> {
    if (isLiveMode()) {
      const session = await deliveryPartnerAuthService.getSession();
      const currentPartnerId = session.partner?.id || "dp-1";

      const res = await deliveryPartnerApi.support.listTickets();
      const items: any[] = Array.isArray(res.data) ? res.data : [];
      return items.map((t: any) => mapBackendTicket(t, currentPartnerId));
    }

    await new Promise((res) => setTimeout(res, 50));
    const session = await deliveryPartnerAuthService.getSession();
    const currentPartnerId = session.partner?.id || "dp-1";

    return this.loadTickets().filter((t) => t.partnerId === currentPartnerId);
  }

  async getTicketById(id: string): Promise<SupportTicket | null> {
    if (isLiveMode()) {
      const session = await deliveryPartnerAuthService.getSession();
      const currentPartnerId = session.partner?.id || "dp-1";

      try {
        const [ticketRes, messagesRes] = await Promise.all([
          deliveryPartnerApi.support.getTicket(id),
          deliveryPartnerApi.support.listTicketMessages(id).catch(() => ({ data: [] as any })),
        ]);

        if (!ticketRes.data) return null;
        const messages: any[] = Array.isArray(messagesRes.data) ? messagesRes.data : [];
        return mapBackendTicket(ticketRes.data, currentPartnerId, messages);
      } catch {
        return null;
      }
    }

    await new Promise((res) => setTimeout(res, 50));
    const session = await deliveryPartnerAuthService.getSession();
    const currentPartnerId = session.partner?.id || "dp-1";

    const tickets = this.loadTickets().filter((t) => t.partnerId === currentPartnerId);
    return tickets.find((t) => t.id === id || t.ticketNumber === id) || null;
  }

  async createTicket(payload: CreateSupportTicketPayload): Promise<SupportTicket> {
    if (isLiveMode()) {
      const session = await deliveryPartnerAuthService.getSession();
      const currentPartnerId = session.partner?.id || "dp-1";

      const res = await deliveryPartnerApi.support.createTicket({
        subject: payload.subject,
        description: payload.description,
        category: payload.category,
        priority: payload.priority,
      });

      return mapBackendTicket(res.data, currentPartnerId);
    }

    await new Promise((res) => setTimeout(res, 100));
    const session = await deliveryPartnerAuthService.getSession();
    const currentPartnerId = session.partner?.id || "dp-1";
    const partnerName = session.partner?.name || "Vikram Singh";

    const newTicket: SupportTicket = {
      id: `tkt-${Date.now()}`,
      ticketNumber: `TKT-VALET-${Math.floor(1000 + Math.random() * 9000)}`,
      partnerId: currentPartnerId,
      category: payload.category,
      priority: payload.priority,
      status: "OPEN",
      subject: payload.subject,
      description: payload.description,
      relatedOrderId: payload.relatedOrderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderType: "VALET_PARTNER",
          senderName: partnerName,
          message: payload.description,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const currentTickets = this.loadTickets();
    this.persistTickets([newTicket, ...currentTickets]);
    return newTicket;
  }

  async replyTicket(payload: ReplySupportTicketPayload): Promise<SupportTicket> {
    if (isLiveMode()) {
      await deliveryPartnerApi.support.addTicketMessage(payload.ticketId, payload.message);
      const updated = await this.getTicketById(payload.ticketId);
      if (updated) return updated;
    }

    await new Promise((res) => setTimeout(res, 80));
    const session = await deliveryPartnerAuthService.getSession();
    const partnerName = session.partner?.name || "Vikram Singh";

    const tickets = this.loadTickets();
    const target = tickets.find((t) => t.id === payload.ticketId);
    if (!target) {
      throw new Error(`Ticket #${payload.ticketId} not found.`);
    }

    const newMsg: SupportMessage = {
      id: `msg-${Date.now()}`,
      senderType: "VALET_PARTNER",
      senderName: partnerName,
      message: payload.message,
      timestamp: new Date().toISOString(),
    };

    target.messages.push(newMsg);
    target.updatedAt = new Date().toISOString();
    this.persistTickets(tickets);

    return { ...target };
  }
}

export const deliveryPartnerSupportService = new DeliveryPartnerSupportService();
