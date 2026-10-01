import React from "react";
import { ProviderReviewItem } from "@/types/customer/provider";
import { Star } from "lucide-react";

interface ProviderReviewsPreviewProps {
  reviews: ProviderReviewItem[];
  averageRating: number;
}

export function ProviderReviewsPreview({
  reviews,
  averageRating,
}: ProviderReviewsPreviewProps) {
  return (
    <div className="bg-surface-container rounded-2xl border border-white/10 p-5 sm:p-6 space-y-4 shadow-lg">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-base text-on-surface font-headline">Recent Reviews</h3>
        <div className="flex items-center gap-1 text-yellow-400 font-bold text-xs">
          <Star className="h-3.5 w-3.5 fill-yellow-400" />
          <span>{averageRating}</span>
        </div>
      </div>

      <div className="space-y-4 divide-y divide-white/5">
        {reviews.map((rev) => (
          <div key={rev.id} className="pt-3 first:pt-0 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-[10px]">
                  {rev.avatarInitial}
                </div>
                <span className="font-semibold text-on-surface">{rev.authorName}</span>
              </div>
              <span className="text-[11px] text-on-surface-variant">{rev.date}</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2">
              &quot;{rev.comment}&quot;
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
