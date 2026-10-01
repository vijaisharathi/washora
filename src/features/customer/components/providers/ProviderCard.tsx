"use client";

import React from "react";
import Link from "next/link";
import { ProviderSummary } from "@/types/customer";
import { Star, ShieldCheck, MapPin, ArrowRight } from "lucide-react";

interface ProviderCardProps {
  provider: ProviderSummary;
}

export function ProviderCard({ provider }: ProviderCardProps) {
  return (
    <Link
      href={`/customer/providers/${provider.id}`}
      className="bg-surface-container border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 hover:border-primary/50 hover:bg-surface-container-high transition-all group shadow-xl relative overflow-hidden block"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Top Identity Row matching Stitch */}
      <div className="flex items-start gap-4 relative z-10">
        <div className="relative shrink-0">
          <div className="w-16 h-16 rounded-xl bg-surface-container-low border border-white/10 overflow-hidden shadow-md flex items-center justify-center text-primary font-bold text-xl">
            {provider.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={provider.avatarUrl}
                alt={provider.businessName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            ) : (
              <span>{provider.businessName.charAt(0)}</span>
            )}
          </div>
          {provider.isVerified && (
            <div className="absolute -bottom-1.5 -right-1.5 bg-surface border border-white/10 text-yellow-400 rounded-full p-0.5 shadow-sm">
              <span className="material-symbols-outlined text-[14px]">verified</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <div>
              <h3 className="font-bold text-base text-on-surface group-hover:text-primary transition-colors truncate">
                {provider.businessName}
              </h3>
              <p className="text-xs text-on-surface-variant line-clamp-1 mt-0.5">
                {provider.tagline || provider.badge}
              </p>
            </div>
            <span className="text-sm font-bold text-primary shrink-0">
              Starts ₹299
            </span>
          </div>

          <div className="flex items-center gap-3 mt-2 text-xs text-on-surface-variant">
            <div className="flex items-center gap-1 text-yellow-400 font-bold">
              <Star className="h-3.5 w-3.5 fill-yellow-400" />
              <span>{provider.rating}</span>
              <span className="text-on-surface-variant font-normal">
                ({provider.reviewCount})
              </span>
            </div>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-primary" />
              <span>{provider.distanceKm} km away</span>
            </span>
          </div>
        </div>
      </div>

      {/* Badges / Specialties Strip matching Stitch */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5 relative z-10">
        <div className="flex gap-2 flex-wrap text-[11px]">
          <span className="bg-surface-container-low px-2.5 py-0.5 rounded-md text-on-surface-variant border border-white/5 font-medium">
            Eco-friendly
          </span>
          <span className="bg-surface-container-low px-2.5 py-0.5 rounded-md text-on-surface-variant border border-white/5 font-medium">
            Certified Studio
          </span>
        </div>

        <span className="text-xs font-semibold text-primary inline-flex items-center gap-1 group-hover:underline">
          <span>View Studio</span>
          <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}
