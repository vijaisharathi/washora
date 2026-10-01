import React from "react";
import { ProviderDetailData } from "@/types/customer/provider";
import { Star, MapPin, ShieldCheck } from "lucide-react";

interface ProviderHeroCardProps {
  provider: ProviderDetailData;
}

export function ProviderHeroCard({ provider }: ProviderHeroCardProps) {
  return (
    <section className="bg-surface-container rounded-2xl border border-white/10 overflow-hidden relative group shadow-2xl">
      {/* Cover Image */}
      <div className="h-48 sm:h-64 w-full relative overflow-hidden bg-surface-container-low">
        {provider.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={provider.coverImageUrl}
            alt={provider.businessName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-surface-container/50 to-transparent" />

        {/* Verified Badge Overlay */}
        {provider.isVerified && (
          <div className="absolute top-4 left-4 bg-surface/90 border border-green-400/30 text-green-400 px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-md text-xs font-bold shadow-lg">
            <ShieldCheck className="h-4 w-4" />
            <span className="uppercase tracking-wider">Verified Partner</span>
          </div>
        )}
      </div>

      {/* Identity Details */}
      <div className="p-6 relative -mt-16 sm:-mt-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-6">
          <div className="flex items-end gap-4">
            {/* Logo Avatar */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-surface-container-low border-2 border-white/10 overflow-hidden shadow-2xl z-10 shrink-0 flex items-center justify-center text-primary font-bold text-2xl">
              {provider.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={provider.avatarUrl}
                  alt={provider.businessName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{provider.businessName.charAt(0)}</span>
              )}
            </div>

            <div className="z-10 pb-1">
              <h2 className="text-xl sm:text-3xl font-bold text-on-surface font-headline tracking-tight">
                {provider.businessName}
              </h2>
              <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-1 font-medium">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>Indiranagar • {provider.distanceKm} km away</span>
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats Row matching Stitch */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/5 pt-5 text-xs">
          <div className="flex flex-col space-y-0.5">
            <div className="flex items-center gap-1 text-yellow-400 font-bold">
              <Star className="h-4 w-4 fill-yellow-400" />
              <span className="text-sm">{provider.rating}</span>
            </div>
            <span className="text-[11px] text-on-surface-variant">{provider.reviewCount} Reviews</span>
          </div>

          <div className="flex flex-col space-y-0.5">
            <span className="font-bold text-sm text-on-surface">{provider.totalServicesCount}</span>
            <span className="text-[11px] text-on-surface-variant">Services Available</span>
          </div>

          <div className="flex flex-col space-y-0.5">
            <span className="font-bold text-sm text-on-surface">{provider.yearsActive} Years</span>
            <span className="text-[11px] text-on-surface-variant">Active on Platform</span>
          </div>

          <div className="flex flex-col space-y-0.5">
            <span className="font-bold text-sm text-on-surface">{provider.completedOrdersCount}</span>
            <span className="text-[11px] text-on-surface-variant">Orders Completed</span>
          </div>
        </div>
      </div>
    </section>
  );
}
