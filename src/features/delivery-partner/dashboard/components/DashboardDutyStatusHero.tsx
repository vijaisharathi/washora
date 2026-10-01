"use client";

import React from "react";
import Link from "next/link";
import {
  CircleDot,
  Clock,
  MapPin,
  Bike,
  ShieldCheck,
  ChevronRight,
  Power,
  Zap,
} from "lucide-react";
import { useDeliveryPartnerSession } from "../../hooks/useDeliveryPartnerSession";
import { DeliveryPartnerDashboardSummary } from "@/types/delivery-partner";

interface DashboardDutyStatusHeroProps {
  summary: DeliveryPartnerDashboardSummary;
}

export function DashboardDutyStatusHero({ summary }: DashboardDutyStatusHeroProps) {
  const { partner, updateStatus, isUpdatingStatus } = useDeliveryPartnerSession();

  const isOnline = partner?.status === "ONLINE";

  const handleToggleDuty = () => {
    updateStatus(isOnline ? "OFFLINE" : "ONLINE");
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface-container-high via-surface-container to-surface border border-outline-variant/30 p-6 md:p-8 shadow-xl">
      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left: Valet Dispatch Identity */}
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                isOnline
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  : "bg-surface-container-highest text-on-surface-variant border-outline-variant/30"
              }`}
            >
              <CircleDot className={`w-3.5 h-3.5 ${isOnline ? "animate-pulse" : ""}`} />
              {isOnline ? "LIVE DISPATCH • ACTIVE ON ROUTE" : "DUTY PAUSED • OFFLINE"}
            </span>

            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
              <Zap className="w-3 h-3" /> Priority Tier
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">
            Welcome back, {partner?.name?.split(" ")[0] || "Valet Partner"}
          </h1>

          <div className="flex items-center gap-4 text-xs text-on-surface-variant flex-wrap pt-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-primary" />
              {summary.shiftName} ({summary.shiftTimeWindow})
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              {summary.hubName}
            </span>
            <span>•</span>
            <Link
              href="/delivery-partner/profile"
              className="flex items-center gap-1.5 text-primary hover:underline font-semibold font-mono"
            >
              <Bike className="w-3.5 h-3.5" />
              {partner?.vehiclePlate}
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Right: Duty Switch Button */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-outline-variant/20">
          <button
            onClick={handleToggleDuty}
            disabled={isUpdatingStatus}
            className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2.5 shadow-lg active:scale-95 disabled:opacity-60 ${
              isOnline
                ? "bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-500/20"
                : "bg-primary text-primary-foreground hover:opacity-90 shadow-primary/20"
            }`}
          >
            {isUpdatingStatus ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Power className="w-4 h-4" />
            )}
            <span>{isOnline ? "Go Offline / Take Break" : "Go Online • Start Receiving Jobs"}</span>
          </button>
        </div>
      </div>

      {/* Decorative ambient background */}
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
