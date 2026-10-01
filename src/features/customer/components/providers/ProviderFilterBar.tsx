"use client";

import React from "react";
import { ProviderSortOption } from "@/types/customer/provider";
import { Search, SlidersHorizontal, Check } from "lucide-react";

interface ProviderFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  minRating: number;
  onToggleMinRating: () => void;
  sortBy: ProviderSortOption;
  onSortChange: (sort: ProviderSortOption) => void;
}

const CATEGORIES = [
  { id: "all", label: "All Studios" },
  { id: "clothing", label: "Garment & Silk" },
  { id: "shoe", label: "Sneaker & Footwear" },
  { id: "leather", label: "Bespoke Leather" },
  { id: "express", label: "24h Express" },
];

export function ProviderFilterBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  minRating,
  onToggleMinRating,
  sortBy,
  onSortChange,
}: ProviderFilterBarProps) {
  return (
    <div className="space-y-3 pb-4 border-b border-white/5">
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search partner studios & labs..."
          className="w-full bg-surface-container-low border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
        />
      </div>

      {/* Category Pills matching Stitch */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1 ${
                isSelected
                  ? "bg-primary text-on-primary border-primary shadow-md"
                  : "bg-surface-container text-on-surface-variant border-white/5 hover:border-primary/40 hover:text-on-surface"
              }`}
            >
              {isSelected && <Check className="h-3 w-3" />}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Secondary Row: Rating Toggle & Sort Dropdown */}
      <div className="flex items-center justify-between pt-1 text-xs">
        {/* Rating Toggle */}
        <button
          type="button"
          onClick={onToggleMinRating}
          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            minRating >= 4.5
              ? "bg-primary/10 border-primary text-primary"
              : "bg-surface-container border-white/10 text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Rating 4.5+</span>
        </button>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <span className="text-on-surface-variant font-medium">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as ProviderSortOption)}
            className="bg-surface-container-low border border-white/10 text-on-surface text-xs font-medium rounded-xl px-2.5 py-1.5 focus:ring-1 focus:ring-primary outline-none cursor-pointer"
          >
            <option value="recommended">Recommended</option>
            <option value="rating">Highest Rated</option>
            <option value="distance">Nearest First</option>
            <option value="experience">Most Experienced</option>
          </select>
        </div>
      </div>
    </div>
  );
}
