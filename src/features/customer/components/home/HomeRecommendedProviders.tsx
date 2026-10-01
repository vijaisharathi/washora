"use client";

import React from "react";
import { ProviderSummary } from "@/types/customer";
import {
  SectionHeader,
  HorizontalRail,
  ProviderCard,
} from "@/components/discovery/DiscoveryCards";

interface HomeRecommendedProvidersProps {
  providers: ProviderSummary[];
}

export function HomeRecommendedProviders({ providers }: HomeRecommendedProvidersProps) {
  return (
    <section className="space-y-3">
      <SectionHeader
        title="Recommended Care Studios"
        subtitle="Certified partner workshops with specialized inspection facilities."
        actionHref="/customer/providers"
        actionLabel="All Studios"
      />

      <HorizontalRail>
        {providers.map((prov) => (
          <ProviderCard
            key={prov.id}
            id={prov.id}
            businessName={prov.businessName}
            tagline={prov.tagline}
            rating={prov.rating}
            reviewCount={prov.reviewCount}
            distanceKm={prov.distanceKm}
            coverImageUrl={prov.coverImageUrl || prov.avatarUrl || "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?q=80&w=800&auto=format&fit=crop"}
            serviceCount={12}
          />
        ))}
      </HorizontalRail>
    </section>
  );
}
