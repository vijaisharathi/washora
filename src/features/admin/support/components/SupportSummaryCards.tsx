import React from "react";
import {
  LifeBuoy,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";
import { SupportSummaryMetrics } from "@/types/admin/support";

interface SupportSummaryCardsProps {
  summary: SupportSummaryMetrics | null;
  loading?: boolean;
}

export function SupportSummaryCards({ summary, loading }: SupportSummaryCardsProps) {
  if (loading || !summary) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-xl bg-surface-container-lowest border border-outline-variant/30 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Tickets",
      value: summary.totalTickets,
      icon: LifeBuoy,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
    },
    {
      title: "Open",
      value: summary.openCount,
      icon: AlertCircle,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
    {
      title: "In Progress",
      value: summary.inProgressCount,
      icon: Clock,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      title: "Waiting Response",
      value: summary.waitingForResponseCount,
      icon: HelpCircle,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
    {
      title: "Resolved",
      value: summary.resolvedCount,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
    {
      title: "Urgent Priority",
      value: summary.urgentCount,
      icon: AlertTriangle,
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
      borderColor: "border-rose-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={`p-3.5 rounded-xl bg-surface-container-lowest border ${c.borderColor} flex flex-col justify-between transition-all hover:shadow-sm`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-medium text-on-surface-variant truncate">
                {c.title}
              </span>
              <div className={`w-6 h-6 rounded-md ${c.bgColor} flex items-center justify-center shrink-0`}>
                <Icon className={`w-3.5 h-3.5 ${c.color}`} />
              </div>
            </div>
            <div className="text-xl font-bold text-on-surface tracking-tight font-mono">
              {c.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
