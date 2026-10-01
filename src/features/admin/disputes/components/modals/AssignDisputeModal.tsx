import React, { useState, useEffect } from "react";
import {
  X,
  UserCheck,
  Building2,
  AlertTriangle,
} from "lucide-react";
import { Dispute, AssigneeOption } from "@/types/admin/support";
import { adminSupportService } from "@/services/admin/adminSupportService";

interface AssignDisputeModalProps {
  isOpen: boolean;
  dispute: Dispute | null;
  onClose: () => void;
  onAssign: (disputeId: string, assigneeId: string) => Promise<void>;
}

export function AssignDisputeModal({
  isOpen,
  dispute,
  onClose,
  onAssign,
}: AssignDisputeModalProps) {
  const [assignees, setAssignees] = useState<AssigneeOption[]>([]);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && dispute) {
      setSelectedAssigneeId(dispute.assignedTo || "");
      setError(null);
      setLoading(true);
      adminSupportService
        .getEligibleAssignees(dispute.organizationId)
        .then((res) => {
          setAssignees(res);
          if (!dispute.assignedTo && res.length > 0) {
            setSelectedAssigneeId(res[0].id);
          }
        })
        .catch((err) => setError(err.message || "Failed to load eligible reviewers"))
        .finally(() => setLoading(false));
    }
  }, [isOpen, dispute]);

  if (!isOpen || !dispute) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssigneeId) {
      setError("Please select a reviewer to assign.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onAssign(dispute.id, selectedAssigneeId);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to assign dispute");
    } finally {
      setSubmitting(false);
    }
  };

  const renderWorkloadBadge = (level: "Low" | "Medium" | "High", count: number) => {
    switch (level) {
      case "Low":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            Low ({count} active)
          </span>
        );
      case "Medium":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            Medium ({count} active)
          </span>
        );
      case "High":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
            High ({count} active)
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-5 border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-on-surface">
                {dispute.assignedTo ? "Reassign Reviewer" : "Assign Dispute Case"}
              </h2>
              <p className="text-xs text-on-surface-variant font-mono">
                {dispute.disputeNumber} ({dispute.id})
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <span className="text-xs text-on-surface-variant">Subject:</span>
            <p className="text-xs font-semibold text-on-surface mt-0.5">
              {dispute.subject}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-2">
              Select Reviewer (Admin / Operations)
            </label>

            {loading ? (
              <div className="space-y-2 py-4">
                <div className="h-10 rounded-lg bg-surface-container/50 animate-pulse" />
                <div className="h-10 rounded-lg bg-surface-container/50 animate-pulse" />
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {assignees.map((agent) => {
                  const isSelected = selectedAssigneeId === agent.id;
                  return (
                    <div
                      key={agent.id}
                      onClick={() => setSelectedAssigneeId(agent.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-primary/10 border-primary text-on-surface font-semibold shadow-sm"
                          : "bg-surface-container/40 border-outline-variant/30 text-on-surface-variant hover:bg-surface-container/70"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Building2 className="w-4 h-4 text-primary shrink-0" />
                        <div>
                          <div className="font-semibold text-on-surface">
                            {agent.name}
                          </div>
                          <div className="text-[10px] text-on-surface-variant">
                            {agent.role} • {agent.primaryWorkArea}
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0">
                        {renderWorkloadBadge(agent.workloadLevel, agent.activeTicketCount)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-surface-container text-on-surface-variant text-xs font-medium hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || loading || !selectedAssigneeId}
              className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              {submitting ? "Saving..." : "Confirm Assignment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
