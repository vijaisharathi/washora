import React from "react";

export function ReviewSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto p-6 sm:p-12 space-y-6">
      <div className="h-8 w-64 bg-surface-container rounded-lg animate-pulse mx-auto" />
      <div className="h-24 bg-surface-container rounded-2xl animate-pulse" />
      <div className="h-40 bg-surface-container rounded-2xl animate-pulse" />
      <div className="h-12 w-48 bg-surface-container rounded-xl animate-pulse mx-auto" />
    </div>
  );
}
