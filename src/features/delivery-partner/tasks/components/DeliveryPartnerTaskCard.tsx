"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Navigation,
  MapPin,
  Clock,
  Package,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Phone,
  ArrowRight,
  Play,
  XCircle,
  Check,
} from "lucide-react";
import { DeliveryPartnerTask, TaskStatus } from "@/types/delivery-partner";
import { CancelTaskModal } from "./CancelTaskModal";

interface DeliveryPartnerTaskCardProps {
  task: DeliveryPartnerTask;
  onAccept?: (taskId: string) => Promise<unknown>;
  isAccepting?: boolean;
  onReject?: (taskId: string) => Promise<unknown>;
  isRejecting?: boolean;
  onStartTransit?: (taskId: string) => Promise<unknown>;
  isStartingTransit?: boolean;
  onCancel?: (taskId: string, reason: string) => Promise<unknown>;
  isCancelling?: boolean;
}

export function DeliveryPartnerTaskCard({
  task,
  onAccept,
  isAccepting,
  onReject,
  isRejecting,
  onStartTransit,
  isStartingTransit,
  onCancel,
  isCancelling,
}: DeliveryPartnerTaskCardProps) {
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case "AVAILABLE":
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30 animate-pulse">
            Available Broadcast
          </span>
        );
      case "ASSIGNED":
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
            Assigned Run
          </span>
        );
      case "ACCEPTED":
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            Accepted
          </span>
        );
      case "IN_TRANSIT":
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/15 text-purple-400 border border-purple-500/30">
            In Transit
          </span>
        );
      case "DELIVERED":
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            Completed
          </span>
        );
      case "CANCELLED":
      case "REJECTED":
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-error/15 text-error border border-error/30">
            {status}
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant">
            {status}
          </span>
        );
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "CUSTOMER_PICKUP":
        return "Doorstep Pickup";
      case "CUSTOMER_DELIVERY":
        return "Doorstep Dropoff";
      case "HUB_TRANSFER":
        return "Hub Transfer";
      default:
        return type;
    }
  };

  return (
    <div className="p-5 rounded-3xl bg-surface-container/70 border border-outline-variant/20 hover:border-primary/30 transition-all space-y-4 shadow-sm">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Link
            href={`/delivery-partner/tasks/${task.id}`}
            className="font-mono text-xs font-bold text-on-surface hover:text-primary transition-colors flex items-center gap-1"
          >
            Order #{task.orderId}
            <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant" />
          </Link>
          {getStatusBadge(task.status)}
          <span className="text-[10px] text-on-surface-variant font-medium">
            • {getTypeLabel(task.type)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {task.isPriority && (
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> Express
            </span>
          )}
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
            +₹{task.payoutAmount} payout
          </span>
        </div>
      </div>

      {/* Origin & Destination Addresses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-2xl bg-surface border border-outline-variant/15 space-y-0.5">
          <span className="text-[9px] uppercase font-bold text-on-surface-variant flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
            Pickup
          </span>
          <p className="font-semibold text-on-surface truncate">{task.pickupAddress}</p>
        </div>

        <div className="p-3 rounded-2xl bg-surface border border-outline-variant/15 space-y-0.5">
          <span className="text-[9px] uppercase font-bold text-on-surface-variant flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            Dropoff
          </span>
          <p className="font-semibold text-on-surface truncate">{task.deliveryAddress}</p>
        </div>
      </div>

      {/* Item Summary & Operational Specs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-surface-container-high/40 p-3 rounded-2xl border border-outline-variant/10">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-on-surface truncate flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-primary shrink-0" />
            {task.itemSummary}
          </p>
          <p className="text-[10px] text-on-surface-variant">
            Customer: <span className="text-on-surface font-medium">{task.customerName}</span> ({task.packageCount} Pack)
          </p>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-on-surface-variant shrink-0 font-mono">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-primary" /> {task.scheduledTimeWindow}
          </span>
          <span>•</span>
          <span className="text-primary font-bold">{task.distanceKm} km</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-outline-variant/15 flex-wrap gap-2">
        <Link
          href={`/delivery-partner/tasks/${task.id}`}
          className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
        >
          <span>View Task Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        {/* Task Lifecycle Interactive Buttons */}
        <div className="flex items-center gap-2">
          {task.status === "AVAILABLE" && onAccept && (
            <>
              {onReject && (
                <button
                  onClick={() => onReject(task.id)}
                  disabled={isRejecting}
                  className="px-3 py-1.5 rounded-xl bg-surface border border-outline-variant/30 text-xs font-semibold text-on-surface-variant hover:text-error hover:border-error/40 transition-colors"
                >
                  Decline
                </button>
              )}
              <button
                onClick={() => onAccept(task.id)}
                disabled={isAccepting}
                className="px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow hover:opacity-90 transition-opacity flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Accept Job</span>
              </button>
            </>
          )}

          {(task.status === "ASSIGNED" || task.status === "ACCEPTED") && onStartTransit && (
            <>
              {onCancel && (
                <button
                  onClick={() => setCancelModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-surface border border-outline-variant/30 text-xs font-semibold text-on-surface-variant hover:text-error hover:border-error/40 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={() => onStartTransit(task.id)}
                disabled={isStartingTransit}
                className="px-4 py-1.5 rounded-xl bg-purple-500 text-black text-xs font-bold shadow hover:bg-purple-400 transition-colors flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Start Transit</span>
              </button>
            </>
          )}

          {task.status === "IN_TRANSIT" && (
            <span className="text-[11px] text-purple-400 font-mono font-bold flex items-center gap-1">
              <Navigation className="w-3 h-3 animate-pulse" /> Live In-Flight
            </span>
          )}

          {task.status === "DELIVERED" && (
            <span className="text-[11px] text-emerald-400 font-mono font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Fulfilled
            </span>
          )}
        </div>
      </div>

      {/* Cancel Task Modal */}
      {onCancel && (
        <CancelTaskModal
          orderId={task.orderId}
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          onConfirm={(reason) => onCancel(task.id, reason)}
          isCancelling={isCancelling || false}
        />
      )}
    </div>
  );
}
