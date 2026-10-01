import React from "react";
import {
  Search,
  RotateCcw,
  ArrowUpDown,
} from "lucide-react";
import {
  DisputeStatus,
  DisputeType,
  SupportPriority,
  DISPUTE_STATUSES,
  DISPUTE_TYPES,
  SUPPORT_PRIORITIES,
} from "@/types/admin/support";

interface DisputesSearchFilterBarProps {
  search: string;
  status: DisputeStatus | "all";
  type: DisputeType | "all";
  priority: SupportPriority | "all";
  raisedBy: "all" | "Customer" | "Provider" | "Delivery Partner";
  assignedState: "all" | "assigned" | "unassigned";
  datePreset: "all" | "today" | "yesterday" | "last_7_days" | "last_30_days";
  sort: "newest" | "oldest" | "highest_priority" | "amount" | "status" | "updated_at";
  sortDirection: "asc" | "desc";
  onSearchChange: (val: string) => void;
  onStatusChange: (val: DisputeStatus | "all") => void;
  onTypeChange: (val: DisputeType | "all") => void;
  onPriorityChange: (val: SupportPriority | "all") => void;
  onRaisedByChange: (val: "all" | "Customer" | "Provider" | "Delivery Partner") => void;
  onAssignedStateChange: (val: "all" | "assigned" | "unassigned") => void;
  onDatePresetChange: (val: "all" | "today" | "yesterday" | "last_7_days" | "last_30_days") => void;
  onSortChange: (val: "newest" | "oldest" | "highest_priority" | "amount" | "status" | "updated_at") => void;
  onSortDirectionToggle: () => void;
  onResetFilters: () => void;
}

export function DisputesSearchFilterBar({
  search,
  status,
  type,
  priority,
  raisedBy,
  assignedState,
  datePreset,
  sort,
  sortDirection,
  onSearchChange,
  onStatusChange,
  onTypeChange,
  onPriorityChange,
  onRaisedByChange,
  onAssignedStateChange,
  onDatePresetChange,
  onSortChange,
  onSortDirectionToggle,
  onResetFilters,
}: DisputesSearchFilterBarProps) {
  const hasActiveFilters =
    search.trim() !== "" ||
    status !== "all" ||
    type !== "all" ||
    priority !== "all" ||
    raisedBy !== "all" ||
    assignedState !== "all" ||
    datePreset !== "all" ||
    sort !== "updated_at" ||
    sortDirection !== "desc";

  return (
    <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 mb-6 space-y-3">
      {/* Search and sort toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search disputes by ID, number, subject, customer, provider, or booking #..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-surface-container/50 border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary/50"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onSortDirectionToggle}
            className="px-3 py-2 rounded-lg bg-surface-container/60 hover:bg-surface-container border border-outline-variant/30 text-on-surface-variant text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
            title={`Sort Direction: ${sortDirection.toUpperCase()}`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="uppercase text-[10px] font-mono">{sortDirection}</span>
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-1">
        {/* Status */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as DisputeStatus | "all")}
            className="w-full py-1.5 px-2 text-xs rounded-md bg-surface-container/50 border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary/50"
          >
            <option value="all">All Statuses</option>
            {DISPUTE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Dispute Type */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
            Dispute Type
          </label>
          <select
            value={type}
            onChange={(e) => onTypeChange(e.target.value as DisputeType | "all")}
            className="w-full py-1.5 px-2 text-xs rounded-md bg-surface-container/50 border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary/50"
          >
            <option value="all">All Types</option>
            {DISPUTE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value as SupportPriority | "all")}
            className="w-full py-1.5 px-2 text-xs rounded-md bg-surface-container/50 border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary/50"
          >
            <option value="all">All Priorities</option>
            {SUPPORT_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Raised By */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
            Raised By
          </label>
          <select
            value={raisedBy}
            onChange={(e) => onRaisedByChange(e.target.value as any)}
            className="w-full py-1.5 px-2 text-xs rounded-md bg-surface-container/50 border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary/50"
          >
            <option value="all">All Parties</option>
            <option value="Customer">Customer</option>
            <option value="Provider">Provider</option>
            <option value="Delivery Partner">Delivery Partner</option>
          </select>
        </div>

        {/* Assigned */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
            Assigned
          </label>
          <select
            value={assignedState}
            onChange={(e) => onAssignedStateChange(e.target.value as "all" | "assigned" | "unassigned")}
            className="w-full py-1.5 px-2 text-xs rounded-md bg-surface-container/50 border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary/50"
          >
            <option value="all">All Cases</option>
            <option value="assigned">Assigned</option>
            <option value="unassigned">Unassigned</option>
          </select>
        </div>

        {/* Date Preset */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
            Filed Date
          </label>
          <select
            value={datePreset}
            onChange={(e) => onDatePresetChange(e.target.value as any)}
            className="w-full py-1.5 px-2 text-xs rounded-md bg-surface-container/50 border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary/50"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last_7_days">Last 7 Days</option>
            <option value="last_30_days">Last 30 Days</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
            Sort By
          </label>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as any)}
            className="w-full py-1.5 px-2 text-xs rounded-md bg-surface-container/50 border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary/50"
          >
            <option value="updated_at">Updated Date</option>
            <option value="newest">Created: Newest</option>
            <option value="oldest">Created: Oldest</option>
            <option value="highest_priority">Priority</option>
            <option value="amount">Amount Involved</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>
    </div>
  );
}
