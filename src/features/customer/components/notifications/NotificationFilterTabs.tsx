"use client";

import React from "react";
import { NotificationCategory } from "@/types/customer/notifications";

interface NotificationFilterTabsProps {
  selectedCategory: NotificationCategory;
  onSelectCategory: (cat: NotificationCategory) => void;
}

const TABS: { id: NotificationCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "orders", label: "Orders" },
  { id: "offers", label: "Offers" },
  { id: "payments", label: "Payments" },
  { id: "reviews", label: "Reviews" },
  { id: "system", label: "System" },
];

export function NotificationFilterTabs({
  selectedCategory,
  onSelectCategory,
}: NotificationFilterTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {TABS.map((tab) => {
        const isSelected = selectedCategory === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectCategory(tab.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              isSelected
                ? "bg-primary text-on-primary shadow-md shadow-primary/20"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface border border-white/5"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
