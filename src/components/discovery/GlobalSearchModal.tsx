"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Sparkles,
  ArrowRight,
  Clock,
  TrendingUp,
  Store,
  MapPin,
} from "lucide-react";
import { mockServiceItems, mockProviders, mockCategories } from "@/mocks/customer/mockData";

export interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

const POPULAR_SEARCHES = [
  "Sneaker Deep Clean",
  "Silk Saree Dry Cleaning",
  "Suit Dry Clean & Press",
  "Motorcycle Jacket Restoration",
  "Curtain Steam Cleaning",
  "Car Interior Detailing",
];

export function GlobalSearchModal({
  isOpen,
  onClose,
  initialQuery = "",
}: GlobalSearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "Sneaker restoration",
    "Express laundry",
    "Anna Nagar studio",
  ]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const normalizedQuery = query.trim().toLowerCase();

  // Filter Matching Services
  const matchingServices = normalizedQuery
    ? mockServiceItems.filter(
        (s) =>
          s.name.toLowerCase().includes(normalizedQuery) ||
          s.description.toLowerCase().includes(normalizedQuery)
      ).slice(0, 4)
    : [];

  // Filter Matching Providers
  const matchingProviders = normalizedQuery
    ? mockProviders.filter(
        (p) =>
          p.businessName.toLowerCase().includes(normalizedQuery) ||
          p.tagline.toLowerCase().includes(normalizedQuery)
      ).slice(0, 3)
    : [];

  const handleSelectSearch = (searchTerm: string) => {
    // Add to recents
    if (!recentSearches.includes(searchTerm)) {
      setRecentSearches([searchTerm, ...recentSearches.slice(0, 4)]);
    }
    onClose();
    router.push(`/customer/services?q=${encodeURIComponent(searchTerm)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) {
      handleSelectSearch(query.trim());
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Global Service & Provider Search"
      className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-xl animate-in fade-in duration-200"
    >
      {/* Search Header Container */}
      <div className="w-full max-w-3xl mx-auto px-4 pt-4 sm:pt-8 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-4 h-5 w-5 text-primary-light pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Search "shoe cleaning", "car wash", "laundry near you"...'
              className="w-full h-12 sm:h-14 pl-12 pr-10 rounded-2xl bg-surface-card border border-white/10 text-sm sm:text-base text-white placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-card"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search query"
                className="absolute right-3.5 h-6 w-6 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-surface-card border border-white/10 hover:border-white/20 transition-all flex-shrink-0"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Search Content Body */}
      <div className="flex-1 overflow-y-auto w-full max-w-3xl mx-auto px-4 pb-12 space-y-6">
        {/* Dynamic Results when Typing */}
        {query.trim().length > 0 ? (
          <div className="space-y-6 pt-2">
            {/* Matching Services */}
            {matchingServices.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Matching Treatments ({matchingServices.length})
                </p>
                <div className="space-y-2">
                  {matchingServices.map((srv) => (
                    <Link
                      key={srv.id}
                      href={`/customer/services/clothing-care/${srv.id}`}
                      onClick={onClose}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-surface-card border border-white/[0.08] hover:border-primary/40 transition-all group"
                    >
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-white group-hover:text-primary-light transition-colors">
                          {srv.name}
                        </p>
                        <p className="text-xs text-slate-400 line-clamp-1">{srv.description}</p>
                      </div>
                      <div className="flex items-center gap-3 pl-4 flex-shrink-0">
                        <span className="text-xs font-bold text-white">₹{srv.basePrice}</span>
                        <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-primary transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Matching Providers */}
            {matchingProviders.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Care Studios ({matchingProviders.length})
                </p>
                <div className="space-y-2">
                  {matchingProviders.map((prov) => (
                    <Link
                      key={prov.id}
                      href={`/customer/providers/${prov.id}`}
                      onClick={onClose}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-surface-card border border-white/[0.08] hover:border-primary/40 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-light">
                          <Store className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-primary-light transition-colors">
                            {prov.businessName}
                          </p>
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-slate-500" />
                            {prov.tagline} • {prov.distanceKm} km
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-primary transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {matchingServices.length === 0 && matchingProviders.length === 0 && (
              <div className="text-center py-12 space-y-2">
                <p className="text-base font-semibold text-white">No exact matches for &quot;{query}&quot;</p>
                <p className="text-xs text-slate-400">
                  Try searching for general categories like laundry, shoe care, or dry cleaning.
                </p>
                <button
                  type="button"
                  onClick={() => handleSelectSearch(query)}
                  className="mt-4 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors"
                >
                  Search all catalog for &quot;{query}&quot;
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Empty Input Default Suggestions */
          <div className="space-y-6 pt-2">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Recent Searches
                  </p>
                  <button
                    type="button"
                    onClick={() => setRecentSearches([])}
                    className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSearch(item)}
                      className="px-3 py-1.5 rounded-full bg-surface-card hover:bg-surface-container border border-white/[0.08] text-xs text-slate-300 hover:text-white transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches */}
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-primary-light" />
                Popular Right Now
              </p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((term, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSearch(term)}
                    className="px-3.5 py-2 rounded-xl bg-surface-card hover:bg-surface-container border border-white/[0.08] hover:border-primary/40 text-xs font-medium text-slate-200 hover:text-white transition-all flex items-center gap-1.5"
                  >
                    <Sparkles className="h-3 w-3 text-primary-light" />
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Suggested Categories */}
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Browse By Category
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {mockCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/customer/services?category=${cat.slug}`}
                    onClick={onClose}
                    className="p-3 rounded-xl bg-surface-card border border-white/[0.08] hover:border-primary/40 transition-all flex items-center gap-2.5 group"
                  >
                    <div className="h-8 w-8 rounded-lg bg-surface-container flex items-center justify-center text-primary-light group-hover:scale-105 transition-transform flex-shrink-0">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold text-white truncate">{cat.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
