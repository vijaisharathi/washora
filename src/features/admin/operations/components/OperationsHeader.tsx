"use client";

import React from "react";
import { Activity, Clock, ShieldCheck, CheckCircle2, UserCheck, Bike } from "lucide-react";
import { OperationalQueueTab, OperationsSummaryMetrics } from "@/types/admin/operations";

interface OperationsHeaderProps {
  organizationId: string;
  activeTab: OperationalQueueTab;
  onTabChange: (tab: OperationalQueueTab) => void;
  metrics: OperationsSummaryMetrics | null;
}

export function OperationsHeader({
  organizationId,
  activeTab,
  onTabChange,
  metrics,
}: OperationsHeaderProps) {
  const tabs: {
    id: OperationalQueueTab;
    label: string;
    icon: React.ReactNode;
    count?: number;
    badgeColor?: string;
  }[] = [
    {
      id: "all",
      label: "All Operations",
      icon: <Activity className="w-4 h-4" />,
      count: metrics?.total,
    },
    {
      id: "needs_assignment",
      label: "Needs Assignment",
      icon: <Clock className="w-4 h-4 text-amber-500" />,
      count: metrics?.needsAssignment,
      badgeColor: "bg-amber-500/15 text-amber-500 border border-amber-500/30",
    },
    {
      id: "provider_assigned",
      label: "Provider Assigned",
      icon: <UserCheck className="w-4 h-4 text-blue-500" />,
      count: metrics?.providerAssigned,
      badgeColor: "bg-blue-500/15 text-blue-500 border border-blue-500/30",
    },
    {
      id: "active_operations",
      label: "Active Operations",
      icon: <CheckCircle2 className="w-4 h-4 text-purple-500" />,
      count: metrics?.inProgress,
      badgeColor: "bg-purple-500/15 text-purple-500 border border-purple-500/30",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Title & Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low border border-surface-variant/50 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-on-surface tracking-tight">
                Operations & Assignment Management
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-primary/10 text-primary border border-primary/20">
                {organizationId}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Real-time resource readiness, provider dispatch, delivery coordination, and workload control.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-outline font-medium self-start sm:self-auto bg-surface-container/60 px-3 py-1.5 rounded-xl border border-surface-variant/40">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Strict Organization Scoping Active</span>
        </div>
      </div>

      {/* Operational Queue Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-surface-variant/40">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                isActive
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface border border-surface-variant/40"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : tab.badgeColor || "bg-surface-container-highest text-on-surface-variant"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
