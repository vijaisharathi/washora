"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  PackageCheck,
  MapPin,
  Clock,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Layers,
  AlertCircle,
  RefreshCw,
  PackageX,
  Play,
} from "lucide-react";
import { useDeliveryPartnerPickupQueue } from "../hooks/useDeliveryPartnerPickup";
import { DeliveryPartnerTask } from "@/types/delivery-partner";

export function PickupQueueMasterView() {
  const { pickupTasks, isLoading, isError, error, refetch } = useDeliveryPartnerPickupQueue();
  const [filter, setFilter] = useState<"ALL" | "READY" | "IN_PROGRESS">("ALL");

  const filtered = pickupTasks.filter((t) => {
    if (filter === "READY") return t.status === "ASSIGNED" || t.status === "ACCEPTED" || t.status === "AVAILABLE";
    if (filter === "IN_PROGRESS") return t.status === "PICKUP_STARTED";
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-on-surface tracking-tight">
            Valet Doorstep Pickup Queue
          </h1>
          <p className="text-xs text-on-surface-variant">
            Execute doorstep customer and hub transfers, verify garment counts, and seal inward laundry bags.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant">
          <Layers className="w-3.5 h-3.5 text-primary" />
          <span>{filtered.length} Pickups in Queue</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-container/70 border border-outline-variant/20 text-xs w-fit">
        {(["ALL", "READY", "IN_PROGRESS"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
              filter === tab
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
            }`}
          >
            {tab === "ALL" ? "All Pickups" : tab === "READY" ? "Ready for Pickup" : "Active In-Progress"}
          </button>
        ))}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-44 rounded-3xl bg-surface-container animate-pulse border border-outline-variant/20"
            />
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="p-8 rounded-3xl bg-surface-container/70 border border-error/30 text-center space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-error/15 text-error flex items-center justify-center mx-auto">
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-sm font-bold text-on-surface">Failed to load pickup queue</p>
          <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
            {error instanceof Error ? error.message : "Network issue loading pickup tasks."}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 flex items-center gap-1.5 mx-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filtered.length === 0 && (
        <div className="p-12 rounded-3xl bg-surface-container/60 border border-outline-variant/20 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-surface-container-high text-on-surface-variant flex items-center justify-center mx-auto">
            <PackageX className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-on-surface">No Pending Pickups in Queue</h3>
            <p className="text-xs text-on-surface-variant max-w-md mx-auto">
              You are all caught up on pickups! Check your general task queue or stay online to receive incoming broadcast runs.
            </p>
          </div>
          <Link
            href="/delivery-partner/tasks"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow hover:opacity-90 transition-opacity"
          >
            <span>Go to All Tasks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Pickup Task Cards */}
      {!isLoading && !isError && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((task) => (
            <div
              key={task.id}
              className="p-5 rounded-3xl bg-surface-container/70 border border-outline-variant/20 hover:border-primary/30 transition-all space-y-4 shadow-sm"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-on-surface">
                    Order #{task.orderId}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    {task.status.replace("_", " ")}
                  </span>
                  {task.isPriority && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> Priority Pickup
                    </span>
                  )}
                </div>

                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                  +₹{task.payoutAmount} payout
                </span>
              </div>

              {/* Location & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-surface border border-outline-variant/15 space-y-1">
                  <span className="text-[9px] uppercase font-bold text-on-surface-variant flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-400" /> Pickup Origin
                  </span>
                  <p className="font-semibold text-on-surface truncate">{task.pickupAddress}</p>
                </div>

                <div className="p-3 rounded-2xl bg-surface border border-outline-variant/15 space-y-1">
                  <span className="text-[9px] uppercase font-bold text-on-surface-variant flex items-center gap-1">
                    <Clock className="w-3 h-3 text-primary" /> Scheduled Window
                  </span>
                  <p className="font-mono font-bold text-on-surface">{task.scheduledTimeWindow}</p>
                </div>
              </div>

              {/* Items Preview */}
              <div className="flex items-center justify-between text-xs bg-surface-container-high/40 p-3 rounded-2xl border border-outline-variant/10">
                <p className="font-semibold text-on-surface truncate flex items-center gap-1.5">
                  <PackageCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                  {task.itemSummary}
                </p>
                <span className="font-mono text-on-surface-variant text-[11px] shrink-0">
                  {task.distanceKm} km
                </span>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between pt-1 border-t border-outline-variant/15 flex-wrap gap-2">
                <Link
                  href={`/delivery-partner/tasks/${task.id}`}
                  className="text-xs text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href={`/delivery-partner/pickup/${task.id}`}
                  className="px-5 py-2 rounded-xl bg-amber-500 text-black text-xs font-bold shadow-md hover:bg-amber-400 transition-colors flex items-center gap-2"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Start Pickup Execution</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
