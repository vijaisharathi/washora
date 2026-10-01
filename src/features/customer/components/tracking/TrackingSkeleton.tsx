import React from "react";

export function TrackingSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="h-8 w-64 bg-surface-container rounded-lg animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <div className="h-96 bg-surface-container rounded-2xl animate-pulse" />
        </div>
        <div className="lg:col-span-8 space-y-6">
          <div className="h-44 bg-surface-container rounded-2xl animate-pulse" />
          <div className="h-28 bg-surface-container rounded-2xl animate-pulse" />
          <div className="h-16 bg-surface-container rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
