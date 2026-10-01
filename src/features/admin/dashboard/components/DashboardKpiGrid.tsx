"use client";

import React from "react";
import {
  Users,
  Store,
  Bike,
  ShoppingCart,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  IndianRupee,
} from "lucide-react";
import { DashboardKpis, DashboardPeriod } from "@/types/admin";

interface DashboardKpiGridProps {
  kpis: DashboardKpis;
  period: DashboardPeriod;
}

export function DashboardKpiGrid({ kpis, period }: DashboardKpiGridProps) {
  const getPeriodLabel = () => {
    switch (period) {
      case "today":
        return "vs yesterday";
      case "last_7_days":
        return "vs prev 7 days";
      case "last_30_days":
        return "vs prev 30 days";
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const cards = [
    {
      id: "revenue",
      title: "Gross Revenue",
      value: formatCurrency(kpis.revenue),
      subtext: `${kpis.revenueTrendPct > 0 ? "+" : ""}${kpis.revenueTrendPct}% ${getPeriodLabel()}`,
      trendPositive: kpis.revenueTrendPct >= 0,
      icon: IndianRupee,
      iconColor: "text-success",
      iconBg: "bg-success/10",
      borderHighlight: "hover:border-success/40",
    },
    {
      id: "bookings",
      title: "Bookings / Orders",
      value: kpis.bookings.toLocaleString("en-IN"),
      subtext: `${kpis.bookingsTrendPct > 0 ? "+" : ""}${kpis.bookingsTrendPct}% ${getPeriodLabel()}`,
      trendPositive: kpis.bookingsTrendPct >= 0,
      icon: ShoppingCart,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
      borderHighlight: "hover:border-primary/40",
    },
    {
      id: "pendingBookings",
      title: "Pending Orders",
      value: kpis.pendingBookings.toLocaleString("en-IN"),
      subtext: "Awaiting dispatch / valet",
      trendPositive: false,
      isWarning: kpis.pendingBookings > 0,
      icon: Clock,
      iconColor: "text-warning",
      iconBg: "bg-warning/10",
      borderHighlight: "hover:border-warning/40",
    },
    {
      id: "completedBookings",
      title: "Completed Orders",
      value: kpis.completedBookings.toLocaleString("en-IN"),
      subtext: "Verified delivery handoff",
      trendPositive: true,
      icon: CheckCircle2,
      iconColor: "text-success",
      iconBg: "bg-success/10",
      borderHighlight: "hover:border-success/40",
    },
    {
      id: "totalCustomers",
      title: "Total Customers",
      value: kpis.totalCustomers.toLocaleString("en-IN"),
      subtext: `${kpis.customersTrendPct > 0 ? "+" : ""}${kpis.customersTrendPct}% registered`,
      trendPositive: true,
      icon: Users,
      iconColor: "text-info",
      iconBg: "bg-info/10",
      borderHighlight: "hover:border-info/40",
    },
    {
      id: "activeProviders",
      title: "Active Providers",
      value: kpis.activeProviders.toLocaleString("en-IN"),
      subtext: `${kpis.providersTrendPct > 0 ? "+" : ""}${kpis.providersTrendPct}% workshops`,
      trendPositive: true,
      icon: Store,
      iconColor: "text-tertiary",
      iconBg: "bg-tertiary/10",
      borderHighlight: "hover:border-tertiary/40",
    },
    {
      id: "activeDeliveryPartners",
      title: "Partners Online",
      value: kpis.activeDeliveryPartners.toLocaleString("en-IN"),
      subtext: "Active fleet valets",
      trendPositive: true,
      isLive: true,
      icon: Bike,
      iconColor: "text-success",
      iconBg: "bg-success/10",
      borderHighlight: "hover:border-success/40",
    },
    {
      id: "attentionRequired",
      title: "Operational Attention",
      value: kpis.attentionRequired.toLocaleString("en-IN"),
      subtext: "Actionable escalations",
      isCritical: kpis.attentionRequired > 0,
      icon: AlertTriangle,
      iconColor: "text-critical",
      iconBg: "bg-critical/10",
      borderHighlight: "border-critical/40 hover:border-critical",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className={`p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 transition-all duration-200 shadow-sm relative overflow-hidden ${
              card.isCritical ? "border-critical/50 bg-critical/5" : ""
            } ${card.borderHighlight}`}
          >
            {/* Ambient corner highlight */}
            {card.isCritical && (
              <div className="absolute right-0 bottom-0 w-24 h-24 bg-critical/10 rounded-full blur-xl pointer-events-none" />
            )}

            <div className="flex justify-between items-start mb-3 relative">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                {card.title}
              </span>
              <div
                className={`w-8 h-8 rounded-xl ${card.iconBg} flex items-center justify-center ${card.iconColor} shrink-0`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1 relative">
              <div className="text-2xl font-bold tracking-tight text-on-surface">
                {card.value}
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                {card.isLive ? (
                  <span className="flex items-center gap-1 text-success font-semibold text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    LIVE FLEET
                  </span>
                ) : card.isCritical ? (
                  <span className="text-critical font-semibold text-[11px] px-1.5 py-0.2 rounded bg-critical/15">
                    REQUIRES ACTION
                  </span>
                ) : (
                  <span
                    className={`flex items-center gap-1 text-[11px] font-medium ${
                      card.trendPositive ? "text-success" : "text-on-surface-variant"
                    }`}
                  >
                    {card.trendPositive && <TrendingUp className="w-3 h-3" />}
                    {card.subtext}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
