"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowUp,
  ArrowDown,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Package,
  Calendar,
  PackageCheck,
  Navigation,
} from "lucide-react";
import { RouteStop } from "@/types/delivery-partner";

interface RouteStopCardProps {
  stop: RouteStop;
  index: number;
  totalStops: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onReschedule: () => void;
}

export function RouteStopCard({
  stop,
  index,
  totalStops,
  onMoveUp,
  onMoveDown,
  onReschedule,
}: RouteStopCardProps) {
  const isPickup = stop.type === "CUSTOMER_PICKUP";
  const isDelivery = stop.type === "CUSTOMER_DELIVERY";

  return (
    <div
      className={`p-5 rounded-3xl border transition-all space-y-4 shadow-sm ${
        stop.isCompleted
          ? "bg-surface-container/50 border-outline-variant/15 opacity-80"
          : "bg-surface-container/85 border-outline-variant/25 hover:border-primary/30"
      }`}
    >
      {/* Top Header: Stop Number & Sequence Movement */}
      <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-primary/20 text-primary font-mono font-bold text-xs flex items-center justify-center border border-primary/30">
            #{stop.stopNumber}
          </div>

          <div>
            <span className="text-xs font-mono font-bold text-on-surface">
              Order #{stop.orderId}
            </span>
            <span
              className={`text-[9px] uppercase font-bold ml-2 px-2 py-0.5 rounded border ${
                isPickup
                  ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                  : "bg-purple-500/15 text-purple-400 border-purple-500/30"
              }`}
            >
              {stop.type.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Reorder Buttons & Status */}
        <div className="flex items-center gap-2">
          {stop.isCompleted ? (
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Completed
            </span>
          ) : (
            <span className="text-[10px] font-mono text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded">
              {stop.estimatedEta}
            </span>
          )}

          {!stop.isCompleted && (
            <div className="flex items-center gap-1 bg-surface p-0.5 rounded-lg border border-outline-variant/20">
              <button
                onClick={onMoveUp}
                disabled={index === 0}
                className="p-1 text-on-surface-variant hover:text-on-surface disabled:opacity-30 rounded hover:bg-surface-container transition-colors"
                title="Move earlier in route"
                aria-label="Move stop earlier"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onMoveDown}
                disabled={index === totalStops - 1}
                className="p-1 text-on-surface-variant hover:text-on-surface disabled:opacity-30 rounded hover:bg-surface-container transition-colors"
                title="Move later in route"
                aria-label="Move stop later"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Address & Window Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-2xl bg-surface border border-outline-variant/15 space-y-1">
          <span className="text-[9px] uppercase font-bold text-on-surface-variant flex items-center gap-1">
            <MapPin className={`w-3 h-3 ${isPickup ? "text-amber-400" : "text-purple-400"}`} />
            {isPickup ? "Pickup Address" : "Dropoff Address"}
          </span>
          <p className="font-semibold text-on-surface truncate">{stop.address}</p>
          <p className="text-[10px] text-on-surface-variant font-medium">Customer: {stop.customerName}</p>
        </div>

        <div className="p-3 rounded-2xl bg-surface border border-outline-variant/15 space-y-1">
          <span className="text-[9px] uppercase font-bold text-on-surface-variant flex items-center gap-1">
            <Clock className="w-3 h-3 text-primary" /> Scheduled Time Window
          </span>
          <p className="font-mono font-bold text-on-surface">{stop.timeWindow}</p>
          <p className="text-[10px] text-emerald-400 font-mono font-semibold">+₹{stop.payoutAmount} payout • {stop.distanceKm} km</p>
        </div>
      </div>

      {/* Action Links Bar */}
      <div className="flex items-center justify-between pt-1 border-t border-outline-variant/15 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Link
            href={`/delivery-partner/tasks/${stop.taskId}`}
            className="text-xs text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
          >
            <span>Task Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>

          {!stop.isCompleted && (
            <button
              onClick={onReschedule}
              className="text-xs text-on-surface-variant hover:text-on-surface underline transition-colors"
            >
              Reschedule
            </button>
          )}
        </div>

        <div>
          {isPickup && !stop.isCompleted && (
            <Link
              href={`/delivery-partner/pickup/${stop.taskId}`}
              className="px-4 py-1.5 rounded-xl bg-amber-500 text-black text-xs font-bold shadow hover:bg-amber-400 transition-colors flex items-center gap-1.5"
            >
              <PackageCheck className="w-3.5 h-3.5" />
              <span>Execute Pickup</span>
            </Link>
          )}

          {isDelivery && !stop.isCompleted && (
            <Link
              href={`/delivery-partner/deliveries/${stop.taskId}`}
              className="px-4 py-1.5 rounded-xl bg-purple-500 text-black text-xs font-bold shadow hover:bg-purple-400 transition-colors flex items-center gap-1.5"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Execute Handover</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
