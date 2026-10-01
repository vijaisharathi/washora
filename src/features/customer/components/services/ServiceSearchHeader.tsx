"use client";

import React from "react";
import { Search, X, History, TrendingUp } from "lucide-react";

interface ServiceSearchHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: (q: string) => void;
  recentSearches: string[];
  popularSearches: string[];
  onClearRecent?: () => void;
}

export function ServiceSearchHeader({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  recentSearches,
  popularSearches,
}: ServiceSearchHeaderProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(searchQuery);
  };

  return (
    <section className="space-y-4">
      {/* Search Input Bar */}
      <form onSubmit={handleSubmit} className="relative max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search services (e.g., 'Leather Jacket Cleaning', 'Sneakers', 'Silk Saree')..."
          className="w-full bg-surface-container-low border border-primary/40 rounded-xl py-3.5 pl-12 pr-12 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-lg"
        />
        {searchQuery ? (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </form>

      {/* Recent & Popular Search Pills matching Stitch anything_clean_search_results_desktop */}
      <div className="flex flex-wrap gap-4 sm:gap-6 items-start text-xs">
        {/* Recent Searches */}
        {recentSearches && recentSearches.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
              Recent
            </span>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    onSearchChange(tag);
                    onSearchSubmit(tag);
                  }}
                  className="px-3 py-1 rounded-full border border-white/10 bg-surface-container-low text-on-surface hover:bg-surface-container hover:border-primary/40 transition-colors flex items-center gap-1 text-xs"
                >
                  <History className="h-3 w-3 text-on-surface-variant" />
                  <span>{tag}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="hidden sm:block w-px h-8 bg-white/10 self-center" />

        {/* Popular Searches */}
        {popularSearches && popularSearches.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
              Popular
            </span>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    onSearchChange(tag);
                    onSearchSubmit(tag);
                  }}
                  className="px-3 py-1 rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high hover:text-primary transition-colors flex items-center gap-1 text-xs"
                >
                  <TrendingUp className="h-3 w-3 text-primary" />
                  <span>{tag}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
