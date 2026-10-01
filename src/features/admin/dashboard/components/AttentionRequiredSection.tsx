"use client";

import React from "react";
import {
  AlertTriangle,
  AlertCircle,
  Clock,
  ShieldAlert,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { DashboardAttentionItem, AttentionSeverity } from "@/types/admin";

interface AttentionRequiredSectionProps {
  items: DashboardAttentionItem[];
}

export function AttentionRequiredSection({
  items,
}: AttentionRequiredSectionProps) {
  const getSeverityBadge = (sev: AttentionSeverity) => {
    switch (sev) {
      case "Critical":
        return {
          badge: "bg-critical/20 text-critical border-critical/40",
          dot: "bg-critical animate-pulse",
          cardBorder: "border-critical/40 hover:border-critical",
        };
      case "High":
        return {
          badge: "bg-warning/20 text-warning border-warning/40",
          dot: "bg-warning",
          cardBorder: "border-warning/30 hover:border-warning/60",
        };
      case "Medium":
        return {
          badge: "bg-info/20 text-info border-info/40",
          dot: "bg-info",
          cardBorder: "border-info/30 hover:border-info/60",
        };
      case "Low":
        return {
          badge: "bg-surface-container-highest text-on-surface-variant border-outline-variant/40",
          dot: "bg-on-surface-variant",
          cardBorder: "border-outline-variant/30 hover:border-outline-variant/60",
        };
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-critical" />
          <span>Operational Attention Required</span>
        </h3>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-critical/15 text-critical border border-critical/30 font-bold">
          {items.length} Action Items
        </span>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const config = getSeverityBadge(item.severity);
          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl bg-surface-container border transition-all ${config.cardBorder}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1.5 ${config.badge}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                    {item.severity.toUpperCase()}
                  </span>
                  <span className="text-xs font-bold text-on-surface">
                    {item.category}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-on-surface">
                    {item.count} items
                  </span>
                </div>
              </div>

              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                {item.explanation}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
