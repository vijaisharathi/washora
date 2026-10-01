"use client";

import React, { useState } from "react";
import { ProviderFaqItem, ProviderSupportCategory } from "@/types/provider/support";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

interface SupportFaqSectionProps {
  faqs: ProviderFaqItem[];
  selectedCategory?: ProviderSupportCategory;
  onSelectCategory: (cat?: ProviderSupportCategory) => void;
}

const CATEGORIES: { id?: ProviderSupportCategory; label: string }[] = [
  { label: "All Topics" },
  { id: "PAYMENTS", label: "Payments & Payouts" },
  { id: "ORDERS", label: "Garment Processing" },
  { id: "BOOKINGS", label: "Intake & Capacity" },
  { id: "ONBOARDING", label: "Compliance" },
];

export function SupportFaqSection({
  faqs,
  selectedCategory,
  onSelectCategory,
}: SupportFaqSectionProps) {
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(faqs[0]?.id || null);

  const toggleFaq = (id: string) => {
    setExpandedFaqId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.label}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
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

      {/* Accordion list */}
      <div className="space-y-3">
        {faqs.map((faq) => {
          const isExpanded = expandedFaqId === faq.id;
          return (
            <ProviderCard
              key={faq.id}
              variant="container"
              className="p-4 md:p-5 transition-all hover:border-primary/40 cursor-pointer"
              onClick={() => toggleFaq(faq.id)}
            >
              <div className="flex items-center justify-between gap-4">
                <h4 className="text-xs md:text-sm font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">
                    help_outline
                  </span>
                  <span>{faq.question}</span>
                </h4>
                <span
                  className={`material-symbols-outlined text-on-surface-variant transition-transform duration-200 text-[20px] ${
                    isExpanded ? "rotate-180 text-primary" : ""
                  }`}
                >
                  expand_more
                </span>
              </div>

              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-white/5 text-xs text-on-surface-variant leading-relaxed pl-6 animate-in fade-in duration-150">
                  {faq.answer}
                </div>
              )}
            </ProviderCard>
          );
        })}
      </div>
    </div>
  );
}
