"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  AlertTriangle,
  Star,
  Layers,
  Filter,
} from "lucide-react";
import { useAdminReviews } from "../../hooks/useAdminReviews";
import { ReviewsHeader } from "./ReviewsHeader";
import { ReviewsSummaryCards } from "./ReviewsSummaryCards";
import { RatingDistributionWidget } from "./RatingDistributionWidget";
import { ReviewsSearchFilterBar } from "./ReviewsSearchFilterBar";
import { ReviewsTable } from "./ReviewsTable";
import { ReviewsPagination } from "./ReviewsPagination";
import { FlagReviewModal } from "./modals/FlagReviewModal";
import { HideReviewModal } from "./modals/HideReviewModal";
import { RestoreReviewModal } from "./modals/RestoreReviewModal";
import { PublishReviewModal } from "./modals/PublishReviewModal";
import { Review } from "@/types/admin/review";

export function ReviewsListMasterView() {
  const {
    organizationId,
    loading,
    error,
    summary,
    result,
    activeTab,
    setActiveTab,
    search,
    setSearch,
    rating,
    setRating,
    status,
    setStatus,
    serviceCategory,
    setServiceCategory,
    providerId,
    setProviderId,
    datePreset,
    setDatePreset,
    page,
    setPage,
    pageSize,
    setPageSize,
    resetFilters,
    refetch,
    flagReview,
    hideReview,
    restoreReview,
    publishReview,
  } = useAdminReviews();

  // Selected review for modals
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
  const [isHideModalOpen, setIsHideModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  const handleFlagClick = (review: Review) => {
    setSelectedReview(review);
    setIsFlagModalOpen(true);
  };

  const handleHideClick = (review: Review) => {
    setSelectedReview(review);
    setIsHideModalOpen(true);
  };

  const handleRestoreClick = (review: Review) => {
    setSelectedReview(review);
    setIsRestoreModalOpen(true);
  };

  const handlePublishClick = (review: Review) => {
    setSelectedReview(review);
    setIsPublishModalOpen(true);
  };

  const isFiltered =
    Boolean(search) ||
    rating !== "all" ||
    status !== "all" ||
    serviceCategory !== "all" ||
    providerId !== "all" ||
    datePreset !== "all";

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <ReviewsHeader
        organizationId={organizationId}
        totalReviews={summary?.totalReviews || 0}
        flaggedCount={summary?.flaggedCount || 0}
        onRefresh={refetch}
        isLoading={loading}
      />

      {/* Summary KPI Cards */}
      <ReviewsSummaryCards metrics={summary} isLoading={loading} />

      {/* Rating Breakdown Distribution Widget */}
      <RatingDistributionWidget
        metrics={summary}
        selectedRating={rating}
        onSelectRating={(r) => setRating(r)}
        isLoading={loading}
      />

      {/* View Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-1">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-lg transition-all ${
            activeTab === "all"
              ? "bg-surface-container-high text-on-surface border-b-2 border-primary"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-primary" />
          <span>All Customer Reviews</span>
          {summary && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-surface-container text-on-surface font-mono">
              {summary.totalReviews}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("flagged")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-lg transition-all ${
            activeTab === "flagged"
              ? "bg-surface-container-high text-on-surface border-b-2 border-rose-500"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          <span>Flagged Queue</span>
          {summary && summary.flaggedCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500/10 text-rose-500 font-bold border border-rose-500/20">
              {summary.flaggedCount}
            </span>
          )}
        </button>
      </div>

      {/* Search & Multi-Filters */}
      <ReviewsSearchFilterBar
        search={search}
        onSearchChange={setSearch}
        rating={rating}
        onRatingChange={setRating}
        status={status}
        onStatusChange={setStatus}
        serviceCategory={serviceCategory}
        onServiceCategoryChange={setServiceCategory}
        datePreset={datePreset}
        onDatePresetChange={setDatePreset}
        onReset={resetFilters}
        isFiltered={isFiltered}
      />

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500">
          {error}
        </div>
      )}

      {/* Data Table */}
      <ReviewsTable
        reviews={result.reviews}
        isLoading={loading}
        onFlagClick={handleFlagClick}
        onHideClick={handleHideClick}
        onRestoreClick={handleRestoreClick}
        onPublishClick={handlePublishClick}
        onResetFilters={resetFilters}
      />

      {/* Pagination */}
      <ReviewsPagination
        page={result.page}
        pageSize={result.pageSize}
        total={result.total}
        totalPages={result.totalPages}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      {/* Moderation Modals */}
      <FlagReviewModal
        isOpen={isFlagModalOpen}
        onClose={() => {
          setIsFlagModalOpen(false);
          setSelectedReview(null);
        }}
        review={selectedReview}
        onSubmit={async (reason, note) => {
          if (selectedReview) {
            await flagReview(selectedReview.id, reason, note);
          }
        }}
      />

      <HideReviewModal
        isOpen={isHideModalOpen}
        onClose={() => {
          setIsHideModalOpen(false);
          setSelectedReview(null);
        }}
        review={selectedReview}
        onSubmit={async (reason, note) => {
          if (selectedReview) {
            await hideReview(selectedReview.id, reason, note);
          }
        }}
      />

      <RestoreReviewModal
        isOpen={isRestoreModalOpen}
        onClose={() => {
          setIsRestoreModalOpen(false);
          setSelectedReview(null);
        }}
        review={selectedReview}
        onSubmit={async (note) => {
          if (selectedReview) {
            await restoreReview(selectedReview.id, note);
          }
        }}
      />

      <PublishReviewModal
        isOpen={isPublishModalOpen}
        onClose={() => {
          setIsPublishModalOpen(false);
          setSelectedReview(null);
        }}
        review={selectedReview}
        onSubmit={async () => {
          if (selectedReview) {
            await publishReview(selectedReview.id);
          }
        }}
      />
    </div>
  );
}
