import {
  Review,
  ReviewModerationActivity,
  ReviewModerationNote,
  ReviewStatus,
  ModerationReason,
  ALLOWED_MODERATION_TRANSITIONS,
} from "@/types/admin/review";
import { INITIAL_ORG_0001_BOOKINGS, INITIAL_ORG_0002_BOOKINGS } from "./booking.mock";

/**
 * DETERMINISTIC MOCK REPOSITORY FOR WASHORA REVIEWS & MODERATION (A11)
 * Strictly scoped by Organization ID.
 * ORG-0001: 42 deterministic reviews spanning ratings 1-5 and statuses (Published, Flagged, Hidden, Restored)
 * ORG-0002: 20 deterministic reviews
 * Total: 62 Reviews
 */

const REVIEW_COMMENTS: Array<{
  rating: number;
  title: string;
  comment: string;
  status: ReviewStatus;
  moderationReason?: ModerationReason;
  moderationNote?: string;
}> = [
  {
    rating: 5,
    title: "Exceptional garment care and punctual valet",
    comment: "The laundry came back impeccably pressed, folded with care, and smelling fresh. Valet arrived right on time.",
    status: "Published",
  },
  {
    rating: 5,
    title: "Outstanding stain removal on silk formal wear",
    comment: "Thought my designer shirt was ruined, but the team managed to lift tough curry stains completely. Very impressed!",
    status: "Published",
  },
  {
    rating: 4,
    title: "Great wash quality, slight delivery delay",
    comment: "Clothes are crisp and clean. Valet was delayed by 15 minutes due to heavy traffic, but communicated politely.",
    status: "Published",
  },
  {
    rating: 5,
    title: "Best eco-friendly dry cleaning service in city",
    comment: "No chemical odor at all! The organic detergent wash left my woolen jackets super soft and refreshed.",
    status: "Published",
  },
  {
    rating: 1,
    title: "Suspicious spam link in comment body",
    comment: "Check out this free discount coupon link at http://spam-promo-fake.com for 90% off all orders now!!",
    status: "Flagged",
    moderationReason: "Spam",
    moderationNote: "Review contains malicious external URL link and promotional spam.",
  },
  {
    rating: 2,
    title: "Shirt buttons cracked during steam pressing",
    comment: "Two of the collar buttons on my linen shirt were broken upon return. Needs better handling during press cycle.",
    status: "Published",
  },
  {
    rating: 5,
    title: "Flawless hotel-grade linen press",
    comment: "Bed sheets and duvet covers were steam ironed to perfection. Will definitely book weekly recurring.",
    status: "Published",
  },
  {
    rating: 1,
    title: "Inappropriate language directed at delivery valet",
    comment: "The valet was completely incompetent and idiotic! Horrible awful worthless service never ordering again!!",
    status: "Hidden",
    moderationReason: "Abusive Language",
    moderationNote: "Hidden due to direct personal attacks and profanity violating community standards.",
  },
  {
    rating: 4,
    title: "Clean laundry and great packaging",
    comment: "Neat hanger packaging for formal suits. Service fee is reasonable for the quality delivered.",
    status: "Published",
  },
  {
    rating: 3,
    title: "Average turnaround time",
    comment: "Decent wash, but took 48 hours instead of express 24 hours turnaround. Reasonable for standard rates.",
    status: "Published",
  },
  {
    rating: 5,
    title: "Excellent steam press on formal blazers",
    comment: "Crease-free and ready for my conference. Impressed with the prompt pickup from my apartment lobby.",
    status: "Published",
  },
  {
    rating: 1,
    title: "Personal phone number exposed in review",
    comment: "Call the valet directly at +91 98401 99999 if you want faster delivery, do not use the app chat.",
    status: "Hidden",
    moderationReason: "Personal Information",
    moderationNote: "Contains private contact details and mobile phone number.",
  },
  {
    rating: 4,
    title: "Sofa fabric shampooing was very thorough",
    comment: "Removed old dust stains and pet hair thoroughly. Took about 2 hours to dry completely under fans.",
    status: "Restored",
    moderationReason: "Other",
    moderationNote: "Restored after customer clarified service inspection report.",
  },
  {
    rating: 5,
    title: "Super fast turnaround and crisp ironing",
    comment: "Picked up at 9 AM and delivered by 6 PM in pristine condition. Highly recommended for busy professionals.",
    status: "Published",
  },
  {
    rating: 3,
    title: "Good wash, missed one handkerchief",
    comment: "Overall quality was solid, but one handkerchief was missing from the item count. Support resolved quickly.",
    status: "Published",
  },
  {
    rating: 2,
    title: "Strong detergent fragrance",
    comment: "The fabric conditioner fragrance was too overpowering for sensitive allergies. Please offer unscented option.",
    status: "Published",
  },
  {
    rating: 5,
    title: "Curtains look brand new after dry clean",
    comment: "Heavy velvet drapes were cleaned without any shrinkage or color fading. Excellent workmanship.",
    status: "Published",
  },
  {
    rating: 1,
    title: "Competitor advertisement review",
    comment: "Do not use Washora, order from QuickClean.app for half price and instant 1 hour delivery right now!!",
    status: "Flagged",
    moderationReason: "Irrelevant Content",
    moderationNote: "Direct promotional spam linking to competitor platform.",
  },
  {
    rating: 4,
    title: "Punctual doorstep pickup and drop",
    comment: "Valet partner was courteous, provided digital bag count receipt before leaving.",
    status: "Published",
  },
  {
    rating: 5,
    title: "Deep kitchen cleaning and grease removal",
    comment: "Chimney and countertop grease were completely eradicated. Sparkling clean finish throughout.",
    status: "Published",
  },
  {
    rating: 5,
    title: "Saree rolling and polishing was meticulous",
    comment: "Pure Kanchipuram silk sarees were handled with extreme care. Beautiful fold and tissue packaging.",
    status: "Published",
  },
];

// 1. Initial ORG-0001 Reviews (42 deterministic records)
export const INITIAL_ORG_0001_REVIEWS: Review[] = Array.from({ length: 42 }).map((_, idx) => {
  const b = INITIAL_ORG_0001_BOOKINGS[idx % INITIAL_ORG_0001_BOOKINGS.length];
  const sample = REVIEW_COMMENTS[idx % REVIEW_COMMENTS.length];
  const reviewId = `REV-${String(idx + 1).padStart(4, "0")}`;

  return {
    id: reviewId,
    organizationId: "ORG-0001",
    bookingId: b.id,
    customerId: b.customerId,
    providerId: b.providerId,
    serviceId: b.serviceId,
    rating: sample.rating,
    title: sample.title,
    comment: sample.comment,
    status: sample.status,
    createdAt: b.updatedAt || b.createdAt,
    updatedAt: b.updatedAt || b.createdAt,
    flaggedAt: sample.status === "Flagged" ? b.updatedAt : undefined,
    moderatedAt: sample.status !== "Published" ? b.updatedAt : undefined,
    moderatedBy: sample.status !== "Published" ? "Admin Aarav" : undefined,
    moderationReason: sample.moderationReason,
    moderationNote: sample.moderationNote,
  };
});

// 2. Initial ORG-0002 Reviews (20 deterministic records)
export const INITIAL_ORG_0002_REVIEWS: Review[] = Array.from({ length: 20 }).map((_, idx) => {
  const b = INITIAL_ORG_0002_BOOKINGS[idx % INITIAL_ORG_0002_BOOKINGS.length];
  const globalIdx = 42 + idx;
  const sample = REVIEW_COMMENTS[(idx + 3) % REVIEW_COMMENTS.length];
  const reviewId = `REV-${String(globalIdx + 1).padStart(4, "0")}`;

  return {
    id: reviewId,
    organizationId: "ORG-0002",
    bookingId: b.id,
    customerId: b.customerId,
    providerId: b.providerId,
    serviceId: b.serviceId,
    rating: sample.rating,
    title: sample.title,
    comment: sample.comment,
    status: sample.status,
    createdAt: b.updatedAt || b.createdAt,
    updatedAt: b.updatedAt || b.createdAt,
    flaggedAt: sample.status === "Flagged" ? b.updatedAt : undefined,
    moderatedAt: sample.status !== "Published" ? b.updatedAt : undefined,
    moderatedBy: sample.status !== "Published" ? "Admin Rahul" : undefined,
    moderationReason: sample.moderationReason,
    moderationNote: sample.moderationNote,
  };
});

// 3. Initial Moderation Activities
export const INITIAL_MODERATION_ACTIVITIES: ReviewModerationActivity[] = [
  {
    id: "RMOD-0001",
    reviewId: "REV-0005",
    organizationId: "ORG-0001",
    type: "Review Flagged",
    reason: "Spam",
    note: "Review contains malicious external promotional URL link.",
    performedBy: "Admin Aarav",
    timestamp: "2026-09-05T14:30:00Z",
  },
  {
    id: "RMOD-0002",
    reviewId: "REV-0008",
    organizationId: "ORG-0001",
    type: "Review Hidden",
    reason: "Abusive Language",
    note: "Violates community standards due to profanity and personal attack.",
    performedBy: "Operations Center",
    timestamp: "2026-09-04T11:00:00Z",
  },
  {
    id: "RMOD-0003",
    reviewId: "REV-0012",
    organizationId: "ORG-0001",
    type: "Review Hidden",
    reason: "Personal Information",
    note: "Private mobile number removed from public display.",
    performedBy: "Admin Aarav",
    timestamp: "2026-09-02T16:00:00Z",
  },
  {
    id: "RMOD-0004",
    reviewId: "REV-0013",
    organizationId: "ORG-0001",
    type: "Review Restored",
    note: "Restored after secondary review of inspection photos.",
    performedBy: "Supervisor Priya",
    timestamp: "2026-09-01T10:00:00Z",
  },
  {
    id: "RMOD-0005",
    reviewId: "REV-0018",
    organizationId: "ORG-0001",
    type: "Review Flagged",
    reason: "Irrelevant Content",
    note: "Competitor promotion spam.",
    performedBy: "Admin Aarav",
    timestamp: "2026-08-30T15:00:00Z",
  },
];

// 4. Initial Moderation Notes
export const INITIAL_MODERATION_NOTES: ReviewModerationNote[] = [
  {
    id: "RNOTE-0001",
    reviewId: "REV-0005",
    organizationId: "ORG-0001",
    note: "Customer account warned regarding promotional URL spamming policy.",
    createdBy: "Admin Aarav",
    createdAt: "2026-09-05T14:35:00Z",
  },
  {
    id: "RNOTE-0002",
    reviewId: "REV-0008",
    organizationId: "ORG-0001",
    note: "Valet driver reported harassment; review hidden permanently.",
    createdBy: "Operations Center",
    createdAt: "2026-09-04T11:10:00Z",
  },
  {
    id: "RNOTE-0003",
    reviewId: "REV-0013",
    organizationId: "ORG-0001",
    note: "Customer confirmed sofa cleaning met standards after re-inspection.",
    createdBy: "Supervisor Priya",
    createdAt: "2026-09-01T10:05:00Z",
  },
];

// ==========================================
// 5. IN-MEMORY RUNTIME STORES & MUTATION LOGIC
// ==========================================
let mockReviewsStore: Review[] = [
  ...INITIAL_ORG_0001_REVIEWS,
  ...INITIAL_ORG_0002_REVIEWS,
];

let mockActivitiesStore: ReviewModerationActivity[] = [
  ...INITIAL_MODERATION_ACTIVITIES,
];

let mockNotesStore: ReviewModerationNote[] = [
  ...INITIAL_MODERATION_NOTES,
];

let nextActivitySequence = 6;
let nextNoteSequence = 4;

export function getMockReviewsByOrg(orgId: string): Review[] {
  return mockReviewsStore.filter((r) => r.organizationId === orgId);
}

export function getMockReviewActivities(orgId: string, reviewId?: string): ReviewModerationActivity[] {
  return mockActivitiesStore.filter(
    (a) => a.organizationId === orgId && (!reviewId || a.reviewId === reviewId)
  );
}

export function getMockReviewNotes(orgId: string, reviewId: string): ReviewModerationNote[] {
  return mockNotesStore.filter((n) => n.organizationId === orgId && n.reviewId === reviewId);
}

/**
 * Flag review with reason and note
 */
export function flagReviewInStore(
  orgId: string,
  reviewId: string,
  reason: ModerationReason,
  note: string,
  moderatedBy: string
): Review {
  const index = mockReviewsStore.findIndex((r) => r.id === reviewId && r.organizationId === orgId);
  if (index === -1) {
    throw new Error(`Review ${reviewId} not found in organization ${orgId}`);
  }

  const review = mockReviewsStore[index];
  const allowed = ALLOWED_MODERATION_TRANSITIONS[review.status];
  if (!allowed.includes("Flagged")) {
    throw new Error(`Cannot transition review status from ${review.status} to Flagged`);
  }

  const now = new Date().toISOString();
  const updatedReview: Review = {
    ...review,
    status: "Flagged",
    moderationReason: reason,
    moderationNote: note,
    flaggedAt: now,
    moderatedAt: now,
    moderatedBy,
    updatedAt: now,
  };

  const activity: ReviewModerationActivity = {
    id: `RMOD-${String(nextActivitySequence++).padStart(4, "0")}`,
    reviewId,
    organizationId: orgId,
    type: "Review Flagged",
    reason,
    note,
    performedBy: moderatedBy,
    timestamp: now,
  };

  mockReviewsStore[index] = updatedReview;
  mockActivitiesStore = [activity, ...mockActivitiesStore];

  return updatedReview;
}

/**
 * Hide review from public display
 */
export function hideReviewInStore(
  orgId: string,
  reviewId: string,
  moderatedBy: string,
  reason?: ModerationReason,
  note?: string
): Review {
  const index = mockReviewsStore.findIndex((r) => r.id === reviewId && r.organizationId === orgId);
  if (index === -1) {
    throw new Error(`Review ${reviewId} not found in organization ${orgId}`);
  }

  const review = mockReviewsStore[index];
  const allowed = ALLOWED_MODERATION_TRANSITIONS[review.status];
  if (!allowed.includes("Hidden")) {
    throw new Error(`Cannot transition review status from ${review.status} to Hidden`);
  }

  const now = new Date().toISOString();
  const updatedReview: Review = {
    ...review,
    status: "Hidden",
    moderationReason: reason || review.moderationReason,
    moderationNote: note || review.moderationNote,
    moderatedAt: now,
    moderatedBy,
    updatedAt: now,
  };

  const activity: ReviewModerationActivity = {
    id: `RMOD-${String(nextActivitySequence++).padStart(4, "0")}`,
    reviewId,
    organizationId: orgId,
    type: "Review Hidden",
    reason: reason || review.moderationReason,
    note: note || review.moderationNote,
    performedBy: moderatedBy,
    timestamp: now,
  };

  mockReviewsStore[index] = updatedReview;
  mockActivitiesStore = [activity, ...mockActivitiesStore];

  return updatedReview;
}

/**
 * Restore hidden review to visible state
 */
export function restoreReviewInStore(
  orgId: string,
  reviewId: string,
  moderatedBy: string,
  note?: string
): Review {
  const index = mockReviewsStore.findIndex((r) => r.id === reviewId && r.organizationId === orgId);
  if (index === -1) {
    throw new Error(`Review ${reviewId} not found in organization ${orgId}`);
  }

  const review = mockReviewsStore[index];
  const allowed = ALLOWED_MODERATION_TRANSITIONS[review.status];
  if (!allowed.includes("Restored")) {
    throw new Error(`Cannot transition review status from ${review.status} to Restored`);
  }

  const now = new Date().toISOString();
  const updatedReview: Review = {
    ...review,
    status: "Restored",
    moderationNote: note || "Review restored by admin moderation.",
    moderatedAt: now,
    moderatedBy,
    updatedAt: now,
  };

  const activity: ReviewModerationActivity = {
    id: `RMOD-${String(nextActivitySequence++).padStart(4, "0")}`,
    reviewId,
    organizationId: orgId,
    type: "Review Restored",
    note: note || "Review restored to visible status.",
    performedBy: moderatedBy,
    timestamp: now,
  };

  mockReviewsStore[index] = updatedReview;
  mockActivitiesStore = [activity, ...mockActivitiesStore];

  return updatedReview;
}

/**
 * Publish a flagged review back to normal published status
 */
export function publishReviewInStore(
  orgId: string,
  reviewId: string,
  moderatedBy: string
): Review {
  const index = mockReviewsStore.findIndex((r) => r.id === reviewId && r.organizationId === orgId);
  if (index === -1) {
    throw new Error(`Review ${reviewId} not found in organization ${orgId}`);
  }

  const review = mockReviewsStore[index];
  const allowed = ALLOWED_MODERATION_TRANSITIONS[review.status];
  if (!allowed.includes("Published")) {
    throw new Error(`Cannot transition review status from ${review.status} to Published`);
  }

  const now = new Date().toISOString();
  const updatedReview: Review = {
    ...review,
    status: "Published",
    moderationReason: undefined,
    moderationNote: undefined,
    flaggedAt: undefined,
    moderatedAt: now,
    moderatedBy,
    updatedAt: now,
  };

  const activity: ReviewModerationActivity = {
    id: `RMOD-${String(nextActivitySequence++).padStart(4, "0")}`,
    reviewId,
    organizationId: orgId,
    type: "Review Published",
    note: "Flag cleared; review restored to Published status.",
    performedBy: moderatedBy,
    timestamp: now,
  };

  mockReviewsStore[index] = updatedReview;
  mockActivitiesStore = [activity, ...mockActivitiesStore];

  return updatedReview;
}

/**
 * Add internal team moderation note
 */
export function addModerationNoteInStore(
  orgId: string,
  reviewId: string,
  note: string,
  createdBy: string
): ReviewModerationNote {
  if (note.trim().length < 5) {
    throw new Error("Internal note must be at least 5 characters.");
  }
  if (note.trim().length > 500) {
    throw new Error("Internal note cannot exceed 500 characters.");
  }

  const now = new Date().toISOString();
  const newNote: ReviewModerationNote = {
    id: `RNOTE-${String(nextNoteSequence++).padStart(4, "0")}`,
    reviewId,
    organizationId: orgId,
    note: note.trim(),
    createdBy,
    createdAt: now,
  };

  mockNotesStore = [newNote, ...mockNotesStore];
  return newNote;
}

/**
 * Resets stores to deterministic initial values
 */
export function resetMockReviewStores(): void {
  mockReviewsStore = [
    ...INITIAL_ORG_0001_REVIEWS,
    ...INITIAL_ORG_0002_REVIEWS,
  ];
  mockActivitiesStore = [
    ...INITIAL_MODERATION_ACTIVITIES,
  ];
  mockNotesStore = [
    ...INITIAL_MODERATION_NOTES,
  ];
  nextActivitySequence = 6;
  nextNoteSequence = 4;
}
