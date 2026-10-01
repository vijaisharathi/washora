"use client";

import React from "react";
import { Search, X, Star, ArrowUpDown } from "lucide-react";
import { ReviewFilterParams } from "@/types/delivery-partner";

interface ReviewFilterBarProps {
  filter: ReviewFilterParams;
  onChange: (filter: ReviewFilterParams) => void;
}

export function ReviewFilterBar({ filter, onChange }: ReviewFilterBarProps) {
  const tabs: { label: string; value: ReviewFilterParams["rating"] }[] = [
    { label: "All Reviews", value: "ALL" },
    { label: "5 Stars", value: "5" },
    { label: "4 Stars", value: "4" },
    { label: "3 Stars & Below", value: "3" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search reviews by customer name, comments, or praise keywords..."
            value={filter.searchQuery || ""}
            onChange={(e) => onChange({ ...filter, searchQuery: e.target.value })}
            className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-surface-container border border-outline-variant/30 text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary"
          />
          {filter.searchQuery && (
            <button
              onClick={() => onChange({ ...filter, searchQuery: "" })}
              className="absolute right-3 top-3 text-on-surface-variant hover:text-on-surface"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <select
          value={filter.sortBy || "NEWEST"}
          onChange={(e) =>
            onChange({ ...filter, sortBy: e.target.value as ReviewFilterParams["sortBy"] })
          }
          className="px-3 py-2.5 rounded-2xl bg-surface-container border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary"
        >
          <option value="NEWEST">Newest Reviews First</option>
          <option value="HIGHEST_RATED">Highest Rated (5★ → 1★)</option>
          <option value="LOWEST_RATED">Lowest Rated (1★ → 5★)</option>
        </select>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {tabs.map((tab) => {
          const isActive = (filter.rating || "ALL") === tab.value;
          return (
            <button
              key={tab.label}
              onClick={() => onChange({ ...filter, rating: tab.value })}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
