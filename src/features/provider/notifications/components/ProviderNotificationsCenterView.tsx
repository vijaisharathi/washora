"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useProviderNotifications } from "@/features/provider/notifications/hooks/useProviderNotifications";
import { ProviderNotificationCategory } from "@/types/provider/notifications";
import { ProviderLoadingState } from "@/features/provider/components/ProviderLoadingState";
import { ProviderEmptyState } from "@/features/provider/components/ProviderEmptyState";
import { NotificationFilterPills } from "./NotificationFilterPills";
import { NotificationListItem } from "./NotificationListItem";

export function ProviderNotificationsCenterView() {
  const [selectedCategory, setSelectedCategory] = useState<ProviderNotificationCategory>("ALL");
  const {
    notifications,
    isLoadingNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isMarkingAllRead,
  } = useProviderNotifications({ category: selectedCategory });

  if (isLoadingNotifications) {
    return <ProviderLoadingState message="Loading Studio Alerts &amp; Notifications..." />;
  }

  // Group notifications into Today, Yesterday, and Earlier
  const todayNotifs = notifications.filter((n) => n.dateGroup === "TODAY");
  const yesterdayNotifs = notifications.filter((n) => n.dateGroup === "YESTERDAY");
  const earlierNotifs = notifications.filter((n) => n.dateGroup === "EARLIER");

  return (
    <div className="space-y-6">
      {/* Action and Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <NotificationFilterPills
          activeCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllAsRead()}
              disabled={isMarkingAllRead}
              className="px-3.5 py-1.5 rounded-xl border border-white/10 hover:bg-surface-container text-xs font-semibold text-primary transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">done_all</span>
              <span>{isMarkingAllRead ? "Marking..." : "Mark all as read"}</span>
            </button>
          )}

          <Link
            href="/provider/notifications/preferences"
            className="p-2 rounded-xl bg-surface-container border border-white/10 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center"
            title="Notification Preferences"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
          </Link>
        </div>
      </div>

      {/* Empty State */}
      {notifications.length === 0 ? (
        <ProviderEmptyState
          title="No Notifications Found"
          description="You are fully caught up! There are no alerts in this category."
          iconName="notifications_off"
        />
      ) : (
        <div className="space-y-6">
          {/* Today Group */}
          {todayNotifs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider border-b border-white/5 pb-2">
                Today
              </h3>
              <div className="space-y-2.5">
                {todayNotifs.map((notif) => (
                  <NotificationListItem
                    key={notif.id}
                    notification={notif}
                    onMarkAsRead={markAsRead}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Yesterday Group */}
          {yesterdayNotifs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider border-b border-white/5 pb-2">
                Yesterday
              </h3>
              <div className="space-y-2.5">
                {yesterdayNotifs.map((notif) => (
                  <NotificationListItem
                    key={notif.id}
                    notification={notif}
                    onMarkAsRead={markAsRead}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Earlier Group */}
          {earlierNotifs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider border-b border-white/5 pb-2">
                Earlier
              </h3>
              <div className="space-y-2.5">
                {earlierNotifs.map((notif) => (
                  <NotificationListItem
                    key={notif.id}
                    notification={notif}
                    onMarkAsRead={markAsRead}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
