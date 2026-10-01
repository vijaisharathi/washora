"use client";

import React from "react";
import { Search, X, Bell, ClipboardList, Navigation, Wallet, AlertTriangle } from "lucide-react";
import {
  NotificationFilterParams,
  DeliveryPartnerNotificationCategory,
} from "@/types/delivery-partner";

interface NotificationFilterBarProps {
  filter: NotificationFilterParams;
  onChange: (filter: NotificationFilterParams) => void;
}

export function NotificationFilterBar({ filter, onChange }: NotificationFilterBarProps) {
  const categoryTabs: { label: string; value: NotificationFilterParams["category"] }[] = [
    { label: "All Alerts", value: "ALL" },
    { label: "Tasks", value: "TASK" },
    { label: "Deliveries", value: "DELIVERY" },
    { label: "Earnings", value: "EARNINGS" },
    { label: "Reviews", value: "REVIEW" },
    { label: "System", value: "SYSTEM" },
  ];

  const readTabs: { label: string; value: NotificationFilterParams["readStatus"] }[] = [
    { label: "All", value: "ALL" },
    { label: "Unread Only", value: "UNREAD" },
    { label: "Read", value: "READ" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search alerts by title, order #, or keyword..."
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

        {/* Read Status Sub-Filter */}
        <div className="flex items-center gap-1 bg-surface-container/80 p-1 rounded-2xl border border-outline-variant/25 text-xs">
          {readTabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => onChange({ ...filter, readStatus: tab.value })}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                (filter.readStatus || "ALL") === tab.value
                  ? "bg-surface text-on-surface border border-outline-variant/30 shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categoryTabs.map((tab) => {
          const isActive = (filter.category || "ALL") === tab.value;
          return (
            <button
              key={tab.label}
              onClick={() => onChange({ ...filter, category: tab.value })}
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
