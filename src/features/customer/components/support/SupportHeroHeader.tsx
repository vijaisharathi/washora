"use client";

import React from "react";
import { Search } from "lucide-react";

interface SupportHeroHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function SupportHeroHeader({
  searchQuery,
  onSearchChange,
}: SupportHeroHeaderProps) {
  return (
    <section className="space-y-6 text-center md:text-left">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-on-surface font-headline">
          Help &amp; Support
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant max-w-xl">
          Find answers, review fabric care guidelines, or connect directly with our specialist team.
        </p>
      </div>

      {/* Search Bar matching Stitch anything_clean_help_support_center */}
      <div className="relative max-w-2xl mx-auto md:mx-0">
        <Search className="h-4 w-4 text-on-surface-variant absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search help articles, garment care, or policies..."
          className="w-full bg-surface-container-low border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-on-surface-variant/50 shadow-inner"
        />
      </div>
    </section>
  );
}
