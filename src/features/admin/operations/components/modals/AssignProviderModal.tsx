"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  UserCheck,
  Search,
  Star,
  MapPin,
  AlertCircle,
  Loader2,
  Check,
  ShieldCheck,
} from "lucide-react";
import { OperationalBookingView, CandidateProvider, WorkloadLevel } from "@/types/admin/operations";
import { adminOperationsService } from "@/services/admin/adminOperationsService";

interface AssignProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingView: OperationalBookingView | null;
  onConfirm: (bookingId: string, providerId: string, notes?: string) => Promise<void>;
}

export function AssignProviderModal({
  isOpen,
  onClose,
  bookingView,
  onConfirm,
}: AssignProviderModalProps) {
  const [candidates, setCandidates] = useState<CandidateProvider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && bookingView) {
      setIsLoading(true);
      setError(null);
      setSelectedProviderId(null);
      setNotes("");
      setSearch("");

      adminOperationsService
        .getEligibleProviders(bookingView.booking.id)
        .then((res) => {
          setCandidates(res);
          // Pre-select the best candidate if available
          if (res.length > 0) {
            setSelectedProviderId(res[0].id);
          }
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Failed to load eligible providers.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, bookingView]);

  if (!isOpen || !bookingView) return null;

  const filteredCandidates = candidates.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.areasServed.some((a) => a.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedCandidate = candidates.find((c) => c.id === selectedProviderId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProviderId) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await onConfirm(bookingView.booking.id, selectedProviderId, notes.trim() || undefined);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign provider.");
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
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-on-surface">Assign Service Provider</h2>
              <p className="text-xs text-on-surface-variant font-mono">
                Booking #{bookingView.booking.id} • {bookingView.booking.serviceName}
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
            <span className="text-on-surface-variant font-medium">Customer Area: </span>
            <span className="font-semibold text-on-surface">
              {bookingView.booking.address.area}, {bookingView.booking.address.city}
            </span>
          </div>
          <div>
            <span className="text-on-surface-variant font-medium">Schedule: </span>
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
              placeholder="Search eligible providers by name or area..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant/30 rounded-xl pl-9 pr-4 py-2 text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary"
            />
          </div>

          {/* Candidates List */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-on-surface block">
              Eligible Providers ({candidates.length} in {bookingView.booking.address.city})
            </label>

            {isLoading ? (
              <div className="py-12 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                <p className="text-xs text-on-surface-variant">Checking provider eligibility and live workload...</p>
              </div>
            ) : filteredCandidates.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-surface-container border border-outline-variant/20">
                <AlertCircle className="w-6 h-6 text-amber-500 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-on-surface">No eligible providers are available for this booking.</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">
                  No active verified providers support {bookingView.booking.serviceCategory} in {bookingView.booking.address.city}.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {filteredCandidates.map((candidate) => {
                  const isSelected = candidate.id === selectedProviderId;
                  const isAreaMatch = candidate.areasServed.some(
                    (a) => a.toLowerCase() === bookingView.booking.address.area.toLowerCase()
                  );

                  return (
                    <div
                      key={candidate.id}
                      onClick={() => setSelectedProviderId(candidate.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-primary/5 border-primary shadow-xs ring-1 ring-primary/20"
                          : "bg-surface-container-low border-outline-variant/30 hover:border-outline-variant/60"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? "bg-primary border-primary text-on-primary"
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
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-500 font-bold">
                              <Star className="w-3 h-3 fill-amber-500" />
                              {candidate.rating.toFixed(1)}
                            </span>
                            {isAreaMatch && (
                              <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary text-[9px] font-bold">
                                Area Match
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-on-surface-variant mt-0.5 space-y-0.5">
                            <p className="truncate">
                              Business: <strong>{candidate.provider.businessName}</strong> • {candidate.provider.totalBookings} bookings
                            </p>
                            <p className="flex items-center gap-1 truncate text-[10px]">
                              <MapPin className="w-3 h-3 shrink-0" />
                              {candidate.city} • {candidate.areasServed.slice(0, 3).join(", ")}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        {getWorkloadBadge(candidate.workloadLevel, candidate.activeBookingsCount)}
                        <span className="text-[10px] text-on-surface-variant block mt-1">
                          {candidate.provider.lastActiveAt ? `Active ${new Date(candidate.provider.lastActiveAt).toLocaleDateString()}` : "Active"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Provider Confirmation Summary */}
          {selectedCandidate && (
            <div className="p-3.5 rounded-xl bg-surface-container-high/40 border border-primary/20 space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                Assignment Confirmation Summary
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
                  <span className="text-[10px] text-on-surface-variant block">Selected Provider:</span>
                  <strong className="text-on-surface">{selectedCandidate.name}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant block">City & Rating:</span>
                  <strong className="text-on-surface">{selectedCandidate.city} (★ {selectedCandidate.rating.toFixed(1)})</strong>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant block">Current Workload:</span>
                  <strong className="text-on-surface">{selectedCandidate.workloadLevel} Load</strong>
                </div>
              </div>
            </div>
          )}

          {/* Assignment Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface block">
              Operational Notes / Instructions (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Customer requested arrival 10 minutes early. Gate code #4021."
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
              disabled={!selectedProviderId || isSubmitting || isLoading}
              className="px-5 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary/90 text-xs font-semibold shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Assigning...
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
