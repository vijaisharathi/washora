import {
  Review,
  ReviewStatus,
  ModerationReason,
  ReviewModerationActivity,
  ReviewModerationNote,
  ReviewSummaryMetrics,
  ProviderRatingSummary,
  ServiceRatingSummary,
  ListReviewsParams,
  ListReviewsResult,
  ReviewDetailResult,
} from "@/types/admin/review";
import {
  getMockReviewsByOrg,
  getMockReviewActivities,
  getMockReviewNotes,
  flagReviewInStore,
  hideReviewInStore,
  restoreReviewInStore,
  publishReviewInStore,
  addModerationNoteInStore,
} from "@/mocks/admin/review.mock";
import { createMockNotificationInStore } from "@/mocks/admin/notification.mock";
import { INITIAL_ORG_0001_CUSTOMERS, INITIAL_ORG_0002_CUSTOMERS } from "@/mocks/admin/customer.mock";
import { INITIAL_ORG_0001_PROVIDERS, INITIAL_ORG_0002_PROVIDERS } from "@/mocks/admin/provider.mock";
import { INITIAL_ORG_0001_BOOKINGS, INITIAL_ORG_0002_BOOKINGS } from "@/mocks/admin/booking.mock";
import { INITIAL_ORG_0001_SERVICES, INITIAL_ORG_0002_SERVICES } from "@/mocks/admin/serviceCatalog.mock";
import { isLiveMode } from "@/lib/api/mode";
import { adminApi } from "@/features/admin/api/adminApi";

function mapBackendReviewToReview(r: any): Review {
  return {
    id: r.id,
    bookingId: r.bookingId || "",
    customerId: r.customerId || "",
    providerId: r.providerId || "",
    serviceId: r.serviceId || "",
    rating: Number(r.rating || 5),
    title: r.title || "",
    comment: r.comment || "",
    status: (r.status === "VISIBLE" || r.status === "PUBLISHED" ? "Published" : r.status === "HIDDEN" ? "Hidden" : r.status === "FLAGGED" ? "Flagged" : r.status || "Published") as ReviewStatus,
    createdAt: r.createdAt || new Date().toISOString(),
    updatedAt: r.updatedAt || new Date().toISOString(),
    organizationId: r.organizationId || "ORG-0001",
  };
}

/**
 * Helper to resolve customer map
 */
function getCustomerLookup(orgId: string) {
  const customers = orgId === "ORG-0002" ? INITIAL_ORG_0002_CUSTOMERS : INITIAL_ORG_0001_CUSTOMERS;
  return new Map(customers.map((c) => [c.id, c]));
}

/**
 * Helper to resolve provider map
 */
function getProviderLookup(orgId: string) {
  const providers = orgId === "ORG-0002" ? INITIAL_ORG_0002_PROVIDERS : INITIAL_ORG_0001_PROVIDERS;
  return new Map(providers.map((p) => [p.id, p]));
}

/**
 * Helper to resolve booking map
 */
function getBookingLookup(orgId: string) {
  const bookings = orgId === "ORG-0002" ? INITIAL_ORG_0002_BOOKINGS : INITIAL_ORG_0001_BOOKINGS;
  return new Map(bookings.map((b) => [b.id, b]));
}

/**
 * Helper to resolve service map
 */
function getServiceLookup(orgId: string) {
  const services = orgId === "ORG-0002" ? INITIAL_ORG_0002_SERVICES : INITIAL_ORG_0001_SERVICES;
  return new Map(services.map((s) => [s.id, s]));
}

/**
 * Calculates review summary metrics for an organization.
 * Note: Only 'Published' and 'Restored' reviews count in the average rating calculation.
 */
export async function getReviewSummary(orgId: string): Promise<ReviewSummaryMetrics> {
  if (isLiveMode()) {
    const res = await adminApi.reviews.list({ limit: 100 });
    const reviews: Review[] = (res.data || []).map(mapBackendReviewToReview);
    const totalReviews = reviews.length;
    const visibleReviews = reviews.filter(
      (r: Review) => r.status === "Published" || r.status === "Restored"
    );
    const sumRating = visibleReviews.reduce((acc: number, r: Review) => acc + r.rating, 0);
    const averageRating =
      visibleReviews.length > 0
        ? Number((sumRating / visibleReviews.length).toFixed(1))
        : 0;

    let fiveStarCount = 0;
    let fourStarCount = 0;
    let threeStarCount = 0;
    let twoStarCount = 0;
    let oneStarCount = 0;
    let flaggedCount = 0;
    let hiddenCount = 0;

    reviews.forEach((r: Review) => {
      if (r.rating === 5) fiveStarCount++;
      else if (r.rating === 4) fourStarCount++;
      else if (r.rating === 3) threeStarCount++;
      else if (r.rating === 2) twoStarCount++;
      else if (r.rating === 1) oneStarCount++;

      if (r.status === "Flagged") flaggedCount++;
      else if (r.status === "Hidden") hiddenCount++;
    });

    const getPercent = (cnt: number) =>
      totalReviews > 0 ? Math.round((cnt / totalReviews) * 100) : 0;

    const distribution = [
      { rating: 5, count: fiveStarCount, percentage: getPercent(fiveStarCount) },
      { rating: 4, count: fourStarCount, percentage: getPercent(fourStarCount) },
      { rating: 3, count: threeStarCount, percentage: getPercent(threeStarCount) },
      { rating: 2, count: twoStarCount, percentage: getPercent(twoStarCount) },
      { rating: 1, count: oneStarCount, percentage: getPercent(oneStarCount) },
    ];

    return {
      totalReviews,
      averageRating,
      fiveStarCount,
      fourStarCount,
      threeStarCount,
      twoStarCount,
      oneStarCount,
      flaggedCount,
      hiddenCount,
      distribution,
    };
  }

  const reviews = getMockReviewsByOrg(orgId);
  const totalReviews = reviews.length;

  // Visible reviews for average rating
  const visibleReviews = reviews.filter(
    (r) => r.status === "Published" || r.status === "Restored"
  );
  const sumRating = visibleReviews.reduce((acc, r) => acc + r.rating, 0);
  const averageRating =
    visibleReviews.length > 0
      ? Number((sumRating / visibleReviews.length).toFixed(1))
      : 0;

  // Star counts across all reviews
  let fiveStarCount = 0;
  let fourStarCount = 0;
  let threeStarCount = 0;
  let twoStarCount = 0;
  let oneStarCount = 0;
  let flaggedCount = 0;
  let hiddenCount = 0;

  reviews.forEach((r) => {
    if (r.rating === 5) fiveStarCount++;
    else if (r.rating === 4) fourStarCount++;
    else if (r.rating === 3) threeStarCount++;
    else if (r.rating === 2) twoStarCount++;
    else if (r.rating === 1) oneStarCount++;

    if (r.status === "Flagged") flaggedCount++;
    else if (r.status === "Hidden") hiddenCount++;
  });

  const getPercent = (cnt: number) =>
    totalReviews > 0 ? Math.round((cnt / totalReviews) * 100) : 0;

  const distribution = [
    { rating: 5, count: fiveStarCount, percentage: getPercent(fiveStarCount) },
    { rating: 4, count: fourStarCount, percentage: getPercent(fourStarCount) },
    { rating: 3, count: threeStarCount, percentage: getPercent(threeStarCount) },
    { rating: 2, count: twoStarCount, percentage: getPercent(twoStarCount) },
    { rating: 1, count: oneStarCount, percentage: getPercent(oneStarCount) },
  ];

  return {
    totalReviews,
    averageRating,
    fiveStarCount,
    fourStarCount,
    threeStarCount,
    twoStarCount,
    oneStarCount,
    flaggedCount,
    hiddenCount,
    distribution,
  };
}

/**
 * Lists reviews with search, multi-filters, sorting, and pagination.
 */
export async function listReviews(params: ListReviewsParams): Promise<ListReviewsResult> {
  if (isLiveMode()) {
    const res = await adminApi.reviews.list({
      page: params.page,
      limit: params.pageSize,
      search: params.search,
      status: params.status !== "all" ? params.status : undefined,
    });
    const items = (res.data || []).map(mapBackendReviewToReview);
    const meta = (res as any).meta || { page: params.page || 1, limit: params.pageSize || 10, total: items.length, totalPages: 1 };
    return {
      reviews: items,
      total: meta.total,
      page: meta.page,
      pageSize: meta.limit,
      totalPages: meta.totalPages || Math.ceil(meta.total / (meta.limit || 10)),
    };
  }

  const {
    organizationId,
    search = "",
    rating = "all",
    status = "all",
    serviceCategory = "all",
    providerId = "all",
    datePreset = "all",
    sort = "newest",
    sortDirection = "desc",
    page = 1,
    pageSize = 10,
  } = params;

  let reviews = getMockReviewsByOrg(organizationId);

  const customerMap = getCustomerLookup(organizationId);
  const providerMap = getProviderLookup(organizationId);
  const serviceMap = getServiceLookup(organizationId);

  // 1. Search Filter
  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    reviews = reviews.filter((r) => {
      const cust = customerMap.get(r.customerId);
      const prov = providerMap.get(r.providerId);
      const serv = serviceMap.get(r.serviceId);

      return (
        r.id.toLowerCase().includes(q) ||
        r.bookingId.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q) ||
        (r.title && r.title.toLowerCase().includes(q)) ||
        (cust && (cust.fullName.toLowerCase().includes(q) || cust.email.toLowerCase().includes(q))) ||
        (prov && (prov.fullName.toLowerCase().includes(q) || prov.businessName?.toLowerCase().includes(q))) ||
        (serv && serv.name.toLowerCase().includes(q))
      );
    });
  }

  // 2. Rating Filter
  if (rating !== "all" && typeof rating === "number") {
    reviews = reviews.filter((r) => r.rating === rating);
  }

  // 3. Status Filter
  if (status !== "all") {
    reviews = reviews.filter((r) => r.status === status);
  }

  // 4. Provider Filter
  if (providerId !== "all") {
    reviews = reviews.filter((r) => r.providerId === providerId);
  }

  // 5. Service Category Filter
  if (serviceCategory !== "all") {
    reviews = reviews.filter((r) => {
      const serv = serviceMap.get(r.serviceId);
      return serv && serv.category.toLowerCase() === serviceCategory.toLowerCase();
    });
  }

  // 6. Date Preset Filter
  if (datePreset !== "all") {
    const now = new Date("2026-09-02T12:00:00Z").getTime();
    const oneDay = 24 * 60 * 60 * 1000;

    reviews = reviews.filter((r) => {
      const createdTime = new Date(r.createdAt).getTime();
      const diffDays = (now - createdTime) / oneDay;

      if (datePreset === "today") return diffDays <= 1;
      if (datePreset === "yesterday") return diffDays > 1 && diffDays <= 2;
      if (datePreset === "last_7_days") return diffDays <= 7;
      if (datePreset === "last_30_days") return diffDays <= 30;
      return true;
    });
  }

  // 7. Sorting
  reviews.sort((a, b) => {
    let result = 0;
    if (sort === "newest") {
      result = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sort === "oldest") {
      result = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sort === "highest_rating") {
      result = b.rating - a.rating;
    } else if (sort === "lowest_rating") {
      result = a.rating - b.rating;
    } else if (sort === "customer") {
      const nameA = customerMap.get(a.customerId)?.fullName || "";
      const nameB = customerMap.get(b.customerId)?.fullName || "";
      result = nameA.localeCompare(nameB);
    } else if (sort === "provider") {
      const nameA = providerMap.get(a.providerId)?.fullName || "";
      const nameB = providerMap.get(b.providerId)?.fullName || "";
      result = nameA.localeCompare(nameB);
    } else if (sort === "service") {
      const nameA = serviceMap.get(a.serviceId)?.name || "";
      const nameB = serviceMap.get(b.serviceId)?.name || "";
      result = nameA.localeCompare(nameB);
    }

    return sortDirection === "desc" ? result : -result;
  });

  const total = reviews.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const paginatedReviews = reviews.slice(startIdx, startIdx + pageSize);

  return {
    reviews: paginatedReviews,
    total,
    page: currentPage,
    pageSize,
    totalPages,
  };
}

/**
 * Retrieves full details for a review including linked domain entities and audit history.
 */
export async function getReviewById(
  orgId: string,
  reviewId: string
): Promise<ReviewDetailResult | null> {
  if (isLiveMode()) {
    try {
      const res = await adminApi.reviews.getById(reviewId);
      if (!res.data) return null;
      const r = mapBackendReviewToReview(res.data);
      return {
        review: r,
        customer: {
          id: r.customerId,
          fullName: res.data.customer?.fullName || "Verified Customer",
          email: res.data.customer?.email || "customer@example.com",
          phone: res.data.customer?.phone || "+91 98765 43210",
          totalReviewsCount: 1,
        },
        provider: {
          id: r.providerId,
          fullName: res.data.provider?.fullName || "Certified Partner",
          businessName: res.data.provider?.businessName || "WASHORA Care Center",
          rating: res.data.provider?.rating || 4.8,
        },
        booking: {
          id: r.bookingId,
          bookingNumber: res.data.booking?.bookingNumber || `BK-${r.bookingId}`,
          scheduledAt: res.data.booking?.scheduledAt || r.createdAt,
          status: res.data.booking?.status || "Completed",
          totalAmount: res.data.booking?.totalAmount || 850,
        },
        service: {
          id: r.serviceId,
          name: res.data.service?.name || "Garment Care Service",
          category: res.data.service?.category || "Dry Cleaning",
        },
        activities: [],
        notes: [],
        customerRecentReviews: [],
      };
    } catch (err: any) {
      if (err?.status === 404 || err?.statusCode === 404) return null;
      throw err;
    }
  }

  const reviews = getMockReviewsByOrg(orgId);
  const review = reviews.find((r) => r.id === reviewId);

  if (!review) return null;

  const customerMap = getCustomerLookup(orgId);
  const providerMap = getProviderLookup(orgId);
  const bookingMap = getBookingLookup(orgId);
  const serviceMap = getServiceLookup(orgId);

  const rawCustomer = customerMap.get(review.customerId);
  const rawProvider = providerMap.get(review.providerId);
  const rawBooking = bookingMap.get(review.bookingId);
  const rawService = serviceMap.get(review.serviceId);

  const customerReviews = reviews.filter((r) => r.customerId === review.customerId);
  const customerRecentReviews = customerReviews
    .filter((r) => r.id !== review.id)
    .slice(0, 3);

  const activities = getMockReviewActivities(orgId, review.id);
  const notes = getMockReviewNotes(orgId, review.id);

  return {
    review,
    customer: {
      id: review.customerId,
      fullName: rawCustomer?.fullName || "Verified Customer",
      email: rawCustomer?.email || "customer@example.com",
      phone: rawCustomer?.phone || "+91 98765 43210",
      totalReviewsCount: customerReviews.length,
    },
    provider: {
      id: review.providerId,
      fullName: rawProvider?.fullName || "Certified Partner",
      businessName: rawProvider?.businessName || "WASHORA Care Center",
      rating: rawProvider?.rating || 4.8,
    },
    booking: {
      id: review.bookingId,
      bookingNumber: rawBooking?.bookingNumber || `BK-${review.bookingId}`,
      scheduledAt: rawBooking?.scheduledAt || review.createdAt,
      status: rawBooking?.status || "Completed",
      totalAmount: rawBooking?.totalAmount || 850,
    },
    service: {
      id: review.serviceId,
      name: rawService?.name || "Garment Care Service",
      category: rawService?.category || "Dry Cleaning",
    },
    activities,
    notes,
    customerRecentReviews,
  };
}

/**
 * Calculates rating summary for a provider (Only Published & Restored reviews count).
 */
export async function getProviderRatingSummary(
  orgId: string,
  providerId: string
): Promise<ProviderRatingSummary> {
  const reviews = getMockReviewsByOrg(orgId).filter(
    (r) =>
      r.providerId === providerId &&
      (r.status === "Published" || r.status === "Restored")
  );

  const totalReviews = reviews.length;
  const sumRating = reviews.reduce((acc, r) => acc + r.rating, 0);
  const averageRating =
    totalReviews > 0 ? Number((sumRating / totalReviews).toFixed(1)) : 0;

  let fiveStarCount = 0;
  let fourStarCount = 0;
  let threeStarCount = 0;
  let twoStarCount = 0;
  let oneStarCount = 0;

  reviews.forEach((r) => {
    if (r.rating === 5) fiveStarCount++;
    else if (r.rating === 4) fourStarCount++;
    else if (r.rating === 3) threeStarCount++;
    else if (r.rating === 2) twoStarCount++;
    else if (r.rating === 1) oneStarCount++;
  });

  return {
    providerId,
    averageRating,
    totalReviews,
    fiveStarCount,
    fourStarCount,
    threeStarCount,
    twoStarCount,
    oneStarCount,
  };
}

/**
 * Calculates rating summary for a service (Only Published & Restored reviews count).
 */
export async function getServiceRatingSummary(
  orgId: string,
  serviceId: string
): Promise<ServiceRatingSummary> {
  const reviews = getMockReviewsByOrg(orgId).filter(
    (r) =>
      r.serviceId === serviceId &&
      (r.status === "Published" || r.status === "Restored")
  );

  const totalReviews = reviews.length;
  const sumRating = reviews.reduce((acc, r) => acc + r.rating, 0);
  const averageRating =
    totalReviews > 0 ? Number((sumRating / totalReviews).toFixed(1)) : 0;

  let fiveStarCount = 0;
  let fourStarCount = 0;
  let threeStarCount = 0;
  let twoStarCount = 0;
  let oneStarCount = 0;

  reviews.forEach((r) => {
    if (r.rating === 5) fiveStarCount++;
    else if (r.rating === 4) fourStarCount++;
    else if (r.rating === 3) threeStarCount++;
    else if (r.rating === 2) twoStarCount++;
    else if (r.rating === 1) oneStarCount++;
  });

  const getPercent = (cnt: number) =>
    totalReviews > 0 ? Math.round((cnt / totalReviews) * 100) : 0;

  const distribution = [
    { rating: 5, count: fiveStarCount, percentage: getPercent(fiveStarCount) },
    { rating: 4, count: fourStarCount, percentage: getPercent(fourStarCount) },
    { rating: 3, count: threeStarCount, percentage: getPercent(threeStarCount) },
    { rating: 2, count: twoStarCount, percentage: getPercent(twoStarCount) },
    { rating: 1, count: oneStarCount, percentage: getPercent(oneStarCount) },
  ];

  return {
    serviceId,
    averageRating,
    totalReviews,
    distribution,
  };
}

/**
 * Flag review
 */
export async function flagReview(
  orgId: string,
  reviewId: string,
  reason: ModerationReason,
  note: string,
  moderatedBy: string = "Admin Console"
): Promise<Review> {
  if (isLiveMode()) {
    const res = await adminApi.reviews.hide(reviewId, `${reason}: ${note}`);
    return mapBackendReviewToReview(res.data);
  }

  const result = flagReviewInStore(orgId, reviewId, reason, note, moderatedBy);

  createMockNotificationInStore({
    organizationId: orgId,
    type: "Review",
    priority: "High",
    title: `Review ${reviewId} flagged for moderation`,
    message: `Review ${reviewId} was flagged for moderation (${reason}) by ${moderatedBy}.`,
    relatedEntityType: "Review",
    relatedEntityId: reviewId,
    actionRoute: `/admin/reviews/${reviewId}`,
    actorName: moderatedBy,
  });

  return result;
}

/**
 * Hide review
 */
export async function hideReview(
  orgId: string,
  reviewId: string,
  moderatedBy: string = "Admin Console",
  reason?: ModerationReason,
  note?: string
): Promise<Review> {
  if (isLiveMode()) {
    const res = await adminApi.reviews.hide(reviewId, note || reason);
    return mapBackendReviewToReview(res.data);
  }

  const result = hideReviewInStore(orgId, reviewId, moderatedBy, reason, note);

  createMockNotificationInStore({
    organizationId: orgId,
    type: "Review",
    priority: "High",
    title: `Review ${reviewId} hidden by moderator`,
    message: `Review ${reviewId} has been hidden from public rating aggregations by ${moderatedBy}.`,
    relatedEntityType: "Review",
    relatedEntityId: reviewId,
    actionRoute: `/admin/reviews/${reviewId}`,
    actorName: moderatedBy,
  });

  return result;
}

/**
 * Restore review
 */
export async function restoreReview(
  orgId: string,
  reviewId: string,
  moderatedBy: string = "Admin Console",
  note?: string
): Promise<Review> {
  if (isLiveMode()) {
    const res = await adminApi.reviews.restore(reviewId, note);
    return mapBackendReviewToReview(res.data);
  }

  const result = restoreReviewInStore(orgId, reviewId, moderatedBy, note);

  createMockNotificationInStore({
    organizationId: orgId,
    type: "Review",
    priority: "Normal",
    title: `Review ${reviewId} restored to published state`,
    message: `Review ${reviewId} was restored and now contributes to public rating averages.`,
    relatedEntityType: "Review",
    relatedEntityId: reviewId,
    actionRoute: `/admin/reviews/${reviewId}`,
    actorName: moderatedBy,
  });

  return result;
}

/**
 * Publish flagged review
 */
export async function publishReview(
  orgId: string,
  reviewId: string,
  moderatedBy: string = "Admin Console"
): Promise<Review> {
  if (isLiveMode()) {
    const res = await adminApi.reviews.publish(reviewId);
    return mapBackendReviewToReview(res.data);
  }

  const result = publishReviewInStore(orgId, reviewId, moderatedBy);

  createMockNotificationInStore({
    organizationId: orgId,
    type: "Review",
    priority: "Normal",
    title: `Review ${reviewId} approved and published`,
    message: `Flagged review ${reviewId} was reviewed and published by ${moderatedBy}.`,
    relatedEntityType: "Review",
    relatedEntityId: reviewId,
    actionRoute: `/admin/reviews/${reviewId}`,
    actorName: moderatedBy,
  });

  return result;
}

/**
 * Add internal moderation note
 */
export async function addModerationNote(
  orgId: string,
  reviewId: string,
  note: string,
  createdBy: string = "Admin Console"
): Promise<ReviewModerationNote> {
  return addModerationNoteInStore(orgId, reviewId, note, createdBy);
}
