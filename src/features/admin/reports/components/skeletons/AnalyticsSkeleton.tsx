import React from "react";

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 pb-6 border-b border-outline-variant/20">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-surface-container-high rounded-lg" />
          <div className="h-4 w-72 bg-surface-container rounded-md" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-32 bg-surface-container-high rounded-xl" />
          <div className="h-9 w-24 bg-surface-container-high rounded-xl" />
        </div>
      </div>

      {/* KPI Skeleton Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-3"
          >
            <div className="h-4 w-24 bg-surface-container-high rounded" />
            <div className="h-8 w-36 bg-surface-container-high rounded" />
            <div className="h-4 w-28 bg-surface-container rounded" />
          </div>
        ))}
      </div>

      {/* Charts Skeleton Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 h-72">
          <div className="h-5 w-48 bg-surface-container-high rounded mb-4" />
          <div className="w-full h-48 bg-surface-container rounded-xl" />
        </div>
        <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 h-72">
          <div className="h-5 w-36 bg-surface-container-high rounded mb-4" />
          <div className="w-full h-48 bg-surface-container rounded-xl" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-4">
        <div className="h-5 w-40 bg-surface-container-high rounded" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="h-10 w-full bg-surface-container rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
