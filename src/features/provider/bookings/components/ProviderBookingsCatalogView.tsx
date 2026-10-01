"use client";

import React, { useState } from "react";
import { useProviderBookings } from "@/features/provider/bookings/hooks/useProviderBookings";
import { ProviderBookingItem, ProviderBookingStatus } from "@/types/provider/bookings";
import { ProviderLoadingState } from "@/features/provider/components/ProviderLoadingState";
import { ProviderErrorState } from "@/features/provider/components/ProviderErrorState";
import { ProviderEmptyState } from "@/features/provider/components/ProviderEmptyState";
import { ProviderCard } from "@/features/provider/components/ProviderCard";
import { ProviderBookingCard } from "./ProviderBookingCard";
import { AcceptBookingModal } from "./AcceptBookingModal";
import { DeclineBookingModal } from "./DeclineBookingModal";

export function ProviderBookingsCatalogView() {
  const {
    bookings,
    isLoading,
    isError,
    stats,
    refetch,
    acceptBooking,
    isAccepting,
    declineBooking,
    isDeclining,
  } = useProviderBookings();

  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("ALL");

  const [acceptTarget, setAcceptTarget] = useState<ProviderBookingItem | null>(null);
  const [declineTarget, setDeclineTarget] = useState<ProviderBookingItem | null>(null);

  if (isLoading) {
    return <ProviderLoadingState message="Loading Studio Booking Requests..." />;
  }

  if (isError) {
    return <ProviderErrorState title="Failed to load bookings" onRetry={() => refetch()} />;
  }

  // Filter Logic
  const filteredBookings = bookings.filter((b) => {
    // Status Tab Match
    if (activeTab === "PENDING" && b.status !== "PENDING") return false;
    if (activeTab === "CONFIRMED" && b.status !== "CONFIRMED") return false;
    if (activeTab === "COMPLETED" && b.status !== "COMPLETED") return false;
    if (activeTab === "CANCELLED" && (b.status !== "CANCELLED" && b.status !== "REJECTED")) return false;

    // Search Query Match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = b.bookingNumber.toLowerCase().includes(q);
      const matchCust = b.customer.name.toLowerCase().includes(q);
      const matchSrv = b.serviceName.toLowerCase().includes(q);
      if (!matchNum && !matchCust && !matchSrv) return false;
    }

    // Date Filter Match
    if (dateFilter === "TODAY" && b.scheduledDate !== "2026-09-03") return false;

    return true;
  });

  const handleAcceptConfirm = async () => {
    if (!acceptTarget) return;
    await acceptBooking({ bookingId: acceptTarget.id });
    setAcceptTarget(null);
  };

  const handleDeclineConfirm = async (reason: string, notes?: string) => {
    if (!declineTarget) return;
    await declineBooking({ bookingId: declineTarget.id, reason, notes });
    setDeclineTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* 5-Card Bento Summary Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <ProviderCard variant="container" className="p-4 flex flex-col justify-between">
          <span className="text-xs font-medium text-on-surface-variant">New Requests</span>
          <span className="text-2xl font-bold text-amber-400 mt-1">{stats?.newCount || 0}</span>
        </ProviderCard>

        <ProviderCard variant="container" className="p-4 flex flex-col justify-between">
          <span className="text-xs font-medium text-on-surface-variant">Today&apos;s Bookings</span>
          <span className="text-2xl font-bold text-on-surface mt-1">{stats?.todayCount || 0}</span>
        </ProviderCard>

        <ProviderCard variant="container" className="p-4 flex flex-col justify-between">
          <span className="text-xs font-medium text-on-surface-variant">Confirmed / In Progress</span>
          <span className="text-2xl font-bold text-primary mt-1">{stats?.inProgressCount || 0}</span>
        </ProviderCard>

        <ProviderCard variant="container" className="p-4 flex flex-col justify-between">
          <span className="text-xs font-medium text-on-surface-variant">Ready for Valet</span>
          <span className="text-2xl font-bold text-emerald-400 mt-1">{stats?.readyCount || 0}</span>
        </ProviderCard>

        <ProviderCard variant="container" className="p-4 flex flex-col justify-between">
          <span className="text-xs font-medium text-on-surface-variant">Completed Total</span>
          <span className="text-2xl font-bold text-on-surface mt-1">{stats?.completedCount || 0}</span>
        </ProviderCard>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto border-b border-white/5 gap-3 pb-1">
        {[
          { key: "ALL", label: "All Bookings" },
          { key: "PENDING", label: `New Requests (${stats?.newCount || 0})` },
          { key: "CONFIRMED", label: "Active & Confirmed" },
          { key: "COMPLETED", label: "Completed" },
          { key: "CANCELLED", label: "Declined / Cancelled" },
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

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search by order ID, customer name, or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container text-on-surface text-xs rounded-xl pl-10 pr-4 py-2.5 border border-white/5 focus:border-primary outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-surface-container text-on-surface text-xs rounded-xl px-3 py-2.5 border border-white/5 focus:border-primary outline-none cursor-pointer"
          >
            <option value="ALL">All Scheduled Dates</option>
            <option value="TODAY">Today Only (Sep 3)</option>
          </select>
        </div>
      </div>

      {/* Bookings List or Empty State */}
      {filteredBookings.length === 0 ? (
        <ProviderEmptyState
          title="No Bookings Found"
          description={
            searchQuery
              ? `No booking records match "${searchQuery}".`
              : "There are no bookings matching the selected status filter."
          }
          iconName="list_alt"
        />
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((booking) => (
            <ProviderBookingCard
              key={booking.id}
              booking={booking}
              onAcceptClick={(b) => setAcceptTarget(b)}
              onDeclineClick={(b) => setDeclineTarget(b)}
            />
          ))}
        </div>
      )}

      {/* Accept Modal */}
      <AcceptBookingModal
        booking={acceptTarget}
        isOpen={!!acceptTarget}
        onClose={() => setAcceptTarget(null)}
        onConfirm={handleAcceptConfirm}
        isAccepting={isAccepting}
      />

      {/* Decline Modal */}
      <DeclineBookingModal
        booking={declineTarget}
        isOpen={!!declineTarget}
        onClose={() => setDeclineTarget(null)}
        onConfirm={handleDeclineConfirm}
        isDeclining={isDeclining}
      />
    </div>
  );
}
