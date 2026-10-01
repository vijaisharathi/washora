import React from "react";

export function SupportSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="space-y-3">
        <div className="h-8 w-64 bg-surface-container rounded-lg animate-pulse" />
        <div className="h-4 w-96 bg-surface-container rounded-lg animate-pulse" />
        <div className="h-12 w-full max-w-2xl bg-surface-container rounded-xl animate-pulse" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-surface-container rounded-2xl animate-pulse" />
        ))}
      </div>

      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 bg-surface-container rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
