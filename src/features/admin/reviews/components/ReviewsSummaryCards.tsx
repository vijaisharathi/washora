"use client";

import React from "react";
import {
  Star,
  MessageSquare,
  AlertTriangle,
  EyeOff,
  ThumbsUp,
  ShieldAlert,
} from "lucide-react";
import { ReviewSummaryMetrics } from "@/types/admin/review";

interface ReviewsSummaryCardsProps {
  metrics: ReviewSummaryMetrics | null;
  isLoading?: boolean;
}

export function ReviewsSummaryCards({
  metrics,
  isLoading,
}: ReviewsSummaryCardsProps) {
  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 my-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 animate-pulse space-y-2.5"
          >
            <div className="w-6 h-6 rounded-md bg-surface-container-high" />
            <div className="w-16 h-3 rounded bg-surface-container-high" />
            <div className="w-24 h-5 rounded bg-surface-container-high" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Reviews",
      value: metrics.totalReviews.toString(),
      subtitle: `${metrics.fiveStarCount + metrics.fourStarCount} positive ratings`,
      icon: MessageSquare,
      color: "text-primary",
      bgColor: "bg-primary/10 border-primary/20",
    },
    {
      title: "Average Rating",
      value: `${metrics.averageRating.toFixed(1)} ★`,
      subtitle: "Published & restored only",
      icon: Star,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Flagged Reviews",
      value: metrics.flaggedCount.toString(),
      subtitle: "Pending moderation queue",
      icon: AlertTriangle,
      color: "text-rose-500",
      bgColor: "bg-rose-500/10 border-rose-500/20",
    },
    {
      title: "Hidden Reviews",
      value: metrics.hiddenCount.toString(),
      subtitle: "Filtered from customer app",
      icon: EyeOff,
      color: "text-slate-400",
      bgColor: "bg-slate-500/10 border-slate-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 my-6">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 hover:border-outline-variant/60 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-on-surface-variant">
                {c.title}
              </span>
              <div
                className={`w-7 h-7 rounded-lg border flex items-center justify-center ${c.bgColor}`}
              >
                <Icon className={`w-3.5 h-3.5 ${c.color}`} />
              </div>
            </div>
            <div>
              <div className="text-xl font-bold text-on-surface tracking-tight">
                {c.value}
              </div>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                {c.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
