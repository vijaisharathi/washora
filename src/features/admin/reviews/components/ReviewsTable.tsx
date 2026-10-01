"use client";

import React from "react";
import Link from "next/link";
import {
  Star,
  Eye,
  Flag,
  EyeOff,
  RotateCcw,
  CheckCircle,
  MoreVertical,
  AlertTriangle,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { Review, ReviewStatus } from "@/types/admin/review";

interface ReviewsTableProps {
  reviews: Review[];
  isLoading?: boolean;
  onFlagClick: (review: Review) => void;
  onHideClick: (review: Review) => void;
  onRestoreClick: (review: Review) => void;
  onPublishClick: (review: Review) => void;
  onResetFilters?: () => void;
}

export function ReviewsTable({
  reviews,
  isLoading,
  onFlagClick,
  onHideClick,
  onRestoreClick,
  onPublishClick,
  onResetFilters,
}: ReviewsTableProps) {
  if (isLoading) {
    return (
      <div className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden p-6 space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 animate-pulse">
            <div className="w-20 h-4 bg-surface-container-high rounded" />
            <div className="w-32 h-4 bg-surface-container-high rounded" />
            <div className="w-36 h-4 bg-surface-container-high rounded" />
            <div className="flex-1 h-4 bg-surface-container-high rounded" />
            <div className="w-20 h-4 bg-surface-container-high rounded" />
            <div className="w-16 h-4 bg-surface-container-high rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-12 text-center">
        <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center mx-auto mb-3 text-on-surface-variant">
          <MessageSquare className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-on-surface mb-1">
          No Reviews Found
        </h3>
        <p className="text-xs text-on-surface-variant max-w-sm mx-auto mb-4">
          No review records matched your search query and filters in this organization.
        </p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>
    );
  }

  const renderStatusBadge = (status: ReviewStatus) => {
    switch (status) {
      case "Published":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle className="w-3 h-3" />
            Published
          </span>
        );
      case "Flagged":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <AlertTriangle className="w-3 h-3" />
            Flagged
          </span>
        );
      case "Hidden":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <EyeOff className="w-3 h-3" />
            Hidden
          </span>
        );
      case "Restored":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
            <RotateCcw className="w-3 h-3" />
            Restored
          </span>
        );
      default:
        return null;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`w-3 h-3 ${
              s <= rating
                ? "text-amber-500 fill-amber-500"
                : "text-surface-container-high"
            }`}
          />
        ))}
        <span className="ml-1 text-[11px] font-bold text-on-surface font-mono">
          {rating}.0
        </span>
      </div>
    );
  };

  return (
    <div className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/30 bg-surface-container/50 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
              <th className="py-3 px-4">Review ID & Date</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Provider / Service</th>
              <th className="py-3 px-4">Rating & Content</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20 text-xs text-on-surface">
            {reviews.map((r) => {
              const formattedDate = new Date(r.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <tr
                  key={r.id}
                  className="hover:bg-surface-container-high/40 transition-colors"
                >
                  {/* Review ID & Date */}
                  <td className="py-3.5 px-4">
                    <Link
                      href={`/admin/reviews/${r.id}`}
                      className="font-mono text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <span>{r.id}</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </Link>
                    <div className="text-[10px] text-on-surface-variant font-mono mt-0.5">
                      {formattedDate}
                    </div>
                    <div className="text-[10px] text-on-surface-variant/80 font-mono">
                      BK: {r.bookingId}
                    </div>
                  </td>

                  {/* Customer */}
                  <td className="py-3.5 px-4">
                    <Link
                      href={`/admin/customers/${r.customerId}`}
                      className="font-semibold text-xs text-on-surface hover:text-primary transition-colors block"
                    >
                      {r.customerId}
                    </Link>
                    <span className="text-[10px] text-on-surface-variant font-mono">
                      Verified User
                    </span>
                  </td>

                  {/* Provider & Service */}
                  <td className="py-3.5 px-4">
                    <Link
                      href={`/admin/providers/${r.providerId}`}
                      className="font-medium text-xs text-on-surface hover:text-primary transition-colors block"
                    >
                      {r.providerId}
                    </Link>
                    <Link
                      href={`/admin/services/${r.serviceId}`}
                      className="text-[10px] text-on-surface-variant hover:text-primary transition-colors block"
                    >
                      {r.serviceId}
                    </Link>
                  </td>

                  {/* Rating & Content */}
                  <td className="py-3.5 px-4 max-w-xs sm:max-w-sm">
                    {renderStars(r.rating)}
                    {r.title && (
                      <p className="font-semibold text-xs text-on-surface mt-1 truncate">
                        {r.title}
                      </p>
                    )}
                    <p className="text-[11px] text-on-surface-variant line-clamp-2 mt-0.5 italic">
                      &ldquo;{r.comment}&rdquo;
                    </p>
                    {r.moderationReason && (
                      <div className="text-[10px] text-rose-500 font-medium mt-1">
                        Reason: {r.moderationReason}
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {renderStatusBadge(r.status)}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/reviews/${r.id}`}
                        className="p-1.5 rounded-lg border border-outline-variant/40 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
                        title="View Full Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>

                      {/* Flag button */}
                      {(r.status === "Published" || r.status === "Restored") && (
                        <button
                          onClick={() => onFlagClick(r)}
                          className="p-1.5 rounded-lg border border-outline-variant/40 hover:bg-rose-500/10 hover:border-rose-500/30 text-rose-500 transition-colors"
                          title="Flag Review"
                        >
                          <Flag className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Publish / Approve Flagged button */}
                      {r.status === "Flagged" && (
                        <button
                          onClick={() => onPublishClick(r)}
                          className="p-1.5 rounded-lg border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          title="Approve & Publish"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Hide button */}
                      {(r.status === "Published" || r.status === "Flagged" || r.status === "Restored") && (
                        <button
                          onClick={() => onHideClick(r)}
                          className="p-1.5 rounded-lg border border-outline-variant/40 hover:bg-slate-500/10 text-slate-400 hover:text-slate-200 transition-colors"
                          title="Hide from App"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Restore button */}
                      {r.status === "Hidden" && (
                        <button
                          onClick={() => onRestoreClick(r)}
                          className="p-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
                          title="Restore Review"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
