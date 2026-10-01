import React, { useState } from "react";
import { ProviderBookingItem } from "@/types/provider/bookings";

interface CancelBookingModalProps {
  booking: ProviderBookingItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  isCancelling: boolean;
}

export function CancelBookingModal({
  booking,
  isOpen,
  onClose,
  onConfirm,
  isCancelling,
}: CancelBookingModalProps) {
  const [reason, setReason] = useState("");

  if (!isOpen || !booking) return null;

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    await onConfirm(reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container rounded-2xl border border-white/10 p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-2xl bg-error-container/20 text-error flex items-center justify-center mb-4 border border-error/30">
          <span className="material-symbols-outlined text-2xl">warning</span>
        </div>

        <h3 className="text-lg font-bold text-on-surface mb-1">Cancel Confirmed Booking?</h3>
        <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
          Cancelling confirmed booking <span className="font-semibold text-primary">{booking.bookingNumber}</span> will alert customer support and the assigned valet partner.
        </p>

        <form onSubmit={handleCancelSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">Cancellation Reason</label>
            <textarea
              rows={3}
              placeholder="e.g. Machinery breakdown, emergency studio closure..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="w-full bg-surface-container-low text-on-surface text-xs rounded-xl p-3 border border-white/10 focus:border-primary outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isCancelling}
              className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-variant text-xs font-semibold text-on-surface transition-colors border border-white/5"
            >
              Keep Booking
            </button>
            <button
              type="submit"
              disabled={isCancelling}
              className="px-5 py-2 rounded-xl bg-error text-on-error hover:bg-error/90 text-xs font-bold transition-all shadow-md shadow-error/20 flex items-center gap-1.5"
            >
              {isCancelling ? <span>Cancelling...</span> : <span>Confirm Cancellation</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
