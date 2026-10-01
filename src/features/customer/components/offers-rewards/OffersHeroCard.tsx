"use client";

import React, { useState } from "react";
import Image from "next/image";
import { PromoOfferItem } from "@/types/customer/offersRewards";
import { Star, Copy, Check, Clock } from "lucide-react";

interface OffersHeroCardProps {
  offer: PromoOfferItem;
  onApplyCode?: (code: string) => void;
}

export function OffersHeroCard({ offer, onApplyCode }: OffersHeroCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(offer.code);
    setCopied(true);
    if (onApplyCode) {
      onApplyCode(offer.code);
    }
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border border-primary/20 group isolate transition-all duration-300 hover:border-primary/40">
      {/* Background Gradient & Image matching Stitch anything_clean_offers_desktop */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-surface-container to-surface-container-low -z-10" />
      {offer.imageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30 -z-10 transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url(${offer.imageUrl})` }}
        />
      )}

      <div className="p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-surface-container/80 backdrop-blur-md border border-white/10 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
            <Star className="h-3 w-3 fill-primary" />
            <span>Featured Studio Offer</span>
          </div>

          <div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-on-surface font-headline leading-none">
              {offer.discountBadge}
            </h3>
            <p className="text-base sm:text-lg font-bold text-primary mt-1">
              {offer.title}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-on-surface-variant max-w-md leading-relaxed">
            {offer.description}
          </p>
        </div>

        {/* Coupon Code Action Box matching Stitch */}
        <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto bg-surface-container/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/10 shadow-lg">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
            Use Code at Checkout
          </span>

          <div className="bg-surface-container-low border border-dashed border-primary/60 rounded-xl px-4 py-2.5 flex items-center justify-between w-full md:w-auto gap-6 group/code hover:border-primary transition-colors shadow-inner">
            <span className="font-mono font-extrabold text-base sm:text-lg text-primary tracking-widest">
              {offer.code}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="text-on-surface-variant hover:text-primary transition-colors p-1"
              title="Copy Code"
            >
              {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>

          <div className="text-[11px] text-on-surface-variant flex items-center gap-1 mt-1 font-medium">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>{offer.expiryDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
