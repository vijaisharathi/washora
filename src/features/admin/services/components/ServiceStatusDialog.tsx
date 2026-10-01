"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Archive,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import {
  Service,
  ServiceStatus,
  ALLOWED_SERVICE_STATUS_TRANSITIONS,
} from "@/types/admin/serviceCatalog";
import { Button } from "@/components/ui/button";

interface ServiceStatusDialogProps {
  isOpen: boolean;
  service: Service | null;
  onClose: () => void;
  onConfirm: (
    serviceId: string,
    newStatus: ServiceStatus,
    reason?: string
  ) => Promise<Service>;
}

const STATUS_DETAILS: Record<
  ServiceStatus,
  {
    label: string;
    actionLabel: string;
    consequence: string;
    badgeClass: string;
    icon: React.ReactNode;
  }
> = {
  Active: {
    label: "Active",
    actionLabel: "Activate Service",
    consequence:
      "Enables service discovery and allows customers to select and book this service across apps.",
    badgeClass: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  },
  Inactive: {
    label: "Inactive",
    actionLabel: "Deactivate Service",
    consequence:
      "Temporarily hides this service from customer booking flows. Existing scheduled bookings remain valid.",
    badgeClass: "text-amber-500 bg-amber-500/10 border-amber-500/30",
    icon: <Clock className="w-4 h-4 text-amber-500" />,
  },
  Archived: {
    label: "Archived",
    actionLabel: "Archive Service",
    consequence:
      "Permanently deprecates and archives this service. Archived services cannot be re-activated or edited.",
    badgeClass: "text-rose-400 bg-rose-500/10 border-rose-500/30",
    icon: <Archive className="w-4 h-4 text-rose-400" />,
  },
};

export function ServiceStatusDialog({
  isOpen,
  service,
  onClose,
  onConfirm,
}: ServiceStatusDialogProps) {
  const [selectedTargetStatus, setSelectedTargetStatus] =
    useState<ServiceStatus | null>(null);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentStatus = service?.status;
  const allowedTransitions = currentStatus
    ? ALLOWED_SERVICE_STATUS_TRANSITIONS[currentStatus]
    : [];

  // Reset or initialize state when dialog opens
  useEffect(() => {
    if (isOpen && currentStatus) {
      const allowed = ALLOWED_SERVICE_STATUS_TRANSITIONS[currentStatus];
      setSelectedTargetStatus(allowed.length > 0 ? allowed[0] : null);
      setReason("");
      setError(null);
    }
  }, [isOpen, currentStatus]);

  if (!isOpen || !service) return null;

  const activeTarget = selectedTargetStatus || (allowedTransitions[0] ?? null);

  const handleConfirm = async () => {
    if (!activeTarget) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onConfirm(service.id, activeTarget, reason.trim() || undefined);
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to update service status";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isTerminalCurrent = currentStatus === "Archived";
  const isTargetArchived = activeTarget === "Archived";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="service-status-dialog-title"
    >
      <div className="bg-surface-container-low border border-surface-variant/70 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-surface-variant/40 bg-surface-container/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="service-status-dialog-title"
                className="text-base font-semibold text-on-surface leading-snug"
              >
                Update Service Status
              </h2>
              <p className="text-xs text-outline font-mono">
                {service.id} • {service.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-variant transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Current vs Target status overview */}
          <div className="p-3.5 rounded-xl bg-surface-container border border-surface-variant/50 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-outline font-medium uppercase tracking-wider">
                Current Status
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                  STATUS_DETAILS[currentStatus || "Active"].badgeClass
                }`}
              >
                {STATUS_DETAILS[currentStatus || "Active"].icon}
                {STATUS_DETAILS[currentStatus || "Active"].label}
              </span>
            </div>

            <ArrowRight className="w-4 h-4 text-outline shrink-0" />

            <div className="flex flex-col gap-1 text-right">
              <span className="text-[11px] text-outline font-medium uppercase tracking-wider">
                New Status
              </span>
              {activeTarget ? (
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    STATUS_DETAILS[activeTarget].badgeClass
                  }`}
                >
                  {STATUS_DETAILS[activeTarget].icon}
                  {STATUS_DETAILS[activeTarget].label}
                </span>
              ) : (
                <span className="text-xs text-outline italic">No transition</span>
              )}
            </div>
          </div>

          {/* Target status selector if transitions allowed */}
          {allowedTransitions.length > 0 && !isTerminalCurrent ? (
            <div className="space-y-2">
              <label className="text-xs font-medium text-on-surface block">
                Select Target Status
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {allowedTransitions.map((target) => {
                  const isSelected = activeTarget === target;
                  const details = STATUS_DETAILS[target];

                  return (
                    <button
                      key={target}
                      type="button"
                      onClick={() => setSelectedTargetStatus(target)}
                      className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 ring-1 ring-primary/40 shadow-sm"
                          : "border-surface-variant/60 bg-surface-container-high/40 hover:bg-surface-container-high hover:border-surface-variant"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-semibold text-on-surface">
                          {details.actionLabel}
                        </span>
                        {details.icon}
                      </div>
                      <span className="text-[11px] text-on-surface-variant line-clamp-2">
                        {details.consequence}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-surface-container border border-surface-variant text-xs text-on-surface-variant">
              This service is currently in the <strong>{currentStatus}</strong>{" "}
              state and cannot be modified further.
            </div>
          )}

          {/* Consequence alert */}
          {activeTarget && (
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
                isTargetArchived
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                  : "bg-surface-container border-surface-variant/60 text-on-surface-variant"
              }`}
            >
              <AlertTriangle
                className={`w-4 h-4 shrink-0 mt-0.5 ${
                  isTargetArchived ? "text-rose-400" : "text-amber-400"
                }`}
              />
              <div className="space-y-1">
                <span className="font-semibold block">
                  {isTargetArchived ? "Permanent Action Warning" : "Impact Notice"}
                </span>
                <p className="leading-relaxed">
                  {STATUS_DETAILS[activeTarget].consequence}
                </p>
                {isTargetArchived && (
                  <p className="text-[11px] opacity-80 pt-1">
                    Once archived, this service can never be reinstated.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Reason input */}
          {allowedTransitions.length > 0 && !isTerminalCurrent && (
            <div className="space-y-1.5">
              <label
                htmlFor="service-status-reason"
                className="text-xs font-medium text-on-surface flex items-center justify-between"
              >
                <span>Audit Reason / Notes (Optional)</span>
                <span className="text-[10px] text-outline">Internal Log</span>
              </label>
              <textarea
                id="service-status-reason"
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="E.g., Seasonal deprecation, vendor price overhaul, maintenance pause..."
                className="w-full bg-surface-container border border-surface-variant rounded-xl p-2.5 text-xs text-on-surface placeholder:text-outline/60 focus:outline-none focus:border-primary transition-colors resize-none"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-surface-variant/40 bg-surface-container/30 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs h-9 px-4 rounded-xl border-surface-variant bg-surface-container text-on-surface hover:bg-surface-container-high"
          >
            Cancel
          </Button>

          {allowedTransitions.length > 0 && !isTerminalCurrent && (
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting || !activeTarget}
              className={`text-xs h-9 px-4 rounded-xl font-medium flex items-center gap-1.5 text-white ${
                isTargetArchived
                  ? "bg-rose-600 hover:bg-rose-700"
                  : "bg-primary hover:bg-primary/90"
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  {activeTarget ? STATUS_DETAILS[activeTarget].actionLabel : "Confirm"}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
