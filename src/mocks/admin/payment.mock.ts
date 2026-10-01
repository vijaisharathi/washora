import {
  Payment,
  Transaction,
  EarningsRecord,
  Refund,
  PaymentStatus,
  PaymentMethod,
  TransactionType,
  TransactionStatus,
  EarningsStatus,
  RefundStatus,
  ALLOWED_EARNINGS_TRANSITIONS,
} from "@/types/admin/payment";
import { INITIAL_ORG_0001_BOOKINGS, INITIAL_ORG_0002_BOOKINGS } from "./booking.mock";

/**
 * DETERMINISTIC MOCK REPOSITORY FOR WASHORA PAYMENTS, TRANSACTIONS, EARNINGS & REFUNDS (A10)
 * Strictly scoped by Organization ID.
 * ORG-0001: 35 Bookings -> 35 Payments, 65+ Transactions, 36 Earnings Records, 8 Refunds
 * ORG-0002: 18 Bookings -> 18 Payments, 35+ Transactions, 20 Earnings Records, 4 Refunds
 *
 * ALL AMOUNTS SATISFY:
 * payment.amount = booking.totalAmount
 * netAmount = grossAmount - platformFee
 * remainingRefundableAmount = paidAmount - refundedAmount
 */

const METHODS: PaymentMethod[] = ["UPI", "Credit Card", "Debit Card", "Net Banking", "Cash"];

// Generate ORG-0001 Payments directly aligned with INITIAL_ORG_0001_BOOKINGS
export const INITIAL_ORG_0001_PAYMENTS: Payment[] = INITIAL_ORG_0001_BOOKINGS.map((b, idx) => {
  const method = METHODS[idx % METHODS.length];
  let status: PaymentStatus = "Paid";
  let paidAmount = b.totalAmount;
  let refundedAmount = 0;

  if (idx === 2 || idx === 16) {
    // BKG-000003, BKG-000017 (Pending bookings)
    status = "Pending";
    paidAmount = 0;
  } else if (idx === 7 || idx === 27) {
    // Failed payment cases
    status = "Failed";
    paidAmount = 0;
  } else if (idx === 4 || idx === 13) {
    // Cancelled full refund cases (BKG-000005, BKG-000014)
    status = "Refunded";
    refundedAmount = b.totalAmount;
  } else if (idx === 3) {
    // BKG-000004: Partial refund
    status = "Partially Refunded";
    refundedAmount = 400;
  } else if (idx === 9) {
    // BKG-000010: Partial refund
    status = "Partially Refunded";
    refundedAmount = 500;
  } else if (idx === 20) {
    // BKG-000021: Partial refund
    status = "Partially Refunded";
    refundedAmount = 300;
  }

  return {
    id: `PAY-${String(idx + 1).padStart(4, "0")}`,
    organizationId: "ORG-0001",
    bookingId: b.id,
    amount: b.totalAmount,
    paidAmount,
    refundedAmount,
    status,
    method,
    currency: "INR",
    createdAt: b.createdAt,
    paidAt: paidAmount > 0 ? b.createdAt : undefined,
    updatedAt: b.updatedAt,
  };
});

// Generate ORG-0002 Payments directly aligned with INITIAL_ORG_0002_BOOKINGS
export const INITIAL_ORG_0002_PAYMENTS: Payment[] = INITIAL_ORG_0002_BOOKINGS.map((b, idx) => {
  const globalIdx = 35 + idx;
  const method = METHODS[idx % METHODS.length];
  let status: PaymentStatus = "Paid";
  let paidAmount = b.totalAmount;
  let refundedAmount = 0;

  if (idx === 2) {
    // BKG-000038
    status = "Pending";
    paidAmount = 0;
  } else if (idx === 7) {
    // BKG-000043
    status = "Failed";
    paidAmount = 0;
  } else if (idx === 4) {
    // BKG-000040
    status = "Refunded";
    refundedAmount = b.totalAmount;
  } else if (idx === 3) {
    // BKG-000039
    status = "Partially Refunded";
    refundedAmount = 500;
  }

  return {
    id: `PAY-${String(globalIdx + 1).padStart(4, "0")}`,
    organizationId: "ORG-0002",
    bookingId: b.id,
    amount: b.totalAmount,
    paidAmount,
    refundedAmount,
    status,
    method,
    currency: "INR",
    createdAt: b.createdAt,
    paidAt: paidAmount > 0 ? b.createdAt : undefined,
    updatedAt: b.updatedAt,
  };
});

// ==========================================
// 2. INITIAL REFUNDS (ORG-0001 & ORG-0002)
// ==========================================
export const INITIAL_ORG_0001_REFUNDS: Refund[] = [
  {
    id: "REF-0001",
    organizationId: "ORG-0001",
    bookingId: "BKG-000004",
    paymentId: "PAY-0004",
    amount: 400,
    reason: "Minor stain on silk garment noted by customer during inspection",
    status: "Completed",
    requestedAt: "2026-09-06T14:00:00Z",
    processedAt: "2026-09-06T15:30:00Z",
    requestedBy: "Admin Aarav",
  },
  {
    id: "REF-0002",
    organizationId: "ORG-0001",
    bookingId: "BKG-000005",
    paymentId: "PAY-0005",
    amount: INITIAL_ORG_0001_BOOKINGS[4].totalAmount,
    reason: "Customer cancelled booking 24 hours prior to scheduled slot",
    status: "Completed",
    requestedAt: "2026-09-04T08:00:00Z",
    processedAt: "2026-09-04T10:00:00Z",
    requestedBy: "Operations Center",
  },
  {
    id: "REF-0003",
    organizationId: "ORG-0001",
    bookingId: "BKG-000010",
    paymentId: "PAY-0010",
    amount: 500,
    reason: "Compensation for delay in valet pickup due to rainfall",
    status: "Completed",
    requestedAt: "2026-09-05T09:00:00Z",
    processedAt: "2026-09-05T11:00:00Z",
    requestedBy: "Admin Aarav",
  },
  {
    id: "REF-0004",
    organizationId: "ORG-0001",
    bookingId: "BKG-000014",
    paymentId: "PAY-0014",
    amount: INITIAL_ORG_0001_BOOKINGS[13].totalAmount,
    reason: "Full order cancellation due to customer relocation",
    status: "Completed",
    requestedAt: "2026-08-29T08:00:00Z",
    processedAt: "2026-08-29T09:30:00Z",
    requestedBy: "Supervisor Priya",
  },
  {
    id: "REF-0005",
    organizationId: "ORG-0001",
    bookingId: "BKG-000021",
    paymentId: "PAY-0021",
    amount: 300,
    reason: "Goodwill refund adjustment approved by ops manager",
    status: "Completed",
    requestedAt: "2026-08-24T08:30:00Z",
    processedAt: "2026-08-24T10:00:00Z",
    requestedBy: "Admin Aarav",
  },
  {
    id: "REF-0006",
    organizationId: "ORG-0001",
    bookingId: "BKG-000001",
    paymentId: "PAY-0001",
    amount: 200,
    reason: "Slight delay in scheduled delivery window compensation",
    status: "Processing",
    requestedAt: "2026-09-06T16:00:00Z",
    requestedBy: "Supervisor Priya",
  },
  {
    id: "REF-0007",
    organizationId: "ORG-0001",
    bookingId: "BKG-000006",
    paymentId: "PAY-0006",
    amount: 350,
    reason: "Customer inquiry regarding promotional discount difference",
    status: "Requested",
    requestedAt: "2026-09-06T17:30:00Z",
    requestedBy: "Support Lead",
  },
  {
    id: "REF-0008",
    organizationId: "ORG-0001",
    bookingId: "BKG-000002",
    paymentId: "PAY-0002",
    amount: 250,
    reason: "Service completed normally - claim found ineligible upon inspection",
    status: "Rejected",
    requestedAt: "2026-09-05T12:00:00Z",
    processedAt: "2026-09-05T15:00:00Z",
    requestedBy: "Operations Center",
  },
];

export const INITIAL_ORG_0002_REFUNDS: Refund[] = [
  {
    id: "REF-0009",
    organizationId: "ORG-0002",
    bookingId: "BKG-000039",
    paymentId: "PAY-0039",
    amount: 500,
    reason: "Express turnaround deadline missed by 2 hours",
    status: "Completed",
    requestedAt: "2026-09-05T14:00:00Z",
    processedAt: "2026-09-05T16:00:00Z",
    requestedBy: "Admin Rahul",
  },
  {
    id: "REF-0010",
    organizationId: "ORG-0002",
    bookingId: "BKG-000040",
    paymentId: "PAY-0040",
    amount: INITIAL_ORG_0002_BOOKINGS[4].totalAmount,
    reason: "Service location unreachable due to waterlogging",
    status: "Completed",
    requestedAt: "2026-09-03T07:00:00Z",
    processedAt: "2026-09-03T09:00:00Z",
    requestedBy: "Ops Manager",
  },
  {
    id: "REF-0011",
    organizationId: "ORG-0002",
    bookingId: "BKG-000036",
    paymentId: "PAY-0036",
    amount: 300,
    reason: "Missing hanger return claim under verification",
    status: "Processing",
    requestedAt: "2026-09-06T15:00:00Z",
    requestedBy: "Admin Rahul",
  },
  {
    id: "REF-0012",
    organizationId: "ORG-0002",
    bookingId: "BKG-000037",
    paymentId: "PAY-0037",
    amount: 400,
    reason: "Discount code was not applied during checkout session",
    status: "Requested",
    requestedAt: "2026-09-06T17:00:00Z",
    requestedBy: "Support Lead",
  },
];

// ==========================================
// 3. INITIAL EARNINGS RECORDS (ORG-0001 & ORG-0002)
// ==========================================
export const INITIAL_ORG_0001_EARNINGS: EarningsRecord[] = [
  // Provider Earnings (18 records)
  {
    id: "ERN-0001",
    organizationId: "ORG-0001",
    bookingId: "BKG-000001",
    recipientType: "Provider",
    recipientId: "PRO-0001",
    grossAmount: 1200,
    platformFee: 240,
    netAmount: 960,
    status: "Paid",
    createdAt: "2026-09-05T08:33:15Z",
    updatedAt: "2026-09-05T14:20:00Z",
    paidAt: "2026-09-05T14:20:00Z",
  },
  {
    id: "ERN-0002",
    organizationId: "ORG-0001",
    bookingId: "BKG-000002",
    recipientType: "Provider",
    recipientId: "PRO-0002",
    grossAmount: 720,
    platformFee: 144,
    netAmount: 576,
    status: "Accrued",
    createdAt: "2026-09-05T09:17:40Z",
    updatedAt: "2026-09-06T09:00:00Z",
  },
  {
    id: "ERN-0003",
    organizationId: "ORG-0001",
    bookingId: "BKG-000003",
    recipientType: "Provider",
    recipientId: "PRO-0003",
    grossAmount: 2400,
    platformFee: 480,
    netAmount: 1920,
    status: "Pending",
    createdAt: "2026-09-06T06:45:00Z",
    updatedAt: "2026-09-06T06:45:00Z",
  },
  {
    id: "ERN-0004",
    organizationId: "ORG-0001",
    bookingId: "BKG-000004",
    recipientType: "Provider",
    recipientId: "PRO-0004",
    grossAmount: 1600,
    platformFee: 320,
    netAmount: 1280,
    status: "Paid",
    createdAt: "2026-09-04T11:22:10Z",
    updatedAt: "2026-09-05T16:00:00Z",
    paidAt: "2026-09-05T16:00:00Z",
  },
  {
    id: "ERN-0005",
    organizationId: "ORG-0001",
    bookingId: "BKG-000005",
    recipientType: "Provider",
    recipientId: "PRO-0005",
    grossAmount: 1100,
    platformFee: 220,
    netAmount: 880,
    status: "Cancelled",
    createdAt: "2026-09-03T16:01:20Z",
    updatedAt: "2026-09-04T10:00:00Z",
  },
  {
    id: "ERN-0006",
    organizationId: "ORG-0001",
    bookingId: "BKG-000006",
    recipientType: "Provider",
    recipientId: "PRO-0001",
    grossAmount: 3200,
    platformFee: 440,
    netAmount: 2760,
    status: "Paid",
    createdAt: "2026-09-02T10:02:45Z",
    updatedAt: "2026-09-02T16:00:00Z",
    paidAt: "2026-09-02T16:00:00Z",
  },
  {
    id: "ERN-0007",
    organizationId: "ORG-0001",
    bookingId: "BKG-000007",
    recipientType: "Provider",
    recipientId: "PRO-0002",
    grossAmount: 850,
    platformFee: 170,
    netAmount: 680,
    status: "Paid",
    createdAt: "2026-09-01T14:16:10Z",
    updatedAt: "2026-09-01T18:00:00Z",
    paidAt: "2026-09-01T18:00:00Z",
  },
  {
    id: "ERN-0008",
    organizationId: "ORG-0001",
    bookingId: "BKG-000009",
    recipientType: "Provider",
    recipientId: "PRO-0003",
    grossAmount: 1500,
    platformFee: 300,
    netAmount: 1200,
    status: "Paid",
    createdAt: "2026-09-04T18:00:00Z",
    updatedAt: "2026-09-05T09:00:00Z",
    paidAt: "2026-09-05T09:00:00Z",
  },
  {
    id: "ERN-0009",
    organizationId: "ORG-0001",
    bookingId: "BKG-000010",
    recipientType: "Provider",
    recipientId: "PRO-0004",
    grossAmount: 3800,
    platformFee: 600,
    netAmount: 3200,
    status: "Paid",
    createdAt: "2026-09-02T13:42:00Z",
    updatedAt: "2026-09-03T10:00:00Z",
    paidAt: "2026-09-03T10:00:00Z",
  },
  {
    id: "ERN-0010",
    organizationId: "ORG-0001",
    bookingId: "BKG-000011",
    recipientType: "Provider",
    recipientId: "PRO-0005",
    grossAmount: 680,
    platformFee: 136,
    netAmount: 544,
    status: "Paid",
    createdAt: "2026-09-01T09:01:30Z",
    updatedAt: "2026-09-01T15:00:00Z",
    paidAt: "2026-09-01T15:00:00Z",
  },
  {
    id: "ERN-0011",
    organizationId: "ORG-0001",
    bookingId: "BKG-000012",
    recipientType: "Provider",
    recipientId: "PRO-0001",
    grossAmount: 1900,
    platformFee: 380,
    netAmount: 1520,
    status: "Paid",
    createdAt: "2026-08-30T15:03:00Z",
    updatedAt: "2026-08-31T11:00:00Z",
    paidAt: "2026-08-31T11:00:00Z",
  },
  {
    id: "ERN-0012",
    organizationId: "ORG-0001",
    bookingId: "BKG-000013",
    recipientType: "Provider",
    recipientId: "PRO-0002",
    grossAmount: 1400,
    platformFee: 280,
    netAmount: 1120,
    status: "Paid",
    createdAt: "2026-08-29T11:12:00Z",
    updatedAt: "2026-08-30T09:00:00Z",
    paidAt: "2026-08-30T09:00:00Z",
  },
  {
    id: "ERN-0013",
    organizationId: "ORG-0001",
    bookingId: "BKG-000015",
    recipientType: "Provider",
    recipientId: "PRO-0003",
    grossAmount: 800,
    platformFee: 160,
    netAmount: 640,
    status: "Paid",
    createdAt: "2026-08-27T10:31:40Z",
    updatedAt: "2026-08-27T16:00:00Z",
    paidAt: "2026-08-27T16:00:00Z",
  },
  {
    id: "ERN-0014",
    organizationId: "ORG-0001",
    bookingId: "BKG-000016",
    recipientType: "Provider",
    recipientId: "PRO-0004",
    grossAmount: 1750,
    platformFee: 350,
    netAmount: 1400,
    status: "Paid",
    createdAt: "2026-08-26T16:22:15Z",
    updatedAt: "2026-08-27T10:00:00Z",
    paidAt: "2026-08-27T10:00:00Z",
  },
  {
    id: "ERN-0015",
    organizationId: "ORG-0001",
    bookingId: "BKG-000018",
    recipientType: "Provider",
    recipientId: "PRO-0005",
    grossAmount: 1000,
    platformFee: 200,
    netAmount: 800,
    status: "Paid",
    createdAt: "2026-08-25T12:03:00Z",
    updatedAt: "2026-08-25T17:00:00Z",
    paidAt: "2026-08-25T17:00:00Z",
  },
  {
    id: "ERN-0016",
    organizationId: "ORG-0001",
    bookingId: "BKG-000019",
    recipientType: "Provider",
    recipientId: "PRO-0001",
    grossAmount: 3300,
    platformFee: 660,
    netAmount: 2640,
    status: "Paid",
    createdAt: "2026-08-24T09:42:30Z",
    updatedAt: "2026-08-24T18:00:00Z",
    paidAt: "2026-08-24T18:00:00Z",
  },
  {
    id: "ERN-0017",
    organizationId: "ORG-0001",
    bookingId: "BKG-000020",
    recipientType: "Provider",
    recipientId: "PRO-0002",
    grossAmount: 1300,
    platformFee: 260,
    netAmount: 1040,
    status: "Paid",
    createdAt: "2026-08-23T11:01:20Z",
    updatedAt: "2026-08-23T16:00:00Z",
    paidAt: "2026-08-23T16:00:00Z",
  },
  {
    id: "ERN-0018",
    organizationId: "ORG-0001",
    bookingId: "BKG-000022",
    recipientType: "Provider",
    recipientId: "PRO-0003",
    grossAmount: 820,
    platformFee: 164,
    netAmount: 656,
    status: "Paid",
    createdAt: "2026-08-21T10:16:30Z",
    updatedAt: "2026-08-21T15:00:00Z",
    paidAt: "2026-08-21T15:00:00Z",
  },

  // Delivery Partner Earnings (18 records)
  {
    id: "ERN-0019",
    organizationId: "ORG-0001",
    bookingId: "BKG-000001",
    recipientType: "Delivery Partner",
    recipientId: "DLP-0001",
    grossAmount: 150,
    platformFee: 30,
    netAmount: 120,
    status: "Paid",
    createdAt: "2026-09-05T08:33:15Z",
    updatedAt: "2026-09-05T14:20:00Z",
    paidAt: "2026-09-05T14:20:00Z",
  },
  {
    id: "ERN-0020",
    organizationId: "ORG-0001",
    bookingId: "BKG-000002",
    recipientType: "Delivery Partner",
    recipientId: "DLP-0002",
    grossAmount: 125,
    platformFee: 25,
    netAmount: 100,
    status: "Accrued",
    createdAt: "2026-09-05T09:17:40Z",
    updatedAt: "2026-09-06T09:00:00Z",
  },
  {
    id: "ERN-0021",
    organizationId: "ORG-0001",
    bookingId: "BKG-000003",
    recipientType: "Delivery Partner",
    recipientId: "DLP-0003",
    grossAmount: 200,
    platformFee: 40,
    netAmount: 160,
    status: "Pending",
    createdAt: "2026-09-06T06:45:00Z",
    updatedAt: "2026-09-06T06:45:00Z",
  },
  {
    id: "ERN-0022",
    organizationId: "ORG-0001",
    bookingId: "BKG-000004",
    recipientType: "Delivery Partner",
    recipientId: "DLP-0004",
    grossAmount: 175,
    platformFee: 35,
    netAmount: 140,
    status: "Paid",
    createdAt: "2026-09-04T11:22:10Z",
    updatedAt: "2026-09-05T16:00:00Z",
    paidAt: "2026-09-05T16:00:00Z",
  },
  {
    id: "ERN-0023",
    organizationId: "ORG-0001",
    bookingId: "BKG-000005",
    recipientType: "Delivery Partner",
    recipientId: "DLP-0005",
    grossAmount: 100,
    platformFee: 20,
    netAmount: 80,
    status: "Cancelled",
    createdAt: "2026-09-03T16:01:20Z",
    updatedAt: "2026-09-04T10:00:00Z",
  },
  {
    id: "ERN-0024",
    organizationId: "ORG-0001",
    bookingId: "BKG-000006",
    recipientType: "Delivery Partner",
    recipientId: "DLP-0001",
    grossAmount: 190,
    platformFee: 40,
    netAmount: 150,
    status: "Paid",
    createdAt: "2026-09-02T10:02:45Z",
    updatedAt: "2026-09-02T16:00:00Z",
    paidAt: "2026-09-02T16:00:00Z",
  },
  {
    id: "ERN-0025",
    organizationId: "ORG-0001",
    bookingId: "BKG-000007",
    recipientType: "Delivery Partner",
    recipientId: "DLP-0002",
    grossAmount: 120,
    platformFee: 24,
    netAmount: 96,
    status: "Paid",
    createdAt: "2026-09-01T14:16:10Z",
    updatedAt: "2026-09-01T18:00:00Z",
    paidAt: "2026-09-01T18:00:00Z",
  },
  {
    id: "ERN-0026",
    organizationId: "ORG-0001",
    bookingId: "BKG-000009",
    recipientType: "Delivery Partner",
    recipientId: "DLP-0003",
    grossAmount: 150,
    platformFee: 30,
    netAmount: 120,
    status: "Paid",
    createdAt: "2026-09-04T18:00:00Z",
    updatedAt: "2026-09-05T09:00:00Z",
    paidAt: "2026-09-05T09:00:00Z",
  },
  {
    id: "ERN-0027",
    organizationId: "ORG-0001",
    bookingId: "BKG-000010",
    recipientType: "Delivery Partner",
    recipientId: "DLP-0004",
    grossAmount: 200,
    platformFee: 40,
    netAmount: 160,
    status: "Paid",
    createdAt: "2026-09-02T13:42:00Z",
    updatedAt: "2026-09-03T10:00:00Z",
    paidAt: "2026-09-03T10:00:00Z",
  },
  {
    id: "ERN-0028",
    organizationId: "ORG-0001",
    bookingId: "BKG-000011",
    recipientType: "Delivery Partner",
    recipientId: "DLP-0005",
    grossAmount: 90,
    platformFee: 18,
    netAmount: 72,
    status: "Paid",
    createdAt: "2026-09-01T09:01:30Z",
    updatedAt: "2026-09-01T15:00:00Z",
    paidAt: "2026-09-01T15:00:00Z",
  },
  {
    id: "ERN-0029",
    organizationId: "ORG-0001",
    bookingId: "BKG-000012",
    recipientType: "Delivery Partner",
    recipientId: "DLP-0001",
    grossAmount: 180,
    platformFee: 36,
    netAmount: 144,
    status: "Paid",
    createdAt: "2026-08-30T15:03:00Z",
    updatedAt: "2026-08-31T11:00:00Z",
    paidAt: "2026-08-31T11:00:00Z",
  },
  {
    id: "ERN-0030",
    organizationId: "ORG-0001",
    bookingId: "BKG-000013",
    recipientType: "Delivery Partner",
    recipientId: "DLP-0002",
    grossAmount: 150,
    platformFee: 30,
    netAmount: 120,
    status: "Paid",
    createdAt: "2026-08-29T11:12:00Z",
    updatedAt: "2026-08-30T09:00:00Z",
    paidAt: "2026-08-30T09:00:00Z",
  },
  {
    id: "ERN-0031",
    organizationId: "ORG-0001",
    bookingId: "BKG-000015",
    recipientType: "Delivery Partner",
    recipientId: "DLP-0003",
    grossAmount: 100,
    platformFee: 20,
    netAmount: 80,
    status: "Paid",
    createdAt: "2026-08-27T10:31:40Z",
    updatedAt: "2026-08-27T16:00:00Z",
    paidAt: "2026-08-27T16:00:00Z",
  },
  {
    id: "ERN-0032",
    organizationId: "ORG-0001",
    bookingId: "BKG-000016",
    recipientType: "Delivery Partner",
    recipientId: "DLP-0004",
    grossAmount: 160,
    platformFee: 32,
    netAmount: 128,
    status: "Paid",
    createdAt: "2026-08-26T16:22:15Z",
    updatedAt: "2026-08-27T10:00:00Z",
    paidAt: "2026-08-27T10:00:00Z",
  },
  {
    id: "ERN-0033",
    organizationId: "ORG-0001",
    bookingId: "BKG-000018",
    recipientType: "Delivery Partner",
    recipientId: "DLP-0005",
    grossAmount: 120,
    platformFee: 24,
    netAmount: 96,
    status: "Paid",
    createdAt: "2026-08-25T12:03:00Z",
    updatedAt: "2026-08-25T17:00:00Z",
    paidAt: "2026-08-25T17:00:00Z",
  },
  {
    id: "ERN-0034",
    organizationId: "ORG-0001",
    bookingId: "BKG-000019",
    recipientType: "Delivery Partner",
    recipientId: "DLP-0001",
    grossAmount: 220,
    platformFee: 44,
    netAmount: 176,
    status: "Paid",
    createdAt: "2026-08-24T09:42:30Z",
    updatedAt: "2026-08-24T18:00:00Z",
    paidAt: "2026-08-24T18:00:00Z",
  },
  {
    id: "ERN-0035",
    organizationId: "ORG-0001",
    bookingId: "BKG-000020",
    recipientType: "Delivery Partner",
    recipientId: "DLP-0002",
    grossAmount: 140,
    platformFee: 28,
    netAmount: 112,
    status: "Paid",
    createdAt: "2026-08-23T11:01:20Z",
    updatedAt: "2026-08-23T16:00:00Z",
    paidAt: "2026-08-23T16:00:00Z",
  },
  {
    id: "ERN-0036",
    organizationId: "ORG-0001",
    bookingId: "BKG-000022",
    recipientType: "Delivery Partner",
    recipientId: "DLP-0003",
    grossAmount: 110,
    platformFee: 22,
    netAmount: 88,
    status: "Paid",
    createdAt: "2026-08-21T10:16:30Z",
    updatedAt: "2026-08-21T15:00:00Z",
    paidAt: "2026-08-21T15:00:00Z",
  },
];

export const INITIAL_ORG_0002_EARNINGS: EarningsRecord[] = [
  // Provider Earnings (10 records)
  {
    id: "ERN-0037",
    organizationId: "ORG-0002",
    bookingId: "BKG-000036",
    recipientType: "Provider",
    recipientId: "PRO-0007",
    grossAmount: 1300,
    platformFee: 260,
    netAmount: 1040,
    status: "Paid",
    createdAt: "2026-09-05T10:01:30Z",
    updatedAt: "2026-09-05T18:00:00Z",
    paidAt: "2026-09-05T18:00:00Z",
  },
  {
    id: "ERN-0038",
    organizationId: "ORG-0002",
    bookingId: "BKG-000037",
    recipientType: "Provider",
    recipientId: "PRO-0008",
    grossAmount: 2000,
    platformFee: 400,
    netAmount: 1600,
    status: "Accrued",
    createdAt: "2026-09-04T12:17:10Z",
    updatedAt: "2026-09-05T10:00:00Z",
  },
  {
    id: "ERN-0039",
    organizationId: "ORG-0002",
    bookingId: "BKG-000038",
    recipientType: "Provider",
    recipientId: "PRO-0009",
    grossAmount: 800,
    platformFee: 160,
    netAmount: 640,
    status: "Pending",
    createdAt: "2026-09-06T09:00:00Z",
    updatedAt: "2026-09-06T09:00:00Z",
  },
  {
    id: "ERN-0040",
    organizationId: "ORG-0002",
    bookingId: "BKG-000039",
    recipientType: "Provider",
    recipientId: "PRO-0007",
    grossAmount: 2800,
    platformFee: 560,
    netAmount: 2240,
    status: "Paid",
    createdAt: "2026-09-03T14:42:30Z",
    updatedAt: "2026-09-04T11:00:00Z",
    paidAt: "2026-09-04T11:00:00Z",
  },
  {
    id: "ERN-0041",
    organizationId: "ORG-0002",
    bookingId: "BKG-000040",
    recipientType: "Provider",
    recipientId: "PRO-0008",
    grossAmount: 1600,
    platformFee: 320,
    netAmount: 1280,
    status: "Cancelled",
    createdAt: "2026-09-02T11:01:40Z",
    updatedAt: "2026-09-03T09:00:00Z",
  },
  {
    id: "ERN-0042",
    organizationId: "ORG-0002",
    bookingId: "BKG-000041",
    recipientType: "Provider",
    recipientId: "PRO-0009",
    grossAmount: 4100,
    platformFee: 700,
    netAmount: 3400,
    status: "Paid",
    createdAt: "2026-09-01T15:33:00Z",
    updatedAt: "2026-09-02T10:00:00Z",
    paidAt: "2026-09-02T10:00:00Z",
  },
  {
    id: "ERN-0043",
    organizationId: "ORG-0002",
    bookingId: "BKG-000042",
    recipientType: "Provider",
    recipientId: "PRO-0007",
    grossAmount: 1000,
    platformFee: 200,
    netAmount: 800,
    status: "Paid",
    createdAt: "2026-08-31T09:21:30Z",
    updatedAt: "2026-08-31T15:00:00Z",
    paidAt: "2026-08-31T15:00:00Z",
  },
  {
    id: "ERN-0044",
    organizationId: "ORG-0002",
    bookingId: "BKG-000044",
    recipientType: "Provider",
    recipientId: "PRO-0008",
    grossAmount: 1800,
    platformFee: 360,
    netAmount: 1440,
    status: "Paid",
    createdAt: "2026-08-30T16:00:00Z",
    updatedAt: "2026-08-31T10:00:00Z",
    paidAt: "2026-08-31T10:00:00Z",
  },
  {
    id: "ERN-0045",
    organizationId: "ORG-0002",
    bookingId: "BKG-000045",
    recipientType: "Provider",
    recipientId: "PRO-0009",
    grossAmount: 3300,
    platformFee: 660,
    netAmount: 2640,
    status: "Paid",
    createdAt: "2026-08-29T10:42:30Z",
    updatedAt: "2026-08-29T18:00:00Z",
    paidAt: "2026-08-29T18:00:00Z",
  },
  {
    id: "ERN-0046",
    organizationId: "ORG-0002",
    bookingId: "BKG-000046",
    recipientType: "Provider",
    recipientId: "PRO-0007",
    grossAmount: 760,
    platformFee: 152,
    netAmount: 608,
    status: "Paid",
    createdAt: "2026-08-28T14:16:20Z",
    updatedAt: "2026-08-28T18:00:00Z",
    paidAt: "2026-08-28T18:00:00Z",
  },

  // Delivery Partner Earnings (10 records)
  {
    id: "ERN-0047",
    organizationId: "ORG-0002",
    bookingId: "BKG-000036",
    recipientType: "Delivery Partner",
    recipientId: "DLP-0006",
    grossAmount: 150,
    platformFee: 30,
    netAmount: 120,
    status: "Paid",
    createdAt: "2026-09-05T10:01:30Z",
    updatedAt: "2026-09-05T18:00:00Z",
    paidAt: "2026-09-05T18:00:00Z",
  },
  {
    id: "ERN-0048",
    organizationId: "ORG-0002",
    bookingId: "BKG-000037",
    recipientType: "Delivery Partner",
    recipientId: "DLP-0007",
    grossAmount: 180,
    platformFee: 36,
    netAmount: 144,
    status: "Accrued",
    createdAt: "2026-09-04T12:17:10Z",
    updatedAt: "2026-09-05T10:00:00Z",
  },
  {
    id: "ERN-0049",
    organizationId: "ORG-0002",
    bookingId: "BKG-000038",
    recipientType: "Delivery Partner",
    recipientId: "DLP-0008",
    grossAmount: 120,
    platformFee: 24,
    netAmount: 96,
    status: "Pending",
    createdAt: "2026-09-06T09:00:00Z",
    updatedAt: "2026-09-06T09:00:00Z",
  },
  {
    id: "ERN-0050",
    organizationId: "ORG-0002",
    bookingId: "BKG-000039",
    recipientType: "Delivery Partner",
    recipientId: "DLP-0006",
    grossAmount: 200,
    platformFee: 40,
    netAmount: 160,
    status: "Paid",
    createdAt: "2026-09-03T14:42:30Z",
    updatedAt: "2026-09-04T11:00:00Z",
    paidAt: "2026-09-04T11:00:00Z",
  },
  {
    id: "ERN-0051",
    organizationId: "ORG-0002",
    bookingId: "BKG-000040",
    recipientType: "Delivery Partner",
    recipientId: "DLP-0007",
    grossAmount: 130,
    platformFee: 26,
    netAmount: 104,
    status: "Cancelled",
    createdAt: "2026-09-02T11:01:40Z",
    updatedAt: "2026-09-03T09:00:00Z",
  },
  {
    id: "ERN-0052",
    organizationId: "ORG-0002",
    bookingId: "BKG-000041",
    recipientType: "Delivery Partner",
    recipientId: "DLP-0008",
    grossAmount: 240,
    platformFee: 48,
    netAmount: 192,
    status: "Paid",
    createdAt: "2026-09-01T15:33:00Z",
    updatedAt: "2026-09-02T10:00:00Z",
    paidAt: "2026-09-02T10:00:00Z",
  },
  {
    id: "ERN-0053",
    organizationId: "ORG-0002",
    bookingId: "BKG-000042",
    recipientType: "Delivery Partner",
    recipientId: "DLP-0006",
    grossAmount: 110,
    platformFee: 22,
    netAmount: 88,
    status: "Paid",
    createdAt: "2026-08-31T09:21:30Z",
    updatedAt: "2026-08-31T15:00:00Z",
    paidAt: "2026-08-31T15:00:00Z",
  },
  {
    id: "ERN-0054",
    organizationId: "ORG-0002",
    bookingId: "BKG-000044",
    recipientType: "Delivery Partner",
    recipientId: "DLP-0007",
    grossAmount: 160,
    platformFee: 32,
    netAmount: 128,
    status: "Paid",
    createdAt: "2026-08-30T16:00:00Z",
    updatedAt: "2026-08-31T10:00:00Z",
    paidAt: "2026-08-31T10:00:00Z",
  },
  {
    id: "ERN-0055",
    organizationId: "ORG-0002",
    bookingId: "BKG-000045",
    recipientType: "Delivery Partner",
    recipientId: "DLP-0008",
    grossAmount: 220,
    platformFee: 44,
    netAmount: 176,
    status: "Paid",
    createdAt: "2026-08-29T10:42:30Z",
    updatedAt: "2026-08-29T18:00:00Z",
    paidAt: "2026-08-29T18:00:00Z",
  },
  {
    id: "ERN-0056",
    organizationId: "ORG-0002",
    bookingId: "BKG-000046",
    recipientType: "Delivery Partner",
    recipientId: "DLP-0006",
    grossAmount: 90,
    platformFee: 18,
    netAmount: 72,
    status: "Paid",
    createdAt: "2026-08-28T14:16:20Z",
    updatedAt: "2026-08-28T18:00:00Z",
    paidAt: "2026-08-28T18:00:00Z",
  },
];

// ==========================================
// 4. GENERATE TRANSACTIONS (ORG-0001 & ORG-0002)
// ==========================================
export const INITIAL_ORG_0001_TRANSACTIONS: Transaction[] = [
  // 35 Payment Transactions
  ...INITIAL_ORG_0001_PAYMENTS.map((p, idx): Transaction => {
    let status: TransactionStatus = "Completed";
    if (p.status === "Pending") status = "Pending";
    if (p.status === "Failed") status = "Failed";

    return {
      id: `TXN-${String(idx + 1).padStart(6, "0")}`,
      organizationId: "ORG-0001",
      bookingId: p.bookingId,
      paymentId: p.id,
      type: "Payment",
      status,
      amount: p.amount,
      currency: "INR",
      reference: `TXN-REF-2026-${String(idx + 1).padStart(4, "0")}`,
      createdAt: p.createdAt,
      completedAt: status === "Completed" ? p.paidAt : undefined,
      description: `Customer Payment for ${p.bookingId} via ${p.method}`,
    };
  }),

  // 8 Refund Transactions (TXN-000054 to TXN-000061)
  ...INITIAL_ORG_0001_REFUNDS.map((r, idx): Transaction => {
    let status: TransactionStatus = "Completed";
    if (r.status === "Processing" || r.status === "Requested") status = "Pending";
    if (r.status === "Rejected") status = "Failed";

    return {
      id: `TXN-${String(54 + idx).padStart(6, "0")}`,
      organizationId: "ORG-0001",
      bookingId: r.bookingId,
      paymentId: r.paymentId,
      type: "Refund",
      status,
      amount: r.amount,
      currency: "INR",
      reference: `REF-TXN-2026-${String(idx + 1).padStart(4, "0")}`,
      createdAt: r.requestedAt,
      completedAt: r.processedAt,
      description: `Refund for ${r.bookingId}: ${r.reason.slice(0, 45)}...`,
    };
  }),

  // Provider Earning Transactions (18 records) (TXN-000062 to TXN-000079)
  ...INITIAL_ORG_0001_EARNINGS.filter((e) => e.recipientType === "Provider").map(
    (e, idx): Transaction => {
      let status: TransactionStatus = "Completed";
      if (e.status === "Pending") status = "Pending";
      if (e.status === "Cancelled") status = "Failed";

      return {
        id: `TXN-${String(62 + idx).padStart(6, "0")}`,
        organizationId: "ORG-0001",
        bookingId: e.bookingId,
        type: "Provider Earning",
        status,
        amount: e.netAmount,
        currency: "INR",
        reference: `TXN-PRV-2026-${String(idx + 1).padStart(4, "0")}`,
        createdAt: e.createdAt,
        completedAt: e.paidAt || e.updatedAt,
        description: `Net earnings credit for Provider ${e.recipientId} on ${e.bookingId}`,
      };
    }
  ),

  // Delivery Partner Earning Transactions (18 records) (TXN-000080 to TXN-000097)
  ...INITIAL_ORG_0001_EARNINGS.filter((e) => e.recipientType === "Delivery Partner").map(
    (e, idx): Transaction => {
      let status: TransactionStatus = "Completed";
      if (e.status === "Pending") status = "Pending";
      if (e.status === "Cancelled") status = "Failed";

      return {
        id: `TXN-${String(80 + idx).padStart(6, "0")}`,
        organizationId: "ORG-0001",
        bookingId: e.bookingId,
        type: "Delivery Partner Earning",
        status,
        amount: e.netAmount,
        currency: "INR",
        reference: `TXN-DLP-2026-${String(idx + 1).padStart(4, "0")}`,
        createdAt: e.createdAt,
        completedAt: e.paidAt || e.updatedAt,
        description: `Net delivery fee credit for Valet ${e.recipientId} on ${e.bookingId}`,
      };
    }
  ),
];

export const INITIAL_ORG_0002_TRANSACTIONS: Transaction[] = [
  // 18 Payment Transactions (TXN-000036 to TXN-000053)
  ...INITIAL_ORG_0002_PAYMENTS.map((p, idx): Transaction => {
    let status: TransactionStatus = "Completed";
    if (p.status === "Pending") status = "Pending";
    if (p.status === "Failed") status = "Failed";

    return {
      id: `TXN-${String(36 + idx).padStart(6, "0")}`,
      organizationId: "ORG-0002",
      bookingId: p.bookingId,
      paymentId: p.id,
      type: "Payment",
      status,
      amount: p.amount,
      currency: "INR",
      reference: `TXN-REF-2026-${String(36 + idx).padStart(4, "0")}`,
      createdAt: p.createdAt,
      completedAt: status === "Completed" ? p.paidAt : undefined,
      description: `Customer Payment for ${p.bookingId} via ${p.method}`,
    };
  }),

  // 4 Refund Transactions (TXN-000098 to TXN-000101)
  ...INITIAL_ORG_0002_REFUNDS.map((r, idx): Transaction => {
    let status: TransactionStatus = "Completed";
    if (r.status === "Processing" || r.status === "Requested") status = "Pending";
    if (r.status === "Rejected") status = "Failed";

    return {
      id: `TXN-${String(98 + idx).padStart(6, "0")}`,
      organizationId: "ORG-0002",
      bookingId: r.bookingId,
      paymentId: r.paymentId,
      type: "Refund",
      status,
      amount: r.amount,
      currency: "INR",
      reference: `REF-TXN-2026-${String(9 + idx).padStart(4, "0")}`,
      createdAt: r.requestedAt,
      completedAt: r.processedAt,
      description: `Refund for ${r.bookingId}: ${r.reason.slice(0, 45)}...`,
    };
  }),

  // Provider Earning Transactions (10 records) (TXN-000102 to TXN-000111)
  ...INITIAL_ORG_0002_EARNINGS.filter((e) => e.recipientType === "Provider").map(
    (e, idx): Transaction => {
      let status: TransactionStatus = "Completed";
      if (e.status === "Pending") status = "Pending";
      if (e.status === "Cancelled") status = "Failed";

      return {
        id: `TXN-${String(102 + idx).padStart(6, "0")}`,
        organizationId: "ORG-0002",
        bookingId: e.bookingId,
        type: "Provider Earning",
        status,
        amount: e.netAmount,
        currency: "INR",
        reference: `TXN-PRV-2026-${String(19 + idx).padStart(4, "0")}`,
        createdAt: e.createdAt,
        completedAt: e.paidAt || e.updatedAt,
        description: `Net earnings credit for Provider ${e.recipientId} on ${e.bookingId}`,
      };
    }
  ),

  // Delivery Partner Earning Transactions (10 records) (TXN-000112 to TXN-000121)
  ...INITIAL_ORG_0002_EARNINGS.filter((e) => e.recipientType === "Delivery Partner").map(
    (e, idx): Transaction => {
      let status: TransactionStatus = "Completed";
      if (e.status === "Pending") status = "Pending";
      if (e.status === "Cancelled") status = "Failed";

      return {
        id: `TXN-${String(112 + idx).padStart(6, "0")}`,
        organizationId: "ORG-0002",
        bookingId: e.bookingId,
        type: "Delivery Partner Earning",
        status,
        amount: e.netAmount,
        currency: "INR",
        reference: `TXN-DLP-2026-${String(19 + idx).padStart(4, "0")}`,
        createdAt: e.createdAt,
        completedAt: e.paidAt || e.updatedAt,
        description: `Net delivery fee credit for Valet ${e.recipientId} on ${e.bookingId}`,
      };
    }
  ),
];

// ==========================================
// 5. IN-MEMORY RUNTIME STORES & MUTATION LOGIC
// ==========================================
let mockPaymentsStore: Payment[] = [
  ...INITIAL_ORG_0001_PAYMENTS,
  ...INITIAL_ORG_0002_PAYMENTS,
];

let mockTransactionsStore: Transaction[] = [
  ...INITIAL_ORG_0001_TRANSACTIONS,
  ...INITIAL_ORG_0002_TRANSACTIONS,
];

let mockEarningsStore: EarningsRecord[] = [
  ...INITIAL_ORG_0001_EARNINGS,
  ...INITIAL_ORG_0002_EARNINGS,
];

let mockRefundsStore: Refund[] = [
  ...INITIAL_ORG_0001_REFUNDS,
  ...INITIAL_ORG_0002_REFUNDS,
];

let nextRefundSequence = 13;
let nextTxnSequence = 122;

export function getMockPaymentsByOrg(orgId: string): Payment[] {
  return mockPaymentsStore.filter((p) => p.organizationId === orgId);
}

export function getMockTransactionsByOrg(orgId: string): Transaction[] {
  return mockTransactionsStore.filter((t) => t.organizationId === orgId);
}

export function getMockEarningsByOrg(orgId: string): EarningsRecord[] {
  return mockEarningsStore.filter((e) => e.organizationId === orgId);
}

export function getMockRefundsByOrg(orgId: string): Refund[] {
  return mockRefundsStore.filter((r) => r.organizationId === orgId);
}

/**
 * Creates a deterministic refund in frontend mock store
 */
export function createRefundInStore(
  orgId: string,
  data: {
    paymentId: string;
    bookingId: string;
    amount: number;
    reason: string;
    requestedBy: string;
  }
): { refund: Refund; transaction: Transaction; payment: Payment } {
  const paymentIndex = mockPaymentsStore.findIndex(
    (p) => p.id === data.paymentId && p.organizationId === orgId
  );

  if (paymentIndex === -1) {
    throw new Error(`Payment ${data.paymentId} not found in organization ${orgId}`);
  }

  const payment = mockPaymentsStore[paymentIndex];
  const remainingRefundable = payment.paidAmount - payment.refundedAmount;

  if (data.amount <= 0) {
    throw new Error("Refund amount must be greater than ₹0");
  }

  if (data.amount > remainingRefundable) {
    throw new Error(
      `Refund amount (₹${data.amount}) cannot exceed remaining refundable amount (₹${remainingRefundable})`
    );
  }

  const now = new Date().toISOString();
  const refundId = `REF-${String(nextRefundSequence++).padStart(4, "0")}`;
  const txnId = `TXN-${String(nextTxnSequence++).padStart(6, "0")}`;

  // 1. Create Refund entity (status: Processing)
  const newRefund: Refund = {
    id: refundId,
    organizationId: orgId,
    bookingId: data.bookingId,
    paymentId: data.paymentId,
    amount: data.amount,
    reason: data.reason,
    status: "Processing",
    requestedAt: now,
    requestedBy: data.requestedBy,
  };

  // 2. Update Payment
  const newRefundedAmount = payment.refundedAmount + data.amount;
  const newStatus: PaymentStatus =
    newRefundedAmount >= payment.paidAmount ? "Refunded" : "Partially Refunded";

  const updatedPayment: Payment = {
    ...payment,
    refundedAmount: newRefundedAmount,
    status: newStatus,
    updatedAt: now,
  };

  // 3. Create Refund Transaction
  const newTransaction: Transaction = {
    id: txnId,
    organizationId: orgId,
    bookingId: data.bookingId,
    paymentId: data.paymentId,
    type: "Refund",
    status: "Pending",
    amount: data.amount,
    currency: "INR",
    reference: `REF-TXN-2026-${String(nextRefundSequence - 1).padStart(4, "0")}`,
    createdAt: now,
    description: `Refund initiated for booking ${data.bookingId} (${data.reason.slice(0, 40)}...)`,
  };

  // Apply to stores
  mockRefundsStore = [newRefund, ...mockRefundsStore];
  mockTransactionsStore = [newTransaction, ...mockTransactionsStore];
  mockPaymentsStore[paymentIndex] = updatedPayment;

  return { refund: newRefund, transaction: newTransaction, payment: updatedPayment };
}

/**
 * Marks a processing refund as Completed in mock store
 */
export function markRefundCompletedInStore(
  orgId: string,
  refundId: string
): { refund: Refund; transaction?: Transaction } {
  const refundIndex = mockRefundsStore.findIndex(
    (r) => r.id === refundId && r.organizationId === orgId
  );

  if (refundIndex === -1) {
    throw new Error(`Refund ${refundId} not found in organization ${orgId}`);
  }

  const refund = mockRefundsStore[refundIndex];
  if (refund.status !== "Processing" && refund.status !== "Requested") {
    throw new Error(`Cannot complete refund with status ${refund.status}`);
  }

  const now = new Date().toISOString();
  const updatedRefund: Refund = {
    ...refund,
    status: "Completed",
    processedAt: now,
  };
  mockRefundsStore[refundIndex] = updatedRefund;

  // Find linked refund transaction and mark Completed
  const txnIndex = mockTransactionsStore.findIndex(
    (t) =>
      t.organizationId === orgId &&
      t.bookingId === refund.bookingId &&
      t.paymentId === refund.paymentId &&
      t.type === "Refund" &&
      t.status === "Pending"
  );

  let updatedTxn: Transaction | undefined;
  if (txnIndex !== -1) {
    updatedTxn = {
      ...mockTransactionsStore[txnIndex],
      status: "Completed",
      completedAt: now,
    };
    mockTransactionsStore[txnIndex] = updatedTxn;
  }

  return { refund: updatedRefund, transaction: updatedTxn };
}

/**
 * Updates an earnings record status in mock store following allowed lifecycle rules
 */
export function updateEarningsStatusInStore(
  orgId: string,
  earningsId: string,
  newStatus: EarningsStatus
): EarningsRecord {
  const index = mockEarningsStore.findIndex(
    (e) => e.id === earningsId && e.organizationId === orgId
  );

  if (index === -1) {
    throw new Error(`Earnings record ${earningsId} not found in organization ${orgId}`);
  }

  const record = mockEarningsStore[index];
  const allowed = ALLOWED_EARNINGS_TRANSITIONS[record.status];

  if (!allowed.includes(newStatus)) {
    throw new Error(
      `Cannot transition earnings status from ${record.status} to ${newStatus}`
    );
  }

  const now = new Date().toISOString();
  const updatedRecord: EarningsRecord = {
    ...record,
    status: newStatus,
    updatedAt: now,
    paidAt: newStatus === "Paid" ? now : record.paidAt,
  };

  mockEarningsStore[index] = updatedRecord;
  return updatedRecord;
}

/**
 * Resets stores to deterministic initial state (useful for test suites)
 */
export function resetMockPaymentStores(): void {
  mockPaymentsStore = [
    ...INITIAL_ORG_0001_PAYMENTS,
    ...INITIAL_ORG_0002_PAYMENTS,
  ];
  mockTransactionsStore = [
    ...INITIAL_ORG_0001_TRANSACTIONS,
    ...INITIAL_ORG_0002_TRANSACTIONS,
  ];
  mockEarningsStore = [
    ...INITIAL_ORG_0001_EARNINGS,
    ...INITIAL_ORG_0002_EARNINGS,
  ];
  mockRefundsStore = [
    ...INITIAL_ORG_0001_REFUNDS,
    ...INITIAL_ORG_0002_REFUNDS,
  ];
  nextRefundSequence = 13;
  nextTxnSequence = 122;
}
