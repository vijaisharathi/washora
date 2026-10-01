import React from "react";

export function BookingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="h-6 w-48 bg-surface-container rounded-lg animate-pulse" />
      <div className="h-3 w-full bg-surface-container rounded-full animate-pulse" />
      <div className="bg-surface-container rounded-2xl p-8 space-y-4 animate-pulse">
        <div className="h-14 w-full bg-surface-container-high rounded-xl" />
        <div className="h-28 w-full bg-surface-container-high rounded-xl" />
        <div className="h-10 w-36 bg-surface-container-high rounded-lg self-end" />
      </div>
    </div>
  );
}
