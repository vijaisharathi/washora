import React from "react";

export function ProviderDiscoverySkeleton() {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-surface-container rounded-2xl border border-white/10 p-5 space-y-3 animate-pulse"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-surface-container-high shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-1/2 bg-surface-container-high rounded" />
              <div className="h-3 w-3/4 bg-surface-container-high rounded" />
            </div>
          </div>
          <div className="h-3 w-1/3 bg-surface-container-high rounded" />
        </div>
      ))}
    </div>
  );
}

export function ProviderDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="h-6 w-48 bg-surface-container rounded-lg animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="h-64 w-full bg-surface-container rounded-2xl animate-pulse" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32 bg-surface-container rounded-2xl animate-pulse" />
            <div className="h-32 bg-surface-container rounded-2xl animate-pulse" />
          </div>
        </div>
        <div className="lg:col-span-4 space-y-6">
          <div className="h-64 bg-surface-container rounded-2xl animate-pulse" />
          <div className="h-48 bg-surface-container rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
