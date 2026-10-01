"use client";

import React from "react";
import { ServiceCategory } from "@/types/customer";
import { ServiceSortOption } from "@/types/customer/services";
import { SlidersHorizontal } from "lucide-react";

interface ServiceFilterBarProps {
  categories: ServiceCategory[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  sortBy: ServiceSortOption;
  onSortChange: (sort: ServiceSortOption) => void;
  onOpenAdvancedFilters?: () => void;
  priceRange?: [number, number];
  onPriceRangeChange?: (range: [number, number]) => void;
}

export function ServiceFilterBar({
  categories,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  onOpenAdvancedFilters,
}: ServiceFilterBarProps) {
  return (
    <section className="space-y-3 border-b border-white/10 pb-4">
      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          type="button"
          onClick={() => onSelectCategory("all")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
            selectedCategory === "all"
              ? "bg-primary text-on-primary border-primary shadow-lg shadow-primary/20"
              : "bg-surface-container text-on-surface-variant border-white/5 hover:border-primary/40 hover:text-on-surface"
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.slug)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedCategory === cat.slug
                ? "bg-primary text-on-primary border-primary shadow-lg shadow-primary/20"
                : "bg-surface-container text-on-surface-variant border-white/5 hover:border-primary/40 hover:text-on-surface"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Filter and Sort Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-on-surface-variant font-medium">Filters:</span>
          {onOpenAdvancedFilters && (
            <button
              type="button"
              onClick={onOpenAdvancedFilters}
              className="px-3 py-1.5 rounded-full border border-white/10 bg-surface-container text-on-surface text-xs font-medium hover:border-primary transition-colors flex items-center gap-1.5"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
              <span>Filter Options</span>
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-on-surface-variant font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as ServiceSortOption)}
            className="bg-surface-container-low border border-white/10 text-on-surface text-xs font-medium rounded-xl px-3 py-1.5 focus:ring-1 focus:ring-primary focus:border-primary outline-none cursor-pointer"
          >
            <option value="relevance">Relevance</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>
    </section>
  );
}
