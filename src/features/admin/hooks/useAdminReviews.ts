"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdminSession } from "./useAdminSession";
import {
  getReviewSummary,
  listReviews,
  getReviewById,
  flagReview as apiFlagReview,
  hideReview as apiHideReview,
  restoreReview as apiRestoreReview,
  publishReview as apiPublishReview,
  addModerationNote as apiAddModerationNote,
} from "@/services/admin/adminReviewService";
import {
  Review,
  ReviewStatus,
  ModerationReason,
  ReviewModerationNote,
  ReviewSummaryMetrics,
  ListReviewsParams,
  ListReviewsResult,
  ReviewDetailResult,
} from "@/types/admin/review";

export function useAdminReviews(initialParams?: Partial<ListReviewsParams>) {
  const { user } = useAdminSession();
  const organizationId = user?.organizationId || "ORG-0001";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ReviewSummaryMetrics | null>(null);
  const [result, setResult] = useState<ListReviewsResult>({
    reviews: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  });

  // Active view tab: "all" or "flagged"
  const [activeTab, setActiveTab] = useState<"all" | "flagged">("all");

  // Search & Filter State
  const [search, setSearch] = useState(initialParams?.search || "");
  const [rating, setRating] = useState<number | "all">(initialParams?.rating || "all");
  const [status, setStatus] = useState<ReviewStatus | "all">(initialParams?.status || "all");
  const [serviceCategory, setServiceCategory] = useState<string | "all">(
    initialParams?.serviceCategory || "all"
  );
  const [providerId, setProviderId] = useState<string | "all">(
    initialParams?.providerId || "all"
  );
  const [datePreset, setDatePreset] = useState<
    "all" | "today" | "yesterday" | "last_7_days" | "last_30_days"
  >(initialParams?.datePreset || "all");
  const [sort, setSort] = useState<
    "newest" | "oldest" | "highest_rating" | "lowest_rating" | "customer" | "provider" | "service"
  >(initialParams?.sort || "newest");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    initialParams?.sortDirection || "desc"
  );
  const [page, setPage] = useState(initialParams?.page || 1);
  const [pageSize, setPageSize] = useState(initialParams?.pageSize || 10);

  const fetchReviewsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // If activeTab is 'flagged', force status to 'Flagged' unless user specified another
      const effectiveStatus = activeTab === "flagged" ? "Flagged" : status;

      const [summaryRes, listRes] = await Promise.all([
        getReviewSummary(organizationId),
        listReviews({
          organizationId,
          search,
          rating,
          status: effectiveStatus,
          serviceCategory,
          providerId,
          datePreset,
          sort,
          sortDirection,
          page,
          pageSize,
        }),
      ]);

      setSummary(summaryRes);
      setResult(listRes);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load reviews data";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [
    organizationId,
    activeTab,
    search,
    rating,
    status,
    serviceCategory,
    providerId,
    datePreset,
    sort,
    sortDirection,
    page,
    pageSize,
  ]);

  useEffect(() => {
    fetchReviewsData();
  }, [fetchReviewsData]);

  const resetFilters = useCallback(() => {
    setSearch("");
    setRating("all");
    setStatus("all");
    setServiceCategory("all");
    setProviderId("all");
    setDatePreset("all");
    setSort("newest");
    setSortDirection("desc");
    setPage(1);
  }, []);

  // Moderation action handlers
  const flagReview = async (
    reviewId: string,
    reason: ModerationReason,
    note: string
  ): Promise<Review> => {
    const res = await apiFlagReview(
      organizationId,
      reviewId,
      reason,
      note,
      user?.name || "Admin Console"
    );
    await fetchReviewsData();
    return res;
  };

  const hideReview = async (
    reviewId: string,
    reason?: ModerationReason,
    note?: string
  ): Promise<Review> => {
    const res = await apiHideReview(
      organizationId,
      reviewId,
      user?.name || "Admin Console",
      reason,
      note
    );
    await fetchReviewsData();
    return res;
  };

  const restoreReview = async (reviewId: string, note?: string): Promise<Review> => {
    const res = await apiRestoreReview(
      organizationId,
      reviewId,
      user?.name || "Admin Console",
      note
    );
    await fetchReviewsData();
    return res;
  };

  const publishReview = async (reviewId: string): Promise<Review> => {
    const res = await apiPublishReview(
      organizationId,
      reviewId,
      user?.name || "Admin Console"
    );
    await fetchReviewsData();
    return res;
  };

  const addModerationNote = async (
    reviewId: string,
    note: string
  ): Promise<ReviewModerationNote> => {
    const res = await apiAddModerationNote(
      organizationId,
      reviewId,
      note,
      user?.name || "Admin Console"
    );
    await fetchReviewsData();
    return res;
  };

  return {
    organizationId,
    loading,
    error,
    summary,
    result,
    activeTab,
    setActiveTab: (tab: "all" | "flagged") => {
      setActiveTab(tab);
      setPage(1);
    },
    // Filter & Search states
    search,
    setSearch: (val: string) => {
      setSearch(val);
      setPage(1);
    },
    rating,
    setRating: (val: number | "all") => {
      setRating(val);
      setPage(1);
    },
    status,
    setStatus: (val: ReviewStatus | "all") => {
      setStatus(val);
      setPage(1);
    },
    serviceCategory,
    setServiceCategory: (val: string | "all") => {
      setServiceCategory(val);
      setPage(1);
    },
    providerId,
    setProviderId: (val: string | "all") => {
      setProviderId(val);
      setPage(1);
    },
    datePreset,
    setDatePreset: (
      val: "all" | "today" | "yesterday" | "last_7_days" | "last_30_days"
    ) => {
      setDatePreset(val);
      setPage(1);
    },
    sort,
    setSort,
    sortDirection,
    setSortDirection,
    page,
    setPage,
    pageSize,
    setPageSize: (val: number) => {
      setPageSize(val);
      setPage(1);
    },
    resetFilters,
    refetch: fetchReviewsData,
    // Mutations
    flagReview,
    hideReview,
    restoreReview,
    publishReview,
    addModerationNote,
  };
}

export function useAdminReviewDetails(reviewId: string) {
  const { user } = useAdminSession();
  const organizationId = user?.organizationId || "ORG-0001";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ReviewDetailResult | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!reviewId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await getReviewById(organizationId, reviewId);
      if (!res) {
        setError(`Review with ID ${reviewId} was not found.`);
      } else {
        setData(res);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load review details";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [organizationId, reviewId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const flagReview = async (
    reason: ModerationReason,
    note: string
  ): Promise<Review> => {
    const res = await apiFlagReview(
      organizationId,
      reviewId,
      reason,
      note,
      user?.name || "Admin Console"
    );
    await fetchDetails();
    return res;
  };

  const hideReview = async (
    reason?: ModerationReason,
    note?: string
  ): Promise<Review> => {
    const res = await apiHideReview(
      organizationId,
      reviewId,
      user?.name || "Admin Console",
      reason,
      note
    );
    await fetchDetails();
    return res;
  };

  const restoreReview = async (note?: string): Promise<Review> => {
    const res = await apiRestoreReview(
      organizationId,
      reviewId,
      user?.name || "Admin Console",
      note
    );
    await fetchDetails();
    return res;
  };

  const publishReview = async (): Promise<Review> => {
    const res = await apiPublishReview(
      organizationId,
      reviewId,
      user?.name || "Admin Console"
    );
    await fetchDetails();
    return res;
  };

  const addModerationNote = async (note: string): Promise<ReviewModerationNote> => {
    const res = await apiAddModerationNote(
      organizationId,
      reviewId,
      note,
      user?.name || "Admin Console"
    );
    await fetchDetails();
    return res;
  };

  return {
    loading,
    error,
    data,
    refetch: fetchDetails,
    flagReview,
    hideReview,
    restoreReview,
    publishReview,
    addModerationNote,
  };
}
