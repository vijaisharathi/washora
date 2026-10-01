"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Star,
  MapPin,
  Heart,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Clock,
} from "lucide-react";

/**
 * ==============================================================================
 * DISCOVERY COMPONENT SYSTEM
 * Reusable image-led discovery cards, horizontal rails, and metadata tags
 * ==============================================================================
 */

// ----------------------------------------------------------------------------
// 1. METADATA MICRO-COMPONENTS
// ----------------------------------------------------------------------------

export function RatingMeta({
  rating = 4.8,
  reviewsCount,
  className,
}: {
  rating?: number;
  reviewsCount?: number;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-1 text-xs font-semibold text-amber-400", className)}>
      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      <span>{rating.toFixed(1)}</span>
      {reviewsCount !== undefined && (
        <span className="text-[11px] font-normal text-slate-400">({reviewsCount})</span>
      )}
    </div>
  );
}

export function DistanceMeta({
  distance = "1.8 km",
  className,
}: {
  distance?: string;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-1 text-[11px] text-slate-400", className)}>
      <MapPin className="h-3 w-3 text-slate-500" />
      <span>{distance}</span>
    </div>
  );
}

export function PriceMeta({
  price,
  prefix = "From",
  unit,
  className,
}: {
  price: number;
  prefix?: string;
  unit?: string;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-baseline gap-1 text-white", className)}>
      {prefix && <span className="text-[11px] font-medium text-slate-400">{prefix}</span>}
      <span className="text-base font-bold text-white tracking-tight">₹{price}</span>
      {unit && <span className="text-[11px] text-slate-400">/{unit}</span>}
    </div>
  );
}

// ----------------------------------------------------------------------------
// 2. SECTION HEADER
// ----------------------------------------------------------------------------

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  actionHref,
  actionLabel = "See All",
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-end justify-between gap-4 mb-4", className)}>
      <div className="space-y-0.5 min-w-0">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug truncate">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-slate-400 line-clamp-1">{subtitle}</p>
        )}
      </div>
      {actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-light transition-colors flex-shrink-0 group py-1"
        >
          <span>{actionLabel}</span>
          <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// 3. HORIZONTAL SCROLL RAIL
// ----------------------------------------------------------------------------

export interface HorizontalRailProps {
  children: React.ReactNode;
  className?: string;
}

export function HorizontalRail({ children, className }: HorizontalRailProps) {
  const railRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (railRef.current) {
      railRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (railRef.current) {
      railRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  return (
    <div className="group/rail relative -mx-4 sm:-mx-6 px-4 sm:px-6">
      {/* Desktop Scroll Arrows */}
      <button
        type="button"
        onClick={scrollLeft}
        aria-label="Scroll left"
        className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-background/90 border border-white/10 text-white items-center justify-center opacity-0 group-hover/rail:opacity-100 transition-all hover:bg-surface-high hover:scale-105 shadow-card"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={scrollRight}
        aria-label="Scroll right"
        className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-background/90 border border-white/10 text-white items-center justify-center opacity-0 group-hover/rail:opacity-100 transition-all hover:bg-surface-high hover:scale-105 shadow-card"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Touch-Friendly Smooth Momentum Scrolling Container */}
      <div
        ref={railRef}
        className={cn(
          "flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-1",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// 4. QUICK CATEGORY RAIL
// ----------------------------------------------------------------------------

export interface CategoryItem {
  id: string;
  slug: string;
  name: string;
  iconName?: string;
  imageUrl?: string;
  itemCount?: number;
}

export function CategoryRail({
  categories,
  activeCategory,
  onSelectCategory,
}: {
  categories: CategoryItem[];
  activeCategory?: string;
  onSelectCategory?: (slug: string) => void;
}) {
  return (
    <HorizontalRail>
      {categories.map((cat) => {
        const isActive = activeCategory === cat.slug;

        return (
          <Link
            key={cat.id}
            href={`/customer/services?category=${cat.slug}`}
            onClick={(e) => {
              if (onSelectCategory) {
                e.preventDefault();
                onSelectCategory(cat.slug);
              }
            }}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-full border transition-all text-xs font-semibold flex-shrink-0 cursor-pointer snap-start",
              isActive
                ? "bg-primary text-white border-primary shadow-glow"
                : "bg-surface-card hover:bg-surface-container text-slate-300 hover:text-white border-white/[0.08]"
            )}
          >
            {cat.imageUrl ? (
              <div
                className="h-5 w-5 rounded-full bg-cover bg-center"
                style={{ backgroundImage: `url(${cat.imageUrl})` }}
              />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-primary-light" />
            )}
            <span className="whitespace-nowrap">{cat.name}</span>
          </Link>
        );
      })}
    </HorizontalRail>
  );
}

// ----------------------------------------------------------------------------
// 5. SERVICE CARD
// ----------------------------------------------------------------------------

export interface ServiceCardProps {
  id: string;
  slug?: string;
  name: string;
  providerName?: string;
  categoryName?: string;
  imageUrl?: string;
  basePrice: number;
  rating?: number;
  reviewsCount?: number;
  distance?: string;
  badge?: string;
  isFavorited?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
  className?: string;
}

export function ServiceCard({
  id,
  slug = "clothing-care",
  name,
  providerName = "CareWash Studio",
  imageUrl = "https://images.unsplash.com/photo-1545127398-14699f92334b?q=80&w=800&auto=format&fit=crop",
  basePrice,
  rating = 4.8,
  reviewsCount = 120,
  distance = "2.1 km",
  badge,
  isFavorited = false,
  onToggleFavorite,
  className,
}: ServiceCardProps) {
  return (
    <Link
      href={`/customer/services/${slug}/${id}`}
      className={cn(
        "group block relative rounded-2xl overflow-hidden bg-surface-card border border-white/[0.08] hover:border-primary/40 transition-all duration-300 shadow-card hover:shadow-card-hover flex-shrink-0",
        className
      )}
    >
      {/* Visual Photography Header */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-container">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-105"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-80" />

        {/* Optional Badge */}
        {badge && (
          <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-background/80 text-primary-light border border-white/10 backdrop-blur-md">
            {badge}
          </span>
        )}

        {/* Favorite Action Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onToggleFavorite) onToggleFavorite(e);
          }}
          aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
          className="absolute top-2.5 right-2.5 h-8 w-8 rounded-full bg-background/70 hover:bg-background border border-white/10 flex items-center justify-center text-white backdrop-blur-md transition-all"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              isFavorited ? "fill-rose-500 text-rose-500" : "text-white"
            )}
          />
        </button>
      </div>

      {/* Metadata Body */}
      <div className="p-3.5 sm:p-4 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-medium text-slate-400 truncate">{providerName}</p>
          <RatingMeta rating={rating} />
        </div>

        <h3 className="text-sm sm:text-base font-bold text-white leading-tight line-clamp-1 group-hover:text-primary-light transition-colors">
          {name}
        </h3>

        <div className="pt-1 flex items-center justify-between border-t border-white/[0.06]">
          <DistanceMeta distance={distance} />
          <PriceMeta price={basePrice} />
        </div>
      </div>
    </Link>
  );
}

// ----------------------------------------------------------------------------
// 6. PROVIDER STUDIO CARD
// ----------------------------------------------------------------------------

export interface ProviderCardProps {
  id: string;
  name?: string;
  businessName?: string;
  tagline?: string;
  city?: string;
  areaName?: string;
  rating?: number;
  reviewCount?: number;
  reviewsCount?: number;
  distanceKm?: number;
  distance?: string;
  coverImageUrl?: string;
  avatarUrl?: string;
  serviceCount?: number;
  className?: string;
}

export function ProviderCard({
  id,
  name,
  businessName,
  tagline,
  areaName = "Anna Nagar",
  city = "Chennai",
  rating = 4.9,
  reviewCount,
  reviewsCount,
  distanceKm,
  distance,
  coverImageUrl = "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?q=80&w=800&auto=format&fit=crop",
  serviceCount = 12,
  className,
}: ProviderCardProps) {
  const displayName = businessName || name || "Care Studio";
  const displayReviews = reviewCount ?? reviewsCount ?? 120;
  const displayDistance = distance ?? (distanceKm !== undefined ? `${distanceKm} km` : "1.8 km");

  return (
    <Link
      href={`/customer/providers/${id}`}
      className={cn(
        "group block relative rounded-2xl overflow-hidden bg-surface-card border border-white/[0.08] hover:border-primary/40 transition-all duration-300 shadow-card hover:shadow-card-hover flex-shrink-0 w-72 sm:w-80",
        className
      )}
    >
      {/* Cover Image */}
      <div className="relative h-28 sm:h-32 w-full overflow-hidden bg-surface-container">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-105"
          style={{ backgroundImage: `url(${coverImageUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />

        <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-background/80 text-emerald-400 border border-emerald-400/20 backdrop-blur-md flex items-center gap-1">
          <ShieldCheck className="h-3 w-3" />
          VERIFIED STUDIO
        </span>
      </div>

      {/* Studio Profile Details */}
      <div className="p-4 pt-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white group-hover:text-primary-light transition-colors truncate">
              {displayName}
            </h3>
            <p className="text-xs text-slate-400">{tagline || `${areaName}, ${city}`}</p>
          </div>
          <RatingMeta rating={rating} reviewsCount={displayReviews} />
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-white/[0.06] text-xs text-slate-400">
          <DistanceMeta distance={displayDistance} />
          <span className="text-slate-300 font-medium">{serviceCount} treatments</span>
        </div>
      </div>
    </Link>
  );
}
