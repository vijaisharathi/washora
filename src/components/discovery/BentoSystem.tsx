"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight, Sparkles } from "lucide-react";

/**
 * ==============================================================================
 * BENTO COMPONENT SYSTEM
 * Reusable selective Bento Layout Components for Curated Content Discovery
 * ==============================================================================
 */

export interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 w-full",
        className
      )}
    >
      {children}
    </div>
  );
}

export interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  span?: "normal" | "wide" | "tall" | "full";
  onClick?: () => void;
}

export function BentoCard({
  children,
  className,
  span = "normal",
  onClick,
}: BentoCardProps) {
  const spanClasses = {
    normal: "sm:col-span-1 lg:col-span-4",
    wide: "sm:col-span-2 lg:col-span-8",
    tall: "sm:col-span-1 lg:col-span-4 lg:row-span-2",
    full: "sm:col-span-2 lg:col-span-12",
  }[span];

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-surface-card border border-white/[0.08] hover:border-primary/40 transition-all duration-300 p-5 sm:p-6 shadow-card hover:shadow-card-hover",
        spanClasses,
        className
      )}
    >
      {children}
    </div>
  );
}

export interface FeaturedBentoCardProps {
  title: string;
  subtitle: string;
  badge?: string;
  ctaText?: string;
  ctaHref: string;
  imageUrl?: string;
  className?: string;
}

export function FeaturedBentoCard({
  title,
  subtitle,
  badge = "FEATURED RESTORATION",
  ctaText = "Explore Treatment",
  ctaHref,
  imageUrl = "https://images.unsplash.com/photo-1545127398-14699f92334b?q=80&w=1200&auto=format&fit=crop",
  className,
}: FeaturedBentoCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl lg:col-span-8 border border-white/[0.08] min-h-[260px] sm:min-h-[320px] flex flex-col justify-end p-6 sm:p-8 bg-surface-card shadow-card hover:shadow-card-hover transition-all duration-300",
        className
      )}
    >
      {/* Background Image with Dark Vignette Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
        style={{ backgroundImage: `url(${imageUrl})` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />

      {/* Content */}
      <div className="relative z-10 max-w-xl space-y-2 sm:space-y-3">
        {badge && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-primary/20 text-primary-light border border-primary/30 backdrop-blur-md">
            <Sparkles className="h-3 w-3" />
            {badge}
          </span>
        )}
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight leading-tight">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
          {subtitle}
        </p>

        <div className="pt-2">
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold transition-all shadow-glow group-hover:gap-3"
          >
            <span>{ctaText}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export interface PromoBentoCardProps {
  title: string;
  subtitle: string;
  code?: string;
  badge?: string;
  ctaText?: string;
  ctaHref: string;
  className?: string;
}

export function PromoBentoCard({
  title,
  subtitle,
  code,
  badge = "EXCLUSIVE VOUCHER",
  ctaText = "Redeem Now",
  ctaHref,
  className,
}: PromoBentoCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl lg:col-span-4 border border-primary/20 bg-gradient-to-br from-surface-card via-surface-container to-primary-container/20 p-6 flex flex-col justify-between shadow-card hover:shadow-card-hover transition-all duration-300",
        className
      )}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-primary/20 text-primary-light border border-primary/30">
            {badge}
          </span>
          {code && (
            <span className="text-xs font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded border border-white/10">
              {code}
            </span>
          )}
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
          {title}
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          {subtitle}
        </p>
      </div>

      <div className="pt-4">
        <Link
          href={ctaHref}
          className="inline-flex items-center justify-center w-full gap-2 px-4 py-2.5 rounded-xl bg-surface-hover hover:bg-primary/20 border border-white/10 hover:border-primary/40 text-xs font-semibold text-white transition-all"
        >
          <span>{ctaText}</span>
          <ArrowRight className="h-3.5 w-3.5 text-primary-light" />
        </Link>
      </div>
    </div>
  );
}

export interface CompactBentoCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
  className?: string;
}

export function CompactBentoCard({
  icon,
  title,
  description,
  href,
  className,
}: CompactBentoCardProps) {
  const content = (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-surface-card border border-white/[0.08] hover:border-primary/40 p-4 sm:p-5 flex items-start gap-4 transition-all duration-300 shadow-card hover:shadow-card-hover",
        href && "cursor-pointer",
        className
      )}
    >
      <div className="p-2.5 rounded-xl bg-primary/10 text-primary-light border border-primary/20 group-hover:scale-105 transition-transform flex-shrink-0">
        {icon}
      </div>
      <div className="space-y-1 min-w-0 flex-1">
        <h4 className="text-sm font-semibold text-white truncate">{title}</h4>
        <p className="text-xs text-slate-400 line-clamp-2">{description}</p>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
