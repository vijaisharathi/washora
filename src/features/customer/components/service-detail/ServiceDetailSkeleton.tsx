import React from "react";

export function ServiceDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="h-6 w-64 bg-surface-container rounded-lg animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="w-full aspect-video bg-surface-container rounded-2xl animate-pulse" />
          <div className="h-8 w-3/4 bg-surface-container rounded-lg animate-pulse" />
          <div className="h-20 w-full bg-surface-container rounded-xl animate-pulse" />
          <div className="grid grid-cols-4 gap-4">
            <div className="h-24 bg-surface-container rounded-xl animate-pulse" />
            <div className="h-24 bg-surface-container rounded-xl animate-pulse" />
            <div className="h-24 bg-surface-container rounded-xl animate-pulse" />
            <div className="h-24 bg-surface-container rounded-xl animate-pulse" />
          </div>
        </div>
        <div className="lg:col-span-4">
          <div className="h-96 bg-surface-container rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
