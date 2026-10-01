import React from "react";

export function NotificationSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-surface-container rounded-lg animate-pulse" />
          <div className="h-4 w-72 bg-surface-container rounded-lg animate-pulse" />
        </div>
        <div className="h-9 w-32 bg-surface-container rounded-lg animate-pulse" />
      </div>

      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-20 bg-surface-container rounded-full animate-pulse" />
        ))}
      </div>

      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-surface-container rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
