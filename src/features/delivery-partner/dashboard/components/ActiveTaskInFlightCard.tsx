"use client";

import React, { useState } from "react";
import {
  Navigation,
  Phone,
  MapPin,
  Clock,
  Package,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { DeliveryPartnerTaskPreview } from "@/types/delivery-partner";

interface ActiveTaskInFlightCardProps {
  task: DeliveryPartnerTaskPreview | null;
}

export function ActiveTaskInFlightCard({ task }: ActiveTaskInFlightCardProps) {
  const [callInitiated, setCallInitiated] = useState(false);

  if (!task) {
    return (
      <div className="p-6 rounded-3xl bg-surface-container/70 border border-outline-variant/25 flex flex-col items-center justify-center text-center space-y-2 py-10">
        <div className="w-10 h-10 rounded-2xl bg-surface-container-high flex items-center justify-center text-on-surface-variant">
          <Package className="w-5 h-5" />
        </div>
        <p className="text-sm font-bold text-on-surface">No In-Flight Task Active</p>
        <p className="text-xs text-on-surface-variant max-w-sm">
          You are currently ready for new dispatch requests. Toggle online duty to receive incoming pickup and dropoff runs.
        </p>
      </div>
    );
  }

  const handleCall = () => {
    setCallInitiated(true);
    setTimeout(() => setCallInitiated(false), 3000);
  };

  return (
    <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-950/30 via-surface-container/80 to-surface-container border border-purple-500/30 shadow-xl space-y-4 relative overflow-hidden">
      {/* Top Bar with Status and Priority badge */}
      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 animate-pulse">
            <Navigation className="w-3.5 h-3.5" /> LIVE IN-FLIGHT RUN
          </span>
          <span className="font-mono text-xs font-bold text-on-surface">
            Order #{task.orderId}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {task.isPriority && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Sparkles className="w-3 h-3" /> Priority Express
            </span>
          )}
          <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
            +₹{task.payoutAmount} payout
          </span>
        </div>
      </div>

      {/* Task Route Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Pickup Details */}
        <div className="p-3.5 rounded-2xl bg-surface/80 border border-outline-variant/20 space-y-1">
          <span className="text-[10px] uppercase font-bold text-on-surface-variant flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            Pickup Origin
          </span>
          <p className="font-semibold text-on-surface">{task.pickupAddress}</p>
        </div>

        {/* Delivery Details */}
        <div className="p-3.5 rounded-2xl bg-surface/80 border border-outline-variant/20 space-y-1">
          <span className="text-[10px] uppercase font-bold text-on-surface-variant flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            Destination Dropoff
          </span>
          <p className="font-semibold text-on-surface">{task.deliveryAddress}</p>
        </div>
      </div>

      {/* Item Summary & ETA Bar */}
      <div className="p-3.5 rounded-2xl bg-surface-container-high/60 border border-outline-variant/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <p className="font-semibold text-on-surface flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-primary" /> {task.itemSummary}
          </p>
          <p className="text-[11px] text-on-surface-variant">
            Customer: <span className="text-on-surface font-medium">{task.customerName}</span> • {task.packageCount} Garment Pack(s)
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-on-surface shrink-0">
          <Clock className="w-3.5 h-3.5 text-primary" />
          <span>Window: {task.scheduledTimeWindow}</span>
          <span className="text-primary font-bold">({task.distanceKm} km away)</span>
        </div>
      </div>

      {/* Quick Action Controls */}
      <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
        <button
          onClick={handleCall}
          className="px-4 py-2 rounded-xl bg-surface border border-outline-variant/30 text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-1.5"
        >
          <Phone className="w-3.5 h-3.5 text-primary" />
          <span>{callInitiated ? "Connecting Call..." : `Call Customer (${task.customerPhone})`}</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-on-surface-variant">
            GPS Navigation unlocked in phase D6
          </span>
        </div>
      </div>
    </div>
  );
}
