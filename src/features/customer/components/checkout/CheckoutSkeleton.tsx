import React from "react";

export function CheckoutSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="h-8 w-56 bg-surface-container rounded-lg animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          <div className="h-36 bg-surface-container rounded-2xl animate-pulse" />
          <div className="h-32 bg-surface-container rounded-2xl animate-pulse" />
          <div className="h-32 bg-surface-container rounded-2xl animate-pulse" />
        </div>
        <div className="lg:col-span-4">
          <div className="h-72 bg-surface-container rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
