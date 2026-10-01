"use client";

import React, { useState } from "react";
import { useProviderReviews } from "@/features/provider/reviews/hooks/useProviderReviews";
import { ProviderReviewItem, ProviderReviewFilters } from "@/types/provider/reviews";
import { ProviderLoadingState } from "@/features/provider/components/ProviderLoadingState";
import { ProviderErrorState } from "@/features/provider/components/ProviderErrorState";
import { ProviderEmptyState } from "@/features/provider/components/ProviderEmptyState";
import { RatingOverviewBento } from "./RatingOverviewBento";
import { ProviderReviewCard } from "./ProviderReviewCard";
import { ReportReviewModal } from "./ReportReviewModal";

export function ProviderReviewsCatalogView() {
  const [filters, setFilters] = useState<ProviderReviewFilters>({ sortBy: "recent" });
  const { summary, isLoadingSummary, reviews, isLoadingReviews, isError, refetch, reportReview, isReportingReview } =
    useProviderReviews(filters);

  const [activeStarTab, setActiveStarTab] = useState<number | undefined>(undefined);
  const [reportTarget, setReportTarget] = useState<ProviderReviewItem | null>(null);

  if (isLoadingSummary || isLoadingReviews) {
    return <ProviderLoadingState message="Loading Studio Reviews &amp; Quality Feedback..." />;
  }

  if (isError || !summary) {
    return <ProviderErrorState title="Failed to load review records" onRetry={() => refetch()} />;
  }

  const handleStarFilter = (star?: number) => {
    setActiveStarTab(star);
    setFilters((prev) => ({ ...prev, starRating: star }));
  };

  const handleReportConfirm = async (reason: string, details: string) => {
    if (!reportTarget) return;
    await reportReview({ reviewId: reportTarget.id, reason, details });
    setReportTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* 4.9 Score & Star Distribution Bento */}
      <RatingOverviewBento summary={summary} />

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleStarFilter(undefined)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeStarTab === undefined
                ? "bg-primary text-on-primary font-bold shadow-sm"
                : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
            }`}
          >
            All Reviews ({summary.totalReviews.toLocaleString()})
          </button>

          {[5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleStarFilter(star)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
                activeStarTab === star
                  ? "bg-primary text-on-primary font-bold shadow-sm"
                  : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span>{star} Star</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-on-surface-variant">Sort:</span>
          <select
            value={filters.sortBy || "recent"}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, sortBy: e.target.value as any }))
            }
            className="bg-surface-container text-on-surface text-xs rounded-xl px-3 py-1.5 border border-white/5 focus:border-primary outline-none cursor-pointer"
          >
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <ProviderEmptyState
          title="No Reviews Found"
          description="There are no reviews matching the selected filter criteria."
          iconName="star_half"
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ProviderReviewCard
              key={review.id}
              review={review}
              onReportClick={(r) => setReportTarget(r)}
            />
          ))}
        </div>
      )}

      {/* Report Review Modal */}
      <ReportReviewModal
        review={reportTarget}
        isOpen={!!reportTarget}
        onClose={() => setReportTarget(null)}
        onConfirm={handleReportConfirm}
        isReporting={isReportingReview}
      />
    </div>
  );
}
