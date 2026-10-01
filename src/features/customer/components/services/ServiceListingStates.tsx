"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SearchX, MapPinOff, WifiOff, RefreshCw, Compass } from "lucide-react";

export function ServiceLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-surface-container rounded-2xl border border-white/10 overflow-hidden flex flex-col p-4 space-y-4"
        >
          <div className="h-44 w-full rounded-xl bg-surface-container-high animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-3/4 bg-surface-container-high rounded animate-pulse" />
            <div className="h-3 w-1/2 bg-surface-container-high rounded animate-pulse" />
          </div>
          <div className="h-8 w-28 bg-surface-container-high rounded-lg animate-pulse self-end" />
        </div>
      ))}
    </div>
  );
}

export function ServiceEmptyState({ onResetFilters }: { onResetFilters: () => void }) {
  return (
    <div className="bg-surface-container rounded-2xl border border-white/10 p-10 sm:p-16 text-center flex flex-col items-center justify-center space-y-4 shadow-xl">
      <div className="w-16 h-16 rounded-full bg-surface-container-high border border-white/10 flex items-center justify-center text-on-surface-variant shadow-inner">
        <SearchX className="h-8 w-8 text-on-surface-variant/70" />
      </div>
      <div className="space-y-1">
        <h3 className="font-bold text-lg text-on-surface font-headline">No services found</h3>
        <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed">
          We couldn&apos;t find any services matching your current filters or search query.
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={onResetFilters} className="mt-2">
        Clear All Filters
      </Button>
    </div>
  );
}

export function ServiceGeofenceState({ locationName }: { locationName: string }) {
  return (
    <div className="bg-surface-container rounded-2xl border border-primary/20 p-10 sm:p-16 text-center flex flex-col items-center justify-center space-y-4 shadow-xl relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
      <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
        <MapPinOff className="h-8 w-8" />
      </div>
      <div className="space-y-1 z-10">
        <h3 className="font-bold text-lg text-on-surface font-headline">
          Not available in {locationName}
        </h3>
        <p className="text-xs text-on-surface-variant max-w-md mx-auto leading-relaxed">
          We are rapidly expanding our artisan workshop network, but our doorstep pickup fleet hasn&apos;t reached this neighborhood yet.
        </p>
      </div>
      <Link href="/customer/location" className="z-10">
        <Button size="sm" className="gap-2 font-semibold">
          <Compass className="h-4 w-4" />
          <span>Change Delivery Location</span>
        </Button>
      </Link>
    </div>
  );
}

export function ServiceErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="bg-surface-container rounded-2xl border border-error/30 p-10 sm:p-14 text-center flex flex-col items-center justify-center space-y-4 shadow-xl">
      <div className="w-16 h-16 rounded-full bg-error-container/20 border border-error/30 flex items-center justify-center text-error">
        <WifiOff className="h-8 w-8" />
      </div>
      <div className="space-y-1">
        <h3 className="font-bold text-lg text-error font-headline">Something went wrong</h3>
        <p className="text-xs text-on-surface-variant max-w-md mx-auto leading-relaxed">
          We couldn&apos;t retrieve the service catalog due to a temporary network interruption. Please check your connection.
        </p>
      </div>
      <Button size="sm" onClick={onRetry} className="gap-2">
        <RefreshCw className="h-3.5 w-3.5" />
        <span>Try Again</span>
      </Button>
    </div>
  );
}
