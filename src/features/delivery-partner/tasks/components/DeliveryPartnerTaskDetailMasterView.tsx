"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Navigation,
  MapPin,
  Clock,
  Phone,
  Package,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Play,
  Check,
  XCircle,
  FileText,
  ShieldCheck,
  HelpCircle,
  Info,
  PackageCheck,
} from "lucide-react";
import { useDeliveryPartnerTaskDetail } from "../hooks/useDeliveryPartnerTasks";
import { CancelTaskModal } from "./CancelTaskModal";
import { TaskStatus } from "@/types/delivery-partner";

interface DeliveryPartnerTaskDetailMasterViewProps {
  taskId: string;
}

export function DeliveryPartnerTaskDetailMasterView({
  taskId,
}: DeliveryPartnerTaskDetailMasterViewProps) {
  const router = useRouter();
  const {
    task,
    isLoading,
    isError,
    error,
    acceptTask,
    isAccepting,
    startTransit,
    isStartingTransit,
    cancelTask,
    isCancelling,
  } = useDeliveryPartnerTaskDetail(taskId);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [callInitiated, setCallInitiated] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="h-10 w-32 bg-surface-container rounded-xl animate-pulse" />
        <div className="h-64 rounded-3xl bg-surface-container animate-pulse" />
        <div className="h-44 rounded-3xl bg-surface-container animate-pulse" />
      </div>
    );
  }

  if (isError || !task) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-4 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-error/15 text-error flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-on-surface">Task Not Found</h2>
          <p className="text-xs text-on-surface-variant">
            {error instanceof Error
              ? error.message
              : `The dispatch task with ID "${taskId}" does not exist or does not belong to your account.`}
          </p>
        </div>
        <Link
          href="/delivery-partner/tasks"
          className="px-5 py-2 rounded-xl bg-surface-container-highest text-xs font-semibold text-on-surface hover:text-primary transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Task Queue</span>
        </Link>
      </div>
    );
  }

  const handleCall = () => {
    setCallInitiated(true);
    setTimeout(() => setCallInitiated(false), 3000);
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case "AVAILABLE":
        return (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 animate-pulse">
            Available Broadcast
          </span>
        );
      case "ASSIGNED":
        return (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
            Assigned Run
          </span>
        );
      case "ACCEPTED":
        return (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            Accepted
          </span>
        );
      case "PICKUP_STARTED":
        return (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
            Pickup Started
          </span>
        );
      case "PICKED_UP":
        return (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            Inward Picked Up
          </span>
        );
      case "IN_TRANSIT":
        return (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30">
            In Transit
          </span>
        );
      case "ARRIVED_AT_DELIVERY":
        return (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            Arrived at Destination
          </span>
        );
      case "DELIVERED":
        return (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            Delivered
          </span>
        );
      case "CANCELLED":
      case "REJECTED":
        return (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-error/15 text-error border border-error/30">
            {status}
          </span>
        );
      default:
        return (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-surface-container-highest text-on-surface-variant">
            {status}
          </span>
        );
    }
  };

  const isPickupTask = task.type === "CUSTOMER_PICKUP";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Link & Title */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link
          href="/delivery-partner/tasks"
          className="text-xs font-semibold text-on-surface-variant hover:text-on-surface flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Tasks</span>
        </Link>

        <div className="flex items-center gap-2">
          {getStatusBadge(task.status)}
          {task.isPriority && (
            <span className="text-xs font-bold text-amber-400 bg-amber-500/15 px-2.5 py-1 rounded-full border border-amber-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Priority Express
            </span>
          )}
        </div>
      </div>

      {/* Task Hero Bento */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-surface-container-high via-surface-container to-surface border border-outline-variant/30 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/20 pb-5">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight font-mono">
              Order #{task.orderId}
            </h1>
            <p className="text-xs text-on-surface-variant">
              Task Type: <span className="text-on-surface font-semibold">{task.type.replace(/_/g, " ")}</span> • Dispatched {new Date(task.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>

          <div className="text-left sm:text-right p-3 rounded-2xl bg-surface-container-high/80 border border-outline-variant/20">
            <span className="text-xs font-mono font-extrabold text-emerald-400 text-lg md:text-xl">
              +₹{task.payoutAmount}
            </span>
            <p className="text-[10px] text-on-surface-variant font-medium">Guaranteed Payout</p>
          </div>
        </div>

        {/* Route Details: Pickup & Delivery Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Pickup Address */}
          <div className="p-4 rounded-2xl bg-surface/80 border border-outline-variant/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                Pickup Location
              </span>
              <span className="text-[10px] font-mono text-primary font-bold">Origin Point</span>
            </div>
            <p className="text-sm font-semibold text-on-surface leading-snug">{task.pickupAddress}</p>
          </div>

          {/* Delivery Address */}
          <div className="p-4 rounded-2xl bg-surface/80 border border-outline-variant/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                Dropoff Destination
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">{task.distanceKm} km away</span>
            </div>
            <p className="text-sm font-semibold text-on-surface leading-snug">{task.deliveryAddress}</p>
          </div>
        </div>

        {/* Customer Snapshot & Call Action */}
        <div className="p-4 rounded-2xl bg-surface-container-high/60 border border-outline-variant/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-on-surface-variant">Customer Contact</span>
            <p className="text-sm font-bold text-on-surface">{task.customerName}</p>
            <p className="text-[11px] font-mono text-primary">{task.customerPhone}</p>
          </div>

          <button
            onClick={handleCall}
            className="px-4 py-2 rounded-xl bg-surface border border-outline-variant/30 text-xs font-bold text-on-surface hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2 self-start sm:self-auto"
          >
            <Phone className="w-3.5 h-3.5 text-primary" />
            <span>{callInitiated ? "Connecting Call..." : "Call Customer"}</span>
          </button>
        </div>

        {/* Special Instructions */}
        {task.notes && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-300">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Special Valet Instructions:</span> {task.notes}
            </div>
          </div>
        )}
      </div>

      {/* Itemized Inventory Breakdown */}
      <div className="p-6 rounded-3xl bg-surface-container/70 border border-outline-variant/25 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-outline-variant/20 pb-3">
          <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-on-surface">Itemized Package Summary</h2>
            <p className="text-[11px] text-on-surface-variant">
              {task.packageCount} Security Sealed Garment Pack(s)
            </p>
          </div>
        </div>

        <ul className="space-y-2 text-xs">
          {task.itemsList.map((item, idx) => (
            <li
              key={idx}
              className="p-3 rounded-xl bg-surface/70 border border-outline-variant/15 flex items-center justify-between"
            >
              <span className="font-semibold text-on-surface">{item}</span>
              <span className="text-[10px] text-emerald-400 font-mono">Verified Item</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Task Operational Timeline */}
      <div className="p-6 rounded-3xl bg-surface-container/70 border border-outline-variant/25 space-y-5">
        <div className="flex items-center gap-2.5 border-b border-outline-variant/20 pb-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-on-surface">Dispatch Progress Timeline</h2>
            <p className="text-[11px] text-on-surface-variant">Real-time status milestones for Order #{task.orderId}</p>
          </div>
        </div>

        <div className="space-y-4 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-outline-variant/25">
          {task.timeline.map((evt) => (
            <div key={evt.id} className="relative flex items-start gap-4 pl-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 text-xs ${
                  evt.isCompleted
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-surface-container-highest text-on-surface-variant/50 border border-outline-variant/30"
                }`}
              >
                {evt.isCompleted ? <Check className="w-3 h-3" /> : <div className="w-2 h-2 rounded-full bg-current" />}
              </div>

              <div className="space-y-0.5 min-w-0 flex-1 pt-0.5">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-bold ${evt.isCompleted ? "text-on-surface" : "text-on-surface-variant"}`}>
                    {evt.title}
                  </span>
                  {evt.timestamp && (
                    <span className="font-mono text-[10px] text-on-surface-variant">{evt.timestamp}</span>
                  )}
                </div>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  {evt.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Action Bar */}
      <div className="p-5 rounded-3xl bg-surface-container border border-outline-variant/30 shadow-xl flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={() => router.push("/delivery-partner/tasks")}
          className="px-4 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
        >
          Back to List
        </button>

        <div className="flex items-center gap-2.5">
          {task.status === "AVAILABLE" && (
            <button
              onClick={() => acceptTask()}
              disabled={isAccepting}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{isAccepting ? "Accepting..." : "Accept This Dispatch Run"}</span>
            </button>
          )}

          {(task.status === "ASSIGNED" || task.status === "ACCEPTED" || task.status === "PICKUP_STARTED") && (
            <>
              <button
                onClick={() => setCancelModalOpen(true)}
                disabled={isCancelling}
                className="px-4 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs font-semibold text-error hover:border-error/40 transition-colors"
              >
                Cancel Task
              </button>

              {isPickupTask ? (
                <Link
                  href={`/delivery-partner/pickup/${task.id}`}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 text-black text-xs font-bold shadow-md hover:bg-amber-400 transition-colors flex items-center gap-2"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>Execute Doorstep Pickup (D5)</span>
                </Link>
              ) : (
                <Link
                  href={`/delivery-partner/deliveries/${task.id}`}
                  className="px-6 py-2.5 rounded-xl bg-purple-500 text-black text-xs font-bold shadow-md hover:bg-purple-400 transition-colors flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Start Live Transit & Delivery (D6)</span>
                </Link>
              )}
            </>
          )}

          {(task.status === "IN_TRANSIT" || task.status === "ARRIVED_AT_DELIVERY" || task.status === "PICKED_UP") && (
            <Link
              href={`/delivery-partner/deliveries/${task.id}`}
              className="px-6 py-2.5 rounded-xl bg-purple-500 text-black text-xs font-bold shadow-md hover:bg-purple-400 transition-colors flex items-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              <span>Execute Customer Handover (D6)</span>
            </Link>
          )}

          {task.status === "DELIVERED" && (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 px-4 py-2 rounded-xl border border-emerald-500/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Order Handover Completed
            </span>
          )}
        </div>
      </div>

      {/* Cancel Task Modal */}
      <CancelTaskModal
        orderId={task.orderId}
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={(reason) => cancelTask(reason)}
        isCancelling={isCancelling}
      />
    </div>
  );
}
