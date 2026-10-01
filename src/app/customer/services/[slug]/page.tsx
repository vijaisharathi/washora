"use client";

import React from "react";
import Link from "next/link";
import { useCategory, useServices } from "@/features/customer/hooks/useCustomer";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { Clock, ArrowRight, ArrowLeft, Sparkles, ShieldCheck } from "lucide-react";

export default function CategoryDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { data: category, isLoading: isCatLoading } = useCategory(params.slug);
  const {
    data: services = [],
    isLoading: isSrvLoading,
    isError,
    refetch,
  } = useServices({ categorySlug: params.slug });

  if (isCatLoading || isSrvLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <LoadingSkeleton className="h-6 w-48 rounded" />
        <LoadingSkeleton className="h-44 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <LoadingSkeleton className="h-60 rounded-2xl" />
          <LoadingSkeleton className="h-60 rounded-2xl" />
          <LoadingSkeleton className="h-60 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !category) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <ErrorState
          title="Category Not Found"
          message="The requested specialty care department does not exist."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
        <Link href="/customer" className="hover:text-primary transition-colors">
          Home
        </Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <Link href="/customer/services" className="hover:text-primary transition-colors">
          Services
        </Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-primary font-semibold">{category.name}</span>
      </nav>

      {/* Category Hero Banner */}
      <div className="bg-surface-container border border-white/10 rounded-2xl p-6 sm:p-10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-container/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Specialty Department</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-on-surface font-headline tracking-tight">
            {category.name}
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            {category.description}
          </p>
          <div className="flex items-center gap-4 pt-2 text-xs text-on-surface-variant">
            <span className="flex items-center gap-1.5 text-green-400">
              <ShieldCheck className="h-4 w-4" /> Certified Master Cleaners
            </span>
            <span>•</span>
            <span>Starts at ₹{category.startingPrice}</span>
          </div>
        </div>
      </div>

      {/* Treatments Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface font-headline">
          Available Treatments &amp; Care Options
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv) => (
            <div
              key={srv.id}
              className="bg-surface-container border border-white/10 rounded-2xl p-5 flex flex-col justify-between hover:border-primary/40 hover:bg-surface-container-high transition-all shadow-xl group"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] uppercase tracking-wider font-bold">
                    {srv.unit}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-on-surface-variant font-medium">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span>24-48 hrs</span>
                  </span>
                </div>

                <h3 className="font-bold text-base text-on-surface group-hover:text-primary transition-colors">
                  {srv.name}
                </h3>
                <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                  {srv.description}
                </p>
              </div>

              <div className="flex justify-between items-center pt-5 mt-4 border-t border-white/5">
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block">
                    Starting at
                  </span>
                  <span className="text-lg font-bold text-on-surface">₹{srv.basePrice}</span>
                </div>

                <Link href={`/customer/booking?serviceId=${srv.id}`}>
                  <Button size="sm" className="gap-1.5 font-semibold text-xs shadow-md">
                    <span>Book Service</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
