"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  RefreshCw,
  Search,
  Star,
  MapPin,
  AlertCircle,
  Loader2,
  Check,
  ArrowDown,
  UserCheck,
  Bike,
} from "lucide-react";
import {
  OperationalBookingView,
  CandidateProvider,
  CandidateDeliveryPartner,
  WorkloadLevel,
} from "@/types/admin/operations";
import { adminOperationsService } from "@/services/admin/adminOperationsService";

interface ReassignModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingView: OperationalBookingView | null;
  targetType: "provider" | "delivery_partner";
  onConfirm: (bookingId: string, newAssigneeId: string, notes?: string) => Promise<void>;
}

export function ReassignModal({
  isOpen,
  onClose,
  bookingView,
  targetType,
  onConfirm,
}: ReassignModalProps) {
  const [providerCandidates, setProviderCandidates] = useState<CandidateProvider[]>([]);
  const [deliveryCandidates, setDeliveryCandidates] = useState<CandidateDeliveryPartner[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reasonPreset, setReasonPreset] = useState<string>("Workload rebalance");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && bookingView) {
      setIsLoading(true);
      setError(null);
      setSelectedId(null);
      setNotes("");
      setSearch("");

      if (targetType === "provider") {
        adminOperationsService
          .getEligibleProviders(bookingView.booking.id)
          .then((res) => {
            // Filter out current provider
            const eligible = res.filter((p) => p.id !== bookingView.assignment.providerId);
            setProviderCandidates(eligible);
            if (eligible.length > 0) setSelectedId(eligible[0].id);
          })
          .catch((err) => {
            setError(err instanceof Error ? err.message : "Failed to load eligible providers.");
          })
          .finally(() => setIsLoading(false));
      } else {
        adminOperationsService
          .getEligibleDeliveryPartners(bookingView.booking.id)
          .then((res) => {
            // Filter out current delivery partner
            const eligible = res.filter((d) => d.id !== bookingView.assignment.deliveryPartnerId);
            setDeliveryCandidates(eligible);
            if (eligible.length > 0) setSelectedId(eligible[0].id);
          })
          .catch((err) => {
            setError(err instanceof Error ? err.message : "Failed to load eligible valets.");
          })
          .finally(() => setIsLoading(false));
      }
    }
  }, [isOpen, bookingView, targetType]);

  if (!isOpen || !bookingView) return null;

  const currentProvider = bookingView.provider;
  const currentDeliveryPartner = bookingView.deliveryPartner;

  const filteredProviders = providerCandidates.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.areasServed.some((a) => a.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredDelivery = deliveryCandidates.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.vehicleType.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;

    try {
      setIsSubmitting(true);
      setError(null);
      const combinedNotes = `${reasonPreset}: ${notes.trim()}`.replace(/: $/, "");
      await onConfirm(bookingView.booking.id, selectedId, combinedNotes);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reassign.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWorkloadBadge = (level?: WorkloadLevel, count?: number) => {
    if (!level) return null;
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
        {level} {count !== undefined ? `(${count})` : "Load"}
      </span>
    );
  };

  const isProvider = targetType === "provider";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 bg-surface-container-low/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-on-surface">
                Reassign {isProvider ? "Service Provider" : "Delivery Valet"}
              </h2>
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

        {/* Current Assignee Card */}
        <div className="px-6 py-3 bg-surface-container-high/30 border-b border-outline-variant/20">
          <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold block mb-1.5">
            Current Assignee
          </span>
          <div className="p-2.5 rounded-xl bg-surface-container border border-outline-variant/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                {isProvider ? <UserCheck className="w-4 h-4" /> : <Bike className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface">
                  {isProvider
                    ? currentProvider?.fullName || "Unknown Provider"
                    : currentDeliveryPartner?.fullName || "Unknown Valet"}
                </p>
                <p className="text-[11px] text-on-surface-variant">
                  {isProvider
                    ? `Rating: ${currentProvider?.rating.toFixed(1)} ★`
                    : `${currentDeliveryPartner?.vehicleType} • ${currentDeliveryPartner?.vehicleNumber}`}
                </p>
              </div>
            </div>
            <div>
              {isProvider && currentProvider && (
                getWorkloadBadge(bookingView.providerWorkload)
              )}
              {!isProvider && currentDeliveryPartner && (
                getWorkloadBadge(bookingView.deliveryWorkload)
              )}
            </div>
          </div>

          <div className="flex items-center justify-center my-1.5 text-on-surface-variant">
            <ArrowDown className="w-4 h-4 text-primary animate-bounce" />
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
              placeholder={`Search alternative ${isProvider ? "providers" : "valets"}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant/30 rounded-xl pl-9 pr-4 py-2 text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary"
            />
          </div>

          {/* New Assignee Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-on-surface block">
              Select Replacement {isProvider ? "Provider" : "Delivery Valet"}
            </label>

            {isLoading ? (
              <div className="py-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                <p className="text-xs text-on-surface-variant">Loading alternative candidates...</p>
              </div>
            ) : (isProvider ? filteredProviders : filteredDelivery).length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-surface-container border border-outline-variant/20">
                <AlertCircle className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <p className="text-xs font-semibold text-on-surface">
                  {isProvider
                    ? "No eligible providers are available for this booking."
                    : "No eligible delivery partners are available for this booking."}
                </p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">
                  No other active candidates currently meet the criteria in {bookingView.booking.address.city}.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {isProvider
                  ? filteredProviders.map((candidate) => {
                      const isSelected = candidate.id === selectedId;
                      return (
                        <div
                          key={candidate.id}
                          onClick={() => setSelectedId(candidate.id)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? "bg-primary/5 border-primary shadow-xs ring-1 ring-primary/20"
                              : "bg-surface-container-low border-outline-variant/30 hover:border-outline-variant/60"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? "bg-primary border-primary text-on-primary"
                                  : "border-outline-variant bg-surface-container"
                              }`}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-on-surface truncate">
                                {candidate.name}
                              </p>
                              <p className="text-[11px] text-on-surface-variant flex items-center gap-1 truncate">
                                <MapPin className="w-3 h-3 shrink-0" />
                                {candidate.areasServed.slice(0, 2).join(", ")}
                              </p>
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            {getWorkloadBadge(candidate.workloadLevel, candidate.activeBookingsCount)}
                          </div>
                        </div>
                      );
                    })
                  : filteredDelivery.map((candidate) => {
                      const isSelected = candidate.id === selectedId;
                      return (
                        <div
                          key={candidate.id}
                          onClick={() => setSelectedId(candidate.id)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? "bg-sky-500/5 border-sky-500 shadow-xs ring-1 ring-sky-500/20"
                              : "bg-surface-container-low border-outline-variant/30 hover:border-outline-variant/60"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? "bg-sky-500 border-sky-500 text-white"
                                  : "border-outline-variant bg-surface-container"
                              }`}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-on-surface truncate">
                                {candidate.name}
                              </p>
                              <p className="text-[11px] text-on-surface-variant">
                                {candidate.vehicleType} • {candidate.vehicleNumber}
                              </p>
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            {getWorkloadBadge(candidate.workloadLevel, candidate.activeDeliveriesCount)}
                          </div>
                        </div>
                      );
                    })}
              </div>
            )}
          </div>

          {/* Reason Preset & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-on-surface block mb-1">
                Reason for Reassignment
              </label>
              <select
                value={reasonPreset}
                onChange={(e) => setReasonPreset(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="Workload rebalance">Workload rebalance</option>
                <option value="Resource unavailable">Resource unavailable</option>
                <option value="Customer request">Customer request</option>
                <option value="Operational delay">Operational delay</option>
                <option value="Geographical proximity">Geographical proximity</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-on-surface block mb-1">
                Notes / Context
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional audit details..."
                className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-3 py-2 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary"
              />
            </div>
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
              disabled={!selectedId || isSubmitting || isLoading}
              className="px-5 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary/90 text-xs font-semibold shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Reassigning...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  Confirm Reassignment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
