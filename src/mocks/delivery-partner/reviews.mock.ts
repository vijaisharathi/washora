import {
  DeliveryPartnerReview,
  DeliveryPartnerReviewsSummary,
} from "@/types/delivery-partner";

export const MOCK_REVIEWS: DeliveryPartnerReview[] = [
  {
    id: "rev-001",
    partnerId: "dp-1",
    taskId: "task-001",
    orderId: "WASH-9942",
    rating: 5,
    customerName: "Aarav Sharma",
    date: "2026-09-03T12:00:00Z",
    comment:
      "Superb punctual delivery! Vikram arrived right on time and handled my suits with extreme care. The garment bag was pristine.",
    compliments: ["Punctual & On Time", "Pristine Garment Care", "Courteous"],
    deliveryAddress: "Flat 402, Palm Meadows, Whitefield, Bengaluru",
  },
  {
    id: "rev-002",
    partnerId: "dp-1",
    taskId: "task-002",
    orderId: "WASH-9945",
    rating: 5,
    customerName: "Priya Nair",
    date: "2026-09-03T10:30:00Z",
    comment:
      "Very professional pickup experience. Verified all 5 items with me and securely tagged them with security barcodes before leaving.",
    compliments: ["Polite & Professional", "Smooth Handover"],
    deliveryAddress: "12th Main, HAL 2nd Stage, Indiranagar, Bengaluru",
  },
  {
    id: "rev-003",
    partnerId: "dp-1",
    taskId: "task-005",
    orderId: "WASH-9964",
    rating: 5,
    customerName: "Dr. Ananya Sen",
    date: "2026-09-02T14:45:00Z",
    comment:
      "Delivered high-value evening gowns without a single crease. Polite and patient during OTP verification at the gate.",
    compliments: ["Pristine Garment Care", "Punctual & On Time"],
    deliveryAddress: "Penthouse 12B, Prestige Acropolis, Koramangala",
  },
  {
    id: "rev-004",
    partnerId: "dp-1",
    taskId: "task-004",
    orderId: "WASH-9958",
    rating: 4,
    customerName: "Rohan Varma",
    date: "2026-09-02T17:00:00Z",
    comment:
      "Good pickup service, arrived within the time slot. Quick handover.",
    compliments: ["Smooth Handover"],
    deliveryAddress: "Villa 18, Windmills of Your Mind, Whitefield",
  },
  {
    id: "rev-005",
    partnerId: "dp-1",
    taskId: "task-006",
    orderId: "WASH-9912",
    rating: 5,
    customerName: "Sunil Hegde",
    date: "2026-09-01T16:15:00Z",
    comment:
      "Excellent valet partner. Navigated the apartment complex without calling multiple times for directions.",
    compliments: ["Punctual & On Time", "Polite & Professional"],
    deliveryAddress: "7th Cross, Domlur Layout, Bengaluru",
  },
  {
    id: "rev-006",
    partnerId: "dp-1",
    taskId: "task-008",
    orderId: "WASH-9890",
    rating: 4,
    customerName: "Meera Krishnan",
    date: "2026-08-30T11:20:00Z",
    comment:
      "Prompt delivery and careful placement of winter blankets. Great attitude!",
    compliments: ["Pristine Garment Care"],
    deliveryAddress: "Sobha Rose Apartments, Whitefield, Bengaluru",
  },
];

export const MOCK_REVIEWS_SUMMARY: DeliveryPartnerReviewsSummary = {
  averageRating: 4.85,
  totalReviews: 342,
  fiveStarPercentage: 82,
  distribution: [
    { stars: 5, count: 280, percentage: 82 },
    { stars: 4, count: 45, percentage: 13 },
    { stars: 3, count: 12, percentage: 3.5 },
    { stars: 2, count: 3, percentage: 0.9 },
    { stars: 1, count: 2, percentage: 0.6 },
  ],
  topCompliments: [
    { tag: "Punctual & On Time", count: 190 },
    { tag: "Pristine Garment Care", count: 145 },
    { tag: "Polite & Professional", count: 120 },
    { tag: "Smooth Handover", count: 88 },
  ],
  reviews: MOCK_REVIEWS,
};
