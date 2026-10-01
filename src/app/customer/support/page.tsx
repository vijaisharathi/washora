"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSupport } from "@/features/customer/hooks/useSupport";
import { SupportHeroHeader } from "@/features/customer/components/support/SupportHeroHeader";
import { SupportCategoryCards } from "@/features/customer/components/support/SupportCategoryCards";
import { SupportFaqAccordion } from "@/features/customer/components/support/SupportFaqAccordion";
import { SupportSkeleton } from "@/features/customer/components/support/SupportSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { AlertCircle, HelpCircle, MessageSquare, ArrowRight, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CustomerSupportPage() {
  const { faqs, categories, userTickets, isLoading } = useSupport();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (isLoading) {
    return <SupportSkeleton />;
  }

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === null || faq.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-10 pb-24 animate-in fade-in zoom-in-95 duration-200">
      {/* Hero Header & Search matching Stitch anything_clean_help_support_center */}
      <SupportHeroHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Service Issue Report Banner */}
      <section className="bg-gradient-to-r from-primary/15 via-surface-container to-surface-container border border-primary/30 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0 border border-primary/30">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div className="space-y-0.5">
            <h3 className="font-bold text-sm sm:text-base text-on-surface font-headline">
              Having trouble with a recent booking?
            </h3>
            <p className="text-xs text-on-surface-variant">
              Report damaged items, missing clothes, or pickup delays for priority resolution.
            </p>
          </div>
        </div>

        <Link href="/customer/support/report-issue" className="w-full sm:w-auto shrink-0">
          <Button size="sm" className="w-full sm:w-auto gap-2 text-xs font-semibold shadow-lg shadow-primary/20">
            <span>Report an Issue</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </section>

      {/* Help Categories */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-on-surface font-headline">
            Browse by Topic
          </h2>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-xs text-primary hover:underline font-semibold"
            >
              Clear Filter
            </button>
          )}
        </div>

        <SupportCategoryCards
          categories={categories}
          onSelectCategory={(catId) =>
            setSelectedCategory(selectedCategory === catId ? null : catId)
          }
        />
      </section>

      {/* Frequently Asked Questions */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-on-surface font-headline">
            Frequently Asked Questions
          </h2>
        </div>

        {filteredFaqs.length === 0 ? (
          <div className="bg-surface-container rounded-2xl border border-white/10 p-8 text-center space-y-2">
            <p className="text-sm font-bold text-on-surface">No matching FAQs found</p>
            <p className="text-xs text-on-surface-variant">
              Try searching with different terms or report an issue directly.
            </p>
          </div>
        ) : (
          <SupportFaqAccordion faqs={filteredFaqs} />
        )}
      </section>

      {/* Recent Tickets Section (if customer submitted tickets in this session) */}
      {userTickets.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-on-surface font-headline">
            My Recent Support Requests
          </h2>

          <div className="space-y-3">
            {userTickets.map((t) => (
              <div
                key={t.id}
                className="bg-surface-container rounded-xl border border-white/10 p-4 flex items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-primary">{t.ticketNumber}</span>
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold">
                      {t.issueLabel}
                    </span>
                  </div>
                  <p className="text-on-surface-variant truncate max-w-md">{t.description}</p>
                </div>

                <span className="bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0">
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
