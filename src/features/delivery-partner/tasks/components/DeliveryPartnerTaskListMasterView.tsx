"use client";

import React, { useState } from "react";
import { AlertCircle, PackageX, RefreshCw, Layers } from "lucide-react";
import { useDeliveryPartnerTasks } from "../hooks/useDeliveryPartnerTasks";
import { TaskFilterParams } from "@/types/delivery-partner";
import { DeliveryPartnerTaskFilters } from "./DeliveryPartnerTaskFilters";
import { DeliveryPartnerTaskCard } from "./DeliveryPartnerTaskCard";

export function DeliveryPartnerTaskListMasterView() {
  const [filters, setFilters] = useState<TaskFilterParams>({
    category: "ALL",
    searchQuery: "",
    type: "ALL",
  });

  const {
    tasks,
    isLoading,
    isError,
    error,
    refetch,
    acceptTask,
    isAccepting,
    rejectTask,
    isRejecting,
    startTransit,
    isStartingTransit,
    cancelTask,
    isCancelling,
  } = useDeliveryPartnerTasks(filters);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-on-surface tracking-tight">
            Valet Task & Dispatch Management
          </h1>
          <p className="text-xs text-on-surface-variant">
            Accept available dispatch jobs, review route queues, and initiate transit runs.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant">
          <Layers className="w-3.5 h-3.5 text-primary" />
          <span>
            {tasks.length} {tasks.length === 1 ? "Job Found" : "Jobs Found"}
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <DeliveryPartnerTaskFilters
        filters={filters}
        onFilterChange={setFilters}
        taskCount={tasks.length}
      />

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
          <p className="text-sm font-bold text-on-surface">Failed to load dispatch tasks</p>
          <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
            {error instanceof Error ? error.message : "Network error retrieving task queue."}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 flex items-center gap-1.5 mx-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Sync</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && tasks.length === 0 && (
        <div className="p-12 rounded-3xl bg-surface-container/60 border border-outline-variant/20 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-surface-container-high text-on-surface-variant flex items-center justify-center mx-auto">
            <PackageX className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-on-surface">No Dispatch Tasks Match</h3>
            <p className="text-xs text-on-surface-variant max-w-md mx-auto">
              There are currently no tasks matching your selected filters or search terms. Try selecting &quot;All Tasks&quot; or clear your search input.
            </p>
          </div>
          <button
            onClick={() => setFilters({ category: "ALL", searchQuery: "", type: "ALL" })}
            className="px-4 py-2 rounded-xl bg-surface-container-highest text-xs font-semibold text-on-surface hover:text-primary transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Task Cards List */}
      {!isLoading && !isError && tasks.length > 0 && (
        <div className="space-y-4">
          {tasks.map((task) => (
            <DeliveryPartnerTaskCard
              key={task.id}
              task={task}
              onAccept={acceptTask}
              isAccepting={isAccepting}
              onReject={(id) => rejectTask({ taskId: id })}
              isRejecting={isRejecting}
              onStartTransit={startTransit}
              isStartingTransit={isStartingTransit}
              onCancel={(id, reason) => cancelTask({ taskId: id, reason })}
              isCancelling={isCancelling}
            />
          ))}
        </div>
      )}
    </div>
  );
}
