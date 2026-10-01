"use client";

import React from "react";
import { CheckCircle2, Navigation, Clock, Sparkles } from "lucide-react";
import { DeliveryHistorySummary } from "@/types/delivery-partner";

interface HistoryHeroCardProps {
  summary: DeliveryHistorySummary;
}

export function HistoryHeroCard({ summary }: HistoryHeroCardProps) {
  return (
    <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-surface-container-high via-surface-container to-surface border border-outline-variant/30 shadow-xl space-y-6">
      <div className="space-y-1 border-b border-outline-variant/20 pb-4">
        <span className="text-[10px] uppercase font-bold text-primary bg-primary/15 px-2 py-0.5 rounded border border-primary/25">
          Valet Historical Archive
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">
          Delivery & Trip History
        </h1>
        <p className="text-xs text-on-surface-variant">
          Complete historical audit log of fulfilled doorsteps, hub transfers, and past runs.
        </p>
      </div>

      {/* 4-Stat Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-4 rounded-2xl bg-surface/80 border border-outline-variant/15 space-y-1">
          <span className="text-[10px] uppercase font-bold text-on-surface-variant flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Fulfilled Trips
          </span>
          <p className="text-xl md:text-2xl font-mono font-extrabold text-on-surface">
            {summary.totalCompletedTrips}
          </p>
          <span className="text-[10px] text-emerald-400 font-semibold">100% verified</span>
        </div>

        <div className="p-4 rounded-2xl bg-surface/80 border border-outline-variant/15 space-y-1">
          <span className="text-[10px] uppercase font-bold text-on-surface-variant flex items-center gap-1">
            <Navigation className="w-3 h-3 text-primary" /> Total Distance
          </span>
          <p className="text-xl md:text-2xl font-mono font-extrabold text-on-surface">
            {summary.totalDistanceKm} km
          </p>
          <span className="text-[10px] text-on-surface-variant font-mono">Across Bengaluru</span>
        </div>

        <div className="p-4 rounded-2xl bg-surface/80 border border-outline-variant/15 space-y-1">
          <span className="text-[10px] uppercase font-bold text-on-surface-variant flex items-center gap-1">
            <Clock className="w-3 h-3 text-purple-400" /> On-Time SLA
          </span>
          <p className="text-xl md:text-2xl font-mono font-extrabold text-purple-300">
            {summary.onTimeRate}%
          </p>
          <span className="text-[10px] text-on-surface-variant font-mono">Top tier tier-1</span>
        </div>

        <div className="p-4 rounded-2xl bg-surface/80 border border-outline-variant/15 space-y-1">
          <span className="text-[10px] uppercase font-bold text-on-surface-variant flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Lifetime Earned
          </span>
          <p className="text-xl md:text-2xl font-mono font-extrabold text-amber-400">
            ₹{summary.totalHistoricalEarnings}
          </p>
          <span className="text-[10px] text-on-surface-variant font-mono">Full payout record</span>
        </div>
      </div>
    </div>
  );
}
