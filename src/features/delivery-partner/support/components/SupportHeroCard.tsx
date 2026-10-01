"use client";

import React from "react";
import { PhoneCall, ShieldAlert, Plus, HelpCircle, Radio, Clock } from "lucide-react";

interface SupportHeroCardProps {
  onRaiseTicket: () => void;
}

export function SupportHeroCard({ onRaiseTicket }: SupportHeroCardProps) {
  return (
    <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-surface-container-high via-surface-container to-surface border border-outline-variant/30 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/20 pb-5">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold text-primary bg-primary/15 px-2 py-0.5 rounded border border-primary/25 flex items-center gap-1 w-fit">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> 24/7 Operations Desk Active
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">
            Valet Support & Help Desk
          </h1>
          <p className="text-xs text-on-surface-variant">
            Knowledgebase FAQs, instant hub dispatch hotline, and ticket tracking.
          </p>
        </div>

        <button
          onClick={onRaiseTicket}
          className="px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground text-xs font-bold shadow-lg hover:opacity-90 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Raise Support Ticket</span>
        </button>
      </div>

      {/* Emergency Hotline & Help Channels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-4 rounded-2xl bg-surface/80 border border-primary/25 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-primary flex items-center gap-1">
              <PhoneCall className="w-3 h-3" /> Dedicated Dispatch Hotline
            </span>
            <p className="text-sm font-mono font-bold text-on-surface">+91 80 4000 8800</p>
            <p className="text-[10px] text-on-surface-variant">Instant response for on-duty valets</p>
          </div>
          <a
            href="tel:+918040008800"
            className="px-3 py-1.5 rounded-xl bg-primary/15 text-primary hover:bg-primary hover:text-primary-foreground font-semibold text-xs transition-colors"
          >
            Call Now
          </a>
        </div>

        <div className="p-4 rounded-2xl bg-surface/80 border border-outline-variant/20 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> Hub Logistics Control
            </span>
            <p className="text-sm font-bold text-on-surface">Indiranagar Hub #04</p>
            <p className="text-[10px] text-on-surface-variant">Walk-in manager desk available 6am - 11pm</p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
            Open
          </span>
        </div>
      </div>
    </div>
  );
}
