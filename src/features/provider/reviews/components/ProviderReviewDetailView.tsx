"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  useProviderReviewItem,
  useProviderReviews,
} from "@/features/provider/reviews/hooks/useProviderReviews";
import { ProviderLoadingState } from "@/features/provider/components/ProviderLoadingState";
import { ProviderErrorState } from "@/features/provider/components/ProviderErrorState";
import { ProviderCard } from "@/features/provider/components/ProviderCard";
import { ProviderResponseComposer } from "./ProviderResponseComposer";
import { ReportReviewModal } from "./ReportReviewModal";

interface ProviderReviewDetailViewProps {
  reviewId: string;
}

export function ProviderReviewDetailView({ reviewId }: ProviderReviewDetailViewProps) {
  const { data: review, isLoading, isError } = useProviderReviewItem(reviewId);
  const { submitResponse, isSubmittingResponse, reportReview, isReportingReview } =
    useProviderReviews();

  const [isReportOpen, setIsReportOpen] = useState(false);

  if (isLoading) {
    return <ProviderLoadingState message="Loading Review Details &amp; Response..." />;
  }

  if (isError || !review) {
    return <ProviderErrorState title="Review record not found" />;
  }

  const handleResponseSubmit = async (responseText: string) => {
    await submitResponse({ reviewId: review.id, responseText });
  };

  const handleReportConfirm = async (reason: string, details: string) => {
    await reportReview({ reviewId: review.id, reason, details });
    setIsReportOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Back and Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/provider/reviews"
          className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-on-surface font-semibold transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Reviews</span>
        </Link>

        <button
          type="button"
          onClick={() => setIsReportOpen(true)}
          className="px-3 py-1.5 rounded-xl border border-error/30 text-error hover:bg-error-container/20 text-xs font-semibold transition-colors flex items-center gap-1.5 self-start"
        >
          <span className="material-symbols-outlined text-[16px]">flag</span>
          <span>Report Review</span>
        </button>
      </div>

      {/* Main Grid: Left (Customer & Order Info) | Right (Review & Reply Composer) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Customer Context Card */}
          <ProviderCard variant="container" className="p-6 space-y-4">
            <h3 className="text-base font-bold text-on-surface border-b border-white/5 pb-2">
              Customer Information
            </h3>
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-surface-container-high border border-white/10 flex items-center justify-center font-bold text-primary text-lg">
                {review.customerName.charAt(0)}
              </div>
              <div>
                <h4 className="text-sm font-bold text-on-surface">{review.customerName}</h4>
                <span className="text-xs text-on-surface-variant">
                  {review.isFirstTimeCustomer ? "First-time Customer" : "Repeat Client"}
                </span>
              </div>
            </div>
          </ProviderCard>

          {/* Order Snapshot Card */}
          <ProviderCard variant="container" className="p-6 space-y-4">
            <h3 className="text-base font-bold text-on-surface border-b border-white/5 pb-2">
              Order Snapshot
            </h3>
            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-on-surface-variant block">Service</span>
                <span className="font-bold text-on-surface">{review.serviceName}</span>
              </div>
              <div>
                <span className="text-on-surface-variant block">Order ID</span>
                <span className="font-mono text-primary font-bold">{review.orderNumber}</span>
              </div>
              <div>
                <span className="text-on-surface-variant block">Reviewed On</span>
                <span className="text-on-surface font-medium">{review.reviewDate}</span>
              </div>
            </div>
          </ProviderCard>
        </div>

        {/* Right Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* The Review Card */}
          <ProviderCard variant="container" className="p-6 md:p-8 space-y-4 border-l-4 border-l-primary">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`material-symbols-outlined text-[20px] ${
                      star <= review.rating ? "text-amber-400" : "text-zinc-600"
                    }`}
                  >
                    star
                  </span>
                ))}
                <span className="text-sm font-bold text-on-surface ml-1">{review.rating}.0 / 5</span>
              </div>

              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 uppercase">
                Verified Service
              </span>
            </div>

            <p className="text-sm text-on-surface leading-relaxed italic border-l-2 border-primary/40 pl-3.5 py-1">
              &quot;{review.reviewText}&quot;
            </p>

            {/* Photos if attached */}
            {review.photos && review.photos.length > 0 && (
              <div className="flex items-center gap-2 pt-2">
                {review.photos.map((photo, idx) => (
                  <div key={idx} className="w-24 h-24 rounded-xl overflow-hidden border border-white/10">
                    <img
                      src={photo}
                      alt="Customer review photo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </ProviderCard>

          {/* Response Composer */}
          <ProviderResponseComposer
            initialResponse={review.response?.responseText}
            customerName={review.customerName}
            onSubmit={handleResponseSubmit}
            isSubmitting={isSubmittingResponse}
          />
        </div>
      </div>

      {/* Report Review Modal */}
      <ReportReviewModal
        review={review}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onConfirm={handleReportConfirm}
        isReporting={isReportingReview}
      />
    </div>
  );
}
