"use client";

import React from "react";
import { Search, X, Filter, RotateCcw } from "lucide-react";
import {
  CustomerBookingActivityFilter,
  CustomerStatus,
} from "@/types/admin";

interface CustomerSearchFilterBarProps {
  search: string;
  status: CustomerStatus | "all";
  city: string | "all";
  bookingActivity: CustomerBookingActivityFilter;
  cities: string[];
  onSearchChange: (val: string) => void;
  onStatusChange: (val: CustomerStatus | "all") => void;
  onCityChange: (val: string | "all") => void;
  onBookingActivityChange: (val: CustomerBookingActivityFilter) => void;
  onClearFilters: () => void;
}

export function CustomerSearchFilterBar({
  search,
  status,
  city,
  bookingActivity,
  cities,
  onSearchChange,
  onStatusChange,
  onCityChange,
  onBookingActivityChange,
  onClearFilters,
}: CustomerSearchFilterBarProps) {
  const hasActiveFilters =
    search.trim() !== "" ||
    status !== "all" ||
    city !== "all" ||
    bookingActivity !== "all";

  return (
    <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4 flex flex-col gap-3">
      {/* Top Search & Filter Dropdown Row */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search name, email, phone, or ID (e.g. CUS-0001)..."
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
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1.5 text-xs text-outline font-medium mr-1">
            <Filter className="w-3.5 h-3.5 text-primary" />
            <span>Filters:</span>
          </div>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as CustomerStatus | "all")}
            aria-label="Filter by account status"
            className="bg-surface-container border border-surface-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
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

          {/* Booking Activity Filter */}
          <select
            value={bookingActivity}
            onChange={(e) =>
              onBookingActivityChange(e.target.value as CustomerBookingActivityFilter)
            }
            aria-label="Filter by booking activity"
            className="bg-surface-container border border-surface-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="all">All Activity</option>
            <option value="none">No Bookings (0)</option>
            <option value="1-5">1–5 Bookings</option>
            <option value="6-20">6–20 Bookings</option>
            <option value="20+">20+ Bookings</option>
          </select>

          {/* Clear Filters CTA */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-outline-variant/60 text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
              title="Reset all filters and search query"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-surface-variant/30 text-xs">
          <span className="text-[11px] text-outline font-semibold uppercase">Active:</span>

          {search.trim() && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high border border-surface-variant text-on-surface text-xs">
              Search: &ldquo;{search.trim()}&rdquo;
              <button
                onClick={() => onSearchChange("")}
                className="hover:text-primary"
                aria-label="Remove search filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {status !== "all" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high border border-surface-variant text-on-surface text-xs capitalize">
              Status: {status}
              <button
                onClick={() => onStatusChange("all")}
                className="hover:text-primary"
                aria-label="Remove status filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {city !== "all" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high border border-surface-variant text-on-surface text-xs">
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

          {bookingActivity !== "all" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high border border-surface-variant text-on-surface text-xs">
              Activity: {bookingActivity === "none" ? "0 Orders" : bookingActivity}
              <button
                onClick={() => onBookingActivityChange("all")}
                className="hover:text-primary"
                aria-label="Remove activity filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={onClearFilters}
            className="text-[11px] text-primary hover:underline ml-1 font-medium"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
