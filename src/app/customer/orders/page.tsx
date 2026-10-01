"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAllCustomerOrders } from "@/features/customer/hooks/useOrderTracking";
import { ActiveOrderCard } from "@/features/customer/components/tracking/ActiveOrderCard";
import { TrackingSkeleton } from "@/features/customer/components/tracking/TrackingSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { Package, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CustomerOrdersPage() {
  const { data: orders = [], isLoading, isError, refetch } = useAllCustomerOrders();
  const [tab, setTab] = useState<"ACTIVE" | "PAST">("ACTIVE");

  if (isLoading) {
    return <TrackingSkeleton />;
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <ErrorState
          title="Could Not Load Orders"
          message="We were unable to retrieve your order history."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const activeOrders = orders.filter((o) => o.status !== "DELIVERED" && o.status !== "CANCELLED");
  const pastOrders = orders.filter((o) => o.status === "DELIVERED" || o.status === "CANCELLED");

  const displayedOrders = tab === "ACTIVE" ? activeOrders : pastOrders;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface font-headline">
            My Care Orders
          </h1>
          <p className="text-xs text-on-surface-variant">
            Track active pickups, review garment cleaning stages, and inspect order history.
          </p>
        </div>

        <Link href="/customer/services">
          <Button size="sm" className="gap-2 text-xs font-semibold shadow-lg shadow-primary/20">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Book New Service</span>
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        <button
          type="button"
          onClick={() => setTab("ACTIVE")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            tab === "ACTIVE"
              ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
              : "bg-surface-container text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Active Orders ({activeOrders.length})
        </button>

        <button
          type="button"
          onClick={() => setTab("PAST")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            tab === "PAST"
              ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
              : "bg-surface-container text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Past Orders ({pastOrders.length})
        </button>
      </div>

      {/* Orders List */}
      {displayedOrders.length === 0 ? (
        <div className="bg-surface-container rounded-2xl border border-white/10 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Package className="h-8 w-8" />
          </div>
          <h3 className="font-bold text-base text-on-surface">No Orders Found</h3>
          <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
            You don&apos;t have any {tab === "ACTIVE" ? "active" : "past"} care bookings.
          </p>
          <Link href="/customer/services">
            <Button size="sm" className="font-semibold text-xs mt-2">
              Explore Care Services
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedOrders.map((order) => (
            <ActiveOrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
