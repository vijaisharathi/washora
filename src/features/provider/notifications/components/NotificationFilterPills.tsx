"use client";

import React from "react";
import { ProviderNotificationCategory } from "@/types/provider/notifications";

interface NotificationFilterPillsProps {
  activeCategory: ProviderNotificationCategory;
  onSelectCategory: (category: ProviderNotificationCategory) => void;
}

const CATEGORIES: { id: ProviderNotificationCategory; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "BOOKINGS", label: "Bookings" },
  { id: "ORDERS", label: "Orders" },
  { id: "PAYMENTS", label: "Payments" },
  { id: "REVIEWS", label: "Reviews" },
  { id: "ACCOUNT", label: "Account" },
];

export function NotificationFilterPills({
  activeCategory,
  onSelectCategory,
}: NotificationFilterPillsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              isActive
                ? "bg-primary text-on-primary font-bold shadow-sm shadow-primary/20"
                : "bg-surface-container border border-white/10 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
            }`}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
