"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ServiceItem } from "@/types/customer";
import {
  SectionHeader,
  HorizontalRail,
  ServiceCard,
} from "@/components/discovery/DiscoveryCards";
import { BentoGrid, FeaturedBentoCard, PromoBentoCard } from "@/components/discovery/BentoSystem";

interface HomeFeaturedServicesProps {
  services: ServiceItem[];
}

export function HomeFeaturedServices({ services }: HomeFeaturedServicesProps) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const popularServices = services.slice(0, 5);
  const recommendedServices = services.slice(2, 6);
  const featuredItem = services[0];

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* 1. POPULAR NEAR YOU — HORIZONTAL RAIL */}
      <section className="space-y-3">
        <SectionHeader
          title="Popular Near You"
          subtitle="Frequently booked by members in your immediate neighbourhood."
          actionHref="/customer/services"
          actionLabel="View All"
        />

        <HorizontalRail>
          {popularServices.map((srv) => (
            <ServiceCard
              key={srv.id}
              id={srv.id}
              name={srv.name}
              basePrice={srv.basePrice}
              imageUrl={srv.imageUrl}
              rating={4.9}
              reviewsCount={145}
              distance="1.4 km"
              badge={srv.unit}
              isFavorited={favoriteIds.includes(srv.id)}
              onToggleFavorite={(e) => toggleFavorite(srv.id, e)}
              className="w-64 sm:w-72"
            />
          ))}
        </HorizontalRail>
      </section>

      {/* 2. SELECTIVE BENTO FEATURED SHOWCASE (Desktop & Tablet) */}
      {featuredItem && (
        <section className="space-y-3">
          <SectionHeader
            title="Curated Spotlight"
            subtitle="Master craft treatment highlighted for this season."
          />
          <BentoGrid>
            <FeaturedBentoCard
              title={featuredItem.name}
              subtitle={featuredItem.description}
              badge="SEASONAL RESTORATION"
              ctaText="Book Treatment"
              ctaHref={`/customer/services/clothing-care/${featuredItem.id}`}
              imageUrl={featuredItem.imageUrl}
            />
            <PromoBentoCard
              title="First Order Privilege"
              subtitle="Enjoy 20% savings on your initial garment or footwear care package."
              badge="WELCOME20"
              code="WASHORA20"
              ctaText="Explore Offers"
              ctaHref="/customer/offers"
            />
          </BentoGrid>
        </section>
      )}

      {/* 3. SERVICES FOR YOU — 2-COL MOBILE / 4-COL DESKTOP GRID */}
      <section className="space-y-3">
        <SectionHeader
          title="Services For You"
          subtitle="Hand-picked specialty restorations matched to your preferences."
          actionHref="/customer/services"
          actionLabel="Catalog"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {recommendedServices.map((srv) => (
            <ServiceCard
              key={`rec-${srv.id}`}
              id={srv.id}
              name={srv.name}
              basePrice={srv.basePrice}
              imageUrl={srv.imageUrl}
              rating={4.8}
              reviewsCount={92}
              distance="2.2 km"
              isFavorited={favoriteIds.includes(srv.id)}
              onToggleFavorite={(e) => toggleFavorite(srv.id, e)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
