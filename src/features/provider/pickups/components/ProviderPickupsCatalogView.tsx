"use client";

import React, { useState } from "react";
import { useProviderPickups } from "@/features/provider/pickups/hooks/useProviderPickups";
import { ProviderPickupItem } from "@/types/provider/pickups";
import { ProviderLoadingState } from "@/features/provider/components/ProviderLoadingState";
import { ProviderErrorState } from "@/features/provider/components/ProviderErrorState";
import { ProviderEmptyState } from "@/features/provider/components/ProviderEmptyState";
import { ProviderCard } from "@/features/provider/components/ProviderCard";
import { ProviderPickupCard } from "./ProviderPickupCard";
import { ConfirmHandoverModal } from "./ConfirmHandoverModal";

export function ProviderPickupsCatalogView() {
  const {
    pickups,
    isLoading,
    isError,
    stats,
    refetch,
    confirmHandover,
    isConfirming,
  } = useProviderPickups();

  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [confirmTarget, setConfirmTarget] = useState<ProviderPickupItem | null>(null);

  if (isLoading) {
    return <ProviderLoadingState message="Loading Studio Valet Dispatch Queue..." />;
  }

  if (isError) {
    return <ProviderErrorState title="Failed to load pickup requests" onRetry={() => refetch()} />;
  }

  // Filter Logic
  const filteredPickups = pickups.filter((p) => {
    if (activeTab === "AWAITING" && p.status !== "AWAITING_ASSIGNMENT") return false;
    if (activeTab === "ACTIVE" && (p.status !== "PARTNER_ASSIGNED" && p.status !== "PARTNER_ARRIVED"))
      return false;
    if (activeTab === "HANDED_OVER" && p.status !== "HANDED_OVER") return false;
    if (activeTab === "FAILED" && p.status !== "FAILED") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = p.pickupNumber.toLowerCase().includes(q);
      const matchCust = p.customerName.toLowerCase().includes(q);
      const matchSrv = p.serviceName.toLowerCase().includes(q);
      const matchDriver = p.partner?.name.toLowerCase().includes(q);
      if (!matchNum && !matchCust && !matchSrv && !matchDriver) return false;
    }

    return true;
  });

  const handleConfirmAction = async (verificationCode?: string) => {
    if (!confirmTarget) return;
    await confirmHandover({ pickupId: confirmTarget.id, verificationCode });
    setConfirmTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* 4-Card Bento Metrics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <ProviderCard variant="container" className="p-4 flex flex-col justify-between">
          <span className="text-xs font-medium text-on-surface-variant">Awaiting Partner</span>
          <span className="text-2xl font-bold text-amber-400 mt-1">
            {stats?.awaitingAssignmentCount || 0}
          </span>
        </ProviderCard>

        <ProviderCard variant="container" className="p-4 flex flex-col justify-between">
          <span className="text-xs font-medium text-on-surface-variant">Valet En Route</span>
          <span className="text-2xl font-bold text-primary mt-1">
            {stats?.assignedEnRouteCount || 0}
          </span>
        </ProviderCard>

        <ProviderCard variant="container" className="p-4 flex flex-col justify-between">
          <span className="text-xs font-medium text-on-surface-variant">Valet Arrived at Studio</span>
          <span className="text-2xl font-bold text-blue-400 mt-1">
            {stats?.readyForHandoverCount || 0}
          </span>
        </ProviderCard>

        <ProviderCard variant="container" className="p-4 flex flex-col justify-between">
          <span className="text-xs font-medium text-on-surface-variant">Handed Over</span>
          <span className="text-2xl font-bold text-emerald-400 mt-1">
            {stats?.handedOverCount || 0}
          </span>
        </ProviderCard>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-white/5 gap-3 pb-1">
        {[
          { key: "ALL", label: "All Dispatches" },
          { key: "AWAITING", label: `Awaiting Valet (${stats?.awaitingAssignmentCount || 0})` },
          {
            key: "ACTIVE",
            label: `Active En Route / Arrived (${(stats?.assignedEnRouteCount || 0) + (stats?.readyForHandoverCount || 0)})`,
          },
          { key: "HANDED_OVER", label: `Completed Handover (${stats?.handedOverCount || 0})` },
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
          placeholder="Search dispatch queue by ID, customer or driver..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-surface-container text-on-surface text-xs rounded-xl pl-10 pr-4 py-2.5 border border-white/5 focus:border-primary outline-none"
        />
      </div>

      {/* Pickups List */}
      {filteredPickups.length === 0 ? (
        <ProviderEmptyState
          title="No Pickups Scheduled"
          description={
            searchQuery
              ? `No dispatches match "${searchQuery}".`
              : "No pickup or delivery handovers found for this filter."
          }
          iconName="local_shipping"
        />
      ) : (
        <div className="space-y-3">
          {filteredPickups.map((pickup) => (
            <ProviderPickupCard
              key={pickup.id}
              pickup={pickup}
              onConfirmClick={(p) => setConfirmTarget(p)}
            />
          ))}
        </div>
      )}

      {/* Confirm Handover Modal */}
      <ConfirmHandoverModal
        pickup={confirmTarget}
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleConfirmAction}
        isConfirming={isConfirming}
      />
    </div>
  );
}
