"use client";

import React, { useState } from "react";
import { Bell, CheckCheck, RefreshCw, AlertCircle, Layers } from "lucide-react";
import { NotificationFilterParams } from "@/types/delivery-partner";
import {
  useDeliveryPartnerNotifications,
  useDeliveryPartnerUnreadCount,
  useDeliveryPartnerNotificationActions,
} from "../hooks/useDeliveryPartnerNotifications";
import { NotificationFilterBar } from "./NotificationFilterBar";
import { NotificationItemCard } from "./NotificationItemCard";

export function DeliveryPartnerNotificationsMasterView() {
  const [filter, setFilter] = useState<NotificationFilterParams>({
    category: "ALL",
    readStatus: "ALL",
    searchQuery: "",
  });

  const { notifications, isLoading, isError, refetch } = useDeliveryPartnerNotifications(filter);
  const { unreadCount } = useDeliveryPartnerUnreadCount();
  const { markAsRead, markAsUnread, markAllAsRead, isMarkingAllRead } =
    useDeliveryPartnerNotificationActions();

  const handleToggleRead = async (id: string, isCurrentlyRead: boolean) => {
    if (isCurrentlyRead) {
      await markAsUnread(id);
    } else {
      await markAsRead(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="h-24 rounded-3xl bg-surface-container animate-pulse border border-outline-variant/20" />
        <div className="h-14 rounded-2xl bg-surface-container animate-pulse border border-outline-variant/20" />
        <div className="space-y-3">
          <div className="h-28 rounded-3xl bg-surface-container animate-pulse" />
          <div className="h-28 rounded-3xl bg-surface-container animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 rounded-3xl bg-surface-container/70 border border-error/30 text-center space-y-3 max-w-lg mx-auto">
        <div className="w-10 h-10 rounded-2xl bg-error/15 text-error flex items-center justify-center mx-auto">
          <AlertCircle className="w-5 h-5" />
        </div>
        <p className="text-sm font-bold text-on-surface">Failed to load alerts & notifications</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 flex items-center gap-1.5 mx-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-surface-container-high via-surface-container to-surface border border-outline-variant/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-primary bg-primary/15 px-2 py-0.5 rounded border border-primary/25">
              Valet Notification Center
            </span>
            <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">
              Alerts & Operational Dispatch
            </h1>
            <p className="text-xs text-on-surface-variant">
              You have <span className="font-bold text-primary font-mono">{unreadCount}</span> unread dispatch updates.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              disabled={isMarkingAllRead}
              className="px-4 py-2 rounded-xl bg-surface border border-outline-variant/30 text-xs font-bold text-on-surface hover:text-primary transition-colors flex items-center gap-1.5 self-start sm:self-auto"
            >
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              <span>Mark All as Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <NotificationFilterBar filter={filter} onChange={setFilter} />

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-surface-container/60 border border-outline-variant/20 space-y-2">
          <Bell className="w-8 h-8 text-on-surface-variant/40 mx-auto" />
          <p className="text-sm font-bold text-on-surface">You&apos;re all caught up!</p>
          <p className="text-xs text-on-surface-variant">
            No alerts match your current filter criteria.
          </p>
          <button
            onClick={() => setFilter({ category: "ALL", readStatus: "ALL", searchQuery: "" })}
            className="px-4 py-1.5 rounded-xl bg-surface-container-highest text-xs font-semibold text-primary hover:underline mt-2"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <NotificationItemCard
              key={notif.id}
              notification={notif}
              onToggleRead={handleToggleRead}
            />
          ))}
        </div>
      )}
    </div>
  );
}
