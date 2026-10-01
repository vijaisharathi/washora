"use client";

import React, { useState } from "react";
import { Search, ChevronDown, ChevronUp, HelpCircle, X } from "lucide-react";
import { SupportFaqItem } from "@/types/delivery-partner";

interface FaqAccordionSectionProps {
  faqs: SupportFaqItem[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function FaqAccordionSection({
  faqs,
  searchQuery,
  onSearchChange,
}: FaqAccordionSectionProps) {
  const [openId, setOpenId] = useState<string | null>("faq-01");

  return (
    <div className="p-6 rounded-3xl bg-surface-container/80 border border-outline-variant/25 space-y-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/15 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-on-surface">Valet Knowledgebase & FAQs</h2>
            <p className="text-[11px] text-on-surface-variant">Instant answers to frequent valet operational questions</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-8 py-2 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-2.5 text-on-surface-variant hover:text-on-surface"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-2.5">
        {faqs.length === 0 ? (
          <p className="text-xs text-on-surface-variant py-4 text-center">
            No matching questions found for &ldquo;{searchQuery}&rdquo;.
          </p>
        ) : (
          faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="rounded-2xl border border-outline-variant/20 overflow-hidden bg-surface transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full p-4 flex items-center justify-between text-left text-xs font-bold text-on-surface hover:text-primary transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-semibold">
                      {faq.category}
                    </span>
                    <span>{faq.question}</span>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-primary shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-on-surface-variant shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-on-surface-variant leading-relaxed border-t border-outline-variant/10 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
