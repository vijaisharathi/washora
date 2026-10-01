"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  User,
  Store,
  Layers,
  Calendar,
  IndianRupee,
  ExternalLink,
  Flag,
  EyeOff,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Building2,
  Clock,
  ShieldAlert,
  MessageSquare,
} from "lucide-react";
import { useAdminReviewDetails } from "@/features/admin/hooks/useAdminReviews";
import { Review, ReviewStatus, ModerationReason } from "@/types/admin/review";
import { ModerationTimelineWidget } from "./ModerationTimelineWidget";
import { InternalNotesWidget } from "./InternalNotesWidget";
import { FlagReviewModal } from "../modals/FlagReviewModal";
import { HideReviewModal } from "../modals/HideReviewModal";
import { RestoreReviewModal } from "../modals/RestoreReviewModal";
import { PublishReviewModal } from "../modals/PublishReviewModal";

interface ReviewDetailsMasterViewProps {
  reviewId: string;
}

export function ReviewDetailsMasterView({ reviewId }: ReviewDetailsMasterViewProps) {
  const {
    loading,
    error,
    data,
    flagReview,
    hideReview,
    restoreReview,
    publishReview,
    addModerationNote,
  } = useAdminReviewDetails(reviewId);

  // Modal states
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
  const [isHideModalOpen, setIsHideModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="w-32 h-6 bg-surface-container-high rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-surface-container-high rounded-xl" />
            <div className="h-48 bg-surface-container-high rounded-xl" />
          </div>
          <div className="space-y-6">
            <div className="h-40 bg-surface-container-high rounded-xl" />
            <div className="h-40 bg-surface-container-high rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-12 text-center bg-surface-container-lowest border border-outline-variant/30 rounded-xl my-6">
        <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-on-surface mb-1">
          Review Not Found
        </h2>
        <p className="text-xs text-on-surface-variant max-w-sm mx-auto mb-6">
          {error || `Review with ID ${reviewId} was not found in this organization.`}
        </p>
        <Link
          href="/admin/reviews"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Reviews</span>
        </Link>
      </div>
    );
  }

  const {
    review,
    customer,
    provider,
    booking,
    service,
    activities,
    notes,
    customerRecentReviews,
  } = data;

  const renderStatusBadge = (status: ReviewStatus) => {
    switch (status) {
      case "Published":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle className="w-3.5 h-3.5" />
            Published
          </span>
        );
      case "Flagged":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <AlertTriangle className="w-3.5 h-3.5" />
            Flagged for Review
          </span>
        );
      case "Hidden":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <EyeOff className="w-3.5 h-3.5" />
            Hidden from App
          </span>
        );
      case "Restored":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <RotateCcw className="w-3.5 h-3.5" />
            Restored
          </span>
        );
      default:
        return null;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`w-4 h-4 ${
              s <= rating
                ? "text-amber-500 fill-amber-500"
                : "text-surface-container-high"
            }`}
          />
        ))}
        <span className="ml-1.5 text-sm font-bold text-on-surface font-mono">
          {rating}.0 / 5.0
        </span>
      </div>
    );
  };

  const formattedCreated = new Date(review.createdAt).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/reviews"
            className="p-2 rounded-lg border border-outline-variant/50 hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
            title="Back to all reviews"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold text-on-surface tracking-tight font-mono">
                {review.id}
              </h1>
              {renderStatusBadge(review.status)}
            </div>
            <p className="text-xs text-on-surface-variant flex items-center gap-2 mt-0.5">
              <span>Submitted on {formattedCreated}</span>
              <span>•</span>
              <span className="font-mono">Org: {review.organizationId}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {(review.status === "Published" || review.status === "Restored") && (
            <button
              onClick={() => setIsFlagModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-xs font-semibold transition-colors"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Flag Review</span>
            </button>
          )}

          {review.status === "Flagged" && (
            <button
              onClick={() => setIsPublishModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Approve & Publish</span>
            </button>
          )}

          {(review.status === "Published" ||
            review.status === "Flagged" ||
            review.status === "Restored") && (
            <button
              onClick={() => setIsHideModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/50 hover:bg-surface-container text-xs font-medium text-slate-300 transition-colors"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Hide from App</span>
            </button>
          )}

          {review.status === "Hidden" && (
            <button
              onClick={() => setIsRestoreModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Review</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Review Details & Moderation History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Review Content Card */}
          <div className="p-5 sm:p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface">
                Customer Feedback Content
              </span>
              {renderStars(review.rating)}
            </div>

            {review.title && (
              <h2 className="text-base font-bold text-on-surface">
                &ldquo;{review.title}&rdquo;
              </h2>
            )}

            <div className="p-4 rounded-xl bg-surface-container/60 border border-outline-variant/20 text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
              {review.comment}
            </div>

            {/* Flag / Moderation Reason Banner */}
            {review.moderationReason && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-rose-500 mb-1">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Moderation Flag: {review.moderationReason}</span>
                </div>
                {review.moderationNote && (
                  <p className="text-on-surface-variant italic">
                    &ldquo;{review.moderationNote}&rdquo;
                  </p>
                )}
                {review.moderatedBy && (
                  <p className="text-[10px] text-on-surface-variant font-mono mt-1">
                    Moderated by {review.moderatedBy}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Chronological Moderation Timeline */}
          <ModerationTimelineWidget activities={activities} />

          {/* Internal Team Notes */}
          <InternalNotesWidget
            notes={notes}
            onAddNote={(note) => addModerationNote(note)}
          />
        </div>

        {/* Right Column: Linked Entities */}
        <div className="space-y-6">
          {/* Customer Card */}
          <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface">
                  Customer
                </h3>
              </div>
              <Link
                href={`/admin/customers/${customer.id}`}
                className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>View</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="text-xs space-y-1.5">
              <div className="font-bold text-on-surface text-sm">
                {customer.fullName}
              </div>
              <div className="text-on-surface-variant font-mono text-[11px]">
                {customer.email}
              </div>
              <div className="text-on-surface-variant font-mono text-[11px]">
                {customer.phone}
              </div>
              <div className="text-[11px] text-on-surface-variant pt-1">
                Total Feedback: <span className="font-semibold text-on-surface">{customer.totalReviewsCount} reviews</span>
              </div>
            </div>

            {customerRecentReviews.length > 0 && (
              <div className="pt-2 border-t border-outline-variant/20">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">
                  Other Reviews by Customer
                </span>
                <div className="space-y-1.5">
                  {customerRecentReviews.map((cr: Review) => (
                    <Link
                      key={cr.id}
                      href={`/admin/reviews/${cr.id}`}
                      className="block p-2 rounded bg-surface-container/60 hover:bg-surface-container border border-outline-variant/20 text-[11px] text-on-surface transition-colors"
                    >
                      <div className="flex items-center justify-between font-mono text-[10px] text-on-surface-variant mb-0.5">
                        <span>{cr.id}</span>
                        <span className="text-amber-500 font-bold">{cr.rating} ★</span>
                      </div>
                      <p className="truncate text-on-surface-variant">{cr.comment}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Provider Card */}
          <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface">
                  Provider
                </h3>
              </div>
              <Link
                href={`/admin/providers/${provider.id}`}
                className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>View</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="text-xs space-y-1">
              <div className="font-bold text-on-surface text-sm">
                {provider.businessName || provider.fullName}
              </div>
              <div className="text-on-surface-variant text-[11px]">
                Partner: {provider.fullName}
              </div>
              <div className="text-[11px] text-amber-500 font-semibold flex items-center gap-1 pt-1">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                <span>Overall Rating: {provider.rating.toFixed(1)} ★</span>
              </div>
            </div>
          </div>

          {/* Service & Booking Cards */}
          <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface">
                  Service & Booking
                </h3>
              </div>
              <Link
                href={`/admin/bookings/${booking.id}`}
                className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>Booking</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="text-xs space-y-2">
              <div>
                <span className="text-[10px] text-on-surface-variant uppercase font-bold">Service</span>
                <p className="font-semibold text-on-surface">{service.name}</p>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-container-high text-on-surface-variant font-mono">
                  {service.category}
                </span>
              </div>

              <div className="pt-2 border-t border-outline-variant/20">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold">Booking Details</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono text-on-surface">{booking.bookingNumber}</span>
                  <span className="font-bold text-primary font-mono">₹{booking.totalAmount}</span>
                </div>
                <div className="text-[10px] text-on-surface-variant mt-0.5">
                  Status: <span className="font-semibold text-emerald-500">{booking.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <FlagReviewModal
        isOpen={isFlagModalOpen}
        onClose={() => setIsFlagModalOpen(false)}
        review={review}
        onSubmit={(reason, note) => flagReview(reason, note)}
      />

      <HideReviewModal
        isOpen={isHideModalOpen}
        onClose={() => setIsHideModalOpen(false)}
        review={review}
        onSubmit={(reason, note) => hideReview(reason, note)}
      />

      <RestoreReviewModal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        review={review}
        onSubmit={(note) => restoreReview(note)}
      />

      <PublishReviewModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        review={review}
        onSubmit={() => publishReview()}
      />
    </div>
  );
}
