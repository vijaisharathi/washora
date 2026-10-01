"use client";

import React, { useState } from "react";
import { FaqItemData } from "@/types/customer/support";
import { ChevronDown } from "lucide-react";

interface SupportFaqAccordionProps {
  faqs: FaqItemData[];
}

export function SupportFaqAccordion({ faqs }: SupportFaqAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id || null);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-3">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;

        return (
          <div
            key={faq.id}
            className="bg-surface-container rounded-2xl border border-white/10 overflow-hidden shadow-md transition-colors hover:border-white/20"
          >
            <button
              type="button"
              onClick={() => toggle(faq.id)}
              className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
            >
              <h3 className="font-bold text-xs sm:text-sm text-on-surface font-headline">
                {faq.question}
              </h3>
              <ChevronDown
                className={`h-4 w-4 text-on-surface-variant transition-transform shrink-0 ${
                  isOpen ? "rotate-180 text-primary" : ""
                }`}
              />
            </button>

            {isOpen && (
              <div className="px-5 pb-5 pt-1 text-xs text-on-surface-variant leading-relaxed border-t border-white/5 bg-surface-container-low/40 animate-in fade-in duration-150">
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
