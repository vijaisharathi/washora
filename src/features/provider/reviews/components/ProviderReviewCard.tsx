"use client";

import React from "react";
import Link from "next/link";
import { ProviderReviewItem } from "@/types/provider/reviews";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

interface ProviderReviewCardProps {
  review: ProviderReviewItem;
  onRespondClick?: (review: ProviderReviewItem) => void;
  onReportClick?: (review: ProviderReviewItem) => void;
}

export function ProviderReviewCard({
  review,
  onRespondClick,
  onReportClick,
}: ProviderReviewCardProps) {
  return (
    <ProviderCard
      variant="container"
      className="p-6 md:p-7 flex flex-col md:flex-row gap-6 transition-all hover:border-primary/40 border-l-4 border-l-primary"
    >
      {/* Customer Snapshot */}
      <div className="md:w-60 shrink-0 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-surface-container-high border border-white/10 flex items-center justify-center font-bold text-primary text-base shrink-0">
            {review.customerName.charAt(0)}
          </div>
          <div>
            <h4 className="text-sm font-bold text-on-surface leading-tight">{review.customerName}</h4>
            <span className="text-[11px] text-on-surface-variant block mt-0.5">
              {review.isFirstTimeCustomer ? "First-time Customer" : "Repeat Client"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-emerald-950/30 text-emerald-400 border border-emerald-500/20 rounded-full px-2.5 py-0.5 self-start text-[10px] font-bold uppercase tracking-wider">
          <span className="material-symbols-outlined text-[13px]">verified</span>
          <span>Verified Booking</span>
        </div>

        <span className="text-[11px] text-on-surface-variant font-mono">
          Order: {review.orderNumber}
        </span>
      </div>

      {/* Review Content & Provider Reply */}
      <div className="flex-1 flex flex-col justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            {/* Stars */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`material-symbols-outlined text-[18px] ${
                    star <= review.rating ? "text-amber-400" : "text-zinc-600"
                  }`}
                >
                  star
                </span>
              ))}
              <span className="text-xs font-bold text-on-surface ml-1">{review.rating}.0</span>
            </div>

            <span className="text-[11px] text-on-surface-variant bg-surface-container-low px-2.5 py-1 rounded-md border border-white/5">
              {review.serviceName}
            </span>
          </div>

          <p className="text-xs text-on-surface leading-relaxed italic border-l-2 border-primary/40 pl-3 py-1 bg-surface-container-low/40 rounded-r-lg">
            &quot;{review.reviewText}&quot;
          </p>

          {/* Photos if attached */}
          {review.photos && review.photos.length > 0 && (
            <div className="mt-3 flex items-center gap-2">
              {review.photos.map((photo, idx) => (
                <div
                  key={idx}
                  className="w-20 h-20 rounded-xl overflow-hidden border border-white/10 relative group"
                >
                  <img
                    src={photo}
                    alt="Customer review attachment"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Provider Existing Response if present */}
          {review.response && (
            <div className="mt-4 p-3.5 rounded-xl bg-primary-container/10 border border-primary/20 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-primary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">reply</span>
                  <span>Studio Response</span>
                </span>
                <span className="text-[10px] text-on-surface-variant font-mono">
                  {review.response.respondedAt}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {review.response.responseText}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
          <span className="text-on-surface-variant">{review.reviewDate}</span>

          <div className="flex items-center gap-2">
            {onReportClick && !review.isReported && (
              <button
                type="button"
                onClick={() => onReportClick(review)}
                className="px-2.5 py-1 rounded-lg border border-white/5 hover:bg-surface-variant text-[11px] font-semibold text-on-surface-variant hover:text-error transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">flag</span>
                <span>Report</span>
              </button>
            )}

            <Link
              href={`/provider/reviews/${review.id}`}
              className="px-3.5 py-1.5 rounded-lg bg-primary-container text-on-primary-container hover:bg-primary font-bold text-xs transition-all flex items-center gap-1"
            >
              <span>{review.response ? "Edit Response" : "Reply to Customer"}</span>
              <span className="material-symbols-outlined text-[14px]">reply</span>
            </Link>
          </div>
        </div>
      </div>
    </ProviderCard>
  );
}
