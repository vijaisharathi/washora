import React, { useState } from "react";
import {
  X,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { SupportTicket, SupportStatus } from "@/types/admin/support";

interface ChangeTicketStatusModalProps {
  isOpen: boolean;
  ticket: SupportTicket | null;
  onClose: () => void;
  onSelectStatus: (newStatus: SupportStatus) => void;
}

export function ChangeTicketStatusModal({
  isOpen,
  ticket,
  onClose,
  onSelectStatus,
}: ChangeTicketStatusModalProps) {
  if (!isOpen || !ticket) return null;

  // Determine allowed next statuses based on canonical rules:
  // Open → In Progress, Closed
  // In Progress → Waiting for Response, Resolved, Closed
  // Waiting for Response → In Progress, Resolved, Closed
  // Resolved → Closed
  // Closed → None
  const getAvailableStatuses = (): SupportStatus[] => {
    switch (ticket.status) {
      case "Open":
        return ["In Progress", "Closed"];
      case "In Progress":
        return ["Waiting for Response", "Resolved", "Closed"];
      case "Waiting for Response":
        return ["In Progress", "Resolved", "Closed"];
      case "Resolved":
        return ["Closed"];
      case "Closed":
      default:
        return [];
    }
  };

  const availableStatuses = getAvailableStatuses();

  const getStatusIcon = (status: SupportStatus) => {
    switch (status) {
      case "Open":
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case "In Progress":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "Waiting for Response":
        return <HelpCircle className="w-4 h-4 text-purple-500" />;
      case "Resolved":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "Closed":
        return <ShieldCheck className="w-4 h-4 text-on-surface-variant" />;
    }
  };

  const getStatusDescription = (status: SupportStatus) => {
    switch (status) {
      case "In Progress":
        return "Mark case as actively under investigation by operations.";
      case "Waiting for Response":
        return "Awaiting customer, partner, or merchant response to inquiry.";
      case "Resolved":
        return "Provide resolution notes and mark customer inquiry resolved.";
      case "Closed":
        return "Permanently close this case after full completion.";
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
              <h2 className="text-sm font-bold text-on-surface">Update Case Status</h2>
              <p className="text-xs text-on-surface-variant font-mono">
                Current Status: <span className="font-semibold text-primary">{ticket.status}</span>
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
            <span className="text-xs text-on-surface-variant">Ticket:</span>
            <p className="text-xs font-semibold text-on-surface mt-0.5">
              {ticket.subject}
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-on-surface mb-1">
              Select Valid Next Transition:
            </label>

            {availableStatuses.length === 0 ? (
              <p className="text-xs text-on-surface-variant italic p-4 text-center rounded-lg bg-surface-container/30">
                This ticket is in a terminal closed state and cannot be transitioned further.
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
                      {st === "In Progress"
                        ? "Start Working (In Progress)"
                        : st === "Waiting for Response"
                        ? "Wait for Response"
                        : st === "Resolved"
                        ? "Resolve Ticket"
                        : "Close Ticket"}
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
