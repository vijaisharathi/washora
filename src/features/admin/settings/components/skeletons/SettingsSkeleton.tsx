import React from "react";

export function SettingsOverviewSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 h-44"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 h-64"
          />
        ))}
      </div>
    </div>
  );
}

export function SettingsFormSkeleton() {
  return (
    <div className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 animate-pulse space-y-6">
      <div className="h-6 bg-surface-container-high rounded w-1/4" />
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-surface-container-high rounded w-1/6" />
            <div className="h-11 bg-surface-container-high rounded w-full" />
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20">
        <div className="h-10 bg-surface-container-high rounded w-24" />
        <div className="h-10 bg-surface-container-high rounded w-32" />
      </div>
    </div>
  );
}

export function SettingsTableSkeleton() {
  return (
    <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 animate-pulse space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="h-5 bg-surface-container-high rounded w-1/4" />
        <div className="h-9 bg-surface-container-high rounded w-36" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-12 bg-surface-container rounded-xl w-full" />
        ))}
      </div>
    </div>
  );
}
