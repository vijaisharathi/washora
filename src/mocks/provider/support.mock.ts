import {
  ProviderFaqItem,
  ProviderSupportTicket,
} from "@/types/provider/support";

export const MOCK_PROVIDER_FAQS: ProviderFaqItem[] = [
  {
    id: "faq-1",
    category: "PAYMENTS",
    question: "When are weekly settlement payouts transferred to my studio account?",
    answer:
      "Automated payouts are processed every Monday morning via NEFT/IMPS. Funds typically reflect in your registered bank account within 2–4 business hours.",
  },
  {
    id: "faq-2",
    category: "ORDERS",
    question: "How do I report garment damage identified during intake inspection?",
    answer:
      "Use the 'Report Issue' SOP tool on the order detail processing screen. Upload clear photos of existing pre-treatment damage before commencing hydrocarbon or wet cleaning.",
  },
  {
    id: "faq-3",
    category: "BOOKINGS",
    question: "What happens if our studio exceeds daily garment capacity?",
    answer:
      "You can configure daily capacity caps in the Availability & Scheduling dashboard. When the limit is reached, our smart dispatch system prevents further automated bookings for that day.",
  },
  {
    id: "faq-4",
    category: "ONBOARDING",
    question: "How do I update verified business documents or GSTIN records?",
    answer:
      "Navigate to Provider Profile & Business Setup. Document re-verification takes 24–48 hours by our compliance operations team.",
  },
];

export const MOCK_PROVIDER_TICKETS: ProviderSupportTicket[] = [
  {
    id: "sup-184",
    ticketNumber: "SUP-20260902-0184",
    providerId: "prov-1",
    subject: "Payout has not reached my account.",
    description: "My scheduled payout hasn't reached my account. It usually arrives by Tuesday morning.",
    category: "PAYMENTS",
    priority: "HIGH",
    status: "OPEN",
    entityId: "po-43",
    entityType: "PAYOUT",
    messages: [
      {
        id: "msg-1",
        senderRole: "PROVIDER",
        senderName: "LuxeCare Studio",
        text: "My scheduled payout hasn't reached my account. It usually arrives by Tuesday morning. Can someone check on this?",
        timestamp: "Sep 2, 09:41 AM",
        createdAt: "2026-09-02T09:41:00Z",
      },
      {
        id: "msg-2",
        senderRole: "SUPPORT_AGENT",
        senderName: "WASHORA Support Specialist",
        text: "Thanks for reaching out. We are reviewing the payout status. There appears to be a slight delay with our payment processor batch this morning. I will update you shortly.",
        timestamp: "Sep 2, 10:15 AM",
        createdAt: "2026-09-02T10:15:00Z",
      },
    ],
    createdAt: "2026-09-02T09:41:00Z",
    updatedAt: "2026-09-02T10:15:00Z",
  },
  {
    id: "sup-179",
    ticketNumber: "SUP-20260901-0179",
    providerId: "prov-1",
    subject: "Courier valet delayed for order WSH-20260902-1043",
    description: "Order is bagged and sealed in valet wrap but driver has not arrived.",
    category: "ORDERS",
    priority: "MEDIUM",
    status: "RESOLVED",
    entityId: "ord-1043",
    entityType: "ORDER",
    messages: [
      {
        id: "msg-3",
        senderRole: "PROVIDER",
        senderName: "LuxeCare Studio",
        text: "Order is bagged and sealed in valet wrap but driver has not arrived. Expected handoff was 11:00 AM.",
        timestamp: "Sep 1, 11:15 AM",
        createdAt: "2026-09-01T11:15:00Z",
      },
      {
        id: "msg-4",
        senderRole: "SUPPORT_AGENT",
        senderName: "Operations Dispatch",
        text: "Courier re-assigned. Valet partner Rajesh Kumar is en route with ETA 11:35 AM.",
        timestamp: "Sep 1, 11:22 AM",
        createdAt: "2026-09-01T11:22:00Z",
      },
    ],
    createdAt: "2026-09-01T11:15:00Z",
    updatedAt: "2026-09-01T11:40:00Z",
  },
];
