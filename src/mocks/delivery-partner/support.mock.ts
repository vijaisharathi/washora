import {
  SupportFaqItem,
  SupportTicket,
} from "@/types/delivery-partner";

export const MOCK_SUPPORT_FAQS: SupportFaqItem[] = [
  {
    id: "faq-01",
    category: "Pickup & Check-in",
    question: "What if a customer gives more or fewer garments than booked?",
    answer:
      "Count the physical garments together at the doorstep. Verify each category item on the checklist and tag each bag with a unique security seal barcode before taking handover PIN confirmation.",
  },
  {
    id: "faq-02",
    category: "Delivery Handover & OTP",
    question: "What should I do if the customer is unreachable at delivery?",
    answer:
      "Attempt to call the customer 3 times with 3-minute intervals. If still unreachable, tap 'Report Issue' in the delivery screen, select 'Customer Unavailable', and return the sealed parcel safely to your hub.",
  },
  {
    id: "faq-03",
    category: "Wallet & Cashouts",
    question: "When are delivery earnings credited and settled to my bank?",
    answer:
      "Trip fares and distance allowances credit immediately to your available wallet balance upon OTP confirmation. Automated daily bank payouts disburse every night at 11:00 PM IST.",
  },
  {
    id: "faq-04",
    category: "Vehicle & Hub Logistics",
    question: "How do I request a shift change or emergency breakdown assist?",
    answer:
      "Call the Indiranagar Hub Dispatch desk immediately via the emergency hotline button (+91 80 4000 8800) or submit an Urgent support ticket under 'Safety & Emergency'.",
  },
];

export const MOCK_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: "tkt-001",
    ticketNumber: "TKT-VALET-8821",
    partnerId: "dp-1",
    category: "PAYMENT_EARNINGS",
    priority: "NORMAL",
    status: "RESOLVED",
    subject: "Fuel surge incentive inquiry for Order #WASH-9951",
    description: "Inquiry regarding distance multiplier credit for Mahadevapura depot bulk transfer trip.",
    relatedOrderId: "WASH-9951",
    relatedTaskId: "task-003",
    createdAt: "2026-09-02T10:00:00Z",
    updatedAt: "2026-09-02T12:30:00Z",
    messages: [
      {
        id: "msg-1",
        senderType: "VALET_PARTNER",
        senderName: "Vikram Singh",
        message: "Hi team, please verify if the fuel surge bonus of ₹40 was applied to Order #WASH-9951.",
        timestamp: "2026-09-02T10:00:00Z",
      },
      {
        id: "msg-2",
        senderType: "SUPPORT_OPERATIONS",
        senderName: "WASHORA Dispatch Support",
        message: "Hello Vikram, we verified the ledger. The ₹40 surge incentive was added to your settlement batch. Check transaction tx-003 in your earnings ledger.",
        timestamp: "2026-09-02T12:30:00Z",
      },
    ],
  },
  {
    id: "tkt-002",
    ticketNumber: "TKT-VALET-8845",
    partnerId: "dp-1",
    category: "DELIVERY_ISSUE",
    priority: "HIGH",
    status: "IN_REVIEW",
    subject: "Customer gate pass restriction at Brigade Gateway #WASH-9920",
    description: "Security desk requested special commercial parking pass before entry.",
    relatedOrderId: "WASH-9920",
    relatedTaskId: "task-007-failed",
    createdAt: "2026-09-01T17:40:00Z",
    updatedAt: "2026-09-01T18:00:00Z",
    messages: [
      {
        id: "msg-1",
        senderType: "VALET_PARTNER",
        senderName: "Vikram Singh",
        message: "Security guards at Tower 3 refused entry for 2-wheeler valet without residential visitor QR. Logged failed attempt and returned shipment to hub.",
        timestamp: "2026-09-01T17:40:00Z",
      },
      {
        id: "msg-2",
        senderType: "SUPPORT_OPERATIONS",
        senderName: "Operations Dispatch",
        message: "Acknowledged Vikram. We have contacted customer Karan Johar to reschedule delivery with a pre-approved gate pass. Return received at hub.",
        timestamp: "2026-09-01T18:00:00Z",
      },
    ],
  },
];
