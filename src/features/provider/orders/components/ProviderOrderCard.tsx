"use client";

import React from "react";
import Link from "next/link";
import { ProviderOrderItem, ProviderOrderStatus } from "@/types/provider/orders";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

interface ProviderOrderCardProps {
  order: ProviderOrderItem;
  onAdvanceClick?: (order: ProviderOrderItem) => void;
}

export function ProviderOrderCard({ order, onAdvanceClick }: ProviderOrderCardProps) {
  const getStageBadge = (status: ProviderOrderStatus) => {
    switch (status) {
      case "INTAKE_INSPECTION":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/40 text-amber-300 border border-amber-500/30">
            Intake Inspection
          </span>
        );
      case "HYDROCARBON_CARE":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-950/40 text-purple-300 border border-purple-500/30">
            Hydrocarbon / Spa Care
          </span>
        );
      case "STEAM_DEODORIZE":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-950/40 text-blue-300 border border-blue-500/30">
            Steam &amp; Sanitization
          </span>
        );
      case "QUALITY_CHECK":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
            Final QA Review
          </span>
        );
      case "READY_VALET":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/40 text-emerald-300 border border-emerald-500/30">
            Ready for Valet
          </span>
        );
    }
  };

  const getNextStageLabel = (status: ProviderOrderStatus) => {
    switch (status) {
      case "INTAKE_INSPECTION":
        return "Start Care Treatment";
      case "HYDROCARBON_CARE":
        return "Move to Sanitization";
      case "STEAM_DEODORIZE":
        return "Send to Quality QA";
      case "QUALITY_CHECK":
        return "Mark Ready for Valet";
      case "READY_VALET":
        return "Ready for Dispatch";
    }
  };

  return (
    <ProviderCard
      variant="container"
      className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-primary/40 border-l-4 border-l-primary"
    >
      <div className="flex items-start gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-surface-container-high flex items-center justify-center text-primary shrink-0 border border-white/5">
          <span className="material-symbols-outlined text-[20px]">inventory_2</span>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-mono text-xs font-bold text-primary">{order.orderNumber}</span>
            {getStageBadge(order.status)}
          </div>

          <h3 className="text-base font-bold text-on-surface leading-tight mb-1">
            {order.serviceName}
          </h3>

          <div className="flex items-center gap-3 text-xs text-on-surface-variant flex-wrap">
            <span className="font-medium text-on-surface flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">person</span>
              <span>{order.customer.name}</span>
            </span>

            <span>•</span>

            <span>
              Started: <strong className="text-on-surface">{order.startedAt}</strong>
            </span>

            <span>•</span>

            <span>
              SLA Target: <strong className="text-primary">{order.expectedCompletion}</strong>
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 max-w-xs">
            <div className="flex justify-between text-[10px] text-on-surface-variant font-semibold mb-1">
              <span>Treatment Progress</span>
              <span className="text-primary">{order.progressPercent}%</span>
            </div>
            <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${order.progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 border-t border-white/5 md:border-t-0 pt-3 md:pt-0">
        <div className="text-left md:text-right">
          <span className="text-xs text-on-surface-variant font-medium block">Care Value</span>
          <span className="text-lg font-bold text-on-surface">₹{order.price}</span>
        </div>

        <div className="flex items-center gap-2">
          {order.status !== "READY_VALET" && onAdvanceClick && (
            <button
              type="button"
              onClick={() => onAdvanceClick(order)}
              className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary-container hover:bg-primary font-bold text-xs transition-all shadow-md shadow-primary/20"
            >
              {getNextStageLabel(order.status)}
            </button>
          )}

          <Link
            href={`/provider/orders/${order.id}`}
            className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-variant text-xs font-semibold text-primary transition-colors border border-white/5 flex items-center gap-1"
          >
            <span>Open Checklist</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          </Link>
        </div>
      </div>
    </ProviderCard>
  );
}
