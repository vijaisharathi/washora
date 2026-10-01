"use client";

import React from "react";
import { Search, X, Filter, RotateCcw } from "lucide-react";
import {
  ProviderApprovalStatus,
  ProviderRatingFilter,
  ProviderStatus,
} from "@/types/admin";

interface ProviderSearchFilterBarProps {
  search: string;
  status: ProviderStatus | "all";
  approvalStatus: ProviderApprovalStatus | "all";
  serviceCategory: string | "all";
  city: string | "all";
  rating: ProviderRatingFilter;
  cities: string[];
  categories: string[];
  onSearchChange: (val: string) => void;
  onStatusChange: (val: ProviderStatus | "all") => void;
  onApprovalStatusChange: (val: ProviderApprovalStatus | "all") => void;
  onServiceCategoryChange: (val: string | "all") => void;
  onCityChange: (val: string | "all") => void;
  onRatingChange: (val: ProviderRatingFilter) => void;
  onClearFilters: () => void;
}

export function ProviderSearchFilterBar({
  search,
  status,
  approvalStatus,
  serviceCategory,
  city,
  rating,
  cities,
  categories,
  onSearchChange,
  onStatusChange,
  onApprovalStatusChange,
  onServiceCategoryChange,
  onCityChange,
  onRatingChange,
  onClearFilters,
}: ProviderSearchFilterBarProps) {
  const hasActiveFilters =
    search.trim() !== "" ||
    status !== "all" ||
    approvalStatus !== "all" ||
    serviceCategory !== "all" ||
    city !== "all" ||
    rating !== "all";

  return (
    <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4 flex flex-col gap-3">
      {/* Top Search & Filter Dropdown Row */}
      <div className="flex flex-col xl:flex-row gap-3 items-stretch xl:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search provider, business, email, phone, or ID (e.g. PRO-0001)..."
            className="w-full bg-surface-container border border-surface-variant rounded-lg pl-9 pr-8 py-2 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-outline font-medium mr-1">
            <Filter className="w-3.5 h-3.5 text-primary" />
            <span>Filters:</span>
          </div>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as ProviderStatus | "all")}
            aria-label="Filter by operational status"
            className="bg-surface-container border border-surface-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>

          {/* Approval Status Filter */}
          <select
            value={approvalStatus}
            onChange={(e) =>
              onApprovalStatusChange(e.target.value as ProviderApprovalStatus | "all")
            }
            aria-label="Filter by verification approval"
            className="bg-surface-container border border-surface-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="all">All Approvals</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Category Filter */}
          <select
            value={serviceCategory}
            onChange={(e) => onServiceCategoryChange(e.target.value)}
            aria-label="Filter by service category"
            className="bg-surface-container border border-surface-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* City Filter */}
          <select
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            aria-label="Filter by city"
            className="bg-surface-container border border-surface-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="all">All Cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Rating Filter */}
          <select
            value={rating}
            onChange={(e) =>
              onRatingChange(e.target.value as ProviderRatingFilter)
            }
            aria-label="Filter by provider rating"
            className="bg-surface-container border border-surface-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="all">All Ratings</option>
            <option value="4.5+">★ 4.5 & up</option>
            <option value="4.0+">★ 4.0 & up</option>
            <option value="3.0+">★ 3.0 & up</option>
            <option value="unrated">Unrated (0 orders)</option>
          </select>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container-high border border-outline-variant/60 text-xs text-on-surface-variant hover:text-on-surface hover:border-primary transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Badges Row */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-surface-variant/30 text-xs">
          <span className="text-outline text-[11px] font-medium">Active Filters:</span>

          {search && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25 font-mono text-[11px]">
              Search: &quot;{search}&quot;
              <button
                onClick={() => onSearchChange("")}
                className="hover:text-primary-inverse"
                aria-label="Remove search filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {status !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface border border-outline-variant text-[11px]">
              Status: {status.toUpperCase()}
              <button
                onClick={() => onStatusChange("all")}
                className="hover:text-primary"
                aria-label="Remove status filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {approvalStatus !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface border border-outline-variant text-[11px]">
              Approval: {approvalStatus.toUpperCase()}
              <button
                onClick={() => onApprovalStatusChange("all")}
                className="hover:text-primary"
                aria-label="Remove approval filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {serviceCategory !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface border border-outline-variant text-[11px]">
              Category: {serviceCategory}
              <button
                onClick={() => onServiceCategoryChange("all")}
                className="hover:text-primary"
                aria-label="Remove category filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {city !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface border border-outline-variant text-[11px]">
              City: {city}
              <button
                onClick={() => onCityChange("all")}
                className="hover:text-primary"
                aria-label="Remove city filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {rating !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface border border-outline-variant text-[11px]">
              Rating: {rating}
              <button
                onClick={() => onRatingChange("all")}
                className="hover:text-primary"
                aria-label="Remove rating filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={onClearFilters}
            className="text-[11px] text-primary hover:underline ml-1"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
