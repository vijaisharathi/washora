"use client";

import React from "react";
import Link from "next/link";
import {
  MapPin,
  Clock,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Package,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { DeliveryHistoryRecord } from "@/types/delivery-partner";

interface HistoryRecordCardProps {
  record: DeliveryHistoryRecord;
}

export function HistoryRecordCard({ record }: HistoryRecordCardProps) {
  const isFailed = record.outcome === "FAILED" || record.outcome === "CANCELLED";

  return (
    <div className="p-5 rounded-3xl bg-surface-container/80 border border-outline-variant/25 shadow-sm hover:border-primary/40 transition-all space-y-4">
      <div className="flex items-start justify-between gap-3 border-b border-outline-variant/15 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm text-on-surface">
              #{record.orderId}
            </span>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-semibold">
              {record.type.replace(/_/g, " ")}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant">
            Customer: <span className="text-on-surface font-semibold">{record.customerName}</span>
          </p>
        </div>

        <div className="text-right">
          {record.outcome === "DELIVERED" && (
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1 w-fit ml-auto">
              <CheckCircle2 className="w-3 h-3" /> Delivered
            </span>
          )}
          {record.outcome === "PICKED_UP" && (
            <span className="text-[10px] font-bold text-primary bg-primary/15 px-2.5 py-1 rounded-full border border-primary/30 flex items-center gap-1 w-fit ml-auto">
              <CheckCircle2 className="w-3 h-3" /> Picked Up
            </span>
          )}
          {isFailed && (
            <span className="text-[10px] font-bold text-error bg-error/15 px-2.5 py-1 rounded-full border border-error/30 flex items-center gap-1 w-fit ml-auto">
              <XCircle className="w-3 h-3" /> {record.outcome}
            </span>
          )}
          <span className="text-[10px] text-on-surface-variant font-mono block mt-1">
            {new Date(record.completedAt).toLocaleDateString([], { month: "short", day: "numeric" })} • {new Date(record.completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>

      {/* Locations */}
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center gap-2 text-on-surface-variant">
          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">{record.pickupAddress}</span>
        </div>
        <div className="flex items-center gap-2 text-on-surface-variant">
          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate font-semibold text-on-surface">{record.deliveryAddress}</span>
        </div>
      </div>

      {/* Package Items & Earned Amount Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-outline-variant/15 text-xs flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-on-surface-variant">
            <Package className="w-3.5 h-3.5 text-primary" />
            <span className="font-mono">{record.packageCount} items</span>
          </span>
          <span className="text-on-surface-variant font-mono">
            {record.distanceKm} km
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-on-surface-variant font-mono block">Valet Fare</span>
            <span className="text-sm font-mono font-bold text-emerald-400">
              +₹{record.earnedAmount}
            </span>
          </div>

          <Link
            href={`/delivery-partner/history/${record.id}`}
            className="px-3 py-1.5 rounded-xl bg-surface-container-highest hover:bg-primary hover:text-primary-foreground text-xs font-semibold text-on-surface transition-colors flex items-center gap-1"
          >
            <span>Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
