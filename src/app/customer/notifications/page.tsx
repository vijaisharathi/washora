"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useNotifications } from "@/features/customer/hooks/useNotifications";
import { NotificationFilterTabs } from "@/features/customer/components/notifications/NotificationFilterTabs";
import { NotificationItemCard } from "@/features/customer/components/notifications/NotificationItemCard";
import { NotificationEmptyState } from "@/features/customer/components/notifications/NotificationEmptyState";
import { NotificationSkeleton } from "@/features/customer/components/notifications/NotificationSkeleton";
import { NotificationCategory } from "@/types/customer/notifications";
import { CheckCheck, Settings, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CustomerNotificationsPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    isMarkingAll,
    deleteNotification,
  } = useNotifications();

  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory>("all");

  if (isLoading) {
    return <NotificationSkeleton />;
  }

  const filteredNotifications = notifications.filter((item) => {
    if (selectedCategory === "all") return true;
    return item.category === selectedCategory;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 pb-24 animate-in fade-in zoom-in-95 duration-200">
      {/* Header Section matching Stitch anything_clean_notifications_center */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/5 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-on-surface font-headline">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="bg-primary/20 text-primary border border-primary/30 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-xs text-on-surface-variant">
            Stay updated on bookings, garment processing, valet pick-ups, and payments.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllAsRead()}
            disabled={isMarkingAll || unreadCount === 0}
            className="text-xs font-semibold gap-1.5 h-9"
          >
            {isMarkingAll ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCheck className="h-3.5 w-3.5 text-primary" />
            )}
            <span>Mark all as read</span>
          </Button>

          <Link href="/customer/notifications/preferences">
            <Button
              variant="ghost"
              size="sm"
              className="text-on-surface-variant hover:text-primary h-9 px-2.5"
              title="Notification Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <NotificationFilterTabs
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Notification List or Empty State */}
      {filteredNotifications.length === 0 ? (
        <NotificationEmptyState category={selectedCategory} />
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <NotificationItemCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={markAsRead}
              onDelete={deleteNotification}
            />
          ))}
        </div>
      )}
    </div>
  );
}
