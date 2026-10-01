"use client";

import React from "react";
import { Search, X, Filter } from "lucide-react";
import { HistoryFilterParams, DeliveryHistoryOutcome } from "@/types/delivery-partner";

interface HistoryFilterBarProps {
  filter: HistoryFilterParams;
  onChange: (filter: HistoryFilterParams) => void;
}

export function HistoryFilterBar({ filter, onChange }: HistoryFilterBarProps) {
  const tabs: { label: string; value: HistoryFilterParams["outcome"] }[] = [
    { label: "All History", value: "ALL" },
    { label: "Delivered", value: "DELIVERED" },
    { label: "Picked Up", value: "PICKED_UP" },
    { label: "Failed / Cancelled", value: "FAILED" },
  ];

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-on-surface-variant" />
        <input
          type="text"
          placeholder="Search by Order #, Customer, Location or Seal Barcode..."
          value={filter.searchQuery || ""}
          onChange={(e) => onChange({ ...filter, searchQuery: e.target.value })}
          className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-surface-container border border-outline-variant/30 text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary"
        />
        {filter.searchQuery && (
          <button
            onClick={() => onChange({ ...filter, searchQuery: "" })}
            className="absolute right-3 top-3 text-on-surface-variant hover:text-on-surface"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {tabs.map((tab) => {
          const isActive = (filter.outcome || "ALL") === tab.value;
          return (
            <button
              key={tab.label}
              onClick={() => onChange({ ...filter, outcome: tab.value })}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
