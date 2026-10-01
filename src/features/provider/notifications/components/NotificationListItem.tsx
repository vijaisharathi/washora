"use client";

import React from "react";
import Link from "next/link";
import { ProviderNotificationItem } from "@/types/provider/notifications";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

interface NotificationListItemProps {
  notification: ProviderNotificationItem;
  onMarkAsRead: (id: string) => void;
}

export function NotificationListItem({
  notification,
  onMarkAsRead,
}: NotificationListItemProps) {
  const getIconAndColors = () => {
    switch (notification.type) {
      case "NEW_BOOKING":
        return {
          icon: "event_available",
          bg: "bg-primary-container/20",
          text: "text-primary",
          tagBg: "text-primary",
        };
      case "ORDER_UPDATE":
        return {
          icon: "local_shipping",
          bg: "bg-surface-container-high",
          text: "text-on-surface-variant",
          tagBg: "text-on-surface-variant",
        };
      case "NEW_REVIEW":
        return {
          icon: "star",
          bg: "bg-emerald-950/40",
          text: "text-emerald-400",
          tagBg: "text-emerald-400",
        };
      case "PAYOUT_PROCESSED":
        return {
          icon: "account_balance_wallet",
          bg: "bg-surface-container-high",
          text: "text-primary",
          tagBg: "text-primary",
        };
      case "ACCOUNT_VERIFIED":
        return {
          icon: "verified_user",
          bg: "bg-emerald-950/40",
          text: "text-emerald-400",
          tagBg: "text-emerald-400",
        };
      case "SYSTEM_ALERT":
      default:
        return {
          icon: "info",
          bg: "bg-amber-950/40",
          text: "text-amber-300",
          tagBg: "text-amber-300",
        };
    }
  };

  const style = getIconAndColors();

  const handleCardClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  const content = (
    <ProviderCard
      variant="container"
      onClick={handleCardClick}
      className={`p-4 md:p-5 flex gap-4 items-start transition-all hover:border-primary/40 relative overflow-hidden group cursor-pointer ${
        !notification.isRead
          ? "border-l-4 border-l-primary bg-surface-container-high/40"
          : "opacity-85 hover:opacity-100"
      }`}
    >
      {/* Icon Badge */}
      <div
        className={`w-10 h-10 rounded-full ${style.bg} flex items-center justify-center ${style.text} shrink-0 border border-white/5`}
      >
        <span className="material-symbols-outlined text-[20px]">{style.icon}</span>
      </div>

      {/* Text Context */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${style.tagBg}`}>
            {notification.type.replace(/_/g, " ")}
          </span>
          <span className="text-[11px] text-on-surface-variant font-mono">
            {notification.timeAgo}
          </span>
        </div>

        <h4 className="text-xs md:text-sm font-bold text-on-surface leading-tight mb-1">
          {notification.title}
        </h4>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          {notification.message}
        </p>
      </div>

      {/* Unread dot */}
      {!notification.isRead && (
        <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 self-center shadow-sm shadow-primary" />
      )}
    </ProviderCard>
  );

  const isSafeInternalUrl =
    notification.actionUrl &&
    notification.actionUrl.startsWith('/') &&
    !notification.actionUrl.startsWith('//');

  if (isSafeInternalUrl) {
    return (
      <Link href={notification.actionUrl!} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
