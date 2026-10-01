"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Bell,
  Power,
  ShieldCheck,
  Menu,
  X,
  Bike,
  Sparkles,
  MapPin,
} from "lucide-react";
import { useDeliveryPartnerSession } from "../hooks/useDeliveryPartnerSession";
import { useDeliveryPartnerUnreadCount } from "../notifications/hooks/useDeliveryPartnerNotifications";

interface DeliveryPartnerHeaderProps {
  title?: string;
  subtitle?: string;
}

export function DeliveryPartnerHeader({
  title = "Valet Logistics Portal",
  subtitle = "WASHORA Real-time Dispatch & Valet Command",
}: DeliveryPartnerHeaderProps) {
  const { partner, updateStatus, isUpdatingStatus } = useDeliveryPartnerSession();
  const { unreadCount } = useDeliveryPartnerUnreadCount();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isOnline = partner?.status === "ONLINE";

  const handleToggleDuty = () => {
    updateStatus(isOnline ? "OFFLINE" : "ONLINE");
  };

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 h-16 bg-surface-container/90 backdrop-blur-md border-b border-outline-variant/20 z-30 flex items-center justify-between px-4 md:px-8">
      {/* Title & Hub Location */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-lg"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div>
          <h1 className="text-sm md:text-base font-bold text-on-surface tracking-tight flex items-center gap-2">
            {title}
          </h1>
          <p className="text-[11px] text-on-surface-variant hidden sm:flex items-center gap-1">
            <MapPin className="w-3 h-3 text-primary/70" />
            {partner?.hubName || "Bengaluru Central Hub"} • {subtitle}
          </p>
        </div>
      </div>

      {/* Action Controls & Profile */}
      <div className="flex items-center gap-3">
        {/* Live Duty Toggle Button */}
        <button
          onClick={handleToggleDuty}
          disabled={isUpdatingStatus}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border shadow-sm ${
            isOnline
              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
              : "bg-surface-container-high text-on-surface-variant border-outline-variant/30 hover:text-on-surface"
          }`}
          title="Toggle Active Duty Status"
        >
          <Power className={`w-3.5 h-3.5 ${isOnline ? "text-emerald-400" : "text-on-surface-variant"}`} />
          <span className="hidden sm:inline">{isOnline ? "Online • Ready" : "Go Online"}</span>
          <span className="sm:hidden">{isOnline ? "Online" : "Offline"}</span>
        </button>

        {/* Notifications Icon Button */}
        <Link
          href="/delivery-partner/notifications"
          className="relative p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-full transition-colors"
          aria-label="Notifications"
          title="Valet Alerts & Dispatch Updates"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[14px] h-[14px] px-0.5 rounded-full bg-primary text-black font-mono font-bold text-[9px] flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* Partner Mini Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-outline-variant/20">
          <Link href="/delivery-partner/profile" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-primary/20 shrink-0 border border-primary/30">
              {partner?.avatarUrl ? (
                <Image
                  src={partner.avatarUrl}
                  alt={partner.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-xs text-primary">
                  {partner?.name?.charAt(0) || "V"}
                </div>
              )}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-on-surface leading-tight flex items-center gap-1">
                {partner?.name || "Vikram Singh"}
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
              </p>
              <p className="text-[10px] text-on-surface-variant font-mono">{partner?.rating || 4.9} ★ Valet</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bg-surface-container-high/95 backdrop-blur-xl border-b border-outline-variant/30 p-4 space-y-3 z-50 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container border border-outline-variant/20">
            <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface">{partner?.name || "Valet Partner"}</p>
              <p className="text-[10px] text-on-surface-variant font-mono">{partner?.hubName}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
            <Link
              href="/delivery-partner"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-surface-container border border-outline-variant/20 font-semibold text-on-surface text-center hover:bg-primary/15 hover:text-primary"
            >
              Dashboard
            </Link>
            <Link
              href="/delivery-partner/tasks"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-surface-container border border-outline-variant/20 font-semibold text-on-surface text-center hover:bg-primary/15 hover:text-primary"
            >
              Task Queue
            </Link>
            <Link
              href="/delivery-partner/schedule"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-surface-container border border-outline-variant/20 font-semibold text-on-surface text-center hover:bg-primary/15 hover:text-primary"
            >
              Schedule
            </Link>
            <Link
              href="/delivery-partner/earnings"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-surface-container border border-outline-variant/20 font-semibold text-on-surface text-center hover:bg-primary/15 hover:text-primary"
            >
              Earnings
            </Link>
            <Link
              href="/delivery-partner/history"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-surface-container border border-outline-variant/20 font-semibold text-on-surface text-center hover:bg-primary/15 hover:text-primary"
            >
              Trip History
            </Link>
            <Link
              href="/delivery-partner/reviews"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-surface-container border border-outline-variant/20 font-semibold text-on-surface text-center hover:bg-primary/15 hover:text-primary"
            >
              Reviews
            </Link>
            <Link
              href="/delivery-partner/notifications"
              onClick={() => setMobileMenuOpen(false)}
              className="col-span-2 p-2.5 rounded-xl bg-primary/15 border border-primary/25 font-bold text-primary text-center hover:bg-primary hover:text-primary-foreground"
            >
              Alerts & Notifications {unreadCount > 0 && `(${unreadCount})`}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
