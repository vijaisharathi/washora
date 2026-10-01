import React from "react";
import { ProviderBookingItem } from "@/types/provider/bookings";

interface AcceptBookingModalProps {
  booking: ProviderBookingItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isAccepting: boolean;
}

export function AcceptBookingModal({
  booking,
  isOpen,
  onClose,
  onConfirm,
  isAccepting,
}: AcceptBookingModalProps) {
  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container rounded-2xl border border-white/10 p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-2xl bg-emerald-950/40 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/30">
          <span className="material-symbols-outlined text-2xl">check_circle</span>
        </div>

        <h3 className="text-lg font-bold text-on-surface mb-1">Accept Booking Request?</h3>
        <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
          Confirming <span className="font-semibold text-primary">{booking.bookingNumber}</span> for{" "}
          <span className="font-semibold text-on-surface">{booking.customer.name}</span> will schedule
          valet collection for <span className="font-semibold text-on-surface">{booking.scheduledDate} ({booking.scheduledTimeWindow})</span>.
        </p>

        <div className="p-3 rounded-xl bg-surface-container-low border border-white/5 mb-5 text-xs">
          <div className="flex justify-between items-center text-on-surface-variant mb-1">
            <span>Service</span>
            <span className="font-medium text-on-surface">{booking.serviceName}</span>
          </div>
          <div className="flex justify-between items-center text-on-surface-variant">
            <span>Estimated Value</span>
            <span className="font-bold text-primary">₹{booking.estimatedValue}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isAccepting}
            className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-variant text-xs font-semibold text-on-surface transition-colors border border-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isAccepting}
            className="px-5 py-2 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary text-xs font-bold transition-all shadow-md shadow-primary/20 flex items-center gap-1.5"
          >
            {isAccepting ? <span>Confirming...</span> : <span>Confirm Acceptance</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
