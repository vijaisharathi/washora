import {
  ProviderRatingSummary,
  ProviderReviewItem,
} from "@/types/provider/reviews";

export const MOCK_PROVIDER_RATING_SUMMARY: ProviderRatingSummary = {
  providerId: "prov-1",
  averageRating: 4.9,
  totalReviews: 1240,
  verifiedBookingsCount: 1180,
  distribution: {
    5: 1100,
    4: 104,
    3: 24,
    2: 8,
    1: 4,
  },
};

export const MOCK_PROVIDER_REVIEWS: ProviderReviewItem[] = [
  {
    id: "rev-201",
    providerId: "prov-1",
    orderId: "ord-1042",
    orderNumber: "QH-20260902-1041",
    serviceId: "srv-101",
    serviceName: "Sneaker Deep Clean Spa",
    customerName: "Arun Kumar",
    isFirstTimeCustomer: true,
    rating: 5,
    reviewText:
      "Excellent cleaning. The sneakers look almost new. The attention to detail on the mesh fabric and the sole restoration was phenomenal. Highly recommend LuxeCare for anyone wanting to revive their favorite pairs.",
    reviewDate: "2 days ago",
    isVerified: true,
    response: {
      responseText:
        "Thank you Arun! Our restoration team takes great pride in handcrafted sneaker care. Look forward to serving you again!",
      respondedAt: "Yesterday, 10:30 AM",
    },
    createdAt: "2026-09-01T14:30:00Z",
    updatedAt: "2026-09-02T10:30:00Z",
  },
  {
    id: "rev-202",
    providerId: "prov-1",
    orderId: "ord-1045",
    orderNumber: "QH-20260901-1038",
    serviceId: "srv-104",
    serviceName: "Luxury Handbag Spa & Edge Inking",
    customerName: "Sarah Jenkins",
    isFirstTimeCustomer: false,
    rating: 4,
    reviewText:
      "Really solid job. Got out stains I thought were permanent. Only knocking off a star because it took a day longer than originally estimated, but the results speak for themselves. Check out the after photo!",
    photos: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=60",
    ],
    reviewDate: "1 week ago",
    isVerified: true,
    createdAt: "2026-08-27T11:00:00Z",
    updatedAt: "2026-08-27T11:00:00Z",
  },
  {
    id: "rev-203",
    providerId: "prov-1",
    orderId: "ord-1043",
    orderNumber: "QH-20260829-1022",
    serviceId: "srv-102",
    serviceName: "Silk & Zari Saree Hydrocarbon Care",
    customerName: "Priya Sundaram",
    isFirstTimeCustomer: false,
    rating: 5,
    reviewText:
      "Flawless saree preservation. The zari luster is intact and the packaging with acid-free tissue was exemplary. Truly world-class luxury garment handling.",
    reviewDate: "2 weeks ago",
    isVerified: true,
    response: {
      responseText:
        "We are delighted to hear this Priya. Preserving heritage weaves is a core passion of our master artisans.",
      respondedAt: "Aug 21, 2026",
    },
    createdAt: "2026-08-20T16:00:00Z",
    updatedAt: "2026-08-21T09:00:00Z",
  },
  {
    id: "rev-204",
    providerId: "prov-1",
    orderId: "ord-1044",
    orderNumber: "QH-20260824-1015",
    serviceId: "srv-103",
    serviceName: "Designer 2-Piece Suit Dry Clean",
    customerName: "Vikram Malhotra",
    isFirstTimeCustomer: true,
    rating: 5,
    reviewText:
      "The contoured form press gave my Tom Ford suit its crisp boardroom silhouette back. Valet pickup and delivery was prompt.",
    reviewDate: "3 weeks ago",
    isVerified: true,
    createdAt: "2026-08-14T10:00:00Z",
    updatedAt: "2026-08-14T10:00:00Z",
  },
];
