"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  MailCheck,
  Mail,
  Trash2,
  ExternalLink,
  Flame,
  AlertTriangle,
  Info,
  CheckCircle,
  Building2,
  Clock,
  Layers,
  Store,
  Bike,
  User,
  CreditCard,
  Star,
  Activity,
  Terminal,
} from "lucide-react";
import { useAdminNotificationDetails } from "@/features/admin/hooks/useAdminNotifications";
import {
  NotificationType,
  NotificationPriority,
  NotificationStatus,
} from "@/types/admin/notification";
import { DismissNotificationModal } from "../modals/DismissNotificationModal";

interface NotificationDetailsMasterViewProps {
  notificationId: string;
}

export function NotificationDetailsMasterView({
  notificationId,
}: NotificationDetailsMasterViewProps) {
  const router = useRouter();
  const {
    loading,
    error,
    data,
    markAsRead,
    markAsUnread,
    dismiss,
  } = useAdminNotificationDetails(notificationId);

  const [isDismissModalOpen, setIsDismissModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="w-32 h-6 bg-surface-container-high rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-surface-container-high rounded-xl" />
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-surface-container-high rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-12 text-center bg-surface-container-lowest border border-outline-variant/30 rounded-xl my-6">
        <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-on-surface mb-1">
          Notification Not Found
        </h2>
        <p className="text-xs text-on-surface-variant max-w-sm mx-auto mb-6">
          {error || `Notification ${notificationId} was not found in this organization.`}
        </p>
        <Link
          href="/admin/notifications"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Notifications</span>
        </Link>
      </div>
    );
  }

  const { notification, relatedEntitySummary } = data;
  const isUnread = notification.status === "Unread";

  const renderPriorityBadge = (priority: NotificationPriority) => {
    switch (priority) {
      case "Critical":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <Flame className="w-3.5 h-3.5" />
            Critical Priority
          </span>
        );
      case "High":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <AlertTriangle className="w-3.5 h-3.5" />
            High Priority
          </span>
        );
      case "Normal":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            Normal Priority
          </span>
        );
      case "Low":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-surface-container-high text-on-surface-variant">
            Low Priority
          </span>
        );
    }
  };

  const formattedCreated = new Date(notification.createdAt).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedRead = notification.readAt
    ? new Date(notification.readAt).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/notifications"
            className="p-2 rounded-lg border border-outline-variant/50 hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
            title="Back to notifications"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold text-on-surface tracking-tight font-mono">
                {notification.id}
              </h1>
              {renderPriorityBadge(notification.priority)}
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                  isUnread
                    ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                    : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                }`}
              >
                {notification.status}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant flex items-center gap-2 mt-0.5">
              <span>Category: {notification.type}</span>
              <span>•</span>
              <span className="font-mono">Org: {notification.organizationId}</span>
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2">
          {isUnread ? (
            <button
              onClick={markAsRead}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/50 hover:bg-surface-container text-xs font-medium text-on-surface transition-colors"
            >
              <MailCheck className="w-3.5 h-3.5 text-primary" />
              <span>Mark as Read</span>
            </button>
          ) : (
            <button
              onClick={markAsUnread}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/50 hover:bg-surface-container text-xs font-medium text-on-surface transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-on-surface-variant" />
              <span>Mark as Unread</span>
            </button>
          )}

          <button
            onClick={() => setIsDismissModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Dismiss</span>
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Notification Message Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface">
                Operational Alert Details
              </span>
              <span className="text-xs text-on-surface-variant font-mono">
                {formattedCreated}
              </span>
            </div>

            <h2 className="text-base font-bold text-on-surface">
              {notification.title}
            </h2>

            <div className="p-4 rounded-xl bg-surface-container/60 border border-outline-variant/20 text-sm text-on-surface leading-relaxed">
              {notification.message}
            </div>

            {/* Timestamps and State Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-lg bg-surface-container/40 border border-outline-variant/20">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold block mb-0.5">
                  Trigger Timestamp
                </span>
                <span className="font-mono text-on-surface">{formattedCreated}</span>
              </div>

              <div className="p-3 rounded-lg bg-surface-container/40 border border-outline-variant/20">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold block mb-0.5">
                  Read Status
                </span>
                <span className="font-mono text-on-surface">
                  {formattedRead ? `Read at ${formattedRead}` : "Unread"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Related Entity Context */}
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface">
                Related Entity Context
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-surface-container-high text-primary font-semibold">
                {notification.relatedEntityType || "System"}
              </span>
            </div>

            {relatedEntitySummary ? (
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold">
                    {relatedEntitySummary.entityType} ID
                  </span>
                  <p className="font-mono font-bold text-on-surface text-sm">
                    {relatedEntitySummary.id}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold">
                    Title & Subject
                  </span>
                  <p className="font-semibold text-on-surface text-xs">
                    {relatedEntitySummary.title}
                  </p>
                  {relatedEntitySummary.subtitle && (
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      {relatedEntitySummary.subtitle}
                    </p>
                  )}
                </div>

                {relatedEntitySummary.status && (
                  <div>
                    <span className="text-[10px] text-on-surface-variant uppercase font-bold">
                      Status
                    </span>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-surface-container text-xs font-medium text-on-surface">
                      {relatedEntitySummary.status}
                    </span>
                  </div>
                )}

                {relatedEntitySummary.route && (
                  <div className="pt-3 border-t border-outline-variant/20">
                    <Link
                      href={relatedEntitySummary.route}
                      className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
                    >
                      <span>Open Related Record</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-on-surface-variant">
                <Info className="w-6 h-6 mx-auto mb-2 text-on-surface-variant/60" />
                <span>This notification is a platform-wide system alert with no single linked domain record.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dismiss Modal */}
      <DismissNotificationModal
        isOpen={isDismissModalOpen}
        onClose={() => setIsDismissModalOpen(false)}
        notification={notification}
        onConfirm={async () => {
          await dismiss();
          router.push("/admin/notifications");
        }}
      />
    </div>
  );
}
