"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useServiceDiscovery } from "@/features/customer/hooks/useServiceDiscovery";
import { useLocation } from "@/features/customer/hooks/useLocation";
import { ServiceSortOption } from "@/types/customer/services";
import { CategoryBentoGrid } from "@/features/customer/components/services/CategoryBentoGrid";
import { ServiceCard } from "@/features/customer/components/services/ServiceCard";
import { ServiceSearchHeader } from "@/features/customer/components/services/ServiceSearchHeader";
import { ServiceFilterBar } from "@/features/customer/components/services/ServiceFilterBar";
import { AdvancedFilterDialog } from "@/features/customer/components/services/AdvancedFilterDialog";
import {
  ServiceLoadingSkeleton,
  ServiceEmptyState,
  ServiceErrorState,
} from "@/features/customer/components/services/ServiceListingStates";
import { MapPin } from "lucide-react";

function ServiceDiscoveryContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const initialQuery = searchParams.get("q") || "";

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [activeQuery, setActiveQuery] = useState<string>(initialQuery);
  const [sortBy, setSortBy] = useState<ServiceSortOption>("relevance");
  const [maxPrice, setMaxPrice] = useState<number>(1500);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const { currentLocation } = useLocation();

  const { data, isLoading, isError, refetch, addRecentSearch } = useServiceDiscovery({
    categorySlug: selectedCategory === "all" ? undefined : selectedCategory,
    query: activeQuery,
    maxPrice: maxPrice < 1500 ? maxPrice : undefined,
    sortBy,
  });

  const categories = data?.categories || [];
  const services = data?.services || [];
  const recentSearches = data?.recentSearches || [];
  const popularSearches = data?.popularSearches || [];

  const handleSearchSubmit = (q: string) => {
    setActiveQuery(q);
    if (q.trim()) {
      addRecentSearch(q.trim());
    }
  };

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setActiveQuery("");
    setSortBy("relevance");
    setMaxPrice(1500);
  };

  const isFilteringOrSearching =
    Boolean(activeQuery) || selectedCategory !== "all" || maxPrice < 1500 || sortBy !== "relevance";

  const displayLocation = currentLocation
    ? `${currentLocation.areaName}, ${currentLocation.city}`
    : "Indiranagar, Bangalore";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 sm:space-y-10">
      {/* Page Header matching Stitch anything_clean_services_directory_desktop_2 */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <nav className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
            <Link href="/customer" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-primary font-semibold">Services Catalog</span>
          </nav>

          {/* Location Chip */}
          <Link
            href="/customer/location"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container border border-white/10 text-xs text-on-surface hover:border-primary/40 transition-colors self-start sm:self-auto group shadow-md"
          >
            <MapPin className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-on-surface">{displayLocation}</span>
            <span className="text-[11px] text-primary font-medium">Change</span>
          </Link>
        </div>

        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-on-surface font-headline tracking-tight">
            Our Services
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1 max-w-2xl leading-relaxed">
            Explore our premium care categories. From delicate fabrics to high-performance vehicles, precision is our standard.
          </p>
        </div>
      </div>

      {/* Search Header Section matching Stitch */}
      <ServiceSearchHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        recentSearches={recentSearches}
        popularSearches={popularSearches}
      />

      {/* Category Bento Grid (Displayed when viewing all without search) */}
      {!isFilteringOrSearching && <CategoryBentoGrid categories={categories} />}

      {/* Filters & Sort Controls */}
      <ServiceFilterBar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onOpenAdvancedFilters={() => setFilterModalOpen(true)}
      />

      {/* Results Header */}
      <div className="flex justify-between items-center text-xs text-on-surface-variant">
        <span>
          Showing <strong className="text-on-surface">{services.length}</strong> specialty care treatments
        </span>
        {isFilteringOrSearching && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-primary hover:underline font-semibold"
          >
            Reset All Filters
          </button>
        )}
      </div>

      {/* Results Grid / States */}
      {isLoading ? (
        <ServiceLoadingSkeleton />
      ) : isError ? (
        <ServiceErrorState onRetry={() => refetch()} />
      ) : services.length === 0 ? (
        <ServiceEmptyState onResetFilters={handleResetFilters} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv) => (
            <ServiceCard
              key={srv.id}
              service={srv}
              categorySlug={selectedCategory !== "all" ? selectedCategory : "clothing-care"}
            />
          ))}
        </div>
      )}

      {/* Advanced Filter Modal */}
      <AdvancedFilterDialog
        open={filterModalOpen}
        onOpenChange={setFilterModalOpen}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        maxPrice={maxPrice}
        onMaxPriceChange={setMaxPrice}
        onApply={() => refetch()}
        onReset={handleResetFilters}
      />
    </div>
  );
}

export default function CustomerServicesDiscoveryPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          <div className="h-8 w-48 bg-surface-container rounded animate-pulse" />
          <div className="h-12 w-full bg-surface-container rounded-xl animate-pulse" />
          <div className="grid grid-cols-3 gap-6">
            <div className="h-64 bg-surface-container rounded-2xl animate-pulse" />
            <div className="h-64 bg-surface-container rounded-2xl animate-pulse" />
            <div className="h-64 bg-surface-container rounded-2xl animate-pulse" />
          </div>
        </div>
      }
    >
      <ServiceDiscoveryContent />
    </Suspense>
  );
}
