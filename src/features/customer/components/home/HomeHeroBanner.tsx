"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HomePromotion } from "@/types/customer/home";
import { ArrowRight, Sparkles, Copy, Check } from "lucide-react";

interface HomeHeroBannerProps {
  promotions?: HomePromotion[];
}

export function HomeHeroBanner({ promotions }: HomeHeroBannerProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const promo = promotions?.[0];

  const handleCopyCode = (code: string) => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 3000);
    }
  };

  return (
    <section className="relative rounded-3xl overflow-hidden border border-white/[0.08] min-h-[300px] sm:min-h-[360px] flex flex-col justify-end p-6 sm:p-10 md:p-12 shadow-card group">
      {/* Immersive Photography Background with Dark Vignette */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1545127398-14699f92334b?q=80&w=1600&auto=format&fit=crop')`,
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 max-w-2xl space-y-3 sm:space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-primary/20 text-primary-light border border-primary/30 backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{promo?.discountBadge || "DOORSTEP PICKUP & RESTORATION"}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white font-headline tracking-tight leading-tight">
          Fresh clothes. <br />
          <span className="text-primary-light">Fresh start.</span>
        </h1>

        <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed max-w-lg">
          {promo?.subtitle ||
            "Professional care and restoration, picked up directly from your doorstep and returned pristine."}
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href={promo?.ctaUrl || "/customer/services"}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold transition-all shadow-glow group/btn"
          >
            <span>{promo?.ctaText || "Explore Services"}</span>
            <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </Link>

          {promo?.code && (
            <button
              type="button"
              onClick={() => handleCopyCode(promo.code)}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-surface-card hover:bg-surface-container border border-white/10 hover:border-primary/40 text-xs font-medium text-slate-200 transition-all cursor-pointer"
            >
              <span className="text-slate-400">Code:</span>
              <span className="font-mono font-bold text-white tracking-wider">
                {promo.code}
              </span>
              {copiedCode === promo.code ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-slate-400" />
              )}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
