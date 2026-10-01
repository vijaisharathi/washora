"use client";

import React, { useState } from "react";
import { PromoOfferItem } from "@/types/customer/offersRewards";
import { Copy, Check, Sparkles, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OfferBentoCardProps {
  offer: PromoOfferItem;
  onApplyCode?: (code: string) => void;
}

export function OfferBentoCard({ offer, onApplyCode }: OfferBentoCardProps) {
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
    <div className="bg-surface-container rounded-2xl border border-white/10 overflow-hidden hover:border-primary/40 transition-all flex flex-col h-full shadow-lg group">
      {/* Top Banner Image with Gradient */}
      <div className="h-32 bg-surface-container-low relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container to-transparent z-10" />
        {offer.imageUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:scale-105 transition-transform duration-500"
            style={{ backgroundImage: `url(${offer.imageUrl})` }}
          />
        )}
        <div className="absolute top-3 left-3 z-20">
          <span className="bg-[#1A3D24] text-[#81C784] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-[#81C784]/30">
            Active
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex flex-col flex-grow relative z-20 -mt-6 space-y-3">
        <div className="bg-surface-container-high w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 shadow-lg text-primary">
          <Sparkles className="h-5 w-5" />
        </div>

        <div>
          <h4 className="font-bold text-sm text-on-surface font-headline">
            {offer.title}
          </h4>
          <div className="text-2xl font-extrabold text-primary font-headline mt-0.5">
            {offer.discountBadge}
          </div>
          <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">
            {offer.description}
          </p>
        </div>

        {/* Footer Code Strip */}
        <div className="mt-auto pt-3 border-t border-white/5 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-on-surface-variant">Code</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs text-on-surface bg-surface-container-low px-2 py-1 rounded border border-white/10">
                {offer.code}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 text-on-surface-variant hover:text-primary transition-colors"
                title="Copy"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] text-on-surface-variant pt-1">
            <span>{offer.minOrder ? `Min ₹${offer.minOrder}` : "No Minimum"}</span>
            <span>{offer.expiryDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FlashSaleNotificationCard() {
  const [notified, setNotified] = useState(false);

  return (
    <div className="bg-surface-container-low rounded-2xl border border-dashed border-white/15 flex flex-col items-center justify-center p-6 text-center hover:border-primary/50 transition-all shadow-inner">
      <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary mb-3">
        <Bell className="h-6 w-6" />
      </div>
      <h4 className="font-bold text-sm text-on-surface font-headline mb-1">
        More Offers Incoming
      </h4>
      <p className="text-xs text-on-surface-variant max-w-[220px] leading-relaxed">
        Turn on alerts to catch seasonal studio flash sales and weekend coupons.
      </p>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setNotified(true)}
        className="mt-4 text-xs font-semibold"
      >
        {notified ? "Alerts Active" : "Notify Me"}
      </Button>
    </div>
  );
}
