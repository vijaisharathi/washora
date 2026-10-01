"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CustomerNotificationItem } from "@/types/customer/notifications";
import {
  Truck,
  Sparkles,
  Star,
  CreditCard,
  ShieldCheck,
  Tag,
  Check,
  Trash2,
  ChevronRight,
} from "lucide-react";

interface NotificationItemCardProps {
  notification: CustomerNotificationItem;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  orders: <Truck className="h-5 w-5 text-primary" />,
  offers: <Tag className="h-5 w-5 text-purple-400" />,
  reviews: <Star className="h-5 w-5 text-yellow-400" />,
  payments: <CreditCard className="h-5 w-5 text-green-400" />,
  system: <ShieldCheck className="h-5 w-5 text-blue-400" />,
};

export function NotificationItemCard({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationItemCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    if (
      notification.actionUrl &&
      notification.actionUrl.startsWith('/') &&
      !notification.actionUrl.startsWith('//')
    ) {
      router.push(notification.actionUrl);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`rounded-2xl p-4 sm:p-5 flex gap-4 items-start transition-all cursor-pointer border relative overflow-hidden group shadow-md ${
        notification.isRead
          ? "bg-surface-container/60 border-white/5 opacity-75 hover:opacity-100 hover:bg-surface-container"
          : "bg-surface-container border-white/10 hover:border-primary/40 hover:bg-surface-container-high"
      }`}
    >
      {/* Left Active Purple Accent Strip for Unread Items */}
      {!notification.isRead && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
      )}

      {/* Category Icon Bubble */}
      <div className="w-11 h-11 rounded-xl bg-surface-container-high border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
        {CATEGORY_ICONS[notification.category] || <Sparkles className="h-5 w-5 text-primary" />}
      </div>

      {/* Notification Body */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex justify-between items-start gap-2">
          <span
            className={`text-[10px] uppercase font-bold tracking-wider ${
              notification.category === "offers"
                ? "text-purple-400"
                : notification.category === "reviews"
                ? "text-yellow-400"
                : notification.category === "payments"
                ? "text-green-400"
                : "text-primary"
            }`}
          >
            {notification.categoryLabel}
          </span>
          <span className="text-[11px] text-on-surface-variant shrink-0">
            {notification.relativeTime}
          </span>
        </div>

        <h4
          className={`text-xs sm:text-sm font-headline ${
            notification.isRead ? "text-on-surface font-semibold" : "text-on-surface font-bold"
          }`}
        >
          {notification.title}
        </h4>

        <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
          {notification.message}
        </p>

        {notification.orderId && (
          <div className="pt-1">
            <span className="font-mono text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
              #{notification.orderId}
            </span>
          </div>
        )}
      </div>

      {/* Trailing Action Buttons */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {!notification.isRead && (
          <button
            type="button"
            title="Mark as read"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(notification.id);
            }}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
          >
            <Check className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          title="Dismiss"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
          className="p-1.5 rounded-lg text-on-surface-variant hover:text-red-400 hover:bg-surface-container-high transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
