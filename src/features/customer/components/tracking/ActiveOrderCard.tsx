import React from "react";
import Link from "next/link";
import { OrderTrackingDetails } from "@/types/customer/orderLifecycle";
import { Calendar, Store, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActiveOrderCardProps {
  order: OrderTrackingDetails;
}

export function ActiveOrderCard({ order }: ActiveOrderCardProps) {
  const isDelivered = order.status === "DELIVERED";

  return (
    <div className="bg-surface-container rounded-2xl border border-white/10 p-5 sm:p-6 shadow-xl space-y-4 hover:border-primary/40 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-sm sm:text-base text-primary">
            {order.orderNumber}
          </span>
          <span
            className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              isDelivered
                ? "bg-white/10 text-on-surface-variant"
                : "bg-green-500/15 text-green-400 border border-green-500/30"
            }`}
          >
            {order.statusLabel}
          </span>
        </div>

        <span className="font-mono font-bold text-sm text-on-surface">
          ₹{order.totalAmount}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="space-y-1.5 min-w-0">
          <h3 className="font-bold text-base text-on-surface truncate">
            {order.serviceName}
          </h3>
          <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
            <Store className="h-3.5 w-3.5" />
            <span>Studio: {order.providerName}</span>
          </p>
          <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span>{order.pickupWindow}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isDelivered && (
            <Link href={`/customer/orders/${order.id}/review`}>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
                <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                <span>Rate &amp; Review</span>
              </Button>
            </Link>
          )}

          <Link href={`/customer/orders/${order.id}`}>
            <Button size="sm" className="w-full sm:w-auto gap-2 font-semibold shadow-lg shadow-primary/20">
              <span>{isDelivered ? "View Details" : "Track Order"}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
