"use client";

import React from "react";
import { Search, Filter, X } from "lucide-react";
import { TaskFilterParams, TaskType } from "@/types/delivery-partner";

interface DeliveryPartnerTaskFiltersProps {
  filters: TaskFilterParams;
  onFilterChange: (newFilters: TaskFilterParams) => void;
  taskCount: number;
}

export function DeliveryPartnerTaskFilters({
  filters,
  onFilterChange,
  taskCount,
}: DeliveryPartnerTaskFiltersProps) {
  const currentCategory = filters.category || "ALL";

  const categories = [
    { id: "ALL", label: "All Tasks" },
    { id: "AVAILABLE", label: "Available" },
    { id: "ASSIGNED", label: "Assigned Queue" },
    { id: "IN_TRANSIT", label: "In Transit" },
    { id: "COMPLETED", label: "Completed" },
  ] as const;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      searchQuery: e.target.value,
    });
  };

  const handleCategorySelect = (catId: typeof categories[number]["id"]) => {
    onFilterChange({
      ...filters,
      category: catId,
    });
  };

  const handleTypeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      type: e.target.value as TaskType | "ALL",
    });
  };

  const handleClearFilters = () => {
    onFilterChange({
      category: "ALL",
      searchQuery: "",
      type: "ALL",
    });
  };

  const hasActiveFilters =
    currentCategory !== "ALL" ||
    (filters.searchQuery && filters.searchQuery.length > 0) ||
    (filters.type && filters.type !== "ALL");

  return (
    <div className="space-y-4 p-5 rounded-3xl bg-surface-container/70 border border-outline-variant/20 shadow-sm">
      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-outline-variant/15">
        {categories.map((cat) => {
          const isActive = currentCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Search Input & Sub-Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-on-surface-variant/60 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by order #, customer, address, or item..."
            value={filters.searchQuery || ""}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-surface border border-outline-variant/25 text-xs text-on-surface focus:outline-none focus:border-primary placeholder:text-on-surface-variant/50"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ ...filters, searchQuery: "" })}
              className="absolute right-2.5 top-2.5 text-on-surface-variant hover:text-on-surface"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Task Type Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
            <Filter className="w-3.5 h-3.5" />
            <span>Type:</span>
          </div>
          <select
            value={filters.type || "ALL"}
            onChange={handleTypeSelect}
            className="px-3 py-2 rounded-xl bg-surface border border-outline-variant/25 text-xs text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="ALL">All Task Types</option>
            <option value="CUSTOMER_PICKUP">Doorstep Pickup</option>
            <option value="CUSTOMER_DELIVERY">Doorstep Dropoff</option>
            <option value="HUB_TRANSFER">Hub Transfer</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-3 py-2 rounded-xl bg-surface-container-high text-xs text-on-surface-variant hover:text-primary transition-colors font-semibold"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
