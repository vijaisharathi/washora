"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useProviders } from "@/features/customer/hooks/useProviders";
import { useLocation } from "@/features/customer/hooks/useLocation";
import { ProviderSortOption } from "@/types/customer/provider";
import { ProviderCard } from "@/features/customer/components/providers/ProviderCard";
import { ProviderFilterBar } from "@/features/customer/components/providers/ProviderFilterBar";
import { ProviderMapPane } from "@/features/customer/components/providers/ProviderMapPane";
import { ProviderDiscoverySkeleton } from "@/features/customer/components/providers/ProviderDiscoverySkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { MapPin, SearchX, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

function ProviderDiscoveryContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState<ProviderSortOption>("recommended");

  const { currentLocation } = useLocation();

  const { data, isLoading, isError, refetch } = useProviders({
    query: searchQuery,
    category: selectedCategory === "all" ? undefined : selectedCategory,
    minRating: minRating > 0 ? minRating : undefined,
    sortBy,
  });

  const providers = data?.providers || [];

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setMinRating(0);
    setSortBy("recommended");
  };

  const displayLocation = currentLocation
    ? `${currentLocation.areaName}, ${currentLocation.city}`
    : "Indiranagar, Bangalore";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <nav className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
            <Link href="/customer" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-primary font-semibold">Partner Studios</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface font-headline tracking-tight">
            Find Certified Providers
          </h1>
        </div>

        {/* Location Selector */}
        <Link
          href="/customer/location"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container border border-white/10 text-xs text-on-surface hover:border-primary/40 transition-colors shadow-md"
        >
          <MapPin className="h-3.5 w-3.5 text-primary" />
          <span className="font-semibold text-on-surface">{displayLocation}</span>
          <span className="text-[11px] text-primary font-medium">Change</span>
        </Link>
      </div>

      {/* Main Split Layout: Left Pane List + Right Pane Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        {/* Left Column (5 cols on Desktop) */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col space-y-4">
          <ProviderFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            minRating={minRating}
            onToggleMinRating={() => setMinRating(minRating >= 4.5 ? 0 : 4.5)}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {/* Results Count Header */}
          <div className="flex justify-between items-center text-xs text-on-surface-variant px-1">
            <span>
              Showing <strong className="text-on-surface">{providers.length}</strong> certified studios
            </span>
            {(searchQuery || selectedCategory !== "all" || minRating > 0) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-primary hover:underline font-semibold"
              >
                Reset
              </button>
            )}
          </div>

          {/* Provider List / States */}
          <div className="space-y-4 overflow-y-auto max-h-[700px] pr-1 no-scrollbar">
            {isLoading ? (
              <ProviderDiscoverySkeleton />
            ) : isError ? (
              <div className="p-4">
                <ErrorState
                  title="Could Not Load Providers"
                  message="We were unable to load partner studios in your neighborhood."
                  onRetry={() => refetch()}
                />
              </div>
            ) : providers.length === 0 ? (
              <div className="bg-surface-container rounded-2xl border border-white/10 p-8 text-center space-y-4 shadow-xl">
                <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center mx-auto text-on-surface-variant">
                  <SearchX className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-on-surface">No Providers Found</h3>
                  <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
                    Try adjusting your filters or search query to find available studios.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleResetFilters} className="gap-1.5 text-xs">
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset All Filters</span>
                </Button>
              </div>
            ) : (
              providers.map((p) => <ProviderCard key={p.id} provider={p} />)
            )}
          </div>
        </div>

        {/* Right Column: Interactive Map Pane (7 cols on Desktop) */}
        <div className="hidden lg:block lg:col-span-7 xl:col-span-7 h-[700px]">
          <ProviderMapPane onSearchArea={() => refetch()} />
        </div>
      </div>
    </div>
  );
}

export default function CustomerProvidersPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          <div className="h-8 w-48 bg-surface-container rounded animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-4">
              <ProviderDiscoverySkeleton />
            </div>
            <div className="hidden lg:block lg:col-span-7 h-96 bg-surface-container rounded-2xl animate-pulse" />
          </div>
        </div>
      }
    >
      <ProviderDiscoveryContent />
    </Suspense>
  );
}
