import React from "react";
import Link from "next/link";
import { ArrowLeft, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TrackingHeaderProps {
  orderNumber: string;
  statusLabel: string;
  canReschedule?: boolean;
  canCancel?: boolean;
}

export function TrackingHeader({
  orderNumber,
  statusLabel,
  canReschedule,
  canCancel,
}: TrackingHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-5">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Link
            href="/customer/orders"
            className="w-8 h-8 rounded-full bg-surface-container border border-white/10 flex items-center justify-center text-on-surface hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface font-headline tracking-tight">
            Track Your Order
          </h1>
        </div>

        <div className="flex items-center gap-3 pl-10">
          <span className="font-mono font-bold text-primary text-sm sm:text-base">
            {orderNumber}
          </span>
          <span className="bg-green-500/15 text-green-400 border border-green-500/30 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
            {statusLabel}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 pl-10 md:pl-0">
        {canReschedule && (
          <Link href={`/customer/orders/${orderNumber}/reschedule`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Clock className="h-3.5 w-3.5 text-on-surface-variant" />
              <span>Reschedule</span>
            </Button>
          </Link>
        )}

        {canCancel && (
          <Link href={`/customer/orders/${orderNumber}/cancel`}>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs text-red-400 border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
            >
              <XCircle className="h-3.5 w-3.5" />
              <span>Cancel Order</span>
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
