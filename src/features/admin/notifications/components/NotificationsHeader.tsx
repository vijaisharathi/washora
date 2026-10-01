"use client";

import React from "react";
import Link from "next/link";
import {
  Bell,
  RefreshCw,
  CheckCheck,
  SlidersHorizontal,
  Building2,
} from "lucide-react";

interface NotificationsHeaderProps {
  organizationId: string;
  totalNotifications: number;
  unreadCount: number;
  onRefresh: () => void;
  onMarkAllRead: () => void;
  isLoading?: boolean;
}

export function NotificationsHeader({
  organizationId,
  totalNotifications,
  unreadCount,
  onRefresh,
  onMarkAllRead,
  isLoading,
}: NotificationsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30">
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Bell className="w-4 h-4 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-on-surface tracking-tight">
            Notifications & Alerts
          </h1>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
            A12
          </span>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse">
              {unreadCount} Unread
            </span>
          )}
        </div>
        <p className="text-xs text-on-surface-variant flex items-center gap-2">
          <span>Operational events, order state alerts, and workflow triggers.</span>
          <span className="inline-flex items-center gap-1 font-mono text-[11px] px-1.5 py-0.2 rounded bg-surface-container-high text-on-surface">
            <Building2 className="w-3 h-3 text-primary" />
            {organizationId}
          </span>
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        <Link
          href="/admin/notifications/preferences"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/50 text-xs font-medium text-on-surface hover:bg-surface-container-high transition-colors"
          title="Notification Preferences"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-on-surface-variant" />
          <span>Preferences</span>
        </Link>

        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/50 text-xs font-medium text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-50"
          title="Refresh notifications"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-primary" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>
    </div>
  );
}
