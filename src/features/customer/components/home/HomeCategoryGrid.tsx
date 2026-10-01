"use client";

import React from "react";
import Link from "next/link";
import { ServiceCategory } from "@/types/customer";
import { SectionHeader } from "@/components/discovery/DiscoveryCards";
import { ArrowRight, Sparkles } from "lucide-react";

interface HomeCategoryGridProps {
  categories: ServiceCategory[];
}

export function HomeCategoryGrid({ categories }: HomeCategoryGridProps) {
  return (
    <section className="space-y-4">
      <SectionHeader
        title="What do you need cleaned?"
        subtitle="Select a specialty care category to explore certified treatments."
        actionHref="/customer/services"
        actionLabel="All Categories"
      />

      {/* Image-Led Discovery Grid: 2-col on mobile, 3-col on tablet, 6-col on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/customer/services?category=${cat.slug}`}
            className="group relative rounded-2xl overflow-hidden bg-surface-card border border-white/[0.08] hover:border-primary/40 transition-all duration-300 shadow-card hover:shadow-card-hover flex flex-col justify-end p-3.5 sm:p-4 min-h-[140px] sm:min-h-[160px]"
          >
            {/* Background Photography */}
            {cat.imageUrl ? (
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-110"
                style={{ backgroundImage: `url(${cat.imageUrl})` }}
              />
            ) : (
              <div className="absolute inset-0 bg-surface-container flex items-center justify-center text-primary-light">
                <Sparkles className="h-8 w-8" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/60 to-transparent" />

            {/* Label & Treatment Count */}
            <div className="relative z-10 space-y-0.5">
              <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-primary-light transition-colors line-clamp-1">
                {cat.name}
              </h3>
              <p className="text-[11px] text-slate-300 flex items-center justify-between">
                <span>{cat.itemCount ? `${cat.itemCount} items` : "Available"}</span>
                {cat.startingPrice && (
                  <span className="font-semibold text-primary-light">From ₹{cat.startingPrice}</span>
                )}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
