import React from "react";

export function ConfirmationSkeleton() {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-full bg-surface-container animate-pulse" />
        <div className="h-8 w-64 bg-surface-container rounded-lg animate-pulse" />
        <div className="h-4 w-96 bg-surface-container rounded-lg animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-40 bg-surface-container rounded-2xl animate-pulse" />
        <div className="h-40 bg-surface-container rounded-2xl animate-pulse" />
        <div className="h-36 bg-surface-container rounded-2xl md:col-span-2 animate-pulse" />
      </div>
    </div>
  );
}
