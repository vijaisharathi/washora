"use client";

import React from "react";
import { Star, Award, Heart, ThumbsUp, Sparkles, CheckCircle2 } from "lucide-react";
import { DeliveryPartnerReviewsSummary } from "@/types/delivery-partner";

interface RatingHeroCardProps {
  summary: DeliveryPartnerReviewsSummary;
}

export function RatingHeroCard({ summary }: RatingHeroCardProps) {
  return (
    <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-surface-container-high via-surface-container to-surface border border-outline-variant/30 shadow-xl space-y-6">
      <div className="space-y-1 border-b border-outline-variant/20 pb-4">
        <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25 flex items-center gap-1 w-fit">
          <Award className="w-3 h-3" /> Tier-1 Premier Valet Status
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">
          Customer Ratings & Reviews
        </h1>
        <p className="text-xs text-on-surface-variant">
          Live customer feedback, verified doorstep ratings, and service recognition compliments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Score */}
        <div className="p-6 rounded-2xl bg-surface/80 border border-outline-variant/20 flex flex-col items-center justify-center text-center space-y-2">
          <span className="text-[10px] uppercase font-bold text-on-surface-variant">
            Overall Rating
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-4xl md:text-5xl font-extrabold text-on-surface font-mono">
              {summary.averageRating}
            </span>
            <span className="text-sm font-bold text-on-surface-variant">/ 5.0</span>
          </div>
          <div className="flex items-center gap-1 text-amber-400">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-4 h-4 fill-amber-400" />
            ))}
          </div>
          <p className="text-xs text-on-surface-variant font-mono">
            Based on <span className="font-bold text-on-surface">{summary.totalReviews}</span> reviews
          </p>
        </div>

        {/* 5-Star Breakdown Bars */}
        <div className="p-5 rounded-2xl bg-surface/80 border border-outline-variant/20 space-y-2 justify-center flex flex-col">
          <span className="text-[10px] uppercase font-bold text-on-surface-variant mb-1 block">
            Star Distribution
          </span>
          {summary.distribution.map((dist) => (
            <div key={dist.stars} className="flex items-center gap-2 text-xs">
              <span className="font-mono text-on-surface font-bold w-10 flex items-center gap-1">
                {dist.stars} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              </span>
              <div className="flex-1 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${dist.percentage}%` }}
                />
              </div>
              <span className="font-mono text-[10px] text-on-surface-variant w-8 text-right">
                {dist.count}
              </span>
            </div>
          ))}
        </div>

        {/* Top Praise Tags */}
        <div className="p-5 rounded-2xl bg-surface/80 border border-outline-variant/20 space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-on-surface-variant flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-primary" /> Customer Praise
            </span>
            <p className="text-xs text-on-surface-variant">Most frequent doorstep compliments</p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {summary.topCompliments.map((comp) => (
              <span
                key={comp.tag}
                className="px-2.5 py-1 rounded-xl bg-primary/10 border border-primary/20 text-[11px] font-semibold text-primary flex items-center gap-1"
              >
                <ThumbsUp className="w-2.5 h-2.5" />
                <span>{comp.tag}</span>
                <span className="font-mono text-[10px] opacity-75">({comp.count})</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
