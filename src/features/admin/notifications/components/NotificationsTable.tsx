"use client";

import React from "react";
import Link from "next/link";
import {
  Bell,
  Eye,
  MailCheck,
  Mail,
  Trash2,
  ExternalLink,
  RotateCcw,
  Flame,
  AlertTriangle,
  Info,
  CheckCircle,
  Calendar,
  Layers,
  Store,
  Bike,
  User,
  CreditCard,
  Star,
  Activity,
  Terminal,
} from "lucide-react";
import {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationStatus,
} from "@/types/admin/notification";

interface NotificationsTableProps {
  notifications: Notification[];
  isLoading?: boolean;
  onMarkRead: (notif: Notification) => void;
  onMarkUnread: (notif: Notification) => void;
  onDismissClick: (notif: Notification) => void;
  onResetFilters?: () => void;
}

export function NotificationsTable({
  notifications,
  isLoading,
  onMarkRead,
  onMarkUnread,
  onDismissClick,
  onResetFilters,
}: NotificationsTableProps) {
  if (isLoading) {
    return (
      <div className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden p-6 space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 animate-pulse">
            <div className="w-8 h-8 bg-surface-container-high rounded-lg shrink-0" />
            <div className="w-20 h-4 bg-surface-container-high rounded" />
            <div className="flex-1 space-y-2">
              <div className="w-1/3 h-4 bg-surface-container-high rounded" />
              <div className="w-2/3 h-3 bg-surface-container-high rounded" />
            </div>
            <div className="w-20 h-4 bg-surface-container-high rounded" />
            <div className="w-16 h-4 bg-surface-container-high rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-12 text-center">
        <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center mx-auto mb-3 text-on-surface-variant">
          <Bell className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-on-surface mb-1">
          No Notifications Found
        </h3>
        <p className="text-xs text-on-surface-variant max-w-sm mx-auto mb-4">
          You are all caught up! No notifications match your active search and filter criteria.
        </p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>
    );
  }

  const renderTypeIcon = (type: NotificationType) => {
    switch (type) {
      case "Booking":
        return <Layers className="w-4 h-4 text-primary" />;
      case "Assignment":
        return <Activity className="w-4 h-4 text-primary" />;
      case "Payment":
        return <CreditCard className="w-4 h-4 text-emerald-500" />;
      case "Review":
        return <Star className="w-4 h-4 text-amber-500" />;
      case "Provider":
        return <Store className="w-4 h-4 text-primary" />;
      case "Delivery Partner":
        return <Bike className="w-4 h-4 text-primary" />;
      case "Customer":
        return <User className="w-4 h-4 text-primary" />;
      case "Service":
        return <Layers className="w-4 h-4 text-primary" />;
      case "System":
        return <Terminal className="w-4 h-4 text-slate-400" />;
      default:
        return <Bell className="w-4 h-4 text-primary" />;
    }
  };

  const renderPriorityBadge = (priority: NotificationPriority) => {
    switch (priority) {
      case "Critical":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <Flame className="w-3 h-3" />
            Critical
          </span>
        );
      case "High":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <AlertTriangle className="w-3 h-3" />
            High
          </span>
        );
      case "Normal":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
            Normal
          </span>
        );
      case "Low":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface-container-high text-on-surface-variant">
            Low
          </span>
        );
    }
  };

  return (
    <div className="w-full space-y-2.5">
      {notifications.map((n) => {
        const isUnread = n.status === "Unread";
        const formattedDate = new Date(n.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <div
            key={n.id}
            className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              isUnread
                ? "bg-surface-container-lowest border-primary/40 shadow-sm"
                : "bg-surface-container-lowest/70 border-outline-variant/30 hover:border-outline-variant/60"
            }`}
          >
            {/* Left Column: Icon + Category + Unread dot + Title & message */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {/* Category Icon */}
              <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center border border-outline-variant/40 shrink-0 mt-0.5">
                {renderTypeIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {/* Unread indicator */}
                  {isUnread && (
                    <span
                      className="w-2 h-2 rounded-full bg-primary shrink-0"
                      title="Unread"
                    />
                  )}

                  <span className="text-[11px] font-bold text-on-surface-variant font-mono">
                    {n.id}
                  </span>

                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant font-medium">
                    {n.type}
                  </span>

                  {renderPriorityBadge(n.priority)}

                  <span className="text-[10px] text-on-surface-variant font-mono sm:ml-auto">
                    {formattedDate}
                  </span>
                </div>

                <Link
                  href={`/admin/notifications/${n.id}`}
                  className={`text-xs block font-bold transition-colors hover:text-primary ${
                    isUnread ? "text-on-surface" : "text-on-surface-variant"
                  }`}
                >
                  {n.title}
                </Link>

                <p className="text-[11px] text-on-surface-variant line-clamp-1 mt-0.5">
                  {n.message}
                </p>

                {n.relatedEntityId && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[10px] text-on-surface-variant">
                      Related:
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-container-high text-primary font-semibold">
                      {n.relatedEntityType}: {n.relatedEntityId}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Actions */}
            <div className="flex items-center gap-1.5 sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-outline-variant/20 justify-end">
              <Link
                href={`/admin/notifications/${n.id}`}
                className="p-1.5 rounded-lg border border-outline-variant/40 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
                title="View Full Details"
              >
                <Eye className="w-3.5 h-3.5" />
              </Link>

              {isUnread ? (
                <button
                  onClick={() => onMarkRead(n)}
                  className="p-1.5 rounded-lg border border-outline-variant/40 hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-colors"
                  title="Mark as Read"
                >
                  <MailCheck className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => onMarkUnread(n)}
                  className="p-1.5 rounded-lg border border-outline-variant/40 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
                  title="Mark as Unread"
                >
                  <Mail className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={() => onDismissClick(n)}
                className="p-1.5 rounded-lg border border-outline-variant/40 hover:bg-rose-500/10 text-on-surface-variant hover:text-rose-500 transition-colors"
                title="Dismiss Notification"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
