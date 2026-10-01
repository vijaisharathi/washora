"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  ShieldCheck,
  Lock,
  Package,
  Info,
} from "lucide-react";

interface ServiceStickyActionCardProps {
  serviceId: string;
  selectedVariantId?: string;
  price: number;
  unit: string;
  isFavorited: boolean;
  onToggleFavorite: () => void;
  isTogglingFavorite: boolean;
}

export function ServiceStickyActionCard({
  serviceId,
  selectedVariantId,
  price,
  unit,
  isFavorited,
  onToggleFavorite,
  isTogglingFavorite,
}: ServiceStickyActionCardProps) {
  const bookingUrl = `/customer/booking?serviceId=${serviceId}${
    selectedVariantId ? `&variantId=${selectedVariantId}` : ""
  }`;

  return (
    <div className="bg-surface-container border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-6 sticky top-24">
      {/* Price Header */}
      <div className="space-y-1">
        <span className="text-xs font-medium text-on-surface-variant">Service Price</span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-on-surface font-headline">₹{price}</span>
          <span className="text-xs text-on-surface-variant font-medium">/ {unit}</span>
        </div>
        <p className="text-[11px] text-on-surface-variant flex items-start gap-1.5 pt-1">
          <Info className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
          <span>Final price confirmed after physical condition intake check.</span>
        </p>
      </div>

      {/* Action Buttons matching Stitch */}
      <div className="space-y-3">
        <Link href={bookingUrl} className="w-full block">
          <Button
            size="lg"
            className="w-full gap-2 font-semibold text-base shadow-lg shadow-primary/20"
          >
            <span>Choose Service</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>

        <Button
          variant="outline"
          size="lg"
          onClick={onToggleFavorite}
          disabled={isTogglingFavorite}
          className={`w-full gap-2 text-xs font-semibold border-white/10 ${
            isFavorited ? "text-primary border-primary/40 bg-primary/10" : "text-on-surface"
          }`}
        >
          {isFavorited ? (
            <>
              <BookmarkCheck className="h-4 w-4 text-primary" />
              <span>Saved in Care Wishlist</span>
            </>
          ) : (
            <>
              <Bookmark className="h-4 w-4" />
              <span>Save Service</span>
            </>
          )}
        </Button>
      </div>

      {/* Trust Badges matching Stitch */}
      <div className="border-t border-white/10 pt-4 space-y-2.5 text-xs text-on-surface-variant">
        <div className="flex items-center gap-2 text-green-400">
          <ShieldCheck className="h-4 w-4" />
          <span>100% Certified Workshop Guarantee</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-primary" />
          <span>Secure Encrypted Payment</span>
        </div>
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" />
          <span>Contactless Doorstep Pickup &amp; Return</span>
        </div>
      </div>
    </div>
  );
}
