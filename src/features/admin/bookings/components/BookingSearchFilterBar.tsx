"use client";

import React, { useState } from "react";
import { Search, X, Filter, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import {
  BookingStatus,
  BookingDatePreset,
  BOOKING_STATUSES,
  BOOKING_DATE_PRESETS,
} from "@/types/admin";

interface BookingSearchFilterBarProps {
  search: string;
  status: BookingStatus | "all";
  date: BookingDatePreset;
  serviceCategory: string;
  city: string;
  providerId: string;
  customerId: string;
  availableCities: string[];
  availableCategories: string[];
  availableProviders: { id: string; name: string }[];
  availableCustomers: { id: string; name: string }[];
  onSearchChange: (val: string) => void;
  onStatusChange: (val: BookingStatus | "all") => void;
  onDateChange: (val: BookingDatePreset) => void;
  onCategoryChange: (val: string) => void;
  onCityChange: (val: string) => void;
  onProviderChange: (val: string) => void;
  onCustomerChange: (val: string) => void;
  onClearFilters: () => void;
}

const DATE_PRESET_LABELS: Record<BookingDatePreset, string> = {
  all: "All Dates",
  today: "Today",
  tomorrow: "Tomorrow",
  next_7_days: "Next 7 Days",
  past_7_days: "Past 7 Days",
  past_30_days: "Past 30 Days",
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function BookingSearchFilterBar({
  search,
  status,
  date,
  serviceCategory,
  city,
  providerId,
  customerId,
  availableCities,
  availableCategories,
  availableProviders,
  availableCustomers,
  onSearchChange,
  onStatusChange,
  onDateChange,
  onCategoryChange,
  onCityChange,
  onProviderChange,
  onCustomerChange,
  onClearFilters,
}: BookingSearchFilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasActiveFilters =
    search.trim() !== "" ||
    status !== "all" ||
    date !== "all" ||
    serviceCategory !== "all" ||
    city !== "all" ||
    providerId !== "all" ||
    customerId !== "all";

  return (
    <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4 flex flex-col gap-3">
      {/* Search and Primary Filters Row */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search booking #, customer, provider, service, city..."
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

        {/* Primary Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-outline uppercase font-semibold hidden sm:inline">
              Status:
            </span>
            <select
              value={status}
              onChange={(e) =>
                onStatusChange(e.target.value as BookingStatus | "all")
              }
              aria-label="Filter by Booking Status"
              className="bg-surface-container border border-surface-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="all">All Statuses</option>
              {BOOKING_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {STATUS_LABELS[st]}
                </option>
              ))}
            </select>
          </div>

          {/* Date Preset Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-outline uppercase font-semibold hidden sm:inline">
              Schedule:
            </span>
            <select
              value={date}
              onChange={(e) =>
                onDateChange(e.target.value as BookingDatePreset)
              }
              aria-label="Filter by Date Schedule"
              className="bg-surface-container border border-surface-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
            >
              {BOOKING_DATE_PRESETS.map((d) => (
                <option key={d} value={d}>
                  {DATE_PRESET_LABELS[d]}
                </option>
              ))}
            </select>
          </div>

          {/* City Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-outline uppercase font-semibold hidden sm:inline">
              City:
            </span>
            <select
              value={city}
              onChange={(e) => onCityChange(e.target.value)}
              aria-label="Filter by City"
              className="bg-surface-container border border-surface-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="all">All Cities</option>
              {availableCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle More Filters */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-surface-variant bg-surface-container text-xs text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <Filter className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">More Filters</span>
            {showAdvanced ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

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

      {/* Advanced Filter Row (Category, Provider, Customer) */}
      {showAdvanced && (
        <div className="pt-2 border-t border-surface-variant/30 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-150">
          {/* Category */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-outline">
              Service Category
            </label>
            <select
              value={serviceCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              aria-label="Filter by Service Category"
              className="bg-surface-container border border-surface-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="all">All Categories</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Provider */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-outline">
              Provider Hub
            </label>
            <select
              value={providerId}
              onChange={(e) => onProviderChange(e.target.value)}
              aria-label="Filter by Provider"
              className="bg-surface-container border border-surface-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="all">All Providers</option>
              {availableProviders.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Customer */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-outline">
              Customer
            </label>
            <select
              value={customerId}
              onChange={(e) => onCustomerChange(e.target.value)}
              aria-label="Filter by Customer"
              className="bg-surface-container border border-surface-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="all">All Customers</option>
              {availableCustomers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

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
              Status: {STATUS_LABELS[status]}
              <button
                onClick={() => onStatusChange("all")}
                className="hover:text-on-surface-variant"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {date !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container-high border border-surface-variant text-on-surface text-[11px]">
              Schedule: {DATE_PRESET_LABELS[date]}
              <button
                onClick={() => onDateChange("all")}
                className="hover:text-on-surface-variant"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {city !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container-high border border-surface-variant text-on-surface text-[11px]">
              City: {city}
              <button
                onClick={() => onCityChange("all")}
                className="hover:text-on-surface-variant"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {serviceCategory !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container-high border border-surface-variant text-on-surface text-[11px]">
              Category: {serviceCategory}
              <button
                onClick={() => onCategoryChange("all")}
                className="hover:text-on-surface-variant"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {providerId !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container-high border border-surface-variant text-on-surface text-[11px]">
              Provider:{" "}
              {availableProviders.find((p) => p.id === providerId)?.name ||
                providerId}
              <button
                onClick={() => onProviderChange("all")}
                className="hover:text-on-surface-variant"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {customerId !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container-high border border-surface-variant text-on-surface text-[11px]">
              Customer:{" "}
              {availableCustomers.find((c) => c.id === customerId)?.name ||
                customerId}
              <button
                onClick={() => onCustomerChange("all")}
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
