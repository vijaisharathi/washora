"use client";

import React from "react";
import {
  Star,
  RefreshCw,
  Download,
  Building2,
  ShieldCheck,
  Filter,
} from "lucide-react";

interface ReviewsHeaderProps {
  organizationId: string;
  totalReviews: number;
  flaggedCount: number;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function ReviewsHeader({
  organizationId,
  totalReviews,
  flaggedCount,
  onRefresh,
  isLoading,
}: ReviewsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30">
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <h1 className="text-xl font-bold text-on-surface tracking-tight">
            Reviews & Moderation
          </h1>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
            A11
          </span>
          {flaggedCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse">
              {flaggedCount} Flagged
            </span>
          )}
        </div>
        <p className="text-xs text-on-surface-variant flex items-center gap-2">
          <span>Customer feedback oversight, rating analytics, and trust & safety moderation.</span>
          <span className="inline-flex items-center gap-1 font-mono text-[11px] px-1.5 py-0.2 rounded bg-surface-container-high text-on-surface">
            <Building2 className="w-3 h-3 text-primary" />
            {organizationId}
          </span>
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/50 text-xs font-medium text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-50"
          title="Refresh review records"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-primary" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>

        <button
          onClick={() => {
            alert(`Exporting ${totalReviews} customer reviews and moderation logs for ${organizationId} (Mock CSV generated).`);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Feedback</span>
        </button>
      </div>
    </div>
  );
}
