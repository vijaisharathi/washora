"use client";

import React, { useState } from "react";
import { useAdminNotifications } from "../../hooks/useAdminNotifications";
import { NotificationsHeader } from "./NotificationsHeader";
import { NotificationsSummaryCards } from "./NotificationsSummaryCards";
import { NotificationsSearchFilterBar } from "./NotificationsSearchFilterBar";
import { NotificationsTable } from "./NotificationsTable";
import { NotificationsPagination } from "./NotificationsPagination";
import { DismissNotificationModal } from "./modals/DismissNotificationModal";
import { Notification } from "@/types/admin/notification";

export function NotificationsListMasterView() {
  const {
    organizationId,
    loading,
    error,
    summary,
    result,
    unreadCount,
    search,
    setSearch,
    status,
    setStatus,
    type,
    setType,
    priority,
    setPriority,
    datePreset,
    setDatePreset,
    page,
    setPage,
    pageSize,
    setPageSize,
    resetFilters,
    refetch,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    dismissNotification,
  } = useAdminNotifications();

  const [dismissTarget, setDismissTarget] = useState<Notification | null>(null);
  const [isDismissModalOpen, setIsDismissModalOpen] = useState(false);

  const handleDismissClick = (notif: Notification) => {
    setDismissTarget(notif);
    setIsDismissModalOpen(true);
  };

  const isFiltered =
    Boolean(search) ||
    status !== "all" ||
    type !== "all" ||
    priority !== "all" ||
    datePreset !== "all";

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <NotificationsHeader
        organizationId={organizationId}
        totalNotifications={result.total}
        unreadCount={unreadCount}
        onRefresh={refetch}
        onMarkAllRead={markAllAsRead}
        isLoading={loading}
      />

      {/* KPI Cards */}
      <NotificationsSummaryCards metrics={summary} isLoading={loading} />

      {/* Search & Filters */}
      <NotificationsSearchFilterBar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        type={type}
        onTypeChange={setType}
        priority={priority}
        onPriorityChange={setPriority}
        datePreset={datePreset}
        onDatePresetChange={setDatePreset}
        onReset={resetFilters}
        isFiltered={isFiltered}
      />

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500">
          {error}
        </div>
      )}

      {/* Table / List Cards */}
      <NotificationsTable
        notifications={result.notifications}
        isLoading={loading}
        onMarkRead={(n) => markAsRead(n.id)}
        onMarkUnread={(n) => markAsUnread(n.id)}
        onDismissClick={handleDismissClick}
        onResetFilters={resetFilters}
      />

      {/* Pagination */}
      <NotificationsPagination
        page={result.page}
        pageSize={result.pageSize}
        total={result.total}
        totalPages={result.totalPages}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      {/* Dismiss Modal */}
      <DismissNotificationModal
        isOpen={isDismissModalOpen}
        onClose={() => {
          setIsDismissModalOpen(false);
          setDismissTarget(null);
        }}
        notification={dismissTarget}
        onConfirm={async () => {
          if (dismissTarget) {
            await dismissNotification(dismissTarget.id);
          }
        }}
      />
    </div>
  );
}
