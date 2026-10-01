"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles } from "lucide-react";
import { GlobalSearchModal } from "@/components/discovery/GlobalSearchModal";

export function HomeSearchBar() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  const quickPills = [
    { label: "Sneaker Care", query: "sneaker" },
    { label: "Dry Clean", query: "dry clean" },
    { label: "Silk Sarees", query: "saree" },
    { label: "Riding Helmets", query: "helmet" },
    { label: "Car Wash", query: "car" },
    { label: "Leather Bags", query: "bag" },
  ];

  return (
    <div className="space-y-3 w-full">
      {/* Prominent Tap Target Search Bar */}
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="w-full h-12 sm:h-14 pl-12 pr-4 rounded-2xl bg-surface-card hover:bg-surface-container border border-white/[0.08] hover:border-primary/40 text-xs sm:text-sm text-left text-slate-400 flex items-center relative transition-all group shadow-card"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-light group-hover:scale-110 transition-transform" />
        <span className="truncate">Search services, shoe restoration, dry cleaning...</span>
        <span className="ml-auto hidden sm:inline-block text-[11px] text-slate-400 bg-white/[0.06] px-2.5 py-1 rounded-lg border border-white/10 font-medium">
          Search
        </span>
      </button>

      {/* Quick Search Tag Rails */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex-shrink-0 flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-primary-light" />
          Trending:
        </span>
        {quickPills.map((pill, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => router.push(`/customer/services?q=${encodeURIComponent(pill.query)}`)}
            className="px-3 py-1 rounded-full bg-surface-card hover:bg-surface-container border border-white/[0.06] hover:border-primary/30 text-xs text-slate-300 hover:text-white transition-colors flex-shrink-0"
          >
            {pill.label}
          </button>
        ))}
      </div>

      <GlobalSearchModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
