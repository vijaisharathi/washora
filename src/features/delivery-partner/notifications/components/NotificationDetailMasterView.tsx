"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  ClipboardList,
} from "lucide-react";
import { useDeliveryPartnerNotificationDetail } from "../hooks/useDeliveryPartnerNotifications";

interface NotificationDetailMasterViewProps {
  notificationId: string;
}

export function NotificationDetailMasterView({
  notificationId,
}: NotificationDetailMasterViewProps) {
  const { notification, isLoading, isError, error } =
    useDeliveryPartnerNotificationDetail(notificationId);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="h-10 w-32 bg-surface-container rounded-xl animate-pulse" />
        <div className="h-64 rounded-3xl bg-surface-container animate-pulse" />
      </div>
    );
  }

  if (isError || !notification) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-4 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-error/15 text-error flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-on-surface">Notification Not Found</h2>
          <p className="text-xs text-on-surface-variant">
            {error instanceof Error ? error.message : "The requested alert does not exist or is unauthorized."}
          </p>
        </div>
        <Link
          href="/delivery-partner/notifications"
          className="px-5 py-2 rounded-xl bg-surface-container-highest text-xs font-semibold text-on-surface hover:text-primary transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Alerts</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header & Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/delivery-partner/notifications"
          className="text-xs font-semibold text-on-surface-variant hover:text-on-surface flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Notification Center</span>
        </Link>

        <span className="text-xs font-mono uppercase px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/30 text-on-surface-variant font-bold">
          {notification.category}
        </span>
      </div>

      {/* Main Alert Bento */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-surface-container-high via-surface-container to-surface border border-outline-variant/30 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/20 pb-5">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-primary bg-primary/15 px-2 py-0.5 rounded border border-primary/25">
              Dispatch Update
            </span>
            <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">
              {notification.title}
            </h1>
            <p className="text-xs text-on-surface-variant font-mono">
              Timestamp: {new Date(notification.timestamp).toLocaleString()}
            </p>
          </div>

          <span
            className={`text-xs font-bold px-3 py-1.5 rounded-full border self-start sm:self-auto ${
              notification.priority === "URGENT"
                ? "bg-error/15 text-error border-error/30"
                : notification.priority === "HIGH"
                ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                : "bg-primary/15 text-primary border-primary/30"
            }`}
          >
            {notification.priority} Priority
          </span>
        </div>

        {/* Message Content */}
        <div className="p-5 rounded-2xl bg-surface/80 border border-outline-variant/20 space-y-2">
          <p className="text-sm text-on-surface leading-relaxed">
            {notification.message}
          </p>
        </div>

        {/* Related Entity Context */}
        {notification.relatedOrderId && (
          <div className="p-4 rounded-2xl bg-surface border border-outline-variant/15 text-xs flex items-center justify-between">
            <span className="text-on-surface-variant font-semibold">Associated Order:</span>
            <span className="font-mono font-bold text-primary">#{notification.relatedOrderId}</span>
          </div>
        )}

        {/* Direct Action Link */}
        {notification.actionUrl &&
          notification.actionUrl.startsWith('/') &&
          !notification.actionUrl.startsWith('//') && (
          <div className="pt-2 border-t border-outline-variant/15 flex items-center justify-between flex-wrap gap-3">
            <span className="text-xs text-on-surface-variant">Recommended Valet Action</span>
            <Link
              href={notification.actionUrl}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-md hover:opacity-90 transition-all flex items-center gap-1.5"
            >
              <span>{notification.actionLabel || "Open Destination"}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
