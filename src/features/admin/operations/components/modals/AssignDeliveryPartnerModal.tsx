"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Bike,
  Search,
  MapPin,
  AlertCircle,
  Loader2,
  Check,
  ShieldCheck,
  Truck,
} from "lucide-react";
import {
  OperationalBookingView,
  CandidateDeliveryPartner,
  WorkloadLevel,
} from "@/types/admin/operations";
import { adminOperationsService } from "@/services/admin/adminOperationsService";

interface AssignDeliveryPartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingView: OperationalBookingView | null;
  onConfirm: (bookingId: string, partnerId: string, notes?: string) => Promise<void>;
}

export function AssignDeliveryPartnerModal({
  isOpen,
  onClose,
  bookingView,
  onConfirm,
}: AssignDeliveryPartnerModalProps) {
  const [candidates, setCandidates] = useState<CandidateDeliveryPartner[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && bookingView) {
      setIsLoading(true);
      setError(null);
      setSelectedPartnerId(null);
      setNotes("");
      setSearch("");

      adminOperationsService
        .getEligibleDeliveryPartners(bookingView.booking.id)
        .then((res) => {
          setCandidates(res);
          if (res.length > 0) {
            setSelectedPartnerId(res[0].id);
          }
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Failed to load eligible delivery partners.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, bookingView]);

  if (!isOpen || !bookingView) return null;

  const filteredCandidates = candidates.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.vehicleType.toLowerCase().includes(search.toLowerCase()) ||
    c.vehicleNumber.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartnerId) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await onConfirm(bookingView.booking.id, selectedPartnerId, notes.trim() || undefined);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign delivery partner.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWorkloadBadge = (level: WorkloadLevel, count: number) => {
    let colorClass = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    if (level === "Medium") {
      colorClass = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    } else if (level === "High") {
      colorClass = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
    }

    return (
      <span
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${colorClass}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {level} Load ({count})
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 bg-surface-container-low/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-on-surface">Assign Delivery Valet</h2>
              <p className="text-xs text-on-surface-variant font-mono">
                Booking #{bookingView.booking.id} • Laundry / Valet Dispatch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Booking Context Banner */}
        <div className="px-6 py-3 bg-surface-container-high/40 border-b border-outline-variant/20 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div>
            <span className="text-on-surface-variant font-medium">Pickup/Delivery City: </span>
            <span className="font-semibold text-on-surface">
              {bookingView.booking.address.city} ({bookingView.booking.address.area})
            </span>
          </div>
          <div>
            <span className="text-on-surface-variant font-medium">Slot: </span>
            <span className="font-semibold text-on-surface">
              {new Date(bookingView.booking.scheduledAt).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Search candidates */}
          <div className="relative">
            <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search valets by name, vehicle type, or plate..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant/30 rounded-xl pl-9 pr-4 py-2 text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary"
            />
          </div>

          {/* Candidates List */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-on-surface block">
              Eligible Valet Partners ({candidates.length} in {bookingView.booking.address.city})
            </label>

            {isLoading ? (
              <div className="py-12 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                <p className="text-xs text-on-surface-variant">Checking active valet partners and capacity...</p>
              </div>
            ) : filteredCandidates.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-surface-container border border-outline-variant/20">
                <AlertCircle className="w-6 h-6 text-amber-500 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-on-surface">No eligible delivery partners are available for this booking.</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">
                  No active verified delivery partners available in {bookingView.booking.address.city}.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {filteredCandidates.map((candidate) => {
                  const isSelected = candidate.id === selectedPartnerId;
                  const isAreaMatch = candidate.serviceAreas.some(
                    (a) => a.toLowerCase() === bookingView.booking.address.area.toLowerCase()
                  );

                  return (
                    <div
                      key={candidate.id}
                      onClick={() => setSelectedPartnerId(candidate.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-sky-500/5 border-sky-500 shadow-xs ring-1 ring-sky-500/20"
                          : "bg-surface-container-low border-outline-variant/30 hover:border-outline-variant/60"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? "bg-sky-500 border-sky-500 text-white"
                              : "border-outline-variant bg-surface-container"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-on-surface truncate">
                              {candidate.name}
                            </span>
                            <span className="text-[10px] font-mono text-on-surface-variant">
                              ({candidate.id})
                            </span>
                            <span className="px-1.5 py-0.2 rounded bg-surface-container-high text-on-surface-variant text-[10px] font-medium flex items-center gap-1">
                              <Truck className="w-3 h-3" />
                              {candidate.vehicleType}
                            </span>
                            {isAreaMatch && (
                              <span className="px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-600 text-[9px] font-bold">
                                Area Match
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-on-surface-variant mt-0.5">
                            <span className="font-mono text-[10px] text-on-surface-variant/80">
                              {candidate.vehicleNumber}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {candidate.city} ({candidate.serviceAreas.slice(0, 2).join(", ")})
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        {getWorkloadBadge(candidate.workloadLevel, candidate.activeDeliveriesCount)}
                        <span className="text-[10px] text-on-surface-variant block mt-1">
                          {candidate.deliveryPartner.lastActiveAt
                            ? `Active ${new Date(candidate.deliveryPartner.lastActiveAt).toLocaleDateString()}`
                            : "Active"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Valet Confirmation Summary */}
          {selectedPartnerId && (
            (() => {
              const sel = candidates.find((c) => c.id === selectedPartnerId);
              if (!sel) return null;
              return (
                <div className="p-3.5 rounded-xl bg-surface-container-high/40 border border-sky-500/20 space-y-2 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 block">
                    Valet Assignment Confirmation Summary
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div>
                      <span className="text-[10px] text-on-surface-variant block">Booking:</span>
                      <strong className="text-on-surface font-mono">{bookingView.booking.bookingNumber || bookingView.booking.id}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-on-surface-variant block">Service:</span>
                      <strong className="text-on-surface">{bookingView.booking.serviceName}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-on-surface-variant block">Scheduled:</span>
                      <strong className="text-on-surface">{new Date(bookingView.booking.scheduledAt).toLocaleDateString()}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-on-surface-variant block">Customer City / Area:</span>
                      <strong className="text-on-surface">{bookingView.booking.address.city} ({bookingView.booking.address.area})</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-on-surface-variant block">Selected Valet:</span>
                      <strong className="text-on-surface">{sel.name}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-on-surface-variant block">Vehicle & Plate:</span>
                      <strong className="text-on-surface">{sel.vehicleType} ({sel.vehicleNumber})</strong>
                    </div>
                  </div>
                </div>
              );
            })()
          )}

          {/* Delivery Instructions */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface block">
              Valet Dispatch Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Ring doorbell twice. Linen bag will be outside door."
              className="w-full bg-surface-container border border-outline-variant/30 rounded-xl p-3 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-outline-variant/40 hover:bg-surface-container text-xs font-semibold text-on-surface transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedPartnerId || isSubmitting || isLoading}
              className="px-5 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700 text-xs font-semibold shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Assigning Valet...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Confirm Assignment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
