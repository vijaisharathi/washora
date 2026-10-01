"use client";

import React from "react";
import {
  Search,
  Filter,
  RotateCcw,
  Star,
  ShieldCheck,
  Calendar,
  Layers,
} from "lucide-react";
import { ReviewStatus } from "@/types/admin/review";

interface ReviewsSearchFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  rating: number | "all";
  onRatingChange: (val: number | "all") => void;
  status: ReviewStatus | "all";
  onStatusChange: (val: ReviewStatus | "all") => void;
  serviceCategory: string | "all";
  onServiceCategoryChange: (val: string | "all") => void;
  datePreset: "all" | "today" | "yesterday" | "last_7_days" | "last_30_days";
  onDatePresetChange: (
    val: "all" | "today" | "yesterday" | "last_7_days" | "last_30_days"
  ) => void;
  onReset: () => void;
  isFiltered: boolean;
}

export function ReviewsSearchFilterBar({
  search,
  onSearchChange,
  rating,
  onRatingChange,
  status,
  onStatusChange,
  serviceCategory,
  onServiceCategoryChange,
  datePreset,
  onDatePresetChange,
  onReset,
  isFiltered,
}: ReviewsSearchFilterBarProps) {
  return (
    <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 mb-6 space-y-3">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search by review ID, customer, provider, service, booking, keywords..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-container text-xs rounded-lg border border-outline-variant/40 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Action / Reset Button */}
        {isFiltered && (
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-xs font-medium text-on-surface transition-colors shrink-0"
            title="Reset all filters"
          >
            <RotateCcw className="w-3.5 h-3.5 text-on-surface-variant" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Filter Dropdowns Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        {/* Rating Filter */}
        <div className="relative">
          <select
            value={rating.toString()}
            onChange={(e) =>
              onRatingChange(
                e.target.value === "all" ? "all" : Number(e.target.value)
              )
            }
            className="w-full px-2.5 py-1.5 bg-surface-container text-xs rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
          >
            <option value="all">★ All Ratings</option>
            <option value="5">5 Stars (Excellent)</option>
            <option value="4">4 Stars (Good)</option>
            <option value="3">3 Stars (Average)</option>
            <option value="2">2 Stars (Poor)</option>
            <option value="1">1 Star (Terrible)</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={status}
            onChange={(e) =>
              onStatusChange(e.target.value as ReviewStatus | "all")
            }
            className="w-full px-2.5 py-1.5 bg-surface-container text-xs rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
          >
            <option value="all">● All Statuses</option>
            <option value="Published">Published</option>
            <option value="Flagged">Flagged</option>
            <option value="Hidden">Hidden</option>
            <option value="Restored">Restored</option>
          </select>
        </div>

        {/* Service Category Filter */}
        <div className="relative">
          <select
            value={serviceCategory}
            onChange={(e) => onServiceCategoryChange(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-surface-container text-xs rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
          >
            <option value="all">📁 All Categories</option>
            <option value="Dry Cleaning">Dry Cleaning</option>
            <option value="Steam Pressing">Steam Pressing</option>
            <option value="Wash & Fold">Wash & Fold</option>
            <option value="Premium Fabric Care">Premium Fabric Care</option>
          </select>
        </div>

        {/* Date Preset Filter */}
        <div className="relative">
          <select
            value={datePreset}
            onChange={(e) =>
              onDatePresetChange(
                e.target.value as
                  | "all"
                  | "today"
                  | "yesterday"
                  | "last_7_days"
                  | "last_30_days"
              )
            }
            className="w-full px-2.5 py-1.5 bg-surface-container text-xs rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
          >
            <option value="all">📅 All Time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last_7_days">Last 7 Days</option>
            <option value="last_30_days">Last 30 Days</option>
          </select>
        </div>
      </div>
    </div>
  );
}
