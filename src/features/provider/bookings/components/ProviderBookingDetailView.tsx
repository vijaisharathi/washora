"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useProviderBookingItem,
  useProviderBookings,
} from "@/features/provider/bookings/hooks/useProviderBookings";
import { ProviderLoadingState } from "@/features/provider/components/ProviderLoadingState";
import { ProviderErrorState } from "@/features/provider/components/ProviderErrorState";
import { ProviderCard } from "@/features/provider/components/ProviderCard";
import { AcceptBookingModal } from "./AcceptBookingModal";
import { DeclineBookingModal } from "./DeclineBookingModal";
import { CancelBookingModal } from "./CancelBookingModal";

interface ProviderBookingDetailViewProps {
  bookingId: string;
}

export function ProviderBookingDetailView({ bookingId }: ProviderBookingDetailViewProps) {
  const router = useRouter();
  const { data: booking, isLoading, isError } = useProviderBookingItem(bookingId);
  const { acceptBooking, isAccepting, declineBooking, isDeclining, cancelBooking, isCancelling } =
    useProviderBookings();

  const [isAcceptOpen, setIsAcceptOpen] = useState(false);
  const [isDeclineOpen, setIsDeclineOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  if (isLoading) {
    return <ProviderLoadingState message="Loading Booking Request Details..." />;
  }

  if (isError || !booking) {
    return <ProviderErrorState title="Booking not found or access denied" />;
  }

  const isPending = booking.status === "PENDING";
  const isConfirmed = booking.status === "CONFIRMED";

  const handleAccept = async () => {
    await acceptBooking({ bookingId: booking.id });
    setIsAcceptOpen(false);
  };

  const handleDecline = async (reason: string, notes?: string) => {
    await declineBooking({ bookingId: booking.id, reason, notes });
    setIsDeclineOpen(false);
  };

  const handleCancel = async (reason: string) => {
    await cancelBooking({ bookingId: booking.id, reason });
    setIsCancelOpen(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Back & Action Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/provider/bookings"
          className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-on-surface font-semibold transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Bookings</span>
        </Link>

        <span className="font-mono text-xs font-bold text-primary">{booking.bookingNumber}</span>
      </div>

      {/* Main Booking Summary Card */}
      <ProviderCard
        variant="container"
        className="p-6 md:p-8 space-y-6 border-l-4 border-l-primary relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary border border-white/10 shrink-0">
              <span className="material-symbols-outlined text-2xl">cleaning_services</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-on-surface">{booking.serviceName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-on-surface-variant">
                  {booking.itemsCount} {booking.itemsCount === 1 ? "unit" : "units"} • {booking.careType}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                  {booking.status}
                </span>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-on-surface-variant font-medium block">Estimated Value</span>
            <span className="text-2xl font-bold text-emerald-400">₹{booking.estimatedValue}</span>
          </div>
        </div>

        {/* Customer & Logistics Snapshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
          {/* Customer */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
              Customer Information
            </span>
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-white/5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface font-bold text-xs">
                {booking.customer.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="text-xs font-bold text-on-surface">{booking.customer.name}</h4>
                <p className="text-[11px] text-on-surface-variant font-mono">{booking.customer.phone}</p>
              </div>
            </div>
          </div>

          {/* Pickup Window */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
              Scheduled Valet Window
            </span>
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-white/5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-on-surface">{booking.scheduledDate}</h4>
                <p className="text-[11px] text-on-surface-variant">{booking.scheduledTimeWindow}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pickup Location */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
            Pickup &amp; Fulfillment Address
          </span>
          <div className="p-3.5 rounded-xl bg-surface-container-low border border-white/5 flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">location_on</span>
            <div>
              <p className="text-xs font-medium text-on-surface">{booking.customer.pickupAddress}</p>
              {booking.customer.distanceKm && (
                <span className="text-[11px] text-on-surface-variant">
                  {booking.customer.distanceKm} km from Garment Studio
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Special Instructions */}
        {booking.specialInstructions && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
              Customer Special Care Instructions
            </span>
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-white/5 text-xs text-on-surface leading-relaxed italic">
              &quot;{booking.specialInstructions}&quot;
            </div>
          </div>
        )}

        {/* Rejection / Cancellation Audit if applicable */}
        {booking.declineReason && (
          <div className="p-3.5 rounded-xl bg-error-container/20 border border-error/30 text-xs text-error space-y-1">
            <span className="font-bold block">Decline Reason:</span>
            <span>{booking.declineReason}</span>
          </div>
        )}

        {booking.cancellationReason && (
          <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-400 space-y-1">
            <span className="font-bold block">Cancellation Reason:</span>
            <span>{booking.cancellationReason}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-4 border-t border-white/5 flex flex-wrap items-center justify-end gap-3">
          {isPending && (
            <>
              <button
                type="button"
                onClick={() => setIsDeclineOpen(true)}
                className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-surface-variant text-xs font-semibold text-on-surface transition-colors"
              >
                Decline Request
              </button>
              <button
                type="button"
                onClick={() => setIsAcceptOpen(true)}
                className="px-6 py-2.5 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary text-xs font-bold transition-all shadow-md shadow-primary/20 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Accept Booking</span>
              </button>
            </>
          )}

          {isConfirmed && (
            <button
              type="button"
              onClick={() => setIsCancelOpen(true)}
              className="px-4 py-2 rounded-xl bg-error-container/20 hover:bg-error-container/40 text-error text-xs font-semibold transition-colors border border-error/30"
            >
              Cancel Booking
            </button>
          )}
        </div>
      </ProviderCard>

      {/* Accept Modal */}
      <AcceptBookingModal
        booking={booking}
        isOpen={isAcceptOpen}
        onClose={() => setIsAcceptOpen(false)}
        onConfirm={handleAccept}
        isAccepting={isAccepting}
      />

      {/* Decline Modal */}
      <DeclineBookingModal
        booking={booking}
        isOpen={isDeclineOpen}
        onClose={() => setIsDeclineOpen(false)}
        onConfirm={handleDecline}
        isDeclining={isDeclining}
      />

      {/* Cancel Modal */}
      <CancelBookingModal
        booking={booking}
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        onConfirm={handleCancel}
        isCancelling={isCancelling}
      />
    </div>
  );
}
