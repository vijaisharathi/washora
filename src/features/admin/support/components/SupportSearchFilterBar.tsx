import React from "react";
import {
  Search,
  Filter,
  RotateCcw,
  ArrowUpDown,
  SlidersHorizontal,
} from "lucide-react";
import {
  SupportStatus,
  SupportPriority,
  SupportCategory,
  SupportRequesterType,
  SUPPORT_STATUSES,
  SUPPORT_PRIORITIES,
  SUPPORT_CATEGORIES,
  SUPPORT_REQUESTER_TYPES,
} from "@/types/admin/support";

interface SupportSearchFilterBarProps {
  search: string;
  status: SupportStatus | "all";
  priority: SupportPriority | "all";
  category: SupportCategory | "all";
  requesterType: SupportRequesterType | "all";
  assignedState: "all" | "assigned" | "unassigned";
  datePreset: "all" | "today" | "yesterday" | "last_7_days" | "last_30_days";
  sort: "newest" | "oldest" | "priority" | "status" | "requester" | "category" | "updated_at";
  sortDirection: "asc" | "desc";
  onSearchChange: (val: string) => void;
  onStatusChange: (val: SupportStatus | "all") => void;
  onPriorityChange: (val: SupportPriority | "all") => void;
  onCategoryChange: (val: SupportCategory | "all") => void;
  onRequesterTypeChange: (val: SupportRequesterType | "all") => void;
  onAssignedStateChange: (val: "all" | "assigned" | "unassigned") => void;
  onDatePresetChange: (val: "all" | "today" | "yesterday" | "last_7_days" | "last_30_days") => void;
  onSortChange: (val: "newest" | "oldest" | "priority" | "status" | "requester" | "category" | "updated_at") => void;
  onSortDirectionToggle: () => void;
  onResetFilters: () => void;
}

export function SupportSearchFilterBar({
  search,
  status,
  priority,
  category,
  requesterType,
  assignedState,
  datePreset,
  sort,
  sortDirection,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onCategoryChange,
  onRequesterTypeChange,
  onAssignedStateChange,
  onDatePresetChange,
  onSortChange,
  onSortDirectionToggle,
  onResetFilters,
}: SupportSearchFilterBarProps) {
  const hasActiveFilters =
    search.trim() !== "" ||
    status !== "all" ||
    priority !== "all" ||
    category !== "all" ||
    requesterType !== "all" ||
    assignedState !== "all" ||
    datePreset !== "all" ||
    sort !== "updated_at" ||
    sortDirection !== "desc";

  return (
    <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 mb-6 space-y-3">
      {/* Top row: Search input & quick controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search tickets by ID, number, subject, requester, booking #, or agent..."
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

      {/* Filter row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-1">
        {/* Status */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as SupportStatus | "all")}
            className="w-full py-1.5 px-2 text-xs rounded-md bg-surface-container/50 border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary/50"
          >
            <option value="all">All Statuses</option>
            {SUPPORT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
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

        {/* Category */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value as SupportCategory | "all")}
            className="w-full py-1.5 px-2 text-xs rounded-md bg-surface-container/50 border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary/50"
          >
            <option value="all">All Categories</option>
            {SUPPORT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Requester Type */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
            Requester
          </label>
          <select
            value={requesterType}
            onChange={(e) => onRequesterTypeChange(e.target.value as SupportRequesterType | "all")}
            className="w-full py-1.5 px-2 text-xs rounded-md bg-surface-container/50 border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary/50"
          >
            <option value="all">All Requesters</option>
            {SUPPORT_REQUESTER_TYPES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Assignment */}
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
            Created Date
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
            <option value="priority">Priority</option>
            <option value="status">Status</option>
            <option value="requester">Requester</option>
            <option value="category">Category</option>
          </select>
        </div>
      </div>
    </div>
  );
}
