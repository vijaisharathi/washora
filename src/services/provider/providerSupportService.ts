import {
  ProviderFaqItem,
  ProviderSupportTicket,
  ProviderSupportCategory,
  ProviderSupportMessage,
  CreateSupportTicketPayload,
  AddTicketMessagePayload,
} from "@/types/provider/support";
import {
  MOCK_PROVIDER_FAQS,
  MOCK_PROVIDER_TICKETS,
} from "@/mocks/provider/support.mock";
import { providerApi } from "@/features/provider/api/providerApi";
import { isLiveMode } from "@/lib/api/mode";

const STORAGE_SUPPORT_KEY = "washora_provider_support_store";

let inMemoryTickets: ProviderSupportTicket[] = [...MOCK_PROVIDER_TICKETS];

export interface IProviderSupportService {
  getFaqs(category?: ProviderSupportCategory, search?: string): Promise<ProviderFaqItem[]>;
  getTickets(providerId?: string): Promise<ProviderSupportTicket[]>;
  getTicketById(ticketId: string, providerId?: string): Promise<ProviderSupportTicket | null>;
  createTicket(
    payload: CreateSupportTicketPayload,
    providerId?: string
  ): Promise<ProviderSupportTicket>;
  addTicketMessage(
    payload: AddTicketMessagePayload,
    providerId?: string
  ): Promise<ProviderSupportTicket>;
  closeTicket(ticketId: string, providerId?: string): Promise<ProviderSupportTicket>;
}

class ProviderSupportService implements IProviderSupportService {
  private toSupportCategory(cat: string): ProviderSupportCategory {
    const c = (cat || "").toUpperCase();
    if (c.includes("PAY")) return "PAYMENTS";
    if (c.includes("ORDER")) return "ORDERS";
    if (c.includes("BOOK")) return "BOOKINGS";
    if (c.includes("ONBOARD")) return "ONBOARDING";
    return "TECH";
  }

  private async loadStoredTickets(): Promise<ProviderSupportTicket[]> {
    if (typeof window === "undefined") return inMemoryTickets;
    try {
      const stored = localStorage.getItem(STORAGE_SUPPORT_KEY);
      if (stored) {
        inMemoryTickets = JSON.parse(stored);
        return inMemoryTickets;
      }
    } catch {
      return inMemoryTickets;
    }
    return inMemoryTickets;
  }

  private persistTickets(tickets: ProviderSupportTicket[]): void {
    inMemoryTickets = tickets;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_SUPPORT_KEY, JSON.stringify(tickets));
      } catch {
        // ignore
      }
    }
  }

  async getFaqs(category?: ProviderSupportCategory, search?: string): Promise<ProviderFaqItem[]> {
    await new Promise((res) => setTimeout(res, 50));
    let faqs = [...MOCK_PROVIDER_FAQS];

    if (category) {
      faqs = faqs.filter((f) => f.category === category);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase();
      faqs = faqs.filter(
        (f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
      );
    }

    return faqs;
  }

  async getTickets(providerId: string = "prov-1"): Promise<ProviderSupportTicket[]> {
    if (isLiveMode()) {
      const res = await providerApi.support.listTickets();
      const raw = Array.isArray(res.data) ? res.data : (res as any).data?.items || [];

      return raw.map((t: any) => ({
        id: t.id,
        ticketNumber: t.ticketNumber || `SUP-${t.id.slice(0, 8).toUpperCase()}`,
        providerId,
        subject: t.subject,
        description: t.subject || "Support inquiry",
        category: this.toSupportCategory(t.category),
        priority: (t.priority || "MEDIUM") as ProviderSupportTicket["priority"],
        status: (t.status === "RESOLVED" || t.status === "CLOSED" ? "RESOLVED" : "OPEN") as ProviderSupportTicket["status"],
        messages: [],
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      }));
    }

    await new Promise((res) => setTimeout(res, 50));
    const all = await this.loadStoredTickets();
    return all.filter((t) => t.providerId === providerId);
  }

  async getTicketById(ticketId: string, providerId: string = "prov-1"): Promise<ProviderSupportTicket | null> {
    if (isLiveMode()) {
      try {
        const res = await providerApi.support.getTicket(ticketId);
        const t = res.data;

        let messagesList: any[] = [];
        try {
          const msgRes = await providerApi.support.listTicketMessages(ticketId);
          messagesList = msgRes.data || [];
        } catch {
          // ignore empty message list
        }

        const messages: ProviderSupportMessage[] = messagesList.map((m: any) => ({
          id: m.id,
          senderRole: (m.senderRole === "PROVIDER" ? "PROVIDER" : "SUPPORT_AGENT") as "PROVIDER" | "SUPPORT_AGENT",
          senderName: m.senderName || (m.senderRole === "PROVIDER" ? "You" : "Operations Agent"),
          text: m.message || "",
          timestamp: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now",
          createdAt: m.createdAt || new Date().toISOString(),
        }));

        return {
          id: t.id,
          ticketNumber: t.ticketNumber || `SUP-${t.id.slice(0, 8).toUpperCase()}`,
          providerId,
          subject: t.subject,
          description: t.subject,
          category: this.toSupportCategory(t.category),
          priority: (t.priority || "MEDIUM") as ProviderSupportTicket["priority"],
          status: (t.status === "RESOLVED" || t.status === "CLOSED" ? "RESOLVED" : "OPEN") as ProviderSupportTicket["status"],
          messages,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
        };
      } catch {
        return null;
      }
    }

    await new Promise((res) => setTimeout(res, 50));
    const all = await this.loadStoredTickets();
    return all.find((t) => t.id === ticketId && t.providerId === providerId) || null;
  }

  async createTicket(
    payload: CreateSupportTicketPayload,
    providerId: string = "prov-1"
  ): Promise<ProviderSupportTicket> {
    if (isLiveMode()) {
      const res = await providerApi.support.createTicket({
        subject: payload.subject,
        category: payload.category,
        priority: payload.priority || "MEDIUM",
        message: payload.description,
      });
      const t = res.data;
      return {
        id: t.id,
        ticketNumber: t.ticketNumber || `SUP-${t.id.slice(0, 8).toUpperCase()}`,
        providerId,
        subject: t.subject,
        description: payload.description,
        category: payload.category,
        priority: payload.priority,
        status: "OPEN",
        entityId: payload.entityId,
        entityType: payload.entityType,
        messages: [
          {
            id: `msg_${Date.now()}`,
            senderRole: "PROVIDER",
            senderName: "You",
            text: payload.description,
            timestamp: "Just now",
            createdAt: new Date().toISOString(),
          },
        ],
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      };
    }

    await new Promise((res) => setTimeout(res, 350));
    const all = await this.loadStoredTickets();

    const newTicket: ProviderSupportTicket = {
      id: `tkt_${Date.now()}`,
      ticketNumber: `SUP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      providerId,
      subject: payload.subject,
      description: payload.description,
      category: payload.category,
      priority: payload.priority,
      status: "OPEN",
      entityId: payload.entityId,
      entityType: payload.entityType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `msg_${Date.now()}`,
          senderRole: "PROVIDER",
          senderName: "You",
          text: payload.description,
          timestamp: "Just now",
          createdAt: new Date().toISOString(),
        },
      ],
    };

    const updated = [newTicket, ...all];
    this.persistTickets(updated);
    return newTicket;
  }

  async addTicketMessage(
    payload: AddTicketMessagePayload,
    providerId: string = "prov-1"
  ): Promise<ProviderSupportTicket> {
    if (isLiveMode()) {
      await providerApi.support.addTicketMessage(payload.ticketId, payload.messageText);
      const ticket = await this.getTicketById(payload.ticketId, providerId);
      if (ticket) return ticket;
    }

    await new Promise((res) => setTimeout(res, 300));
    const all = await this.loadStoredTickets();
    const index = all.findIndex((t) => t.id === payload.ticketId && t.providerId === providerId);

    if (index === -1) {
      throw new Error(`Ticket ${payload.ticketId} not found.`);
    }

    const currentTicket = all[index];
    const newMessage: ProviderSupportMessage = {
      id: `msg_${Date.now()}`,
      senderRole: "PROVIDER",
      senderName: "You (Studio Manager)",
      text: payload.messageText,
      timestamp: "Just now",
      createdAt: new Date().toISOString(),
    };

    const updatedTicket: ProviderSupportTicket = {
      ...currentTicket,
      messages: [...currentTicket.messages, newMessage],
      updatedAt: new Date().toISOString(),
    };

    all[index] = updatedTicket;
    this.persistTickets([...all]);
    return updatedTicket;
  }

  async closeTicket(ticketId: string, providerId: string = "prov-1"): Promise<ProviderSupportTicket> {
    if (isLiveMode()) {
      const ticket = await this.getTicketById(ticketId, providerId);
      if (ticket) return { ...ticket, status: "RESOLVED" };
    }

    await new Promise((res) => setTimeout(res, 250));
    const all = await this.loadStoredTickets();
    const index = all.findIndex((t) => t.id === ticketId && t.providerId === providerId);

    if (index === -1) {
      throw new Error(`Ticket ${ticketId} not found.`);
    }

    const updated: ProviderSupportTicket = {
      ...all[index],
      status: "RESOLVED",
      updatedAt: new Date().toISOString(),
    };

    all[index] = updated;
    this.persistTickets([...all]);
    return updated;
  }
}

export const providerSupportService = new ProviderSupportService();
