"use client";

import React from "react";
import Link from "next/link";
import { ProviderPickupItem, ProviderPickupStatus } from "@/types/provider/pickups";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

interface ProviderPickupCardProps {
  pickup: ProviderPickupItem;
  onConfirmClick?: (pickup: ProviderPickupItem) => void;
}

export function ProviderPickupCard({ pickup, onConfirmClick }: ProviderPickupCardProps) {
  const getStatusBadge = (status: ProviderPickupStatus) => {
    switch (status) {
      case "AWAITING_ASSIGNMENT":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/40 text-amber-300 border border-amber-500/30">
            Awaiting Valet Assignment
          </span>
        );
      case "PARTNER_ASSIGNED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-950/40 text-purple-300 border border-purple-500/30">
            Partner En Route ({pickup.partner?.arrivalEtaMinutes}m)
          </span>
        );
      case "PARTNER_ARRIVED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-950/40 text-blue-300 border border-blue-500/30">
            Valet Arrived at Studio
          </span>
        );
      case "HANDED_OVER":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/40 text-emerald-300 border border-emerald-500/30">
            Handed Over ({pickup.handedOverAt || "Done"})
          </span>
        );
      case "FAILED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-error-container/20 text-error border border-error/30">
            Handoff Issue
          </span>
        );
    }
  };

  return (
    <ProviderCard
      variant="container"
      className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-primary/40 border-l-4 border-l-primary"
    >
      <div className="flex items-start gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-surface-container-high flex items-center justify-center text-primary shrink-0 border border-white/5">
          <span className="material-symbols-outlined text-[20px]">local_shipping</span>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-mono text-xs font-bold text-primary">{pickup.pickupNumber}</span>
            {getStatusBadge(pickup.status)}
          </div>

          <h3 className="text-base font-bold text-on-surface leading-tight mb-1">
            {pickup.serviceName}
          </h3>

          <div className="flex items-center gap-3 text-xs text-on-surface-variant flex-wrap">
            <span className="font-medium text-on-surface flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">person</span>
              <span>{pickup.customerName}</span>
            </span>

            <span>•</span>

            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">location_on</span>
              <span>{pickup.destinationArea}</span>
            </span>

            <span>•</span>

            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">schedule</span>
              <span>{pickup.deliveryWindow}</span>
            </span>
          </div>

          {/* Assigned Partner Snippet if present */}
          {pickup.partner && (
            <div className="mt-2.5 flex items-center gap-2 text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-primary">two_wheeler</span>
              <span className="font-semibold text-on-surface">{pickup.partner.name}</span>
              <span>({pickup.partner.vehicleType})</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 border-t border-white/5 md:border-t-0 pt-3 md:pt-0">
        <div className="text-left md:text-right">
          <span className="text-xs text-on-surface-variant font-medium block">Package Items</span>
          <span className="text-sm font-bold text-on-surface">{pickup.itemDescription}</span>
        </div>

        <div className="flex items-center gap-2">
          {pickup.status !== "HANDED_OVER" && onConfirmClick && (
            <button
              type="button"
              onClick={() => onConfirmClick(pickup)}
              className="px-3.5 py-1.5 rounded-lg bg-primary-container text-on-primary-container hover:bg-primary font-bold text-xs transition-all shadow-md shadow-primary/20 flex items-center gap-1"
            >
              <span>Confirm Handoff</span>
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </button>
          )}

          <Link
            href={`/provider/pickups/${pickup.id}`}
            className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-variant text-xs font-semibold text-primary transition-colors border border-white/5 flex items-center gap-1"
          >
            <span>Handoff Details</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          </Link>
        </div>
      </div>
    </ProviderCard>
  );
}
