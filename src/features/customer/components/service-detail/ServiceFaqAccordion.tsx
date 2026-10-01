"use client";

import React, { useState } from "react";
import { ServiceDetailFaq } from "@/types/customer/serviceDetail";
import { ChevronDown, HelpCircle } from "lucide-react";

interface ServiceFaqAccordionProps {
  faqs: ServiceDetailFaq[];
}

export function ServiceFaqAccordion({ faqs }: ServiceFaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="space-y-3 pt-4">
      <h4 className="font-bold text-base text-on-surface font-headline flex items-center gap-2">
        <HelpCircle className="h-4 w-4 text-primary" />
        <span>Frequently Asked Questions</span>
      </h4>

      <div className="bg-surface-container border border-white/10 rounded-2xl p-4 sm:p-6 divide-y divide-white/5 shadow-lg">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={i} className="py-3 first:pt-0 last:pb-0">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-bold text-on-surface hover:text-primary transition-colors py-1 cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`h-4 w-4 text-primary shrink-0 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <p className="text-xs text-on-surface-variant leading-relaxed pt-2">
                  {faq.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
