"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useHomeData } from "@/features/customer/hooks/useHomeData";
import { useAuth } from "@/features/customer/hooks/useAuth";
import { useLocation } from "@/features/customer/hooks/useLocation";
import { HomeHeroBanner } from "@/features/customer/components/home/HomeHeroBanner";
import { HomeSearchBar } from "@/features/customer/components/home/HomeSearchBar";
import { HomeCategoryGrid } from "@/features/customer/components/home/HomeCategoryGrid";
import { HomeActiveOrderCard } from "@/features/customer/components/home/HomeActiveOrderCard";
import { HomeFeaturedServices } from "@/features/customer/components/home/HomeFeaturedServices";
import { HomeRecommendedProviders } from "@/features/customer/components/home/HomeRecommendedProviders";
import { HomeTrustStrip } from "@/features/customer/components/home/HomeTrustStrip";
import { CategoryRail } from "@/components/discovery/DiscoveryCards";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { MapPin, ChevronRight } from "lucide-react";

export default function CustomerHomePage() {
  const { data: homeData, isLoading, isError, refetch } = useHomeData();
  const { session } = useAuth();
  const { currentLocation } = useLocation();
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>("all");

  const customerFirstName = session?.user?.name
    ? session.user.name.split(" ")[0]
    : homeData?.customerName?.split(" ")[0] || "there";

  const displayLocation = currentLocation
    ? `${currentLocation.areaName}, ${currentLocation.city}`
    : "Indiranagar, Bangalore";

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <div className="flex justify-between items-center">
          <LoadingSkeleton className="h-8 w-48 rounded-xl" />
          <LoadingSkeleton className="h-8 w-36 rounded-full" />
        </div>
        <LoadingSkeleton className="h-12 w-full rounded-2xl" />
        <LoadingSkeleton className="h-10 w-full rounded-full" />
        <LoadingSkeleton className="h-72 sm:h-80 w-full rounded-3xl" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !homeData) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <ErrorState
          title="Unable to load discovery feed"
          message="We encountered an issue fetching available care services. Please check your connection and try again."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 sm:space-y-12">
      {/* 1. LOCATION & GREETING HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-headline tracking-tight">
            Hello, {customerFirstName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            What needs care and restoration today?
          </p>
        </div>

        {/* Prominent Location Tag */}
        <Link
          href="/customer/location"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-card hover:bg-surface-container border border-white/[0.08] hover:border-primary/40 text-xs text-white transition-all self-start sm:self-auto group shadow-sm"
        >
          <MapPin className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform" />
          <span className="font-semibold truncate max-w-[200px]">{displayLocation}</span>
          <span className="text-[11px] text-primary-light font-medium group-hover:underline">Change</span>
        </Link>
      </div>

      {/* 2. PROMINENT SEARCH BAR */}
      <HomeSearchBar />

      {/* 3. QUICK HORIZONTAL CATEGORY RAIL */}
      {homeData.categories && homeData.categories.length > 0 && (
        <CategoryRail
          categories={homeData.categories}
          activeCategory={selectedCategorySlug}
          onSelectCategory={(slug) => setSelectedCategorySlug(slug)}
        />
      )}

      {/* 4. FEATURED HERO PROMOTION */}
      <HomeHeroBanner promotions={homeData.promotions} />

      {/* 5. ACTIVE LIVE ORDER (IF ANY) */}
      <HomeActiveOrderCard order={homeData.activeOrder} />

      {/* 6. "WHAT DO YOU NEED CLEANED?" — IMAGE-LED CATEGORIES */}
      <HomeCategoryGrid categories={homeData.categories} />

      {/* 7. POPULAR NEAR YOU, CURATED BENTO SPOTLIGHT & SERVICES FOR YOU */}
      <HomeFeaturedServices services={homeData.featuredServices} />

      {/* 8. RECOMMENDED CARE STUDIOS */}
      <HomeRecommendedProviders providers={homeData.recommendedProviders} />

      {/* 9. TRUST & GUARANTEE STRIP */}
      <HomeTrustStrip />
    </div>
  );
}
