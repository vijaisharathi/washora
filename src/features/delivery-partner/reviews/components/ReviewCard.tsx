"use client";

import React from "react";
import Link from "next/link";
import { Star, ThumbsUp, MapPin, ChevronRight, MessageSquareQuote } from "lucide-react";
import { DeliveryPartnerReview } from "@/types/delivery-partner";

interface ReviewCardProps {
  review: DeliveryPartnerReview;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="p-5 rounded-3xl bg-surface-container/80 border border-outline-variant/25 shadow-sm hover:border-primary/40 transition-all space-y-3.5">
      <div className="flex items-start justify-between gap-3 border-b border-outline-variant/15 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-sm border border-primary/30">
            {review.customerName.charAt(0)}
          </div>
          <div>
            <h2 className="text-xs font-bold text-on-surface">{review.customerName}</h2>
            <p className="text-[10px] text-on-surface-variant font-mono">
              Order #{review.orderId} • {new Date(review.date).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Stars */}
        <div className="flex items-center gap-0.5 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-on-surface-variant/30"}`}
            />
          ))}
          <span className="font-mono font-bold text-xs ml-1 text-on-surface">
            {review.rating}.0
          </span>
        </div>
      </div>

      {/* Review Text */}
      <p className="text-xs text-on-surface leading-relaxed italic">
        &ldquo;{review.comment}&rdquo;
      </p>

      {/* Compliment Tags */}
      {review.compliments.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {review.compliments.map((comp) => (
            <span
              key={comp}
              className="px-2 py-0.5 rounded-lg bg-surface border border-outline-variant/20 text-[10px] font-medium text-primary flex items-center gap-1"
            >
              <ThumbsUp className="w-2.5 h-2.5" />
              <span>{comp}</span>
            </span>
          ))}
        </div>
      )}

      {/* Bottom Bar with Links */}
      <div className="flex items-center justify-between pt-2 border-t border-outline-variant/15 text-xs">
        <div className="flex items-center gap-1.5 text-on-surface-variant truncate max-w-xs">
          <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="truncate text-[11px]">{review.deliveryAddress}</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/delivery-partner/history/${review.taskId}`}
            className="text-[11px] text-on-surface-variant hover:text-on-surface font-semibold"
          >
            History Trip
          </Link>
          <Link
            href={`/delivery-partner/reviews/${review.id}`}
            className="px-3 py-1 rounded-xl bg-surface-container-highest hover:bg-primary hover:text-primary-foreground text-xs font-semibold text-on-surface transition-colors flex items-center gap-1"
          >
            <span>Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
