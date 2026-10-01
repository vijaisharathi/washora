import React from "react";
import Link from "next/link";
import { ProviderSummary } from "@/types/customer";
import { Star, MapPin, ShieldCheck, ArrowRight } from "lucide-react";

interface ServiceProviderPreviewCardProps {
  provider: ProviderSummary;
}

export function ServiceProviderPreviewCard({ provider }: ServiceProviderPreviewCardProps) {
  if (!provider) return null;

  return (
    <div className="space-y-3 pt-4">
      <h4 className="font-bold text-base text-on-surface font-headline">
        Certified Studio Partner
      </h4>

      <Link
        href={`/customer/providers/${provider.id}`}
        className="bg-surface-container border border-white/10 rounded-2xl p-4 sm:p-5 flex items-center justify-between group hover:border-primary/40 hover:bg-surface-container-high transition-all shadow-xl block"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-14 h-14 rounded-xl bg-surface-container-low border border-white/10 flex items-center justify-center text-primary font-bold text-xl shrink-0 overflow-hidden shadow-inner">
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

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <h5 className="font-bold text-sm sm:text-base text-on-surface group-hover:text-primary transition-colors truncate">
                {provider.businessName}
              </h5>
              <span className="text-green-400">
                <ShieldCheck className="h-4 w-4" />
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-on-surface-variant">
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

        <div className="hidden sm:flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity pr-2 shrink-0">
          <span>View Studio</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </Link>
    </div>
  );
}
