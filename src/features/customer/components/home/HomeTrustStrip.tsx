"use client";

import React from "react";
import { ShieldCheck, Truck, Sparkles, Clock } from "lucide-react";

export function HomeTrustStrip() {
  const guarantees = [
    {
      icon: Truck,
      title: "Doorstep Pickup & Delivery",
      description: "Scheduled time-slot convenience by verified valets.",
    },
    {
      icon: Sparkles,
      title: "Master Studio Care",
      description: "Non-toxic, garment-safe, and eco-certified treatments.",
    },
    {
      icon: Clock,
      title: "24h Express Available",
      description: "Swift same-day or 24-hour turnaround on priority orders.",
    },
    {
      icon: ShieldCheck,
      title: "Damage & Loss Protection",
      description: "Comprehensive coverage on every item from pickup to delivery.",
    },
  ];

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-surface-card p-6 sm:p-8 shadow-card">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {guarantees.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary-light border border-primary/20 shrink-0">
                <Icon className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
