"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useServiceDetail } from "@/features/customer/hooks/useServiceDetail";
import { useLocation } from "@/features/customer/hooks/useLocation";
import { ServiceGallery } from "@/features/customer/components/service-detail/ServiceGallery";
import { ServiceKeyInfoBento } from "@/features/customer/components/service-detail/ServiceKeyInfoBento";
import { ServiceVariantsSelector } from "@/features/customer/components/service-detail/ServiceVariantsSelector";
import { ServiceInclusionsSection } from "@/features/customer/components/service-detail/ServiceInclusionsSection";
import { ServiceProviderPreviewCard } from "@/features/customer/components/service-detail/ServiceProviderPreviewCard";
import { ServiceFaqAccordion } from "@/features/customer/components/service-detail/ServiceFaqAccordion";
import { ServiceStickyActionCard } from "@/features/customer/components/service-detail/ServiceStickyActionCard";
import { ServiceDetailSkeleton } from "@/features/customer/components/service-detail/ServiceDetailSkeleton";
import { ServiceCard } from "@/features/customer/components/services/ServiceCard";
import { ErrorState } from "@/components/shared/ErrorState";
import {
  ArrowLeft,
  Share2,
  Heart,
  Star,
  Sparkles,
  Check,
} from "lucide-react";

export default function CustomerServiceDetailPage({
  params,
}: {
  params: { slug: string; itemId: string };
}) {
  const {
    service,
    isLoading,
    isError,
    refetch,
    isFavorited,
    toggleFavorite,
    isTogglingFavorite,
  } = useServiceDetail(params.itemId);

  const { currentLocation } = useLocation();
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  useEffect(() => {
    if (service?.variants && service.variants.length > 0 && !selectedVariantId) {
      setSelectedVariantId(service.variants[0].id);
    }
  }, [service, selectedVariantId]);

  if (isLoading) {
    return <ServiceDetailSkeleton />;
  }

  if (isError || !service) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <ErrorState
          title="Service Treatment Not Found"
          message="We could not find the requested care service details."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const selectedVariant = service.variants?.find((v) => v.id === selectedVariantId);
  const currentPrice = selectedVariant?.price || service.basePrice;

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
      {/* Top App Bar Header matching Stitch anything_clean_service_details_overview */}
      <div className="flex justify-between items-center pb-2 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link
            href="/customer/services"
            className="w-9 h-9 rounded-full bg-surface-container border border-white/10 flex items-center justify-center text-on-surface hover:text-primary transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          {/* Breadcrumbs */}
          <nav className="hidden sm:flex items-center gap-2 text-xs font-medium text-on-surface-variant">
            <Link href="/customer/services" className="hover:text-primary transition-colors">
              Services
            </Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <Link
              href={`/customer/services/${service.categorySlug}`}
              className="hover:text-primary transition-colors capitalize"
            >
              {service.categoryName}
            </Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-primary font-bold truncate max-w-[200px]">{service.name}</span>
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
            aria-label="Save to favorites"
          >
            <Heart className={`h-4 w-4 ${isFavorited ? "fill-red-400 text-red-400" : ""}`} />
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="w-9 h-9 rounded-full bg-surface-container border border-white/10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors relative"
            aria-label="Share service"
          >
            {copiedShareLink ? <Check className="h-4 w-4 text-green-400" /> : <Share2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Main Grid: Left Column Details + Right Column Sticky Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Media Gallery */}
          <ServiceGallery images={service.galleryImages} title={service.name} />

          {/* Header Metadata */}
          <div className="space-y-3 pb-6 border-b border-white/10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{service.categoryName}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold text-on-surface font-headline tracking-tight">
              {service.name}
            </h1>

            <div className="flex items-center gap-3 text-xs text-on-surface-variant">
              <div className="flex items-center gap-1 text-yellow-400 font-bold">
                <Star className="h-4 w-4 fill-yellow-400" />
                <span>{service.rating}</span>
              </div>
              <span>•</span>
              <span>({service.reviewCount} customer reviews)</span>
              <span>•</span>
              <span className="text-green-400 font-medium">100% Insured Care</span>
            </div>
          </div>

          {/* Overview & Craftsmanship Story */}
          <div className="space-y-2">
            <h3 className="font-bold text-lg text-on-surface font-headline">Overview</h3>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              {service.longDescription}
            </p>
          </div>

          {/* Key Info Bento Grid */}
          <ServiceKeyInfoBento
            turnaround={service.turnaroundEstimate}
            pickupAvailable={service.pickupAvailable}
            deliveryAvailable={service.deliveryAvailable}
            locationName={displayLocation}
          />

          {/* Variants & Finishing Options */}
          {service.variants && service.variants.length > 0 && (
            <ServiceVariantsSelector
              variants={service.variants}
              selectedVariantId={selectedVariantId}
              onSelectVariant={setSelectedVariantId}
            />
          )}

          {/* Inclusions, Exclusions & Process Steps */}
          <ServiceInclusionsSection
            inclusions={service.inclusions}
            exclusions={service.exclusions}
            processSteps={service.processSteps}
          />

          {/* Certified Studio Partner Preview */}
          <ServiceProviderPreviewCard provider={service.assignedProvider} />

          {/* Frequently Asked Questions */}
          <ServiceFaqAccordion faqs={service.faqs} />
        </div>

        {/* Right Column: Sticky Action Card (4 cols) */}
        <div className="lg:col-span-4">
          <ServiceStickyActionCard
            serviceId={service.id}
            selectedVariantId={selectedVariantId}
            price={currentPrice}
            unit={service.unit}
            isFavorited={isFavorited}
            onToggleFavorite={() => toggleFavorite()}
            isTogglingFavorite={isTogglingFavorite}
          />
        </div>
      </div>

      {/* Related Specialty Services */}
      {service.relatedServices && service.relatedServices.length > 0 && (
        <section className="space-y-4 pt-10 border-t border-white/10">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-xl font-bold text-on-surface font-headline tracking-tight">
                Recommended Add-on Care
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Customers frequently combine this treatment with these services.
              </p>
            </div>
            <Link
              href="/customer/services"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>Explore All</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {service.relatedServices.map((rel) => (
              <ServiceCard key={rel.id} service={rel} categorySlug={service.categorySlug} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
