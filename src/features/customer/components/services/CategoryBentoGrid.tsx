"use client";

import React from "react";
import Link from "next/link";
import { ServiceCategory } from "@/types/customer";
import { ArrowRight } from "lucide-react";

interface CategoryBentoGridProps {
  categories: ServiceCategory[];
}

export function CategoryBentoGrid({ categories }: CategoryBentoGridProps) {
  const clothing = categories.find((c) => c.slug === "clothing-care") || categories[0];
  const shoe = categories.find((c) => c.slug === "shoe-care") || categories[1];
  const car = categories.find((c) => c.slug === "car-care") || categories[2];
  const bag = categories.find((c) => c.slug === "bag-luggage") || categories[3];

  return (
    <section className="space-y-4">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-on-surface font-headline tracking-tight">
            Specialty Care Categories
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Explore dedicated departments with certified fabric, leather, and vehicle master specialists.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Clothing Care (Large Bento Feature) */}
        {clothing && (
          <Link
            href={`/customer/services/${clothing.slug}`}
            className="relative overflow-hidden rounded-2xl group md:col-span-2 md:row-span-2 min-h-[300px] md:min-h-[400px] border border-white/10 shadow-2xl block"
          >
            {clothing.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={clothing.imageUrl}
                alt={clothing.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 sm:p-8 w-full space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 inline-block">
                Flagship Department
              </span>
              <h3 className="font-bold text-xl sm:text-2xl text-on-surface font-headline">
                {clothing.name}
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant max-w-md line-clamp-2">
                {clothing.description}
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-on-primary transition-all text-xs font-semibold shadow-md">
                  <span>Explore Catalog</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* Shoe Care */}
        {shoe && (
          <Link
            href={`/customer/services/${shoe.slug}`}
            className="relative overflow-hidden rounded-2xl group min-h-[190px] md:min-h-[auto] border border-white/10 shadow-xl block"
          >
            {shoe.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={shoe.imageUrl}
                alt={shoe.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5 w-full flex justify-between items-end">
              <div>
                <h3 className="font-bold text-base sm:text-lg text-on-surface font-headline">
                  {shoe.name}
                </h3>
                <span className="text-xs text-primary group-hover:underline inline-flex items-center gap-1 mt-0.5 font-medium">
                  View Treatments <ArrowRight className="h-3 w-3" />
                </span>
              </div>
              <span className="text-xs font-bold text-on-surface">from ₹{shoe.startingPrice}</span>
            </div>
          </Link>
        )}

        {/* Car Care */}
        {car && (
          <Link
            href={`/customer/services/${car.slug}`}
            className="relative overflow-hidden rounded-2xl group min-h-[190px] md:min-h-[auto] border border-white/10 shadow-xl block"
          >
            {car.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={car.imageUrl}
                alt={car.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5 w-full flex justify-between items-end">
              <div>
                <h3 className="font-bold text-base sm:text-lg text-on-surface font-headline">
                  {car.name}
                </h3>
                <span className="text-xs text-primary group-hover:underline inline-flex items-center gap-1 mt-0.5 font-medium">
                  View Treatments <ArrowRight className="h-3 w-3" />
                </span>
              </div>
              <span className="text-xs font-bold text-on-surface">from ₹{car.startingPrice}</span>
            </div>
          </Link>
        )}

        {/* Bag & Luggage */}
        {bag && (
          <Link
            href={`/customer/services/${bag.slug}`}
            className="relative overflow-hidden rounded-2xl group md:col-span-2 min-h-[200px] border border-white/10 shadow-xl block"
          >
            {bag.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={bag.imageUrl}
                alt={bag.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 w-full md:w-2/3 h-full flex flex-col justify-end space-y-1">
              <h3 className="font-bold text-base sm:text-lg text-on-surface font-headline">
                {bag.name}
              </h3>
              <p className="text-xs text-on-surface-variant line-clamp-2">
                {bag.description}
              </p>
              <div className="pt-2">
                <span className="text-xs text-primary group-hover:underline inline-flex items-center gap-1 font-medium">
                  Explore Spa Options <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          </Link>
        )}
      </div>
    </section>
  );
}
