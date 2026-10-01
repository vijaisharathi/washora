"use client";

import React from "react";
import {
  Calendar,
  RefreshCw,
  Building2,
  Sliders,
  ShieldCheck,
  User,
} from "lucide-react";
import Link from "next/link";
import { DashboardPeriod, AdminProfile, Organization } from "@/types/admin";

interface AdminDashboardHeaderProps {
  profile: AdminProfile | null;
  organization: Organization | null;
  period: DashboardPeriod;
  onPeriodChange: (p: DashboardPeriod) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function AdminDashboardHeader({
  profile,
  organization,
  period,
  onPeriodChange,
  onRefresh,
  isRefreshing,
}: AdminDashboardHeaderProps) {
  const periods: { id: DashboardPeriod; label: string }[] = [
    { id: "today", label: "Today" },
    { id: "last_7_days", label: "Last 7 Days" },
    { id: "last_30_days", label: "Last 30 Days" },
  ];

  const formatRole = (r?: string) => {
    if (r === "operations" || r === "OPERATIONS_MANAGER") return "Operations Manager";
    return "Super Administrator";
  };

  const formatWorkArea = (area?: string) => {
    switch (area) {
      case "customer-operations":
        return "Customer Operations";
      case "provider-operations":
        return "Provider Operations";
      case "delivery-operations":
        return "Delivery Operations";
      case "platform-operations":
        return "Platform Operations";
      default:
        return area || "Platform Operations";
    }
  };

  return (
    <div className="space-y-4 border-b border-outline-variant/20 pb-6">
      {/* Top Banner: Identity & Period Select */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Operator Profile Identity */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-surface-container-high border-2 border-primary/40 flex items-center justify-center overflow-hidden shrink-0 shadow-md">
            {profile?.profileImage ? (
              <img
                src={profile.profileImage}
                alt={profile.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-on-surface-variant" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-on-surface">
                {profile?.fullName || "Operator"}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary border border-primary/30">
                {formatRole(profile?.role)}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-success/15 text-success border border-success/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                Live Operational
              </span>
            </div>

            {/* Sub-meta */}
            <div className="flex items-center gap-3 mt-1 text-xs text-on-surface-variant flex-wrap">
              <Link
                href="/admin/organization"
                className="flex items-center gap-1 hover:text-primary transition-colors font-medium"
              >
                <Building2 className="w-3.5 h-3.5 text-primary" />
                <span>{organization?.name || "WASHORA Technologies"}</span>
              </Link>
              <span className="text-outline-variant">•</span>
              <span className="flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-on-surface-variant" />
                <span>{formatWorkArea(profile?.primaryWorkArea)}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Date Filter & Refresh Actions */}
        <div className="flex items-center gap-2 self-start lg:self-auto flex-wrap">
          {/* Period Pills */}
          <div className="bg-surface-container-low border border-outline-variant/40 rounded-xl p-1 flex items-center gap-1 shadow-sm">
            {periods.map((p) => {
              const isSelected = period === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onPeriodChange(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-primary text-on-primary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-surface-container-high border border-outline-variant/30 text-on-surface hover:bg-surface-container-highest transition-colors disabled:opacity-50"
            title="Refresh operational metrics"
            aria-label="Refresh operational metrics"
          >
            <RefreshCw
              className={`w-4 h-4 text-on-surface-variant ${
                isRefreshing ? "animate-spin text-primary" : ""
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
