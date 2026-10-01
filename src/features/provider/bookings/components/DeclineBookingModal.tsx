import React, { useState } from "react";
import { ProviderBookingItem } from "@/types/provider/bookings";

interface DeclineBookingModalProps {
  booking: ProviderBookingItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, notes?: string) => Promise<void>;
  isDeclining: boolean;
}

export function DeclineBookingModal({
  booking,
  isOpen,
  onClose,
  onConfirm,
  isDeclining,
}: DeclineBookingModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>("fully_booked");
  const [customNotes, setCustomNotes] = useState<string>("");

  if (!isOpen || !booking) return null;

  const REASONS = [
    { id: "fully_booked", label: "Fully booked for this time window" },
    { id: "time_mismatch", label: "Unable to meet turnaround SLA" },
    { id: "location_far", label: "Pickup location beyond service radius" },
    { id: "other", label: "Other / Maintenance shutdown" },
  ];

  const handleDeclineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const reasonLabel = REASONS.find((r) => r.id === selectedReason)?.label || "Declined by Provider";
    await onConfirm(reasonLabel, selectedReason === "other" ? customNotes : undefined);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container rounded-2xl border border-white/10 p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-2xl bg-error-container/20 text-error flex items-center justify-center mb-4 border border-error/30">
          <span className="material-symbols-outlined text-2xl">cancel</span>
        </div>

        <h3 className="text-lg font-bold text-on-surface mb-1">Decline Booking Request</h3>
        <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
          Select a reason for declining <span className="font-semibold text-primary">{booking.bookingNumber}</span>. This notifies the dispatch routing system to reassign the request.
        </p>

        <form onSubmit={handleDeclineSubmit} className="space-y-4">
          <div className="space-y-2">
            {REASONS.map((r) => (
              <label
                key={r.id}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-container-low border border-white/5 hover:border-white/15 transition-colors cursor-pointer text-xs"
              >
                <input
                  type="radio"
                  name="decline_reason"
                  value={r.id}
                  checked={selectedReason === r.id}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-4 h-4 text-primary bg-surface-container border-white/20 focus:ring-primary"
                />
                <span className="font-medium text-on-surface">{r.label}</span>
              </label>
            ))}
          </div>

          {selectedReason === "other" && (
            <textarea
              rows={2}
              placeholder="Please specify reasons for rejection..."
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              className="w-full bg-surface-container-low text-on-surface text-xs rounded-xl p-3 border border-white/10 focus:border-primary outline-none resize-none"
            />
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeclining}
              className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-variant text-xs font-semibold text-on-surface transition-colors border border-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDeclining}
              className="px-5 py-2 rounded-xl bg-error text-on-error hover:bg-error/90 text-xs font-bold transition-all shadow-md shadow-error/20 flex items-center gap-1.5"
            >
              {isDeclining ? <span>Declining...</span> : <span>Confirm Decline</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
