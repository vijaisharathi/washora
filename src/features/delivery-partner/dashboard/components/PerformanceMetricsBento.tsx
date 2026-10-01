"use client";

import React from "react";
import {
  Award,
  ShieldCheck,
  Star,
  CheckCircle2,
  TrendingUp,
  Clock,
  Navigation,
} from "lucide-react";
import { DeliveryPartnerDashboardSummary } from "@/types/delivery-partner";

interface PerformanceMetricsBentoProps {
  metrics: DeliveryPartnerDashboardSummary["metrics"];
}

export function PerformanceMetricsBento({ metrics }: PerformanceMetricsBentoProps) {
  return (
    <div className="p-6 rounded-3xl bg-surface-container/70 border border-outline-variant/25 space-y-4">
      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-on-surface">Fleet Quality & SLA Metrics</h2>
            <p className="text-[11px] text-on-surface-variant">Real-time logistics performance score</p>
          </div>
        </div>

        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> Tier 1 Valet
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* On-Time Delivery SLA */}
        <div className="p-4 rounded-2xl bg-surface/80 border border-outline-variant/15 space-y-1">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-[10px] uppercase font-bold">On-Time SLA</span>
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-xl font-mono font-extrabold text-on-surface">
            {metrics.onTimeRate}%
          </p>
          <p className="text-[10px] text-emerald-400 font-medium">Target &gt; 95.0%</p>
        </div>

        {/* Acceptance Rate */}
        <div className="p-4 rounded-2xl bg-surface/80 border border-outline-variant/15 space-y-1">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-[10px] uppercase font-bold">Acceptance</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
          </div>
          <p className="text-xl font-mono font-extrabold text-on-surface">
            {metrics.acceptanceRate}%
          </p>
          <p className="text-[10px] text-primary font-medium">Target &gt; 90.0%</p>
        </div>

        {/* CSAT Rating */}
        <div className="p-4 rounded-2xl bg-surface/80 border border-outline-variant/15 space-y-1">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-[10px] uppercase font-bold">CSAT Score</span>
            <Star className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-xl font-mono font-extrabold text-amber-400 flex items-center gap-1">
            {metrics.customerRating} ★
          </p>
          <p className="text-[10px] text-on-surface-variant font-medium">{metrics.totalTrips} Ratings</p>
        </div>

        {/* Weekly Distance */}
        <div className="p-4 rounded-2xl bg-surface/80 border border-outline-variant/15 space-y-1">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-[10px] uppercase font-bold">Weekly Dist.</span>
            <Navigation className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <p className="text-xl font-mono font-extrabold text-on-surface">
            {metrics.weeklyDistanceKm} <span className="text-xs text-on-surface-variant">km</span>
          </p>
          <p className="text-[10px] text-purple-400 font-medium">Green EV Miles</p>
        </div>
      </div>
    </div>
  );
}
