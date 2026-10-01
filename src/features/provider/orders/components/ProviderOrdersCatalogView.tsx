"use client";

import React, { useState } from "react";
import { useProviderOrders } from "@/features/provider/orders/hooks/useProviderOrders";
import { ProviderOrderItem, ProviderOrderStatus } from "@/types/provider/orders";
import { ProviderLoadingState } from "@/features/provider/components/ProviderLoadingState";
import { ProviderErrorState } from "@/features/provider/components/ProviderErrorState";
import { ProviderEmptyState } from "@/features/provider/components/ProviderEmptyState";
import { ProviderCard } from "@/features/provider/components/ProviderCard";
import { ProviderOrderCard } from "./ProviderOrderCard";
import { AdvanceStageModal } from "./AdvanceStageModal";

export function ProviderOrdersCatalogView() {
  const { orders, isLoading, isError, stats, refetch, advanceStage, isAdvancing } =
    useProviderOrders();

  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [advanceTarget, setAdvanceTarget] = useState<ProviderOrderItem | null>(null);

  if (isLoading) {
    return <ProviderLoadingState message="Loading Studio Processing Queue..." />;
  }

  if (isError) {
    return <ProviderErrorState title="Failed to load orders" onRetry={() => refetch()} />;
  }

  // Filter Logic
  const filteredOrders = orders.filter((ord) => {
    if (activeTab === "INTAKE" && ord.status !== "INTAKE_INSPECTION") return false;
    if (activeTab === "CARE" && (ord.status !== "HYDROCARBON_CARE" && ord.status !== "STEAM_DEODORIZE"))
      return false;
    if (activeTab === "QUALITY" && ord.status !== "QUALITY_CHECK") return false;
    if (activeTab === "READY" && ord.status !== "READY_VALET") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = ord.orderNumber.toLowerCase().includes(q);
      const matchCust = ord.customer.name.toLowerCase().includes(q);
      const matchSrv = ord.serviceName.toLowerCase().includes(q);
      if (!matchNum && !matchCust && !matchSrv) return false;
    }

    return true;
  });

  const handleAdvanceConfirm = async (nextStatus: ProviderOrderStatus) => {
    if (!advanceTarget) return;
    await advanceStage({ orderId: advanceTarget.id, nextStatus });
    setAdvanceTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* 5-Card Operational Queue Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <ProviderCard variant="container" className="p-4 flex flex-col justify-between">
          <span className="text-xs font-medium text-on-surface-variant">Intake Inspection</span>
          <span className="text-2xl font-bold text-amber-400 mt-1">{stats?.inIntakeCount || 0}</span>
        </ProviderCard>

        <ProviderCard variant="container" className="p-4 flex flex-col justify-between">
          <span className="text-xs font-medium text-on-surface-variant">In Care Cycles</span>
          <span className="text-2xl font-bold text-primary mt-1">{stats?.inCareCount || 0}</span>
        </ProviderCard>

        <ProviderCard variant="container" className="p-4 flex flex-col justify-between">
          <span className="text-xs font-medium text-on-surface-variant">Quality QA Review</span>
          <span className="text-2xl font-bold text-blue-400 mt-1">{stats?.inQualityCount || 0}</span>
        </ProviderCard>

        <ProviderCard variant="container" className="p-4 flex flex-col justify-between">
          <span className="text-xs font-medium text-on-surface-variant">Ready for Valet</span>
          <span className="text-2xl font-bold text-emerald-400 mt-1">{stats?.readyValetCount || 0}</span>
        </ProviderCard>

        <ProviderCard variant="container" className="p-4 flex flex-col justify-between">
          <span className="text-xs font-medium text-on-surface-variant">Active Queue Total</span>
          <span className="text-2xl font-bold text-on-surface mt-1">{stats?.totalActiveCount || 0}</span>
        </ProviderCard>
      </div>

      {/* Stage Tabs */}
      <div className="flex overflow-x-auto border-b border-white/5 gap-3 pb-1">
        {[
          { key: "ALL", label: "All Active Jobs" },
          { key: "INTAKE", label: `Intake (${stats?.inIntakeCount || 0})` },
          { key: "CARE", label: `In Care Treatment (${stats?.inCareCount || 0})` },
          { key: "QUALITY", label: `Quality QA (${stats?.inQualityCount || 0})` },
          { key: "READY", label: `Ready for Valet (${stats?.readyValetCount || 0})` },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`text-xs font-semibold pb-2.5 px-2 whitespace-nowrap transition-all border-b-2 ${
              activeTab === tab.key
                ? "text-primary border-primary"
                : "text-on-surface-variant border-transparent hover:text-on-surface"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
          search
        </span>
        <input
          type="text"
          placeholder="Search active care jobs by order ID or customer..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-surface-container text-on-surface text-xs rounded-xl pl-10 pr-4 py-2.5 border border-white/5 focus:border-primary outline-none"
        />
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <ProviderEmptyState
          title="No Active Care Jobs"
          description={
            searchQuery
              ? `No orders match "${searchQuery}".`
              : "No orders currently in this operational stage."
          }
          iconName="inventory_2"
        />
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <ProviderOrderCard
              key={order.id}
              order={order}
              onAdvanceClick={(ord) => setAdvanceTarget(ord)}
            />
          ))}
        </div>
      )}

      {/* Advance Stage Modal */}
      <AdvanceStageModal
        order={advanceTarget}
        isOpen={!!advanceTarget}
        onClose={() => setAdvanceTarget(null)}
        onConfirm={handleAdvanceConfirm}
        isAdvancing={isAdvancing}
      />
    </div>
  );
}
