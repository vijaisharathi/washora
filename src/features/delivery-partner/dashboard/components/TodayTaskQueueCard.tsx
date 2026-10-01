"use client";

import React, { useState } from "react";
import {
  ClipboardList,
  Package,
  Navigation,
  Clock,
  ArrowRight,
  Sparkles,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { DeliveryPartnerTaskPreview, TaskStatus } from "@/types/delivery-partner";

interface TodayTaskQueueCardProps {
  tasks: DeliveryPartnerTaskPreview[];
}

export function TodayTaskQueueCard({ tasks }: TodayTaskQueueCardProps) {
  const [filter, setFilter] = useState<"ALL" | "IN_TRANSIT" | "ASSIGNED" | "ACCEPTED">("ALL");

  const filteredTasks = tasks.filter((t) => {
    if (filter === "ALL") return true;
    return t.status === filter;
  });

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case "IN_TRANSIT":
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/15 text-purple-400 border border-purple-500/30">
            In Transit
          </span>
        );
      case "ACCEPTED":
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            Accepted
          </span>
        );
      case "ASSIGNED":
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
            Assigned Queue
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant">
            {status}
          </span>
        );
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "CUSTOMER_PICKUP":
        return "Customer Doorstep Pickup";
      case "CUSTOMER_DELIVERY":
        return "Customer Doorstep Dropoff";
      case "HUB_TRANSFER":
        return "Depot & Hub Transfer";
      default:
        return type;
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-surface-container/70 border border-outline-variant/25 space-y-4">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/20 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-on-surface">Today&apos;s Dispatch Task Queue</h2>
            <p className="text-[11px] text-on-surface-variant">
              {tasks.length} active scheduled runs for your current shift
            </p>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface border border-outline-variant/20 text-xs overflow-x-auto">
          {(["ALL", "IN_TRANSIT", "ASSIGNED", "ACCEPTED"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                filter === tab
                  ? "bg-primary/20 text-primary font-bold shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {tab === "ALL" ? "All Tasks" : tab.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center text-xs text-on-surface-variant">
            No tasks found for the selected status.
          </div>
        ) : (
          filteredTasks.map((t) => (
            <div
              key={t.id}
              className="p-4 rounded-2xl bg-surface/70 border border-outline-variant/15 hover:border-primary/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-on-surface">
                    Order #{t.orderId}
                  </span>
                  {getStatusBadge(t.status)}
                  <span className="text-[10px] text-on-surface-variant font-medium">
                    • {getTypeLabel(t.type)}
                  </span>
                  {t.isPriority && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                      Express
                    </span>
                  )}
                </div>

                <p className="text-xs text-on-surface font-semibold truncate">
                  {t.itemSummary}
                </p>

                <div className="flex items-center gap-3 text-[11px] text-on-surface-variant flex-wrap">
                  <span className="flex items-center gap-1 truncate max-w-xs">
                    <MapPin className="w-3 h-3 text-primary/70 shrink-0" />
                    {t.deliveryAddress}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-on-surface-variant/70 shrink-0" />
                    {t.scheduledTimeWindow}
                  </span>
                  <span>•</span>
                  <span className="font-mono text-primary font-medium">{t.distanceKm} km</span>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-outline-variant/15">
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    +₹{t.payoutAmount}
                  </span>
                  <p className="text-[9px] text-on-surface-variant font-medium">Est. Payout</p>
                </div>

                <span className="text-[10px] text-on-surface-variant px-2.5 py-1 rounded-lg bg-surface-container-high border border-outline-variant/20">
                  Valet Task D4
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
