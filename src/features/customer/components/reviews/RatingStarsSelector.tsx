"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";
import { RATING_LABELS } from "@/services/reviewService";

interface RatingStarsSelectorProps {
  rating: number;
  onRatingChange: (rating: number) => void;
}

export function RatingStarsSelector({
  rating,
  onRatingChange,
}: RatingStarsSelectorProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const activeRating = hoveredRating !== null ? hoveredRating : rating;
  const currentLabel = activeRating > 0 ? RATING_LABELS[activeRating] : "";

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {/* 5-Star Row */}
      <div className="flex items-center gap-2 sm:gap-3">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= activeRating;

          return (
            <button
              key={star}
              type="button"
              onClick={() => onRatingChange(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(null)}
              className="p-1 sm:p-2 rounded-xl hover:bg-surface-container-high transition-transform hover:scale-110 cursor-pointer focus:outline-none"
              title={RATING_LABELS[star]}
            >
              <Star
                className={`w-10 h-10 sm:w-12 sm:h-12 transition-colors ${
                  isFilled
                    ? "fill-primary text-primary"
                    : "text-surface-variant/80 hover:text-primary/60"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Dynamic Rating Label */}
      <div className="h-6">
        {currentLabel && (
          <span className="text-sm font-bold text-primary font-headline animate-in fade-in duration-150">
            {currentLabel}
          </span>
        )}
      </div>
    </div>
  );
}
