"use client";

import React from "react";
import { Star } from "lucide-react";
import { ReviewSummaryMetrics } from "@/types/admin/review";

interface RatingDistributionWidgetProps {
  metrics: ReviewSummaryMetrics | null;
  selectedRating: number | "all";
  onSelectRating: (rating: number | "all") => void;
  isLoading?: boolean;
}

export function RatingDistributionWidget({
  metrics,
  selectedRating,
  onSelectRating,
  isLoading,
}: RatingDistributionWidgetProps) {
  if (isLoading || !metrics) {
    return (
      <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 animate-pulse mb-6">
        <div className="w-36 h-4 bg-surface-container-high rounded mb-4" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-3 bg-surface-container-high rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-outline-variant/20">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface">
            Rating Breakdown & Distribution
          </h3>
          <p className="text-[11px] text-on-surface-variant">
            Click any rating tier below to filter table reviews instantly.
          </p>
        </div>

        {selectedRating !== "all" && (
          <button
            onClick={() => onSelectRating("all")}
            className="text-[11px] font-semibold text-primary hover:underline self-start sm:self-auto"
          >
            Clear rating filter ({selectedRating} ★)
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {metrics.distribution.map((d) => {
          const isSelected = selectedRating === d.rating;
          return (
            <button
              key={d.rating}
              onClick={() => onSelectRating(isSelected ? "all" : d.rating)}
              className={`w-full flex items-center gap-3 p-1.5 rounded-lg text-left transition-all ${
                isSelected
                  ? "bg-primary/10 border border-primary/30"
                  : "hover:bg-surface-container-high/60"
              }`}
            >
              {/* Star Label */}
              <div className="flex items-center gap-1 w-14 shrink-0 text-xs font-semibold text-on-surface">
                <span>{d.rating}</span>
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              </div>

              {/* Progress Bar */}
              <div className="flex-1 h-2 rounded-full bg-surface-container-high overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    d.rating >= 4
                      ? "bg-amber-500"
                      : d.rating === 3
                      ? "bg-amber-400"
                      : "bg-rose-400"
                  }`}
                  style={{ width: `${d.percentage}%` }}
                />
              </div>

              {/* Percentage & Count */}
              <div className="w-20 text-right shrink-0">
                <span className="text-xs font-medium text-on-surface mr-1">
                  {d.percentage}%
                </span>
                <span className="text-[10px] text-on-surface-variant font-mono">
                  ({d.count})
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
