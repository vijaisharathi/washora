"use client";

import React from "react";
import { IssueCategoryOption, IssueCategoryType } from "@/types/customer/support";
import { CheckCircle2 } from "lucide-react";

interface IssueCategorySelectorProps {
  categories: IssueCategoryOption[];
  selectedCategory: IssueCategoryType;
  onSelectCategory: (category: IssueCategoryType) => void;
}

export function IssueCategorySelector({
  categories,
  selectedCategory,
  onSelectCategory,
}: IssueCategorySelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat.id;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={`rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative overflow-hidden border shadow-lg ${
              isSelected
                ? "border-2 border-primary bg-primary/10 shadow-primary/10"
                : cat.isUrgent
                ? "bg-surface-container border-red-500/40 hover:border-red-500"
                : "bg-surface-container border-white/10 hover:border-primary/40 hover:bg-surface-container-high"
            }`}
          >
            {/* Red top bar for urgent categories like Damaged Item */}
            {cat.isUrgent && (
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
            )}

            {/* Selected Checkmark */}
            {isSelected && (
              <div className="absolute top-2.5 right-2.5 text-primary">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            )}

            <div
              className={`mb-3 text-3xl ${
                cat.isUrgent
                  ? "text-red-400"
                  : isSelected
                  ? "text-primary"
                  : "text-on-surface-variant"
              }`}
            >
              <span className="material-symbols-outlined text-[32px]">
                {cat.iconName}
              </span>
            </div>

            <span
              className={`text-xs font-bold font-headline ${
                isSelected ? "text-primary" : "text-on-surface"
              }`}
            >
              {cat.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
