"use client";

import React from "react";
import { ProviderRatingSummary } from "@/types/provider/reviews";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

interface RatingOverviewBentoProps {
  summary: ProviderRatingSummary;
}

export function RatingOverviewBento({ summary }: RatingOverviewBentoProps) {
  const stars: (5 | 4 | 3 | 2 | 1)[] = [5, 4, 3, 2, 1];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Aggregate Score Card (4 cols) */}
      <ProviderCard
        variant="container"
        className="lg:col-span-4 p-8 flex flex-col items-center justify-center text-center border-l-4 border-l-primary"
      >
        <div className="text-5xl font-extrabold text-primary mb-2 flex items-baseline">
          {summary.averageRating}{" "}
          <span className="text-xl text-on-surface-variant font-medium ml-1">/ 5</span>
        </div>

        {/* 5 Filled Stars */}
        <div className="flex items-center gap-1 text-primary mb-3">
          {[1, 2, 3, 4, 5].map((s) => (
            <span key={s} className="material-symbols-outlined text-2xl text-amber-400">
              star
            </span>
          ))}
        </div>

        <p className="text-xs font-semibold text-on-surface-variant">
          Based on {summary.totalReviews.toLocaleString()} verified customer reviews
        </p>
        <span className="mt-2 text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
          98.4% CSAT Positive Rating
        </span>
      </ProviderCard>

      {/* Distribution Bars Card (8 cols) */}
      <ProviderCard variant="container" className="lg:col-span-8 p-8 flex flex-col justify-center gap-3">
        {stars.map((star) => {
          const count = summary.distribution[star];
          const pct = Math.round((count / summary.totalReviews) * 100);

          return (
            <div key={star} className="flex items-center gap-4 text-xs">
              <span className="font-bold text-on-surface w-12">{star} Star</span>
              <div className="flex-1 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    star === 5
                      ? "bg-primary shadow-sm shadow-primary/30"
                      : star === 4
                      ? "bg-primary/70"
                      : star === 3
                      ? "bg-outline"
                      : "bg-error/60"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-on-surface-variant font-mono w-12 text-right">
                {count > 999 ? `${(count / 1000).toFixed(1)}k` : count}
              </span>
            </div>
          );
        })}
      </ProviderCard>
    </div>
  );
}
