import React from "react";
import {
  X,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileCheck,
  ShieldCheck,
} from "lucide-react";
import { Dispute, DisputeStatus } from "@/types/admin/support";

interface ChangeDisputeStatusModalProps {
  isOpen: boolean;
  dispute: Dispute | null;
  onClose: () => void;
  onSelectStatus: (newStatus: DisputeStatus) => void;
}

export function ChangeDisputeStatusModal({
  isOpen,
  dispute,
  onClose,
  onSelectStatus,
}: ChangeDisputeStatusModalProps) {
  if (!isOpen || !dispute) return null;

  const getAvailableStatuses = (): DisputeStatus[] => {
    switch (dispute.status) {
      case "Open":
        return ["Under Review", "Closed"];
      case "Under Review":
        return ["Awaiting Evidence", "Decision Made", "Closed"];
      case "Awaiting Evidence":
        return ["Under Review", "Decision Made", "Closed"];
      case "Decision Made":
        return ["Resolved", "Closed"];
      case "Resolved":
        return ["Closed"];
      case "Closed":
      default:
        return [];
    }
  };

  const availableStatuses = getAvailableStatuses();

  const getStatusIcon = (status: DisputeStatus) => {
    switch (status) {
      case "Open":
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case "Under Review":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "Awaiting Evidence":
        return <HelpCircle className="w-4 h-4 text-purple-500" />;
      case "Decision Made":
        return <FileCheck className="w-4 h-4 text-teal-500" />;
      case "Resolved":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "Closed":
        return <ShieldCheck className="w-4 h-4 text-on-surface-variant" />;
    }
  };

  const getStatusDescription = (status: DisputeStatus) => {
    switch (status) {
      case "Under Review":
        return "Initiate formal operational review and assign designated case investigator.";
      case "Awaiting Evidence":
        return "Pause review while awaiting receipts, photos, or GPS logs from parties.";
      case "Decision Made":
        return "Record outcome ruling and resolution rationale for both parties.";
      case "Resolved":
        return "Confirm that dispute outcome is finalized and fully communicated.";
      case "Closed":
        return "Permanently archive and close dispute case.";
      default:
        return "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-5 border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-on-surface">Update Dispute Stage</h2>
              <p className="text-xs text-on-surface-variant font-mono">
                Current: <span className="font-semibold text-primary">{dispute.status}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div>
            <span className="text-xs text-on-surface-variant">Dispute Claim:</span>
            <p className="text-xs font-semibold text-on-surface mt-0.5">
              {dispute.subject}
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-on-surface mb-1">
              Select Valid Next Transition:
            </label>

            {availableStatuses.length === 0 ? (
              <p className="text-xs text-on-surface-variant italic p-4 text-center rounded-lg bg-surface-container/30">
                This dispute case is in a terminal closed state and cannot be modified.
              </p>
            ) : (
              availableStatuses.map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => {
                    onClose();
                    onSelectStatus(st);
                  }}
                  className="w-full p-3 rounded-xl border border-outline-variant/30 bg-surface-container/40 hover:bg-surface-container-high transition-all text-left flex items-start gap-3 group"
                >
                  <div className="mt-0.5 shrink-0">{getStatusIcon(st)}</div>
                  <div>
                    <div className="text-xs font-semibold text-on-surface group-hover:text-primary transition-colors">
                      {st === "Under Review"
                        ? "Move to Under Review"
                        : st === "Awaiting Evidence"
                        ? "Request Evidence (Awaiting Evidence)"
                        : st === "Decision Made"
                        ? "Record Ruling (Decision Made)"
                        : st === "Resolved"
                        ? "Mark Dispute Resolved"
                        : "Close Dispute"}
                    </div>
                    <div className="text-[11px] text-on-surface-variant mt-0.5">
                      {getStatusDescription(st)}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
