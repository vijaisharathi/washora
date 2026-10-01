"use client";

import React from "react";
import { Search, X, RotateCcw } from "lucide-react";
import {
  ServiceStatus,
  ServiceCategory,
  PriceRangePreset,
  DurationPreset,
  SERVICE_STATUSES,
  SERVICE_CATEGORIES,
  PRICE_RANGE_PRESETS,
  DURATION_PRESETS,
} from "@/types/admin";

interface ServiceSearchFilterBarProps {
  search: string;
  status: ServiceStatus | "all";
  category: ServiceCategory | "all";
  priceRange: PriceRangePreset;
  duration: DurationPreset;
  onSearchChange: (val: string) => void;
  onStatusChange: (val: ServiceStatus | "all") => void;
  onCategoryChange: (val: ServiceCategory | "all") => void;
  onPriceRangeChange: (val: PriceRangePreset) => void;
  onDurationChange: (val: DurationPreset) => void;
  onClearFilters: () => void;
}

const PRICE_RANGE_LABELS: Record<PriceRangePreset, string> = {
  all: "All Prices",
  under_500: "Under ₹500",
  "500_999": "₹500–₹999",
  "1000_1999": "₹1,000–₹1,999",
  "2000_plus": "₹2,000+",
};

const DURATION_LABELS: Record<DurationPreset, string> = {
  all: "All Durations",
  under_1hr: "Under 1 hour",
  "1_2hr": "1–2 hours",
  "2_3hr": "2–3 hours",
  "3hr_plus": "3+ hours",
};

export function ServiceSearchFilterBar({
  search,
  status,
  category,
  priceRange,
  duration,
  onSearchChange,
  onStatusChange,
  onCategoryChange,
  onPriceRangeChange,
  onDurationChange,
  onClearFilters,
}: ServiceSearchFilterBarProps) {
  const hasActiveFilters =
    search.trim() !== "" ||
    status !== "all" ||
    category !== "all" ||
    priceRange !== "all" ||
    duration !== "all";

  return (
    <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4 flex flex-col gap-3">
      {/* Top Filter Controls */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search service name, ID, category, or description..."
            className="w-full bg-surface-container border border-surface-variant rounded-lg pl-9 pr-8 py-2 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-0.5 rounded"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-outline uppercase font-semibold hidden sm:inline">
              Status:
            </span>
            <select
              value={status}
              onChange={(e) =>
                onStatusChange(e.target.value as ServiceStatus | "all")
              }
              aria-label="Filter by Service Status"
              className="bg-surface-container border border-surface-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="all">All Statuses</option>
              {SERVICE_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-outline uppercase font-semibold hidden sm:inline">
              Category:
            </span>
            <select
              value={category}
              onChange={(e) =>
                onCategoryChange(e.target.value as ServiceCategory | "all")
              }
              aria-label="Filter by Service Category"
              className="bg-surface-container border border-surface-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="all">All Categories</option>
              {SERVICE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-outline uppercase font-semibold hidden sm:inline">
              Price:
            </span>
            <select
              value={priceRange}
              onChange={(e) =>
                onPriceRangeChange(e.target.value as PriceRangePreset)
              }
              aria-label="Filter by Price Range"
              className="bg-surface-container border border-surface-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
            >
              {PRICE_RANGE_PRESETS.map((p) => (
                <option key={p} value={p}>
                  {PRICE_RANGE_LABELS[p]}
                </option>
              ))}
            </select>
          </div>

          {/* Duration Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-outline uppercase font-semibold hidden sm:inline">
              Duration:
            </span>
            <select
              value={duration}
              onChange={(e) =>
                onDurationChange(e.target.value as DurationPreset)
              }
              aria-label="Filter by Duration"
              className="bg-surface-container border border-surface-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
            >
              {DURATION_PRESETS.map((d) => (
                <option key={d} value={d}>
                  {DURATION_LABELS[d]}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-on-surface-variant hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-surface-variant/20">
          <span className="text-[10px] text-outline uppercase font-semibold mr-1">
            Active:
          </span>

          {search.trim() && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary text-[11px]">
              Query: &quot;{search}&quot;
              <button
                onClick={() => onSearchChange("")}
                className="hover:text-on-surface"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {status !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container-high border border-surface-variant text-on-surface text-[11px]">
              Status: {status}
              <button
                onClick={() => onStatusChange("all")}
                className="hover:text-on-surface-variant"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {category !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container-high border border-surface-variant text-on-surface text-[11px]">
              Category: {category}
              <button
                onClick={() => onCategoryChange("all")}
                className="hover:text-on-surface-variant"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {priceRange !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container-high border border-surface-variant text-on-surface text-[11px]">
              Price: {PRICE_RANGE_LABELS[priceRange]}
              <button
                onClick={() => onPriceRangeChange("all")}
                className="hover:text-on-surface-variant"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {duration !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container-high border border-surface-variant text-on-surface text-[11px]">
              Duration: {DURATION_LABELS[duration]}
              <button
                onClick={() => onDurationChange("all")}
                className="hover:text-on-surface-variant"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
