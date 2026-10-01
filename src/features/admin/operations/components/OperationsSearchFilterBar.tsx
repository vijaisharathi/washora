"use client";

import React from "react";
import {
  Search,
  X,
  Filter,
  Calendar,
  Layers,
  MapPin,
  UserCheck,
  Bike,
  Activity,
} from "lucide-react";
import { AssignmentStatus } from "@/types/admin/operations";
import { BookingStatus } from "@/types/admin/booking";

interface OperationsSearchFilterBarProps {
  search: string;
  assignmentStatus: AssignmentStatus | "all" | "Delivery Pending";
  bookingStatus: BookingStatus | "all";
  category: string;
  city: string;
  providerId: string;
  deliveryPartnerId: string;
  date: "all" | "today" | "tomorrow" | "next_7_days" | "past_7_days" | "past_30_days";
  availableCategories: string[];
  availableCities: string[];
  availableProviders: { id: string; name: string }[];
  availableDeliveryPartners: { id: string; name: string }[];
  onSearchChange: (value: string) => void;
  onAssignmentStatusChange: (
    status: AssignmentStatus | "all" | "Delivery Pending"
  ) => void;
  onBookingStatusChange: (status: BookingStatus | "all") => void;
  onCategoryChange: (category: string) => void;
  onCityChange: (city: string) => void;
  onProviderChange: (providerId: string) => void;
  onDeliveryPartnerChange: (partnerId: string) => void;
  onDateChange: (
    date: "all" | "today" | "tomorrow" | "next_7_days" | "past_7_days" | "past_30_days"
  ) => void;
  onClearFilters: () => void;
}

export function OperationsSearchFilterBar({
  search,
  assignmentStatus,
  bookingStatus,
  category,
  city,
  providerId,
  deliveryPartnerId,
  date,
  availableCategories,
  availableCities,
  availableProviders,
  availableDeliveryPartners,
  onSearchChange,
  onAssignmentStatusChange,
  onBookingStatusChange,
  onCategoryChange,
  onCityChange,
  onProviderChange,
  onDeliveryPartnerChange,
  onDateChange,
  onClearFilters,
}: OperationsSearchFilterBarProps) {
  // Compute active filters count
  let activeFiltersCount = 0;
  if (search.trim()) activeFiltersCount++;
  if (assignmentStatus !== "all") activeFiltersCount++;
  if (bookingStatus !== "all") activeFiltersCount++;
  if (category !== "all") activeFiltersCount++;
  if (city !== "all") activeFiltersCount++;
  if (providerId !== "all") activeFiltersCount++;
  if (deliveryPartnerId !== "all") activeFiltersCount++;
  if (date !== "all") activeFiltersCount++;

  return (
    <div className="bg-surface-container-low border border-surface-variant/50 rounded-2xl p-4 space-y-3 shadow-sm">
      {/* Top row: Search input & Active Filters Clear */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search booking #, customer, provider, delivery valet, service, or city..."
            className="w-full bg-surface-container border border-surface-variant rounded-xl pl-9 pr-8 py-2 text-xs text-on-surface placeholder:text-outline/60 focus:outline-none focus:border-primary transition-colors"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-0.5 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {activeFiltersCount > 0 && (
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold">
              {activeFiltersCount} active filter{activeFiltersCount > 1 ? "s" : ""}
            </span>
          )}

          {activeFiltersCount > 0 && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-surface-variant bg-surface-container text-xs font-medium text-on-surface hover:bg-surface-container-high transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Selectors Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-2 border-t border-surface-variant/30 text-xs">
        {/* Assignment State */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-semibold text-outline tracking-wider block">
            Assignment State
          </label>
          <select
            value={assignmentStatus}
            onChange={(e) =>
              onAssignmentStatusChange(
                e.target.value as AssignmentStatus | "all" | "Delivery Pending"
              )
            }
            className="w-full bg-surface-container border border-surface-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="all">All States</option>
            <option value="Needs Assignment">Needs Assignment</option>
            <option value="Provider Assigned">Provider Assigned</option>
            <option value="Delivery Pending">Delivery Pending</option>
            <option value="Ready for Service">Ready for Service</option>
            <option value="In Service">In Service</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Booking Status */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-semibold text-outline tracking-wider block">
            Booking Status
          </label>
          <select
            value={bookingStatus}
            onChange={(e) =>
              onBookingStatusChange(e.target.value as BookingStatus | "all")
            }
            className="w-full bg-surface-container border border-surface-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Service Category */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-semibold text-outline tracking-wider block">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full bg-surface-container border border-surface-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="all">All Categories</option>
            {availableCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* City */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-semibold text-outline tracking-wider block">
            City
          </label>
          <select
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            className="w-full bg-surface-container border border-surface-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="all">All Cities</option>
            {availableCities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Schedule Date */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-semibold text-outline tracking-wider block">
            Scheduled Date
          </label>
          <select
            value={date}
            onChange={(e) =>
              onDateChange(
                e.target.value as
                  | "all"
                  | "today"
                  | "tomorrow"
                  | "next_7_days"
                  | "past_7_days"
                  | "past_30_days"
              )
            }
            className="w-full bg-surface-container border border-surface-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="next_7_days">Next 7 Days</option>
            <option value="past_7_days">Past 7 Days</option>
            <option value="past_30_days">Past 30 Days</option>
          </select>
        </div>

        {/* Assigned Provider */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-semibold text-outline tracking-wider block">
            Provider
          </label>
          <select
            value={providerId}
            onChange={(e) => onProviderChange(e.target.value)}
            className="w-full bg-surface-container border border-surface-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="all">All Providers</option>
            <option value="unassigned">(Unassigned)</option>
            {availableProviders.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Assigned Delivery Partner */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-semibold text-outline tracking-wider block">
            Delivery Valet
          </label>
          <select
            value={deliveryPartnerId}
            onChange={(e) => onDeliveryPartnerChange(e.target.value)}
            className="w-full bg-surface-container border border-surface-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="all">All Valets</option>
            <option value="unassigned">(Unassigned)</option>
            {availableDeliveryPartners.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
