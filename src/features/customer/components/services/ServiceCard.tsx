"use client";

import React from "react";
import Link from "next/link";
import { ServiceItem } from "@/types/customer";
import { Button } from "@/components/ui/button";
import { Star, Clock, ArrowRight } from "lucide-react";

interface ServiceCardProps {
  service: ServiceItem;
  categorySlug?: string;
}

export function ServiceCard({ service, categorySlug = "clothing-care" }: ServiceCardProps) {
  const rating = 4.8 + ((service.name.length % 3) * 0.1);
  const duration = service.variants?.[0]?.turnaroundHours
    ? `${service.variants[0].turnaroundHours} hrs`
    : "24-48 hrs";

  return (
    <article className="bg-surface-container border border-white/10 rounded-2xl overflow-hidden hover:border-primary/50 transition-all group flex flex-col shadow-xl">
      {/* Image Container with Star Badge */}
      <div className="h-48 w-full bg-surface-container-low relative overflow-hidden">
        {service.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={service.imageUrl}
            alt={service.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-container-high text-on-surface-variant/40">
            <span className="material-symbols-outlined text-4xl">dry_cleaning</span>
          </div>
        )}
        <div className="absolute top-3 right-3 bg-surface/80 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1 border border-white/10 text-xs font-bold text-on-surface shadow-md">
          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          <span>{rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col gap-3 flex-1 justify-between">
        <div className="space-y-1.5">
          <div className="flex justify-between items-start gap-2">
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
              {service.unit}
            </span>
            <span className="text-base font-bold text-on-surface">₹{service.basePrice}</span>
          </div>

          <h3 className="font-bold text-base text-on-surface group-hover:text-primary transition-colors line-clamp-1">
            {service.name}
          </h3>

          <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
            {service.description}
          </p>
        </div>

        {/* Card Footer with Duration & Navigation to C5 Service Details Boundary */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between mt-auto">
          <span className="text-xs text-on-surface-variant flex items-center gap-1 font-medium">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>{duration}</span>
          </span>

          <Link href={`/customer/services/${categorySlug}/${service.id}`}>
            <Button size="sm" className="gap-1.5 text-xs font-semibold shadow-md">
              <span>View Care Options</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
