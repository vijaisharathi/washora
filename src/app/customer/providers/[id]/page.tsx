"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useProviderDetail } from "@/features/customer/hooks/useProviders";
import { useLocation } from "@/features/customer/hooks/useLocation";
import { ProviderHeroCard } from "@/features/customer/components/providers/ProviderHeroCard";
import { ProviderAboutLogistics } from "@/features/customer/components/providers/ProviderAboutLogistics";
import { ProviderServicesList } from "@/features/customer/components/providers/ProviderServicesList";
import { ProviderReviewsPreview } from "@/features/customer/components/providers/ProviderReviewsPreview";
import { ProviderStickyCard } from "@/features/customer/components/providers/ProviderStickyCard";
import { ProviderDetailSkeleton } from "@/features/customer/components/providers/ProviderDiscoverySkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { ArrowLeft, Share2, Heart, Check } from "lucide-react";

export default function CustomerProviderProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const {
    provider,
    isLoading,
    isError,
    refetch,
    isFavorited,
    toggleFavorite,
    isTogglingFavorite,
  } = useProviderDetail(params.id);

  const { currentLocation } = useLocation();
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  if (isLoading) {
    return <ProviderDetailSkeleton />;
  }

  if (isError || !provider) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <ErrorState
          title="Studio Partner Not Found"
          message="We could not locate this partner studio in our network."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 3000);
    }
  };

  const displayLocation = currentLocation
    ? `${currentLocation.areaName}`
    : "Indiranagar";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Contextual App Bar matching Stitch anything_clean_provider_details_trust */}
      <div className="flex justify-between items-center pb-2 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link
            href="/customer/providers"
            className="w-9 h-9 rounded-full bg-surface-container border border-white/10 flex items-center justify-center text-on-surface hover:text-primary transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          {/* Breadcrumbs */}
          <nav className="hidden sm:flex items-center gap-2 text-xs font-medium text-on-surface-variant">
            <Link href="/customer/providers" className="hover:text-primary transition-colors">
              Providers
            </Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-primary font-bold truncate max-w-[220px]">
              {provider.businessName}
            </span>
          </nav>
        </div>

        {/* Favorite & Share Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toggleFavorite()}
            disabled={isTogglingFavorite}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
              isFavorited
                ? "bg-red-500/10 border-red-500/30 text-red-400"
                : "bg-surface-container border-white/10 text-on-surface-variant hover:text-red-400"
            }`}
            aria-label="Save studio to wishlist"
          >
            <Heart className={`h-4 w-4 ${isFavorited ? "fill-red-400 text-red-400" : ""}`} />
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="w-9 h-9 rounded-full bg-surface-container border border-white/10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors relative"
            aria-label="Share studio link"
          >
            {copiedShareLink ? <Check className="h-4 w-4 text-green-400" /> : <Share2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Main 12-Column Grid: Left Column Details (8 cols) + Right Column Sticky (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Main Hero Identity Card */}
          <ProviderHeroCard provider={provider} />

          {/* About & Logistics Bento */}
          <ProviderAboutLogistics
            aboutText={provider.aboutText}
            pickupAvailable={provider.pickupAvailable}
            deliveryAvailable={provider.deliveryAvailable}
            estimatedHours={provider.estimatedHours}
          />

          {/* Services Offered by this studio */}
          <ProviderServicesList services={provider.servicesOffered} />
        </div>

        {/* Right Column (4 cols Sticky) */}
        <div className="lg:col-span-4 space-y-6">
          <ProviderStickyCard
            providerId={provider.id}
            isAvailableToday={provider.isAvailableToday}
            locationName={displayLocation}
            distanceKm={provider.distanceKm}
          />

          {/* Customer Reviews Preview */}
          {provider.recentReviews && provider.recentReviews.length > 0 && (
            <ProviderReviewsPreview
              reviews={provider.recentReviews}
              averageRating={provider.rating}
            />
          )}
        </div>
      </div>
    </div>
  );
}
