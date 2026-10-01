"use client";

import React from "react";
import Link from "next/link";
import { ProviderBookingItem } from "@/types/provider/bookings";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

interface ProviderBookingCardProps {
  booking: ProviderBookingItem;
  onAcceptClick?: (booking: ProviderBookingItem) => void;
  onDeclineClick?: (booking: ProviderBookingItem) => void;
}

export function ProviderBookingCard({
  booking,
  onAcceptClick,
  onDeclineClick,
}: ProviderBookingCardProps) {
  const isPending = booking.status === "PENDING";
  const isConfirmed = booking.status === "CONFIRMED";
  const isCompleted = booking.status === "COMPLETED";
  const isRejected = booking.status === "REJECTED" || booking.status === "CANCELLED";

  const getStatusBadge = () => {
    switch (booking.status) {
      case "PENDING":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/40 text-amber-300 border border-amber-500/30">
            New Booking Request
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-950/40 text-purple-300 border border-purple-500/30">
            Confirmed &amp; Scheduled
          </span>
        );
      case "COMPLETED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/40 text-emerald-300 border border-emerald-500/30">
            Completed
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-error-container/20 text-error border border-error/30">
            Declined
          </span>
        );
      case "CANCELLED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-900 text-zinc-400 border border-zinc-700">
            Cancelled
          </span>
        );
    }
  };

  return (
    <ProviderCard
      variant="container"
      className={`p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-primary/40 ${
        isPending ? "border-l-4 border-l-amber-400 bg-surface-container/90" : ""
      }`}
    >
      <div className="flex items-start gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-surface-container-high flex items-center justify-center text-primary shrink-0 border border-white/5">
          <span className="material-symbols-outlined text-[20px]">cleaning_services</span>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-mono text-xs font-bold text-primary">{booking.bookingNumber}</span>
            {getStatusBadge()}
          </div>

          <h3 className="text-base font-bold text-on-surface leading-tight mb-1">
            {booking.serviceName}
          </h3>

          <div className="flex items-center gap-3 text-xs text-on-surface-variant flex-wrap">
            <span className="flex items-center gap-1 font-medium text-on-surface">
              <span className="material-symbols-outlined text-[15px]">person</span>
              <span>{booking.customer.name}</span>
            </span>

            <span>•</span>

            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">schedule</span>
              <span>
                {booking.scheduledDate}, {booking.scheduledTimeWindow}
              </span>
            </span>

            {booking.customer.distanceKm && (
              <>
                <span>•</span>
                <span>{booking.customer.distanceKm} km away</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Pricing & Actions */}
      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 border-t border-white/5 md:border-t-0 pt-3 md:pt-0">
        <div className="text-left md:text-right">
          <span className="text-xs text-on-surface-variant font-medium block">Estimated Value</span>
          <span className="text-xl font-bold text-on-surface">₹{booking.estimatedValue}</span>
        </div>

        <div className="flex items-center gap-2">
          {isPending && onAcceptClick && onDeclineClick ? (
            <>
              <button
                type="button"
                onClick={() => onDeclineClick(booking)}
                className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-surface-variant text-xs font-semibold text-on-surface transition-colors"
              >
                Decline
              </button>
              <button
                type="button"
                onClick={() => onAcceptClick(booking)}
                className="px-4 py-1.5 rounded-lg bg-primary-container text-on-primary-container hover:bg-primary font-bold text-xs transition-all shadow-md shadow-primary/20"
              >
                Accept
              </button>
            </>
          ) : (
            <Link
              href={`/provider/bookings/${booking.id}`}
              className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-variant text-xs font-semibold text-primary transition-colors border border-white/5 flex items-center gap-1"
            >
              <span>View Details</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </Link>
          )}
        </div>
      </div>
    </ProviderCard>
  );
}
