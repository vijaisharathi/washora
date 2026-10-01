"use client";

import React from "react";
import { Search, X, Filter, RotateCcw, Bike } from "lucide-react";
import {
  DeliveryPartnerApprovalStatus,
  DeliveryPartnerRatingFilter,
  DeliveryPartnerStatus,
  VehicleType,
} from "@/types/admin";

interface DeliveryPartnerSearchFilterBarProps {
  search: string;
  status: DeliveryPartnerStatus | "all";
  approvalStatus: DeliveryPartnerApprovalStatus | "all";
  vehicleType: VehicleType | "all";
  city: string | "all";
  rating: DeliveryPartnerRatingFilter;
  cities: string[];
  vehicleTypes: VehicleType[];
  onSearchChange: (val: string) => void;
  onStatusChange: (val: DeliveryPartnerStatus | "all") => void;
  onApprovalStatusChange: (val: DeliveryPartnerApprovalStatus | "all") => void;
  onVehicleTypeChange: (val: VehicleType | "all") => void;
  onCityChange: (val: string | "all") => void;
  onRatingChange: (val: DeliveryPartnerRatingFilter) => void;
  onClearFilters: () => void;
}

const VEHICLE_LABELS: Record<VehicleType, string> = {
  bike: "Motorcycle / Bike",
  scooter: "Scooter",
  electric_bike: "Electric Bike (EV)",
  three_wheeler: "Three Wheeler / Auto",
  van: "Van / Cargo Minivan",
};

export function DeliveryPartnerSearchFilterBar({
  search,
  status,
  approvalStatus,
  vehicleType,
  city,
  rating,
  cities,
  vehicleTypes,
  onSearchChange,
  onStatusChange,
  onApprovalStatusChange,
  onVehicleTypeChange,
  onCityChange,
  onRatingChange,
  onClearFilters,
}: DeliveryPartnerSearchFilterBarProps) {
  const hasActiveFilters =
    search.trim() !== "" ||
    status !== "all" ||
    approvalStatus !== "all" ||
    vehicleType !== "all" ||
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
            placeholder="Search name, phone, email, DLP-ID, or vehicle plate..."
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

          {/* Operational Status */}
          <select
            value={status}
            onChange={(e) =>
              onStatusChange(e.target.value as DeliveryPartnerStatus | "all")
            }
            aria-label="Filter by operational status"
            className="bg-surface-container border border-surface-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>

          {/* Approval Status */}
          <select
            value={approvalStatus}
            onChange={(e) =>
              onApprovalStatusChange(
                e.target.value as DeliveryPartnerApprovalStatus | "all"
              )
            }
            aria-label="Filter by verification status"
            className="bg-surface-container border border-surface-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="all">All Verification</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Vehicle Type */}
          <select
            value={vehicleType}
            onChange={(e) =>
              onVehicleTypeChange(e.target.value as VehicleType | "all")
            }
            aria-label="Filter by vehicle type"
            className="bg-surface-container border border-surface-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="all">All Vehicles</option>
            {vehicleTypes.map((v) => (
              <option key={v} value={v}>
                {VEHICLE_LABELS[v] || v}
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
              onRatingChange(e.target.value as DeliveryPartnerRatingFilter)
            }
            aria-label="Filter by rating"
            className="bg-surface-container border border-surface-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="all">All Ratings</option>
            <option value="4.5">4.5+ ★ Stars</option>
            <option value="4.0">4.0+ ★ Stars</option>
            <option value="3.0">3.0+ ★ Stars</option>
            <option value="unrated">Unrated / New</option>
          </select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-error hover:bg-error/10 border border-error/20 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Chips Row */}
      {hasActiveFilters && (
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-surface-variant/40">
          <span className="text-[11px] text-outline">Active filters:</span>

          {search && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">
              Query: &quot;{search}&quot;
              <button
                onClick={() => onSearchChange("")}
                className="hover:text-primary-dim"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {status !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface-container-high text-on-surface border border-surface-variant">
              Status: {status}
              <button
                onClick={() => onStatusChange("all")}
                className="hover:text-on-surface-variant"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {approvalStatus !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface-container-high text-on-surface border border-surface-variant">
              Verification: {approvalStatus}
              <button
                onClick={() => onApprovalStatusChange("all")}
                className="hover:text-on-surface-variant"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {vehicleType !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface-container-high text-on-surface border border-surface-variant">
              Vehicle: {VEHICLE_LABELS[vehicleType] || vehicleType}
              <button
                onClick={() => onVehicleTypeChange("all")}
                className="hover:text-on-surface-variant"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {city !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface-container-high text-on-surface border border-surface-variant">
              City: {city}
              <button
                onClick={() => onCityChange("all")}
                className="hover:text-on-surface-variant"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {rating !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface-container-high text-on-surface border border-surface-variant">
              Rating: {rating === "unrated" ? "Unrated" : `${rating}+ ★`}
              <button
                onClick={() => onRatingChange("all")}
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
