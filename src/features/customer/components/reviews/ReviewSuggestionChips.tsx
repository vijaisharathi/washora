"use client";

import React from "react";
import { QUICK_SUGGESTION_TAGS } from "@/services/reviewService";

interface ReviewSuggestionChipsProps {
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
}

export function ReviewSuggestionChips({
  selectedTags,
  onToggleTag,
}: ReviewSuggestionChipsProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-bold text-on-surface uppercase tracking-wider">
        Quick Suggestions
      </p>

      <div className="flex flex-wrap gap-2">
        {QUICK_SUGGESTION_TAGS.map((tag) => {
          const isSelected = selectedTags.includes(tag);

          return (
            <button
              key={tag}
              type="button"
              onClick={() => onToggleTag(tag)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                isSelected
                  ? "bg-primary/15 border-primary text-primary font-bold shadow-sm shadow-primary/10"
                  : "bg-surface-container-low border-white/10 text-on-surface-variant hover:border-primary/40 hover:text-on-surface"
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}
