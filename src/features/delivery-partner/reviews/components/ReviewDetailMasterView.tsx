"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  ThumbsUp,
  MapPin,
  Calendar,
  AlertCircle,
  PackageCheck,
  ChevronRight,
  MessageSquareQuote,
  ShieldCheck,
} from "lucide-react";
import { useDeliveryPartnerReviewDetail } from "../hooks/useDeliveryPartnerReviews";

interface ReviewDetailMasterViewProps {
  reviewId: string;
}

export function ReviewDetailMasterView({ reviewId }: ReviewDetailMasterViewProps) {
  const { review, isLoading, isError, error } = useDeliveryPartnerReviewDetail(reviewId);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="h-10 w-32 bg-surface-container rounded-xl animate-pulse" />
        <div className="h-64 rounded-3xl bg-surface-container animate-pulse" />
      </div>
    );
  }

  if (isError || !review) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-4 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-error/15 text-error flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-on-surface">Review Record Not Found</h2>
          <p className="text-xs text-on-surface-variant">
            {error instanceof Error ? error.message : "The requested customer review does not exist."}
          </p>
        </div>
        <Link
          href="/delivery-partner/reviews"
          className="px-5 py-2 rounded-xl bg-surface-container-highest text-xs font-semibold text-on-surface hover:text-primary transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Reviews</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header & Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/delivery-partner/reviews"
          className="text-xs font-semibold text-on-surface-variant hover:text-on-surface flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customer Reviews</span>
        </Link>

        <div className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/25 text-xs font-bold">
          <Star className="w-3.5 h-3.5 fill-amber-400" />
          <span>{review.rating}.0 Verified Rating</span>
        </div>
      </div>

      {/* Main Review Bento */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-surface-container-high via-surface-container to-surface border border-outline-variant/30 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/20 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary font-bold flex items-center justify-center text-lg border border-primary/30 shadow-sm">
              {review.customerName.charAt(0)}
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-on-surface flex items-center gap-1.5">
                {review.customerName}
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              </h1>
              <p className="text-xs text-on-surface-variant font-mono">
                Order #{review.orderId} • {new Date(review.date).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-on-surface-variant/30"}`}
              />
            ))}
          </div>
        </div>

        {/* Customer Feedback Quote */}
        <div className="p-5 rounded-2xl bg-surface/80 border border-outline-variant/20 space-y-2">
          <div className="flex items-center gap-1.5 text-primary text-xs font-bold">
            <MessageSquareQuote className="w-4 h-4" />
            <span>Customer Feedback</span>
          </div>
          <p className="text-sm text-on-surface leading-relaxed italic">
            &ldquo;{review.comment}&rdquo;
          </p>
        </div>

        {/* Compliment Badges */}
        {review.compliments.length > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-on-surface-variant block">
              Recognized Doorstep Compliments
            </span>
            <div className="flex flex-wrap gap-2">
              {review.compliments.map((comp) => (
                <span
                  key={comp}
                  className="px-3 py-1 rounded-xl bg-primary/15 border border-primary/25 text-xs font-semibold text-primary flex items-center gap-1.5"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{comp}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Delivery Location Context */}
        <div className="p-4 rounded-2xl bg-surface border border-outline-variant/15 text-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-on-surface-variant flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Delivery Address
          </span>
          <p className="font-semibold text-on-surface">{review.deliveryAddress}</p>
        </div>

        {/* Link to Historical Delivery Record */}
        <div className="pt-2 border-t border-outline-variant/15 flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="text-on-surface-variant">Verified customer delivery review</span>
          <Link
            href={`/delivery-partner/history/${review.taskId}`}
            className="px-4 py-2 rounded-xl bg-surface border border-outline-variant/30 font-semibold text-on-surface hover:text-primary transition-colors flex items-center gap-1.5"
          >
            <span>View Historical Delivery #{review.orderId}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
