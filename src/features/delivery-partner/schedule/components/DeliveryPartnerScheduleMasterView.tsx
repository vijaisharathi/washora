"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Layers,
  Map,
  ListOrdered,
  AlertCircle,
  RefreshCw,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useDeliveryPartnerSchedule } from "../hooks/useDeliveryPartnerSchedule";
import { ScheduleHeroCard } from "./ScheduleHeroCard";
import { ScheduleDatePicker } from "./ScheduleDatePicker";
import { RouteStopCard } from "./RouteStopCard";
import { RouteMapView } from "./RouteMapView";
import { RescheduleStopModal } from "./RescheduleStopModal";
import { RouteStop } from "@/types/delivery-partner";

export function DeliveryPartnerScheduleMasterView() {
  const [selectedDate, setSelectedDate] = useState("2026-09-03");
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "COMPLETED">("ALL");
  const [viewMode, setViewMode] = useState<"LIST" | "MAP">("LIST");
  const [rescheduleStopTarget, setRescheduleStopTarget] = useState<RouteStop | null>(null);

  const {
    schedule,
    isLoading,
    isError,
    error,
    refetch,
    reorderStops,
    isReordering,
    rescheduleStop,
    isRescheduling,
  } = useDeliveryPartnerSchedule(selectedDate);

  const handleMoveStop = async (currentIndex: number, direction: "UP" | "DOWN") => {
    if (!schedule) return;
    const newStops = [...schedule.stops];
    const targetIndex = direction === "UP" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= newStops.length) return;

    const temp = newStops[currentIndex];
    newStops[currentIndex] = newStops[targetIndex];
    newStops[targetIndex] = temp;

    const newIds = newStops.map((s) => s.taskId);
    await reorderStops(newIds);
  };

  const filteredStops = (schedule?.stops || []).filter((s) => {
    if (filter === "PENDING") return !s.isCompleted;
    if (filter === "COMPLETED") return s.isCompleted;
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Date Navigation Bar */}
      <ScheduleDatePicker
        selectedDate={selectedDate}
        onSelectDate={(d) => setSelectedDate(d)}
      />

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-4">
          <div className="h-56 rounded-3xl bg-surface-container animate-pulse border border-outline-variant/20" />
          <div className="h-44 rounded-3xl bg-surface-container animate-pulse border border-outline-variant/20" />
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="p-8 rounded-3xl bg-surface-container/70 border border-error/30 text-center space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-error/15 text-error flex items-center justify-center mx-auto">
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-sm font-bold text-on-surface">Failed to load shift schedule</p>
          <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
            {error instanceof Error ? error.message : "Error retrieving daily route plan."}
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

      {/* Schedule Hero & Content */}
      {!isLoading && !isError && schedule && (
        <>
          <ScheduleHeroCard schedule={schedule} />

          {/* Controls Bar: Filters & View Mode Toggle */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-container/70 border border-outline-variant/20 text-xs">
              {(["ALL", "PENDING", "COMPLETED"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                    filter === tab
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                  }`}
                >
                  {tab === "ALL" ? `All Stops (${schedule.totalStops})` : tab === "PENDING" ? `Pending (${schedule.remainingStops})` : `Completed (${schedule.completedStops})`}
                </button>
              ))}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-surface-container/70 p-1 rounded-xl border border-outline-variant/20 text-xs">
              <button
                onClick={() => setViewMode("LIST")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  viewMode === "LIST"
                    ? "bg-surface text-on-surface border border-outline-variant/30 shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5 text-primary" />
                <span>Stop Sequence</span>
              </button>
              <button
                onClick={() => setViewMode("MAP")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  viewMode === "MAP"
                    ? "bg-surface text-on-surface border border-outline-variant/30 shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <Map className="w-3.5 h-3.5 text-primary" />
                <span>Route Map</span>
              </button>
            </div>
          </div>

          {/* View Mode: Map Schematic View */}
          {viewMode === "MAP" && (
            <RouteMapView stops={schedule.stops} hubName={schedule.hubName} />
          )}

          {/* View Mode: Stop Sequence List */}
          {viewMode === "LIST" && (
            <div className="space-y-4">
              {filteredStops.length === 0 ? (
                <div className="p-12 rounded-3xl bg-surface-container/60 border border-outline-variant/20 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-surface-container-high text-on-surface-variant flex items-center justify-center mx-auto">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-on-surface">No Stops Match This Filter</h3>
                  <p className="text-xs text-on-surface-variant">
                    All stops in this category are clear for the selected date.
                  </p>
                </div>
              ) : (
                filteredStops.map((stop, idx) => (
                  <RouteStopCard
                    key={stop.taskId}
                    stop={stop}
                    index={idx}
                    totalStops={filteredStops.length}
                    onMoveUp={() => handleMoveStop(idx, "UP")}
                    onMoveDown={() => handleMoveStop(idx, "DOWN")}
                    onReschedule={() => setRescheduleStopTarget(stop)}
                  />
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* Reschedule Stop Modal */}
      {rescheduleStopTarget && (
        <RescheduleStopModal
          taskId={rescheduleStopTarget.taskId}
          orderId={rescheduleStopTarget.orderId}
          currentTimeWindow={rescheduleStopTarget.timeWindow}
          isOpen={!!rescheduleStopTarget}
          onClose={() => setRescheduleStopTarget(null)}
          onSubmit={rescheduleStop}
          isRescheduling={isRescheduling}
        />
      )}
    </div>
  );
}
