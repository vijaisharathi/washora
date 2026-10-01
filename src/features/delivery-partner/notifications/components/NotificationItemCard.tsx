"use client";

import React from "react";
import Link from "next/link";
import {
  ClipboardList,
  Navigation,
  Wallet,
  Star,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  CircleDot,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { DeliveryPartnerNotification } from "@/types/delivery-partner";

interface NotificationItemCardProps {
  notification: DeliveryPartnerNotification;
  onToggleRead: (id: string, isRead: boolean) => void;
}

export function NotificationItemCard({
  notification,
  onToggleRead,
}: NotificationItemCardProps) {
  const getCategoryIcon = () => {
    switch (notification.category) {
      case "TASK":
      case "PICKUP":
        return <ClipboardList className="w-4 h-4 text-primary" />;
      case "DELIVERY":
        return <Navigation className="w-4 h-4 text-emerald-400" />;
      case "EARNINGS":
        return <Wallet className="w-4 h-4 text-emerald-400" />;
      case "REVIEW":
        return <Star className="w-4 h-4 text-amber-400" />;
      case "SCHEDULE":
        return <Calendar className="w-4 h-4 text-purple-400" />;
      case "SYSTEM":
      default:
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div
      className={`p-4 md:p-5 rounded-3xl border transition-all space-y-3 ${
        notification.isRead
          ? "bg-surface-container/60 border-outline-variant/15 opacity-85 hover:opacity-100"
          : "bg-surface-container border-primary/30 shadow-md ring-1 ring-primary/20"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-surface-container-high flex items-center justify-center shrink-0 border border-outline-variant/20">
            {getCategoryIcon()}
          </div>

          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {!notification.isRead && (
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}
              <h2 className="text-xs font-bold text-on-surface truncate">
                {notification.title}
              </h2>
              {notification.priority === "URGENT" && (
                <span className="text-[9px] uppercase font-bold text-error bg-error/15 px-1.5 py-0.2 rounded border border-error/30">
                  Urgent
                </span>
              )}
              {notification.priority === "HIGH" && (
                <span className="text-[9px] uppercase font-bold text-amber-400 bg-amber-500/15 px-1.5 py-0.2 rounded border border-amber-500/30">
                  Priority
                </span>
              )}
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {notification.message}
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-on-surface-variant/70 whitespace-nowrap shrink-0">
          {new Date(notification.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      {/* Bottom Bar: Action CTA and Read/Unread Controls */}
      <div className="flex items-center justify-between pt-2 border-t border-outline-variant/15 text-xs flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {notification.actionUrl &&
            notification.actionUrl.startsWith('/') &&
            !notification.actionUrl.startsWith('//') && (
            <Link
              href={notification.actionUrl}
              className="px-3 py-1.5 rounded-xl bg-primary/15 text-primary hover:bg-primary hover:text-primary-foreground font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <span>{notification.actionLabel || "View Action"}</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}

          <Link
            href={`/delivery-partner/notifications/${notification.id}`}
            className="text-[11px] text-on-surface-variant hover:text-on-surface font-semibold px-2 py-1"
          >
            Details
          </Link>
        </div>

        <button
          onClick={() => onToggleRead(notification.id, notification.isRead)}
          className="text-[10px] text-on-surface-variant hover:text-primary font-mono transition-colors"
        >
          {notification.isRead ? "Mark Unread" : "Mark Read"}
        </button>
      </div>
    </div>
  );
}
