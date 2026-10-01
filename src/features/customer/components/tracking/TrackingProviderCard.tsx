import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TrackingProviderCardProps {
  providerName: string;
  providerRating: number;
  providerReviewCount: number;
  providerImageUrl?: string;
}

export function TrackingProviderCard({
  providerName,
  providerRating,
  providerReviewCount,
  providerImageUrl,
}: TrackingProviderCardProps) {
  return (
    <div className="bg-surface-container rounded-2xl border border-white/10 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-surface-container-high border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
          {providerImageUrl ? (
            <Image
              src={providerImageUrl}
              alt={providerName}
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="material-symbols-outlined text-2xl text-primary">storefront</span>
          )}
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
            Assigned Care Studio
          </span>
          <h4 className="font-bold text-sm sm:text-base text-on-surface">{providerName}</h4>
          <div className="flex items-center gap-1 text-xs text-primary font-semibold">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            <span>
              {providerRating} ({providerReviewCount} reviews)
            </span>
          </div>
        </div>
      </div>

      <Link href="/customer/support">
        <Button size="sm" className="font-semibold text-xs px-4 shadow-lg shadow-primary/20">
          Contact Provider
        </Button>
      </Link>
    </div>
  );
}
