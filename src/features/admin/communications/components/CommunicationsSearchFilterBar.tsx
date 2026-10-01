"use client";

import React from "react";
import {
  Search,
  Filter,
  RotateCcw,
  MessageSquare,
  Users,
  Layers,
  Calendar,
} from "lucide-react";
import {
  CommunicationStatus,
  RecipientType,
  CommunicationChannel,
  RECIPIENT_TYPES,
  COMMUNICATION_CHANNELS,
  COMMUNICATION_STATUSES,
} from "@/types/admin/notification";

interface CommunicationsSearchFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  status: CommunicationStatus | "all";
  onStatusChange: (val: CommunicationStatus | "all") => void;
  recipientType: RecipientType | "all";
  onRecipientTypeChange: (val: RecipientType | "all") => void;
  channel: CommunicationChannel | "all";
  onChannelChange: (val: CommunicationChannel | "all") => void;
  datePreset: "all" | "today" | "yesterday" | "last_7_days" | "last_30_days";
  onDatePresetChange: (
    val: "all" | "today" | "yesterday" | "last_7_days" | "last_30_days"
  ) => void;
  onReset: () => void;
  isFiltered: boolean;
}

export function CommunicationsSearchFilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  recipientType,
  onRecipientTypeChange,
  channel,
  onChannelChange,
  datePreset,
  onDatePresetChange,
  onReset,
  isFiltered,
}: CommunicationsSearchFilterBarProps) {
  return (
    <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 mb-6 space-y-3">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search by subject, message content, sender, recipient, booking ID..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-container text-xs rounded-lg border border-outline-variant/40 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Action / Reset Button */}
        {isFiltered && (
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-xs font-medium text-on-surface transition-colors shrink-0"
            title="Reset all filters"
          >
            <RotateCcw className="w-3.5 h-3.5 text-on-surface-variant" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Filter Dropdowns Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        {/* Status Filter */}
        <div className="relative">
          <select
            value={status}
            onChange={(e) =>
              onStatusChange(e.target.value as CommunicationStatus | "all")
            }
            className="w-full px-2.5 py-1.5 bg-surface-container text-xs rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
          >
            <option value="all">● All Statuses</option>
            {COMMUNICATION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Recipient Type Filter */}
        <div className="relative">
          <select
            value={recipientType}
            onChange={(e) =>
              onRecipientTypeChange(e.target.value as RecipientType | "all")
            }
            className="w-full px-2.5 py-1.5 bg-surface-container text-xs rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
          >
            <option value="all">👥 All Recipient Types</option>
            {RECIPIENT_TYPES.map((rt) => (
              <option key={rt} value={rt}>
                {rt}
              </option>
            ))}
          </select>
        </div>

        {/* Channel Filter */}
        <div className="relative">
          <select
            value={channel}
            onChange={(e) =>
              onChannelChange(e.target.value as CommunicationChannel | "all")
            }
            className="w-full px-2.5 py-1.5 bg-surface-container text-xs rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
          >
            <option value="all">📡 All Channels</option>
            {COMMUNICATION_CHANNELS.map((ch) => (
              <option key={ch} value={ch}>
                {ch}
              </option>
            ))}
          </select>
        </div>

        {/* Date Preset Filter */}
        <div className="relative">
          <select
            value={datePreset}
            onChange={(e) =>
              onDatePresetChange(
                e.target.value as
                  | "all"
                  | "today"
                  | "yesterday"
                  | "last_7_days"
                  | "last_30_days"
              )
            }
            className="w-full px-2.5 py-1.5 bg-surface-container text-xs rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
          >
            <option value="all">📅 All Time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last_7_days">Last 7 Days</option>
            <option value="last_30_days">Last 30 Days</option>
          </select>
        </div>
      </div>
    </div>
  );
}
