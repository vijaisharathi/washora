import React from "react";

export function OffersSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-48 bg-surface-container rounded-lg animate-pulse" />
        <div className="h-4 w-72 bg-surface-container rounded-lg animate-pulse" />
      </div>

      <div className="h-64 w-full bg-surface-container rounded-2xl animate-pulse" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-72 bg-surface-container rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
